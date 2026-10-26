"""
main.py
-------
FastAPI entry point for the AICTE document compliance system (SIH2621).

Endpoints:
    POST /api/upload-and-verify               upload a PDF and run the full pipeline
    POST /api/query-aph-rule                  ask the APH rule knowledge base
    GET  /api/application/{application_code}  application, documents and audit trail
    GET  /health                              liveness check

Run:  uvicorn main:app --reload

NOTE: there is no authentication here. Put it behind your auth layer
(API key / OAuth / reverse proxy) before exposing it beyond local testing.
"""

from __future__ import annotations

import json
import logging
import os
import tempfile
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import (
    ApplicationStatus,
    AuditLog,
    InstitutionApplication,
    UploadedDocument,
    find_duplicate_documents,
    get_db,
    init_db,
    log_action,
)
from services.cross_checker import verify_consistency
from services.forensics import compute_sha256, inspect_pdf_metadata
from services.llm_rag_engine import APHRegulatoryRAG
from services.ocr_engine import extract_text_from_pdf, parse_document_fields
from services.risk_calculator import FLAG_THRESHOLD, compute_application_risk

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("aicte.api")

MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_MB", "20")) * 1024 * 1024
TEXT_PREVIEW_CHARS = 1000
APH_RULES_PATH = os.getenv("APH_RULES_PATH")  # optional JSON of verified APH rules

APPLICATION_CODE_PATTERN = r"^[A-Za-z0-9_-]{3,64}$"


# --------------------------------------------------------------------------- #
# App lifecycle
# --------------------------------------------------------------------------- #
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables and load the APH knowledge base."""
    init_db()
    rag = APHRegulatoryRAG()
    if APH_RULES_PATH:
        rag.load_from_json(APH_RULES_PATH, replace=True)
    app.state.rag = rag
    logger.info("Startup complete: database ready, %d APH rules loaded", len(rag))
    yield


app = FastAPI(
    title="AICTE Document Compliance API (SIH2621)",
    version="1.0.0",
    lifespan=lifespan,
)


# --------------------------------------------------------------------------- #
# Schemas
# --------------------------------------------------------------------------- #
class FlagOut(BaseModel):
    source: str                      # forensics | cross_check | duplicate | ocr
    code: str
    severity: str                    # HIGH | MEDIUM | LOW
    message: str
    field: Optional[str] = None
    declared: Any = None
    extracted: Any = None


class UploadVerifyResponse(BaseModel):
    application_code: str
    filename: str
    file_hash: str
    application_status: ApplicationStatus
    document_risk_score: float       # risk from this upload alone
    application_risk_score: float    # stored application score
    risk_level: str
    needs_review: bool
    flags: list[FlagOut]
    extracted_fields: dict[str, Any]


class AphQuery(BaseModel):
    query: str = Field(min_length=3, max_length=500)
    top_k: int = Field(3, ge=1, le=10)


class AphRuleMatchOut(BaseModel):
    rule_id: str
    title: str
    text: str
    category: str
    source: str
    score: float
    matched_keywords: list[str]


class AphAnswerOut(BaseModel):
    question: str
    answer: str
    matches: list[AphRuleMatchOut]
    disclaimer: str


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    filename: str
    file_hash: str
    extracted_text_preview: Optional[str] = None
    uploaded_at: Any


class AuditLogOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    timestamp: Any
    action: str
    actor: str
    details: Optional[str] = None


class ApplicationDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    application_code: str
    institution_name: str
    declared_faculty_count: Optional[int] = None
    declared_land_area_sqm: Optional[float] = None
    status: ApplicationStatus
    risk_score: float
    created_at: Any
    updated_at: Any
    documents: list[DocumentOut] = []
    audit_logs: list[AuditLogOut] = []


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def _flag(source: str, code: str, severity: str, message: str, **extra: Any) -> dict[str, Any]:
    return {"source": source, "code": code, "severity": severity, "message": message, **extra}


def _forensic_flags(meta: dict[str, Any]) -> list[dict[str, Any]]:
    """Translate inspect_pdf_metadata() output into severity-tagged flags."""
    flags: list[dict[str, Any]] = []

    error = meta.get("error") or ""
    if error.startswith("unreadable_pdf"):
        flags.append(_flag("forensics", "UNREADABLE_PDF", "HIGH", "PDF is corrupt or unreadable."))
    elif error:  # encrypted / decrypt failed
        flags.append(_flag("forensics", "ENCRYPTED_PDF", "MEDIUM",
                           "PDF is encrypted; content could not be inspected."))

    for software in meta.get("detected_software", []):
        flags.append(_flag("forensics", "EDITING_SOFTWARE", "MEDIUM",
                           f"Document metadata shows it was created or edited with {software}."))

    if any("stripped" in f for f in meta.get("flags", [])):
        flags.append(_flag("forensics", "METADATA_STRIPPED", "LOW",
                           "No document metadata present; it may have been removed."))
    return flags


def _run_pdf_pipeline(data: bytes) -> tuple[dict[str, Any], dict[str, Any]]:
    """
    The forensics/OCR helpers take file paths, so write the upload to a temporary
    file, run them, and delete it. The file itself is not persisted.
    """
    with tempfile.TemporaryDirectory() as tmp:
        path = Path(tmp) / "upload.pdf"
        path.write_bytes(data)
        meta = inspect_pdf_metadata(path)
        extraction = extract_text_from_pdf(path)
    return meta, extraction


# --------------------------------------------------------------------------- #
# Endpoints
# --------------------------------------------------------------------------- #
@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


# Plain `def` so FastAPI runs this in its thread pool: PDF parsing is blocking work.
@app.post("/api/upload-and-verify", response_model=UploadVerifyResponse)
def upload_and_verify(
    application_code: str = Form(..., pattern=APPLICATION_CODE_PATTERN),
    institution_name: Optional[str] = Form(None, max_length=255),
    declared_faculty_count: Optional[int] = Form(None, ge=0),
    declared_land_area_sqm: Optional[float] = Form(None, ge=0),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> UploadVerifyResponse:
    """
    Upload a PDF against an application and run: hash -> duplicate check ->
    metadata forensics -> text extraction -> cross-check -> risk score -> save.

    The institution fields are used only when this call creates the application.
    For an existing application the stored declarations are always used, so a
    later upload cannot quietly change what was declared.
    """
    # ---- 1. Validate the upload ------------------------------------------- #
    data = file.file.read(MAX_UPLOAD_BYTES + 1)
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Uploaded file is empty.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            f"File exceeds the {MAX_UPLOAD_BYTES // (1024 * 1024)} MB limit.",
        )
    if not data.startswith(b"%PDF-"):
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Only PDF files are accepted.")

    filename = Path(file.filename or "unnamed.pdf").name[:512]

    # ---- 2. Find or create the application -------------------------------- #
    application = (
        db.query(InstitutionApplication)
        .filter(InstitutionApplication.application_code == application_code)
        .one_or_none()
    )
    if application is None:
        if not institution_name:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                "institution_name is required when creating a new application.",
            )
        application = InstitutionApplication(
            institution_name=institution_name.strip(),
            application_code=application_code,
            declared_faculty_count=declared_faculty_count,
            declared_land_area_sqm=declared_land_area_sqm,
            status=ApplicationStatus.PENDING,
            risk_score=0.0,
        )
        db.add(application)
        db.flush()
        log_action(db, "APPLICATION_CREATED", application_code,
                   details=f"institution={application.institution_name!r}")

    # ---- 3. Hash and duplicate detection ---------------------------------- #
    file_hash = compute_sha256(data)
    flags: list[dict[str, Any]] = []

    existing = find_duplicate_documents(db, file_hash)
    if any(d.application_code == application_code for d in existing):
        log_action(db, "DUPLICATE_UPLOAD_REJECTED", application_code,
                   details=f"filename={filename!r} sha256={file_hash}")
        db.commit()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "This exact file was already uploaded for this application.",
        )
    other_apps = sorted({d.application_code for d in existing})
    if other_apps:
        flags.append(_flag(
            "duplicate", "DUPLICATE_ACROSS_APPLICATIONS", "HIGH",
            f"Identical file already submitted under other application(s): {', '.join(other_apps)}.",
        ))

    # ---- 4. Metadata forensics and text extraction ------------------------ #
    meta, extraction = _run_pdf_pipeline(data)
    flags.extend(_forensic_flags(meta))

    text = extraction["text"]
    extracted_fields = parse_document_fields(text) if text else parse_document_fields("")

    # ---- 5. Cross-check against the declared values ----------------------- #
    if text:
        declared = {
            "institution_name": application.institution_name,
            "declared_faculty_count": application.declared_faculty_count,
            "declared_land_area_sqm": application.declared_land_area_sqm,
        }
        check = verify_consistency(declared, extracted_fields)
        for f in check["flags"]:
            flags.append({"source": "cross_check", **f})
    elif not extraction["error"]:
        flags.append(_flag(
            "ocr", "NEEDS_OCR", "LOW",
            "No text layer found (likely a scan); content could not be verified. "
            "Run OCR or review manually.",
        ))

    # ---- 6. Risk scoring -------------------------------------------------- #
    risk = compute_application_risk(flags)

    # The application keeps its highest observed score, so a clean later upload
    # cannot erase a risky earlier one.
    application.risk_score = max(application.risk_score or 0.0, risk["score"])
    if application.risk_score >= FLAG_THRESHOLD:
        application.status = ApplicationStatus.FLAGGED
    elif application.status == ApplicationStatus.PENDING:
        application.status = ApplicationStatus.UNDER_REVIEW
    # Never auto-approve: APPROVED/REJECTED are human decisions set elsewhere.

    # ---- 7. Persist ------------------------------------------------------- #
    db.add(UploadedDocument(
        filename=filename,
        application_code=application_code,
        file_hash=file_hash,
        extracted_text_preview=text[:TEXT_PREVIEW_CHARS] if text else None,
    ))
    log_action(db, "DOCUMENT_VERIFIED", application_code, details=json.dumps({
        "filename": filename,
        "sha256": file_hash,
        "size_bytes": len(data),
        "risk_score": risk["score"],
        "flag_codes": [f["code"] for f in flags],
    }))

    try:
        db.commit()
    except IntegrityError:
        # Two identical uploads raced past the duplicate check; the unique index won.
        db.rollback()
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            "This exact file was already uploaded for this application.",
        )

    logger.info("Verified %s for %s: risk=%.1f flags=%d",
                filename, application_code, risk["score"], len(flags))

    return UploadVerifyResponse(
        application_code=application_code,
        filename=filename,
        file_hash=file_hash,
        application_status=application.status,
        document_risk_score=risk["score"],
        application_risk_score=application.risk_score,
        risk_level=risk["level"],
        needs_review=risk["needs_review"],
        flags=[FlagOut(**f) for f in flags],
        extracted_fields=extracted_fields,
    )


@app.post("/api/query-aph-rule", response_model=AphAnswerOut)
def query_aph_rule(body: AphQuery, request: Request) -> dict[str, Any]:
    """Answer a compliance question from the APH rule knowledge base."""
    rag: APHRegulatoryRAG = request.app.state.rag
    return rag.answer(body.query, top_k=body.top_k)


@app.get("/api/application/{application_code}", response_model=ApplicationDetail)
def get_application(application_code: str, db: Session = Depends(get_db)) -> ApplicationDetail:
    """Fetch an application with its uploaded documents and audit trail."""
    application = (
        db.query(InstitutionApplication)
        .filter(InstitutionApplication.application_code == application_code)
        .one_or_none()
    )
    if application is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Application not found.")

    logs = (
        db.query(AuditLog)
        .filter(AuditLog.application_code == application_code)
        .order_by(AuditLog.timestamp.asc(), AuditLog.id.asc())
        .all()
    )

    detail = ApplicationDetail.model_validate(application)
    detail.audit_logs = [AuditLogOut.model_validate(entry) for entry in logs]
    return detail

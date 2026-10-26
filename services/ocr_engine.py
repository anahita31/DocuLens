"""
services/ocr_engine.py
----------------------
Document parsing for the AICTE document verification system (SIH2621).

    - extract_text_from_pdf(file_path) : raw text from a PDF via PyPDF
    - parse_document_fields(text)      : regex extraction of faculty count,
                                         land area (normalised to sq. metres)
                                         and institution name

Requires: pypdf  (pip install pypdf)

Limitation: PyPDF only reads the embedded text layer. Scanned/image-only PDFs
return little or no text; extract_text_from_pdf() reports this via
`needs_ocr` so the caller can route those files to a real OCR engine
(e.g. Tesseract via pytesseract) as a fallback.
"""

from __future__ import annotations

import logging
import re
from pathlib import Path
from typing import Any, Optional, Union

from pypdf import PdfReader
from pypdf.errors import PdfReadError

logger = logging.getLogger(__name__)

# Fewer characters than this per page on average suggests a scanned document.
_MIN_CHARS_PER_PAGE = 30

# --------------------------------------------------------------------------- #
# Unit conversion (to square metres)
# --------------------------------------------------------------------------- #
SQM_PER_UNIT: dict[str, float] = {
    "sqm": 1.0,
    "sqft": 0.09290304,
    "sqyd": 0.83612736,
    "acre": 4046.8564224,
    "hectare": 10000.0,
}

# Maps the many ways a unit is written to a canonical key above.
_UNIT_ALIASES: dict[str, str] = {
    "sq.m": "sqm", "sqm": "sqm", "sq m": "sqm", "sq.mtr": "sqm", "sq.mtrs": "sqm",
    "sq. m": "sqm", "sq. meters": "sqm", "sq meters": "sqm", "sq. metres": "sqm",
    "square meter": "sqm", "square meters": "sqm", "square metre": "sqm",
    "square metres": "sqm", "m2": "sqm", "m²": "sqm", "sqmt": "sqm", "sqmtr": "sqm",
    "sq.ft": "sqft", "sqft": "sqft", "sq ft": "sqft", "sq. ft": "sqft",
    "sq.feet": "sqft", "sq feet": "sqft", "square feet": "sqft", "square foot": "sqft",
    "sq.yd": "sqyd", "sqyd": "sqyd", "sq yd": "sqyd", "sq. yd": "sqyd",
    "sq.yards": "sqyd", "sq yards": "sqyd", "square yards": "sqyd",
    "acre": "acre", "acres": "acre", "ac": "acre",
    "hectare": "hectare", "hectares": "hectare", "ha": "hectare",
}

# Longest aliases first so "sq. meters" wins over "sq".
_UNIT_PATTERN = "|".join(
    re.escape(a) for a in sorted(_UNIT_ALIASES, key=len, reverse=True)
)

# --------------------------------------------------------------------------- #
# Regex patterns (compiled once)
# --------------------------------------------------------------------------- #
_NUM = r"(\d{1,3}(?:,\d{2,3})+|\d+)"  # 1,234 | 12,34,567 | 45

# Label then number:  "Total Faculty: 45", "No. of teaching staff - 45"
_FACULTY_LABEL_FIRST = re.compile(
    r"(?:total\s+)?(?:no\.?\s*of\s+|number\s+of\s+)?"
    r"(?:regular\s+|full[\s-]?time\s+)?"
    r"(?:teaching\s+)?(?:faculty|staff)(?:\s+members?|\s+strength|\s+count)?"
    r"\s*(?:\(.*?\))?\s*[:\-–=]?\s*(?:is|are|of)?\s*" + _NUM + r"\b",
    re.IGNORECASE,
)

# Number then label:  "45 faculty members", "45 teaching staff"
_FACULTY_NUM_FIRST = re.compile(
    _NUM + r"\s+(?:regular\s+|full[\s-]?time\s+)?(?:teaching\s+)?"
    r"(?:faculty|staff)(?:\s+members?)?\b",
    re.IGNORECASE,
)

# Land: label, up to ~40 chars of filler, then "<number> <unit>"
_LAND_AREA = re.compile(
    r"(?:land|plot|campus|site)(?:\s+area)?[^\n\d]{0,40}?"
    r"(\d[\d,]*(?:\.\d+)?)\s*(" + _UNIT_PATTERN + r")(?![a-z])",
    re.IGNORECASE,
)

# Institution name, either as a labelled field or in a certification sentence.
_INSTITUTION_LABELLED = re.compile(
    r"(?:name\s+of\s+(?:the\s+)?(?:institution|institute|college|trust|society))"
    r"\s*[:\-–]\s*([^\n\r]{3,150})",
    re.IGNORECASE,
)
_INSTITUTION_CERTIFY = re.compile(
    r"certif(?:y|ied)\s+that\s+(?:the\s+)?([A-Z][^\n\r]{3,150}?)"
    r"(?=\s+(?:has|is|have|was|located|situated)\b|[,\n\r])",
    re.IGNORECASE,
)


# --------------------------------------------------------------------------- #
# Public API
# --------------------------------------------------------------------------- #
def extract_text_from_pdf(file_path: Union[str, Path]) -> dict[str, Any]:
    """
    Extract all raw text from a PDF using PyPDF.

    Returns:
        {
          "text": str,             # concatenated text of all pages
          "page_count": int,
          "needs_ocr": bool,       # True if the PDF looks scanned / has no text layer
          "error": str | None,
        }

    Never raises for corrupt/encrypted PDFs (check `error`); raises
    FileNotFoundError if the path does not exist.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"PDF not found: {path}")

    result: dict[str, Any] = {"text": "", "page_count": 0, "needs_ocr": False, "error": None}

    try:
        reader = PdfReader(str(path))

        if reader.is_encrypted:
            # Many PDFs use owner-only encryption, readable with an empty password.
            if reader.decrypt("") == 0:
                result["error"] = "encrypted_pdf"
                return result

        pages_text: list[str] = []
        for index, page in enumerate(reader.pages):
            try:
                pages_text.append(page.extract_text() or "")
            except Exception as exc:  # one bad page must not lose the whole document
                logger.warning("Page %d of %s failed extraction: %s", index + 1, path, exc)
                pages_text.append("")

        result["page_count"] = len(pages_text)
        result["text"] = "\n".join(pages_text).strip()

        avg_chars = len(result["text"]) / max(result["page_count"], 1)
        result["needs_ocr"] = avg_chars < _MIN_CHARS_PER_PAGE

    except (PdfReadError, ValueError, OSError) as exc:
        logger.warning("Could not read PDF %s: %s", path, exc)
        result["error"] = f"unreadable_pdf: {exc}"

    return result


def parse_document_fields(text: str) -> dict[str, Any]:
    """
    Pull key structured values out of raw document text using regex.

    Returns:
        {
          "faculty_count": int | None,
          "land_area_sqm": float | None,      # normalised to square metres
          "land_area_raw": str | None,        # e.g. "5.2 acres" as written
          "institution_name": str | None,
        }

    Missing values are None (never guessed). If the text mentions several
    figures, the first labelled match wins; callers needing stricter handling
    should review the document manually when values look implausible.
    """
    fields: dict[str, Any] = {
        "faculty_count": None,
        "land_area_sqm": None,
        "land_area_raw": None,
        "institution_name": None,
    }
    if not text or not text.strip():
        return fields

    # Collapse whitespace runs so labels split across lines still match.
    flat = re.sub(r"[ \t]+", " ", text)

    fields["faculty_count"] = _parse_faculty_count(flat)
    fields["land_area_sqm"], fields["land_area_raw"] = _parse_land_area(flat)
    fields["institution_name"] = _parse_institution_name(text)
    return fields


# --------------------------------------------------------------------------- #
# Internal helpers
# --------------------------------------------------------------------------- #
def _to_int(raw: str) -> Optional[int]:
    try:
        return int(raw.replace(",", ""))
    except ValueError:
        return None


def _parse_faculty_count(text: str) -> Optional[int]:
    for pattern in (_FACULTY_LABEL_FIRST, _FACULTY_NUM_FIRST):
        for match in pattern.finditer(text):
            value = _to_int(match.group(1))
            # Reject implausible hits (years, phone numbers, etc.).
            if value is not None and 0 < value <= 5000:
                return value
    return None


def _parse_land_area(text: str) -> tuple[Optional[float], Optional[str]]:
    for match in _LAND_AREA.finditer(text):
        number_raw, unit_raw = match.group(1), match.group(2)
        unit_key = _UNIT_ALIASES.get(unit_raw.lower().strip())
        if unit_key is None:
            continue
        try:
            number = float(number_raw.replace(",", ""))
        except ValueError:
            continue
        if number <= 0:
            continue
        sqm = round(number * SQM_PER_UNIT[unit_key], 2)
        return sqm, f"{number_raw} {unit_raw}".strip()
    return None, None


def _parse_institution_name(text: str) -> Optional[str]:
    for pattern in (_INSTITUTION_LABELLED, _INSTITUTION_CERTIFY):
        match = pattern.search(text)
        if match:
            name = re.sub(r"\s+", " ", match.group(1)).strip(" .,:;-–")
            if len(name) >= 3:
                return name
    return None


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 2:
        print("Usage: python -m services.ocr_engine <file.pdf>")
        raise SystemExit(1)

    extraction = extract_text_from_pdf(sys.argv[1])
    print(f"Pages: {extraction['page_count']}  needs_ocr: {extraction['needs_ocr']}")
    print(json.dumps(parse_document_fields(extraction["text"]), indent=2))

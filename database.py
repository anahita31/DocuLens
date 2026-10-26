"""
database.py
-----------
SQLAlchemy ORM setup (SQLite) for the AICTE document verification system (SIH2621).

Models:
    - InstitutionApplication : one row per institution application
    - UploadedDocument       : one row per uploaded file (with SHA-256 hash)
    - AuditLog               : append-only trail of actions

Requires: SQLAlchemy >= 2.0
"""

from __future__ import annotations

import enum
import os
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Iterator, Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    create_engine,
    event,
)
from sqlalchemy.engine import Engine
from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    Session,
    mapped_column,
    relationship,
    sessionmaker,
)

# --------------------------------------------------------------------------- #
# Engine / session configuration
# --------------------------------------------------------------------------- #
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./aicte_verification.db")

# check_same_thread=False is required because FastAPI/Flask may use the
# connection from worker threads. Each request still gets its own Session.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False,
    future=True,
)


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
    """SQLite ignores foreign keys unless this PRAGMA is set per connection."""
    if DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def utcnow() -> datetime:
    """Timezone-aware UTC timestamp (datetime.utcnow() is deprecated)."""
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Declarative base for all ORM models."""


# --------------------------------------------------------------------------- #
# Enums
# --------------------------------------------------------------------------- #
class ApplicationStatus(str, enum.Enum):
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    FLAGGED = "FLAGGED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


# --------------------------------------------------------------------------- #
# Models
# --------------------------------------------------------------------------- #
class InstitutionApplication(Base):
    """An institution's application, with declared faculty/land figures."""

    __tablename__ = "institution_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    institution_name: Mapped[str] = mapped_column(String(255), nullable=False)
    application_code: Mapped[str] = mapped_column(
        String(64), unique=True, index=True, nullable=False
    )
    declared_faculty_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    declared_land_area_sqm: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, native_enum=False, length=20),
        default=ApplicationStatus.PENDING,
        nullable=False,
    )
    # Risk score on a 0-100 scale (higher = riskier).
    risk_score: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    documents: Mapped[list["UploadedDocument"]] = relationship(
        back_populates="application", cascade="all, delete-orphan"
    )

    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="ck_risk_score_range"),
        CheckConstraint(
            "declared_faculty_count IS NULL OR declared_faculty_count >= 0",
            name="ck_faculty_non_negative",
        ),
        CheckConstraint(
            "declared_land_area_sqm IS NULL OR declared_land_area_sqm >= 0",
            name="ck_land_non_negative",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<InstitutionApplication code={self.application_code!r} "
            f"status={self.status.value} risk={self.risk_score}>"
        )


class UploadedDocument(Base):
    """A file uploaded against an application, identified by its SHA-256 hash."""

    __tablename__ = "uploaded_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(512), nullable=False)
    application_code: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("institution_applications.application_code", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    # SHA-256 hex digest is always 64 characters. Indexed (not unique) so the same
    # file reused across applications can be detected and reported, not rejected.
    file_hash: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    extracted_text_preview: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    application: Mapped["InstitutionApplication"] = relationship(back_populates="documents")

    __table_args__ = (
        # The same file twice within one application is a pure duplicate.
        Index("ix_doc_app_hash", "application_code", "file_hash", unique=True),
    )

    def __repr__(self) -> str:
        return f"<UploadedDocument {self.filename!r} sha256={self.file_hash[:12]}...>"


class AuditLog(Base):
    """Append-only audit trail. Never update or delete rows from application code."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, index=True, nullable=False
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    application_code: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    actor: Mapped[str] = mapped_column(String(100), default="system", nullable=False)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    def __repr__(self) -> str:
        return f"<AuditLog {self.timestamp.isoformat()} {self.action!r}>"


# --------------------------------------------------------------------------- #
# Helpers
# --------------------------------------------------------------------------- #
def init_db() -> None:
    """Create all tables if they do not already exist. Call once at startup."""
    Base.metadata.create_all(bind=engine)


@contextmanager
def get_session() -> Iterator[Session]:
    """
    Transactional session scope: commits on success, rolls back on error.

        with get_session() as db:
            db.add(...)
    """
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def get_db() -> Iterator[Session]:
    """FastAPI-style dependency: `db: Session = Depends(get_db)`."""
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def log_action(
    session: Session,
    action: str,
    application_code: Optional[str] = None,
    actor: str = "system",
    details: Optional[str] = None,
) -> AuditLog:
    """Append an audit entry to the current session (caller commits)."""
    entry = AuditLog(
        action=action,
        application_code=application_code,
        actor=actor,
        details=details,
    )
    session.add(entry)
    return entry


def find_duplicate_documents(session: Session, file_hash: str) -> list[UploadedDocument]:
    """Return every stored document sharing this SHA-256 hash (across applications)."""
    return session.query(UploadedDocument).filter(UploadedDocument.file_hash == file_hash).all()


if __name__ == "__main__":
    init_db()
    print(f"Database initialised at {DATABASE_URL}")

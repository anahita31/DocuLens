"""
services/forensics.py
---------------------
File forensics helpers for the AICTE document verification system (SIH2621).

    - compute_sha256(file_bytes)      : cryptographic hash for duplicate detection
    - inspect_pdf_metadata(file_path) : PDF metadata inspection with flagging of
                                        image-editing software footprints

Requires: pypdf  (pip install pypdf)

Note: metadata is easy to strip or forge, so a *clean* result is NOT proof of
authenticity. Treat flags as risk signals to feed into scoring, not verdicts.
"""

from __future__ import annotations

import hashlib
import logging
from pathlib import Path
from typing import Any, Optional, Union

from pypdf import PdfReader
from pypdf.errors import PdfReadError

logger = logging.getLogger(__name__)

# Lower-case substrings matched against Producer / Creator / Author / Title and XMP.
# Keys are the label reported back to the caller.
SUSPICIOUS_SOFTWARE: dict[str, tuple[str, ...]] = {
    "Adobe Photoshop": ("photoshop",),
    "Canva": ("canva",),
    "GIMP": ("gimp",),
    # Common additional editors/generators worth surfacing as lower-trust origins.
    "Adobe Illustrator": ("illustrator",),
    "Adobe InDesign": ("indesign",),
    "Pixlr": ("pixlr",),
    "Photopea": ("photopea",),
    "Affinity": ("affinity",),
    "CorelDRAW": ("coreldraw", "corel draw"),
}

# Metadata fields inspected for software signatures.
_SCANNED_FIELDS = ("/Producer", "/Creator", "/Author", "/Title", "/Subject", "/Keywords")


def compute_sha256(file_bytes: bytes) -> str:
    """
    Return the SHA-256 hex digest (64 chars) of the given bytes.

    Identical files always yield identical digests, so store this value and
    query it to detect duplicate or re-submitted documents.
    """
    if not isinstance(file_bytes, (bytes, bytearray, memoryview)):
        raise TypeError("file_bytes must be bytes-like")
    return hashlib.sha256(file_bytes).hexdigest()


def _clean(value: Any) -> Optional[str]:
    """Coerce a PDF metadata value to a stripped string, or None if empty."""
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _match_software(haystack: str) -> list[str]:
    """Return labels of all suspicious editors whose signature appears in haystack."""
    lowered = haystack.lower()
    return [
        label
        for label, needles in SUSPICIOUS_SOFTWARE.items()
        if any(needle in lowered for needle in needles)
    ]


def inspect_pdf_metadata(file_path: Union[str, Path]) -> dict[str, Any]:
    """
    Inspect a PDF's document-info and XMP metadata and flag editing-software footprints.

    Returns a dict:
        {
          "file_path": str,
          "readable": bool,                 # False if the PDF could not be parsed
          "encrypted": bool,
          "page_count": int | None,
          "metadata": {                     # raw fields (None when absent)
              "producer", "creator", "author", "title",
              "creation_date", "modification_date"
          },
          "suspicious": bool,               # True if any flag was raised
          "flags": [str, ...],              # human-readable reasons
          "detected_software": [str, ...],  # e.g. ["Adobe Photoshop", "Canva"]
          "error": str | None
        }

    Never raises for bad/corrupt PDFs; check `readable` and `error` instead.
    Raises FileNotFoundError if the path does not exist.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"PDF not found: {path}")

    result: dict[str, Any] = {
        "file_path": str(path),
        "readable": False,
        "encrypted": False,
        "page_count": None,
        "metadata": {
            "producer": None,
            "creator": None,
            "author": None,
            "title": None,
            "creation_date": None,
            "modification_date": None,
        },
        "suspicious": False,
        "flags": [],
        "detected_software": [],
        "error": None,
    }

    try:
        reader = PdfReader(str(path))

        if reader.is_encrypted:
            result["encrypted"] = True
            # Try the empty password (common for permission-only encryption).
            try:
                if reader.decrypt("") == 0:
                    result["flags"].append("PDF is password-protected; metadata not inspected")
                    result["suspicious"] = True
                    result["error"] = "encrypted_pdf"
                    return result
            except Exception as exc:  # decrypt can fail without crypto backend
                result["flags"].append("PDF is encrypted and could not be decrypted")
                result["suspicious"] = True
                result["error"] = f"decrypt_failed: {exc}"
                return result

        result["page_count"] = len(reader.pages)
        info = reader.metadata  # DocumentInformation or None

        searchable: list[str] = []

        if info:
            result["metadata"].update(
                {
                    "producer": _clean(info.get("/Producer")),
                    "creator": _clean(info.get("/Creator")),
                    "author": _clean(info.get("/Author")),
                    "title": _clean(info.get("/Title")),
                    "creation_date": _clean(info.get("/CreationDate")),
                    "modification_date": _clean(info.get("/ModDate")),
                }
            )
            for field in _SCANNED_FIELDS:
                value = _clean(info.get(field))
                if value:
                    searchable.append(value)
        else:
            result["flags"].append("No document-info metadata present (may have been stripped)")

        # XMP metadata often retains the editor's footprint even when /Info is scrubbed.
        try:
            xmp = reader.xmp_metadata
            if xmp is not None:
                for attr in ("xmp_creator_tool", "pdf_producer", "dc_creator"):
                    value = getattr(xmp, attr, None)
                    if isinstance(value, (list, tuple)):
                        value = " ".join(str(v) for v in value)
                    value = _clean(value)
                    if value:
                        searchable.append(value)
        except Exception as exc:  # malformed XMP should not abort inspection
            logger.debug("XMP parse failed for %s: %s", path, exc)

        # Flag known image-editing / design software.
        detected: list[str] = []
        for text in searchable:
            for label in _match_software(text):
                if label not in detected:
                    detected.append(label)
        result["detected_software"] = detected
        for label in detected:
            result["flags"].append(f"Created/edited with {label}")

        # Modified after creation is a weaker, secondary signal.
        created = result["metadata"]["creation_date"]
        modified = result["metadata"]["modification_date"]
        if created and modified and created != modified:
            result["flags"].append("Modification date differs from creation date")

        result["readable"] = True
        # Only software hits or stripped/encrypted metadata mark the file suspicious;
        # a lone date difference is informational (many legit tools re-save PDFs).
        result["suspicious"] = bool(detected) or any(
            "stripped" in flag for flag in result["flags"]
        )

    except (PdfReadError, ValueError, OSError) as exc:
        logger.warning("Could not parse PDF %s: %s", path, exc)
        result["error"] = f"unreadable_pdf: {exc}"
        result["flags"].append("PDF is corrupt or unreadable")
        result["suspicious"] = True

    return result


if __name__ == "__main__":
    import json
    import sys

    if len(sys.argv) != 2:
        print("Usage: python -m services.forensics <file.pdf>")
        raise SystemExit(1)

    pdf_path = Path(sys.argv[1])
    print("SHA-256:", compute_sha256(pdf_path.read_bytes()))
    print(json.dumps(inspect_pdf_metadata(pdf_path), indent=2, default=str))

"""
services/cross_checker.py
-------------------------
Cross-checks form-declared values against values extracted from documents
for the AICTE document verification system (SIH2621).

    - verify_consistency(declared_data, extracted_data) : discrepancy flags
    - check_name_similarity(form_name, doc_name)        : RapidFuzz name match

Requires: rapidfuzz  (pip install rapidfuzz)

Expected dict shapes (keys match database.InstitutionApplication and
ocr_engine.parse_document_fields):

    declared_data  = {"institution_name": str,
                      "declared_faculty_count": int,
                      "declared_land_area_sqm": float}
    extracted_data = {"institution_name": str | None,
                      "faculty_count": int | None,
                      "land_area_sqm": float | None}
"""

from __future__ import annotations

import re
from typing import Any, Optional

from rapidfuzz import fuzz

NAME_SIMILARITY_THRESHOLD = 85.0   # percent
LAND_TOLERANCE_PCT = 5.0           # OCR/unit-rounding slack for land area
FACULTY_TOLERANCE = 0              # faculty counts must match exactly by default

# Severity labels used in flags.
HIGH, MEDIUM, LOW = "HIGH", "MEDIUM", "LOW"


# --------------------------------------------------------------------------- #
# Name similarity
# --------------------------------------------------------------------------- #
def _normalise_name(name: str) -> str:
    """Lower-case, expand '&', strip punctuation and the filler word 'the'."""
    name = name.lower().replace("&", " and ")
    name = re.sub(r"[^\w\s]", " ", name)          # punctuation -> space
    tokens = [t for t in name.split() if t != "the"]
    return " ".join(tokens)


def check_name_similarity(
    form_name: Optional[str],
    doc_name: Optional[str],
    threshold: float = NAME_SIMILARITY_THRESHOLD,
) -> dict[str, Any]:
    """
    Fuzzy-compare the institution name on the form with the one in a document.

    Uses RapidFuzz token_sort_ratio on normalised names, so word order and
    punctuation differences don't matter ("College of Engineering, ABC" ==
    "ABC College of Engineering"). token_set_ratio is deliberately avoided: it
    scores 100 whenever one name is a subset of the other, which would let
    "ABC College" pass against "ABC College of Pharmacy".

    Returns:
        {"score": float (0-100), "is_match": bool, "threshold": float,
         "form_name": str | None, "doc_name": str | None}
    """
    result: dict[str, Any] = {
        "score": 0.0,
        "is_match": False,
        "threshold": threshold,
        "form_name": form_name,
        "doc_name": doc_name,
    }
    if not form_name or not doc_name:
        return result  # nothing to compare -> not a match

    a, b = _normalise_name(form_name), _normalise_name(doc_name)
    if not a or not b:
        return result

    score = float(fuzz.token_sort_ratio(a, b))
    result["score"] = round(score, 2)
    result["is_match"] = score >= threshold
    return result


# --------------------------------------------------------------------------- #
# Consistency verification
# --------------------------------------------------------------------------- #
def _flag(field: str, code: str, severity: str, message: str,
          declared: Any = None, extracted: Any = None) -> dict[str, Any]:
    return {
        "field": field,
        "code": code,
        "severity": severity,
        "message": message,
        "declared": declared,
        "extracted": extracted,
    }


def verify_consistency(
    declared_data: dict[str, Any],
    extracted_data: dict[str, Any],
    faculty_tolerance: int = FACULTY_TOLERANCE,
    land_tolerance_pct: float = LAND_TOLERANCE_PCT,
    name_threshold: float = NAME_SIMILARITY_THRESHOLD,
) -> dict[str, Any]:
    """
    Compare form-declared values with OCR-extracted values.

    Returns:
        {
          "consistent": bool,            # True only if no flags were raised
          "flags": [ {field, code, severity, message, declared, extracted}, ... ],
          "name_similarity": dict | None # output of check_name_similarity
        }

    A value that could not be extracted raises a LOW "NOT_FOUND" flag rather
    than a mismatch: absence of evidence is not evidence of fraud, but it does
    mean the field was not verified. Flags make `consistent` False.
    """
    flags: list[dict[str, Any]] = []
    name_result: Optional[dict[str, Any]] = None

    # --- Faculty count ---------------------------------------------------- #
    declared_fac = declared_data.get("declared_faculty_count")
    extracted_fac = extracted_data.get("faculty_count")

    if declared_fac is not None:
        if extracted_fac is None:
            flags.append(_flag(
                "faculty_count", "NOT_FOUND", LOW,
                "Faculty count could not be found in the document; not verified.",
                declared_fac, None,
            ))
        elif abs(declared_fac - extracted_fac) > faculty_tolerance:
            # Declaring more faculty than the document supports is the risky direction.
            overstated = declared_fac > extracted_fac
            flags.append(_flag(
                "faculty_count", "FACULTY_MISMATCH", HIGH if overstated else MEDIUM,
                f"Declared faculty count ({declared_fac}) differs from document "
                f"({extracted_fac})"
                + (" - declared figure is higher than documented." if overstated else "."),
                declared_fac, extracted_fac,
            ))

    # --- Land area -------------------------------------------------------- #
    declared_land = declared_data.get("declared_land_area_sqm")
    extracted_land = extracted_data.get("land_area_sqm")

    if declared_land is not None:
        if extracted_land is None:
            flags.append(_flag(
                "land_area", "NOT_FOUND", LOW,
                "Land area could not be found in the document; not verified.",
                declared_land, None,
            ))
        elif declared_land == 0 and extracted_land == 0:
            pass  # both zero: trivially consistent
        else:
            baseline = max(abs(declared_land), abs(extracted_land))
            diff_pct = abs(declared_land - extracted_land) / baseline * 100.0
            if diff_pct > land_tolerance_pct:
                overstated = declared_land > extracted_land
                flags.append(_flag(
                    "land_area", "LAND_AREA_MISMATCH", HIGH if overstated else MEDIUM,
                    f"Declared land area ({declared_land:,.2f} sq m) differs from "
                    f"document ({extracted_land:,.2f} sq m) by {diff_pct:.1f}%"
                    + (" - declared figure is higher than documented." if overstated else "."),
                    declared_land, extracted_land,
                ))

    # --- Institution name ------------------------------------------------- #
    declared_name = declared_data.get("institution_name")
    extracted_name = extracted_data.get("institution_name")

    if declared_name:
        if not extracted_name:
            flags.append(_flag(
                "institution_name", "NOT_FOUND", LOW,
                "Institution name could not be found in the document; not verified.",
                declared_name, None,
            ))
        else:
            name_result = check_name_similarity(declared_name, extracted_name, name_threshold)
            if not name_result["is_match"]:
                flags.append(_flag(
                    "institution_name", "NAME_MISMATCH", HIGH,
                    f"Institution name similarity {name_result['score']:.1f}% is below "
                    f"the {name_threshold:.0f}% threshold.",
                    declared_name, extracted_name,
                ))

    return {
        "consistent": not flags,
        "flags": flags,
        "name_similarity": name_result,
    }


if __name__ == "__main__":
    import json

    demo = verify_consistency(
        {"institution_name": "ABC Institute of Technology",
         "declared_faculty_count": 60, "declared_land_area_sqm": 20234.0},
        {"institution_name": "A.B.C. Institute of Technology",
         "faculty_count": 45, "land_area_sqm": 20234.28},
    )
    print(json.dumps(demo, indent=2))

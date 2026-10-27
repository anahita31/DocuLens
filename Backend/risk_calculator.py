"""
services/risk_calculator.py
---------------------------
Weighted risk scoring for the AICTE document compliance system (SIH2621).

    - compute_application_risk(flags) : 0-100 risk score from flag severities

Each flag is a mapping (or object) with a `severity` of HIGH, MEDIUM or LOW,
e.g. the flags produced by services.cross_checker.verify_consistency().

Scoring model: additive weights, capped at 100.
    HIGH = 30 points, MEDIUM = 15 points, LOW = 5 points
So three HIGH flags already saturate the score, while a handful of LOW
"could not verify" flags stay well below the review threshold. The weights are
policy choices, not ground truth: tune them with your reviewers.
"""

from __future__ import annotations

import logging
from collections import Counter
from typing import Any, Iterable

logger = logging.getLogger(__name__)

SEVERITY_WEIGHTS: dict[str, float] = {"HIGH": 30.0, "MEDIUM": 15.0, "LOW": 5.0}
MAX_SCORE = 100.0

# Scores at or above this should be escalated to a human reviewer.
FLAG_THRESHOLD = 50.0

# Severity assumed when a flag has a missing/unknown severity (conservative).
_DEFAULT_SEVERITY = "MEDIUM"


def _severity_of(flag: Any) -> str:
    """Read and normalise a flag's severity from a dict or an object."""
    raw = flag.get("severity") if isinstance(flag, dict) else getattr(flag, "severity", None)
    severity = str(raw).strip().upper() if raw is not None else ""
    if severity not in SEVERITY_WEIGHTS:
        logger.warning("Unknown flag severity %r; treating as %s", raw, _DEFAULT_SEVERITY)
        return _DEFAULT_SEVERITY
    return severity


def risk_level(score: float) -> str:
    """Map a 0-100 score to a human-readable band."""
    if score < 20:
        return "LOW"
    if score < FLAG_THRESHOLD:
        return "MEDIUM"
    if score < 75:
        return "HIGH"
    return "CRITICAL"


def compute_application_risk(flags: Iterable[Any]) -> dict[str, Any]:
    """
    Compute an overall risk score from a collection of flags.

    Returns:
        {
          "score": float,                 # 0-100, rounded to 2 decimals
          "level": str,                   # LOW | MEDIUM | HIGH | CRITICAL
          "counts": {"HIGH": n, "MEDIUM": n, "LOW": n},
          "needs_review": bool,           # score >= FLAG_THRESHOLD
        }

    An empty flag list scores 0. A zero score means "no flags raised", not
    "verified genuine": metadata and OCR checks can miss tampering.
    """
    counts: Counter[str] = Counter(_severity_of(f) for f in flags)

    raw = sum(SEVERITY_WEIGHTS[sev] * n for sev, n in counts.items())
    score = round(min(raw, MAX_SCORE), 2)

    return {
        "score": score,
        "level": risk_level(score),
        "counts": {sev: counts.get(sev, 0) for sev in SEVERITY_WEIGHTS},
        "needs_review": score >= FLAG_THRESHOLD,
    }


if __name__ == "__main__":
    demo = compute_application_risk(
        [{"severity": "HIGH"}, {"severity": "MEDIUM"}, {"severity": "LOW"}]
    )
    print(demo)  # score 50.0 -> HIGH, needs_review True

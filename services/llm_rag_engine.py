"""
services/llm_rag_engine.py
--------------------------
Mini-RAG knowledge base for AICTE Approval Process Handbook (APH) rules
(SIH2621). Retrieval is plain keyword matching, so it is deterministic,
dependency-free and easy to audit.

    - APHRegulatoryRAG : stores rules, retrieves the best matches for a
                         compliance question, and composes a cited answer

IMPORTANT: the built-in rules are SAMPLE paraphrases so the pipeline works out
of the box. They are NOT verbatim APH text and carry no figures. Before using
this for real decisions, load verified rules from the official handbook with
`load_from_json()` (format documented there).

To add LLM generation later, pass `answer()["matches"]` to your model as the
retrieved context; the retrieval interface does not need to change.
"""

from __future__ import annotations

import json
import logging
import re
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable, Optional, Union

logger = logging.getLogger(__name__)

_STOPWORDS = frozenset(
    "a an and are as at be by can do does for from has have how i if in is it of on "
    "or our the their this to what when which who will with must should my we".split()
)

# Scoring weights for the keyword matcher.
_PHRASE_KEYWORD_SCORE = 4.0   # multi-word keyword found as a phrase in the query
_SINGLE_KEYWORD_SCORE = 3.0   # single-word keyword found in the query
_TITLE_TOKEN_SCORE = 1.5      # query token appears in the rule title
_TEXT_TOKEN_SCORE = 0.5       # query token appears in the rule body
_TEXT_TOKEN_CAP = 3.0         # cap so long rule bodies cannot dominate
_MIN_SCORE = 1.0              # below this, a rule is not considered relevant

SAMPLE_DISCLAIMER = (
    "Answers are generated from the loaded rule set by keyword matching. Built-in "
    "rules are illustrative samples, not verbatim APH text; verify against the "
    "official AICTE Approval Process Handbook before acting."
)


@dataclass(frozen=True)
class APHRule:
    """One rule/clause in the knowledge base."""

    rule_id: str
    title: str
    text: str
    keywords: tuple[str, ...] = ()
    category: str = "general"
    source: str = ""  # e.g. "APH 2025-26, Chapter 3, Clause 3.2"


@dataclass
class RuleMatch:
    rule: APHRule
    score: float
    matched_keywords: list[str] = field(default_factory=list)


def _tokenise(text: str) -> list[str]:
    """Lower-case alphanumeric tokens, stopwords removed, plural 's' trimmed."""
    tokens = re.findall(r"[a-z0-9]+", text.lower())
    out = []
    for tok in tokens:
        if tok in _STOPWORDS:
            continue
        out.append(tok[:-1] if len(tok) > 3 and tok.endswith("s") else tok)
    return out


def _sample_rules() -> list[APHRule]:
    return [
        APHRule(
            "SAMPLE-FAC-01", "Faculty declaration must match supporting records",
            "Faculty strength declared in the application should be backed by "
            "supporting documents (for example appointment or payroll records) and "
            "must be consistent with the figure entered in the application form.",
            ("faculty", "teaching staff", "faculty count", "faculty strength", "staff"),
            "faculty", "SAMPLE - replace with verified APH clause",
        ),
        APHRule(
            "SAMPLE-LND-01", "Land documents must support the declared land area",
            "Land documents (such as title deed, lease deed or land-use certificate) "
            "should establish the institution's right to the land, and the area shown "
            "in them should match the land area declared in the application.",
            ("land", "land area", "plot", "campus", "lease", "title deed", "acre", "hectare"),
            "land", "SAMPLE - replace with verified APH clause",
        ),
        APHRule(
            "SAMPLE-NAM-01", "Institution name must be consistent across documents",
            "The institution's name should be the same, allowing for minor formatting "
            "differences, across the application form, trust or society registration "
            "and land documents.",
            ("name", "institution name", "trust", "society", "registration"),
            "identity", "SAMPLE - replace with verified APH clause",
        ),
        APHRule(
            "SAMPLE-DOC-01", "Submitted documents must be genuine and unaltered",
            "Documents uploaded with an application should be genuine, legible and "
            "unaltered. Documents found to be edited, duplicated from another "
            "application or otherwise inauthentic should be escalated for manual review.",
            ("document", "genuine", "authentic", "forged", "tampered", "edited",
             "duplicate", "photoshop", "fake"),
            "documents", "SAMPLE - replace with verified APH clause",
        ),
        APHRule(
            "SAMPLE-INF-01", "Infrastructure declarations need supporting evidence",
            "Built-up area, laboratories, library and other infrastructure declared "
            "in the application should be supported by drawings, certificates or "
            "inspection evidence.",
            ("infrastructure", "building", "laboratory", "lab", "library", "built up area"),
            "infrastructure", "SAMPLE - replace with verified APH clause",
        ),
    ]


class APHRegulatoryRAG:
    """In-memory knowledge base of APH rules with keyword retrieval."""

    def __init__(
        self,
        rules: Optional[Iterable[APHRule]] = None,
        use_sample_rules: bool = True,
    ) -> None:
        self._rules: dict[str, APHRule] = {}
        if rules is not None:
            for rule in rules:
                self.add_rule(rule)
        elif use_sample_rules:
            for rule in _sample_rules():
                self.add_rule(rule)

    # ------------------------------------------------------------------ #
    # Knowledge-base management
    # ------------------------------------------------------------------ #
    def __len__(self) -> int:
        return len(self._rules)

    def add_rule(self, rule: APHRule) -> None:
        """Add or replace a rule (rule_id is the key)."""
        self._rules[rule.rule_id] = rule

    def load_from_json(self, path: Union[str, Path], replace: bool = False) -> int:
        """
        Load rules from a JSON file: a list of objects with keys
        rule_id, title, text, and optionally keywords (list), category, source.
        Set replace=True to drop existing (e.g. sample) rules first.
        Returns the number of rules loaded.
        """
        path = Path(path)
        data = json.loads(path.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            raise ValueError("Rules JSON must be a list of rule objects")

        loaded: list[APHRule] = []
        for i, item in enumerate(data):
            try:
                loaded.append(
                    APHRule(
                        rule_id=str(item["rule_id"]),
                        title=str(item["title"]),
                        text=str(item["text"]),
                        keywords=tuple(str(k) for k in item.get("keywords", ())),
                        category=str(item.get("category", "general")),
                        source=str(item.get("source", "")),
                    )
                )
            except (KeyError, TypeError) as exc:
                raise ValueError(f"Invalid rule at index {i}: {exc}") from exc

        if replace:
            self._rules.clear()
        for rule in loaded:
            self.add_rule(rule)
        logger.info("Loaded %d APH rules from %s", len(loaded), path)
        return len(loaded)

    # ------------------------------------------------------------------ #
    # Retrieval
    # ------------------------------------------------------------------ #
    def _score(self, query_norm: str, query_tokens: set[str], rule: APHRule) -> RuleMatch:
        score = 0.0
        matched: list[str] = []

        for keyword in rule.keywords:
            kw_norm = " ".join(_tokenise(keyword))
            if not kw_norm:
                continue
            if " " in kw_norm:
                hit = kw_norm in query_norm
                weight = _PHRASE_KEYWORD_SCORE
            else:
                hit = kw_norm in query_tokens
                weight = _SINGLE_KEYWORD_SCORE
            if hit:
                score += weight
                matched.append(keyword)

        title_tokens = set(_tokenise(rule.title))
        score += _TITLE_TOKEN_SCORE * len(query_tokens & title_tokens)

        text_tokens = set(_tokenise(rule.text))
        score += min(_TEXT_TOKEN_SCORE * len(query_tokens & text_tokens), _TEXT_TOKEN_CAP)

        return RuleMatch(rule=rule, score=round(score, 2), matched_keywords=matched)

    def query(self, question: str, top_k: int = 3) -> list[RuleMatch]:
        """Return up to top_k relevant rules, best first (empty if nothing matches)."""
        tokens = _tokenise(question or "")
        if not tokens:
            return []
        query_norm = " ".join(tokens)
        query_tokens = set(tokens)

        matches = [self._score(query_norm, query_tokens, r) for r in self._rules.values()]
        matches = [m for m in matches if m.score >= _MIN_SCORE]
        matches.sort(key=lambda m: (-m.score, m.rule.rule_id))
        return matches[: max(top_k, 0)]

    def answer(self, question: str, top_k: int = 3) -> dict[str, Any]:
        """
        Answer a compliance question from the best-matching rules.

        Returns:
            {"question", "answer", "matches": [ {rule_id, title, category, text,
             source, score, matched_keywords}, ... ], "disclaimer"}
        """
        matches = self.query(question, top_k)

        if not matches:
            answer = (
                "No matching APH rule was found for this question. Try more specific "
                "terms such as faculty, land area, documents or infrastructure."
            )
        else:
            best = matches[0].rule
            answer = f"{best.title}: {best.text}"
            if len(matches) > 1:
                related = "; ".join(f"{m.rule.title} [{m.rule.rule_id}]" for m in matches[1:])
                answer += f" Related rules: {related}."

        return {
            "question": question,
            "answer": answer,
            "matches": [
                {
                    **{k: v for k, v in asdict(m.rule).items() if k != "keywords"},
                    "score": m.score,
                    "matched_keywords": m.matched_keywords,
                }
                for m in matches
            ],
            "disclaimer": SAMPLE_DISCLAIMER,
        }


if __name__ == "__main__":
    rag = APHRegulatoryRAG()
    print(json.dumps(rag.answer("What proof is needed for declared faculty count?"), indent=2))

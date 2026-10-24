"""Shared text normalization, serialized with the model pipeline.

The normalizer is a plain Python object so that ``joblib`` can save it inside the fitted
pipeline: inference then applies exactly the normalization used during training.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any

from sklearn.base import BaseEstimator, TransformerMixin

_EMAIL_RE = re.compile(r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b")
_LONG_NUMBER_RE = re.compile(r"\b\d{7,}\b")
_WHITESPACE_RE = re.compile(r"\s+")

EMAIL_PLACEHOLDER = "<email>"
NUMBER_PLACEHOLDER = "<number>"


class TextNormalizer:
    """NFKC + whitespace normalization, optional case folding and identifier masking.

    Masking is best-effort and deliberately not called anonymization: it only replaces
    common e-mail shapes and long digit runs, leaving everything else untouched.
    """

    def __init__(self, lowercase: bool = True, mask_identifiers: bool = True) -> None:
        self.lowercase = bool(lowercase)
        self.mask_identifiers = bool(mask_identifiers)

    def normalize(self, text: str) -> str:
        if not isinstance(text, str):
            raise TypeError("text must be a string")
        value = unicodedata.normalize("NFKC", text)
        if self.mask_identifiers:
            value = _EMAIL_RE.sub(f" {EMAIL_PLACEHOLDER} ", value)
            value = _LONG_NUMBER_RE.sub(f" {NUMBER_PLACEHOLDER} ", value)
        value = _WHITESPACE_RE.sub(" ", value).strip()
        if self.lowercase:
            value = value.lower()
        return value

    def normalize_all(self, texts: list[str]) -> list[str]:
        return [self.normalize(text) for text in texts]

    def to_dict(self) -> dict[str, Any]:
        return {"lowercase": self.lowercase, "mask_identifiers": self.mask_identifiers}

    @classmethod
    def from_dict(cls, payload: dict[str, Any]) -> TextNormalizer:
        return cls(
            lowercase=payload.get("lowercase", True),
            mask_identifiers=payload.get("mask_identifiers", True),
        )

    def __eq__(self, other: object) -> bool:
        return isinstance(other, TextNormalizer) and self.to_dict() == other.to_dict()

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"TextNormalizer(lowercase={self.lowercase}, mask_identifiers={self.mask_identifiers})"


class NormalizeTransformer(BaseEstimator, TransformerMixin):
    """Scikit-learn transformer applying a :class:`TextNormalizer` to raw text."""

    def __init__(self, normalizer: TextNormalizer | None = None) -> None:
        self.normalizer = normalizer if normalizer is not None else TextNormalizer()

    def fit(self, X, y=None):  # noqa: N803 - sklearn estimator API
        return self

    def transform(self, X):  # noqa: N803 - sklearn estimator API
        return [self.normalizer.normalize(text) for text in X]

"""Strict YAML/Pydantic configuration.

Configuration is validated eagerly so that a misconfigured experiment fails before any
data is read or any model is fitted.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, ConfigDict, Field, ValidationError, field_validator, model_validator


class ConfigurationError(RuntimeError):
    """Raised when configuration cannot be read, parsed or validated."""


class ColumnMapping(BaseModel):
    """Source column name for every canonical field."""

    model_config = ConfigDict(extra="forbid")

    ticket_id: str = "ticket_id"
    ticket_text: str = "ticket_text"
    category: str = "category"
    priority: str | None = None
    created_at: str | None = None

    @field_validator("ticket_id", "ticket_text", "category")
    @classmethod
    def _non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("source column name must be a non-empty string")
        return value


class NormalizationSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    lowercase: bool = True
    mask_identifiers: bool = True


class FeatureSettings(BaseModel):
    """TF-IDF feature configuration (word n-grams for phrases, char n-grams for typos)."""

    model_config = ConfigDict(extra="forbid")

    word_ngram_range: tuple[int, int] = (1, 2)
    char_ngram_range: tuple[int, int] = (3, 5)
    max_features: int = Field(default=20000, ge=100)

    @field_validator("word_ngram_range", "char_ngram_range", mode="before")
    @classmethod
    def _as_range(cls, value: Any) -> Any:
        if isinstance(value, list):
            value = tuple(value)
        if not isinstance(value, tuple) or len(value) != 2:
            raise ValueError("n-gram range must be a [low, high] pair")
        low, high = value
        if not (isinstance(low, int) and isinstance(high, int)):
            raise ValueError("n-gram range bounds must be integers")
        if low < 1 or high < low:
            raise ValueError("n-gram range must satisfy 1 <= low <= high")
        return value


class SplitSettings(BaseModel):
    model_config = ConfigDict(extra="forbid")

    train: float = Field(default=0.6, gt=0, lt=1)
    validation: float = Field(default=0.2, gt=0, lt=1)
    test: float = Field(default=0.2, gt=0, lt=1)

    @model_validator(mode="after")
    def _sums_to_one(self) -> SplitSettings:
        total = self.train + self.validation + self.test
        if abs(total - 1.0) > 1e-9:
            raise ValueError(f"split fractions must sum to 1.0, got {total!r}")
        return self


class ReviewPolicy(BaseModel):
    """Human-review policy. The safe default is to review everything."""

    model_config = ConfigDict(extra="forbid")

    always_review: bool = True
    review_threshold: float = Field(default=0.7, ge=0.0, le=1.0)


class Config(BaseModel):
    """One dataset, one experiment configuration."""

    model_config = ConfigDict(extra="forbid")

    dataset_id: str = "synthetic-demo"
    source_license: str = "synthetic"
    synthetic: bool = True
    seed: int = 42
    columns: ColumnMapping = Field(default_factory=ColumnMapping)
    category_labels: list[str] = Field(default_factory=list)
    priority_enabled: bool = False
    priority_labels: list[str] = Field(default_factory=list)
    priority_labels_verified: bool = False
    max_text_chars: int = Field(default=10000, ge=1)
    min_groups_per_class: int = Field(default=5, ge=2)
    splits: SplitSettings = Field(default_factory=SplitSettings)
    review: ReviewPolicy = Field(default_factory=ReviewPolicy)
    normalization: NormalizationSettings = Field(default_factory=NormalizationSettings)
    features: FeatureSettings = Field(default_factory=FeatureSettings)

    @field_validator("dataset_id", "source_license")
    @classmethod
    def _non_empty_str(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("must be a non-empty string")
        return value

    @model_validator(mode="after")
    def _priority_requires_labels(self) -> Config:
        if not self.priority_enabled:
            return self
        if len(self.priority_labels) < 2:
            raise ValueError("priority_enabled requires at least two priority_labels")
        if not self.priority_labels_verified:
            raise ValueError(
                "priority_enabled requires priority_labels_verified: true after semantic review"
            )
        if len(set(self.priority_labels)) != len(self.priority_labels):
            raise ValueError("priority_labels must be unique")
        return self

    def to_dict(self) -> dict[str, Any]:
        return self.model_dump(mode="json")

    def config_hash(self) -> str:
        """Stable hash of the effective configuration (recorded in artifacts)."""
        payload = json.dumps(self.to_dict(), sort_keys=True, separators=(",", ":"))
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()


DEFAULT_CONFIG_PATH = Path("configs/config.example.yaml")


def load_config(path: str | Path | None = None) -> Config:
    """Load and validate configuration from YAML.

    ``None`` means "use built-in defaults", which is the synthetic demonstration dataset.
    """
    if path is None:
        return Config()
    config_path = Path(path)
    if not config_path.is_file():
        raise ConfigurationError(f"configuration file not found: {config_path}")
    try:
        raw = yaml.safe_load(config_path.read_text(encoding="utf-8"))
    except yaml.YAMLError as exc:  # pragma: no cover - exercised via CLI
        raise ConfigurationError(f"configuration file is not valid YAML: {exc}") from exc
    if raw is None:
        raise ConfigurationError(f"configuration file is empty: {config_path}")
    if not isinstance(raw, dict):
        raise ConfigurationError(f"configuration root must be a mapping: {config_path}")
    try:
        return Config.model_validate(raw)
    except ValidationError as exc:
        raise ConfigurationError(f"invalid configuration in {config_path}:\n{exc}") from exc

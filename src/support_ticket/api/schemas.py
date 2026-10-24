"""Strict request and response schemas.

Unknown request fields are rejected; request values are never echoed back in validation
errors (see the handler in :mod:`support_ticket.api.main`).
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_TICKET_ID_CHARS = 128
MAX_TEXT_CHARS = 10000
MAX_BATCH_SIZE = 100


class TicketInput(BaseModel):
    """One ticket as submitted by an agent-facing client."""

    model_config = ConfigDict(extra="forbid")

    ticket_id: str = Field(min_length=1, max_length=MAX_TICKET_ID_CHARS)
    text: str = Field(min_length=1, max_length=MAX_TEXT_CHARS)

    @field_validator("ticket_id", "text")
    @classmethod
    def _not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("must not be blank")
        return value


class PredictRequest(TicketInput):
    """Single-ticket prediction request."""


class BatchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tickets: list[TicketInput] = Field(min_length=1, max_length=MAX_BATCH_SIZE)


class CategoryPrediction(BaseModel):
    label: str
    score: float
    score_type: str
    review_required: bool
    review_reason: str | None = None


class PriorityPrediction(CategoryPrediction):
    """Optional priority prediction; only present when a priority model was trained."""


class PredictResponse(BaseModel):
    ticket_id: str
    model_version: str
    category: CategoryPrediction
    priority: PriorityPrediction | None = None
    priority_status: str


class BatchResponse(BaseModel):
    model_version: str
    results: list[PredictResponse]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class ReadyResponse(BaseModel):
    status: str
    model_version: str | None = None
    probe_latency_ms: float | None = None
    detail: str | None = None


class ModelInfoResponse(BaseModel):
    model_version: str
    artifact_schema_version: int | None = None
    dataset_id: str | None = None
    synthetic: bool
    source_license: str | None = None
    selected_candidate: str | None = None
    labels: list[str] = Field(default_factory=list)
    category_score_type: str | None = None
    priority_status: str
    priority_labels: list[str] = Field(default_factory=list)
    review_policy: dict[str, object] = Field(default_factory=dict)
    limits: dict[str, int] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)
    environment: dict[str, str] = Field(default_factory=dict)

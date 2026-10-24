"""FastAPI application: strict schemas, body limits and content-free structured events.

The service is deliberately small: it validates a request, calls the framework-independent
predictor and returns a category plus an explicit review decision. It never decides a
business action - predictions must not trigger refunds, account or security changes.
"""

from __future__ import annotations

import json
import logging
import os
import time
from collections import Counter
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse, RedirectResponse

from support_ticket import __version__
from support_ticket.api.middleware import BodySizeLimitMiddleware
from support_ticket.api.schemas import (
    BatchRequest,
    BatchResponse,
    HealthResponse,
    ModelInfoResponse,
    PredictRequest,
    PredictResponse,
    ReadyResponse,
)
from support_ticket.models.predict import Predictor

DEFAULT_MODEL_DIR = "reports/runs/demo/artifact"
DEFAULT_MAX_BODY_BYTES = 1_100_000
SERVICE_NAME = "support-ticket-api"

logger = logging.getLogger("support_ticket.api")


def log_event(event: str, **fields: Any) -> None:
    """Emit one content-free structured event (no ticket text, no ticket ids)."""
    logger.info(json.dumps({"event": event, **fields}, sort_keys=True, default=str))


def redact_validation_errors(errors: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Keep schema locations and messages, drop submitted values."""
    redacted: list[dict[str, Any]] = []
    for error in errors:
        redacted.append(
            {
                "type": error.get("type"),
                "loc": list(error.get("loc", [])),
                "msg": error.get("msg"),
                "input": "<redacted>",
            }
        )
    return redacted


def _validation_error(loc: list[Any], message: str) -> HTTPException:
    return HTTPException(
        status_code=422,
        detail=[{"type": "value_error", "loc": loc, "msg": message, "input": "<redacted>"}],
    )


def _enforce_model_limits(predictor: Predictor, texts: list[str], batch: bool) -> None:
    limit = predictor.limits["max_text_chars"]
    for index, text in enumerate(texts):
        if len(text) > limit:
            loc: list[Any] = ["body", "tickets", index, "text"] if batch else ["body", "text"]
            raise _validation_error(
                loc, f"ticket text exceeds the model length limit of {limit} characters"
            )


def _log_rejected(endpoint: str, status_code: int, reason: str) -> None:
    log_event(
        "request_rejected",
        endpoint=endpoint,
        status="rejected",
        status_code=status_code,
        reason=reason,
    )


def create_app(model_dir: str | None = None, max_body_bytes: int | None = None) -> FastAPI:
    """Build the application. ``model_dir=""`` starts it without a model (unready)."""
    resolved_model_dir = model_dir if model_dir is not None else os.environ.get("MODEL_DIR", "")
    resolved_max_body = (
        max_body_bytes
        if max_body_bytes is not None
        else int(os.environ.get("MAX_BODY_BYTES", DEFAULT_MAX_BODY_BYTES))
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.predictor = None
        app.state.model_error = None
        app.state.probe = None
        if not resolved_model_dir:
            app.state.model_error = "MODEL_DIR is not configured"
            log_event("model_load_skipped", reason="MODEL_DIR is not configured")
        else:
            try:
                predictor = Predictor(resolved_model_dir)
                probe = predictor.probe()
                app.state.predictor = predictor
                app.state.probe = probe
                log_event(
                    "model_loaded",
                    status="ready",
                    model_version=predictor.model_version,
                    artifact_schema_version=predictor.metadata.get("artifact_schema_version"),
                    synthetic=predictor.synthetic,
                    probe_latency_ms=probe["latency_ms"],
                )
            except Exception as exc:  # noqa: BLE001 - report and stay unready
                app.state.model_error = f"{type(exc).__name__}: {exc}"
                log_event(
                    "model_load_failed",
                    status="unready",
                    error_type=type(exc).__name__,
                    detail=str(exc)[:500],
                )
        yield

    app = FastAPI(
        title="Intelligent Support Ticket API",
        version=__version__,
        description=(
            "Assists support agents with ticket categorization. Scores are uncalibrated and "
            "the default policy requires human review. Predictions must not trigger refunds, "
            "account or security changes, or other irreversible actions."
        ),
        lifespan=lifespan,
    )
    app.state.model_dir = resolved_model_dir
    app.state.max_body_bytes = resolved_max_body
    app.add_middleware(BodySizeLimitMiddleware, max_bytes=resolved_max_body)

    def predictor_or_503() -> Predictor:
        predictor = app.state.predictor
        if predictor is None:
            _log_rejected("/predict", 503, "model_unavailable")
            raise HTTPException(
                status_code=503,
                detail="model is unavailable; check /ready for the reason",
            )
        return predictor

    @app.get("/", include_in_schema=False)
    def root() -> RedirectResponse:
        """Redirect to the interactive OpenAPI documentation."""
        return RedirectResponse("/docs")

    @app.get("/health", response_model=HealthResponse, tags=["ops"])
    def health() -> HealthResponse:
        """Process liveness: the process is up and serving requests."""
        return HealthResponse(status="ok", service=SERVICE_NAME, version=__version__)

    @app.get(
        "/ready",
        response_model=ReadyResponse,
        responses={503: {"model": ReadyResponse}},
        tags=["ops"],
    )
    def ready() -> JSONResponse:
        """Readiness: an artifact loaded and completed an inference probe at startup."""
        predictor = app.state.predictor
        if predictor is None:
            payload = ReadyResponse(
                status="unavailable",
                detail=app.state.model_error or "model is unavailable",
            )
            return JSONResponse(status_code=503, content=payload.model_dump())
        probe = app.state.probe or {}
        payload = ReadyResponse(
            status="ready",
            model_version=predictor.model_version,
            probe_latency_ms=probe.get("latency_ms"),
        )
        return JSONResponse(status_code=200, content=payload.model_dump())

    @app.get(
        "/model-info",
        response_model=ModelInfoResponse,
        responses={503: {"description": "no usable artifact is loaded"}},
        tags=["ops"],
    )
    def model_info() -> ModelInfoResponse:
        """Describe the loaded artifact: version, labels, policy, limits and warnings."""
        predictor = predictor_or_503()
        metadata = predictor.metadata
        priority = metadata.get("priority") or {}
        return ModelInfoResponse(
            model_version=predictor.model_version,
            artifact_schema_version=metadata.get("artifact_schema_version"),
            dataset_id=metadata.get("dataset_id"),
            synthetic=predictor.synthetic,
            source_license=metadata.get("source_license"),
            selected_candidate=metadata.get("selected_candidate"),
            labels=predictor.labels,
            category_score_type=metadata.get("category_score_type"),
            priority_status=predictor.priority_status,
            priority_labels=[str(label) for label in priority.get("labels", [])],
            review_policy=predictor.review_policy,
            limits=predictor.limits,
            warnings=predictor.warnings,
            environment={
                str(key): str(value) for key, value in (metadata.get("environment") or {}).items()
            },
        )

    @app.post(
        "/predict",
        response_model=PredictResponse,
        responses={422: {"description": "invalid request or model length violation"}},
        tags=["inference"],
    )
    def predict(payload: PredictRequest) -> PredictResponse:
        """Categorize one ticket and return the review decision."""
        predictor = predictor_or_503()
        _enforce_model_limits(predictor, [payload.text], batch=False)
        started = time.perf_counter()
        result = predictor.predict([payload.text])[0]
        latency_ms = round((time.perf_counter() - started) * 1000, 3)
        log_event(
            "prediction",
            endpoint="/predict",
            status="ok",
            model_version=predictor.model_version,
            batch_size=1,
            latency_ms=latency_ms,
            categories={result["category"]["label"]: 1},
            review_required=int(bool(result["category"]["review_required"])),
            priority_status=result["priority_status"],
        )
        return PredictResponse(
            ticket_id=payload.ticket_id,
            model_version=predictor.model_version,
            category=result["category"],
            priority=result["priority"],
            priority_status=result["priority_status"],
        )

    @app.post(
        "/predict/batch",
        response_model=BatchResponse,
        responses={422: {"description": "invalid request or model length violation"}},
        tags=["inference"],
    )
    def predict_batch(payload: BatchRequest) -> BatchResponse:
        """Categorize 1-100 tickets in one call."""
        predictor = predictor_or_503()
        texts = [ticket.text for ticket in payload.tickets]
        _enforce_model_limits(predictor, texts, batch=True)
        started = time.perf_counter()
        results = predictor.predict(texts)
        latency_ms = round((time.perf_counter() - started) * 1000, 3)
        log_event(
            "prediction",
            endpoint="/predict/batch",
            status="ok",
            model_version=predictor.model_version,
            batch_size=len(texts),
            latency_ms=latency_ms,
            categories=dict(Counter(result["category"]["label"] for result in results)),
            review_required=sum(1 for result in results if result["category"]["review_required"]),
            priority_status=predictor.priority_status,
        )
        return BatchResponse(
            model_version=predictor.model_version,
            results=[
                PredictResponse(
                    ticket_id=ticket.ticket_id,
                    model_version=predictor.model_version,
                    category=result["category"],
                    priority=result["priority"],
                    priority_status=result["priority_status"],
                )
                for ticket, result in zip(payload.tickets, results, strict=True)
            ],
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        errors = redact_validation_errors([dict(error) for error in exc.errors()])
        _log_rejected(request.url.path, 422, "invalid_request")
        return JSONResponse(status_code=422, content={"detail": errors})

    return app


app = create_app(
    model_dir=os.environ.get("MODEL_DIR", DEFAULT_MODEL_DIR),
    max_body_bytes=int(os.environ.get("MAX_BODY_BYTES", DEFAULT_MAX_BODY_BYTES)),
)


__all__ = ["app", "create_app", "log_event", "redact_validation_errors"]

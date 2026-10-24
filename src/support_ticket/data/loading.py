"""Load mapped columns from a local CSV or JSONL file.

CSV is read as strings (numeric-looking ticket IDs stay intact); JSONL keeps source types
and rejects non-string required values. No automatic dropping, imputation or label repair
happens here - validation reports problems instead.
"""

from __future__ import annotations

import csv
import json
from pathlib import Path
from typing import Any

from support_ticket.config import Config

REQUIRED_FIELDS = ("ticket_id", "ticket_text", "category")
OPTIONAL_FIELDS = ("priority", "created_at")


class DataLoadError(RuntimeError):
    """Raised when the source cannot be read or is missing mapped columns."""


def _canonical_mapping(config: Config) -> dict[str, str]:
    mapping = {
        "ticket_id": config.columns.ticket_id,
        "ticket_text": config.columns.ticket_text,
        "category": config.columns.category,
    }
    if config.columns.priority:
        mapping["priority"] = config.columns.priority
    if config.columns.created_at:
        mapping["created_at"] = config.columns.created_at
    return mapping


def _missing_columns(present: set[str], mapping: dict[str, str]) -> list[str]:
    return sorted(
        {field for field, source in mapping.items() if field in REQUIRED_FIELDS and source not in present}
    )


def _load_csv(path: Path, mapping: dict[str, str]) -> list[dict[str, Any]]:
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        if reader.fieldnames is None:
            raise DataLoadError(f"CSV file has no header row: {path}")
        header = [name.strip() for name in reader.fieldnames]
        if len(set(header)) != len(header):
            raise DataLoadError(f"CSV header contains duplicate column names: {path}")
        missing = _missing_columns(set(header), mapping)
        if missing:
            raise DataLoadError(f"CSV file {path} is missing mapped columns: {', '.join(missing)}")
        records: list[dict[str, Any]] = []
        for row in reader:
            record: dict[str, Any] = {}
            for field, source in mapping.items():
                value = row.get(source)
                record[field] = value if value is None else value
            records.append(record)
    return records


def _load_jsonl(path: Path, mapping: dict[str, str]) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as handle:
        for line_number, line in enumerate(handle, start=1):
            stripped = line.strip()
            if not stripped:
                continue
            try:
                payload = json.loads(stripped)
            except json.JSONDecodeError as exc:
                raise DataLoadError(f"{path}: line {line_number} is not valid JSON: {exc}") from exc
            if not isinstance(payload, dict):
                raise DataLoadError(f"{path}: line {line_number} is not a JSON object")
            missing = _missing_columns(set(payload), mapping)
            if missing:
                raise DataLoadError(
                    f"{path}: line {line_number} is missing mapped columns: {', '.join(missing)}"
                )
            record: dict[str, Any] = {}
            for field, source in mapping.items():
                value = payload.get(source)
                if value is not None and field in REQUIRED_FIELDS and not isinstance(value, str):
                    raise DataLoadError(
                        f"{path}: line {line_number} field {field!r} must be a string, "
                        f"got {type(value).__name__}"
                    )
                record[field] = value
            records.append(record)
    return records


def load_records(path: str | Path, config: Config | None = None) -> list[dict[str, Any]]:
    """Read mapped records from ``path`` (``.csv`` or ``.jsonl``)."""
    config = config or Config()
    source = Path(path)
    if not source.is_file():
        raise DataLoadError(f"data file not found: {source}")
    mapping = _canonical_mapping(config)
    suffix = source.suffix.lower()
    if suffix == ".csv":
        records = _load_csv(source, mapping)
    elif suffix in {".jsonl", ".ndjson"}:
        records = _load_jsonl(source, mapping)
    else:
        raise DataLoadError(f"unsupported data file type {suffix!r}; expected .csv or .jsonl")
    if not records:
        raise DataLoadError(f"data file contains no records: {source}")
    return records

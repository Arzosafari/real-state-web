"""Validation and data-quality reporting for mapped records.

Validation never mutates data: it reports what is wrong so a human can reconcile it.
Reports stay content-free (no ticket text, hashed identifiers only).
"""

from __future__ import annotations

import json
import statistics
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from support_ticket.config import Config
from support_ticket.data.grouping import (
    duplicate_text_groups,
    group_labels,
    group_records,
    hash_identifier,
    normalized_texts,
)
from support_ticket.features.text import TextNormalizer

MAX_EXAMPLE_GROUPS = 10


@dataclass
class ValidationReport:
    """Outcome of validating one dataset against the canonical contract."""

    dataset_id: str
    synthetic: bool
    rows: int
    ok: bool
    failures: list[str] = field(default_factory=list)
    counts: dict[str, int] = field(default_factory=dict)
    class_distribution: dict[str, int] = field(default_factory=dict)
    text_lengths: dict[str, float] = field(default_factory=dict)
    duplicate_groups: dict[str, Any] = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)

    def to_dict(self) -> dict[str, Any]:
        return {
            "dataset_id": self.dataset_id,
            "synthetic": self.synthetic,
            "rows": self.rows,
            "ok": self.ok,
            "failures": self.failures,
            "counts": self.counts,
            "class_distribution": self.class_distribution,
            "text_lengths": self.text_lengths,
            "duplicate_groups": self.duplicate_groups,
            "notes": self.notes,
        }


def _record_signature(record: dict[str, Any], fields: list[str]) -> str:
    payload = "|".join("" if record.get(name) is None else str(record.get(name)) for name in fields)
    return hash_identifier(payload, length=32)


def validate_records(
    records: list[dict[str, Any]],
    config: Config | None = None,
    normalizer: TextNormalizer | None = None,
) -> ValidationReport:
    """Validate records against the canonical contract and collect quality statistics."""
    config = config or Config()
    normalizer = normalizer or TextNormalizer(
        lowercase=config.normalization.lowercase,
        mask_identifiers=config.normalization.mask_identifiers,
    )
    failures: list[str] = []
    counts = Counter()

    mapped_fields = ["ticket_id", "ticket_text", "category"]
    if config.columns.priority:
        mapped_fields.append("priority")
    if config.columns.created_at:
        mapped_fields.append("created_at")

    ids: list[str] = []
    labels: list[str] = []
    lengths: list[int] = []
    signatures: Counter[str] = Counter()

    for position, record in enumerate(records, start=1):
        ticket_id = record.get("ticket_id")
        text = record.get("ticket_text")
        category = record.get("category")

        if not isinstance(ticket_id, str) or not ticket_id.strip():
            failures.append(f"row {position}: ticket_id must be a non-empty string")
            counts["invalid_ticket_id"] += 1
        else:
            ids.append(ticket_id)

        if not isinstance(text, str) or not text.strip():
            failures.append(f"row {position}: ticket_text must be a non-empty string")
            counts["blank_or_invalid_text"] += 1
        else:
            lengths.append(len(text))
            if len(text) > config.max_text_chars:
                failures.append(
                    f"row {position}: ticket_text exceeds max_text_chars "
                    f"({len(text)} > {config.max_text_chars})"
                )
                counts["oversized_text"] += 1

        if not isinstance(category, str) or not category.strip():
            failures.append(f"row {position}: category must be a non-empty string")
            counts["invalid_category"] += 1
        else:
            labels.append(category)
            if config.category_labels and category not in config.category_labels:
                failures.append(f"row {position}: category {category!r} is not in category_labels")
                counts["unknown_category"] += 1

        priority = record.get("priority")
        if config.priority_enabled:
            if not isinstance(priority, str) or not priority.strip():
                failures.append(
                    f"row {position}: priority is required and must be a non-empty string"
                )
                counts["missing_priority"] += 1
            elif config.priority_labels and priority not in config.priority_labels:
                failures.append(f"row {position}: priority {priority!r} is not in priority_labels")
                counts["unknown_priority"] += 1
        elif priority is not None and not isinstance(priority, str):
            failures.append(f"row {position}: priority must be a string when present")
            counts["invalid_priority"] += 1

        signatures[_record_signature(record, mapped_fields)] += 1

    repeated_ids = {ticket_id: count for ticket_id, count in Counter(ids).items() if count > 1}
    if repeated_ids:
        counts["repeated_ids"] = len(repeated_ids)
        failures.append(
            f"{len(repeated_ids)} repeated ticket_id value(s) require manual reconciliation "
            "(examples: "
            + ", ".join(sorted(hash_identifier(value) for value in repeated_ids)[:MAX_EXAMPLE_GROUPS])
            + ")"
        )

    groups = group_records(records, normalizer)
    _, labels_per_group = group_labels(records, groups)
    conflicting = {
        group: seen
        for group, seen in labels_per_group.items()
        if len(seen) > 1
    }
    if conflicting:
        counts["conflicting_groups"] = len(conflicting)
        examples = ", ".join(sorted(conflicting)[:MAX_EXAMPLE_GROUPS])
        failures.append(
            f"{len(conflicting)} normalized-text group(s) carry conflicting labels "
            f"({examples}); reconcile the labels before training because these rows stay together"
        )

    duplicates = Counter(signatures.values())
    exact_duplicate_rows = sum(count for signature, count in duplicates.items() if count > 1)
    repeated_group_rows = sum(len(rows) for rows in groups.values() if len(rows) > 1)

    counts["rows"] = len(records)
    counts["normalized_groups"] = len(groups)
    counts["exact_duplicate_rows"] = exact_duplicate_rows
    counts["rows_in_repeated_text_groups"] = repeated_group_rows
    counts["mapped_fields"] = len(mapped_fields)

    notes = [
        "duplicate text and normalized-text groups are reported separately from exact rows",
        "hashed identifiers in this report are not anonymization",
        "near duplicates, shared templates, customers or time windows still need manual audit",
    ]
    if config.synthetic:
        notes.append(
            "synthetic fixture: repeated templates make scores optimistic and not representative"
        )

    text_length_stats: dict[str, float] = {}
    if lengths:
        text_length_stats = {
            "min": float(min(lengths)),
            "median": float(statistics.median(lengths)),
            "mean": round(statistics.fmean(lengths), 2),
            "max": float(max(lengths)),
        }

    return ValidationReport(
        dataset_id=config.dataset_id,
        synthetic=config.synthetic,
        rows=len(records),
        ok=not failures,
        failures=failures,
        counts=dict(sorted(counts.items())),
        class_distribution=dict(sorted(Counter(labels).items())),
        text_lengths=text_length_stats,
        duplicate_groups={
            "exact_duplicate_rows": exact_duplicate_rows,
            "repeated_normalized_groups": len(duplicate_text_groups(groups)),
            "rows_in_repeated_groups": repeated_group_rows,
            "conflicting_label_groups": sorted(conflicting)[:MAX_EXAMPLE_GROUPS],
        },
        notes=notes,
    )


def write_validation_report(report: ValidationReport, out_dir: str | Path) -> Path:
    directory = Path(out_dir)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / "quality.json"
    path.write_text(json.dumps(report.to_dict(), indent=2, sort_keys=True), encoding="utf-8")
    return path


def normalized_lengths(
    records: list[dict[str, Any]], normalizer: TextNormalizer | None = None
) -> list[int]:
    return [len(text) for text in normalized_texts(records, normalizer)]

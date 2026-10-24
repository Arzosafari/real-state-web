"""Normalized-text grouping used to keep leakage out of the splits."""

from __future__ import annotations

import hashlib
from collections import defaultdict
from typing import Any

from support_ticket.features.text import TextNormalizer


def hash_identifier(value: str, length: int = 16) -> str:
    """Stable short hash used in manifests and reports instead of raw identifiers."""
    return hashlib.sha256(value.encode("utf-8")).hexdigest()[:length]


def group_id_for(normalized_text: str) -> str:
    """Group identifier of an already normalized text."""
    return hash_identifier(normalized_text)


def normalized_texts(
    records: list[dict[str, Any]], normalizer: TextNormalizer | None = None
) -> list[str]:
    normalizer = normalizer or TextNormalizer()
    return [normalizer.normalize(record.get("ticket_text") or "") for record in records]


def group_records(
    records: list[dict[str, Any]], normalizer: TextNormalizer | None = None
) -> dict[str, list[int]]:
    """Map normalized-text group id -> row indices.

    Texts that are identical after normalization never cross a split boundary, so a
    repeated template cannot appear in both train and test.
    """
    groups: dict[str, list[int]] = defaultdict(list)
    for index, text in enumerate(normalized_texts(records, normalizer)):
        groups[group_id_for(text)].append(index)
    return dict(groups)


def group_labels(
    records: list[dict[str, Any]],
    groups: dict[str, list[int]],
) -> tuple[dict[str, str], dict[str, list[str]]]:
    """Return the dominant label per group and every label seen per group."""
    dominant: dict[str, str] = {}
    seen: dict[str, list[str]] = {}
    for group, rows in groups.items():
        labels = sorted({str(records[row].get("category")) for row in rows})
        seen[group] = labels
        dominant[group] = labels[0]
    return dominant, seen


def duplicate_text_groups(groups: dict[str, list[int]]) -> dict[str, int]:
    """Groups containing more than one row (repeated or normalized-duplicate text)."""
    return {group: len(rows) for group, rows in groups.items() if len(rows) > 1}

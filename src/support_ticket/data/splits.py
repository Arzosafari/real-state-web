"""Deterministic, leakage-aware splits at unique normalized-text group level.

Rows that share an exact or normalized text form one group; a group is never split across
train/validation/test. Splits are stratified on category so every split keeps every class.
"""

from __future__ import annotations

import random
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from typing import Any

from support_ticket.config import Config
from support_ticket.data.grouping import group_labels, group_records
from support_ticket.features.text import TextNormalizer


class SplitError(RuntimeError):
    """Raised when the dataset cannot support the requested grouped, stratified splits."""


@dataclass
class SplitResult:
    """Row indices per split plus the group ids that produced them."""

    seed: int
    rows: dict[str, list[int]] = field(default_factory=dict)
    groups: dict[str, list[str]] = field(default_factory=dict)
    group_labels: dict[str, str] = field(default_factory=dict)

    def rows_for(self, split: str) -> list[int]:
        return self.rows.get(split, [])


SPLIT_NAMES = ("train", "validation", "test")


def _split_sizes(total: int, config: Config) -> tuple[int, int, int]:
    train = round(config.splits.train * total)
    validation = round(config.splits.validation * total)
    test = total - train - validation
    return train, validation, test


def make_splits(
    records: list[dict[str, Any]],
    config: Config | None = None,
    normalizer: TextNormalizer | None = None,
) -> SplitResult:
    """Assign every row to train/validation/test, stratified by category over groups."""
    config = config or Config()
    normalizer = normalizer or TextNormalizer(
        lowercase=config.normalization.lowercase,
        mask_identifiers=config.normalization.mask_identifiers,
    )
    if not records:
        raise SplitError("no records to split")

    groups = group_records(records, normalizer)
    dominant, seen = group_labels(records, groups)
    conflicting = sorted(group for group, labels in seen.items() if len(labels) > 1)
    if conflicting:
        raise SplitError(
            f"{len(conflicting)} normalized-text group(s) carry conflicting labels "
            f"(examples: {', '.join(conflicting[:5])}); reconcile them before splitting"
        )

    by_label: dict[str, list[str]] = defaultdict(list)
    for group, label in dominant.items():
        by_label[label].append(group)

    if len(by_label) < 2:
        raise SplitError(
            f"at least two categories are required, found {len(by_label)}: {sorted(by_label)}"
        )

    for label, group_ids in sorted(by_label.items()):
        if len(group_ids) < config.min_groups_per_class:
            raise SplitError(
                f"category {label!r} has {len(group_ids)} independent normalized-text group(s); "
                f"at least {config.min_groups_per_class} are required for stratified grouped splits"
            )

    assignment: dict[str, list[str]] = {name: [] for name in SPLIT_NAMES}
    for label, group_ids in sorted(by_label.items()):
        ordered = sorted(group_ids)
        rng = random.Random(f"{config.seed}:{label}")
        rng.shuffle(ordered)
        train, validation, test = _split_sizes(len(ordered), config)
        if min(train, validation, test) < 1:
            raise SplitError(
                f"category {label!r} cannot be split into non-empty train/validation/test parts "
                f"from {len(ordered)} group(s) with fractions "
                f"{config.splits.train}/{config.splits.validation}/{config.splits.test}"
            )
        assignment["train"].extend(ordered[:train])
        assignment["validation"].extend(ordered[train : train + validation])
        assignment["test"].extend(ordered[train + validation : train + validation + test])

    result = SplitResult(seed=config.seed, group_labels=dominant)
    for name in SPLIT_NAMES:
        group_ids = sorted(assignment[name])
        rows: list[int] = []
        for group in group_ids:
            rows.extend(groups[group])
        result.groups[name] = group_ids
        result.rows[name] = sorted(rows)

    _assert_coverage(records, result, config)
    return result


def _assert_coverage(records: list[dict[str, Any]], result: SplitResult, config: Config) -> None:
    for name in SPLIT_NAMES:
        labels = Counter(str(records[row]["category"]) for row in result.rows[name])
        missing = sorted(set(config.category_labels) - set(labels)) if config.category_labels else []
        expected = sorted(set(labels) | set(config.category_labels))
        if missing or set(labels) != set(expected):
            raise SplitError(
                f"split {name!r} does not cover every category: present={sorted(labels)} "
                f"missing={missing}"
            )
    if config.priority_enabled:
        for name in SPLIT_NAMES:
            priorities = Counter(str(records[row].get("priority")) for row in result.rows[name])
            if set(priorities) != set(config.priority_labels):
                raise SplitError(
                    f"priority labels are not fully covered by split {name!r}: "
                    f"present={sorted(priorities)}, expected={sorted(config.priority_labels)}"
                )


def split_manifest(
    result: SplitResult,
    records: list[dict[str, Any]],
    config: Config | None = None,
) -> dict[str, Any]:
    """Reproducible, content-free description of a split assignment."""
    config = config or Config()
    manifest: dict[str, Any] = {
        "dataset_id": config.dataset_id,
        "synthetic": config.synthetic,
        "seed": result.seed,
        "fractions": {
            "train": config.splits.train,
            "validation": config.splits.validation,
            "test": config.splits.test,
        },
        "grouping": "normalized ticket_text (NFKC, whitespace, optional lowercase/identifier masking)",
        "splits": {},
        "notes": [
            "group ids are hashes of normalized text and are not anonymization",
            "training recomputes the same splits from the input and seed; compare group ids to verify",
        ],
    }
    for name in SPLIT_NAMES:
        rows = result.rows[name]
        per_class = Counter(result.group_labels[group] for group in result.groups[name])
        manifest["splits"][name] = {
            "rows": len(rows),
            "groups": len(result.groups[name]),
            "groups_per_class": dict(sorted(per_class.items())),
            "class_distribution": dict(
                sorted(Counter(str(records[row]["category"]) for row in rows).items())
            ),
            "group_ids": result.groups[name],
        }
    return manifest

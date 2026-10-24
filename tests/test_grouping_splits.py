"""Grouping and split tests."""

from __future__ import annotations

import json
from collections import Counter

import pytest

from support_ticket.config import Config
from support_ticket.data.grouping import group_id_for, group_records, hash_identifier
from support_ticket.data.splits import SplitError, make_splits, split_manifest
from support_ticket.data.synthetic import make_fixture
from support_ticket.features.text import TextNormalizer


def test_group_id_is_stable_and_not_the_text() -> None:
    text = "Login fails again"
    assert group_id_for(text) == group_id_for(text)
    assert group_id_for(text) != text
    assert len(hash_identifier("value")) == 16


def test_case_and_whitespace_variants_share_a_group() -> None:
    records = [
        {"ticket_id": "a", "ticket_text": "Login   FAILS", "category": "Account Access"},
        {"ticket_id": "b", "ticket_text": " login fails ", "category": "Account Access"},
    ]
    groups = group_records(records, TextNormalizer())
    assert len(groups) == 1
    assert sorted(next(iter(groups.values()))) == [0, 1]


def test_splits_are_deterministic_and_disjoint(fixture_records) -> None:
    config = Config()
    first = make_splits(fixture_records, config)
    second = make_splits(fixture_records, config)
    assert first.rows == second.rows
    assert first.groups == second.groups

    train, validation, test = (
        set(first.rows_for("train")),
        set(first.rows_for("validation")),
        set(first.rows_for("test")),
    )
    assert not train & validation
    assert not train & test
    assert not validation & test
    assert len(train) + len(validation) + len(test) == len(fixture_records)


def test_no_normalized_group_crosses_splits(fixture_records) -> None:
    split = make_splits(fixture_records, Config())
    groups = group_records(fixture_records, TextNormalizer())
    group_of = {row: group for group, rows in groups.items() for row in rows}
    for name, rows in split.rows.items():
        assert len({group_of[row] for row in rows}) == len(rows), name


def test_every_split_covers_every_category(fixture_records) -> None:
    split = make_splits(fixture_records, Config())
    expected = {"Account Access", "Billing", "Technical Issue"}
    for name, rows in split.rows.items():
        labels = {fixture_records[row]["category"] for row in rows}
        assert labels == expected, name
        assert len(rows) == 18, name


def test_split_rows_and_groups_counts(fixture_records) -> None:
    split = make_splits(fixture_records, Config())
    assert {name: len(split.rows_for(name)) for name in ("train", "validation", "test")} == {
        "train": 54,
        "validation": 18,
        "test": 18,
    }
    assert {name: len(split.groups[name]) for name in ("train", "validation", "test")} == {
        "train": 18,
        "validation": 6,
        "test": 6,
    }


def test_too_few_groups_per_class_is_rejected() -> None:
    records = [
        {"ticket_id": f"{label}-{index}", "ticket_text": f"{label} issue {index}", "category": label}
        for label in ("Account Access", "Billing", "Technical Issue")
        for index in range(4)
    ]
    with pytest.raises(SplitError, match="independent normalized-text group"):
        make_splits(records, Config())


def test_single_class_is_rejected() -> None:
    records = [
        {"ticket_id": f"a-{index}", "ticket_text": f"login issue {index}", "category": "Account Access"}
        for index in range(20)
    ]
    with pytest.raises(SplitError, match="at least two categories"):
        make_splits(records, Config())


def test_manifest_is_content_free(fixture_records) -> None:
    manifest = split_manifest(make_splits(fixture_records, Config()), fixture_records, Config())
    serialized = json.dumps(manifest).lower()
    assert "login" not in serialized
    assert "invoice" not in serialized
    assert "synthetic-0001" not in serialized
    assert len(manifest["splits"]["test"]["group_ids"]) == 6
    assert manifest["splits"]["test"]["groups_per_class"] == {
        "Account Access": 2,
        "Billing": 2,
        "Technical Issue": 2,
    }


def test_priority_labels_must_cover_every_split(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    for index, record in enumerate(records):
        record["priority"] = "high"
    records[0]["priority"] = "low"  # a single group, so it cannot reach every split
    config = Config(
        columns={"priority": "priority"},
        priority_enabled=True,
        priority_labels=["high", "low"],
        priority_labels_verified=True,
    )
    with pytest.raises(SplitError, match="priority labels are not fully covered"):
        make_splits(records, config)


def test_priority_uses_the_same_splits_as_category(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    for index, record in enumerate(records):
        record["priority"] = "high" if index % 2 else "low"
    config = Config(
        columns={"priority": "priority"},
        priority_enabled=True,
        priority_labels=["high", "low"],
        priority_labels_verified=True,
    )
    split = make_splits(records, config)
    assert sum(len(rows) for rows in split.rows.values()) == len(records)
    counts = Counter(record["priority"] for record in records)
    assert set(counts) == {"high", "low"}

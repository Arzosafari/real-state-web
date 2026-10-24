"""Synthetic fixture tests."""

from __future__ import annotations

from collections import Counter

from support_ticket.data.grouping import group_records
from support_ticket.data.synthetic import make_fixture
from support_ticket.features.text import TextNormalizer


def test_fixture_shape_matches_the_documented_demonstration() -> None:
    records = make_fixture(90)
    assert len(records) == 90
    assert Counter(record["category"] for record in records) == {
        "Account Access": 30,
        "Billing": 30,
        "Technical Issue": 30,
    }
    assert len({record["ticket_id"] for record in records}) == 90


def test_fixture_rows_are_unique_after_normalization() -> None:
    records = make_fixture(90)
    assert len(group_records(records, TextNormalizer())) == 90


def test_fixture_repeats_templates_without_repeating_normalized_text() -> None:
    records = make_fixture(90)
    texts = [record["ticket_text"] for record in records]
    assert len(set(texts)) == len(texts)
    stems = Counter(" ".join(text.split()[:-1]) for text in texts)
    assert max(stems.values()) == 5

"""Validation and data-quality report tests."""

from __future__ import annotations

import json
from pathlib import Path

from support_ticket.config import Config
from support_ticket.data.synthetic import make_fixture
from support_ticket.data.validation import validate_records, write_validation_report


def test_clean_fixture_passes_and_is_reported(fixture_records) -> None:
    report = validate_records(fixture_records, Config())
    assert report.ok
    assert report.rows == 90
    assert report.class_distribution == {"Account Access": 30, "Billing": 30, "Technical Issue": 30}
    assert report.counts["normalized_groups"] == 90
    assert report.counts["exact_duplicate_rows"] == 0
    assert report.text_lengths["max"] > 0


def test_blank_text_fails(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    records[0]["ticket_text"] = "   "
    report = validate_records(records, Config())
    assert not report.ok
    assert report.counts["blank_or_invalid_text"] == 1


def test_repeated_ids_fail(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    records[1]["ticket_id"] = records[0]["ticket_id"]
    report = validate_records(records, Config())
    assert not report.ok
    assert report.counts["repeated_ids"] == 1


def test_oversized_text_fails(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    records[0]["ticket_text"] = "x" * 20
    report = validate_records(records, Config(max_text_chars=10))
    assert not report.ok
    assert report.counts["oversized_text"] == 1


def test_unknown_category_fails_with_allowlist(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    records[0]["category"] = "Refund Urgency"
    report = validate_records(records, Config())
    assert not report.ok
    assert report.counts["unknown_category"] == 1


def test_conflicting_labels_in_one_group_are_flagged(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    records[1]["ticket_text"] = records[0]["ticket_text"]
    records[1]["category"] = "Billing"
    report = validate_records(records, Config())
    assert not report.ok
    assert report.counts["conflicting_groups"] == 1


def test_exact_duplicate_rows_are_counted_not_dropped(fixture_records) -> None:
    records = [dict(record) for record in fixture_records]
    duplicate = dict(records[0])
    duplicate["ticket_id"] = "synthetic-copy"
    records.append(duplicate)
    report = validate_records(records, Config())
    assert report.ok
    assert report.counts["exact_duplicate_rows"] == 2
    assert report.counts["rows_in_repeated_text_groups"] == 2


def test_report_is_written_and_contains_no_ticket_text(fixture_records, tmp_path: Path) -> None:
    report = validate_records(fixture_records, Config())
    path = write_validation_report(report, tmp_path / "validation")
    payload = json.loads(path.read_text(encoding="utf-8"))
    assert payload["rows"] == 90
    serialized = json.dumps(payload).lower()
    assert "cannot log in" not in serialized
    assert "synthetic-0001" not in serialized

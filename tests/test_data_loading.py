"""Data loading tests."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from support_ticket.config import Config
from support_ticket.data.loading import DataLoadError, load_records


def write_csv(path: Path, text: str) -> Path:
    path.write_text(text, encoding="utf-8")
    return path


def test_csv_loads_numeric_ids_as_strings(tmp_path: Path) -> None:
    path = write_csv(
        tmp_path / "tickets.csv",
        "ticket_id,ticket_text,category\n1001,Login fails,Account Access\n",
    )
    records = load_records(path, Config())
    assert records[0]["ticket_id"] == "1001"
    assert isinstance(records[0]["ticket_id"], str)


def test_missing_required_column_raises(tmp_path: Path) -> None:
    path = write_csv(tmp_path / "tickets.csv", "ticket_id,ticket_text\n1,hello\n")
    with pytest.raises(DataLoadError, match="missing mapped columns"):
        load_records(path, Config())


def test_column_mapping_and_unmapped_columns(tmp_path: Path) -> None:
    path = write_csv(
        tmp_path / "tickets.csv",
        "id,body,topic,customer_email\n1,Login fails,Account Access,someone@example.com\n",
    )
    config = Config(columns={"ticket_id": "id", "ticket_text": "body", "category": "topic"})
    records = load_records(path, config)
    assert records[0] == {"ticket_id": "1", "ticket_text": "Login fails", "category": "Account Access"}


def test_jsonl_keeps_types_and_rejects_non_string_required_values(tmp_path: Path) -> None:
    good = tmp_path / "tickets.jsonl"
    good.write_text(
        json.dumps({"ticket_id": "1", "ticket_text": "hello", "category": "Billing"}) + "\n",
        encoding="utf-8",
    )
    records = load_records(good, Config())
    assert records[0]["ticket_text"] == "hello"

    bad = tmp_path / "bad.jsonl"
    bad.write_text(
        json.dumps({"ticket_id": 1, "ticket_text": "hello", "category": "Billing"}) + "\n",
        encoding="utf-8",
    )
    with pytest.raises(DataLoadError, match="must be a string"):
        load_records(bad, Config())


def test_unsupported_suffix_raises(tmp_path: Path) -> None:
    path = tmp_path / "tickets.txt"
    path.write_text("ticket_id,ticket_text,category\n1,hello,Billing\n", encoding="utf-8")
    with pytest.raises(DataLoadError, match="unsupported data file type"):
        load_records(path, Config())


def test_missing_file_raises(tmp_path: Path) -> None:
    with pytest.raises(DataLoadError, match="not found"):
        load_records(tmp_path / "absent.csv", Config())


def test_empty_file_raises(tmp_path: Path) -> None:
    path = write_csv(tmp_path / "tickets.csv", "ticket_id,ticket_text,category\n")
    with pytest.raises(DataLoadError, match="no records"):
        load_records(path, Config())

"""Training, selection and report tests."""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

from support_ticket.config import Config
from support_ticket.data.synthetic import make_fixture
from support_ticket.models.training import TrainingError, train_experiment

MODEL_VERSION_PATTERN = re.compile(r"^\d{8}T\d{12}Z-[0-9a-f]{8}$")


def test_selection_uses_validation_macro_f1_and_documented_tie_break(trained_run) -> None:
    evaluation = trained_run.evaluation
    assert evaluation["selected_candidate"] == "logistic_regression"
    assert evaluation["candidates"]["majority"]["validation"]["macro_f1"] == round(1 / 6, 6)
    assert evaluation["candidates"]["logistic_regression"]["validation"]["macro_f1"] == 1.0
    assert evaluation["candidates"]["linear_svm"]["validation"]["macro_f1"] == 1.0


def test_held_out_test_evaluation_matches_the_synthetic_expectation(trained_run) -> None:
    metrics = trained_run.evaluation["test_metrics"]
    assert metrics["accuracy"] == 1.0
    assert metrics["macro_f1"] == 1.0
    assert metrics["weighted_f1"] == 1.0
    assert metrics["confusion_matrix"] == [[6, 0, 0], [0, 6, 0], [0, 0, 6]]


def test_artifact_and_reports_are_written(trained_run) -> None:
    artifact = Path(trained_run.artifact_dir)
    assert (artifact / "metadata.json").is_file()
    assert (artifact / "category_pipeline.joblib").is_file()
    for name in ("quality.json", "split.json", "evaluation.json", "errors.json"):
        assert (artifact.parent / name).is_file()


def test_model_version_format_and_metadata(trained_run) -> None:
    assert MODEL_VERSION_PATTERN.match(trained_run.model_version)
    payload = json.loads((Path(trained_run.artifact_dir) / "metadata.json").read_text())
    assert payload["model_version"] == trained_run.model_version
    assert payload["dataset_id"] == "synthetic-demo"
    assert payload["synthetic"] is True
    assert payload["labels"] == ["Account Access", "Billing", "Technical Issue"]
    assert payload["review_policy"] == {"always_review": True, "review_threshold": 0.7}
    assert payload["limits"]["max_text_chars"] == 10000
    assert payload["priority"]["enabled"] is False
    assert payload["warnings"]


def test_validation_errors_are_content_free(trained_run) -> None:
    errors = trained_run.errors
    assert errors["errors"] == 0
    assert errors["error_pairs"] == {}
    assert errors["notes"]


def test_training_refuses_invalid_data(tmp_path: Path) -> None:
    records = make_fixture(90)
    records[0]["ticket_text"] = ""
    with pytest.raises(TrainingError, match="data validation failed"):
        train_experiment(records, Config(), tmp_path / "invalid")


def test_quality_and_split_reports_record_the_run(trained_run) -> None:
    assert trained_run.quality["ok"] is True
    assert trained_run.split["seed"] == 42
    assert trained_run.evaluation["split_rows"] == {
        "train": 54,
        "validation": 18,
        "test": 18,
    }

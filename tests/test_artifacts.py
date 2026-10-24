"""Artifact IO and version-consistency tests."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

from support_ticket.models.artifacts import (
    ARTIFACT_SCHEMA_VERSION,
    ArtifactError,
    file_checksum,
    load_artifact,
    load_metadata,
    save_artifact,
)


@pytest.fixture
def fitted_pipeline() -> Pipeline:
    texts = ["login fails", "password reset", "invoice charge", "refund payment"]
    labels = ["Account Access", "Account Access", "Billing", "Billing"]
    pipeline = Pipeline([("features", TfidfVectorizer()), ("model", LogisticRegression())])
    return pipeline.fit(texts, labels)


def test_save_and_load_round_trip(tmp_path: Path, fitted_pipeline) -> None:
    metadata = {"model_version": "20260101T000000000000Z-abcdef01", "labels": ["Account Access", "Billing"]}
    path = save_artifact(tmp_path / "artifact", fitted_pipeline, metadata)
    loaded = load_artifact(path)
    assert loaded.metadata["artifact_schema_version"] == ARTIFACT_SCHEMA_VERSION
    assert loaded.priority_pipeline is None
    assert list(loaded.category_pipeline.predict(["invoice charge"])) == ["Billing"]


def test_checksums_are_recorded(tmp_path: Path, fitted_pipeline) -> None:
    path = save_artifact(
        tmp_path / "artifact",
        fitted_pipeline,
        {"labels": ["Account Access", "Billing"]},
    )
    metadata = load_metadata(path)
    recorded = metadata["file_checksums"]["category_pipeline.joblib"]
    assert recorded == file_checksum(path / "category_pipeline.joblib")


def test_missing_artifact_raises(tmp_path: Path) -> None:
    with pytest.raises(ArtifactError, match="not found"):
        load_artifact(tmp_path / "absent")


def test_unsupported_schema_version_raises(tmp_path: Path) -> None:
    path = tmp_path / "artifact"
    path.mkdir()
    (path / "metadata.json").write_text(
        json.dumps({"artifact_schema_version": 99}), encoding="utf-8"
    )
    with pytest.raises(ArtifactError, match="schema version"):
        load_metadata(path)


def test_scikit_learn_version_mismatch_raises(tmp_path: Path) -> None:
    path = tmp_path / "artifact"
    path.mkdir()
    (path / "metadata.json").write_text(
        json.dumps(
            {
                "artifact_schema_version": ARTIFACT_SCHEMA_VERSION,
                "environment": {"scikit_learn": "0.0.1"},
            }
        ),
        encoding="utf-8",
    )
    with pytest.raises(ArtifactError, match="retrain"):
        load_metadata(path)


def test_inconsistent_labels_raise(artifact_dir: Path, tmp_path: Path) -> None:
    copy = tmp_path / "artifact-copy"
    shutil.copytree(artifact_dir, copy)
    metadata_path = copy / "metadata.json"
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    metadata["labels"] = ["Only Label"]
    metadata_path.write_text(json.dumps(metadata), encoding="utf-8")
    with pytest.raises(ArtifactError, match="labels do not match"):
        load_artifact(copy)

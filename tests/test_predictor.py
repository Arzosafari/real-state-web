"""Predictor tests (framework-independent inference and review policy)."""

from __future__ import annotations

import pytest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

from support_ticket.models.predict import Predictor, predict_with_scores


def test_predict_returns_category_with_conservative_review(artifact_dir) -> None:
    predictor = Predictor(artifact_dir)
    result = predictor.predict(["I cannot login to my account"])[0]
    category = result["category"]
    assert category["label"] in predictor.labels
    assert category["score_type"] == "uncalibrated_probability"
    assert 0.0 <= category["score"] <= 1.0
    assert category["review_required"] is True
    assert category["review_reason"] == "conservative_policy"
    assert result["priority"] is None
    assert result["priority_status"] == "unavailable"


def test_predictor_exposes_limits_and_version(artifact_dir) -> None:
    predictor = Predictor(artifact_dir)
    assert predictor.limits == {
        "max_text_chars": 10000,
        "max_batch_size": 100,
        "max_ticket_id_chars": 128,
    }
    assert predictor.model_version
    assert predictor.synthetic is True
    probe = predictor.probe()
    assert probe["ok"] is True
    assert probe["model_version"] == predictor.model_version


def test_oversized_text_is_rejected(artifact_dir) -> None:
    predictor = Predictor(artifact_dir)
    with pytest.raises(ValueError, match="length limit"):
        predictor.predict(["x" * 10001])


def test_empty_batch_is_rejected(artifact_dir) -> None:
    with pytest.raises(ValueError, match="at least one text"):
        Predictor(artifact_dir).predict([])


def test_predict_with_scores_supports_probability_and_margin() -> None:
    texts = ["login fails", "password reset", "invoice charge", "refund payment"]
    labels = ["Account Access", "Account Access", "Billing", "Billing"]
    probability_pipeline = Pipeline(
        [("features", TfidfVectorizer()), ("model", LogisticRegression())]
    ).fit(texts, labels)
    predicted, scores = predict_with_scores(probability_pipeline, "uncalibrated_probability", texts)
    assert predicted == labels
    assert all(0.0 <= score <= 1.0 for score in scores)

    margin_pipeline = Pipeline(
        [("features", TfidfVectorizer()), ("model", LinearSVC())]
    ).fit(texts, labels)
    predicted_margin, margins = predict_with_scores(margin_pipeline, "decision_function", texts)
    assert predicted_margin == labels
    assert all(margin > 0 for margin in margins)

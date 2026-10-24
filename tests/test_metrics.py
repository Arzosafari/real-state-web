"""Metric tests."""

from __future__ import annotations

import pytest

from support_ticket.models.metrics import classification_metrics

LABELS = ["Account Access", "Billing", "Technical Issue"]


def test_perfect_predictions_score_one() -> None:
    y_true = LABELS * 2
    metrics = classification_metrics(y_true, y_true, LABELS)
    assert metrics["accuracy"] == 1.0
    assert metrics["macro_f1"] == 1.0
    assert metrics["weighted_f1"] == 1.0
    assert metrics["confusion_matrix"] == [[2, 0, 0], [0, 2, 0], [0, 0, 2]]


def test_majority_floor_is_a_meaningful_baseline() -> None:
    y_true = LABELS * 6
    y_pred = ["Account Access"] * len(y_true)
    metrics = classification_metrics(y_true, y_pred, LABELS)
    assert metrics["accuracy"] == round(6 / 18, 6)
    assert metrics["macro_f1"] == round(1 / 6, 6)
    assert metrics["per_class"]["Billing"]["recall"] == 0.0
    assert metrics["per_class"]["Account Access"]["recall"] == 1.0


def test_confusion_matrix_follows_the_label_order() -> None:
    metrics = classification_metrics(["Billing"], ["Technical Issue"], LABELS)
    assert metrics["confusion_matrix"] == [[0, 0, 0], [0, 0, 1], [0, 0, 0]]


def test_empty_split_is_rejected() -> None:
    with pytest.raises(ValueError):
        classification_metrics([], [], LABELS)


def test_mismatched_lengths_are_rejected() -> None:
    with pytest.raises(ValueError):
        classification_metrics(["Billing"], [], LABELS)

"""Non-interactive quality plots (category distribution, text lengths)."""

from __future__ import annotations

from collections import Counter
from pathlib import Path

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402 - backend must be set before pyplot


def plot_category_distribution(
    class_distribution: dict[str, int], path: str | Path
) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    labels = list(class_distribution)
    counts = [class_distribution[label] for label in labels]
    figure, axis = plt.subplots(figsize=(7, 4))
    axis.bar(labels, counts, color="#3b6ea5")
    axis.set_title("Rows per category")
    axis.set_ylabel("rows")
    axis.tick_params(axis="x", rotation=15)
    figure.tight_layout()
    figure.savefig(destination, dpi=120)
    plt.close(figure)
    return destination


def plot_text_lengths(lengths: list[int], path: str | Path) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    figure, axis = plt.subplots(figsize=(7, 4))
    axis.hist(lengths, bins=min(20, max(5, len(set(lengths)))), color="#7a5ea5")
    axis.set_title("Ticket text length (characters)")
    axis.set_xlabel("characters")
    axis.set_ylabel("rows")
    figure.tight_layout()
    figure.savefig(destination, dpi=120)
    plt.close(figure)
    return destination


def plot_validation_errors(error_counts: Counter[tuple[str, str]], path: str | Path) -> Path:
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    figure, axis = plt.subplots(figsize=(7, 4))
    if error_counts:
        labels = [f"{true} -> {pred}" for true, pred in error_counts]
        counts = list(error_counts.values())
        axis.barh(labels, counts, color="#a5533b")
        axis.set_xlabel("examples")
    else:
        axis.text(0.5, 0.5, "no validation errors", ha="center", va="center")
        axis.set_axis_off()
    axis.set_title("Validation errors by label pair")
    figure.tight_layout()
    figure.savefig(destination, dpi=120)
    plt.close(figure)
    return destination

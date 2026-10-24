"""Configuration tests."""

from __future__ import annotations

from pathlib import Path

import pytest

from support_ticket.config import Config, ConfigurationError, load_config


def test_defaults_are_synthetic_and_conservative() -> None:
    config = Config()
    assert config.synthetic is True
    assert config.review.always_review is True
    assert config.priority_enabled is False
    assert config.seed == 42


def test_load_config_reads_yaml(tmp_path: Path) -> None:
    path = tmp_path / "config.yaml"
    path.write_text(
        """
dataset_id: reviewed-source
source_license: CC-BY-4.0
synthetic: false
seed: 7
columns:
  ticket_id: id
  ticket_text: body
  category: topic
review:
  always_review: false
  review_threshold: 0.9
""",
        encoding="utf-8",
    )
    config = load_config(path)
    assert config.dataset_id == "reviewed-source"
    assert config.synthetic is False
    assert config.columns.ticket_id == "id"
    assert config.review.always_review is False


def test_unknown_config_field_is_rejected(tmp_path: Path) -> None:
    path = tmp_path / "config.yaml"
    path.write_text("dataset_id: x\nunexpected_field: 1\n", encoding="utf-8")
    with pytest.raises(ConfigurationError):
        load_config(path)


def test_split_fractions_must_sum_to_one() -> None:
    with pytest.raises(ValueError):
        Config(splits={"train": 0.7, "validation": 0.2, "test": 0.2})


def test_priority_requires_verified_labels() -> None:
    with pytest.raises(ValueError):
        Config(priority_enabled=True, priority_labels=["high", "low"])
    with pytest.raises(ValueError):
        Config(priority_enabled=True, priority_labels=["high"], priority_labels_verified=True)
    assert Config(
        priority_enabled=True, priority_labels=["high", "low"], priority_labels_verified=True
    ).priority_enabled


def test_missing_config_file_raises() -> None:
    with pytest.raises(ConfigurationError):
        load_config("configs/does-not-exist.yaml")


def test_config_hash_tracks_content() -> None:
    assert Config().config_hash() != Config(seed=43).config_hash()


def test_ngram_range_must_be_ordered() -> None:
    with pytest.raises(ValueError):
        Config(features={"word_ngram_range": [3, 1]})

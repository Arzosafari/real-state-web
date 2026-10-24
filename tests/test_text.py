"""Text normalization tests."""

from __future__ import annotations

import pytest

from support_ticket.features.text import NormalizeTransformer, TextNormalizer


def test_normalize_collapses_whitespace_and_lowercases() -> None:
    normalizer = TextNormalizer()
    assert normalizer.normalize("  Login   FAILS\n\nagain  ") == "login fails again"


def test_normalize_applies_nfkc() -> None:
    normalizer = TextNormalizer()
    assert normalizer.normalize("ＴＩＣＫＥＴ ﬀ") == "ticket ff"


def test_normalize_masks_emails_and_long_numbers() -> None:
    normalizer = TextNormalizer()
    normalized = normalizer.normalize("Write to agent@example.com about order 123456789")
    assert "<email>" in normalized
    assert "<number>" in normalized
    assert "agent@example.com" not in normalized
    assert "123456789" not in normalized


def test_lowercase_and_masking_can_be_disabled() -> None:
    normalizer = TextNormalizer(lowercase=False, mask_identifiers=False)
    assert normalizer.normalize("Order 123456789") == "Order 123456789"


def test_normalizer_round_trips_through_dict() -> None:
    normalizer = TextNormalizer(lowercase=False, mask_identifiers=True)
    assert TextNormalizer.from_dict(normalizer.to_dict()) == normalizer


def test_normalizer_rejects_non_string() -> None:
    with pytest.raises(TypeError):
        TextNormalizer().normalize(42)  # type: ignore[arg-type]


def test_normalize_transformer_is_usable_in_a_pipeline() -> None:
    transformer = NormalizeTransformer(TextNormalizer())
    assert transformer.fit(["x"]).transform(["  HELLO   World "]) == ["hello world"]

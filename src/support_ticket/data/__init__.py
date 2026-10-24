"""Data loading, validation, grouping, plots and the synthetic fixture."""

from support_ticket.data.grouping import (
    group_id_for,
    group_records,
    hash_identifier,
)
from support_ticket.data.loading import DataLoadError, load_records
from support_ticket.data.splits import SplitError, SplitResult, make_splits, split_manifest
from support_ticket.data.synthetic import make_fixture, write_fixture
from support_ticket.data.validation import ValidationReport, validate_records

__all__ = [
    "DataLoadError",
    "SplitError",
    "SplitResult",
    "ValidationReport",
    "group_id_for",
    "group_records",
    "hash_identifier",
    "load_records",
    "make_fixture",
    "make_splits",
    "split_manifest",
    "validate_records",
    "write_fixture",
]

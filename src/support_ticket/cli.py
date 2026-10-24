"""Command line workflows: fixture, validation, splits, training, inference, artifact IO.

Every workflow runs from the repository root. Report commands require a new or empty
output directory so experiment history is never overwritten.
"""

from __future__ import annotations

import argparse
import json
import sys
import tarfile
from collections import Counter
from pathlib import Path
from typing import Any

from support_ticket import __version__
from support_ticket.config import Config, ConfigurationError, load_config
from support_ticket.data.loading import DataLoadError, load_records
from support_ticket.data.plots import (
    plot_category_distribution,
    plot_text_lengths,
    plot_validation_errors,
)
from support_ticket.data.splits import SplitError, make_splits, split_manifest
from support_ticket.data.synthetic import write_fixture
from support_ticket.data.validation import validate_records, write_validation_report
from support_ticket.models.artifacts import (
    ArtifactError,
    load_artifact,
    load_metadata,
)
from support_ticket.models.predict import Predictor
from support_ticket.models.training import TrainingError, train_experiment

EXIT_OK = 0
EXIT_ERROR = 1
EXIT_INVALID_DATA = 2


class CLIError(RuntimeError):
    """Raised for user-facing CLI misuse (for example a non-empty output directory)."""


def _emit(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, indent=2, sort_keys=True))


def _prepare_out_dir(path: str | Path) -> Path:
    directory = Path(path)
    if directory.exists() and any(directory.iterdir()):
        raise CLIError(
            f"output directory must be new or empty to preserve experiment history: {directory}"
        )
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def _config(args: argparse.Namespace) -> Config:
    return load_config(getattr(args, "config", None))


def cmd_make_fixture(args: argparse.Namespace) -> int:
    rows = write_fixture(args.output, args.rows)
    _emit({"output": str(args.output), "rows": rows, "synthetic": True})
    return EXIT_OK


def cmd_validate(args: argparse.Namespace) -> int:
    config = _config(args)
    out_dir = _prepare_out_dir(args.out)
    records = load_records(args.data, config)
    report = validate_records(records, config)
    report_path = write_validation_report(report, out_dir)
    figures = out_dir / "figures"
    plot_category_distribution(report.class_distribution, figures / "category-distribution.png")
    plot_text_lengths(
        [len(record["ticket_text"]) for record in records], figures / "text-lengths.png"
    )
    _emit(
        {
            "report": str(report_path),
            "rows": report.rows,
            "ok": report.ok,
            "dataset_id": report.dataset_id,
            "synthetic": report.synthetic,
            "class_distribution": report.class_distribution,
            "counts": report.counts,
            "failures": report.failures,
            "notes": report.notes,
        }
    )
    if not report.ok:
        print(
            f"validation failed with {len(report.failures)} issue(s); see {report_path}",
            file=sys.stderr,
        )
        return EXIT_INVALID_DATA
    return EXIT_OK


def cmd_split(args: argparse.Namespace) -> int:
    config = _config(args)
    out_dir = _prepare_out_dir(args.out)
    records = load_records(args.data, config)
    report = validate_records(records, config)
    write_validation_report(report, out_dir)
    if not report.ok:
        print(
            f"validation failed with {len(report.failures)} issue(s); fix them before splitting",
            file=sys.stderr,
        )
        return EXIT_INVALID_DATA
    split = make_splits(records, config)
    manifest = split_manifest(split, records, config)
    path = out_dir / "split.json"
    path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")
    _emit(
        {
            "manifest": str(path),
            "seed": split.seed,
            "rows": {name: len(split.rows_for(name)) for name in ("train", "validation", "test")},
            "groups": {name: len(split.groups[name]) for name in ("train", "validation", "test")},
            "note": "group ids are hashes of normalized text, not anonymization",
        }
    )
    return EXIT_OK


def cmd_train(args: argparse.Namespace) -> int:
    config = _config(args)
    out_dir = _prepare_out_dir(args.out)
    records = load_records(args.data, config)
    report = validate_records(records, config)
    write_validation_report(report, out_dir)
    if not report.ok:
        print(
            f"validation failed with {len(report.failures)} issue(s); nothing was fitted",
            file=sys.stderr,
        )
        return EXIT_INVALID_DATA

    figures = out_dir / "figures"
    plot_category_distribution(report.class_distribution, figures / "category-distribution.png")
    plot_text_lengths(
        [len(record["ticket_text"]) for record in records], figures / "text-lengths.png"
    )

    result = train_experiment(records, config, out_dir)
    plot_validation_errors(
        Counter(
            {
                tuple(pair.split(" -> ", 1)): count
                for pair, count in result.errors["error_pairs"].items()
            }
        ),
        figures / "validation-errors.png",
    )
    evaluation = result.evaluation
    _emit(
        {
            "model_version": result.model_version,
            "artifact": str(result.artifact_dir),
            "selected_candidate": evaluation["selected_candidate"],
            "selection_rule": evaluation["selection_rule"],
            "split_rows": evaluation["split_rows"],
            "candidate_validation_macro_f1": {
                name: candidate["validation"]["macro_f1"]
                for name, candidate in evaluation["candidates"].items()
            },
            "test_metrics": {
                "accuracy": evaluation["test_metrics"]["accuracy"],
                "macro_f1": evaluation["test_metrics"]["macro_f1"],
                "weighted_f1": evaluation["test_metrics"]["weighted_f1"],
                "confusion_matrix": evaluation["test_metrics"]["confusion_matrix"],
            },
            "validation_errors": evaluation["validation_errors"],
            "warm_batch_ms_per_ticket": evaluation["warm_batch_ms_per_ticket"],
            "priority": evaluation["priority"],
            "warnings": evaluation["warnings"],
            "reports": {
                "quality": str(out_dir / "quality.json"),
                "split": str(out_dir / "split.json"),
                "evaluation": str(out_dir / "evaluation.json"),
                "errors": str(out_dir / "errors.json"),
            },
        }
    )
    return EXIT_OK


def cmd_predict(args: argparse.Namespace) -> int:
    predictor = Predictor(args.artifact)
    result = predictor.predict([args.text])[0]
    _emit(
        {
            "ticket_id": args.ticket_id,
            "model_version": predictor.model_version,
            "category": result["category"],
            "priority": result["priority"],
            "priority_status": result["priority_status"],
        }
    )
    return EXIT_OK


def cmd_save(args: argparse.Namespace) -> int:
    artifact = Path(args.artifact)
    load_artifact(artifact)  # verify before shipping
    destination = Path(args.out)
    destination.parent.mkdir(parents=True, exist_ok=True)
    with tarfile.open(destination, "w:gz") as archive:
        archive.add(artifact, arcname="artifact")
    _emit({"bundle": str(destination), "artifact": str(artifact)})
    return EXIT_OK


def cmd_load(args: argparse.Namespace) -> int:
    out_dir = _prepare_out_dir(args.out)
    with tarfile.open(args.bundle, "r:gz") as archive:
        members = archive.getnames()
        if any(name.startswith("/") or ".." in Path(name).parts for name in members):
            raise CLIError("bundle contains unsafe member paths; refusing to extract")
        archive.extractall(out_dir, filter="data")
    artifact_dir = out_dir / "artifact"
    metadata = load_metadata(artifact_dir)
    _emit(
        {
            "artifact": str(artifact_dir),
            "model_version": metadata.get("model_version"),
            "dataset_id": metadata.get("dataset_id"),
            "synthetic": metadata.get("synthetic"),
            "labels": metadata.get("labels"),
            "selected_candidate": metadata.get("selected_candidate"),
            "artifact_schema_version": metadata.get("artifact_schema_version"),
        }
    )
    return EXIT_OK


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="support-ticket",
        description="CPU-only support ticket categorization with an explicit review policy.",
    )
    parser.add_argument("--version", action="version", version=f"support-ticket {__version__}")
    subparsers = parser.add_subparsers(dest="command", required=True)

    fixture = subparsers.add_parser(
        "make-fixture", help="write the explicitly synthetic demonstration CSV"
    )
    fixture.add_argument("--output", required=True, help="destination CSV path")
    fixture.add_argument("--rows", type=int, default=90, help="number of rows (default 90)")
    fixture.set_defaults(func=cmd_make_fixture)

    validate = subparsers.add_parser("validate", help="validate a dataset and report data quality")
    validate.add_argument("--data", required=True)
    validate.add_argument("--out", required=True)
    validate.add_argument("--config", default=None, help="reviewed YAML config for real data")
    validate.set_defaults(func=cmd_validate)

    split = subparsers.add_parser("split", help="preview the deterministic grouped split")
    split.add_argument("--data", required=True)
    split.add_argument("--out", required=True)
    split.add_argument("--config", default=None)
    split.set_defaults(func=cmd_split)

    train = subparsers.add_parser("train", help="train, select, evaluate once and export an artifact")
    train.add_argument("--data", required=True)
    train.add_argument("--out", required=True)
    train.add_argument("--config", default=None)
    train.set_defaults(func=cmd_train)

    predict = subparsers.add_parser("predict", help="infer with a trusted local artifact")
    predict.add_argument("--artifact", required=True)
    predict.add_argument("--text", required=True, help="avoid real customer content here")
    predict.add_argument("--ticket-id", default="cli-ticket")
    predict.set_defaults(func=cmd_predict)

    save = subparsers.add_parser("save", help="bundle an artifact directory into a tarball")
    save.add_argument("--artifact", required=True)
    save.add_argument("--out", required=True)
    save.set_defaults(func=cmd_save)

    load = subparsers.add_parser("load", help="extract and verify an artifact bundle")
    load.add_argument("--bundle", required=True)
    load.add_argument("--out", required=True)
    load.set_defaults(func=cmd_load)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except (CLIError, ConfigurationError, DataLoadError, ArtifactError, SplitError, TrainingError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return EXIT_ERROR
    except ValueError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return EXIT_ERROR


if __name__ == "__main__":  # pragma: no cover - module execution path
    raise SystemExit(main())

"""Shared fixtures. Everything here is offline and synthetic."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from support_ticket.api.main import create_app
from support_ticket.config import Config
from support_ticket.data.synthetic import make_fixture, write_fixture
from support_ticket.models.training import train_experiment


@pytest.fixture(scope="session")
def fixture_records() -> list[dict]:
    return make_fixture(90)


@pytest.fixture(scope="session")
def fixture_csv(tmp_path_factory) -> Path:
    path = tmp_path_factory.mktemp("data") / "synthetic.csv"
    write_fixture(path, 90)
    return path


@pytest.fixture(scope="session")
def trained_run(tmp_path_factory):
    out_dir = tmp_path_factory.mktemp("run")
    return train_experiment(make_fixture(90), Config(), out_dir)


@pytest.fixture(scope="session")
def artifact_dir(trained_run) -> Path:
    return trained_run.artifact_dir


@pytest.fixture(scope="session")
def api_client(artifact_dir):
    app = create_app(model_dir=str(artifact_dir))
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="session")
def unready_client():
    app = create_app(model_dir="")
    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="session")
def small_limit_client(tmp_path_factory):
    """An artifact whose model-length limit is far below the schema limit."""
    out_dir = tmp_path_factory.mktemp("small-limit-run")
    result = train_experiment(make_fixture(90), Config(max_text_chars=200), out_dir)
    app = create_app(model_dir=str(result.artifact_dir))
    with TestClient(app) as client:
        yield client

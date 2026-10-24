"""API tests: schemas, limits, readiness and inference."""

from __future__ import annotations

from fastapi.testclient import TestClient

from support_ticket.api.main import create_app


def test_health_is_process_liveness(api_client) -> None:
    response = api_client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_root_redirects_to_docs(api_client) -> None:
    response = api_client.get("/", follow_redirects=False)
    assert response.status_code == 307
    assert response.headers["location"] == "/docs"


def test_ready_reports_the_loaded_model(api_client) -> None:
    response = api_client.get("/ready")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ready"
    assert payload["model_version"]


def test_ready_is_503_without_a_model(unready_client) -> None:
    response = unready_client.get("/ready")
    assert response.status_code == 503
    assert response.json()["status"] == "unavailable"


def test_model_info_describes_policy_and_limits(api_client) -> None:
    response = api_client.get("/model-info")
    assert response.status_code == 200
    payload = response.json()
    assert payload["labels"] == ["Account Access", "Billing", "Technical Issue"]
    assert payload["review_policy"]["always_review"] is True
    assert payload["priority_status"] == "unavailable"
    assert payload["limits"]["max_text_chars"] == 10000
    assert payload["warnings"]


def test_predict_single_ticket(api_client) -> None:
    response = api_client.post(
        "/predict", json={"ticket_id": "demo-1", "text": "I cannot login to my account"}
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["ticket_id"] == "demo-1"
    assert payload["category"]["label"] in {"Account Access", "Billing", "Technical Issue"}
    assert payload["category"]["review_required"] is True
    assert payload["priority"] is None
    assert payload["priority_status"] == "unavailable"
    assert payload["model_version"]


def test_predict_batch(api_client) -> None:
    response = api_client.post(
        "/predict/batch",
        json={
            "tickets": [
                {"ticket_id": "a", "text": "invoice charge"},
                {"ticket_id": "b", "text": "server error"},
            ]
        },
    )
    assert response.status_code == 200
    payload = response.json()
    assert [item["ticket_id"] for item in payload["results"]] == ["a", "b"]


def test_blank_text_is_422(api_client) -> None:
    response = api_client.post("/predict", json={"ticket_id": "a", "text": "   "})
    assert response.status_code == 422


def test_unknown_field_is_422_and_values_are_redacted(api_client) -> None:
    response = api_client.post(
        "/predict",
        json={"ticket_id": "a", "text": "invoice charge", "secret_field": "s3cr3t-value"},
    )
    assert response.status_code == 422
    assert "s3cr3t-value" not in response.text
    assert response.json()["detail"][0]["input"] == "<redacted>"


def test_batch_size_is_bounded(api_client) -> None:
    tickets = [{"ticket_id": f"t{index}", "text": "invoice charge"} for index in range(101)]
    response = api_client.post("/predict/batch", json={"tickets": tickets})
    assert response.status_code == 422


def test_empty_batch_is_422(api_client) -> None:
    assert api_client.post("/predict/batch", json={"tickets": []}).status_code == 422


def test_declared_oversized_body_is_413(tmp_path, artifact_dir) -> None:
    app = create_app(model_dir=str(artifact_dir), max_body_bytes=1000)
    with TestClient(app) as client:
        response = client.post(
            "/predict", content=b'{"ticket_id":"a","text":"' + b"x" * 2000 + b'"}'
        )
    assert response.status_code == 413
    assert "limit" in response.json()["detail"]


def test_streamed_oversized_body_is_413(artifact_dir) -> None:
    app = create_app(model_dir=str(artifact_dir), max_body_bytes=1000)
    with TestClient(app) as client:
        response = client.post(
            "/predict",
            content=iter([b'{"ticket_id":"a","text":"', b"x" * 600, b"x" * 600, b'"}']),
            headers={"content-type": "application/json"},
        )
    assert response.status_code == 413


def test_model_length_violation_is_422(small_limit_client) -> None:
    response = small_limit_client.post(
        "/predict", json={"ticket_id": "a", "text": "y" * 500}
    )
    assert response.status_code == 422
    assert "model length limit" in response.text


def test_predict_is_503_without_a_model(unready_client) -> None:
    response = unready_client.post("/predict", json={"ticket_id": "a", "text": "invoice charge"})
    assert response.status_code == 503


def test_model_info_is_503_without_a_model(unready_client) -> None:
    assert unready_client.get("/model-info").status_code == 503

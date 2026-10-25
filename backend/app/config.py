"""Runtime configuration, read from environment variables.

Every value has a development-safe default so the API boots with no
configuration at all. Values that must be replaced for a real deployment are
called out in the README.
"""

from __future__ import annotations

import logging
import os
import secrets
from pathlib import Path

logger = logging.getLogger(__name__)

BACKEND_DIR = Path(__file__).resolve().parent.parent

#: Where the SQLite database and any runtime files live.
DATA_DIR = Path(os.getenv("APP_DATA_DIR") or BACKEND_DIR / "var")


def _csv(name: str, default: str) -> list[str]:
    raw = os.getenv(name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


class Settings:
    """Process-wide settings."""

    app_name: str = "UrbanLedge API"
    api_prefix: str = "/api"

    database_url: str = os.getenv("DATABASE_URL") or f"sqlite:///{DATA_DIR / 'app.db'}"

    # Session tokens. A random per-process secret is used when JWT_SECRET is
    # absent so the app never runs on a hard-coded key; sessions then end on
    # restart, which is why the value must be configured for real use.
    jwt_secret: str = os.getenv("JWT_SECRET") or secrets.token_urlsafe(48)
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = int(os.getenv("ACCESS_TOKEN_MINUTES", "4320"))

    #: Origins allowed to call the API directly (the SPA normally proxies /api).
    cors_origins: list[str] = _csv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173",
    )

    #: Demo accounts created on first boot. Replace before any real launch.
    demo_admin_email: str = os.getenv("ADMIN_EMAIL", "admin@urbanledge.example")
    demo_admin_password: str = os.getenv("ADMIN_PASSWORD", "UrbanLedge-demo-2026")
    demo_editor_email: str = os.getenv("EDITOR_EMAIL", "editor@urbanledge.example")
    demo_editor_password: str = os.getenv("EDITOR_PASSWORD", "UrbanLedge-editor-2026")

    seed_demo_content: bool = os.getenv("SEED_DEMO_CONTENT", "1") != "0"

    #: Inquiries per hour per IP address before submissions are rejected.
    inquiry_rate_limit: int = int(os.getenv("INQUIRY_RATE_LIMIT", "20"))

    @property
    def jwt_secret_is_generated(self) -> bool:
        return not os.getenv("JWT_SECRET")


settings = Settings()

if settings.jwt_secret_is_generated:
    logger.warning(
        "JWT_SECRET is not set: using a random per-process secret. "
        "Sessions will not survive a restart until it is configured."
    )

if settings.demo_admin_password.startswith("UrbanLedge-demo"):
    logger.warning(
        "Demo administrator credentials are active (%s). Change ADMIN_PASSWORD "
        "and remove the demo accounts before launch.",
        settings.demo_admin_email,
    )

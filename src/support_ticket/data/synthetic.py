"""The explicitly synthetic fixture used for offline demonstration and tests.

90 rows, 3 categories, 6 templates per category and 5 variants per template. The templates
are deliberately easy to separate, so scores on this fixture verify plumbing only and say
nothing about real support tickets.
"""

from __future__ import annotations

import csv
from pathlib import Path
from typing import Any

CATEGORIES: tuple[str, ...] = ("Account Access", "Billing", "Technical Issue")

TEMPLATES: dict[str, tuple[str, ...]] = {
    "Account Access": (
        "I cannot log in to my account after the password reset",
        "The login page rejects my password and locks the account",
        "Please help me recover access to my account, the email verification failed",
        "Two factor authentication codes never arrive on my phone",
        "My account was locked out after too many sign in attempts",
        "I need to reset my password because the login link expires",
    ),
    "Billing": (
        "I was charged twice for the same invoice this month",
        "Please refund the duplicate invoice payment on my card",
        "My invoice total does not match the subscription price I agreed",
        "The payment method on the billing account is expired",
        "I would like a receipt for the monthly invoice payment",
        "Cancel the subscription renewal and confirm the refund",
    ),
    "Technical Issue": (
        "The application crashes with error code E403 when I open a report",
        "Uploads fail with a server error and the file never appears",
        "The dashboard shows a sync failure and stale data",
        "The service is down and every request times out",
        "The report export throws an internal error and stops",
        "Latency is very high and the page eventually returns a gateway error",
    ),
}

VARIANTS: tuple[str, ...] = ("again", "today", "now", "still", "urgently")


def make_fixture(rows: int = 90) -> list[dict[str, Any]]:
    """Build the synthetic fixture as canonical records."""
    if rows < 1:
        raise ValueError("rows must be positive")
    per_category = max(1, rows // len(CATEGORIES))
    records: list[dict[str, Any]] = []
    index = 0
    for category in CATEGORIES:
        templates = TEMPLATES[category]
        for offset in range(per_category):
            template = templates[offset % len(templates)]
            variant = VARIANTS[(offset // len(templates)) % len(VARIANTS)]
            index += 1
            records.append(
                {
                    "ticket_id": f"synthetic-{index:04d}",
                    "ticket_text": f"{template} {variant}",
                    "category": category,
                }
            )
    return records


def write_fixture(path: str | Path, rows: int = 90) -> int:
    """Write the fixture as CSV and return the number of rows written."""
    destination = Path(path)
    destination.parent.mkdir(parents=True, exist_ok=True)
    records = make_fixture(rows)
    with destination.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=["ticket_id", "ticket_text", "category"])
        writer.writeheader()
        writer.writerows(records)
    return len(records)

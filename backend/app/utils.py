"""Small shared helpers: slugs, pagination, CSV, rate limiting."""

from __future__ import annotations

import csv
import io
import re
import unicodedata
from collections import defaultdict, deque
from datetime import datetime, timezone

from fastapi import HTTPException, status

_SLUG_STRIP = re.compile(r"[^a-z0-9]+")


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    slug = _SLUG_STRIP.sub("-", normalized.lower()).strip("-")
    return slug or "item"


def unique_slug(db, model, value: str, current_id: int | None = None) -> str:
    """A slug that does not collide with an existing row of ``model``."""
    base = slugify(value)
    candidate = base
    suffix = 2
    while True:
        query = db.query(model).filter(model.slug == candidate)
        if current_id is not None:
            query = query.filter(model.id != current_id)
        if query.first() is None:
            return candidate
        candidate = f"{base}-{suffix}"
        suffix += 1


def paginate(query, page: int, page_size: int) -> tuple[list, int, int]:
    """Return (rows, total, page_count) for a SQLAlchemy query."""
    total = query.count()
    page = max(page, 1)
    page_size = min(max(page_size, 1), 60)
    rows = query.offset((page - 1) * page_size).limit(page_size).all()
    page_count = max(1, (total + page_size - 1) // page_size)
    return rows, total, page_count


def csv_response(rows: list[dict], filename: str) -> tuple[str, dict[str, str]]:
    buffer = io.StringIO()
    if rows:
        writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return buffer.getvalue(), {
        "Content-Disposition": f'attachment; filename="{filename}"',
        "Content-Type": "text/csv; charset=utf-8",
    }


class RateLimiter:
    """Fixed-window limiter keyed by client IP; enough for public form spam."""

    def __init__(self, limit: int, window_seconds: int = 3600) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)

    def check(self, key: str) -> None:
        now = datetime.now(timezone.utc).timestamp()
        hits = self._hits[key]
        while hits and now - hits[0] > self.window_seconds:
            hits.popleft()
        if len(hits) >= self.limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many submissions from this address. Please try again later.",
            )
        hits.append(now)


INQUIRY_TYPES = [
    "Residential property",
    "Commercial property",
    "Property development",
    "Land acquisition",
    "Architecture and design",
    "Urban planning",
    "Investment and asset strategy",
    "Development partnership",
    "General inquiry",
]

PROPERTY_TYPES = [
    "Apartment",
    "House",
    "Villa",
    "Penthouse",
    "Townhouse",
    "Office",
    "Retail",
    "Commercial building",
    "Land",
    "Mixed-use property",
]

PROJECT_CATEGORIES = [
    "Residential",
    "Commercial",
    "Mixed-use",
    "Hospitality",
    "Urban development",
    "Masterplanning",
]

PROJECT_STATUSES = ["Planning", "In development", "Completed", "Available for inquiry"]

LISTING_STATUSES = ["available", "under_offer", "rented", "sold", "withdrawn"]

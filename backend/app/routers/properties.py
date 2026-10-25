"""Public property listing endpoints with combined filtering and sorting."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Property
from ..schemas import Page, PropertyFacets, PropertyOut
from ..utils import paginate

router = APIRouter(prefix="/properties", tags=["properties"])

SORTS = {
    "newest": (Property.created_at.desc(),),
    "oldest": (Property.created_at.asc(),),
    "price_asc": (Property.price.is_(None), Property.price.asc()),
    "price_desc": (Property.price.is_(None), Property.price.desc()),
    "area_desc": (Property.area_sqm.is_(None), Property.area_sqm.desc()),
}


def _as_list(value: str | None) -> list[str]:
    return [item.strip().lower() for item in (value or "").split(",") if item.strip()]


def _apply_filters(query, **filters):
    keyword = (filters.get("q") or "").strip()
    if keyword:
        like = f"%{keyword}%"
        query = query.filter(
            or_(
                Property.title.ilike(like),
                Property.location.ilike(like),
                Property.reference.ilike(like),
                Property.excerpt.ilike(like),
                Property.description.ilike(like),
            )
        )

    transaction = filters.get("transaction_type")
    if transaction in {"buy", "rent"}:
        query = query.filter(Property.transaction_type == transaction)

    for field, column in (
        ("property_type", Property.property_type),
        ("listing_status", Property.listing_status),
    ):
        values = _as_list(filters.get(field))
        if values:
            query = query.filter(func.lower(column).in_(values))

    locations = filters.get("location")
    if locations:
        patterns = [f"%{item}%" for item in _as_list(locations)]
        query = query.filter(or_(*[Property.location.ilike(pattern) for pattern in patterns]))

    if filters.get("min_price") is not None:
        query = query.filter(Property.price >= filters["min_price"])
    if filters.get("max_price") is not None:
        query = query.filter(Property.price <= filters["max_price"])
    if filters.get("min_area") is not None:
        query = query.filter(Property.area_sqm >= filters["min_area"])
    if filters.get("max_area") is not None:
        query = query.filter(Property.area_sqm <= filters["max_area"])
    if filters.get("bedrooms") is not None:
        query = query.filter(Property.bedrooms >= filters["bedrooms"])
    if filters.get("bathrooms") is not None:
        query = query.filter(Property.bathrooms >= filters["bathrooms"])
    if filters.get("furnished"):
        query = query.filter(func.lower(Property.furnished) == filters["furnished"].lower())
    if filters.get("project_id") is not None:
        query = query.filter(Property.project_id == filters["project_id"])
    if filters.get("featured") is not None:
        query = query.filter(Property.featured.is_(bool(filters["featured"])))
    return query


@router.get("", response_model=Page[PropertyOut])
def list_properties(
    db: Session = Depends(get_db),
    q: str | None = None,
    transaction_type: str | None = Query(default=None, pattern="^(buy|rent)$"),
    property_type: str | None = None,
    location: str | None = None,
    listing_status: str | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    min_area: float | None = Query(default=None, ge=0),
    max_area: float | None = Query(default=None, ge=0),
    bedrooms: int | None = Query(default=None, ge=0),
    bathrooms: int | None = Query(default=None, ge=0),
    furnished: str | None = None,
    project_id: int | None = None,
    featured: bool | None = None,
    sort: str = Query(default="newest", pattern="^(newest|oldest|price_asc|price_desc|area_desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=9, ge=1, le=60),
) -> Page[PropertyOut]:
    query = _apply_filters(
        db.query(Property),
        q=q,
        transaction_type=transaction_type,
        property_type=property_type,
        location=location,
        listing_status=listing_status,
        min_price=min_price,
        max_price=max_price,
        min_area=min_area,
        max_area=max_area,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        furnished=furnished,
        project_id=project_id,
        featured=featured,
    )
    rows, total, pages = paginate(query.order_by(*SORTS[sort]), page, page_size)
    return Page[PropertyOut](
        items=[PropertyOut.model_validate(row) for row in rows],
        total=total,
        page=page,
        pages=pages,
        page_size=page_size,
    )


@router.get("/facets", response_model=PropertyFacets)
def property_facets(db: Session = Depends(get_db)) -> PropertyFacets:
    """Filter options derived from the stored listings, never hard-coded."""
    types = [row[0] for row in db.query(Property.property_type).distinct().order_by(Property.property_type)]
    locations = [row[0] for row in db.query(Property.location).distinct().order_by(Property.location)]
    statuses = [row[0] for row in db.query(Property.listing_status).distinct().order_by(Property.listing_status)]
    transactions = [
        row[0] for row in db.query(Property.transaction_type).distinct().order_by(Property.transaction_type)
    ]
    bounds = db.query(func.min(Property.price), func.max(Property.price), func.max(Property.area_sqm)).one()
    return PropertyFacets(
        types=types,
        locations=locations,
        statuses=statuses,
        transaction_types=transactions,
        min_price=bounds[0],
        max_price=bounds[1],
        max_area=bounds[2],
    )


@router.get("/{slug}", response_model=PropertyOut)
def get_property(slug: str, db: Session = Depends(get_db)) -> PropertyOut:
    record = db.query(Property).filter(Property.slug == slug).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Property not found.")
    return PropertyOut.model_validate(record)

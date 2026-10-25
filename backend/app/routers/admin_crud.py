"""Reusable admin CRUD endpoints.

Listings, projects and editorial content all follow the same shape, so these
routes are generated from a small specification instead of being repeated six
times. Request bodies are validated against the specification's Pydantic model
explicitly, which keeps the generated signature resolvable and returns the same
field-level errors as the hand-written endpoints.
Every route requires editor or administrator rights.
"""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.exceptions import RequestValidationError
from pydantic import BaseModel, ValidationError
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Article, Faq, GalleryImage, Project, Property, Service
from ..schemas import (
    ArticleIn,
    ArticleOut,
    FaqIn,
    FaqOut,
    GalleryImageIn,
    GalleryImageOut,
    PropertyIn,
    PropertyOut,
    PropertyUpdate,
    ProjectIn,
    ProjectOut,
    ProjectUpdate,
    ServiceIn,
    ServiceOut,
)
from ..security import require_editor
from ..utils import unique_slug


@dataclass
class CrudSpec:
    name: str
    model: type
    read_schema: type[BaseModel]
    create_schema: type[BaseModel]
    update_schema: type[BaseModel]
    order_by: tuple = ()
    search_fields: tuple = ()
    has_slug: bool = True
    slug_source: str = "title"


SPECS: list[CrudSpec] = [
    CrudSpec(
        name="properties",
        model=Property,
        read_schema=PropertyOut,
        create_schema=PropertyIn,
        update_schema=PropertyUpdate,
        order_by=(Property.updated_at.desc(),),
        search_fields=(Property.title, Property.location, Property.reference),
    ),
    CrudSpec(
        name="projects",
        model=Project,
        read_schema=ProjectOut,
        create_schema=ProjectIn,
        update_schema=ProjectUpdate,
        order_by=(Project.display_order.asc(), Project.title.asc()),
        search_fields=(Project.title, Project.location),
    ),
    CrudSpec(
        name="services",
        model=Service,
        read_schema=ServiceOut,
        create_schema=ServiceIn,
        update_schema=ServiceIn,
        order_by=(Service.display_order.asc(),),
        search_fields=(Service.title,),
    ),
    CrudSpec(
        name="articles",
        model=Article,
        read_schema=ArticleOut,
        create_schema=ArticleIn,
        update_schema=ArticleIn,
        order_by=(Article.created_at.desc(),),
        search_fields=(Article.title, Article.category),
    ),
    CrudSpec(
        name="faqs",
        model=Faq,
        read_schema=FaqOut,
        create_schema=FaqIn,
        update_schema=FaqIn,
        order_by=(Faq.display_order.asc(), Faq.id.asc()),
        search_fields=(Faq.question,),
        has_slug=False,
    ),
    CrudSpec(
        name="gallery",
        model=GalleryImage,
        read_schema=GalleryImageOut,
        create_schema=GalleryImageIn,
        update_schema=GalleryImageIn,
        order_by=(GalleryImage.display_order.asc(), GalleryImage.id.asc()),
        search_fields=(GalleryImage.title, GalleryImage.category),
        has_slug=False,
    ),
]


def next_reference(db: Session) -> str:
    """Human-readable listing reference, e.g. UL-1001."""
    used = {row[0] for row in db.query(Property.reference).all()}
    number = 1001
    while f"UL-{number}" in used:
        number += 1
    return f"UL-{number}"


def _validate(schema: type[BaseModel], payload: dict, *, partial: bool) -> dict:
    try:
        model = schema.model_validate(payload)
    except ValidationError as exc:
        raise RequestValidationError(exc.errors()) from exc
    return model.model_dump(exclude_unset=partial)


def build_router(spec: CrudSpec) -> APIRouter:
    # Mounted under /admin so the public read endpoints of the same name are
    # never shadowed (the admin listing includes unpublished records).
    router = APIRouter(
        prefix=f"/admin/{spec.name}",
        tags=["admin"],
        dependencies=[Depends(require_editor)],
    )

    def _get(db: Session, record_id: int):
        record = db.get(spec.model, record_id)
        if record is None:
            raise HTTPException(status_code=404, detail=f"{spec.name[:-1].capitalize()} not found.")
        return record

    @router.get("", response_model=list[spec.read_schema])
    def list_records(
        db: Session = Depends(get_db),
        q: str | None = None,
        limit: int = Query(default=200, ge=1, le=500),
    ):
        query = db.query(spec.model)
        if q and spec.search_fields:
            like = f"%{q.strip()}%"
            query = query.filter(or_(*[column.ilike(like) for column in spec.search_fields]))
        if spec.order_by:
            query = query.order_by(*spec.order_by)
        return [spec.read_schema.model_validate(row) for row in query.limit(limit).all()]

    @router.post("", response_model=spec.read_schema, status_code=201)
    def create_record(payload: dict = Body(...), db: Session = Depends(get_db)):
        data = _validate(spec.create_schema, payload, partial=False)
        if spec.has_slug:
            source = data.get("slug") or data.get(spec.slug_source) or spec.name
            data["slug"] = unique_slug(db, spec.model, str(source))
        if spec.model is Property and not data.get("reference"):
            data["reference"] = next_reference(db)
        record = spec.model(**data)
        db.add(record)
        db.commit()
        db.refresh(record)
        return spec.read_schema.model_validate(record)

    @router.get("/{record_id}", response_model=spec.read_schema)
    def read_record(record_id: int, db: Session = Depends(get_db)):
        return spec.read_schema.model_validate(_get(db, record_id))

    @router.patch("/{record_id}", response_model=spec.read_schema)
    def update_record(
        record_id: int, payload: dict = Body(...), db: Session = Depends(get_db)
    ):
        record = _get(db, record_id)
        data = _validate(spec.update_schema, payload, partial=True)
        if spec.has_slug and data.get("slug"):
            data["slug"] = unique_slug(db, spec.model, data["slug"], current_id=record.id)
        elif "slug" in data:
            data.pop("slug")
        for field_name, value in data.items():
            setattr(record, field_name, value)
        db.commit()
        db.refresh(record)
        return spec.read_schema.model_validate(record)

    @router.delete("/{record_id}", status_code=204)
    def delete_record(record_id: int, db: Session = Depends(get_db)) -> None:
        record = _get(db, record_id)
        db.delete(record)
        db.commit()

    return router


def all_routers() -> list[APIRouter]:
    return [build_router(spec) for spec in SPECS]

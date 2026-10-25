"""Public development-project endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Project
from ..schemas import Page, ProjectOut
from ..utils import paginate

router = APIRouter(prefix="/projects", tags=["projects"])

SORTS = {
    "order": (Project.display_order.asc(), Project.title.asc()),
    "newest": (Project.created_at.desc(),),
    "title": (Project.title.asc(),),
}


@router.get("", response_model=Page[ProjectOut])
def list_projects(
    db: Session = Depends(get_db),
    q: str | None = None,
    category: str | None = None,
    location: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    featured: bool | None = None,
    sort: str = Query(default="order", pattern="^(order|newest|title)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=9, ge=1, le=60),
) -> Page[ProjectOut]:
    query = db.query(Project).filter(Project.published.is_(True))

    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(Project.title.ilike(like), Project.location.ilike(like), Project.overview.ilike(like))
        )
    categories = [item.strip().lower() for item in (category or "").split(",") if item.strip()]
    if categories:
        query = query.filter(func.lower(Project.category).in_(categories))
    if location:
        like = f"%{location.strip()}%"
        query = query.filter(Project.location.ilike(like))
    statuses = [item.strip().lower() for item in (status_filter or "").split(",") if item.strip()]
    if statuses:
        query = query.filter(func.lower(Project.status).in_(statuses))
    if featured is not None:
        query = query.filter(Project.featured.is_(featured))

    rows, total, pages = paginate(query.order_by(*SORTS[sort]), page, page_size)
    return Page[ProjectOut](
        items=[ProjectOut.model_validate(row) for row in rows],
        total=total,
        page=page,
        pages=pages,
        page_size=page_size,
    )


@router.get("/facets", response_model=dict)
def project_facets(db: Session = Depends(get_db)) -> dict:
    return {
        "categories": [
            row[0]
            for row in db.query(Project.category).filter(Project.published.is_(True)).distinct().order_by(Project.category)
        ],
        "locations": [
            row[0]
            for row in db.query(Project.location).filter(Project.published.is_(True)).distinct().order_by(Project.location)
        ],
        "statuses": [
            row[0]
            for row in db.query(Project.status).filter(Project.published.is_(True)).distinct().order_by(Project.status)
        ],
    }


@router.get("/{slug}", response_model=ProjectOut)
def get_project(slug: str, db: Session = Depends(get_db)) -> ProjectOut:
    record = db.query(Project).filter(Project.slug == slug, Project.published.is_(True)).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    return ProjectOut.model_validate(record)


@router.get("/{slug}/related", response_model=list[ProjectOut])
def related_projects(slug: str, db: Session = Depends(get_db), limit: int = 3) -> list[ProjectOut]:
    record = db.query(Project).filter(Project.slug == slug).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    query = (
        db.query(Project)
        .filter(Project.published.is_(True), Project.id != record.id, Project.category == record.category)
        .order_by(Project.display_order.asc())
        .limit(limit)
    )
    rows = query.all()
    if len(rows) < limit:
        extra = (
            db.query(Project)
            .filter(Project.published.is_(True), Project.id != record.id, Project.category != record.category)
            .order_by(Project.display_order.asc())
            .limit(limit - len(rows))
            .all()
        )
        rows.extend(extra)
    return [ProjectOut.model_validate(row) for row in rows]

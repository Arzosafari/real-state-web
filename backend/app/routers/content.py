"""Public editorial content: services, articles, FAQs, gallery and site settings."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..db import get_db
from ..demo_content import DEFAULT_SETTINGS
from ..models import Article, Faq, GalleryImage, Service, SiteSettings
from ..schemas import (
    ArticleOut,
    ArticleSummary,
    FaqOut,
    GalleryImageOut,
    Page,
    ServiceOut,
)
from ..utils import paginate

router = APIRouter(tags=["content"])


def get_settings(db: Session) -> dict:
    """Stored site settings, merged over the defaults so new keys appear."""
    record = db.query(SiteSettings).first()
    merged = {**DEFAULT_SETTINGS}
    if record and record.data:
        merged.update(record.data)
    return merged


@router.get("/services", response_model=list[ServiceOut])
def list_services(db: Session = Depends(get_db)) -> list[ServiceOut]:
    rows = (
        db.query(Service)
        .filter(Service.published.is_(True))
        .order_by(Service.display_order.asc(), Service.title.asc())
        .all()
    )
    return [ServiceOut.model_validate(row) for row in rows]


@router.get("/services/{slug}", response_model=ServiceOut)
def get_service(slug: str, db: Session = Depends(get_db)) -> ServiceOut:
    row = db.query(Service).filter(Service.slug == slug, Service.published.is_(True)).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Service not found.")
    return ServiceOut.model_validate(row)


@router.get("/articles", response_model=Page[ArticleSummary])
def list_articles(
    db: Session = Depends(get_db),
    q: str | None = None,
    category: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=6, ge=1, le=30),
) -> Page[ArticleSummary]:
    query = db.query(Article).filter(Article.status == "published")
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(
            or_(Article.title.ilike(like), Article.excerpt.ilike(like), Article.content.ilike(like))
        )
    if category:
        query = query.filter(func.lower(Article.category) == category.strip().lower())

    query = query.order_by(Article.published_at.desc().nullslast(), Article.created_at.desc())
    rows, total, pages = paginate(query, page, page_size)
    return Page[ArticleSummary](
        items=[ArticleSummary.model_validate(row) for row in rows],
        total=total,
        page=page,
        pages=pages,
        page_size=page_size,
    )


@router.get("/articles/categories", response_model=list[str])
def article_categories(db: Session = Depends(get_db)) -> list[str]:
    rows = (
        db.query(Article.category)
        .filter(Article.status == "published")
        .distinct()
        .order_by(Article.category)
        .all()
    )
    return [row[0] for row in rows]


@router.get("/articles/{slug}", response_model=ArticleOut)
def get_article(slug: str, db: Session = Depends(get_db)) -> ArticleOut:
    row = db.query(Article).filter(Article.slug == slug, Article.status == "published").first()
    if row is None:
        raise HTTPException(status_code=404, detail="Article not found.")
    return ArticleOut.model_validate(row)


@router.get("/articles/{slug}/related", response_model=list[ArticleSummary])
def related_articles(slug: str, db: Session = Depends(get_db), limit: int = 3) -> list[ArticleSummary]:
    row = db.query(Article).filter(Article.slug == slug).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Article not found.")
    same_category = (
        db.query(Article)
        .filter(Article.status == "published", Article.id != row.id, Article.category == row.category)
        .limit(limit)
        .all()
    )
    if len(same_category) < limit:
        fillers = (
            db.query(Article)
            .filter(Article.status == "published", Article.id != row.id, Article.category != row.category)
            .limit(limit - len(same_category))
            .all()
        )
        same_category.extend(fillers)
    return [ArticleSummary.model_validate(item) for item in same_category]


@router.get("/faqs", response_model=list[FaqOut])
def list_faqs(db: Session = Depends(get_db)) -> list[FaqOut]:
    rows = (
        db.query(Faq)
        .filter(Faq.published.is_(True))
        .order_by(Faq.display_order.asc(), Faq.id.asc())
        .all()
    )
    return [FaqOut.model_validate(row) for row in rows]


@router.get("/gallery", response_model=list[GalleryImageOut])
def list_gallery(db: Session = Depends(get_db), category: str | None = None) -> list[GalleryImageOut]:
    query = db.query(GalleryImage).filter(GalleryImage.published.is_(True))
    if category and category.lower() != "all":
        query = query.filter(func.lower(GalleryImage.category) == category.lower())
    rows = query.order_by(GalleryImage.display_order.asc(), GalleryImage.id.asc()).all()
    return [GalleryImageOut.model_validate(row) for row in rows]


@router.get("/gallery/categories", response_model=list[str])
def gallery_categories(db: Session = Depends(get_db)) -> list[str]:
    rows = (
        db.query(GalleryImage.category)
        .filter(GalleryImage.published.is_(True))
        .distinct()
        .order_by(GalleryImage.category)
        .all()
    )
    return [row[0] for row in rows]


@router.get("/settings", response_model=dict)
def public_settings(db: Session = Depends(get_db)) -> dict:
    return get_settings(db)

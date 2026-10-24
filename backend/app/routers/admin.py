"""Administration: dashboard figures, lead management, settings and roles."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import (
    Article,
    ConsultationRequest,
    Faq,
    GalleryImage,
    Inquiry,
    NewsletterSubscriber,
    Project,
    Property,
    Role,
    Service,
    SiteSettings,
    User,
)
from ..schemas import (
    ConsultationAdminOut,
    ConsultationUpdate,
    FaqOut,
    InquiryAdminOut,
    InquiryUpdate,
    Page,
    StatsOut,
    SettingsIn,
    UserPublic,
)
from ..security import require_admin, require_editor
from ..utils import csv_response, paginate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=StatsOut)
def stats(db: Session = Depends(get_db), _: User = Depends(require_editor)) -> StatsOut:
    """Live counts from the database only — no estimated or invented analytics."""
    properties_total = db.query(func.count(Property.id)).scalar() or 0
    available = (
        db.query(func.count(Property.id)).filter(Property.listing_status == "available").scalar() or 0
    )
    projects_total = db.query(func.count(Project.id)).scalar() or 0
    return StatsOut(
        properties_total=properties_total,
        properties_available=available,
        properties_sold_or_rented=properties_total - available,
        projects_total=projects_total,
        projects_published=db.query(func.count(Project.id)).filter(Project.published.is_(True)).scalar() or 0,
        inquiries_total=db.query(func.count(Inquiry.id)).scalar() or 0,
        inquiries_new=db.query(func.count(Inquiry.id)).filter(Inquiry.status == "new").scalar() or 0,
        consultations_pending=(
            db.query(func.count(ConsultationRequest.id))
            .filter(ConsultationRequest.status == "pending_confirmation")
            .scalar()
            or 0
        ),
        articles_published=db.query(func.count(Article.id)).filter(Article.status == "published").scalar() or 0,
        articles_draft=db.query(func.count(Article.id)).filter(Article.status == "draft").scalar() or 0,
        registered_users=db.query(func.count(User.id)).scalar() or 0,
    )


@router.get("/overview")
def overview(db: Session = Depends(get_db), _: User = Depends(require_editor)) -> dict:
    """Recent activity for the dashboard, straight from stored records."""
    recent_inquiries = (
        db.query(Inquiry).order_by(Inquiry.created_at.desc()).limit(6).all()
    )
    recent_properties = (
        db.query(Property).order_by(Property.updated_at.desc()).limit(5).all()
    )
    status_rows = (
        db.query(Property.listing_status, func.count(Property.id)).group_by(Property.listing_status).all()
    )
    return {
        "recent_inquiries": [InquiryAdminOut.model_validate(row) for row in recent_inquiries],
        "recent_properties": [
            {"id": row.id, "title": row.title, "slug": row.slug, "status": row.listing_status, "updated_at": row.updated_at}
            for row in recent_properties
        ],
        "listing_status_summary": [{"status": status, "count": count} for status, count in status_rows],
    }


# --------------------------------------------------------------------------- #
# Leads
# --------------------------------------------------------------------------- #


@router.get("/inquiries", response_model=Page[InquiryAdminOut])
def list_inquiries(
    db: Session = Depends(get_db),
    _: User = Depends(require_editor),
    q: str | None = None,
    status_filter: str | None = Query(default=None, alias="status"),
    inquiry_type: str | None = None,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[InquiryAdminOut]:
    query = db.query(Inquiry)
    if q:
        like = f"%{q.strip()}%"
        query = query.filter(or_(Inquiry.name.ilike(like), Inquiry.email.ilike(like), Inquiry.message.ilike(like)))
    if status_filter:
        query = query.filter(Inquiry.status == status_filter)
    if inquiry_type:
        query = query.filter(Inquiry.inquiry_type == inquiry_type)

    rows, total, pages = paginate(query.order_by(Inquiry.created_at.desc()), page, page_size)
    return Page[InquiryAdminOut](
        items=[InquiryAdminOut.model_validate(row) for row in rows],
        total=total,
        page=page,
        pages=pages,
        page_size=page_size,
    )


@router.patch("/inquiries/{inquiry_id}", response_model=InquiryAdminOut)
def update_inquiry(
    inquiry_id: int, payload: InquiryUpdate, db: Session = Depends(get_db), _: User = Depends(require_editor)
) -> InquiryAdminOut:
    record = db.get(Inquiry, inquiry_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Inquiry not found.")
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field_name, value)
    db.commit()
    db.refresh(record)
    return InquiryAdminOut.model_validate(record)


@router.get("/inquiries/export")
def export_inquiries(db: Session = Depends(get_db), _: User = Depends(require_editor)) -> Response:
    rows = db.query(Inquiry).order_by(Inquiry.created_at.desc()).all()
    payload = [
        {
            "id": row.id,
            "created_at": row.created_at.isoformat() if row.created_at else "",
            "name": row.name,
            "email": row.email,
            "phone": row.phone or "",
            "company": row.company or "",
            "inquiry_type": row.inquiry_type,
            "source": row.source,
            "property_reference": row.property_reference or "",
            "project_title": row.project_title or "",
            "status": row.status,
            "assigned_to": row.assigned_to or "",
            "message": row.message,
        }
        for row in rows
    ]
    body, headers = csv_response(payload, "urbanledge-leads.csv")
    return Response(content=body, headers=headers, media_type="text/csv")


@router.get("/consultations", response_model=Page[ConsultationAdminOut])
def list_consultations(
    db: Session = Depends(get_db),
    _: User = Depends(require_editor),
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> Page[ConsultationAdminOut]:
    query = db.query(ConsultationRequest)
    if status_filter:
        query = query.filter(ConsultationRequest.status == status_filter)
    rows, total, pages = paginate(query.order_by(ConsultationRequest.created_at.desc()), page, page_size)
    return Page[ConsultationAdminOut](
        items=[ConsultationAdminOut.model_validate(row) for row in rows],
        total=total,
        page=page,
        pages=pages,
        page_size=page_size,
    )


@router.patch("/consultations/{request_id}", response_model=ConsultationAdminOut)
def update_consultation(
    request_id: int,
    payload: ConsultationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_editor),
) -> ConsultationAdminOut:
    record = db.get(ConsultationRequest, request_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Consultation request not found.")
    for field_name, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field_name, value)
    db.commit()
    db.refresh(record)
    return ConsultationAdminOut.model_validate(record)


@router.get("/newsletter", response_model=list[dict])
def list_subscribers(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[dict]:
    rows = db.query(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()).all()
    return [
        {
            "id": row.id,
            "email": row.email,
            "consent": row.consent,
            "created_at": row.created_at,
            "unsubscribed_at": row.unsubscribed_at,
        }
        for row in rows
    ]


# --------------------------------------------------------------------------- #
# Settings, roles and demo data
# --------------------------------------------------------------------------- #


@router.get("/settings", response_model=dict)
def read_settings(db: Session = Depends(get_db), _: User = Depends(require_editor)) -> dict:
    from .content import get_settings

    return get_settings(db)


@router.put("/settings", response_model=dict)
def update_settings(
    payload: SettingsIn, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    from .content import get_settings

    record = db.query(SiteSettings).first()
    if record is None:
        record = SiteSettings(data=payload.data)
        db.add(record)
    else:
        record.data = {**record.data, **payload.data}
    db.commit()
    return get_settings(db)


@router.get("/users", response_model=list[UserPublic])
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> list[UserPublic]:
    rows = db.query(User).order_by(User.created_at.desc()).all()
    return [UserPublic.model_validate(row) for row in rows]


@router.patch("/users/{user_id}/role", response_model=UserPublic)
def set_role(
    user_id: int, role: str, db: Session = Depends(get_db), admin: User = Depends(require_admin)
) -> UserPublic:
    if role not in {item.value for item in Role}:
        raise HTTPException(status_code=400, detail="Unknown role.")
    if user_id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot change your own role.")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    user.role = role
    db.commit()
    db.refresh(user)
    return UserPublic.model_validate(user)


@router.post("/demo-content/purge")
def purge_demo_content(db: Session = Depends(get_db), _: User = Depends(require_admin)) -> dict:
    """Remove every record flagged as demonstration content."""
    removed = {}
    for model in (Property, Project, Article, Faq, GalleryImage):
        count = db.query(model).filter(model.is_demo.is_(True)).delete(synchronize_session=False)
        removed[model.__tablename__] = count
    db.commit()
    return {"removed": removed, "demo_accounts": [settings.demo_admin_email, settings.demo_editor_email]}

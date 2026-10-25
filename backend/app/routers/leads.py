"""Public form submissions and signed-in customer features."""

from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import (
    ConsultationRequest,
    Inquiry,
    NewsletterSubscriber,
    Project,
    Property,
    SavedProject,
    SavedProperty,
    User,
    utcnow,
)
from ..schemas import (
    ConsultationIn,
    ConsultationOut,
    InquiryIn,
    InquiryOut,
    Message,
    NewsletterIn,
    PropertyOut,
    ProjectOut,
    SubmissionOut,
)
from ..security import require_user
from ..utils import RateLimiter

router = APIRouter(tags=["leads"])

_inquiry_limiter = RateLimiter(settings.inquiry_rate_limit)
_consultation_limiter = RateLimiter(settings.inquiry_rate_limit)
_newsletter_limiter = RateLimiter(60)

RECEIVED = "Thank you — your enquiry has been received and a member of the team will respond."
PENDING = (
    "Your request has been received. Preferred times are requests only — the team "
    "will confirm a slot with you directly."
)


def _client_key(request: Request) -> str:
    return (request.client.host if request.client else "unknown") or "unknown"


def _attach_context(db: Session, payload: dict) -> dict:
    """Resolve the property/project a submission refers to server-side."""
    property_id = payload.pop("property_id", None)
    project_id = payload.pop("project_id", None)
    if property_id is not None:
        record = db.get(Property, property_id)
        if record is None:
            raise HTTPException(status_code=404, detail="That property is no longer listed.")
        payload["property_id"] = record.id
        payload["property_reference"] = record.reference
    if project_id is not None:
        record = db.get(Project, project_id)
        if record is None:
            raise HTTPException(status_code=404, detail="That project could not be found.")
        payload["project_id"] = record.id
        payload["project_title"] = record.title
    return payload


@router.post("/inquiries", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def create_inquiry(
    payload: InquiryIn, request: Request, db: Session = Depends(get_db)
) -> SubmissionOut:
    _inquiry_limiter.check(_client_key(request))
    data = _attach_context(db, payload.model_dump())
    data["email"] = data["email"].lower()

    # Guard against a double-click creating two identical leads.
    recent = (
        db.query(Inquiry)
        .filter(
            Inquiry.email == data["email"],
            Inquiry.message == data["message"],
            Inquiry.created_at >= utcnow() - timedelta(minutes=2),
        )
        .order_by(Inquiry.id.desc())
        .first()
    )
    if recent is not None:
        return SubmissionOut(id=recent.id, status=recent.status, message=RECEIVED)

    inquiry = Inquiry(**data)
    db.add(inquiry)
    db.commit()
    db.refresh(inquiry)
    return SubmissionOut(id=inquiry.id, status=inquiry.status, message=RECEIVED)


@router.post("/consultations", response_model=SubmissionOut, status_code=status.HTTP_201_CREATED)
def create_consultation(
    payload: ConsultationIn, request: Request, db: Session = Depends(get_db)
) -> SubmissionOut:
    _consultation_limiter.check(_client_key(request))
    data = payload.model_dump()
    data["email"] = data["email"].lower()
    data["status"] = "pending_confirmation"

    duplicate = (
        db.query(ConsultationRequest)
        .filter(
            ConsultationRequest.email == data["email"],
            ConsultationRequest.preferred_date == data.get("preferred_date"),
            ConsultationRequest.preferred_time == data.get("preferred_time"),
            ConsultationRequest.created_at >= utcnow() - timedelta(minutes=2),
        )
        .first()
    )
    if duplicate is not None:
        return SubmissionOut(id=duplicate.id, status=duplicate.status, message=PENDING)

    record = ConsultationRequest(**data)
    db.add(record)
    db.commit()
    db.refresh(record)
    return SubmissionOut(id=record.id, status=record.status, message=PENDING)


@router.post("/newsletter", response_model=Message, status_code=status.HTTP_201_CREATED)
def subscribe(payload: NewsletterIn, request: Request, db: Session = Depends(get_db)) -> Message:
    _newsletter_limiter.check(_client_key(request))
    email = payload.email.lower()
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == email).first()
    if existing is None:
        db.add(NewsletterSubscriber(email=email, consent=payload.consent))
        db.commit()
    return Message(message="You are on the list. Every message includes an unsubscribe link.")


@router.get("/me/inquiries", response_model=list[InquiryOut])
def my_inquiries(user: User = Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(Inquiry)
        .filter(Inquiry.email == user.email.lower())
        .order_by(Inquiry.created_at.desc())
        .all()
    )
    return [InquiryOut.model_validate(row) for row in rows]


@router.get("/me/consultations", response_model=list[ConsultationOut])
def my_consultations(user: User = Depends(require_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ConsultationRequest)
        .filter(ConsultationRequest.email == user.email.lower())
        .order_by(ConsultationRequest.created_at.desc())
        .all()
    )
    return [ConsultationOut.model_validate(row) for row in rows]


@router.get("/me/saved")
def my_saved(user: User = Depends(require_user), db: Session = Depends(get_db)) -> dict:
    properties = [link.property for link in user.saved_properties if link.property is not None]
    projects = [link.project for link in user.saved_projects if link.project is not None]
    return {
        "properties": [PropertyOut.model_validate(item) for item in properties],
        "projects": [ProjectOut.model_validate(item) for item in projects],
    }


@router.post("/me/saved/properties/{property_id}", response_model=Message)
def save_property(
    property_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)
) -> Message:
    if db.get(Property, property_id) is None:
        raise HTTPException(status_code=404, detail="Property not found.")
    existing = (
        db.query(SavedProperty)
        .filter(SavedProperty.user_id == user.id, SavedProperty.property_id == property_id)
        .first()
    )
    if existing is None:
        db.add(SavedProperty(user_id=user.id, property_id=property_id))
        db.commit()
    return Message(message="Saved to your shortlist.")


@router.delete("/me/saved/properties/{property_id}", response_model=Message)
def unsave_property(
    property_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)
) -> Message:
    db.query(SavedProperty).filter(
        SavedProperty.user_id == user.id, SavedProperty.property_id == property_id
    ).delete()
    db.commit()
    return Message(message="Removed from your shortlist.")


@router.post("/me/saved/projects/{project_id}", response_model=Message)
def save_project(
    project_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)
) -> Message:
    if db.get(Project, project_id) is None:
        raise HTTPException(status_code=404, detail="Project not found.")
    existing = (
        db.query(SavedProject)
        .filter(SavedProject.user_id == user.id, SavedProject.project_id == project_id)
        .first()
    )
    if existing is None:
        db.add(SavedProject(user_id=user.id, project_id=project_id))
        db.commit()
    return Message(message="Saved to your shortlist.")


@router.delete("/me/saved/projects/{project_id}", response_model=Message)
def unsave_project(
    project_id: int, user: User = Depends(require_user), db: Session = Depends(get_db)
) -> Message:
    db.query(SavedProject).filter(
        SavedProject.user_id == user.id, SavedProject.project_id == project_id
    ).delete()
    db.commit()
    return Message(message="Removed from your shortlist.")

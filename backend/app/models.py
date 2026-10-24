"""Persistent data model.

Identifiers are surrogate keys; every publicly addressable record also carries a
unique slug so URLs stay stable when a title changes. List-like attributes are
stored as JSON arrays, which keeps the demo dataset readable while a production
deployment can normalise the ones that need their own tables.
"""

from __future__ import annotations

from datetime import date, datetime, timezone
from enum import StrEnum

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Role(StrEnum):
    ADMIN = "admin"
    EDITOR = "editor"
    CUSTOMER = "customer"


class InquiryStatus(StrEnum):
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    IN_PROGRESS = "in_progress"
    CONVERTED = "converted"
    CLOSED = "closed"


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(160))
    role: Mapped[str] = mapped_column(String(20), default=Role.CUSTOMER.value)
    password_hash: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    saved_properties: Mapped[list["SavedProperty"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    saved_projects: Mapped[list["SavedProject"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    @property
    def is_admin(self) -> bool:
        return self.role == Role.ADMIN.value

    @property
    def can_edit(self) -> bool:
        return self.role in {Role.ADMIN.value, Role.EDITOR.value}


class Property(TimestampMixin, Base):
    """A listing that is available to buy, rent or enquire about."""

    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    reference: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text, default="")
    excerpt: Mapped[str] = mapped_column(String(400), default="")

    property_type: Mapped[str] = mapped_column(String(40), index=True)
    transaction_type: Mapped[str] = mapped_column(String(10), default="buy", index=True)
    listing_status: Mapped[str] = mapped_column(String(30), default="available", index=True)

    price: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    price_period: Mapped[str | None] = mapped_column(String(20))

    location: Mapped[str] = mapped_column(String(160), index=True)
    address: Mapped[str | None] = mapped_column(String(255))
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)

    area_sqm: Mapped[float | None] = mapped_column(Float)
    bedrooms: Mapped[int | None] = mapped_column(Integer)
    bathrooms: Mapped[int | None] = mapped_column(Integer)
    furnished: Mapped[str | None] = mapped_column(String(20))

    amenities: Mapped[list] = mapped_column(JSON, default=list)
    images: Mapped[list] = mapped_column(JSON, default=list)
    floor_plans: Mapped[list] = mapped_column(JSON, default=list)
    documents: Mapped[list] = mapped_column(JSON, default=list)

    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id", ondelete="SET NULL"))

    seo_title: Mapped[str | None] = mapped_column(String(200))
    seo_description: Mapped[str | None] = mapped_column(String(320))

    project: Mapped["Project | None"] = relationship(back_populates="properties")


class Project(TimestampMixin, Base):
    """A development project in the portfolio."""

    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    tagline: Mapped[str] = mapped_column(String(200), default="")
    overview: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    design_concept: Mapped[str] = mapped_column(Text, default="")

    category: Mapped[str] = mapped_column(String(40), index=True)
    location: Mapped[str] = mapped_column(String(160), index=True)
    status: Mapped[str] = mapped_column(String(30), default="planning", index=True)

    hero_image: Mapped[str | None] = mapped_column(String(400))
    gallery: Mapped[list] = mapped_column(JSON, default=list)
    highlights: Mapped[list] = mapped_column(JSON, default=list)
    sustainability: Mapped[list] = mapped_column(JSON, default=list)
    amenities: Mapped[list] = mapped_column(JSON, default=list)
    specifications: Mapped[list] = mapped_column(JSON, default=list)
    services: Mapped[list] = mapped_column(JSON, default=list)

    price_from: Mapped[float | None] = mapped_column(Float)
    currency: Mapped[str] = mapped_column(String(8), default="USD")
    total_area_sqm: Mapped[float | None] = mapped_column(Float)
    unit_count: Mapped[int | None] = mapped_column(Integer)
    bedrooms_range: Mapped[str | None] = mapped_column(String(40))
    completion_date: Mapped[date | None] = mapped_column(Date)
    developer: Mapped[str | None] = mapped_column(String(160))
    architect: Mapped[str | None] = mapped_column(String(160))
    availability_note: Mapped[str | None] = mapped_column(String(255))

    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)

    seo_title: Mapped[str | None] = mapped_column(String(200))
    seo_description: Mapped[str | None] = mapped_column(String(320))

    properties: Mapped[list[Property]] = relationship(back_populates="project")


class Service(TimestampMixin, Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(160))
    summary: Mapped[str] = mapped_column(String(300), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(40), default="building")
    image: Mapped[str | None] = mapped_column(String(400))
    deliverables: Mapped[list] = mapped_column(JSON, default=list)
    process: Mapped[list] = mapped_column(JSON, default=list)
    related_project_slugs: Mapped[list] = mapped_column(JSON, default=list)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)


class Article(TimestampMixin, Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(180), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(220))
    excerpt: Mapped[str] = mapped_column(String(400), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    cover_image: Mapped[str | None] = mapped_column(String(400))
    category: Mapped[str] = mapped_column(String(60), index=True)
    author: Mapped[str] = mapped_column(String(120), default="UrbanLedge Editorial")
    published_at: Mapped[date | None] = mapped_column(Date)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    reading_minutes: Mapped[int] = mapped_column(Integer, default=5)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)

    seo_title: Mapped[str | None] = mapped_column(String(200))
    seo_description: Mapped[str | None] = mapped_column(String(320))


class Faq(TimestampMixin, Base):
    __tablename__ = "faqs"

    id: Mapped[int] = mapped_column(primary_key=True)
    question: Mapped[str] = mapped_column(String(300))
    answer: Mapped[str] = mapped_column(Text)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)


class GalleryImage(TimestampMixin, Base):
    __tablename__ = "gallery_images"

    id: Mapped[int] = mapped_column(primary_key=True)
    image: Mapped[str] = mapped_column(String(400))
    title: Mapped[str] = mapped_column(String(200), default="")
    caption: Mapped[str] = mapped_column(String(400), default="")
    credit: Mapped[str] = mapped_column(String(300), default="")
    category: Mapped[str] = mapped_column(String(60), default="architecture", index=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id", ondelete="SET NULL"))
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    published: Mapped[bool] = mapped_column(Boolean, default=True)


class Inquiry(TimestampMixin, Base):
    """A lead captured by any public form."""

    __tablename__ = "inquiries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(160))
    inquiry_type: Mapped[str] = mapped_column(String(60), index=True)
    source: Mapped[str] = mapped_column(String(40), default="contact")
    message: Mapped[str] = mapped_column(Text, default="")

    property_id: Mapped[int | None] = mapped_column(ForeignKey("properties.id", ondelete="SET NULL"))
    property_reference: Mapped[str | None] = mapped_column(String(40))
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id", ondelete="SET NULL"))
    project_title: Mapped[str | None] = mapped_column(String(200))

    consent: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default=InquiryStatus.NEW.value, index=True)
    internal_notes: Mapped[str] = mapped_column(Text, default="")
    assigned_to: Mapped[str | None] = mapped_column(String(160))
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class ConsultationRequest(TimestampMixin, Base):
    __tablename__ = "consultation_requests"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(40))
    company: Mapped[str | None] = mapped_column(String(160))
    inquiry_type: Mapped[str] = mapped_column(String(60))

    preferred_date: Mapped[date | None] = mapped_column(Date)
    preferred_time: Mapped[str | None] = mapped_column(String(20))
    timezone: Mapped[str | None] = mapped_column(String(60))
    project_location: Mapped[str | None] = mapped_column(String(160))
    budget: Mapped[str | None] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text, default="")

    consent: Mapped[bool] = mapped_column(Boolean, default=False)
    # No calendar provider is connected, so every requested slot is a
    # preference that a human still has to confirm.
    status: Mapped[str] = mapped_column(String(20), default="pending_confirmation", index=True)
    internal_notes: Mapped[str] = mapped_column(Text, default="")
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))


class NewsletterSubscriber(TimestampMixin, Base):
    __tablename__ = "newsletter_subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    consent: Mapped[bool] = mapped_column(Boolean, default=True)
    unsubscribed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class SavedProperty(TimestampMixin, Base):
    __tablename__ = "saved_properties"
    __table_args__ = (UniqueConstraint("user_id", "property_id", name="uq_saved_property"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    property_id: Mapped[int] = mapped_column(
        ForeignKey("properties.id", ondelete="CASCADE"), index=True
    )

    user: Mapped[User] = relationship(back_populates="saved_properties")
    property: Mapped[Property] = relationship()


class SavedProject(TimestampMixin, Base):
    __tablename__ = "saved_projects"
    __table_args__ = (UniqueConstraint("user_id", "project_id", name="uq_saved_project"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), index=True
    )

    user: Mapped[User] = relationship(back_populates="saved_projects")
    project: Mapped[Project] = relationship()


class SiteSettings(TimestampMixin, Base):
    """Single-row store for editable site-wide content."""

    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    data: Mapped[dict] = mapped_column(JSON, default=dict)

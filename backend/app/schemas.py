"""Request and response schemas.

Public-facing schemas never expose internal notes, other customers' records or
authentication material.
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Generic, Literal, TypeVar

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

T = TypeVar("T")

LISTING_STATUS = Literal["available", "under_offer", "rented", "sold", "withdrawn"]


class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    pages: int
    page_size: int


class Message(BaseModel):
    message: str


class SubmissionOut(BaseModel):
    """Acknowledgement for a public form. Carries no internal fields."""

    id: int
    status: str
    message: str


# --------------------------------------------------------------------------- #
# Accounts
# --------------------------------------------------------------------------- #


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    role: str
    created_at: datetime


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class ProfileIn(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=160)
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserPublic


# --------------------------------------------------------------------------- #
# Properties
# --------------------------------------------------------------------------- #


class PropertyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    reference: str
    title: str
    excerpt: str
    description: str
    property_type: str
    transaction_type: str
    listing_status: str
    price: float | None
    currency: str
    price_period: str | None
    location: str
    address: str | None
    latitude: float | None
    longitude: float | None
    area_sqm: float | None
    bedrooms: int | None
    bathrooms: int | None
    furnished: str | None
    amenities: list[Any]
    images: list[Any]
    floor_plans: list[Any]
    documents: list[Any]
    featured: bool
    is_demo: bool
    project_id: int | None
    seo_title: str | None
    seo_description: str | None
    created_at: datetime
    updated_at: datetime


class PropertyIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    excerpt: str = Field(default="", max_length=400)
    description: str = ""
    property_type: str
    transaction_type: Literal["buy", "rent"] = "buy"
    listing_status: LISTING_STATUS = "available"
    price: float | None = Field(default=None, ge=0)
    currency: str = Field(default="USD", max_length=8)
    price_period: str | None = None
    location: str = Field(min_length=2, max_length=160)
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    area_sqm: float | None = Field(default=None, ge=0)
    bedrooms: int | None = Field(default=None, ge=0, le=60)
    bathrooms: int | None = Field(default=None, ge=0, le=60)
    furnished: str | None = None
    amenities: list[str] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)
    floor_plans: list[dict[str, str]] = Field(default_factory=list)
    documents: list[dict[str, str]] = Field(default_factory=list)
    featured: bool = False
    is_demo: bool = True
    project_id: int | None = None
    seo_title: str | None = None
    seo_description: str | None = None


class PropertyUpdate(PropertyIn):
    title: str | None = Field(default=None, min_length=3, max_length=200)  # type: ignore[assignment]
    property_type: str | None = None  # type: ignore[assignment]
    location: str | None = None  # type: ignore[assignment]
    slug: str | None = None


class PropertyFacets(BaseModel):
    types: list[str]
    locations: list[str]
    statuses: list[str]
    transaction_types: list[str]
    min_price: float | None
    max_price: float | None
    max_area: float | None


# --------------------------------------------------------------------------- #
# Projects
# --------------------------------------------------------------------------- #


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    tagline: str
    overview: str
    description: str
    design_concept: str
    category: str
    location: str
    status: str
    hero_image: str | None
    gallery: list[Any]
    highlights: list[Any]
    sustainability: list[Any]
    amenities: list[Any]
    specifications: list[Any]
    services: list[Any]
    price_from: float | None
    currency: str
    total_area_sqm: float | None
    unit_count: int | None
    bedrooms_range: str | None
    completion_date: date | None
    developer: str | None
    architect: str | None
    availability_note: str | None
    featured: bool
    published: bool
    is_demo: bool
    display_order: int
    seo_title: str | None
    seo_description: str | None


class ProjectIn(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    tagline: str = ""
    overview: str = ""
    description: str = ""
    design_concept: str = ""
    category: str
    location: str
    status: str = "Planning"
    hero_image: str | None = None
    gallery: list[str] = Field(default_factory=list)
    highlights: list[str] = Field(default_factory=list)
    sustainability: list[str] = Field(default_factory=list)
    amenities: list[str] = Field(default_factory=list)
    specifications: list[dict[str, str]] = Field(default_factory=list)
    services: list[str] = Field(default_factory=list)
    price_from: float | None = None
    currency: str = "USD"
    total_area_sqm: float | None = None
    unit_count: int | None = None
    bedrooms_range: str | None = None
    completion_date: date | None = None
    developer: str | None = None
    architect: str | None = None
    availability_note: str | None = None
    featured: bool = False
    published: bool = True
    is_demo: bool = True
    display_order: int = 0
    seo_title: str | None = None
    seo_description: str | None = None


class ProjectUpdate(ProjectIn):
    title: str | None = Field(default=None, min_length=3, max_length=200)  # type: ignore[assignment]
    category: str | None = None  # type: ignore[assignment]
    location: str | None = None  # type: ignore[assignment]
    slug: str | None = None


# --------------------------------------------------------------------------- #
# Editorial content
# --------------------------------------------------------------------------- #


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    summary: str
    description: str
    icon: str
    image: str | None
    deliverables: list[Any]
    process: list[Any]
    related_project_slugs: list[Any]
    published: bool
    display_order: int


class ServiceIn(BaseModel):
    title: str = Field(min_length=3, max_length=160)
    summary: str = ""
    description: str = ""
    icon: str = "building"
    image: str | None = None
    deliverables: list[str] = Field(default_factory=list)
    process: list[dict[str, str]] = Field(default_factory=list)
    related_project_slugs: list[str] = Field(default_factory=list)
    published: bool = True
    display_order: int = 0
    slug: str | None = None


class ArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    excerpt: str
    content: str
    cover_image: str | None
    category: str
    author: str
    published_at: date | None
    status: str
    reading_minutes: int
    is_demo: bool
    seo_title: str | None
    seo_description: str | None


class ArticleSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    title: str
    excerpt: str
    cover_image: str | None
    category: str
    author: str
    published_at: date | None
    reading_minutes: int


class ArticleIn(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    excerpt: str = ""
    content: str = ""
    cover_image: str | None = None
    category: str = "Market insights"
    author: str = "UrbanLedge Editorial"
    published_at: date | None = None
    status: Literal["draft", "published", "archived"] = "draft"
    reading_minutes: int = 5
    is_demo: bool = True
    seo_title: str | None = None
    seo_description: str | None = None
    slug: str | None = None


class FaqOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    answer: str
    display_order: int
    published: bool


class FaqIn(BaseModel):
    question: str = Field(min_length=5, max_length=300)
    answer: str = Field(min_length=5)
    display_order: int = 0
    published: bool = True
    is_demo: bool = True


class GalleryImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    image: str
    title: str
    caption: str
    credit: str
    category: str
    project_id: int | None
    display_order: int
    published: bool


class GalleryImageIn(BaseModel):
    image: str
    title: str = ""
    caption: str = ""
    credit: str = ""
    category: str = "architecture"
    project_id: int | None = None
    display_order: int = 0
    published: bool = True


# --------------------------------------------------------------------------- #
# Leads
# --------------------------------------------------------------------------- #


class InquiryIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)
    inquiry_type: str = "General inquiry"
    message: str = Field(min_length=10, max_length=4000)
    consent: bool
    source: Literal["contact", "property", "project", "viewing", "services"] = "contact"
    property_id: int | None = None
    project_id: int | None = None

    @field_validator("consent")
    @classmethod
    def _consent_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Please accept the privacy policy to continue.")
        return value


class InquiryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    phone: str | None
    inquiry_type: str
    message: str
    property_reference: str | None
    project_title: str | None
    status: str
    created_at: datetime


class InquiryAdminOut(InquiryOut):
    company: str | None
    source: str
    internal_notes: str
    assigned_to: str | None
    property_id: int | None
    project_id: int | None
    updated_at: datetime


class InquiryUpdate(BaseModel):
    status: Literal[
        "new", "contacted", "qualified", "in_progress", "converted", "closed"
    ] | None = None
    internal_notes: str | None = None
    assigned_to: str | None = None


class ConsultationIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=40)
    company: str | None = Field(default=None, max_length=160)
    inquiry_type: str = "General inquiry"
    preferred_date: date | None = None
    preferred_time: str | None = Field(default=None, max_length=20)
    timezone: str | None = Field(default=None, max_length=60)
    project_location: str | None = Field(default=None, max_length=160)
    budget: str | None = Field(default=None, max_length=80)
    description: str = Field(min_length=10, max_length=4000)
    consent: bool

    @field_validator("consent")
    @classmethod
    def _consent_required(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Please accept the privacy policy to continue.")
        return value


class ConsultationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    email: EmailStr
    inquiry_type: str
    preferred_date: date | None
    preferred_time: str | None
    timezone: str | None
    status: str
    created_at: datetime


class ConsultationAdminOut(ConsultationOut):
    phone: str | None
    company: str | None
    project_location: str | None
    budget: str | None
    description: str
    internal_notes: str
    updated_at: datetime


class ConsultationUpdate(BaseModel):
    status: Literal[
        "pending_confirmation", "confirmed", "completed", "cancelled"
    ] | None = None
    internal_notes: str | None = None


class NewsletterIn(BaseModel):
    email: EmailStr
    consent: bool = True


class SettingsIn(BaseModel):
    data: dict[str, Any]


class StatsOut(BaseModel):
    properties_total: int
    properties_available: int
    properties_sold_or_rented: int
    projects_total: int
    projects_published: int
    inquiries_total: int
    inquiries_new: int
    consultations_pending: int
    articles_published: int
    articles_draft: int
    registered_users: int

"""First-boot seeding.

Idempotent: content is only inserted when the relevant table is empty, so a
restart never duplicates the demo dataset. Every seeded record is flagged as
demonstration content and can be purged from the admin dashboard.
"""

from __future__ import annotations

import logging

from sqlalchemy.orm import Session

from .config import settings
from .demo_content import ARTICLES, DEFAULT_SETTINGS, FAQS, GALLERY, PROJECTS, PROPERTIES, SERVICES
from .models import (
    Article,
    Faq,
    GalleryImage,
    Project,
    Property,
    Role,
    Service,
    SiteSettings,
    User,
)
from .security import hash_password
from .utils import slugify

logger = logging.getLogger(__name__)


def seed_users(db: Session) -> None:
    accounts = [
        (settings.demo_admin_email, "Demo Administrator", Role.ADMIN.value, settings.demo_admin_password),
        (settings.demo_editor_email, "Demo Editor", Role.EDITOR.value, settings.demo_editor_password),
    ]
    for email, name, role, password in accounts:
        if db.query(User).filter(User.email == email.lower()).first() is None:
            db.add(
                User(
                    name=name,
                    email=email.lower(),
                    role=role,
                    password_hash=hash_password(password),
                )
            )
            logger.info("Created %s account %s (demo credentials, change before launch)", role, email)
    db.commit()


def seed_content(db: Session) -> None:
    if db.query(SiteSettings).first() is None:
        db.add(SiteSettings(data=DEFAULT_SETTINGS))

    if db.query(Project).count() == 0:
        for item in PROJECTS:
            db.add(Project(**item, is_demo=True, currency=DEFAULT_SETTINGS["locale"]["currency"]))
        db.commit()
        logger.info("Seeded %d demonstration projects", len(PROJECTS))

    projects_by_slug = {project.slug: project.id for project in db.query(Project).all()}

    if db.query(Property).count() == 0:
        used_slugs = {row[0] for row in db.query(Property.slug).all()}
        for item in PROPERTIES:
            data = dict(item)
            project_slug = data.pop("project_slug", None)
            data.setdefault("currency", DEFAULT_SETTINGS["locale"]["currency"])
            data["project_id"] = projects_by_slug.get(project_slug) if project_slug else None
            base = slugify(data["title"])
            candidate, suffix = base, 2
            while candidate in used_slugs:
                candidate = f"{base}-{suffix}"
                suffix += 1
            used_slugs.add(candidate)
            data["slug"] = candidate
            db.add(Property(**data, is_demo=True))
        db.commit()
        logger.info("Seeded %d demonstration listings", len(PROPERTIES))

    if db.query(Service).count() == 0:
        for item in SERVICES:
            db.add(Service(**item))
        db.commit()

    if db.query(Article).count() == 0:
        for item in ARTICLES:
            db.add(Article(**item, is_demo=True))
        db.commit()

    if db.query(Faq).count() == 0:
        for item in FAQS:
            db.add(Faq(**item, is_demo=True))
        db.commit()

    if db.query(GalleryImage).count() == 0:
        for item in GALLERY:
            data = dict(item)
            project_slug = data.pop("project_slug", None)
            data["project_id"] = projects_by_slug.get(project_slug) if project_slug else None
            db.add(GalleryImage(**data))
        db.commit()

    db.commit()


def run(db: Session) -> None:
    seed_users(db)
    if settings.seed_demo_content:
        seed_content(db)
        logger.info("Demonstration content is in place and flagged as demo data.")

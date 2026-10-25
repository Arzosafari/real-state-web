"""UrbanLedge API application factory."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .db import SessionLocal, init_db
from .routers import admin, admin_crud, auth, content, leads, properties, projects
from .utils import (
    INQUIRY_TYPES,
    LISTING_STATUSES,
    PROJECT_CATEGORIES,
    PROJECT_STATUSES,
    PROPERTY_TYPES,
)

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("urbanledge")


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    from .seed import run as seed

    with SessionLocal() as db:
        seed(db)
    logger.info("UrbanLedge API ready")
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description=(
        "Property listings, development projects, editorial content and lead capture "
        "for the UrbanLedge demonstration website."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    """Return field-level messages the forms can display directly."""
    errors = [
        {
            "field": ".".join(str(part) for part in error.get("loc", ()) if part != "body"),
            "message": error.get("msg", "Invalid value."),
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={"detail": "Please check the highlighted fields.", "errors": errors},
    )


@app.get("/api/health", tags=["meta"])
def health() -> dict:
    return {"status": "ok", "service": settings.app_name}


@app.get(f"{settings.api_prefix}/meta", tags=["meta"])
def meta() -> dict:
    """Reference lists used by the public forms and filters."""
    return {
        "inquiry_types": INQUIRY_TYPES,
        "property_types": PROPERTY_TYPES,
        "project_categories": PROJECT_CATEGORIES,
        "project_statuses": PROJECT_STATUSES,
        "listing_statuses": LISTING_STATUSES,
        "demo_notice": (
            "Projects, listings, articles and statistics on this site are demonstration "
            "content until an administrator replaces them."
        ),
    }


for router in (
    auth.router,
    properties.router,
    projects.router,
    content.router,
    leads.router,
    admin.router,
    *admin_crud.all_routers(),
):
    app.include_router(router, prefix=settings.api_prefix)

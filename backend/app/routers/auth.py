"""Account registration, sign-in and profile management."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Role, User
from ..schemas import LoginIn, Message, ProfileIn, RegisterIn, TokenOut, UserPublic
from ..security import create_access_token, current_user, hash_password, require_user, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


def _token_response(user: User) -> TokenOut:
    token, expires_in = create_access_token(user)
    return TokenOut(access_token=token, expires_in=expires_in, user=UserPublic.model_validate(user))


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    email = payload.email.lower()
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists.")

    user = User(
        name=payload.name.strip(),
        email=email,
        phone=payload.phone,
        company=payload.company,
        role=Role.CUSTOMER.value,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account has been deactivated.")
    return _token_response(user)


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(require_user)) -> UserPublic:
    return UserPublic.model_validate(user)


@router.patch("/me", response_model=UserPublic)
def update_profile(
    payload: ProfileIn, user: User = Depends(require_user), db: Session = Depends(get_db)
) -> UserPublic:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return UserPublic.model_validate(user)


@router.post("/password", response_model=Message)
def change_password(
    current: str,
    new: str,
    user: User = Depends(require_user),
    db: Session = Depends(get_db),
) -> Message:
    if not verify_password(current, user.password_hash):
        raise HTTPException(status_code=400, detail="Your current password is incorrect.")
    if len(new) < 8:
        raise HTTPException(status_code=400, detail="Choose a password of at least 8 characters.")
    user.password_hash = hash_password(new)
    db.commit()
    return Message(message="Your password has been updated.")


@router.post("/forgot-password", response_model=Message, status_code=status.HTTP_202_ACCEPTED)
def forgot_password(email: str, db: Session = Depends(get_db)) -> Message:
    """Record the request without revealing whether the address exists.

    Delivering the reset link needs a transactional email provider; until one is
    configured the request is only acknowledged, never completed silently.
    """
    user = db.query(User).filter(User.email == email.lower()).first()
    if user is not None:
        # A real deployment hands this to the mail provider. Nothing is logged
        # here beyond the account id, and no token is issued without delivery.
        pass
    return Message(
        message=(
            "If an account exists for that address, reset instructions will be sent "
            "once email delivery is configured."
        )
    )


@router.get("/session", response_model=UserPublic | None)
def session(user: User | None = Depends(current_user)) -> UserPublic | None:
    return UserPublic.model_validate(user) if user else None

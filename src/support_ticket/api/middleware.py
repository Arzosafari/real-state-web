"""ASGI middleware enforcing a request body size limit.

The limit is enforced for declared ``Content-Length`` and, because a client can omit it,
also while a body is streamed: the wrapper counts bytes as they arrive.
"""

from __future__ import annotations

from starlette.datastructures import Headers
from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class BodySizeLimitMiddleware:
    """Reject request bodies larger than ``max_bytes`` with HTTP 413."""

    def __init__(self, app: ASGIApp, max_bytes: int) -> None:
        self.app = app
        self.max_bytes = int(max_bytes)

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        headers = Headers(scope=scope)
        declared = headers.get("content-length")
        if declared:
            try:
                if int(declared) > self.max_bytes:
                    await self._reject(scope, receive, send)
                    return
            except ValueError:
                await self._reject(scope, receive, send, reason="invalid Content-Length header")
                return

        received = 0
        too_large = False
        response_started = False

        async def counting_receive() -> Message:
            nonlocal received, too_large
            message = await receive()
            if message["type"] == "http.request":
                received += len(message.get("body", b""))
                if received > self.max_bytes:
                    too_large = True
                    return {"type": "http.disconnect"}
            return message

        async def guarding_send(message: Message) -> None:
            nonlocal response_started
            if too_large and not response_started:
                # Drop the application's late response; a 413 is sent instead.
                return
            if message["type"] == "http.response.start":
                response_started = True
            await send(message)

        try:
            await self.app(scope, counting_receive, guarding_send)
        except Exception:  # noqa: BLE001 - the client is being rejected either way
            if not too_large:
                raise

        if too_large and not response_started:
            await self._reject(scope, receive, send)

    async def _reject(
        self,
        scope: Scope,
        receive: Receive,
        send: Send,
        reason: str = "request body exceeds the configured maximum size",
    ) -> None:
        response = JSONResponse(
            status_code=413,
            content={"detail": f"{reason} (limit: {self.max_bytes} bytes)"},
        )
        await response(scope, receive, send)

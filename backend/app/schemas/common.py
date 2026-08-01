"""Shared Pydantic schemas (typed response envelope + pagination).

The envelope typed with ``Generic[T]`` mirrors ``core.response`` but as a schema, so
endpoints can declare ``response_model=APIResponse[SomeModel]`` and get OpenAPI
documentation *and* runtime serialization for free.
"""

from typing import Any

from pydantic import BaseModel, Field


class APIResponse[T](BaseModel):
    success: bool = True
    data: T | None = None
    message: str = "OK"
    errors: list[dict[str, Any]] | None = None
    meta: dict[str, Any] | None = None


class PaginationMeta(BaseModel):
    page: int = Field(ge=1)
    per_page: int = Field(ge=1)
    total: int = Field(ge=0)

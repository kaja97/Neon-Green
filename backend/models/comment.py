"""Community comments on shared project issues.

A comment may be a top-level remark on the issue (``parent_id`` is NULL) or a
reply to another comment (``parent_id`` points at the parent). The
self-referencing FK allows arbitrarily deep reply trees — built in Python by
the disease service (flat fetch + in-memory tree assembly).

``author_id`` references ``farmer_profiles.id`` (not ``accounts.id``) so the
display name and avatar can be joined directly without going through Account.
"""
from sqlalchemy import String, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from .base import BaseModel
import uuid


class IssueComment(BaseModel):
    __tablename__ = "issue_comments"

    issue_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project_issues.id", ondelete="CASCADE"), nullable=False
    )
    author_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False
    )
    # NULL = top-level comment on the issue; set = reply to another comment.
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("issue_comments.id", ondelete="CASCADE"), nullable=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)
    images: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

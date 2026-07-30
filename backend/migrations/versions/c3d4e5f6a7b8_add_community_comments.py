"""Add issue_comments table and is_shared_to_community column on project_issues

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-21 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, Sequence[str], None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create issue_comments table and add is_shared_to_community to project_issues."""

    # ── 1. issue_comments table ──
    op.create_table(
        'issue_comments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('issue_id', UUID(as_uuid=True),
                  sa.ForeignKey('project_issues.id', ondelete='CASCADE'), nullable=False),
        sa.Column('author_id', UUID(as_uuid=True),
                  sa.ForeignKey('farmer_profiles.id', ondelete='CASCADE'), nullable=False),
        sa.Column('parent_id', UUID(as_uuid=True),
                  sa.ForeignKey('issue_comments.id', ondelete='CASCADE'), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('images', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_issue_comments_issue_id', 'issue_comments', ['issue_id'])
    op.create_index('ix_issue_comments_parent_id', 'issue_comments', ['parent_id'])
    op.create_index('ix_issue_comments_author_id', 'issue_comments', ['author_id'])

    # ── 2. Add is_shared_to_community to project_issues ──
    op.add_column(
        'project_issues',
        sa.Column('is_shared_to_community', sa.Boolean(), nullable=False, server_default=sa.text('false'))
    )
    op.create_index('ix_project_issues_shared', 'project_issues', ['is_shared_to_community'])


def downgrade() -> None:
    """Drop issue_comments and remove is_shared_to_community."""
    op.drop_index('ix_project_issues_shared', table_name='project_issues')
    op.drop_column('project_issues', 'is_shared_to_community')
    op.drop_index('ix_issue_comments_author_id', table_name='issue_comments')
    op.drop_index('ix_issue_comments_parent_id', table_name='issue_comments')
    op.drop_index('ix_issue_comments_issue_id', table_name='issue_comments')
    op.drop_table('issue_comments')

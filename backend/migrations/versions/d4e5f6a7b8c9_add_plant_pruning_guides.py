"""Add plant_pruning_guides table

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-30 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'plant_pruning_guides',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('plant_stage_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('pruning_type', sa.String(length=50), nullable=False),
        sa.Column('pruning_method', sa.Text(), nullable=False),
        sa.Column('trigger_day', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('frequency_days', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('pre_pruning', sa.Text(), nullable=True),
        sa.Column('post_pruning', sa.Text(), nullable=True),
        sa.Column('tools_needed', sa.Text(), nullable=True),
        sa.Column('season_notes', sa.Text(), nullable=True),
        sa.Column('importance', sa.String(length=20), nullable=False, server_default='recommended'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['plant_stage_id'], ['plant_stages.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(
        'ix_plant_pruning_guides_plant_stage_id',
        'plant_pruning_guides',
        ['plant_stage_id'],
    )


def downgrade() -> None:
    op.drop_index('ix_plant_pruning_guides_plant_stage_id', table_name='plant_pruning_guides')
    op.drop_table('plant_pruning_guides')

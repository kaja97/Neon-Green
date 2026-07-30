"""Add plant_varieties table and projects.variety_id

Revision ID: a1b2c3d4e5f6
Revises: 5dde4ec1ffb8
Create Date: 2026-07-17 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '5dde4ec1ffb8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # 1. Create the plant_varieties table (must exist before projects FK).
    op.create_table('plant_varieties',
        sa.Column('plant_id', sa.UUID(), nullable=False),
        sa.Column('variety_name', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('growth_duration_days', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['plant_id'], ['plants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    # Index for filtering varieties by plant.
    op.create_index(
        'ix_plant_varieties_plant_id',
        'plant_varieties',
        ['plant_id'],
        unique=False,
    )

    # 2. Add nullable variety_id column to projects.
    op.add_column(
        'projects',
        sa.Column('variety_id', sa.UUID(), nullable=True),
    )
    op.create_foreign_key(
        'fk_projects_variety_id_plant_varieties',
        'projects',
        'plant_varieties',
        ['variety_id'],
        ['id'],
        ondelete='SET NULL',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint(
        'fk_projects_variety_id_plant_varieties',
        'projects',
        type_='foreignkey',
    )
    op.drop_column('projects', 'variety_id')
    op.drop_index('ix_plant_varieties_plant_id', table_name='plant_varieties')
    op.drop_table('plant_varieties')

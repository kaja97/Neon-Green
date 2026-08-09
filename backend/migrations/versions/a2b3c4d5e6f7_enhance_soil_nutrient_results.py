"""Enhance soil_nutrient_results with comprehensive soil health parameters

Revision ID: a2b3c4d5e6f7
Revises: f84bd166f390
Create Date: 2026-07-19 19:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = 'f84bd166f390'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add comprehensive soil health parameters to soil_nutrient_results table."""

    # ── Add new Physical & Chemical columns ──
    op.add_column('soil_nutrient_results',
        sa.Column('electrical_conductivity_ec', sa.Numeric(precision=5, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('organic_carbon_oc', sa.Numeric(precision=5, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('cation_exchange_capacity_cec', sa.Numeric(precision=5, scale=1), nullable=True)
    )

    # ── Add new Primary Macronutrient columns (ppm) ──
    op.add_column('soil_nutrient_results',
        sa.Column('nitrogen_n', sa.Numeric(precision=8, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('phosphorus_p', sa.Numeric(precision=8, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('potassium_k', sa.Numeric(precision=8, scale=2), nullable=True)
    )

    # ── Add new Secondary Macronutrient columns (ppm) ──
    op.add_column('soil_nutrient_results',
        sa.Column('calcium_ca', sa.Numeric(precision=8, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('magnesium_mg', sa.Numeric(precision=8, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('sulfur_s', sa.Numeric(precision=8, scale=2), nullable=True)
    )

    # ── Add new Micronutrient / Trace Element columns (ppm) ──
    op.add_column('soil_nutrient_results',
        sa.Column('zinc_zn', sa.Numeric(precision=6, scale=3), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('boron_b', sa.Numeric(precision=6, scale=3), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('iron_fe', sa.Numeric(precision=6, scale=3), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('manganese_mn', sa.Numeric(precision=6, scale=3), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('copper_cu', sa.Numeric(precision=6, scale=3), nullable=True)
    )

    # ── Drop old string-based columns ──
    op.drop_column('soil_nutrient_results', 'nitrogen_level')
    op.drop_column('soil_nutrient_results', 'phosphorus_level')
    op.drop_column('soil_nutrient_results', 'potassium_level')
    op.drop_column('soil_nutrient_results', 'organic_matter_perc')
    op.drop_column('soil_nutrient_results', 'moisture_level')


def downgrade() -> None:
    """Remove comprehensive soil health parameters and restore old columns."""

    # ── Re-add old columns ──
    op.add_column('soil_nutrient_results',
        sa.Column('nitrogen_level', sa.String(length=20), nullable=False, server_default='Medium')
    )
    op.add_column('soil_nutrient_results',
        sa.Column('phosphorus_level', sa.String(length=20), nullable=False, server_default='Medium')
    )
    op.add_column('soil_nutrient_results',
        sa.Column('potassium_level', sa.String(length=20), nullable=False, server_default='Medium')
    )
    op.add_column('soil_nutrient_results',
        sa.Column('organic_matter_perc', sa.Numeric(precision=5, scale=2), nullable=True)
    )
    op.add_column('soil_nutrient_results',
        sa.Column('moisture_level', sa.String(length=20), nullable=True)
    )

    # ── Drop new columns (in reverse order) ──
    op.drop_column('soil_nutrient_results', 'copper_cu')
    op.drop_column('soil_nutrient_results', 'manganese_mn')
    op.drop_column('soil_nutrient_results', 'iron_fe')
    op.drop_column('soil_nutrient_results', 'boron_b')
    op.drop_column('soil_nutrient_results', 'zinc_zn')
    op.drop_column('soil_nutrient_results', 'sulfur_s')
    op.drop_column('soil_nutrient_results', 'magnesium_mg')
    op.drop_column('soil_nutrient_results', 'calcium_ca')
    op.drop_column('soil_nutrient_results', 'potassium_k')
    op.drop_column('soil_nutrient_results', 'phosphorus_p')
    op.drop_column('soil_nutrient_results', 'nitrogen_n')
    op.drop_column('soil_nutrient_results', 'cation_exchange_capacity_cec')
    op.drop_column('soil_nutrient_results', 'organic_carbon_oc')
    op.drop_column('soil_nutrient_results', 'electrical_conductivity_ec')

"""Add product_catalog and product_nutrient_content tables

Revision ID: b2c3d4e5f6a7
Revises: a2b3c4d5e6f7
Create Date: 2026-07-19 20:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
import uuid as _uuid


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ── Seed data ─────────────────────────────────────────────
# Derived from soil/calculator.py PRIMARY/SECONDARY/MICRO_CONVERSION tables and
# standard published nutrient contents for each fertilizer/amendment.
# Each product maps to one or more rows in product_nutrient_content.
def _seed():
    """Return (products, contents) lists. UUIDs are generated here so we can
    reference them when inserting nutrient-content rows in the same migration."""
    products = []
    contents = []

    def add(name, product_type, farming_method, primary_nutrient,
            npk_ratio, rate_kg, description, instructions, availability,
            nutrients):
        """nutrients: list of (code, name, pct) tuples."""
        pid = str(_uuid.uuid4())
        products.append({
            "id": pid,
            "name": name,
            "product_type": product_type,
            "farming_method": farming_method,
            "primary_nutrient": primary_nutrient,
            "npk_ratio": npk_ratio,
            "application_rate_per_acre_kg": rate_kg,
            "description": description,
            "instructions": instructions,
            "is_active": True,
        })
        for code, nm, pct in nutrients:
            contents.append({
                "id": str(_uuid.uuid4()),
                "product_id": pid,
                "nutrient_code": code,
                "nutrient_name": nm,
                "content_percentage": pct,
                "availability": availability,
            })

    # ── Primary macronutrient fertilizers (inorganic) ──
    add("Urea (46% N)", "fertilizer", "inorganic", "N", "46-0-0", 50,
        "Highly concentrated nitrogen fertilizer. Fast-acting.",
        "Broadcast or band apply; water in lightly to limit volatilization.",
        "fast",
        [("nitrogen_n", "Nitrogen", 46.0)])
    add("TSP (Triple Super Phosphate)", "fertilizer", "inorganic", "P", "0-46-0", 30,
        "Phosphate fertilizer (~20% elemental P).",
        "Apply near root zone at planting; P is immobile in soil.",
        "medium",
        [("phosphorus_p", "Phosphorus", 20.0)])
    add("MOP (Muriate of Potash)", "fertilizer", "inorganic", "K", "0-0-60", 40,
        "Potassium chloride (~50% elemental K).",
        "Broadcast and incorporate; avoid on chloride-sensitive crops.",
        "fast",
        [("potassium_k", "Potassium", 50.0)])

    # ── Secondary macronutrient amendments (inorganic) ──
    add("Gypsum (Calcium sulfate)", "amendment", "both", "Ca", None, 200,
        "Provides Ca and S without changing pH. Improves sodic soils.",
        "Broadcast and incorporate into topsoil.",
        "medium",
        [("calcium_ca", "Calcium", 23.0), ("sulfur_s", "Sulfur", 19.0)])
    add("Magnesium sulfate (Epsom salt)", "amendment", "both", "Mg", None, 30,
        "Soluble Mg and S source; foliar or soil applied.",
        "Dissolve in water for foliar spray, or broadcast on soil.",
        "fast",
        [("magnesium_mg", "Magnesium", 10.0), ("sulfur_s", "Sulfur", 13.0)])
    add("Elemental sulfur", "amendment", "inorganic", "S", None, 50,
        "Lowers soil pH and supplies sulfur; oxidizes slowly to sulfate.",
        "Incorporate well ahead of planting (needs months to act).",
        "slow",
        [("sulfur_s", "Sulfur", 90.0)])

    # ── Micronutrient fertilizers (inorganic) ──
    add("Zinc sulfate", "fertilizer", "inorganic", "Zn", None, 10,
        "Corrects zinc deficiency (~22% Zn in heptahydrate form).",
        "Soil apply or foliar spray at low concentration.",
        "medium",
        [("zinc_zn", "Zinc", 22.0)])
    add("Borax (Sodium borate)", "fertilizer", "inorganic", "B", None, 5,
        "Supplies boron (~11% B). Toxic in excess — apply sparingly.",
        "Broadcast evenly; never band concentrate near seed.",
        "medium",
        [("boron_b", "Boron", 11.0)])
    add("Iron sulfate", "fertilizer", "inorganic", "Fe", None, 15,
        "Corrects iron chlorosis (~20% Fe).",
        "Soil or foliar; effectiveness depends on pH.",
        "medium",
        [("iron_fe", "Iron", 20.0)])
    add("Manganese sulfate", "fertilizer", "inorganic", "Mn", None, 10,
        "Corrects Mn deficiency (~27% Mn).",
        "Foliar spray preferred in high-pH soils.",
        "medium",
        [("manganese_mn", "Manganese", 27.0)])
    add("Copper sulfate", "fertilizer", "inorganic", "Cu", None, 5,
        "Supplies Cu (~25%). Use cautiously — phytotoxic if over-applied.",
        "Apply in fall or as dilute foliar spray.",
        "medium",
        [("copper_cu", "Copper", 25.0)])

    # ── pH amendments (inorganic) ──
    add("Agricultural lime (Calcium carbonate)", "amendment", "inorganic", "Ca", None, 300,
        "Raises soil pH and supplies Ca. Standard liming material.",
        "Incorporate into topsoil several weeks before planting.",
        "slow",
        [("calcium_ca", "Calcium", 38.0)])

    # ── Organic alternatives ──
    add("Compost (well-rotted)", "organic", "organic", "N", None, 2000,
        "Balanced slow-release organic matter; feeds soil microbiome.",
        "Broadcast and incorporate before planting; can side-dress.",
        "slow",
        [("nitrogen_n", "Nitrogen", 1.5), ("phosphorus_p", "Phosphorus", 0.5),
         ("potassium_k", "Potassium", 1.0)])
    add("Blood meal", "organic", "organic", "N", "12-0-0", 100,
        "Fast-acting organic nitrogen (~12% N).",
        "Side-dress or mix into soil; avoid direct contact with stems.",
        "fast",
        [("nitrogen_n", "Nitrogen", 12.0)])
    add("Bone meal", "organic", "organic", "P", "0-15-0", 80,
        "Slow organic phosphorus source (~6.5% elemental P).",
        "Add to planting hole; best in slightly acidic soil.",
        "slow",
        [("phosphorus_p", "Phosphorus", 6.5), ("calcium_ca", "Calcium", 22.0)])
    add("Rock phosphate", "organic", "organic", "P", None, 150,
        "Slow-release natural phosphate (~13% elemental P).",
        "Incorporate into acidic soil; long-term P source.",
        "slow",
        [("phosphorus_p", "Phosphorus", 13.0)])
    add("Kelp meal (Seaweed)", "organic", "organic", "K", None, 80,
        "Organic K plus trace minerals and growth regulators.",
        "Broadcast before planting or side-dress.",
        "slow",
        [("potassium_k", "Potassium", 5.0), ("iron_fe", "Iron", 0.1)])
    add("Wood ash", "amendment", "organic", "K", None, 100,
        "Raises pH slightly; supplies K and Ca. Use sparingly.",
        "Broadcast on acidic soils; avoid on already-alkaline soil.",
        "fast",
        [("potassium_k", "Potassium", 10.0), ("calcium_ca", "Calcium", 25.0)])
    add("Dolomite lime", "amendment", "organic", "Ca", None, 250,
        "Raises pH and supplies both Ca and Mg.",
        "Incorporate into topsoil; acts over several months.",
        "slow",
        [("calcium_ca", "Calcium", 21.0), ("magnesium_mg", "Magnesium", 13.0)])
    add("Composted manure", "organic", "organic", "N", None, 3000,
        "Balanced slow organic nutrient source; improves soil structure.",
        "Broadcast and incorporate before planting.",
        "slow",
        [("nitrogen_n", "Nitrogen", 1.0), ("phosphorus_p", "Phosphorus", 0.5),
         ("potassium_k", "Potassium", 1.0)])
    add("Seaweed extract (liquid)", "organic", "organic", "K", None, 5,
        "Foliar bio-stimulant; trace Fe and growth promoters.",
        "Dilute per label and spray on foliage.",
        "fast",
        [("potassium_k", "Potassium", 18.0), ("iron_fe", "Iron", 0.05)])

    return products, contents


def upgrade() -> None:
    """Create product_catalog + product_nutrient_content tables and seed them."""

    op.create_table(
        'product_catalog',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('product_type', sa.String(length=50), nullable=False),
        sa.Column('farming_method', sa.String(length=50), nullable=False, server_default='both'),
        sa.Column('primary_nutrient', sa.String(length=20), nullable=True),
        sa.Column('npk_ratio', sa.String(length=20), nullable=True),
        sa.Column('application_rate_per_acre_kg', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('instructions', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_product_catalog_primary_nutrient', 'product_catalog', ['primary_nutrient'])
    op.create_index('ix_product_catalog_farming_method', 'product_catalog', ['farming_method'])

    op.create_table(
        'product_nutrient_content',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('product_id', UUID(as_uuid=True),
                  sa.ForeignKey('product_catalog.id', ondelete='CASCADE'), nullable=False),
        sa.Column('nutrient_code', sa.String(length=30), nullable=False),
        sa.Column('nutrient_name', sa.String(length=50), nullable=False),
        sa.Column('content_percentage', sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column('availability', sa.String(length=20), nullable=False, server_default='medium'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index('ix_product_nutrient_content_nutrient_code',
                    'product_nutrient_content', ['nutrient_code'])

    # ── Seed ──
    products, contents = _seed()

    product_table = sa.table(
        'product_catalog',
        sa.Column('id', UUID(as_uuid=True)),
        sa.Column('name', sa.String),
        sa.Column('product_type', sa.String),
        sa.Column('farming_method', sa.String),
        sa.Column('primary_nutrient', sa.String),
        sa.Column('npk_ratio', sa.String),
        sa.Column('application_rate_per_acre_kg', sa.Numeric),
        sa.Column('description', sa.Text),
        sa.Column('instructions', sa.Text),
        sa.Column('is_active', sa.Boolean),
    )
    content_table = sa.table(
        'product_nutrient_content',
        sa.Column('id', UUID(as_uuid=True)),
        sa.Column('product_id', UUID(as_uuid=True)),
        sa.Column('nutrient_code', sa.String),
        sa.Column('nutrient_name', sa.String),
        sa.Column('content_percentage', sa.Numeric),
        sa.Column('availability', sa.String),
    )
    op.bulk_insert(product_table, products)
    op.bulk_insert(content_table, contents)


def downgrade() -> None:
    """Drop product_catalog and product_nutrient_content tables."""
    op.drop_index('ix_product_nutrient_content_nutrient_code', table_name='product_nutrient_content')
    op.drop_table('product_nutrient_content')
    op.drop_index('ix_product_catalog_farming_method', table_name='product_catalog')
    op.drop_index('ix_product_catalog_primary_nutrient', table_name='product_catalog')
    op.drop_table('product_catalog')

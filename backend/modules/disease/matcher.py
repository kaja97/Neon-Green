import re
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from models.plant_health import PlantDisease

async def match_disease(db: AsyncSession, query_str: str) -> list[dict]:
    """
    Use PostgreSQL full-text search (ts_rank) to match symptoms against the database.
    Returns matches with a rank > 0.1.
    """
    # Convert query into a basic Postgres tsquery (OR logic)
    words = [w for w in re.split(r'\W+', query_str) if w]
    ts_query = " | ".join(words)
    
    if not ts_query:
        return []
        
    # We construct a tsvector from the symptoms array casted to string
    # array_to_string is specific to postgres arrays
    query = text("""
        SELECT id, name, symptoms, 
               ts_rank(to_tsvector('english', array_to_string(symptoms, ' ')), to_tsquery('english', :query)) as rank
        FROM plant_diseases
        WHERE to_tsvector('english', array_to_string(symptoms, ' ')) @@ to_tsquery('english', :query)
        ORDER BY rank DESC
        LIMIT 5
    """)
    
    result = await db.execute(query, {"query": ts_query})
    matches = result.all()
    
    # Filter by rank threshold
    return [
        {
            "id": row.id,
            "name": row.name,
            "symptoms": row.symptoms,
            "rank": row.rank
        }
        for row in matches if row.rank > 0.1
    ]

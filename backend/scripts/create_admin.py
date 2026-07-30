import asyncio
import sys
import os

# Add backend to path so we can import from core/models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import async_session
from models.account import Account
from core.security import get_password_hash
from sqlalchemy.future import select

async def create_admin():
    email = "admin@agrifarm.local"
    password = "adminpassword123"
    
    async with async_session() as db:
        # Check if admin exists
        result = await db.execute(select(Account).where(Account.email == email))
        admin = result.scalars().first()
        
        if admin:
            print(f"Admin already exists with email: {email}")
            if admin.role != "admin":
                print("Updating role to admin...")
                admin.role = "admin"
                await db.commit()
                print("Role updated successfully.")
            return

        print(f"Creating new admin account: {email}")
        new_admin = Account(
            email=email,
            password_hash=get_password_hash(password),
            role="admin",
            is_active=True,
            is_verified=True,
        )
        db.add(new_admin)
        await db.commit()
        print(f"Admin created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")

if __name__ == "__main__":
    asyncio.run(create_admin())

import asyncio
import os
import sys

# Ensure backend directory is in the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.email_service import send_email

async def test_email():
    print("🚀 Starting email test...")
    target_email = "kajanan097@gmail.com" # You can change this
    
    try:
        success = await send_email(
            to=target_email,
            subject="AgriFarm AI - Test Email",
            html_body="<h1>Success!</h1><p>The AgriFarm AI email service is working perfectly.</p>",
            plain_body="Success! The AgriFarm AI email service is working perfectly."
        )
        if success:
            print(f"✅ Email successfully dispatched to {target_email}!")
        else:
            print(f"❌ Failed to dispatch email to {target_email}.")
    except Exception as e:
        print(f"🚨 Exception occurred: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())

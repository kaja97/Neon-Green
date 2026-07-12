"""
One-time setup script: Generate Google OAuth token for Gmail API.

Run this once from the project root or backend/ directory to authenticate
with Google and save a token.json for the email service.

Usage:
    python backend/scripts/generate_token.py   (from project root)
    python scripts/generate_token.py           (from backend/)
"""
import os
import sys

# ── Resolve project root (parent of backend/) ───────────
_this_file = os.path.abspath(__file__)
_scripts_dir = os.path.dirname(_this_file)        # backend/scripts/
_backend_dir = os.path.dirname(_scripts_dir)       # backend/
_project_root = os.path.dirname(_backend_dir)      # Neon Farming/

sys.path.insert(0, _backend_dir)

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(_project_root, ".env"))
except ImportError:
    pass

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from google.oauth2.credentials import Credentials
except ImportError:
    print("Error: Required libraries not found.")
    print("Please run: pip install google-auth-oauthlib google-api-python-client")
    sys.exit(1)

# If modifying these scopes, delete the file token.json.
SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

# ── Keys live in <project_root>/keys/ — the folder Docker mounts ──
KEYS_DIR = os.path.join(_project_root, "keys")


def main():
    """Authenticate with Google and save OAuth token."""
    creds = None

    credentials_path = os.path.join(KEYS_DIR, "credentials.json")
    token_path = os.path.join(KEYS_DIR, "token.json")

    print(f"Keys directory : {KEYS_DIR}")
    print(f"Credentials    : {credentials_path}")
    print(f"Token output   : {token_path}")

    if not os.path.exists(credentials_path):
        print(f"\nError: {credentials_path} not found.")
        print("Please download your OAuth 2.0 Client ID JSON from Google Cloud Console")
        print("and save it as 'credentials.json' in the keys/ folder.")
        sys.exit(1)

    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            print("No valid token found. Opening browser to authenticate...")
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, SCOPES
            )
            creds = flow.run_local_server(port=0)

        # Save the credentials for the next run
        os.makedirs(KEYS_DIR, exist_ok=True)
        with open(token_path, "w") as token:
            token.write(creds.to_json())
            print(f"Successfully saved token to: {token_path}")

    print("\n✅ Authentication successful! The email service is ready to use.")


if __name__ == "__main__":
    main()

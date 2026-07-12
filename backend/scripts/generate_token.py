import os
import sys

# Ensure backend directory is in the python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(project_root, "backend"))

try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(project_root, ".env"))
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

def main():
    """Shows basic usage of the Gmail API."""
    creds = None
    
    # Resolve absolute paths relative to project root directly to be safe
    credentials_path = os.path.join(project_root, "keys", "credentials.json")
    token_path = os.path.join(project_root, "keys", "token.json")

    print(f"Using credentials from: {credentials_path}")

    if not os.path.exists(credentials_path):
        print(f"Error: {credentials_path} not found.")
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
        with open(token_path, "w") as token:
            token.write(creds.to_json())
            print(f"Successfully saved new refresh token to: {token_path}")
            
    print("\n✅ Authentication successful! The email service is ready to use.")

if __name__ == "__main__":
    main()

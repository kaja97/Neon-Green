import os
import sys
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

def main():
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    cred_candidates = [
        os.path.join(project_root, 'keys', 'credentials.json'),
        os.path.join(project_root, 'backend', 'keys', 'credentials.json'),
    ]
    
    cred_file = None
    for path in cred_candidates:
        if os.path.exists(path):
            cred_file = path
            break
            
    if not cred_file:
        print(f'Error: credentials.json not found in {cred_candidates}')
        sys.exit(1)
        
    token_file = os.path.join(os.path.dirname(cred_file), 'token.json')
    
    creds = None
    if os.path.exists(token_file):
        try:
            creds = Credentials.from_authorized_user_file(token_file, SCOPES)
        except Exception as e:
            print(f'Could not load existing token file: {e}')
            
    if creds and creds.expired and creds.refresh_token:
        try:
            print('Attempting to refresh token using existing refresh token...')
            creds.refresh(Request())
            print('Token successfully refreshed!')
        except Exception as e:
            print(f'Failed to refresh existing token ({e}). A new login flow is required.')
            creds = None

    if not creds or not creds.valid:
        print(f'Starting OAuth flow using {cred_file}...')
        flow = InstalledAppFlow.from_client_secrets_file(cred_file, SCOPES)
        creds = flow.run_local_server(port=0, prompt='consent', access_type='offline')
        print('OAuth flow completed successfully!')

    with open(token_file, 'w') as f:
        f.write(creds.to_json())
        
    print(f'Successfully saved valid token to {token_file}')

if __name__ == '__main__':
    main()

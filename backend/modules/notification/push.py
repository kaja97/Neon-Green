"""
Web Push Notification integration using pywebpush.
This module handles VAPID-based push notifications to subscribed farmers.
"""
import json
import logging
from pywebpush import webpush, WebPushException
from config import settings

logger = logging.getLogger(__name__)

def send_web_push(subscription_info: dict, payload: dict) -> bool:
    """
    Send a push notification to a specific client subscription.
    
    subscription_info: Must be a dictionary containing 'endpoint' and 'keys' (p256dh, auth).
    payload: The data payload (usually a dict) to send to the client.
    """
    if not settings.VAPID_PRIVATE_KEY:
        logger.warning("VAPID_PRIVATE_KEY not set. Push notifications are disabled.")
        return False
        
    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": f"mailto:{settings.VAPID_CLAIM_EMAIL}"}
        )
        return True
    except WebPushException as ex:
        logger.error(f"Web Push Failed: {repr(ex)}")
        # In a real app, if ex.response and ex.response.status_code == 410, 
        # we should delete the subscription from the database.
        return False
    except Exception as e:
        logger.error(f"Failed to send web push: {e}")
        return False

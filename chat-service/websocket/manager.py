"""WebSocket Connection Manager.

Tracks active connections per user and provides broadcasting methods.
"""

from fastapi import WebSocket
from typing import Dict, List
import json
import logging

from schemas.websocket import WSOutgoing
from core.redis import set_online, set_offline

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Maps account_id (str) -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, account_id: str, ws: WebSocket):
        if account_id not in self.active_connections:
            self.active_connections[account_id] = []
        self.active_connections[account_id].append(ws)
        # Update Redis presence
        await set_online(account_id)
        # In a real multi-instance setup, we would subscribe to a Redis pub/sub channel here

    async def disconnect(self, account_id: str, ws: WebSocket):
        if account_id in self.active_connections:
            if ws in self.active_connections[account_id]:
                self.active_connections[account_id].remove(ws)
            if not self.active_connections[account_id]:
                del self.active_connections[account_id]
                # Update Redis presence
                await set_offline(account_id)

    async def send_to_user(self, account_id: str, message: WSOutgoing):
        """Send a message to all active connections of a specific user."""
        if account_id in self.active_connections:
            payload = message.model_dump_json()
            dead_connections = []
            for ws in self.active_connections[account_id]:
                try:
                    await ws.send_text(payload)
                except Exception as e:
                    logger.error(f"Failed to send WS message to {account_id}: {e}")
                    dead_connections.append(ws)

            # Cleanup dead connections
            for ws in dead_connections:
                await self.disconnect(account_id, ws)

    async def broadcast(self, message: WSOutgoing):
        """Send a message to all connected users (usually not needed in chat, but good for systemic alerts)."""
        payload = message.model_dump_json()
        for account_id, connections in list(self.active_connections.items()):
            dead_connections = []
            for ws in connections:
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead_connections.append(ws)
            for ws in dead_connections:
                await self.disconnect(account_id, ws)

    def is_online_local(self, account_id: str) -> bool:
        """Check if user has an active connection on THIS instance."""
        return account_id in self.active_connections and len(self.active_connections[account_id]) > 0


manager = ConnectionManager()

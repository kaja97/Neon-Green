import json
import logging
import uuid
from fastapi import WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from database import async_session
from core.security import ws_authenticate
from schemas.websocket import WSIncoming, WSOutgoing
from schemas.message import MessageCreate, MessageResponse
from services.message_service import MessageService
from services.conversation_service import ConversationService
from repositories.message_repo import MessageRepository
from repositories.conversation_repo import ConversationRepository
from repositories.user_repo import ChatUserRepository
from core.redis import refresh_presence, set_typing

from .manager import manager

logger = logging.getLogger(__name__)


async def websocket_endpoint(websocket: WebSocket):
    """Main WebSocket endpoint handling the connection lifecycle and routing messages."""
    # Accept the connection first
    await websocket.accept()

    # 1. Authenticate
    account_id_str = await ws_authenticate(websocket)
    if not account_id_str:
        await websocket.close(code=1008, reason="Invalid token")
        return

    # 2. Get chat_user.id
    async with async_session() as db:
        user_repo = ChatUserRepository()
        user = await user_repo.get_by_account_id(db, uuid.UUID(account_id_str))
        if not user:
            await websocket.close(code=1008, reason="Chat profile not synced")
            return
        chat_user_id = user.id
        display_name = user.display_name

    # 3. Connect (websocket already accepted)
    await manager.connect(account_id_str, websocket)

    # Broadcast online status to all conversations (in a real app, query all contacts)
    # For simplicity, we just send a connected ack to the user themselves
    await manager.send_to_user(
        account_id_str,
        WSOutgoing(type="connected", data={"user_id": str(chat_user_id)}),
    )

    try:
        while True:
            # Receive text data
            raw_data = await websocket.receive_text()
            
            try:
                incoming = WSIncoming.model_validate_json(raw_data)
            except Exception as e:
                logger.error(f"Invalid WS message format: {e}")
                await manager.send_to_user(
                    account_id_str,
                    WSOutgoing(type="error", data={"message": "Invalid message format"}),
                )
                continue

            # Process message in a new DB session
            async with async_session() as db:
                await handle_ws_message(db, account_id_str, chat_user_id, display_name, incoming)

    except WebSocketDisconnect:
        await manager.disconnect(account_id_str, websocket)
        # Broadcast offline status would go here
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await manager.disconnect(account_id_str, websocket)


async def handle_ws_message(
    db: AsyncSession,
    account_id_str: str,
    chat_user_id: uuid.UUID,
    display_name: str,
    msg: WSIncoming,
):
    """Route the incoming WebSocket message to the appropriate service."""
    msg_repo = MessageRepository()
    conv_repo = ConversationRepository()
    user_repo = ChatUserRepository()
    
    msg_service = MessageService(msg_repo, conv_repo, user_repo)

    if msg.type == "ping":
        # Refresh presence TTL and ack
        await refresh_presence(account_id_str)
        await manager.send_to_user(account_id_str, WSOutgoing(type="pong"))

    elif msg.type == "message":
        # Handle sending a chat message
        if not msg.conversation_id:
            return
            
        try:
            conv_id = uuid.UUID(msg.conversation_id)
            data = MessageCreate(**msg.data)
            
            # Send message via service (this validates participation and saves to DB)
            result_dict = await msg_service.send_message(db, conv_id, chat_user_id, data)
            
            # Send ack to sender
            await manager.send_to_user(
                account_id_str,
                WSOutgoing(type="message", conversation_id=msg.conversation_id, data=result_dict),
            )
            
            # Figure out who the recipient is to push the message
            conv = await conv_repo.get_by_id(db, conv_id)
            if conv:
                other_id = conv_repo.get_other_participant(conv, chat_user_id)
                other_user = await user_repo.get_by_id(db, other_id)
                if other_user:
                    # Push to recipient
                    await manager.send_to_user(
                        str(other_user.account_id),
                        WSOutgoing(type="message", conversation_id=msg.conversation_id, data=result_dict),
                    )
        except Exception as e:
            logger.error(f"Failed to process WS message: {e}")
            await manager.send_to_user(
                account_id_str,
                WSOutgoing(type="error", data={"message": str(e)}),
            )

    elif msg.type == "typing":
        # Set typing indicator with 5s TTL
        if msg.conversation_id:
            await set_typing(msg.conversation_id, str(chat_user_id))
            
            # Forward typing event to recipient
            try:
                conv_id = uuid.UUID(msg.conversation_id)
                conv = await conv_repo.get_by_id(db, conv_id)
                if conv:
                    other_id = conv_repo.get_other_participant(conv, chat_user_id)
                    other_user = await user_repo.get_by_id(db, other_id)
                    if other_user:
                        await manager.send_to_user(
                            str(other_user.account_id),
                            WSOutgoing(
                                type="typing",
                                conversation_id=msg.conversation_id,
                                data={"user_id": str(chat_user_id), "display_name": display_name},
                            ),
                        )
            except Exception:
                pass

    elif msg.type == "read":
        # Mark messages as read
        if msg.conversation_id and "message_ids" in msg.data:
            try:
                conv_id = uuid.UUID(msg.conversation_id)
                message_ids = msg.data["message_ids"]
                
                await msg_service.mark_read(db, conv_id, chat_user_id, message_ids)
                
                # Forward read receipt to sender of those messages
                conv = await conv_repo.get_by_id(db, conv_id)
                if conv:
                    other_id = conv_repo.get_other_participant(conv, chat_user_id)
                    other_user = await user_repo.get_by_id(db, other_id)
                    if other_user:
                        await manager.send_to_user(
                            str(other_user.account_id),
                            WSOutgoing(
                                type="read",
                                conversation_id=msg.conversation_id,
                                data={"message_ids": message_ids, "read_by": str(chat_user_id)},
                            ),
                        )
            except Exception as e:
                logger.error(f"Failed to process WS read event: {e}")

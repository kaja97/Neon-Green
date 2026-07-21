# AgriFarm AI — Chat Service Documentation

## 1. Overview
The Chat Service is a standalone microservice built to handle real-time messaging between users in the AgriFarm AI ecosystem. It allows users to search for other members (farmers, vendors, buyers), start 1-on-1 conversations, and send text and voice messages in real time.

## 2. Architecture & Infrastructure
Unlike the main monolithic backend, the Chat Service is decoupled to ensure real-time WebSocket traffic does not impact the main API's performance.

- **Framework**: FastAPI (Async)
- **Database**: Dedicated PostgreSQL database (`chat_db`) accessed via SQLAlchemy and mapped with Alembic.
- **State & Presence**: Redis is used to track user online status and manage fast, ephemeral data.
- **Port**: Runs locally on port `8001`.
- **Authentication**: It securely reads the exact same `JWT_SECRET_KEY` as the main backend, allowing it to validate tokens natively without making an HTTP request to the main server for every message.

## 3. Data Sync Strategy
Because the Chat Service uses its own isolated database (`chat_db`), it does not have direct access to the main `agrifarm_db` where user accounts are created.

To solve this, the Chat Service uses a **Lazy Sync Pattern**:
1. When a user opens the chat UI, the frontend calls `GET /chat/users/me`.
2. The Chat Service extracts the user's `account_id` from their JWT.
3. It makes a server-to-server HTTP request to the Main Backend (`http://backend:8000/api/v1/auth/me`) to fetch their latest profile data (name, avatar, etc.).
4. It upserts this data into its local `chat_users` table.

## 4. Database Models (`chat_db`)

### `ChatUser`
Stores the synced profile information.
- `id` (UUID, Primary Key)
- `account_id` (UUID, maps to the main DB account)
- `display_name` (String)
- `avatar_url` (String, nullable)

### `Conversation`
Represents a 1-on-1 chat room between two users.
- `id` (UUID)
- `user1_id` (UUID -> ChatUser)
- `user2_id` (UUID -> ChatUser)

### `Message`
An individual chat message.
- `id` (UUID)
- `conversation_id` (UUID -> Conversation)
- `sender_id` (UUID -> ChatUser)
- `message_type` (Enum: `text`, `voice`, `image`)
- `content` (String, nullable)
- `voice_url` (String, nullable)
- `voice_duration` (Integer, nullable)

### `MessageReceipt`
Tracks if a message has been delivered or read.
- `id` (UUID)
- `message_id` (UUID -> Message)
- `user_id` (UUID -> ChatUser)
- `is_read` (Boolean)

## 5. API Endpoints

### REST API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/v1/chat/users/me` | Fetches and syncs the current user's profile. |
| `GET` | `/api/v1/chat/users/search` | Fuzzy searches for users by name to start a chat. |
| `GET` | `/api/v1/chat/conversations` | Retrieves the user's inbox (list of conversations). |
| `POST` | `/api/v1/chat/conversations` | Creates or retrieves a 1-on-1 conversation. |
| `GET` | `/api/v1/chat/conversations/{id}/messages` | Fetches paginated message history. |
| `POST` | `/api/v1/chat/voice/upload` | Uploads an audio/video file locally and returns the URL. |

### WebSockets
| Method | Endpoint | Purpose |
|--------|----------|---------|
| `WS` | `/ws/chat?token={jwt}` | The main duplex connection for real-time traffic. |

**WebSocket Incoming Payloads (From Frontend):**
- `message`: Sending a new text/voice message.
- `typing`: Emitting a typing indicator.
- `read`: Acknowledging receipt of messages.

**WebSocket Outgoing Payloads (To Frontend):**
- `message`: Receiving a new message.
- `typing`: Receiving a typing indicator from the other user.
- `presence`: Notifications when a user comes online/offline.

## 6. Media & File Uploads
Currently, files (like voice recordings) are uploaded to the Chat Service's local hard drive via the `/voice/upload` endpoint. 
- The files are saved in the `chat_uploads/` directory on the server.
- The PostgreSQL database only saves the **URL string** (e.g., `/static/uploads/voice/file.webm`), keeping the database lightweight and performant.

## 7. Docker Deployment
The service is orchestrated alongside the main stack using `docker-compose.yml`.

```yaml
  postgres-chat:
    image: postgres:16
    ports:
      - "5433:5432"
    volumes:
      - chat_pgdata:/var/lib/postgresql/data

  chat-service:
    build:
      context: ./chat-service
    ports:
      - "8001:8001"
    volumes:
      - ./chat-service:/app
      - chat_uploads:/app/uploads
    depends_on:
      - postgres-chat
      - redis
```

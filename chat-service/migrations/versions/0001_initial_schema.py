"""Initial schema

Revision ID: 0001
Revises: 
Create Date: 2026-07-21 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # 1. chat_users
    op.create_table(
        'chat_users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('account_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('display_name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=True),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('avatar_url', sa.Text(), nullable=True),
        sa.Column('is_online', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('account_id')
    )
    op.create_index(op.f('ix_chat_users_account_id'), 'chat_users', ['account_id'], unique=True)
    op.create_index(op.f('ix_chat_users_email'), 'chat_users', ['email'], unique=False)
    op.create_index(op.f('ix_chat_users_phone'), 'chat_users', ['phone'], unique=False)
    # create trigram index for display_name
    op.execute("CREATE INDEX ix_chat_users_display_name_trgm ON chat_users USING gin (display_name gin_trgm_ops);")

    # 2. conversations
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('participant_1', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('participant_2', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('last_message_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('last_message_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint('participant_1 < participant_2', name='ck_participant_order'),
        sa.ForeignKeyConstraint(['participant_1'], ['chat_users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['participant_2'], ['chat_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('participant_1', 'participant_2', name='uq_conversation_pair')
    )

    # 3. messages
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('sender_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('message_type', sa.String(length=20), nullable=False, server_default='text'),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('voice_url', sa.Text(), nullable=True),
        sa.Column('voice_duration', sa.Integer(), nullable=True),
        sa.Column('image_url', sa.Text(), nullable=True),
        sa.Column('reply_to_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_deleted', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reply_to_id'], ['messages.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['sender_id'], ['chat_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'], unique=False)
    op.create_index(op.f('ix_messages_sender_id'), 'messages', ['sender_id'], unique=False)

    # 4. message_receipts
    op.create_table(
        'message_receipts',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, server_default=sa.text('uuid_generate_v4()')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('message_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='delivered'),
        sa.Column('delivered_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('now()')),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['message_id'], ['messages.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['chat_users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('message_id', 'user_id', name='uq_receipt')
    )
    op.create_index(op.f('ix_message_receipts_message_id'), 'message_receipts', ['message_id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_message_receipts_message_id'), table_name='message_receipts')
    op.drop_table('message_receipts')
    
    op.drop_index(op.f('ix_messages_sender_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_conversation_id'), table_name='messages')
    op.drop_table('messages')
    
    op.drop_table('conversations')
    
    op.execute("DROP INDEX IF EXISTS ix_chat_users_display_name_trgm;")
    op.drop_index(op.f('ix_chat_users_phone'), table_name='chat_users')
    op.drop_index(op.f('ix_chat_users_email'), table_name='chat_users')
    op.drop_index(op.f('ix_chat_users_account_id'), table_name='chat_users')
    op.drop_table('chat_users')

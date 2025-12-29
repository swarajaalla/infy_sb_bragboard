"""add_reactions_and_comments

Revision ID: 0003_add_reactions_and_comments
Revises: 0002_add_refresh_token
Create Date: 2025-12-27 16:25:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '0003_add_reactions_and_comments'
down_revision = '0002_add_refresh_token'
branch_labels = None
depends_on = None


def upgrade():
    # Create enum type for reactions if it doesn't exist
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE reactiontypeenum AS ENUM ('like', 'clap', 'star');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
    """)
    
    # Create reactions table
    op.create_table(
        'reactions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shoutout_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('reaction_type', postgresql.ENUM('like', 'clap', 'star', name='reactiontypeenum'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['shoutout_id'], ['shoutouts.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reactions_id'), 'reactions', ['id'], unique=False)
    op.create_index(op.f('ix_reactions_shoutout_id'), 'reactions', ['shoutout_id'], unique=False)
    op.create_index(op.f('ix_reactions_user_id'), 'reactions', ['user_id'], unique=False)
    
    # Create comments table
    op.create_table(
        'comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('shoutout_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('parent_id', sa.Integer(), nullable=True),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['parent_id'], ['comments.id'], ),
        sa.ForeignKeyConstraint(['shoutout_id'], ['shoutouts.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_comments_id'), 'comments', ['id'], unique=False)
    op.create_index(op.f('ix_comments_parent_id'), 'comments', ['parent_id'], unique=False)
    op.create_index(op.f('ix_comments_shoutout_id'), 'comments', ['shoutout_id'], unique=False)
    op.create_index(op.f('ix_comments_user_id'), 'comments', ['user_id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_comments_user_id'), table_name='comments')
    op.drop_index(op.f('ix_comments_shoutout_id'), table_name='comments')
    op.drop_index(op.f('ix_comments_parent_id'), table_name='comments')
    op.drop_index(op.f('ix_comments_id'), table_name='comments')
    op.drop_table('comments')
    
    op.drop_index(op.f('ix_reactions_user_id'), table_name='reactions')
    op.drop_index(op.f('ix_reactions_shoutout_id'), table_name='reactions')
    op.drop_index(op.f('ix_reactions_id'), table_name='reactions')
    op.drop_table('reactions')
    
    op.execute("DROP TYPE reactiontypeenum")

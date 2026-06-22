"""add_role_and_readonly_to_user

Revision ID: b02b00d48142
Revises: fb35b97b5d56
Create Date: 2026-06-19 05:13:48.951609

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = 'b02b00d48142'
down_revision: Union[str, Sequence[str], None] = 'fb35b97b5d56'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add columns with server defaults to populate existing rows
    op.add_column('user', sa.Column('role', sa.String(), nullable=False, server_default='content_editor'))
    op.add_column('user', sa.Column('readonly', sa.Boolean(), nullable=False, server_default='false'))
    
    # Migrate existing users' roles based on their is_superuser flag
    op.execute("UPDATE \"user\" SET role = 'super_admin' WHERE is_superuser = true")
    op.execute("UPDATE \"user\" SET role = 'admin' WHERE is_superuser = false")


def downgrade() -> None:
    op.drop_column('user', 'readonly')
    op.drop_column('user', 'role')

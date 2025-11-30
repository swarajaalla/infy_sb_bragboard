import asyncio
import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import settings, engine, Base

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging if possible.
if config.config_file_name is not None:
    try:
        fileConfig(config.config_file_name)
    except Exception:
        # if logging sections are missing or invalid, continue without failing
        pass

target_metadata = Base.metadata


def run_migrations_offline():
    url = settings.DATABASE_URL
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine

    # Handle async engine (SQLAlchemy async) and sync engine cases
    try:
        from sqlalchemy.ext.asyncio import AsyncEngine
    except Exception:
        AsyncEngine = None

    if AsyncEngine is not None and isinstance(connectable, AsyncEngine):
        def do_run(connection):
            context.configure(connection=connection, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()

        import asyncio

        async def run_async_migrations():
            async with connectable.begin() as conn:
                await conn.run_sync(do_run)

        asyncio.run(run_async_migrations())
    else:
        with connectable.connect() as connection:
            context.configure(connection=connection, target_metadata=target_metadata)
            with context.begin_transaction():
                context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

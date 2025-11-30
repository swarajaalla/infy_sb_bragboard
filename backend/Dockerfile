FROM python:3.12-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

COPY requirements.txt /app/requirements.txt
COPY requirements-dev.txt /app/requirements-dev.txt

# Install runtime deps and pg_isready; also install dev/test deps into the image
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev postgresql-client \
    && python -m pip install --no-cache-dir -r /app/requirements.txt \
    && python -m pip install --no-cache-dir -r /app/requirements-dev.txt \
    && apt-get purge -y --auto-remove gcc \
    && rm -rf /var/lib/apt/lists/*

COPY ./app /app/app
# Copy alembic config and versions for running migrations inside the container
COPY alembic.ini /app/alembic.ini
COPY ./alembic /app/alembic
# Note: do not COPY `.env` during build (it may not exist in dev);
# runtime `DATABASE_URL` is provided via `docker-compose` environment.

EXPOSE 8000

CMD ["sh", "-c", "until pg_isready -h db -p 5432; do echo 'Waiting for db'; sleep 1; done; uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]

# BragBoard Backend — Local Development

This document explains how to build, run, migrate, and test the FastAPI backend locally (development-focused).

Prerequisites
- Docker & Docker Compose
- Python 3.12 (for local non-container workflows)

Quick start (docker-compose)

1. Build and start services (Postgres + backend):

```bash
docker compose up --build -d
```

2. Apply database migrations (from host or inside container):

From host (runs alembic in the container's context):

```bash
docker compose exec backend bash -lc "alembic -c /app/alembic.ini upgrade head"
```

Or run migrations from host directly (requires dependencies installed locally):

```bash
cd backend
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/bragboard_dev
python -m pip install -r requirements.txt
alembic -c alembic.ini upgrade head
```

3. Verify service is running:

```bash
curl http://127.0.0.1:8000/health
```

Run tests locally

Option A — inside the backend container (recommended):

```bash
docker compose exec db bash -lc "psql -U postgres -d bragboard_dev -c \"TRUNCATE TABLE refresh_tokens, users RESTART IDENTITY CASCADE;\""
docker compose exec backend bash -lc "pytest -q tests/test_auth.py"
```

Option B — on your host machine:

```bash
cd backend
python -m pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/bragboard_dev
pytest -q tests/test_auth.py
```

Notes & troubleshooting
- Ensure environment variables are set for the backend when running locally: `DATABASE_URL`, `SECRET_KEY`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS`.
- If you see `Form data requires "python-multipart"` — install `python-multipart` (it's already included in `requirements-dev.txt` and the Docker image if you rebuilt it).
- If `asyncpg` fails to build on your host (Python 3.12 C-API issues), prefer running inside Docker (the image uses a prebuilt wheel). Use `asyncpg>=0.28.0` in `requirements.txt` to allow pip to fetch a compatible wheel.
- The project uses a PBKDF2-based password hashing implementation to avoid C-extension bcrypt issues in some environments.

Rebuilding backend image (includes dev deps)

```bash
docker compose build backend
docker compose up -d backend
```

CI
- The repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` which:
  - Starts Postgres, installs dependencies, runs migrations, starts the backend, and runs the auth tests.

Further reading
- See `backend/app` for source code and `backend/alembic` for migrations.
# Backend (FastAPI) — Local dev

1. Copy `.env.example` to `.env` and adjust `DATABASE_URL` if needed.

2. Start Postgres (recommended using the provided `docker-compose.yml` from project root):

```bash
docker-compose up -d
```

3. Install dependencies and run the app:

```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
```

4. Test:

- Health: `GET http://localhost:8000/health`
-- Create user: `POST http://localhost:8000/users` with JSON `{ "email": "a@b.com", "name": "A B" }`

Developer helpers
- Seed sample dev users:

Run from the `backend` directory:

```bash
python -m scripts.seed_dev
```

- Or run directly from repo root (ensure `backend` is on PYTHONPATH):

```bash
python backend/scripts/seed_dev.py
```

Frontend (Week 2)
- A minimal React + Tailwind frontend will live in the `frontend/` folder. It provides a login page and a simple post-login dashboard that shows the current user's info and department-scoped user lists. Follow the top-level `frontend/README.md` for setup when it's added.

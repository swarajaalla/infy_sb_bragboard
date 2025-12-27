# Infy_SB_Bragboard

Bragboard is an internal recognition tool for workplaces that lets employees appreciate their colleagues by posting shout-outs.
It promotes a culture of appreciation by allowing tagging, commenting, and company-wide visibility. Admins can monitor engagement and moderate flagged content.

## Current Status: Milestone 2 Completed ✅

**Milestone 1**: User Management & Authentication ✅
**Milestone 2**: Shout-Out Posting & Feed ✅ (See [MILESTONE_2.md](MILESTONE_2.md) for details)
**Milestone 3**: Tagging, Reactions & Comments (In Progress)
**Milestone 4**: Admin Tools & Analytics (Planned)

---

## Tech Stack
- **Frontend**: React.js + Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **Authentication**: JWT (access + refresh tokens)
- **Deployment**: Docker + Docker Compose

---

## Features

### ✅ Implemented
- User registration and login with JWT authentication
- Department-based user organization
- Shout-out creation with multi-user tagging
- Department-wide tagging feature
- Feed with filtering by:
  - Department
  - Sender
  - Date range
- Real-time feed updates
- Responsive UI with Tailwind CSS

### 🚧 In Progress (Milestone 3)
- Reactions (like, clap, star)
- Commenting system
- Nested comments (optional)

### 📋 Planned (Milestone 4)
- Admin dashboard
- Content moderation
- Analytics and reports
- Leaderboard

---

## Modules
- **Module A**: User Management & Authentication ✅
- **Module B**: Shout-Out Creation & Feed ✅
- **Module C**: Tagging, Reactions & Comments (In Progress)
- **Module D**: Admin Tools & Analytics (Planned) 



## Quick Start

### 1. Start Docker Services
```bash
docker-compose up -d
```

### 2. Seed Sample Data (Optional)
```bash
cd backend
python -m scripts.seed_dev        # Creates 8 sample users
python -m scripts.seed_shoutouts  # Creates 15 sample shoutouts
```

### 3. Start Backend
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

To kill existing server on port 8000:
```bash
sudo sh -c 'pid=$(lsof -t -i :8000 -sTCP:LISTEN 2>/dev/null) || true; if [ -n "$pid" ]; then echo Killing PID $pid; kill -9 $pid && echo Killed $pid; else echo No process found on port 8000; fi'
```

### 4. Start Frontend
```bash
cd frontend
npm install  # first time only
npm run dev
```

### 5. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## Sample Credentials
After running seed scripts, you can login with:
- Email: `alice@example.com` / Password: `password123` (Engineering)
- Email: `bob@example.com` / Password: `password123` (Sales)
- Email: `dave@example.com` / Password: `password123` (HR)

---

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get tokens
- `POST /auth/refresh` - Refresh access token
- `GET /auth/users/me` - Get current user info

### Users
- `GET /users` - List all users
- `GET /users?department={dept}` - List users in department

### Shoutouts
- `POST /shoutouts/` - Create new shoutout
- `GET /shoutouts` - Get all shoutouts
- `GET /shoutouts?department={dept}` - Filter by department
- `GET /shoutouts?sender_id={id}` - Filter by sender
- `GET /shoutouts?from_date={date}&to_date={date}` - Filter by date range

---

## Project Structure
```
backend/
  ├── app/
  │   ├── routers/         # API routes
  │   ├── core/            # Security & config
  │   ├── models.py        # Database models
  │   ├── schemas.py       # Pydantic schemas
  │   └── main.py          # FastAPI app
  ├── scripts/             # Seed scripts
  └── tests/               # Unit tests

frontend/
  ├── src/
  │   ├── App.jsx          # Main app component
  │   ├── Dashboard.jsx    # Main dashboard
  │   ├── CreateShoutout.jsx   # Shoutout form
  │   ├── ShoutoutFeed.jsx     # Feed with filters
  │   ├── Login.jsx        # Login page
  │   └── Register.jsx     # Registration page
  └── package.json
``` 
BragBoard – Internal Employee Recognition Wall 🎉
Project Overview

BragBoard is an internal employee recognition platform that enables employees to appreciate and acknowledge their colleagues by posting shout-outs. It promotes a positive workplace culture through peer recognition, reactions, and comments, while providing admins with moderation and analytics tools.

This project is developed as part of the Infosys Springboard – Full Stack Development Project.

Key Features
👤 User Features

User registration and login using JWT authentication

Create shout-outs for colleagues

Tag multiple recipients in a shout-out

View a real-time shout-out feed

React to shout-outs (Like, Clap, Star)

Comment on shout-outs

🛠 Admin Features

Admin dashboard

View engagement statistics

Moderate or delete shout-outs and comments

Monitor reported content

Tech Stack
Frontend

React.js

Tailwind CSS

Vite

Axios for API communication

Backend

FastAPI

JWT Authentication

SQLAlchemy ORM

Database

PostgreSQL (can be configured)

SQLite (for local testing if needed)

## Project Structure

```text
bragboard_full_project/
│
├── Backend - bragboard/
│   ├── app.py
│   ├── auth.py
│   ├── db.py
│   ├── models.py
│   ├── schemas.py
│   ├── shoutout_routes.py
│   ├── shoutout_utils.py
│   └── utils.py
│
├── bragboard-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md

How to Run the Project (Local Setup)
Prerequisites

Node.js (v18+ recommended)

Python (v3.10+ recommended)

Git

PostgreSQL (optional for production)

Backend Setup
cd "Backend - bragboard"
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload (or) python -m uvicorn app:app --reload
Live Server: https://bragboard-backend-2gpa.onrender.com/docs#/


Backend will run at:

http://127.0.0.1:8000

Frontend Setup
cd bragboard-frontend
npm install
npm run dev


Frontend will run at:

http://localhost:5173

Authentication

JWT-based authentication is implemented

Access tokens are used to secure APIs

Role-based access control for Admin and Employee users

Milestones Covered
✅ Milestone 1

User registration & login

JWT authentication

Basic UI and routing

✅ Milestone 2

Shout-out creation

Feed display

Recipient tagging

✅ Milestone 3

Reactions (Like, Clap, Star)

Commenting system

✅ Milestone 4

Admin dashboard

Moderation tools

Analytics & reporting APIs

Future Enhancements

Deployment on cloud (Render / Vercel)

Email notifications

File upload validation

Enhanced admin analytics

Role-based UI improvements

Project Status

✅ Completed and functional
✅ Meets Infosys Springboard project requirements

Author

Group B – Infosys Springboard Project
BragBoard – Full Stack Application

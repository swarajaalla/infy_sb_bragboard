Infy SB BragBoard – Group B
Project Overview

BragBoard is an internal employee recognition platform that enables users to post shout-outs to appreciate colleagues across different departments.
The platform promotes a positive work culture through peer recognition and engagement.

Tech Stack

Frontend: React + Vite

Backend: FastAPI

Database: SQLite

Authentication: JWT (JSON Web Tokens)

Milestones Completed
Milestone 1

User registration and login

JWT-based authentication

Role-protected routes

Backend API setup using FastAPI

Milestone 2

Shout-out creation functionality

Shout-out feed display

Department-based tagging

Frontend–backend integration

Milestone 3

Commenting on shout-outs

Reaction system (likes/appreciation)

Modular backend structure (routes, schemas, services)

Improved frontend UI components

Milestone 4

Secure API communication

Error handling and validations

Project structure cleanup

README documentation and repository organization

How to Run the Project
Backend Setup
cd backend
pip install -r requirements.txt
uvicorn main:app --reload


Backend will run at: http://127.0.0.1:8000

Frontend Setup
cd frontend
npm install
npm run dev


Frontend will run at: http://localhost:5173

Project Structure
backend/
 ├── main.py
 ├── auth.py
 ├── models.py
 ├── schemas.py
 └── requirements.txt

frontend/
 ├── src/
 ├── public/
 ├── package.json
 └── vite.config.js

Conclusion

The BragBoard project successfully demonstrates a full-stack application with secure authentication, RESTful APIs, and seamless frontend–backend integration.
All assigned milestones for Group B have been completed as per the project requirements.

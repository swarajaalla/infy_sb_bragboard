# BragBoard – Employee Recognition Platform

## 📌 Project Overview
BragBoard is a web-based employee recognition platform designed to encourage peer appreciation and improve workplace engagement. Employees can send shoutouts to colleagues, react and comment on posts, while administrators can monitor activity, moderate content, and generate reports.

This project is developed as part of the **Infosys Internship / System Builder Program**.

---

## 🛠️ Tech Stack

### Frontend
- React.js (Vite)
- Tailwind CSS
- JavaScript (ES6)
- Axios

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication

### Tools
- Git & GitHub
- VS Code
- Postman (API testing)

---

## 📂 Project Structure

infy_sb_bragboard/
│
├── backend/
│ ├── app/
│ │ ├── core/
│ │ ├── models/
│ │ ├── routes/
│ │ ├── schemas/
│ │ ├── utils/
│ │ ├── database.py
│ │ └── main.py
│ ├── make_admin.py
│ └── package.json
│
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── services/
│ │ ├── App.jsx
│ │ └── main.jsx
│ ├── index.html
│ └── package.json
│
├── .gitignore
└── README.md


---

## ⚙️ Features

### User Features
- User registration and login
- Send shoutouts to peers
- Like and comment on shoutouts
- View department-wise shoutouts
- User profile management

### Admin Features
- Admin dashboard with analytics
- Manage users and shoutouts
- Moderate reported content
- Export data (CSV / PDF)
- View admin activity logs

---

## ▶️ How to Run the Project

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

Backend will run at:
http://127.0.0.1:8000

http://127.0.0.1:8000/docs

Frontend Setup:
cd frontend
npm install
npm run dev

Frontend will run at:
http://localhost:5173


🔐 Default Roles

User: Regular employee
Admin: Can be created using make_admin.py

📄 Reports

CSV Export
PDF Export
Master Admin Report
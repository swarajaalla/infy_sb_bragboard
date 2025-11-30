# BragBoard Frontend (Dev)

Minimal Vite + React + Tailwind scaffold for Week 2.

Quick start

```bash
cd frontend
npm install
npm run dev
```

Notes
- The dev server proxies to the backend if you run it with `vite` + set up a `proxy` in `vite.config.js` or use the environment to run front and backend on the same origin. For quick local testing, run the backend on `http://localhost:8000` and in development use a small browser extension or configure a local reverse-proxy.
- Login uses the backend OAuth2 password flow at `POST /auth/login` (form-encoded). After login the app calls `/auth/users/me` and `/users?department=...`.

# Group 54 NaijaCare Backend (Render-ready)

Express + PostgreSQL backend extracted from the app for separate deployment.

## Start locally

```bash
npm install
cp .env.example .env
npm run dev
```

## Deploy on Render

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Environment variables:
  - `PORT` (Render sets this)
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `FRONTEND_URL` (your Vercel frontend URL)

## API base

`https://<your-render-app>.onrender.com/api`

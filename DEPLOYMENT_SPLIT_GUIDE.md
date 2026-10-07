# Group 54 Split Deployment Guide

## Architecture

- Frontend: Next.js app (repo root) -> deploy on Vercel
- Backend: Express API (`backend/`) -> deploy on Render
- Database: PostgreSQL (Render/Neon/Supabase/local)

---

## 1) Run locally (split mode)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs on `http://localhost:5000`.

### Frontend (repo root)

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Then run:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`.

---

## 2) Deploy backend to Render

1. Push repo to GitHub.
2. In Render: New Web Service -> connect repo.
3. Set Root Directory to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add env vars:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL` = your Vercel URL
7. Deploy and copy backend URL:
   - `https://<your-backend>.onrender.com`

Health check:

- `https://<your-backend>.onrender.com/api/health`

---

## 3) Deploy frontend to Vercel

1. Import same repo into Vercel.
2. Keep Root Directory as project root.
3. Add env var:
   - `NEXT_PUBLIC_API_BASE_URL=https://<your-backend>.onrender.com`
4. Deploy.

---

## 4) GitHub collaboration workflow

- Protect `main` branch (PR required).
- Each member works in feature branch:
  - `feature/auth`
  - `feature/medicines-api`
  - `feature/catalog-ui`
  - `feature/cart-checkout`
  - `feature/orders`
  - `feature/admin`

Typical flow:

```bash
git checkout main
git pull origin main
git checkout -b feature/<name>
# work
git add .
git commit -m "feat: <summary>"
git push -u origin feature/<name>
```

Then open PR and request review.

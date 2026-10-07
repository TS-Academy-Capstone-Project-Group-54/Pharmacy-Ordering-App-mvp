# Group 54 Deployment Structure

## Final structure

- `frontend/` → Next.js frontend app (deploy to **Vercel**)
- `backend/` → Express API app (deploy to **Render**)

You can now manage both sections independently.

---

## Recommended Online PostgreSQL (Global Access)

## 1) **Neon** (Recommended)

- Fast setup, generous free tier
- Excellent for serverless and Render/Vercel setups
- Easy connection string usage

## 2) **Supabase Postgres**

- Good dashboard and SQL editor
- Easy to inspect tables and run SQL remotely

## 3) **Render PostgreSQL**

- Good if you want DB in same platform as backend
- Straightforward private connection with Render services

---

## What to use for this project

**Use Neon Postgres** for easiest external access across team members.

- Create Neon project
- Copy connection string
- Put in backend env:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
FRONTEND_URL=https://<your-vercel-frontend>.vercel.app
```

In frontend env (Vercel):

```env
NEXT_PUBLIC_API_BASE_URL=https://<your-render-backend>.onrender.com
```

---

## Deploy order

1. Deploy `backend/` to Render
2. Test backend health `/api/health`
3. Deploy `frontend/` to Vercel with backend URL
4. Run full end-to-end smoke test (auth, catalogue, cart, checkout, admin)

# Group 54 NaijaCare Frontend

This folder contains the standalone Next.js frontend.

## Run locally

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=https://pharmacy-ordering-app-api.onrender.com/
```

Then run:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

---

## Deploy on Vercel

1. Import the repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Add env var:

```env
NEXT_PUBLIC_API_BASE_URL=https://pharmacy-ordering-app-api.onrender.com/
```

4. Deploy.

---

## Notes
- All frontend API calls are configured to use `NEXT_PUBLIC_API_BASE_URL` when set.
- If `NEXT_PUBLIC_API_BASE_URL` is empty, it falls back to same-origin `/api/*` routes.

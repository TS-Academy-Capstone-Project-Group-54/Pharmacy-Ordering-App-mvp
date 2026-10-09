# Group 54 — NaijaCare Frontend

A Next.js 16 application providing the customer-facing interface for the NaijaCare Pharmacy Ordering platform. This frontend supports medicine browsing, search, cart functionalities, login, checkout, and order tracking.

## Overview

This standalone frontend connects to the backend API and is designed to be responsive, mobile-friendly, and easy to deploy. It includes features such as authentication, product browsing, order history, admin pages, and dark mode.

## Tech Stack

- Framework: Next.js 16
- UI Library: React 19
- Language: TypeScript
- Styling: Tailwind CSS
- HTTP Client: Native `fetch`
- Development: ESLint, TypeScript

## Project Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── medicines/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── admin/
│   │   └── auth/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── styles/
│   └── types/
├── public/
├── .env.local.example
├── next.config.ts
├── tsconfig.json
├── README.md
└── package.json
```

## Features

- Product browsing and medicine search
- Cart and checkout flow
- Order history and status tracking
- User authentication and protected pages
- Admin dashboard views
- Dark mode support
- Responsive design for mobile and desktop

## Prerequisites

- Node.js v18 or newer
- npm or yarn
- Git
- A running backend instance or deployed API URL

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/TS-Academy-Capstone-Project-Group-54/Pharmacy-Ordering-App-mvp.git
cd Pharmacy-Ordering-App-mvp/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Example:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/
```

If you are using a deployed backend:

```env
NEXT_PUBLIC_API_BASE_URL=https://pharmacy-ordering-app-api.onrender.com/
```

## Running Locally

### Development mode

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

### Production build

```bash
npm run build
npm run start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL for the backend API | `http://localhost:5000/` |

> Note: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Never put secrets here.

## API Integration

The frontend communicates with the backend through HTTP requests. The base URL is configured via:

```env
NEXT_PUBLIC_API_BASE_URL
```

Common endpoints include:

- `/api/auth/login`
- `/api/auth/register`
- `/api/medicines`
- `/api/categories`
- `/api/orders`

## Deployment on Vercel

1. Import the repository into Vercel
2. Set the root directory to `frontend`
3. Set the environment variable:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://pharmacy-ordering-app-api.onrender.com/
   ```
4. Deploy the project

Your app will be available at:

```text
https://<your-project-name>.vercel.app
```

## Development Workflow

- Add pages in `src/app`
- Add shared UI in `src/components`
- Keep API logic centralized in `src/lib`
- Run `npm run lint` before pushing code

## Troubleshooting

### API connection errors
- Confirm `NEXT_PUBLIC_API_BASE_URL` is set correctly
- Ensure the backend is running
- Check that the backend is reachable on the configured port

### Unauthorized errors
- Log back in to refresh the token
- Ensure the token is being sent in the Authorization header

### Build failures on Vercel
- Check environment variables
- Verify `next.config.ts` is correct
- Run `npm run build` locally before deployment

## Contributing

1. Create a feature branch from `main`
2. Make changes and commit clearly
3. Push to your branch
4. Open a pull request for review

## License

See the root repository LICENSE file if available.

## Support

For issues or questions, open a GitHub issue in the project repository.

---

Frontend URL (Local): `http://localhost:3000`  
Frontend URL (Production): `https://<your-project-name>.vercel.app`

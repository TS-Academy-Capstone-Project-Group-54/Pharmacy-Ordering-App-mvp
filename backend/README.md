# Group 54 — NaijaCare Backend API

Express.js + PostgreSQL backend for the NaijaCare Pharmacy Ordering application. This service provides the REST API endpoints for authentication, medicines, categories, orders, and inventory management.

## Overview

The backend is built with Node.js and Express, using PostgreSQL as the database with Drizzle ORM for type-safe database operations. It implements JWT-based authentication and is designed for deployment on Render or similar cloud platforms.

## Tech Stack

- Runtime: Node.js v18+
- Framework: Express.js
- Database: PostgreSQL 12+
- ORM: Drizzle ORM
- Authentication: JWT (`jose`)
- Password Hashing: `bcryptjs`
- Environment: `dotenv`
- Development: TypeScript, ESLint

## Project Structure

```text
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── medicines.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   ├── search.js
│   │   └── seed.js
│   ├── middleware/
│   │   └── auth.js
│   ├── db/
│   │   ├── schema.ts
│   │   └── index.ts
│   └── index.js
├── .env.example
├── package.json
├── tsconfig.json
├── drizzle.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Medicines
- `GET /api/medicines`
- `POST /api/medicines`
- `GET /api/medicines/:id`
- `PUT /api/medicines/:id`
- `DELETE /api/medicines/:id`

### Categories
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/categories/:id`
- `PUT /api/categories/:id`
- `DELETE /api/categories/:id`

### Orders
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`

### Users
- `GET /api/users/profile`

### Search
- `GET /api/search`

### Seed Data
- `POST /api/seed`

## Prerequisites

- Node.js v18 or newer
- npm or yarn
- PostgreSQL 12+
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/TS-Academy-Capstone-Project-Group-54/Pharmacy-Ordering-App-mvp.git
cd Pharmacy-Ordering-App-mvp/backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Example:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=your_secure_secret_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Set up the database

```bash
createdb app_db
npx drizzle-kit push
```

### 5. Seed demo data

```bash
npm run seed
```

## Running Locally

### Development mode

```bash
npm run dev
```

The server runs at:

```text
http://localhost:5000
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/app_db` |
| `JWT_SECRET` | Secret for signing JWT tokens | `your_secure_key` |
| `FRONTEND_URL` | Frontend origin used for CORS | `http://localhost:3000` |
| `NODE_ENV` | Runtime environment | `development` |

## Deployment on Render

1. Go to Render
2. Create a new Web Service
3. Set the Root Directory to `backend`
4. Use the build command:
   ```bash
   npm install
   ```
5. Use the start command:
   ```bash
   npm start
   ```
6. Add environment variables:
   - `PORT`
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`

Your API will be available at:

```text
https://<your-render-app>.onrender.com/api
```

## Database Schema

The main tables include:

- `users`
- `categories`
- `medicines`
- `orders`
- `order_items`

## Authentication Flow

1. User registers or logs in with email/password.
2. Backend validates credentials and issues a JWT.
3. Frontend sends the token in the Authorization header.
4. Protected routes verify the token before responding.

## Troubleshooting

### Database connection error
- Check your `DATABASE_URL`
- Make sure PostgreSQL is running
- Verify the database exists

### JWT verification failed
- Ensure `JWT_SECRET` matches across the app
- Include the token in the `Authorization` header as `Bearer <token>`

### CORS errors
- Check `FRONTEND_URL`
- Make sure the frontend domain is allowed

## Contributing

1. Create a feature branch from `main`
2. Make your changes and commit clearly
3. Push and open a pull request for review

## License

See the root repository LICENSE file if available.

## Support

For issues or questions, open a GitHub issue in the project repository.

---

API Base URL (Local): `http://localhost:5000/api`  
API Base URL (Production): `https://<your-render-app>.onrender.com/api`

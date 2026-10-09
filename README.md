# Group 54 — NaijaCare Pharmacy Ordering App

A full-stack pharmacy ordering application built with Next.js, PostgreSQL, and Drizzle ORM. This MVP is designed for a Nigerian pharmacy context and supports customer shopping, order management, admin workflows, and secure authentication.

Live demo: https://pharmacy-ordering-app-mvp.vercel.app

## Overview

NaijaCare is a pharmacy ordering platform that allows customers to browse medicines, search for products, add items to a cart, place orders, and track fulfillment. The app also includes an admin dashboard for handling inventory, categories, orders, and user-related workflows.

The project is organized as a monorepo with separate frontend and backend services:
- Frontend: Next.js application
- Backend: Express API using PostgreSQL and Drizzle ORM

## Project Goals

- Create a functional pharmacy ordering MVP
- Support customer and admin user roles
- Use a secure JWT-based authentication flow
- Offer a clean, responsive UI
- Provide an API-first architecture suitable for deployment

## Key Features

- User registration, login, and logout
- JWT-based authentication and protected routes
- Product browsing and search
- Category-based organization of medicines
- Cart and checkout workflow
- Order creation and order history
- Admin dashboard for inventory and order management
- Role-based access for customer and admin users
- Nigerian pricing context using Naira (₦)
- Dark mode and UX enhancements
- Mobile-friendly and responsive layout

## User Roles

- `customer`
- `admin`

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostCSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- Drizzle ORM
- JWT with `jose`
- `bcryptjs` for password hashing
- `dotenv` for environment management

### Development Tools
- TypeScript
- ESLint
- Drizzle Kit

## Repository Structure

```text
Pharmacy-Ordering-App-mvp/
├── backend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── .env.example
├── package.json
├── README.md
├── .gitignore
├── .eslintrc.json
├── tsconfig.json
└── next.config.ts
```

## Database Schema

The application uses PostgreSQL with Drizzle ORM and includes the following tables:

- `users`
- `categories`
- `medicines`
- `orders`
- `order_items`

## Main API Routes

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

## Seed Accounts

The app includes default seed accounts for demo use:

- Admin: `admin@naijacare.com` / `Admin123!`
- Customer: `customer@naijacare.com` / `Customer123!`

## Prerequisites

Before running the project locally, make sure you have the following installed:

- Node.js v18 or newer
- npm or yarn
- PostgreSQL 12+
- Git

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/TS-Academy-Capstone-Project-Group-54/Pharmacy-Ordering-App-mvp.git
cd Pharmacy-Ordering-App-mvp
```

### 2. Install dependencies

```bash
npm install
```

If you are using the separate frontend/backend structure:

```bash
cd frontend && npm install
cd ../backend && npm install
```

## Environment Variables

### Root environment

Copy the example file:

```bash
cp .env.example .env
```

Example contents:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=replace_with_secure_secret
SEED_KEY=optional_seed_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Backend environment

```bash
cd backend
cp .env.example .env
```

Example:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=replace_with_secure_secret
FRONTEND_URL=http://localhost:3000
```

### Frontend environment

```bash
cd frontend
cp .env.example .env.local
```

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
JWT_SECRET=replace_with_secure_secret
SEED_KEY=optional_seed_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Database Setup

Create a PostgreSQL database and run the schema push:

```bash
createdb app_db
npx drizzle-kit push
```

If the backend is run separately, you may use the backend database config as the source of truth.

## Running the App Locally

### Start the backend

```bash
cd backend
npm run dev
```

Backend URL:

```text
http://localhost:5000
```

### Start the frontend

```bash
cd frontend
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

### Seed the database

Once the app is running, you can seed demo data with:

```bash
curl -X POST http://localhost:3000/api/seed
```

## Deployment

### Frontend (Vercel)

1. Import the repository into Vercel
2. Set the root directory to `frontend`
3. Add environment variables for the frontend deployment
4. Deploy the project

Example frontend environment value:

```env
NEXT_PUBLIC_API_BASE_URL=https://pharmacy-ordering-app-api.onrender.com/
```

### Backend (Render)

1. Create a new Web Service on Render
2. Set the root directory to `backend`
3. Use the following start command:

```bash
npm start
```

4. Add environment variables such as:
- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

## UX Features Included

- Dark mode toggle
- Sticky header and mobile menu
- Scroll progress bar
- Back-to-top button
- Loading states and animations
- Full-site search
- Skip-to-content link
- Floating contact button
- Expandable FAQs
- Newsletter signup success state
- Password visibility toggles
- Cookie banner
- Confirmation modal for destructive actions
- Custom 404 page
- Print stylesheet
- UTM tracking on outbound links
- Copy-to-clipboard button on code snippets
- Last-updated timestamps

## Suggested Team Split

- Team A: Auth / session / security
- Team B: Medicine + category APIs
- Team C: Medicine UI / search / filter / details
- Team D: Cart + checkout
- Team E: Orders + inventory + statuses
- Team F: Admin dashboard + management UI

## Branch Strategy

- `main`
- `feature/auth`
- `feature/medicines-api`
- `feature/medicines-ui`
- `feature/cart-checkout`
- `feature/orders`
- `feature/admin-ui`
- `feature/docs-deployment`

## Development Notes

This project was intentionally kept MVP-focused and beginner/intermediate friendly while still aiming for a production-minded structure.

## Contributing

1. Create a feature branch from `main`
2. Make your changes and commit clearly
3. Ensure your code is linted and tested
4. Open a pull request for review

## License

The repository metadata does not currently specify a license file. If you plan to publish or distribute this project widely, consider adding an explicit license such as MIT or ISC.

## Support

If you have questions or run into issues, please check the GitHub Issues page for the repository and open a new issue with as much detail as possible.

---

Project repository: https://github.com/TS-Academy-Capstone-Project-Group-54/Pharmacy-Ordering-App-mvp

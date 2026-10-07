# Group 54 — NaijaCare Pharmacy Ordering App

A complete full-stack MVP for Nigerian pharmacy ordering using **Next.js App Router + PostgreSQL + Drizzle ORM**.

## Core Features

- Customer registration/login/logout with JWT cookie sessions
- Medicine browsing, search, filter and availability checks
- Cart, checkout, order placement and order history
- Order fulfilment tracking workflow
- Admin dashboard for medicines, categories, orders, inventory/status updates
- Nigerian context with **Naira (₦)** pricing

## UX Features Implemented

- Dark mode toggle
- Sticky header + mobile menu
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
- Last-updated timestamps on posts

## User Roles

- `customer`
- `admin`

## Main API Routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET/POST /api/medicines`
- `GET/PUT/DELETE /api/medicines/:id`
- `GET/POST /api/categories`
- `GET/PUT/DELETE /api/categories/:id`
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `GET/PUT /api/users/profile`
- `GET /api/search`
- `POST /api/seed`

## Database Tables

- `users`
- `categories`
- `medicines`
- `orders`
- `order_items`

## Setup

1. Install dependencies: `npm install`
2. Copy env: `cp .env.example .env`
3. Push schema: `npx drizzle-kit push`
4. Run app: `npm run dev`
5. Seed data: `curl -X POST http://localhost:3000/api/seed`

## Seed Accounts

- Admin: `admin@naijacare.com` / `Admin123!`
- Customer: `customer@naijacare.com` / `Customer123!`

## Suggested Team Split (Group 54)

- Team A: Auth/session/security
- Team B: Medicine + category APIs
- Team C: Medicine UI/search/filter/details
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

## Notes

This implementation intentionally stays MVP-focused, production-minded, and beginner/intermediate friendly.

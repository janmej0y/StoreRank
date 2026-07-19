<div align="center">

# ⭐ StoreRank

**A full-stack store ratings platform.**
Users browse registered stores and submit ratings. Store owners track how their store is performing. Administrators manage the entire catalog from a dashboard.

[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## Contents

- [Overview](#overview)
- [Roles](#roles)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Backend setup](#backend-setup)
- [Frontend setup](#frontend-setup)
- [Database schema](#database-schema)
- [API overview](#api-overview)
- [Form validation rules](#form-validation-rules)
- [Design notes / decisions](#design-notes--decisions-made-where-the-spec-left-room)
- [Project scripts](#project-scripts)

---

## Overview

Monorepo layout:

```
backend/    Express API · Prisma ORM · PostgreSQL
frontend/   React (Vite) SPA · React Router · Axios · Tailwind CSS
```

| Layer | Stack |
|---|---|
| **Backend** | Express.js, PostgreSQL via Prisma ORM, JWT auth, bcrypt password hashing, express-validator |
| **Frontend** | React 18 (Vite), React Router 6, Axios, Tailwind CSS, react-hot-toast |

---

## Roles

| Role | Capabilities |
|---|---|
| 🛡️ **System Administrator** | Create users/stores/admins, view platform dashboard, browse/filter/sort all users and stores, view user detail (incl. owner's store rating) |
| 👤 **Normal User** | Register, browse/search/sort stores, submit or update a 1–5 rating per store |
| 🏪 **Store Owner** | View a dashboard of everyone who rated their store and the store's average rating |

All three roles share a single login (`POST /api/auth/login`) and can change their own password. Only **Normal Users** can self-register — Admins and Store Owners are provisioned by an Administrator via **Admin → Users → Add user**.

---

## Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+** — a local install, the provided `docker-compose.yml`, or a managed provider such as [Supabase](https://supabase.com)

<details>
<summary><strong>Postgres options</strong></summary>

<br>

- **Docker:**
  ```bash
  docker compose up -d
  ```
  Starts Postgres on `localhost:5432` with database `store_ratings`, user `postgres`, password `postgres`.

- **Supabase:** create a project at supabase.com, then grab two connection strings from **Project Settings → Database → Connection string**:
  - **Pooled** (Transaction mode, port `6543`) → `DATABASE_URL`, used by the app at runtime.
  - **Direct** (Session mode, port `5432`) → `DIRECT_URL`, used only by Prisma to run migrations (PgBouncer's pooled port doesn't support the migration engine).

  `backend/.env.example` shows the exact format for both.

</details>

---

## Quick start

```bash
# 1. Database
docker compose up -d

# 2. Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev              # → http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev              # → http://localhost:5173
```

Then sign in with the [seeded admin account](#seeded-credentials), or use the **"Demo as Admin" / "Demo as Store Owner"** buttons on the login page.

---

## Backend setup

```bash
cd backend
cp .env.example .env      # fill in DATABASE_URL / DIRECT_URL / JWT_SECRET
npm install
npx prisma generate         # regenerate the client if you changed the schema/env
npx prisma migrate deploy # applies the SQL migration in prisma/migrations
npm run seed               # creates the admin account, sample stores/owners/users/ratings
npm run dev                 # starts the API on http://localhost:5000
```

> `npm run seed` is idempotent (`upsert`-based) — safe to re-run.

### Environment variables (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | Runtime PostgreSQL connection (pooled, if using Supabase) | `postgresql://postgres:postgres@localhost:5432/store_ratings?schema=public` |
| `DIRECT_URL` | Direct PostgreSQL connection, used by Prisma for migrations | same as `DATABASE_URL` for local/Docker Postgres |
| `PORT` | API port | `5000` |
| `NODE_ENV` | `development` \| `production` | `development` |
| `JWT_SECRET` | Secret used to sign access tokens — **change this** | — |
| `JWT_EXPIRES_IN` | Access token lifetime | `1d` |
| `CLIENT_ORIGIN` | Allowed CORS origin (the frontend URL) | `http://localhost:5173` |

### Seeded credentials

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@storerank.com` | `Admin@1234` |
| Store Owner (Downtown Coffee Roasters) | `owner1@storerank.com` | `Owner@1234` |
| Store Owner (Fixerville Hardware) | `owner2@storerank.com` | `Owner@1234` |
| Store Owner (Pagesburg Bookstore) | `owner3@storerank.com` | `Owner@1234` |
| Store Owner (Bengaluru Coffee House) | `owner.bengaluru@storerank.com` | `Owner@1234` |
| Store Owner (Mumbai Electronics Bazaar) | `owner.mumbai@storerank.com` | `Owner@1234` |
| Store Owner (Jaipur Handicrafts Emporium) | `owner.jaipur@storerank.com` | `Owner@1234` |
| Normal User | `normal.user.number.one@storerank.com` | `User@1234` |
| Normal User (India) | `ananya.iyer@storerank.com` | `User@1234` |

The Login page also has one-click **"Demo as Admin"** / **"Demo as Store Owner"** buttons so recruiters can explore without typing credentials.

---

## Frontend setup

```bash
cd frontend
cp .env.example .env      # points at the backend API, defaults to http://localhost:5000/api
npm install
npm run dev                 # starts the SPA on http://localhost:5173
```

### Environment variables (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api` |

---

## Database schema

| Table | Columns | Notes |
|---|---|---|
| **users** | `id, name, email (unique), password_hash, address, role (ADMIN\|USER\|OWNER), is_active, created_at, updated_at` | Indexed on `email`, `role` |
| **stores** | `id, name, email, address, owner_id (FK → users, nullable, ON DELETE SET NULL), is_active, created_at, updated_at` | Indexed on `owner_id`, `name`, `email` |
| **ratings** | `id, user_id (FK → users, ON DELETE CASCADE), store_id (FK → stores, ON DELETE CASCADE), rating (CHECK 1–5), comment (optional, ≤500 chars), created_at, updated_at` | Unique on `(user_id, store_id)` — a rating is created once, then upserted on resubmission. Indexed on `store_id`, `user_id` |

A store's overall rating and an owner's store rating are always computed **live** via `AVG(ratings.rating)` — there is no stale stored average column.

`is_active` implements soft delete/deactivate for users and stores: an admin can deactivate either from the UI. Deactivated users are blocked at login (and mid-session, since the auth middleware re-checks on every request); deactivated stores disappear from the normal-user store list but stay visible — flagged — in the admin store list. **Nothing is hard-deleted**, so rating history is always preserved.

Full DDL: [`20260717000000_init/migration.sql`](backend/prisma/migrations/20260717000000_init/migration.sql) · [`20260717120000_add_soft_delete_and_comments/migration.sql`](backend/prisma/migrations/20260717120000_add_soft_delete_and_comments/migration.sql)
Prisma schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

---

## API overview

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a Normal User |
| `POST` | `/auth/login` | Public | Log in, returns JWT + user |
| `GET` | `/auth/me` | Authenticated | Current user profile |
| `PATCH` | `/auth/password` | Authenticated | Change password |
| `GET` | `/admin/dashboard` | Admin | Total users / stores / ratings |
| `GET` | `/admin/users` | Admin | List users — `?name=&email=&address=&role=&sortBy=&order=&page=&pageSize=` |
| `POST` | `/admin/users` | Admin | Create a user (any role) |
| `GET` | `/admin/users/:id` | Admin | User detail (+ store rating if OWNER) |
| `PATCH` | `/admin/users/:id/status` | Admin | Activate/deactivate a user (`{ isActive }`); cannot target self |
| `GET` | `/admin/stores` | Admin | List stores — `?name=&email=&address=&sortBy=&order=&page=&pageSize=` |
| `POST` | `/admin/stores` | Admin | Create a store, optionally assigning an owner |
| `PATCH` | `/admin/stores/:id/status` | Admin | Activate/deactivate a store (`{ isActive }`) |
| `GET` | `/stores` | Normal User | Browse active stores — `?name=&address=&sortBy=&order=&page=&pageSize=`, includes the caller's own rating |
| `GET` | `/stores/:id` | Normal User, Admin | Store detail: average, 1★–5★ distribution, and all reviews (name, rating, comment) |
| `POST` | `/stores/:id/rating` | Normal User | Upsert a 1–5 rating for a store, with an optional comment (≤500 chars) |
| `GET` | `/owner/dashboard` | Store Owner | Own store's raters + average — `?sortBy=&order=` |

`GET /admin/dashboard` additionally returns `recentRatings` (last 5 ratings platform-wide) and `topStores` (top 5 by average, minimum 2 ratings) for the dashboard's activity feed and leaderboard widgets.

Pagination follows a shared response shape:

```json
{ "items": [...], "pagination": { "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 } }
```

`page` defaults to `1`, `pageSize` defaults to `10` (capped at `50`).

Validation failures return `400` with `{ message, errors: { field: message } }`. Auth/permission failures return `401`/`403`. All errors flow through a single centralized error handler ([`backend/src/middleware/errorHandler.js`](backend/src/middleware/errorHandler.js)).

---

## Form validation rules

Enforced identically on the client ([`frontend/src/utils/validators.js`](frontend/src/utils/validators.js)) and server ([`backend/src/validators/`](backend/src/validators/)):

| Field | Rule |
|---|---|
| **Name** | 20–60 characters |
| **Address** | Up to 400 characters |
| **Password** | 8–16 characters, at least one uppercase letter and one special character |
| **Email** | Standard email format |
| **Rating** | Integer 1–5 |

---

## Design notes / decisions made where the spec left room

- **ORM:** Prisma, for its typed client and first-class migration diffing.
- **Validation library:** express-validator (per the spec's suggestion) with a centralized `validate` middleware that folds errors into a `field → message` map.
- **Sorting/filtering/pagination:** fully server-side via query params on every listing endpoint. Listings that sort by a computed field (`rating`) fetch and average in application code, then paginate in memory — correct and simple at this dataset's scale; endpoints without a computed sort key use Prisma's native `skip`/`take`.
- **JWT storage:** the access token is kept in `localStorage` and attached via an Axios request interceptor; a response interceptor clears it and redirects to `/login` on `401`.
- **Design system:** a neutral "ink" gray scale with a warm amber/blue accent, Inter typeface, a 4/8px spacing scale, and restrained borders/shadows instead of heavy card shadows — intentionally avoiding gradient-heavy "AI generated" styling.
- **Store owner without an assigned store:** the Owner Dashboard renders an explicit empty state rather than erroring.
- **Delete vs. deactivate:** users and stores are never hard-deleted from the admin UI — deactivating preserves rating history and referential integrity, and an admin can reactivate at any time.
- **Rating distribution chart:** the store detail page renders the 1★–5★ breakdown as plain CSS bars rather than pulling in a charting library, keeping the bundle small and the visual language consistent with the rest of the design system.

---

## Project scripts

**Backend** (`backend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start (production) |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:deploy` | Apply committed migrations (use this in setup/CI) |
| `npm run seed` | Run the seed script |
| `npm run prisma:studio` | Open Prisma Studio |

**Frontend** (`frontend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

<div align="center">

---

Built with Express, Prisma, PostgreSQL, React, and Tailwind CSS.

</div>
#   S t o r e R a n k  
 
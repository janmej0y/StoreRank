<div align="center">

# ⭐ StoreRank

**A full-stack store ratings platform.**

Users browse registered stores and submit ratings. Store owners track how their store is performing and respond to reviews. Administrators manage the entire catalog from a dashboard.

[![Node](https://img.shields.io/badge/Node-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Unlicensed-lightgrey)]()

</div>

<br>

<p align="center">
  <a href="#quick-start"><b>Quick start</b></a> ·
  <a href="#roles--features"><b>Roles &amp; features</b></a> ·
  <a href="#api-overview"><b>API</b></a> ·
  <a href="#deploying"><b>Deploying</b></a>
</p>

<br>

## Contents

- [Overview](#overview)
- [Roles &amp; features](#roles--features)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Backend setup](#backend-setup)
- [Frontend setup](#frontend-setup)
- [Deploying](#deploying)
- [Database schema](#database-schema)
- [API overview](#api-overview)
- [Form validation rules](#form-validation-rules)
- [Design notes / decisions](#design-notes--decisions-made-where-the-spec-left-room)
- [Project scripts](#project-scripts)

<br>

## Overview

<table>
<tr>
<td valign="top" width="50%">

**Monorepo layout**

```
backend/    Express API
            Prisma ORM
            PostgreSQL
frontend/   React (Vite) SPA
            React Router
            Axios
            Tailwind CSS
```

</td>
<td valign="top" width="50%">

**Stack**

| Layer | Technology |
|---|---|
| API | Express.js |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + bcrypt |
| Validation | express-validator |
| UI | React 18, Vite, Tailwind CSS |
| Routing | React Router 6 |
| HTTP | Axios |
| Toasts | react-hot-toast |

</td>
</tr>
</table>

<br>

## Roles &amp; features

<table>
<tr>
<td valign="top" width="33%">

### 🛡️ Administrator

- Platform-wide dashboard: totals, recent activity, top-rated stores
- Create users of any role and stores (with optional owner assignment)
- Browse/filter/sort all users and stores, paginated
- View any user's detail page, incl. an owner's store rating
- Activate/deactivate users and stores (soft delete)

</td>
<td valign="top" width="33%">

### 👤 Normal User

- Self-registration
- Browse, search, and sort all active stores
- Submit or update a 1–5 rating with an optional written review
- View a store's full rating distribution and every review left on it

</td>
<td valign="top" width="33%">

### 🏪 Store Owner

- Dashboard: average rating, total ratings, live 7-day trend chart
- Read every customer review, including written comments
- **Respond publicly to any review** — reply shows under the review
- **Edit their own store's** name, email, and address

</td>
</tr>
</table>

All three roles share one login (`POST /api/auth/login`) and can change their own password. Only **Normal Users** self-register — Admins and Store Owners are provisioned by an Administrator via **Admin → Users → Add user**.

<br>

## Prerequisites

- **Node.js 18+**
- **PostgreSQL 14+** — a local install, the provided `docker-compose.yml`, or a managed provider such as [Supabase](https://supabase.com)

<details>
<summary><strong>Postgres options</strong> (click to expand)</summary>
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

<br>

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

> Sign in with the [seeded admin account](#seeded-credentials), or use the **"Admin Login" / "Store Owner Login"** demo buttons on the login page.

<br>

## Backend setup

```bash
cd backend
cp .env.example .env        # fill in DATABASE_URL / DIRECT_URL / JWT_SECRET
npm install
npx prisma generate         # regenerate the client if you changed the schema/env
npx prisma migrate deploy   # applies committed migrations from prisma/migrations
npm run seed                # creates the admin account, sample stores/owners/users/ratings
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
| `CLIENT_ORIGIN` | Allowed CORS origin (the frontend URL, **no trailing slash**) | `http://localhost:5173` |

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

The Login page also has one-click **"Admin Login"** / **"Store Owner Login"** buttons so recruiters can explore without typing credentials.

<br>

## Frontend setup

```bash
cd frontend
cp .env.example .env        # points at the backend API, defaults to http://localhost:5000/api
npm install
npm run dev                 # starts the SPA on http://localhost:5173
```

### Environment variables (`frontend/.env`)

| Variable | Description | Default |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API (must include `/api`) | `http://localhost:5000/api` |

<br>

## Deploying

Vercel serves the frontend well but doesn't run a persistent Express server or host Postgres — split the deploy across three services:

| Service | Hosts | Notes |
|---|---|---|
| **Vercel** | `frontend/` | Set **Root Directory** to `frontend`; Vite preset is auto-detected |
| **Render** (or Railway) | `backend/` | Set **Root Directory** to `backend`; build with `npm install && npx prisma generate && npx prisma migrate deploy`; start with `npm start` |
| **Supabase** | PostgreSQL | Use the pooled/direct connection strings from [Prerequisites](#prerequisites) |

> [!IMPORTANT]
> **Env vars to double-check on each platform:**
> - **Vercel** → `VITE_API_URL` = your Render URL **with** `/api` appended (e.g. `https://storerank-api.onrender.com/api`)
> - **Render** → `CLIENT_ORIGIN` = your Vercel URL with **no trailing slash** (e.g. `https://storerank.vercel.app`) — a trailing slash silently breaks CORS
> - Both platforms bake env vars in at build time for a Vite app — **redeploy** after changing `VITE_API_URL`; a page refresh alone won't pick it up

Render's free tier sleeps after ~15 minutes of inactivity and takes 30–60s to wake — expect a slow first request after idle time.

<br>

## Database schema

| Table | Columns | Notes |
|---|---|---|
| **users** | `id, name, email (unique), password_hash, address, role (ADMIN\|USER\|OWNER), is_active, created_at, updated_at` | Indexed on `email`, `role` |
| **stores** | `id, name, email, address, owner_id (FK → users, nullable, ON DELETE SET NULL), is_active, created_at, updated_at` | Indexed on `owner_id`, `name`, `email` |
| **ratings** | `id, user_id (FK → users, ON DELETE CASCADE), store_id (FK → stores, ON DELETE CASCADE), rating (CHECK 1–5), comment (≤500 chars), owner_response (≤500 chars), owner_responded_at, created_at, updated_at` | Unique on `(user_id, store_id)` — a rating is created once, then upserted on resubmission. Indexed on `store_id`, `user_id` |

A store's overall rating and an owner's store rating are always computed **live** via `AVG(ratings.rating)` — there is no stale stored average column.

`is_active` implements soft delete/deactivate for users and stores: an admin can deactivate either from the UI. Deactivated users are blocked at login (and mid-session, since the auth middleware re-checks on every request); deactivated stores disappear from the normal-user store list but stay visible — flagged — in the admin store list. **Nothing is hard-deleted**, so rating history is always preserved.

<details>
<summary><strong>Migration history</strong></summary>
<br>

| Migration | Adds |
|---|---|
| [`20260717000000_init`](backend/prisma/migrations/20260717000000_init/migration.sql) | Initial `users`, `stores`, `ratings` tables |
| [`20260717120000_add_soft_delete_and_comments`](backend/prisma/migrations/20260717120000_add_soft_delete_and_comments/migration.sql) | `is_active` on users/stores, `comment` on ratings |
| [`20260719112324_add_owner_response`](backend/prisma/migrations/20260719112324_add_owner_response/migration.sql) | `owner_response`, `owner_responded_at` on ratings |

Prisma schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

</details>

<br>

## API overview

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

<details open>
<summary><strong>Auth</strong></summary>

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a Normal User |
| `POST` | `/auth/login` | Public | Log in, returns JWT + user |
| `GET` | `/auth/me` | Authenticated | Current user profile |
| `PATCH` | `/auth/password` | Authenticated | Change password |

</details>

<details open>
<summary><strong>Admin</strong></summary>

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | Admin | Totals, recent activity, top-rated stores |
| `GET` | `/admin/users` | Admin | List users — `?name=&email=&address=&role=&sortBy=&order=&page=&pageSize=` |
| `POST` | `/admin/users` | Admin | Create a user (any role) |
| `GET` | `/admin/users/:id` | Admin | User detail (+ store rating if OWNER) |
| `PATCH` | `/admin/users/:id/status` | Admin | Activate/deactivate a user (`{ isActive }`); cannot target self |
| `GET` | `/admin/stores` | Admin | List stores — `?name=&email=&address=&sortBy=&order=&page=&pageSize=` |
| `POST` | `/admin/stores` | Admin | Create a store, optionally assigning an owner |
| `PATCH` | `/admin/stores/:id/status` | Admin | Activate/deactivate a store (`{ isActive }`) |

</details>

<details open>
<summary><strong>Stores &amp; ratings</strong></summary>

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/stores` | Normal User | Browse active stores — `?name=&address=&sortBy=&order=&page=&pageSize=`, includes the caller's own rating |
| `GET` | `/stores/:id` | Normal User, Admin | Store detail: average, 1★–5★ distribution, and all reviews (name, rating, comment) |
| `POST` | `/stores/:id/rating` | Normal User | Upsert a 1–5 rating for a store, with an optional comment (≤500 chars) |

</details>

<details open>
<summary><strong>Store Owner</strong></summary>

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/owner/dashboard` | Store Owner | Own store's reviews, average rating, and 7-day ratings trend — `?sortBy=&order=&ratedFrom=&ratedTo=` |
| `PATCH` | `/owner/ratings/:id/response` | Store Owner | Reply to (or clear a reply on) a review on their own store (`{ response }`) |
| `PATCH` | `/owner/store` | Store Owner | Update their own store's name, email, and address |

</details>

`GET /admin/dashboard` additionally returns `recentRatings` (last 5 ratings platform-wide) and `topStores` (top 5 by average, minimum 2 ratings). `GET /owner/dashboard` returns `ratingsTrend` (a 7-day daily bucket series with a week-over-week delta) for the trend chart.

Pagination follows a shared response shape:

```json
{ "items": [ ], "pagination": { "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 } }
```

`page` defaults to `1`, `pageSize` defaults to `10` (capped at `50`).

Validation failures return `400` with `{ message, errors: { field: message } }`. Auth/permission failures return `401`/`403`. All errors flow through a single centralized error handler ([`backend/src/middleware/errorHandler.js`](backend/src/middleware/errorHandler.js)).

<br>

## Form validation rules

Enforced identically on the client ([`frontend/src/utils/validators.js`](frontend/src/utils/validators.js)) and server ([`backend/src/validators/`](backend/src/validators/)):

| Field | Rule |
|---|---|
| **Name** | 20–60 characters |
| **Address** | Up to 400 characters |
| **Password** | 8–16 characters, at least one uppercase letter and one special character |
| **Email** | Standard email format |
| **Rating** | Integer 1–5 |
| **Review comment / owner response** | Optional, up to 500 characters |

<br>

## Design notes / decisions made where the spec left room

- **ORM:** Prisma, for its typed client and first-class migration diffing.
- **Validation library:** express-validator (per the spec's suggestion) with a centralized `validate` middleware that folds errors into a `field → message` map.
- **Sorting/filtering/pagination:** fully server-side via query params on every listing endpoint. Listings that sort by a computed field (`rating`) fetch and average in application code, then paginate in memory — correct and simple at this dataset's scale; endpoints without a computed sort key use Prisma's native `skip`/`take`.
- **JWT storage:** the access token is kept in `localStorage` and attached via an Axios request interceptor; a response interceptor clears it and redirects to `/login` on `401`.
- **Design system:** a neutral "ink" gray scale with a warm amber/blue accent, Inter typeface, a 4/8px spacing scale, and restrained borders/shadows instead of heavy card shadows — intentionally avoiding gradient-heavy "AI generated" styling.
- **Store owner without an assigned store:** the Owner Dashboard renders an explicit empty state rather than erroring.
- **Delete vs. deactivate:** users and stores are never hard-deleted from the admin UI — deactivating preserves rating history and referential integrity, and an admin can reactivate at any time.
- **Rating distribution chart:** the store detail page renders the 1★–5★ breakdown as plain CSS bars rather than pulling in a charting library, keeping the bundle small; the Owner Dashboard's ratings trend, which genuinely needs a time series, reuses the Recharts dependency already pulled in for the admin dashboard's pie chart rather than adding a second charting library.
- **Owner responses:** stored as a single `owner_response` column directly on the `Rating` row (one response per review, mirroring how `comment` already works) rather than a separate table — there's no scenario in this app where a review has more than one owner reply.

<br>

## Project scripts

<table>
<tr>
<td valign="top" width="50%">

**Backend** (`backend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start with nodemon |
| `npm start` | Start (production) |
| `npm run prisma:migrate` | Create/apply a dev migration |
| `npm run prisma:deploy` | Apply committed migrations (use in setup/CI) |
| `npm run seed` | Run the seed script |
| `npm run prisma:studio` | Open Prisma Studio |

</td>
<td valign="top" width="50%">

**Frontend** (`frontend/package.json`)

| Script | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

</td>
</tr>
</table>

<br>

<div align="center">

---

Built with Express, Prisma, PostgreSQL, React, and Tailwind CSS.

</div>

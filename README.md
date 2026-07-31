# LuxeWatch

Premium MERN watch e-commerce storefront with guest checkout and an admin dashboard.

**Stack:** MongoDB · Express · React (Vite) · Node.js

---

## Features

- Product catalog (filters, search, sort, pagination)
- Guest cart, wishlist, and checkout
- Admin dashboard (products, orders, categories, couriers, users)
- Optional Cloudinary uploads (local disk fallback)
- Order email notifications via SMTP
- JWT admin auth, rate limiting, Helmet, CORS, request sanitization

---

## Prerequisites

- Node.js 18+
- MongoDB locally **or** [MongoDB Atlas](https://www.mongodb.com/atlas)

---

## Quick start

### 1. Install

```bash
npm run install:all
```

### 2. Configure secrets (never commit these)

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set at least:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Local or Atlas connection string |
| `JWT_SECRET` | Long random string (32+ chars in production) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Used only by `npm run seed` |

Optional: `EMAIL_*`, `CLOUDINARY_*`, `CLIENT_URL`.

### 3. Seed sample data

```bash
npm run seed
```

### 4. Run

```bash
npm run dev
```

- Storefront: http://localhost:5173  
- API: http://localhost:5000  
- Admin login: `/admin-login` (credentials from your seed env vars)

---

## Environment variables

### Server (`server/.env`) — private

See [`server/.env.example`](server/.env.example). Real MongoDB passwords, JWT secrets, SMTP App Passwords, and Cloudinary keys belong **only** in this file or your host’s secret store.

### Client (`client/.env`) — public-safe only

See [`client/.env.example`](client/.env.example).

| Variable | Notes |
|----------|--------|
| `VITE_API_URL` | Empty in local dev (Vite proxies `/api`). In production set to your API base, e.g. `https://api.example.com/api` |

Never put private keys, DB URIs, or JWT secrets in client env vars — anything prefixed with `VITE_` is embedded in the browser bundle.

---

## Security policy (repo)

**Never commit or push:**

- `.env` / `.env.*` (except `*.env.example` with placeholders)
- API keys, JWT secrets, MongoDB URIs with passwords
- SMTP / Cloudinary / OAuth / deployment tokens
- Private keys (`.pem`, `.key`, etc.)
- Real admin passwords in source or docs

**This repo:**

- `.gitignore` blocks `.env`, uploads, keys, and build artifacts
- Secrets are read via `process.env` only
- Server refuses to start without `MONGODB_URI` and `JWT_SECRET`
- Production rejects weak / placeholder `JWT_SECRET` values
- Seed passwords come from env — not hardcoded in source

If a secret was ever committed or shared in chat, **rotate it immediately** (Atlas password, Gmail App Password, JWT secret) before going public.

---

## Safe deployment (Vercel / Render / Railway)

1. Push **only** code — no `.env` files.
2. In the host dashboard, add the same keys as `server/.env.example` (Production / Preview as needed).
3. Set `NODE_ENV=production`, a strong `JWT_SECRET`, Atlas `MONGODB_URI`, and `CLIENT_URL` to your live frontend origin.
4. For the Vite app, set `VITE_API_URL` to your live API `/api` URL.
5. Atlas **Network Access**: allow your server’s IP (or the host’s egress IPs).
6. After first deploy, run seed once against production **only if** you intentionally want demo data — prefer creating the admin user securely.

### Suggested production checklist

- [ ] Strong unique `JWT_SECRET` (32+ characters)
- [ ] Atlas DB user password rotated if ever exposed
- [ ] SMTP App Password rotated if ever exposed
- [ ] CORS `CLIENT_URL` limited to your domain
- [ ] GitHub **Secret scanning** / push protection enabled on the repo
- [ ] Confirm `git ls-files '*.env'` returns nothing before every push

---

## Project structure

```
├── client/                 # React + Vite + Redux
│   ├── .env.example
│   └── src/
├── server/                 # Express API
│   ├── .env.example
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── seed/
├── package.json            # Root scripts
└── README.md
```

---

## API overview

| Module     | Base path         |
|------------|-------------------|
| Auth       | `/api/auth`       |
| Products   | `/api/products`   |
| Categories | `/api/categories` |
| Orders     | `/api/orders`     |
| Couriers   | `/api/couriers`   |
| Users      | `/api/users`      |
| Health     | `/api/health`     |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install server + client deps |
| `npm run dev` | Run API + Vite together |
| `npm run seed` | Seed categories, products, admin |
| `npm run seed --prefix server` / `seed:couriers` | Couriers only |

---

## License

Private / all rights reserved unless otherwise stated.

# Onde Tá Passando?

<p align="center">
  <img src="client/public/images/logos/icon_full_name.png" alt="Onde Tá Passando" width="380">
</p>

<p align="center">
  Platform for discovering where to watch movies and TV shows across streaming services in Brazil.
</p>

<p align="center">
  <a href="https://onde-ta-passando.netlify.app/">Live Demo</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#security">Security</a>
</p>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Deploy](#deploy)
- [Author](#author)
- [License](#license)

---

## Overview

**Onde Tá Passando?** is a full-stack streaming discovery platform built with Next.js 15 and Node.js. It connects to the TMDB API for movie and TV show metadata, Watchmode for real-time streaming availability, and Google Gemini for an AI-powered cinema companion named Murphy.

**Live:** [onde-ta-passando.netlify.app](https://onde-ta-passando.netlify.app/)

---

## Features

- **Streaming availability** — Find which platforms are streaming a title, with deep links directly to the content page (not just the service homepage)
- **CineDNA recommendations** — Discover similar titles based on genres, keywords, and stylistic fingerprints of a reference work
- **Murphy AI assistant** — Conversational AI (Google Gemini 3.1 & 2.5 Flash Lite with automated fallback) that answers questions about any movie or TV show in natural Brazilian Portuguese
- **Authentication** — Registration, login, email-based password reset, and profile management with avatar upload
- **Personal collections** — Favorites, watchlist, and watched history with pagination and real-time counters
- **Trailers & details** — Synopses, cast, ratings, and embedded trailers from TMDB

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Radix UI | Accessible primitives |
| Zustand | State management |
| Lenis | Smooth scroll |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express | API server |
| MongoDB + Mongoose | Database |
| JWT + bcrypt | Authentication |
| Cloudinary | Image storage |
| Helmet | HTTP security headers |
| express-rate-limit | Rate limiting |

### External APIs

| API | Usage |
|---|---|
| TMDB | Movie/TV metadata and trailers |
| Watchmode | Streaming availability and deep links |
| Google Gemini | Murphy AI assistant |

---

## Architecture

```
client/                         # Next.js — deployed on Netlify
  app/api/tmdb/[...path]/       # TMDB proxy route (key server-side only)
  app/api/watchmode/[...path]/  # Watchmode proxy route (key server-side only)
  services/                     # API service layer (tmdb, watchmode, auth)
  components/                   # Shared UI components
  app/                          # Pages (App Router)

server/                         # Express — deployed on Render
  src/routes/authRoutes.js      # POST /api/auth/login, /register, /forgotpassword
  src/routes/userRoutes.js      # GET|POST|DELETE /api/users/* (collections, profile)
  src/routes/aiRoutes.js        # POST /api/ai/chat (Murphy Gemini proxy)
  src/controllers/              # Business logic
  src/middleware/auth.js        # JWT verification
  src/models/User.js            # Mongoose schema
```

---

## Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Frontend

```bash
cd client
npm install
# Create .env.local and fill in the variables (see Environment Variables)
npm run dev
```

### Backend

```bash
cd server
npm install
# Create .env and fill in the variables (see Environment Variables)
npm run dev
```

---

## Environment Variables

### Frontend (`client/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Express backend URL (e.g. `http://localhost:3001/api`) |
| `TMDB_API_KEY` | TMDB v4 Read Access Token |
| `WATCHMODE_API_KEY` | Watchmode API key |

> `TMDB_API_KEY` and `WATCHMODE_API_KEY` are intentionally **not** prefixed with `NEXT_PUBLIC_`. They are only accessed by Next.js server-side proxy routes and are never included in the client bundle.

### Backend (`server/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3001`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret (minimum 32 random characters) |
| `JWT_EXPIRE` | Token expiry duration (e.g. `7d`) |
| `NODE_ENV` | `development` or `production` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `GEMINI_API_KEY` | Google Gemini API key (Murphy AI proxy) |
| `SMTP_HOST` | SMTP host for password reset emails |
| `SMTP_PORT` | SMTP port |
| `SMTP_USER` | SMTP user |
| `SMTP_PASS` | SMTP password |

---

## Security

### API Key Protection

No external API keys are exposed to the browser. All third-party calls are proxied server-side:

- **TMDB & Watchmode** — Next.js API Routes (`/api/tmdb`, `/api/watchmode`) attach the key on the server before forwarding the request
- **Google Gemini** — Express endpoint (`/api/ai/chat`) handles all Gemini communication; the key is never sent to the client

### Rate Limiting

| Scope | Limit | Window |
|---|---|---|
| All API routes (`/api/*`) | 200 req / IP | 15 min |
| Auth routes (login, register, forgot password) | 10 req / IP | 15 min |
| Murphy AI (`/api/ai/chat`) | 15 req / IP | 15 min |

### HTTP Security Headers

Helmet.js is applied globally on the Express server, providing `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `X-DNS-Prefetch-Control`, and others out of the box.

### Authentication

- Passwords hashed with bcrypt (salt rounds: 10)
- `password` field uses `select: false` in the Mongoose schema — never returned in queries
- Password requirements enforced server-side: minimum 8 characters, 1 uppercase letter, 1 number
- Password reset tokens are hashed with SHA-256 and expire in 10 minutes
- JWT tokens expire in 7 days

---

## Deploy

### Frontend (Netlify)

| Setting | Value |
|---|---|
| Build command | `next build` |
| Publish directory | `.next` |

Set the [frontend environment variables](#frontend-clientenvlocal) in the Netlify dashboard. Do **not** use the `NEXT_PUBLIC_` prefix for `TMDB_API_KEY` or `WATCHMODE_API_KEY`.

### Backend (Render)

| Setting | Value |
|---|---|
| Build command | `npm install` |
| Start command | `npm start` |

Set the [backend environment variables](#backend-serverenv) in the Render dashboard.

---

## Author

**Ivo Fernandes**
[LinkedIn](https://linkedin.com/in/ivo-dev) · ivo.fernandes.dev@gmail.com

---

## License

MIT

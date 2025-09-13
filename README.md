# Twitter Scheduler Frontend (React + TS)

Minimal assessment frontend wired to the deployed backend.

API base: https://twitter-scheduler-backend.onrender.com/api

## Stack
- React + TypeScript + Vite
- MUI (Material UI)
- Zustand (auth + UI state)
- React Query (TanStack)
- React Router v6
- Axios + interceptors
- Zod
- Recharts
- Socket.IO client

## Setup
```bash
npm install
npm run dev
```

## Env
No env required; API base is hardcoded in `src/api/client.ts`.

## Features
- Auth: email/password login & register; Google link to backend
- Dashboard: totals and simple chart
- Tweets: create (280 chars), upload via backend, list & delete
- Scheduler: recommendations fetch
- Analytics: performance chart
- Settings: set timezone
- Realtime: updates via Socket.IO for tweet events

## Notes
- JWT is stored in localStorage for demo simplicity.
- Protected routes redirect to login if token missing.
- Swagger link is in top nav.


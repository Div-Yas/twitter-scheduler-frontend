# Twitter Scheduler Frontend (React + TS)

A modern dashboard for scheduling and analyzing Twitter posts, featuring AI-powered content suggestions, calendar UI, and real-time engagement tracking.

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
- **Authentication:** Email/password login & register, Google OAuth via backend
- **Dashboard:** Totals and performance charts
- **Tweets:** Create (280 chars), upload media, list & delete
- **Scheduler:** Fetch posting recommendations
- **Analytics:** Performance chart and scoring
- **Settings:** Set timezone
- **Realtime:** Updates via Socket.IO for tweet events
- **Content Calendar:** Visual calendar UI for scheduled and posted tweets, with drag-and-drop scheduling
- **AI Suggestions:** Generate tweet ideas and hashtag recommendations based on trending topics and content analysis

## Notes
- JWT is stored in localStorage for demo simplicity.
- Protected routes redirect to login if token missing.
- Swagger link is in top nav.


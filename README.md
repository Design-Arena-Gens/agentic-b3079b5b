# Tech Intelligence Digest

Aggregates and summarizes AI, CS, UI/UX, and related tech developments. Supports RSS/HTML fetching, NLP topic grouping, and delivery via Email/Telegram. Schedules with Vercel Cron.

## Quick Start

- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Run collection: POST `/api/cron`

## Environment

Copy `.env.example` to `.env.local` and set SMTP/Telegram variables if you want delivery.

## Deployment

- Vercel deployment includes a cron that hits `/api/cron` hourly. Adjust `vercel.json` if needed.

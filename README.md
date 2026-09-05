# TriagePeace

Offline-first symptom intake PWA for low-connectivity clinics. Field workers fill a symptom form with **zero network**; it queues locally and auto-syncs to a clinic dashboard the moment connectivity returns, auto-triaged by severity (red/yellow/green).

## Stack

React + Vite, Tailwind CSS, Supabase (auth, Postgres, Realtime), vite-plugin-pwa.

## Setup

1. `npm install`
2. Create a Supabase project, then run [supabase/schema.sql](supabase/schema.sql) in the SQL editor.
3. Create at least one health-worker user (Supabase dashboard → Authentication → Add user) — that's who signs in at `/login`.
4. Copy `.env.example` to `.env` and fill in your project's URL and anon key.
5. `npm run dev`

## Routes

- `/intake` — symptom intake form, works fully offline (installable PWA).
- `/login` — health-worker sign-in.
- `/dashboard` — realtime, severity-sorted triage queue (requires sign-in).

## Testing the offline flow

Run `npm run build && npm run preview`, install the PWA, then toggle airplane mode / DevTools "Offline" and submit a few intake forms — they'll show "saved on this device" and sync automatically once connectivity returns.

# TriagePeace

Offline-first symptom intake PWA for low-connectivity clinics. Field workers fill a symptom form with **zero network**; it queues locally and auto-syncs to a clinic dashboard the moment connectivity returns, auto-triaged by severity (red/yellow/green).

## Stack

React + Vite, Tailwind CSS, Supabase (auth, Postgres, Realtime, Edge Functions), vite-plugin-pwa, Web Push.

## Setup

1. `npm install`
2. Create a Supabase project, then run [supabase/schema.sql](supabase/schema.sql) in the SQL editor.
3. Create at least one health-worker user (Supabase dashboard → Authentication → Add user) — that's who signs in at `/login`.
4. Generate a VAPID keypair for push notifications: `npx web-push generate-vapid-keys`.
5. Copy `.env.example` to `.env` and fill in your project's URL, anon key, and the VAPID public key.
6. Deploy the alert function and set its secrets (see [Push notifications](#push-notifications) below).
7. `npm run dev`

## Routes

- `/intake` — symptom intake form, works fully offline (installable PWA).
- `/login` — health-worker sign-in.
- `/dashboard` — realtime, severity-sorted triage queue (requires sign-in). Health workers can enable emergency push alerts here.

## Push notifications

Health workers who click "Enable emergency alerts" on the dashboard get a push notification the instant a new **red**-severity case syncs in — even if the dashboard tab isn't open.

1. `npx supabase login` (if not already linked: `npx supabase link --project-ref <your-project-ref>`)
2. `npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com`
3. `npx supabase functions deploy send-red-alert --no-verify-jwt`
4. Run [supabase/push_notifications.sql](supabase/push_notifications.sql) in the SQL editor (or `npx supabase db query --linked --file supabase/push_notifications.sql`) — update the Edge Function URL/key in that file first if your project ref differs.

## Testing the offline flow

Run `npm run build && npm run preview`, install the PWA, then toggle airplane mode / DevTools "Offline" and submit a few intake forms — they'll show "saved on this device" and sync automatically once connectivity returns.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

TriagePeace — an offline-first symptom intake PWA for low-connectivity clinics. A field worker or patient fills out a symptom form with zero network; it queues locally and auto-syncs to a clinic dashboard the moment connectivity returns, auto-triaged by severity (red/yellow/green). Health workers can subscribe to push notifications filtered by severity. Stack: React + Vite, Tailwind CSS v4, Supabase (Postgres, Auth, Realtime, Edge Functions), vite-plugin-pwa, Web Push.

## Commands

- `npm run dev` — start the Vite dev server.
- `npm run build` — production build (also generates the service worker via vite-plugin-pwa's injectManifest strategy).
- `npm run preview` — serve the production build locally (needed to test real offline/PWA behavior — the dev server's service worker is not representative).
- `npm run lint` — oxlint.
- No test suite exists in this project.

Supabase (requires `npx supabase login` then `npx supabase link --project-ref <ref>` once per machine):
- `npx supabase db query --linked --file supabase/schema.sql` — apply the core schema (or paste into the Supabase SQL editor). `supabase/push_notifications.sql` is a separate, idempotent file (safe to re-run) for the push-notification table/trigger — apply it after deploying the Edge Function it references.
- `npx supabase functions deploy send-triage-alert --no-verify-jwt` — the `--no-verify-jwt` flag is required because the Postgres trigger calls this function using the publishable anon key as its bearer token, which is not a real user JWT.
- `npx supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:...` — required before the alert function will send anything.

Deploy: pushing to `main` on GitHub auto-deploys to Vercel (already linked). Env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_VAPID_PUBLIC_KEY`) are set in the Vercel project for all environments — update there, not just locally, when rotating keys. `vercel.json` rewrites all paths to `index.html` since this is a client-routed SPA; without it, direct navigation to `/intake` or `/dashboard` 404s on Vercel.

## Architecture

**Offline submission flow is the core mechanic, not a bonus feature.** `src/lib/queue.js` implements submit-with-offline-fallback: every intake submission is written to an IndexedDB queue *first*, then an immediate Supabase insert is attempted; on success it's dequeued, on failure (offline or error) it stays queued. `src/hooks/useOnlineSync.js` flushes the queue on the browser's `online` event and once on app load. This manual-queue approach was deliberately chosen over Workbox's Background Sync API because wiring background sync through the `supabase-js` client isn't practical — don't "simplify" this back toward Background Sync without re-reading why.

**The PWA uses `injectManifest`, not `generateSW`.** `vite.config.js` points `VitePWA` at a hand-written `src/sw.js` (not an auto-generated one) specifically so it can add `push`/`notificationclick` event listeners alongside the Workbox precaching. If you need to change caching behavior, edit `src/sw.js` directly — there is no separate Workbox config object to tune.

**Severity is computed client-side and is a display+notification concern, not a backend one.** `src/lib/triage.js` defines `SYMPTOM_OPTIONS` (each tagged `red`/`yellow`/`green`) and `computeSeverity()` (worst-tag-wins). `SEVERITY_META` maps each severity to its label/order/Tailwind classes — this is the single source of truth for severity display; don't hardcode severity colors elsewhere. The `red`/`yellow`/`green` strings themselves are a Postgres check constraint on `triage_submissions.severity` (see `supabase/schema.sql`) — changing the *display* color for a tier (e.g. which Tailwind class `yellow` maps to) is safe and independent from the tier's underlying key, which several places key off of by string (RLS is not involved here, but the push-notification filtering and symptom-to-severity mapping both are).

**Push notification fan-out is preference-filtered per subscriber, not per case.** The Postgres trigger (`supabase/push_notifications.sql`, function `notify_triage_submission`) fires on *every* insert regardless of severity and calls the `send-triage-alert` Edge Function (`supabase/functions/send-triage-alert/index.ts`) over HTTP via `pg_net`. The function itself decides who to notify by querying `push_subscriptions` for rows whose `notify_severities` array contains that submission's severity — so filtering logic lives in the Edge Function, not the trigger. `src/lib/push.js` manages the client side (VAPID subscribe, storing `{endpoint, p256dh, auth, notify_severities}` per device — note preferences are per-*device*/subscription, not per-user, since one health worker could have multiple devices).

**Auth is two-tiered by design.** Field workers submitting intake forms are anonymous (RLS grants `anon` insert-only on `triage_submissions`, tracked by a locally-generated `device_id` from `src/lib/deviceId.js`, not a real account). Health workers viewing `/dashboard` are real Supabase Auth users (`src/hooks/useAuth.js`); RLS grants `authenticated` full read/update on submissions. There's no signup flow — health-worker accounts are created manually via the Supabase dashboard (see README).

**Dashboard is a master/detail layout, not a plain list.** `src/pages/DashboardPage.jsx` is the orchestrator (fetch + Realtime subscription + selection/search state); `src/components/dashboard/{CaseListPane,CaseListItem,CaseDetailPane}.jsx` are presentational. Both panes always mount — visibility toggles via Tailwind classes (`hidden`/`flex` + `md:flex`) rather than conditional rendering, so mobile (which shows one pane at a time, WhatsApp-style) doesn't lose list scroll position or remount the detail pane across the breakpoint. Selection is stored as just an id and re-derived from the live `rows` array each render, with an effect that clears `selectedId` if the selected row disappears from `rows` (resolved/deleted) — but must *not* react to the search-filtered subset, or typing a query would deselect an open case.

**Styling has zero external theming layer** — Tailwind v4's CSS-first config (`@import "tailwindcss"` in `src/index.css`) with a small `@theme` block for font/animation tokens only. No `tailwind.config.js` exists. Brand color is `teal`, neutrals are `slate` (not `neutral`), severity colors are `red`/`amber`/`green`. Keep new UI consistent with this rather than introducing another color family.

## Non-obvious repo state

- `TriAgePeace/` at the repo root is a teammate's **entirely separate, disconnected** parallel implementation of this same app (their own components, own `package.json`) — it merged into `main` without conflict because it's a different directory, but nothing in the live app references it. Don't "fix" or wire it up without checking with the team first; it's unresolved duplicate work, not dead code to casually delete either.
- `supabase/.temp/` is local Supabase CLI link state (gitignored) — don't hand-edit it.

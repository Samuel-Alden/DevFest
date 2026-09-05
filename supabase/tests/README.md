# Security regression tests

Executable checks for the access-control / data-integrity boundaries. They run
against the **linked live project** over its REST + Auth + Functions endpoints,
using the publishable key from the repo-root `.env` (same surface a real client
or attacker hits). There is no mocking — a pass means the live database
actually enforced the rule.

## Prerequisites

- `.env` at the repo root with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- The hardening SQL applied: `npx supabase db query --linked --file supabase/security_hardening.sql`.
- A **throwaway** Supabase Auth user (Dashboard → Authentication → Add user,
  "Auto Confirm"). Delete it when done.

```sh
export SECTEST_HW_EMAIL=throwaway@example.com
export SECTEST_HW_PASSWORD=...
node supabase/tests/run-all.mjs        # or: npm run test:security
```

## Modules

| file | boundary |
| --- | --- |
| `security-rls.mjs` | anon INSERT allowed; anon SELECT / UPDATE / DELETE denied; malformed / privileged-column inserts rejected at the DB |
| `security-authenticated.mjs` | health-worker workflow still works (read, in_progress, resolve, reopen, delete-resolved); patient data / severity / timestamps / device_id **cannot** be rewritten; a non-resolved case cannot be deleted |
| `security-triage-integrity.mjs` | a client-supplied `severity` below the symptom-implied floor is clamped up; a value above it (assessment escalation) is kept |
| `security-queue-idempotency.mjs` | replaying a queued submission with the same `client_submission_id` cannot create a duplicate record |
| `security-edge-function.mjs` | `send-triage-alert` rejects non-POST / non-JSON / missing id / unauthenticated calls. **Fails until the hardened function is deployed with `TRIAGE_WEBHOOK_SECRET` set** — those failures are the Phase 6 findings. |

## Cleanup

Every module tags its rows with `device_id = 'sectest-device-0000'` and cleans
up after itself. If a run is interrupted:

```sql
delete from triage_submissions where device_id = 'sectest-device-0000';
```

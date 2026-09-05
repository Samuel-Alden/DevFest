// Runs every security test module in sequence and sums the results.
//
//   node supabase/tests/run-all.mjs
//
// Env:
//   SECTEST_HW_EMAIL / SECTEST_HW_PASSWORD  throwaway health-worker account
//                                           (authenticated + triage-integrity)
//   SECTEST_WEBHOOK_SECRET                   optional, edge-function authed path
//
// security-edge-function.mjs is expected to FAIL until the hardened
// send-triage-alert is deployed and TRIAGE_WEBHOOK_SECRET is set — its
// failures are the Phase 6 findings.

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const modules = [
  'security-rls.mjs',
  'security-authenticated.mjs',
  'security-triage-integrity.mjs',
  'security-queue-idempotency.mjs',
  'security-edge-function.mjs',
]

let failed = 0
for (const m of modules) {
  console.log(`\n──────── ${m} ────────`)
  const res = spawnSync(process.execPath, [join(here, m)], { stdio: 'inherit' })
  if (res.status !== 0) {
    failed++
    console.log(`  (${m} exited ${res.status})`)
  }
}

console.log(`\n════════ ${modules.length - failed}/${modules.length} modules green ════════\n`)
process.exit(failed === 0 ? 0 : 1)

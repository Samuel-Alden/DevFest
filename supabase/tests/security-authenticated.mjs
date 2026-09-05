// Security / RLS regression tests for TriagePeace — authenticated boundary.
//
// Verifies a logged-in health worker can still run the whole dashboard
// workflow (read queue, in_progress, resolve, reopen, delete-resolved) and
// that the Phase 2 least-privilege changes block everything else (rewriting
// patient data / severity / timestamps, deleting a non-resolved case).
//
// Needs a THROWAWAY Supabase Auth user — delete it afterwards.
//   set SECTEST_HW_EMAIL / SECTEST_HW_PASSWORD in the environment, then:
//   node supabase/tests/security-authenticated.mjs
//
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from the repo-root .env.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const env = Object.fromEntries(
  readFileSync(join(root, '.env'), 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=')
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
    }),
)

const URL = env.VITE_SUPABASE_URL
const KEY = env.VITE_SUPABASE_ANON_KEY
const EMAIL = process.env.SECTEST_HW_EMAIL
const PASSWORD = process.env.SECTEST_HW_PASSWORD
if (!URL || !KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
  process.exit(2)
}
if (!EMAIL || !PASSWORD) {
  console.error('Set SECTEST_HW_EMAIL and SECTEST_HW_PASSWORD (a throwaway Supabase Auth user)')
  process.exit(2)
}

const REST = `${URL}/rest/v1`
const RUN_ID = `${Date.now()}`
const DEVICE_ID = 'sectest-device-0000'
let token = null
let pass = 0
let fail = 0

function check(name, cond, detail = '') {
  if (cond) {
    pass++
    console.log(`  PASS  ${name}`)
  } else {
    fail++
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

async function rest(method, path, { body, prefer, anon } = {}) {
  const bearer = anon ? KEY : token
  const res = await fetch(`${REST}${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${bearer}`,
      'Content-Type': 'application/json',
      ...(prefer ? { Prefer: prefer } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = text
  }
  return { status: res.status, json }
}

async function main() {
  // ---- sign in ----------------------------------------------------------
  {
    const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    const text = await res.text()
    try {
      token = JSON.parse(text).access_token
    } catch {
      /* leave token null */
    }
    check(
      'health worker sign-in -> token',
      res.status === 200 && Boolean(token),
      `status ${res.status} ${text.slice(0, 160)}`,
    )
    if (!token) return
  }

  console.log('\nAuthenticated workflow — still works\n')

// seed a case to operate on
await rest('POST', '/triage_submissions', {
  body: { device_id: DEVICE_ID, patient_name: 'HW Test', age: 20, symptoms: ['highFever'], severity: 'yellow', notes: `SECTEST ${RUN_ID}` },
  prefer: 'return=minimal',
})
const findMine = async () => {
  const { json } = await rest('GET', `/triage_submissions?select=id,status,severity,patient_name&notes=eq.SECTEST%20${RUN_ID}&limit=1`)
  return Array.isArray(json) ? json[0] : null
}
let row = await findMine()
check('authenticated SELECT -> sees the queue', Boolean(row), 'seed row not visible')
if (!row) return
const ID = row.id

{
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { status: 'in_progress', resolved_at: null }, prefer: 'return=minimal' })
  row = await findMine()
  check('set status=in_progress', status < 300 && row.status === 'in_progress', `status ${status}, row ${row?.status}`)
}
{
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { status: 'resolved', resolved_at: new Date().toISOString() }, prefer: 'return=minimal' })
  row = await findMine()
  check('resolve a case', status < 300 && row.status === 'resolved', `status ${status}, row ${row?.status}`)
}
{
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { status: 'pending', resolved_at: null }, prefer: 'return=minimal' })
  row = await findMine()
  check('reopen a case', status < 300 && row.status === 'pending', `status ${status}, row ${row?.status}`)
}
{
  const { status: es } = await rest('GET', `/case_events?select=id&submission_id=eq.${ID}&limit=1`)
  check('authenticated SELECT case_events -> allowed', es === 200)
}

console.log('\nAuthenticated least privilege — blocked\n')

{
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { patient_name: 'HIJACKED' }, prefer: 'return=minimal' })
  row = await findMine()
  check('PATCH patient_name -> rejected', status >= 400 && row.patient_name === 'HW Test', `status ${status}, name ${row?.patient_name}`)
}
{
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { severity: 'red' }, prefer: 'return=minimal' })
  row = await findMine()
  check('PATCH severity -> rejected', status >= 400 && row.severity === 'yellow', `status ${status}, sev ${row?.severity}`)
}
{
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { device_id: 'moved' }, prefer: 'return=minimal' })
  check('PATCH device_id -> rejected', status >= 400, `status ${status}`)
}
{
  // mixed patch: an allowed column + a forbidden one must fail atomically
  const { status } = await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { status: 'resolved', patient_name: 'x' }, prefer: 'return=minimal' })
  row = await findMine()
  check('PATCH {status, patient_name} -> rejected, status unchanged', status >= 400 && row.status === 'pending', `status ${status}, row ${row?.status}`)
}
{
  // DELETE a non-resolved case -> denied by policy (row must be resolved)
  const { status, json } = await rest('DELETE', `/triage_submissions?id=eq.${ID}`, { prefer: 'return=representation' })
  row = await findMine()
  check('DELETE pending case -> denied', (status >= 400 || (Array.isArray(json) && json.length === 0)) && Boolean(row), `status ${status}, still there ${Boolean(row)}`)
}
{
  // resolve then DELETE -> allowed (the retained, intended path)
  await rest('PATCH', `/triage_submissions?id=eq.${ID}`, { body: { status: 'resolved', resolved_at: new Date().toISOString() }, prefer: 'return=minimal' })
  const { status } = await rest('DELETE', `/triage_submissions?id=eq.${ID}`, { prefer: 'return=minimal' })
  row = await findMine()
  check('DELETE resolved case -> allowed', status < 300 && !row, `status ${status}, gone ${!row}`)
}

  // best-effort cleanup of any strays from this run
  await rest('PATCH', `/triage_submissions?notes=eq.SECTEST%20${RUN_ID}`, { body: { status: 'resolved', resolved_at: new Date().toISOString() }, prefer: 'return=minimal' })
  await rest('DELETE', `/triage_submissions?notes=eq.SECTEST%20${RUN_ID}`, { prefer: 'return=minimal' })
}

await main()

console.log(`\n${pass} passed, ${fail} failed`)
console.log(`(if any strays remain: delete from triage_submissions where device_id = '${DEVICE_ID}')\n`)
process.exitCode = fail === 0 ? 0 : 1

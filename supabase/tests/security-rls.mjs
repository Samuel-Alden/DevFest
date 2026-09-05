// Security / RLS regression tests for TriagePeace — anonymous boundary.
//
// Exercises the *anonymous* (publishable-key) surface against the live
// PostgREST endpoint: the same thing a tampered field-device client would
// hit. Mirrors how the real client writes — supabase-js `.insert(payload)`
// with no `.select()` sends `Prefer: return=minimal`, so anon never needs
// read-back.
//
// Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from the repo-root .env.
// Run:  node supabase/tests/security-rls.mjs
//
// Rows created here are tagged `notes = 'SECTEST <runId>'` and use
// device_id = SECTEST_DEVICE_ID. They cannot be removed by this script
// (anon has no DELETE) — that is the point. Clean up with a privileged
// connection, e.g.:
//   npx supabase db query --linked \
//     "delete from triage_submissions where device_id = 'sectest-device-0000'"

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
if (!URL || !KEY) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
  process.exit(2)
}

const REST = `${URL}/rest/v1`
const RUN_ID = `${Date.now()}`
const SECTEST_DEVICE_ID = 'sectest-device-0000'
// A real target row id can be supplied so the UPDATE/DELETE-denial checks
// aim at an actual case; without it they still prove "anon effects nothing".
const TARGET_ID = process.env.SECTEST_TARGET_ID || '00000000-0000-4000-8000-0000000000ff'

let pass = 0
let fail = 0

async function rest(method, path, { body, prefer } = {}) {
  const res = await fetch(`${REST}${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
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

function check(name, cond, detail = '') {
  if (cond) {
    pass++
    console.log(`  PASS  ${name}`)
  } else {
    fail++
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`)
  }
}

const payload = (over = {}) => ({
  device_id: SECTEST_DEVICE_ID,
  patient_name: 'RLS Test',
  age: 30,
  symptoms: ['chestPain'],
  severity: 'red',
  notes: `SECTEST ${RUN_ID}`,
  ...over,
})

// insert as the real client does: return=minimal, no read-back
const insert = (over) => rest('POST', '/triage_submissions', { body: payload(over), prefer: 'return=minimal' })

console.log('\nAnonymous access boundary\n')

check('anon INSERT valid payload -> allowed (201)', (await insert()).status === 201)

// The full clinical payload IntakePage builds, every section populated with
// in-range values — proves the new constraints don't reject a real form.
{
  const full = {
    device_id: SECTEST_DEVICE_ID,
    patient_name: 'Full Form',
    age: 54,
    address: 'Clinic Rd 12',
    complaint_history: 'Two days of chest tightness, worse on exertion.',
    symptoms: ['chestPain', 'breathingDifficulty'],
    notes: `SECTEST ${RUN_ID} full`,
    severity: 'red',
    latitude: -6.2,
    longitude: 106.8,
    systolic_bp: 150,
    diastolic_bp: 95,
    pulse_rate: 110,
    respiratory_rate: 22,
    body_temperature: 37.8,
    oxygen_saturation: 94,
    consciousness_scale: 'gcs',
    gcs_score: 14,
    avpu_level: null,
    airway_status: 'normal',
    breathing_status: 'compromised',
    circulation_status: 'normal',
    bleeding_trauma: false,
    bleeding_trauma_notes: null,
    drug_allergies: 'Penicillin',
    comorbidities: 'Hypertension',
    current_medications: 'Amlodipine',
  }
  const { status } = await rest('POST', '/triage_submissions', { body: full, prefer: 'return=minimal' })
  check('anon INSERT full clinical payload -> allowed (201)', status === 201, `status ${status}`)
}

{
  const { status } = await insert({ notes: 'x'.repeat(6000) })
  check('anon INSERT 6000-char free text -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ symptoms: ['chestPain', 'wingedFlight'] })
  check('anon INSERT unknown symptom key -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ symptoms: { chestPain: true } })
  check('anon INSERT non-array symptoms -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ status: 'resolved' })
  check('anon INSERT status=resolved -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ resolved_at: new Date().toISOString() })
  check('anon INSERT resolved_at -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ created_at: '2000-01-01T00:00:00Z' })
  check('anon INSERT back-dated created_at -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ severity: 'chartreuse' })
  check('anon INSERT invalid severity -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ age: 999 })
  check('anon INSERT age=999 -> rejected', status >= 400 && status < 500, `status ${status}`)
}
{
  const { status } = await insert({ device_id: 'x' })
  check('anon INSERT 1-char device_id -> rejected', status >= 400 && status < 500, `status ${status}`)
}

// SELECT / UPDATE / DELETE — anon has no policy, so RLS yields nothing.
{
  const { status, json } = await rest('GET', '/triage_submissions?select=id&limit=1')
  check('anon SELECT -> denied (no rows)', status === 200 && Array.isArray(json) && json.length === 0, `status ${status}`)
}
{
  const { status, json } = await rest('PATCH', `/triage_submissions?id=eq.${TARGET_ID}`, {
    body: { status: 'resolved', notes: 'hijacked' },
    prefer: 'return=representation',
  })
  check(
    'anon UPDATE -> denied (nothing changed)',
    status >= 400 || (Array.isArray(json) && json.length === 0),
    `status ${status}`,
  )
}
{
  const { status, json } = await rest('DELETE', `/triage_submissions?id=eq.${TARGET_ID}`, { prefer: 'return=representation' })
  check(
    'anon DELETE -> denied (nothing deleted)',
    status >= 400 || (Array.isArray(json) && json.length === 0),
    `status ${status}`,
  )
}
{
  const { status, json } = await rest('GET', '/case_events?select=id&limit=1')
  check('anon SELECT case_events -> denied', status >= 400 || (Array.isArray(json) && json.length === 0), `status ${status}`)
}
{
  const { status, json } = await rest('GET', '/push_subscriptions?select=id&limit=1')
  check('anon SELECT push_subscriptions -> denied', status >= 400 || (Array.isArray(json) && json.length === 0), `status ${status}`)
}

console.log(`\n${pass} passed, ${fail} failed`)
console.log(`(cleanup: delete from triage_submissions where device_id = '${SECTEST_DEVICE_ID}')\n`)
process.exit(fail === 0 ? 0 : 1)

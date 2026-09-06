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
if (!URL || !KEY || !EMAIL || !PASSWORD) {
  console.error('Need .env (VITE_SUPABASE_URL/ANON_KEY) + SECTEST_HW_EMAIL/SECTEST_HW_PASSWORD')
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

async function anonInsert(body) {
  const res = await fetch(`${REST}/triage_submissions`, {
    method: 'POST',
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  })
  return res.status
}

async function readBack(tag) {
  const res = await fetch(`${REST}/triage_submissions?select=severity,symptoms&notes=eq.SECTEST%20${RUN_ID}%20${tag}&limit=1`, {
    headers: { apikey: KEY, Authorization: `Bearer ${token}` },
  })
  const j = await res.json()
  return Array.isArray(j) ? j[0] : null
}

async function main() {
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
    }
    check('health worker sign-in', res.status === 200 && Boolean(token), `status ${res.status} ${text.slice(0, 160)}`)
    if (!token) return
  }

  console.log('\nTriage severity integrity\n')

const cases = [
  { tag: 'a', symptoms: ['chestPain'], claimed: 'green', expect: 'red', why: 'red symptom filed as green -> clamped to red' },
  { tag: 'b', symptoms: ['chestPain'], claimed: 'yellow', expect: 'red', why: 'red symptom filed as yellow -> clamped to red' },
  { tag: 'c', symptoms: ['rash'], claimed: 'green', expect: 'yellow', why: 'yellow symptom filed as green -> clamped to yellow' },
  { tag: 'd', symptoms: ['rash'], claimed: 'red', expect: 'red', why: 'client escalated above floor (e.g. vitals) -> kept at red' },
  { tag: 'e', symptoms: ['chestPain'], claimed: 'red', expect: 'red', why: 'correct client -> unchanged' },
  { tag: 'f', symptoms: [], claimed: 'green', expect: 'green', why: 'no symptoms -> green stays green' },
  { tag: 'g', symptoms: ['rash', 'chestPain'], claimed: 'green', expect: 'red', why: 'worst tag wins -> red' },
]

for (const c of cases) {
  const st = await anonInsert({
    device_id: DEVICE_ID,
    symptoms: c.symptoms,
    severity: c.claimed,
    notes: `SECTEST ${RUN_ID} ${c.tag}`,
  })
  if (st !== 201) {
    check(c.why, false, `insert status ${st}`)
    continue
  }
  const row = await readBack(c.tag)
  check(c.why, row?.severity === c.expect, `stored ${row?.severity}, expected ${c.expect}`)
}

await fetch(`${REST}/triage_submissions?notes=like.SECTEST%20${RUN_ID}%25`, {
  method: 'PATCH',
  headers: { apikey: KEY, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
  body: JSON.stringify({ status: 'resolved', resolved_at: new Date().toISOString() }),
})
await fetch(`${REST}/triage_submissions?notes=like.SECTEST%20${RUN_ID}%25`, {
  method: 'DELETE',
  headers: { apikey: KEY, Authorization: `Bearer ${token}`, Prefer: 'return=minimal' },
})
}

await main()

console.log(`\n${pass} passed, ${fail} failed`)
console.log(`(if any strays remain: delete from triage_submissions where device_id = '${DEVICE_ID}')\n`)
process.exitCode = fail === 0 ? 0 : 1

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
const DEVICE_ID = 'sectest-device-0000'
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
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = text
  }
  return { status: res.status, code: json?.code }
}

console.log('\nOffline queue idempotency\n')

const key = crypto.randomUUID()
const payload = {
  device_id: DEVICE_ID,
  symptoms: ['highFever'],
  severity: 'yellow',
  notes: `SECTEST ${RUN_ID}`,
  client_submission_id: key,
}

const first = await anonInsert(payload)
check('first sync of a queued submission -> stored (201)', first.status === 201, `status ${first.status}`)

const retry = await anonInsert(payload)
check(
  'retry with same client_submission_id -> unique violation (23505), not a duplicate',
  retry.status >= 400 && retry.code === '23505',
  `status ${retry.status}, code ${retry.code}`,
)

const retryDiffData = await anonInsert({ ...payload, notes: `SECTEST ${RUN_ID} tampered`, severity: 'red' })
check(
  'retry with same key but changed fields -> still rejected as duplicate',
  retryDiffData.status >= 400 && retryDiffData.code === '23505',
  `status ${retryDiffData.status}, code ${retryDiffData.code}`,
)

console.log(`\n${pass} passed, ${fail} failed`)
console.log(`(cleanup: delete from triage_submissions where device_id = '${DEVICE_ID}')\n`)
process.exit(fail === 0 ? 0 : 1)

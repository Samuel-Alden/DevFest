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
const SECRET = process.env.SECTEST_WEBHOOK_SECRET || ''
const FN = `${URL}/functions/v1/send-triage-alert`
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

async function call({ method = 'POST', headers = {}, body } = {}) {
  const res = await fetch(FN, {
    method,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...headers },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  })
  return { status: res.status, text: await res.text() }
}

const forged = {
  type: 'INSERT',
  table: 'triage_submissions',
  record: { id: '00000000-0000-4000-8000-0000000000aa', severity: 'red', patient_name: 'Forged', age: 99 },
}
const secretHeader = { 'x-triage-webhook-secret': SECRET }

console.log('\nEdge Function — send-triage-alert\n')

{
  const r = await call({ method: 'GET' })
  check('GET -> 405 (method rejected before anything else)', r.status === 405, `status ${r.status}`)
}
{
  const r = await call({ body: forged })
  check('POST, no webhook secret -> 401', r.status === 401, `status ${r.status} (200/500 = old build still deployed)`)
}
{
  const r = await call({ headers: { 'x-triage-webhook-secret': 'definitely-wrong' }, body: forged })
  check('POST, wrong webhook secret -> 401', r.status === 401, `status ${r.status}`)
}
{
  const r = await call({ body: 'not json' })
  check('POST, no secret, junk body -> 401 (auth before parse)', r.status === 401, `status ${r.status}`)
}

if (SECRET) {
  {
    const r = await call({ headers: secretHeader, body: 'not json' })
    check('authorised + non-JSON body -> 400', r.status === 400, `status ${r.status}`)
  }
  {
    const r = await call({ headers: secretHeader, body: { record: { severity: 'red' } } })
    check('authorised + missing record id -> 400', r.status === 400, `status ${r.status}`)
  }
  {
    const r = await call({ headers: secretHeader, body: { record: { id: 'not-a-uuid' } } })
    check('authorised + non-UUID record id -> 400', r.status === 400, `status ${r.status}`)
  }
  {
    const r = await call({ headers: secretHeader, body: forged })
    check(
      'authorised + non-existent record id -> 200 skipped (forged id notifies nobody)',
      r.status === 200 && /skip/i.test(r.text),
      `status ${r.status}, body ${r.text.slice(0, 120)}`,
    )
  }
} else {
  console.log('  SKIP  authorised-path checks (set SECTEST_WEBHOOK_SECRET to run)')
}

console.log(`\n${pass} passed, ${fail} failed\n`)
process.exit(fail === 0 ? 0 : 1)

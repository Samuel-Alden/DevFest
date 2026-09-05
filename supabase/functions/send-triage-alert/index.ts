import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com'
// Shared secret with the Postgres INSERT trigger (see supabase/push_notifications.sql).
// If unset, request authentication is skipped so a partial rollout doesn't
// drop notifications — set it (supabase secrets set TRIAGE_WEBHOOK_SECRET=...)
// plus the matching Vault secret to activate.
const webhookSecret = Deno.env.get('TRIAGE_WEBHOOK_SECRET') ?? ''

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

const SEVERITY_LABEL: Record<string, string> = {
  red: 'Emergency',
  yellow: 'Urgent',
  green: 'Routine',
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // The only legitimate caller is the database INSERT trigger, which has no
  // user session (the function is deployed --no-verify-jwt). Authenticate it
  // with the shared secret instead of a JWT.
  if (webhookSecret) {
    if (req.headers.get('x-triage-webhook-secret') !== webhookSecret) {
      return json({ error: 'unauthorized' }, 401)
    }
  } else {
    console.warn('[send-triage-alert] TRIAGE_WEBHOOK_SECRET not set — request authentication is DISABLED')
  }

  let body: { record?: { id?: unknown } }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'invalid JSON body' }, 400)
  }

  const id = body?.record?.id
  if (typeof id !== 'string' || !UUID_RE.test(id)) {
    return json({ error: 'missing or invalid record id' }, 400)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  // Don't trust the posted record. Re-read the row so `severity` is the
  // authoritative stored value (after the DB's own severity-floor trigger),
  // and a forged call with a made-up id simply matches nothing.
  const { data: record, error: recErr } = await supabase
    .from('triage_submissions')
    .select('id, severity')
    .eq('id', id)
    .maybeSingle()

  if (recErr) return json({ error: recErr.message }, 500)
  if (!record?.severity) return json({ skipped: 'no such submission' }, 200)

  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .contains('notify_severities', [record.severity])

  if (error) return json({ error: error.message }, 500)

  const label = SEVERITY_LABEL[record.severity] ?? record.severity
  // No patient identifiers in the payload — it surfaces on every subscribed
  // worker's lock screen and only says a case of this severity arrived. The
  // details stay behind dashboard auth.
  const notification = JSON.stringify({
    title: `${label} case in TriagePeace`,
    body: `A new ${label.toLowerCase()} case needs triage.`,
    url: '/dashboard',
    tag: `submission-${record.id}`,
  })

  const results = await Promise.allSettled(
    (subscriptions ?? []).map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        notification,
      ),
    ),
  )

  const expiredEndpoints = (subscriptions ?? [])
    .filter((_sub, i) => {
      const result = results[i]
      return result.status === 'rejected' && [404, 410].includes((result.reason as { statusCode?: number })?.statusCode)
    })
    .map((sub) => sub.endpoint)

  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  return json({ sent: results.filter((r) => r.status === 'fulfilled').length, total: results.length }, 200)
})

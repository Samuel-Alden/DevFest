import { createClient } from 'npm:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com'

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

Deno.serve(async (req) => {
  const payload = await req.json()
  const record = payload.record

  if (!record || record.severity !== 'red') {
    return new Response(JSON.stringify({ skipped: true }), { status: 200 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*')

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const title = 'Emergency case in TriagePeace'
  const body = `${record.patient_name || 'Unnamed patient'}${record.age ? ` (${record.age})` : ''} needs immediate attention.`

  const results = await Promise.allSettled(
    (subscriptions ?? []).map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        JSON.stringify({ title, body, url: '/dashboard', tag: `submission-${record.id}` }),
      ),
    ),
  )

  const expiredEndpoints = (subscriptions ?? [])
    .filter((sub, i) => {
      const result = results[i]
      return result.status === 'rejected' && [404, 410].includes(result.reason?.statusCode)
    })
    .map((sub) => sub.endpoint)

  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints)
  }

  return new Response(
    JSON.stringify({ sent: results.filter((r) => r.status === 'fulfilled').length, total: results.length }),
    { status: 200 },
  )
})

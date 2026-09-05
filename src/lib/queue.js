import { openDB } from 'idb'
import { supabase } from './supabase'

const DB_NAME = 'triagepeace'
const STORE_NAME = 'pending_submissions'
// Records the server actively rejected (validation / auth). Kept, not
// discarded, so one un-storable submission can't wedge the queue and is
// still recoverable/inspectable on the device.
const FAILED_STORE = 'failed_submissions'

// Postgres SQLSTATE classes that mean "this exact payload will never insert":
// 22 = data exception, 23 = integrity constraint, 42 = access rule / syntax.
// Anything else (offline, 5xx, no code) is treated as transient and retried.
const PERMANENT_SQLSTATE = /^(22|23|42)/

async function getDb() {
  return openDB(DB_NAME, 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(STORE_NAME, { keyPath: 'localId' })
      }
      if (oldVersion < 2) {
        db.createObjectStore(FAILED_STORE, { keyPath: 'localId' })
      }
    },
  })
}

// Enough of a shape check to keep a corrupt or mis-shaped value from being
// queued and then failing to sync forever. Not a schema validator.
export function isPlausibleSubmission(payload) {
  return (
    payload != null &&
    typeof payload === 'object' &&
    !Array.isArray(payload) &&
    typeof payload.device_id === 'string' &&
    payload.device_id.length > 0 &&
    Array.isArray(payload.symptoms) &&
    typeof payload.severity === 'string'
  )
}

export async function enqueueSubmission(payload) {
  const db = await getDb()
  // The idempotency key doubles as the local key, so a retry reuses the same
  // record and the same server-side unique key.
  const localId = payload.client_submission_id ?? crypto.randomUUID()
  await db.put(STORE_NAME, { localId, payload, createdAt: Date.now() })
  return localId
}

export async function listQueuedSubmissions() {
  const db = await getDb()
  return db.getAll(STORE_NAME)
}

export async function removeQueuedSubmission(localId) {
  const db = await getDb()
  await db.delete(STORE_NAME, localId)
}

export async function listFailedSubmissions() {
  const db = await getDb()
  return db.getAll(FAILED_STORE)
}

export async function queueSize() {
  const db = await getDb()
  return db.count(STORE_NAME)
}

// One send attempt. Returns { ok: true } on success -- including a unique-key
// collision (23505), which means an earlier half-completed sync already
// stored this row. Returns { ok: false, permanent } otherwise, where
// `permanent` marks a server-side rejection that will never succeed on retry.
export async function trySubmit(payload) {
  const { error } = await supabase.from('triage_submissions').insert(payload)
  if (!error) return { ok: true }
  if (error.code === '23505') return { ok: true }
  const permanent = typeof error.code === 'string' && PERMANENT_SQLSTATE.test(error.code)
  // Log only the class of failure -- never the payload or the raw error
  // object, which can echo submitted patient data via details/hint.
  console.error('[queue] submission not synced:', permanent ? `rejected (${error.code})` : 'will retry')
  return { ok: false, permanent }
}

async function quarantineSubmission(item) {
  const db = await getDb()
  await db.put(FAILED_STORE, { ...item, failedAt: Date.now() })
  await db.delete(STORE_NAME, item.localId)
}

// Replays every queued submission oldest-first. Removes each on success;
// moves a permanently-rejected one aside and keeps going; stops at the first
// transient failure so ordering is preserved for the next pass.
export async function flushQueue(onProgress) {
  const items = await listQueuedSubmissions()
  items.sort((a, b) => a.createdAt - b.createdAt)

  let synced = 0
  for (const item of items) {
    const { ok, permanent } = await trySubmit(item.payload)
    if (ok) {
      await removeQueuedSubmission(item.localId)
      synced += 1
      onProgress?.(synced, items.length)
      continue
    }
    if (permanent) {
      await quarantineSubmission(item)
      continue
    }
    break
  }
  return synced
}

// Submit-with-offline-fallback: always queue first, then try to send right
// away. If the immediate send succeeds, dequeue it so nothing double-syncs.
export async function submitIntake(payload) {
  if (!isPlausibleSubmission(payload)) {
    throw new Error('submitIntake: malformed submission payload')
  }
  const withKey = { ...payload, client_submission_id: crypto.randomUUID() }
  const localId = await enqueueSubmission(withKey)
  if (navigator.onLine) {
    const { ok } = await trySubmit(withKey)
    if (ok) {
      await removeQueuedSubmission(localId)
      return { synced: true }
    }
  }
  return { synced: false }
}

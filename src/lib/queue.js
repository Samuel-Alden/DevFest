import { openDB } from 'idb'
import { supabase } from './supabase'

const DB_NAME = 'triagepeace'
const STORE_NAME = 'pending_submissions'

async function getDb() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'localId' })
    },
  })
}

export async function enqueueSubmission(payload) {
  const db = await getDb()
  const localId = crypto.randomUUID()
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

export async function queueSize() {
  const db = await getDb()
  return db.count(STORE_NAME)
}

// Attempts to send one payload straight to Supabase. Returns true on success.
export async function trySubmit(payload) {
  const { error } = await supabase.from('triage_submissions').insert(payload)
  return !error
}

// Replays every queued submission in order, removing each on success and
// stopping at the first failure so ordering is preserved for the next pass.
export async function flushQueue(onProgress) {
  const items = await listQueuedSubmissions()
  items.sort((a, b) => a.createdAt - b.createdAt)

  let synced = 0
  for (const item of items) {
    const ok = await trySubmit(item.payload)
    if (!ok) break
    await removeQueuedSubmission(item.localId)
    synced += 1
    onProgress?.(synced, items.length)
  }
  return synced
}

// Submit-with-offline-fallback: always queue first, then try to send right
// away. If the immediate send succeeds, dequeue it so nothing double-syncs.
export async function submitIntake(payload) {
  const localId = await enqueueSubmission(payload)
  if (navigator.onLine) {
    const ok = await trySubmit(payload)
    if (ok) {
      await removeQueuedSubmission(localId)
      return { synced: true }
    }
  }
  return { synced: false }
}

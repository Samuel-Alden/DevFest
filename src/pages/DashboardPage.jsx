import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SEVERITY_META } from '../lib/triage'
import { PushAlertToggle } from '../components/PushAlertToggle'

function sortSubmissions(rows) {
  return [...rows].sort((a, b) => {
    const orderDiff = SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order
    if (orderDiff !== 0) return orderDiff
    return new Date(a.created_at) - new Date(b.created_at)
  })
}

export function DashboardPage() {
  const { session, loading } = useAuth()
  const [rows, setRows] = useState([])
  const [loadingRows, setLoadingRows] = useState(true)

  useEffect(() => {
    if (!session) return

    let channel

    async function load() {
      const { data } = await supabase
        .from('triage_submissions')
        .select('*')
        .neq('status', 'resolved')
        .order('created_at', { ascending: true })
      setRows(data ?? [])
      setLoadingRows(false)
    }

    load()

    channel = supabase
      .channel('triage_submissions_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'triage_submissions' }, (payload) => {
        setRows((current) => {
          if (payload.eventType === 'INSERT') {
            return [...current, payload.new]
          }
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new
            if (updated.status === 'resolved') {
              return current.filter((r) => r.id !== updated.id)
            }
            return current.map((r) => (r.id === updated.id ? updated : r))
          }
          if (payload.eventType === 'DELETE') {
            return current.filter((r) => r.id !== payload.old.id)
          }
          return current
        })
      })
      .subscribe()

    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [session])

  if (!loading && !session) return <Navigate to="/login" replace />

  const updateStatus = async (id, status) => {
    await supabase.from('triage_submissions').update({ status }).eq('id', id)
  }

  const sorted = sortSubmissions(rows)

  return (
    <div className="max-w-3xl mx-auto p-4 pb-16">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Triage Queue</h1>
          <p className="text-sm text-neutral-500">{sorted.length} active case(s)</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <PushAlertToggle />
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-neutral-400 underline"
          >
            Sign out
          </button>
        </div>
      </header>

      {loadingRows && <p className="text-neutral-400">Loading…</p>}

      {!loadingRows && sorted.length === 0 && (
        <p className="text-neutral-400 text-center mt-16">No active cases. Queue is clear.</p>
      )}

      <ul className="space-y-3">
        {sorted.map((row) => (
          <li key={row.id} className="rounded-lg border border-neutral-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${SEVERITY_META[row.severity].badge}`}>
                  {SEVERITY_META[row.severity].label}
                </span>
                <p className="mt-2 font-medium text-neutral-900">
                  {row.patient_name || 'Unnamed patient'} {row.age ? `(${row.age})` : ''}
                </p>
                {row.symptoms?.length > 0 && (
                  <p className="text-sm text-neutral-500 mt-1">{row.symptoms.join(', ')}</p>
                )}
                {row.notes && <p className="text-sm text-neutral-500 mt-1 italic">"{row.notes}"</p>}
                <p className="text-xs text-neutral-400 mt-2">{new Date(row.created_at).toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                {row.status !== 'in_progress' && (
                  <button
                    onClick={() => updateStatus(row.id, 'in_progress')}
                    className="text-xs px-3 py-1.5 rounded-md border border-neutral-300 hover:bg-neutral-50"
                  >
                    In progress
                  </button>
                )}
                <button
                  onClick={() => updateStatus(row.id, 'resolved')}
                  className="text-xs px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-700"
                >
                  Resolve
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

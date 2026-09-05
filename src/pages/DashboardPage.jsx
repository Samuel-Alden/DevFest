import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { SEVERITY_META, SYMPTOM_OPTIONS } from '../lib/triage'
import { PushAlertToggle } from '../components/PushAlertToggle'
import { CaseListPane } from '../components/dashboard/CaseListPane'
import { CaseDetailPane } from '../components/dashboard/CaseDetailPane'
import { BellIcon, LogoutIcon } from '../components/icons'

function sortSubmissions(rows) {
  return [...rows].sort((a, b) => {
    const orderDiff = SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order
    if (orderDiff !== 0) return orderDiff
    return new Date(a.created_at) - new Date(b.created_at)
  })
}

function matchesQuery(row, query) {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  const symptomText = (row.symptoms ?? [])
    .map((k) => SYMPTOM_OPTIONS.find((o) => o.key === k)?.label ?? k)
    .join(' ')
    .toLowerCase()
  return (
    row.patient_name?.toLowerCase().includes(q) ||
    row.notes?.toLowerCase().includes(q) ||
    symptomText.includes(q)
  )
}

export function DashboardPage() {
  const { session, loading } = useAuth()
  const [rows, setRows] = useState([])
  const [loadingRows, setLoadingRows] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAlertMenu, setShowAlertMenu] = useState(false)

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

  useEffect(() => {
    if (selectedId && !rows.some((r) => r.id === selectedId)) setSelectedId(null)
  }, [rows, selectedId])

  if (!loading && !session) return <Navigate to="/login" replace />

  const updateStatus = async (id, status) => {
    await supabase.from('triage_submissions').update({ status }).eq('id', id)
  }

  const sortedRows = sortSubmissions(rows)
  const visibleRows = sortedRows.filter((r) => matchesQuery(r, searchQuery))
  const selectedRow = sortedRows.find((r) => r.id === selectedId) ?? null

  return (
    <div className="h-dvh flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-deep shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">TriagePeace</h1>
          <p className="text-xs text-white/70">{sortedRows.length} active case(s)</p>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu((v) => !v)}
              aria-label="Notification settings"
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
            >
              <BellIcon className="h-5 w-5 text-white" />
            </button>
            {showAlertMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAlertMenu(false)} />
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-line bg-paper shadow-lg p-3 z-20 animate-fade-in">
                  <PushAlertToggle />
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            aria-label="Sign out"
            className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex md:grid md:grid-cols-[360px_1fr]">
        <CaseListPane
          rows={visibleRows}
          selectedId={selectedId}
          onSelect={setSelectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loadingRows}
          className={`${selectedId ? 'hidden' : 'flex'} md:flex w-full md:border-r md:border-line`}
        />
        <CaseDetailPane
          row={selectedRow}
          onBack={() => setSelectedId(null)}
          onUpdateStatus={updateStatus}
          className={`${selectedId ? 'flex' : 'hidden'} md:flex w-full`}
        />
      </div>
    </div>
  )
}

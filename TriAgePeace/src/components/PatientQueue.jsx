import { useState } from 'react'

const severityStyles = {
  critical: {
    border: 'border-l-8 border-l-red-500',
    badge: 'bg-red-500 text-white',
  },
  urgent: {
    border: 'border-l-8 border-l-amber-500',
    badge: 'bg-amber-500 text-white',
  },
  stable: {
    border: 'border-l-8 border-l-emerald-500',
    badge: 'bg-emerald-500 text-white',
  },
}

function ConfirmDeleteModal({ patientName, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Delete patient?</h3>
        <p className="text-sm text-slate-600">
          Remove <span className="font-semibold text-slate-900">{patientName}</span> from
          the queue? This cannot be undone.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

function PatientCard({
  patient,
  isAdminLoggedIn,
  onToggleResolve,
  onToggleInProgress,
  onRequestDelete,
}) {
  const styles = severityStyles[patient.severity] || severityStyles.stable

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 ${styles.border} p-4 shadow-sm space-y-3 transition ${
        patient.resolved ? 'opacity-40' : ''
      }`}
    >
      <div className="flex justify-between items-center">
        <span
          className={`${styles.badge} text-xs font-bold px-2.5 py-1 rounded-full uppercase`}
        >
          {patient.severity}
        </span>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">
            {patient.waitTime} mins ago
          </span>

          {isAdminLoggedIn && (
            <label className="flex items-center gap-1 text-xs text-slate-700 font-bold cursor-pointer bg-slate-100 px-2 py-1 rounded-md hover:bg-slate-200 border border-slate-300">
              <input
                type="checkbox"
                checked={patient.resolved}
                onChange={() => onToggleResolve(patient.id)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              Resolve
            </label>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-start">
          <h3
            className={`text-lg font-bold ${
              patient.resolved
                ? 'line-through text-slate-400'
                : 'text-slate-900'
            }`}
          >
            {patient.name}{' '}
            <span className="text-xs font-normal text-slate-500">
              ({patient.age} y/o)
            </span>
          </h3>

          {patient.inProgress && !patient.resolved && (
            <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-300">
              In Progress
            </span>
          )}

          {!patient.inProgress && !patient.resolved && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
              Waiting
            </span>
          )}

          {patient.resolved && (
            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Resolved
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 mt-0.5">{patient.symptoms}</p>
      </div>

      {/* In-progress control (active patients) */}
      {isAdminLoggedIn && !patient.resolved && (
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => onToggleInProgress(patient.id)}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg transition ${
              patient.inProgress
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {patient.inProgress ? 'Mark Waiting' : 'Set In-Progress'}
          </button>
        </div>
      )}

      {/* Delete control (resolved patients only) */}
      {isAdminLoggedIn && patient.resolved && (
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={() => onRequestDelete(patient)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function PatientQueue({
  patients,
  isAdminLoggedIn,
  onToggleResolve,
  onToggleInProgress,
  onDeletePatient,
  onLoginClick,
  onLogout,
}) {
  const [pendingDelete, setPendingDelete] = useState(null)
  const activeCount = patients.filter((p) => !p.resolved).length

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      onDeletePatient(pendingDelete.id)
      setPendingDelete(null)
    }
  }

  return (
    <main className="p-4 max-w-md mx-auto pb-16">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Triage Queue</h2>
          <p className="text-xs text-slate-500">Live priority status</p>
        </div>
        <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold">
          {activeCount} Active
        </span>
      </div>

      {patients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">Queue is empty</p>
          <p className="text-xs text-slate-500 mt-1">
            New patients will appear here after intake.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isAdminLoggedIn={isAdminLoggedIn}
              onToggleResolve={onToggleResolve}
              onToggleInProgress={onToggleInProgress}
              onRequestDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <div className="mt-6 text-center">
        {isAdminLoggedIn ? (
          <button
            type="button"
            onClick={onLogout}
            className="text-xs text-emerald-600 font-semibold hover:underline"
          >
            Doctor Authorized — Sign Out
          </button>
        ) : (
          <button
            type="button"
            onClick={onLoginClick}
            className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
          >
            Doctor / Admin Login
          </button>
        )}
      </div>

      {pendingDelete && (
        <ConfirmDeleteModal
          patientName={pendingDelete.name}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </main>
  )
}

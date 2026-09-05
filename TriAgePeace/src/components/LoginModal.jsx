import { useState } from 'react'

export default function LoginModal({ onClose, onLogin }) {
  const [workerId, setWorkerId] = useState('')
  const [pin, setPin] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (workerId && pin) {
      onLogin()
      setWorkerId('')
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">
            Doctor Authentication
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Doctor ID
            </label>
            <input
              type="text"
              required
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              placeholder="e.g. DOC-102"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              PIN
            </label>
            <input
              type="password"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="••••"
              className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm shadow transition mt-2"
          >
            Unlock Doctor Controls
          </button>
        </form>
      </div>
    </div>
  )
}

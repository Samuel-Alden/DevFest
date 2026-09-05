import { useState, useRef, useEffect } from 'react'

const SEVERITY_LEVELS = ['critical', 'urgent', 'stable']

const activeClasses = {
  critical: 'bg-red-500 text-white border-red-600 ring-2 ring-red-400',
  urgent: 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-400',
  stable: 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-400',
}

export default function PatientIntake({
  onSubmit,
  isAdminLoggedIn,
  onLoginClick,
  onLogout,
}) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    severity: 'stable',
    symptoms: '',
  })
  const textareaRef = useRef(null)

  // Auto-grow textarea with content (no manual resize handle)
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [formData.symptoms])

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onSubmit({
      ...formData,
      age: formData.age || '',
    })

    setFormData({ name: '', age: '', severity: 'stable', symptoms: '' })
  }

  return (
    <main className="p-4 max-w-md mx-auto pb-36">
      <h2 className="text-xl font-bold mb-1 text-slate-900">Patient Intake</h2>
      <p className="text-xs text-slate-500 mb-4">Field assessment entry</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Patient Full Name
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="e.g. John Doe"
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Age (Years)
          </label>
          <input
            type="number"
            required
            value={formData.age}
            onChange={handleChange('age')}
            placeholder="e.g. 34"
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-slate-900 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Urgency / Severity
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SEVERITY_LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, severity: level }))
                }
                className={`p-3 rounded-xl border text-center font-bold text-xs flex flex-col items-center gap-1 transition uppercase ${
                  formData.severity === level
                    ? activeClasses[level]
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Primary Symptoms
          </label>
          <textarea
            ref={textareaRef}
            rows={3}
            value={formData.symptoms}
            onChange={handleChange('symptoms')}
            placeholder="Describe chief complaint..."
            className="w-full p-3 bg-white border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-slate-900 outline-none resize-none overflow-hidden min-h-[5.5rem]"
          />
        </div>

        {/* Fixed bottom actions: Submit + Doctor login */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 space-y-2">
          <button
            type="submit"
            className="w-full max-w-md mx-auto block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-base shadow-lg active:scale-95 transition"
          >
            Submit Patient Request
          </button>

          <div className="max-w-md mx-auto text-center">
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
        </div>
      </form>
    </main>
  )
}

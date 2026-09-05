import { useState } from 'react'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import StatusBar from './components/StatusBar'
import Header from './components/Header'
import LoginModal from './components/LoginModal'
import PatientIntake from './components/PatientIntake'
import PatientQueue from './components/PatientQueue'

export default function App() {
  const isOnline = useOnlineStatus()
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [tab, setTab] = useState('intake')
  const [offlineCount, setOfflineCount] = useState(0)
  const [patients, setPatients] = useState([])

  const activePatientsCount = patients.filter((p) => !p.resolved).length

  const handlePatientSubmit = (formData) => {
    const newPatient = {
      id: Date.now(),
      ...formData,
      waitTime: 0,
      inProgress: false,
      resolved: false,
    }

    setPatients((prev) => [newPatient, ...prev])

    if (!isOnline) {
      setOfflineCount((prev) => prev + 1)
    }

    setTab('dashboard')
  }

  const toggleInProgress = (id) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, inProgress: !p.inProgress } : p
      )
    )
  }

  const toggleResolvePatient = (id) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, resolved: !p.resolved } : p
      )
    )
  }

  const deletePatient = (id) => {
    setPatients((prev) => prev.filter((p) => p.id !== id))
  }

  const openLogin = () => setShowLoginModal(true)
  const logout = () => setIsAdminLoggedIn(false)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <StatusBar isOnline={isOnline} offlineCount={offlineCount} />

      <Header
        tab={tab}
        onTabChange={setTab}
        activeCount={activePatientsCount}
      />

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLogin={() => {
            setIsAdminLoggedIn(true)
            setShowLoginModal(false)
          }}
        />
      )}

      {tab === 'intake' && (
        <PatientIntake
          onSubmit={handlePatientSubmit}
          isAdminLoggedIn={isAdminLoggedIn}
          onLoginClick={openLogin}
          onLogout={logout}
        />
      )}

      {tab === 'dashboard' && (
        <PatientQueue
          patients={patients}
          isAdminLoggedIn={isAdminLoggedIn}
          onToggleResolve={toggleResolvePatient}
          onToggleInProgress={toggleInProgress}
          onDeletePatient={deletePatient}
          onLoginClick={openLogin}
          onLogout={logout}
        />
      )}
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { OfflineBanner } from './components/OfflineBanner'
import { IntakePage } from './pages/IntakePage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { useOnlineSync } from './hooks/useOnlineSync'
import { LanguageProvider } from './lib/i18n'

function App() {
  const { isOnline, pendingCount, isSyncing, refreshPendingCount } = useOnlineSync()

  return (
    <LanguageProvider>
      <BrowserRouter>
        <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} isSyncing={isSyncing} />
        <Routes>
          <Route path="/" element={<Navigate to="/intake" replace />} />
          <Route path="/intake" element={<IntakePage onSubmitted={refreshPendingCount} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App

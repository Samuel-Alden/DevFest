import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { OfflineBanner } from './components/OfflineBanner'
import { LandingPage } from './pages/LandingPage'
import { IntakePage } from './pages/IntakePage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { useOnlineSync } from './hooks/useOnlineSync'
import { LanguageProvider } from './lib/i18n'
import { ThemeProvider } from './lib/theme'
import { SettingsPage } from './pages/SettingsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'

function App() {
  const { isOnline, pendingCount, isSyncing, refreshPendingCount } = useOnlineSync()

  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <OfflineBanner isOnline={isOnline} pendingCount={pendingCount} isSyncing={isSyncing} />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/intake" element={<IntakePage onSubmitted={refreshPendingCount} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            {/* <Route path="/settings" element={<SettingsPage />} /> */}
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App

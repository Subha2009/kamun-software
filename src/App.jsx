import { AnimatePresence } from 'framer-motion'
import { SessionProvider, useSession } from './context/SessionContext'
import { DelegateProvider } from './context/DelegateContext'
import { ResolutionProvider } from './context/ResolutionContext'
import PasswordGate from './components/IntroSequence/PasswordGate'
import SessionSetup from './components/IntroSequence/SessionSetup'
import AdminSetup from './components/IntroSequence/AdminSetup'
import SplashScreen from './components/IntroSequence/SplashScreen'
import KeynoteVideo from './components/IntroSequence/KeynoteVideo'
import Dashboard from './components/Dashboard/Dashboard'

function LoadingScreen() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl royal-gradient flex items-center justify-center shadow-xl animate-pulse">
                    <img src="/kamun-logo.png" alt="KA-MUN" className="w-12 h-12 object-contain" />
                </div>
                <div className="w-8 h-8 border-4 border-kamun-royal/20 border-t-kamun-royal rounded-full animate-spin" />
                <p className="text-slate-500 text-sm">Loading session...</p>
            </div>
        </div>
    )
}

function AppContent() {
    const { stage, isInitializing, unlock } = useSession()

    if (isInitializing) {
        return <LoadingScreen />
    }

    return (
        <AnimatePresence mode="wait">
            {stage === 'loading' && <LoadingScreen key="loading" />}
            {stage === 'locked' && <PasswordGate key="passwordGate" onUnlock={unlock} />}
            {stage === 'needsSession' && <SessionSetup key="sessionSetup" />}
            {stage === 'admin' && <AdminSetup key="admin" />}
            {stage === 'splash' && <SplashScreen key="splash" />}
            {stage === 'video' && <KeynoteVideo key="video" />}
            {stage === 'dashboard' && <Dashboard key="dashboard" />}
        </AnimatePresence>
    )
}

function App() {
    return (
        <SessionProvider>
            <DelegateProvider>
                <ResolutionProvider>
                    <AppContent />
                </ResolutionProvider>
            </DelegateProvider>
        </SessionProvider>
    )
}

export default App


import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../../context/SessionContext'
import { useDelegates } from '../../context/DelegateContext'
import { supabase, isSupabaseConfigured } from '../../config/supabaseClient'

function AdminSetup() {
    const {
        advanceToSplash,
        setCurrentAgenda,
        currentAgenda,
        currentSessionId,
        currentSessionName,
        allSessions,
        createNewSession,
        switchSession,
        endSession,
        deleteSession
    } = useSession()
    const { delegates, setDelegateStatus, setDelegateName, isLoaded } = useDelegates()

    const [agenda, setAgenda] = useState(currentAgenda || '')
    const [searchTerm, setSearchTerm] = useState('')
    const [isCreatingSession, setIsCreatingSession] = useState(false)
    const [newSessionName, setNewSessionName] = useState('')

    // Sync agenda with context when it changes (e.g., when switching sessions)
    useEffect(() => {
        setAgenda(currentAgenda || '')
    }, [currentAgenda])

    const filteredDelegates = delegates.filter(d =>
        d.country_name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedCount = delegates.filter(d => d.status !== 'absent').length

    const handleStartSession = async () => {
        const agendaText = agenda.trim()
        if (agendaText) {
            setCurrentAgenda(agendaText)

            // Save agenda to Supabase for persistence
            if (isSupabaseConfigured() && currentSessionId) {
                await supabase
                    .from('session_state')
                    .update({ current_agenda: agendaText })
                    .eq('session_id', currentSessionId)
            } else {
                localStorage.setItem('kamun_agenda', agendaText)
            }
        }
        advanceToSplash()
    }

    const toggleCountrySelection = (countryName) => {
        const delegate = delegates.find(d => d.country_name === countryName)
        if (delegate) {
            setDelegateStatus(countryName, delegate.status === 'absent' ? 'present' : 'absent')
        }
    }

    const handleCreateNewSession = async () => {
        if (!newSessionName.trim()) return

        setIsCreatingSession(true)
        await createNewSession(newSessionName.trim())
        setNewSessionName('')
        setIsCreatingSession(false)
    }

    const handleSwitchSession = async (sessionId) => {
        if (sessionId === currentSessionId) return
        await switchSession(sessionId)
    }

    return (
        <motion.div
            className="h-screen w-full bg-white flex overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Left Panel - Session Sidebar */}
            <div className="w-72 h-screen bg-slate-900 flex flex-col flex-shrink-0">
                {/* Logo Header */}
                <div className="p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <img
                            src="/kamun-logo.png"
                            alt="KA-MUN"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                </div>

                {/* New Session Button */}
                <div className="p-3 border-b border-slate-700">
                    <button
                        onClick={() => setIsCreatingSession(true)}
                        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors border border-slate-600 hover:border-slate-500"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="font-medium">New Session</span>
                    </button>
                </div>

                {/* Create Session Input (when creating) */}
                {isCreatingSession && (
                    <div className="p-3 border-b border-slate-700 bg-slate-800">
                        <input
                            type="text"
                            value={newSessionName}
                            onChange={(e) => setNewSessionName(e.target.value)}
                            placeholder="Session name..."
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreateNewSession()
                                if (e.key === 'Escape') setIsCreatingSession(false)
                            }}
                            className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg text-sm focus:outline-none focus:border-kamun-royal placeholder-slate-400"
                        />
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleCreateNewSession}
                                className="flex-1 px-3 py-1.5 bg-kamun-royal text-white text-sm rounded-lg hover:bg-kamun-royal/80"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setIsCreatingSession(false)}
                                className="px-3 py-1.5 text-slate-400 hover:text-white text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Session History */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-3">
                        <p className="px-2 py-2 text-xs text-slate-500 uppercase tracking-widest font-medium">
                            Session History
                        </p>

                        {allSessions.length === 0 ? (
                            <div className="px-2 py-8 text-center text-slate-500 text-sm">
                                <p>No sessions yet</p>
                                <p className="text-xs mt-1 text-slate-600">Create your first session above</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {allSessions.map((session) => {
                                    const date = new Date(session.created_at)
                                    const isActive = session.id === currentSessionId

                                    return (
                                        <div
                                            key={session.id}
                                            className={`group w-full p-3 text-left rounded-xl transition-all ${isActive
                                                ? 'bg-slate-700 border border-kamun-royal'
                                                : 'hover:bg-slate-800 border border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <button
                                                    onClick={() => handleSwitchSession(session.id)}
                                                    className="flex items-center gap-2 flex-1 min-w-0"
                                                >
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-green-500' : 'bg-slate-600'}`} />
                                                    <p className={`font-medium text-sm truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                                                        {session.name}
                                                    </p>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (confirm(`Delete "${session.name}"? This will permanently remove all data for this session.`)) {
                                                            deleteSession(session.id)
                                                        }
                                                    }}
                                                    className="p-1 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all"
                                                    title="Delete session"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 pl-4">
                                                {date.toLocaleDateString()}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Current Session Footer */}
                {currentSessionName && (
                    <div className="p-4 border-t border-slate-700 bg-slate-800/50">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current</p>
                        <p className="text-white font-medium text-sm truncate">{currentSessionName}</p>
                    </div>
                )}
            </div>

            {/* Right Panel - Setup Form */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-slate-200 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-kamun-navy">Session Setup</h2>
                            <p className="text-slate-500 text-sm mt-1">Configure delegates and agenda before starting</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-2xl font-bold text-kamun-royal">{selectedCount}</p>
                                <p className="text-xs text-slate-400">Countries</p>
                            </div>
                            <button
                                onClick={handleStartSession}
                                disabled={selectedCount === 0}
                                className="btn-royal disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Start Session
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Agenda Input */}
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Today's Agenda</label>
                        <input
                            type="text"
                            value={agenda}
                            onChange={(e) => setAgenda(e.target.value)}
                            placeholder="e.g., The situation in the Middle East"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-kamun-navy placeholder-slate-400 focus:outline-none focus:border-kamun-royal transition-colors"
                        />
                    </div>
                </div>

                {/* Search */}
                <div className="px-6 md:px-8 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search countries..."
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-kamun-navy placeholder-slate-400 focus:outline-none focus:border-kamun-royal focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* Countries Grid */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    {!isLoaded ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-10 h-10 border-4 border-kamun-royal/20 border-t-kamun-royal rounded-full animate-spin" />
                                <p className="text-slate-400">Loading delegates...</p>
                            </div>
                        </div>
                    ) : delegates.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <p className="text-slate-400 text-lg">No session active</p>
                                <p className="text-slate-500 text-sm mt-1">Create a new session to get started</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredDelegates.map((delegate) => {
                                const isSelected = delegate.status !== 'absent'

                                return (
                                    <div
                                        key={delegate.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? 'bg-kamun-royal/5 border-kamun-royal shadow-md'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <button
                                                onClick={() => toggleCountrySelection(delegate.country_name)}
                                                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-kamun-royal border-kamun-royal text-white'
                                                    : 'border-slate-300 hover:border-kamun-royal'
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </button>

                                            <img
                                                src={delegate.flag_url}
                                                alt={delegate.country_name}
                                                className={`w-10 h-7 rounded shadow ${!isSelected ? 'grayscale opacity-50' : ''}`}
                                            />

                                            <span className={`font-semibold text-sm ${isSelected ? 'text-kamun-navy' : 'text-slate-400'}`}>
                                                {delegate.country_name}
                                            </span>
                                        </div>

                                        <input
                                            type="text"
                                            value={delegate.delegate_name || ''}
                                            onChange={(e) => setDelegateName(delegate.country_name, e.target.value)}
                                            placeholder="Delegate name..."
                                            disabled={!isSelected}
                                            className={`w-full px-3 py-2 text-sm rounded-lg border transition-all ${isSelected
                                                ? 'bg-white border-slate-200 text-kamun-navy placeholder-slate-400 focus:outline-none focus:border-kamun-royal'
                                                : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                                }`}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default AdminSetup

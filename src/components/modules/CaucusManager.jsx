import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playBellSound, playDingSound } from '../../utils/audio'
import { useDelegates } from '../../context/DelegateContext'
import { useSession } from '../../context/SessionContext'

function CaucusManager() {
    const { delegates } = useDelegates()
    const { currentSessionId } = useSession()
    const [caucusType, setCaucusType] = useState('moderated')

    // Moderated Caucus State
    const [modTotalTime, setModTotalTime] = useState(600)
    const [modSpeakerTime, setModSpeakerTime] = useState(60)
    const [modTimeLeft, setModTimeLeft] = useState(600)
    const [modSpeakerTimeLeft, setModSpeakerTimeLeft] = useState(60)
    const [modIsRunning, setModIsRunning] = useState(false)
    const [modTopic, setModTopic] = useState('')

    // Unmoderated Caucus State
    const [unmodTime, setUnmodTime] = useState(300)
    const [unmodTimeLeft, setUnmodTimeLeft] = useState(300)
    const [unmodIsRunning, setUnmodIsRunning] = useState(false)

    // Right of Reply State
    const [rorCountry, setRorCountry] = useState('')
    const [rorTime, setRorTime] = useState(60)
    const [rorTimeLeft, setRorTimeLeft] = useState(60)
    const [rorIsRunning, setRorIsRunning] = useState(false)

    // Session Log State (persisted)
    const [sessionLog, setSessionLog] = useState({
        rorHistory: [],        // { country, timestamp }
        caucusHistory: [],     // { topic, duration, type, timestamp }
    })

    const modTimerRef = useRef(null)
    const unmodTimerRef = useRef(null)
    const rorTimerRef = useRef(null)
    const modBellPlayedRef = useRef(false)
    const unmodBellPlayedRef = useRef(false)
    const rorBellPlayedRef = useRef(false)
    const speakerDingPlayedRef = useRef(false)

    // Get present delegates for selection
    const presentDelegates = delegates.filter(d => d.status === 'present' || d.status === 'present_voting')

    // Load session log from localStorage on mount
    useEffect(() => {
        if (!currentSessionId) return
        const saved = localStorage.getItem(`kamun_session_log_${currentSessionId}`)
        if (saved) {
            try {
                setSessionLog(JSON.parse(saved))
            } catch (e) {
                console.error('Failed to load session log:', e)
            }
        }
    }, [currentSessionId])

    // Save session log to localStorage when it changes
    useEffect(() => {
        if (currentSessionId) {
            localStorage.setItem(`kamun_session_log_${currentSessionId}`, JSON.stringify(sessionLog))
        }
    }, [sessionLog, currentSessionId])

    // Add RoR to history
    const logRoR = (country) => {
        setSessionLog(prev => ({
            ...prev,
            rorHistory: [...prev.rorHistory, { country, timestamp: new Date().toISOString() }]
        }))
    }

    // Add caucus to history
    const logCaucus = (topic, duration, type) => {
        setSessionLog(prev => ({
            ...prev,
            caucusHistory: [...prev.caucusHistory, { topic, duration, type, timestamp: new Date().toISOString() }]
        }))
    }

    // Clear specific history
    const clearRoRHistory = () => {
        if (confirm('Clear all Right of Reply history?')) {
            setSessionLog(prev => ({ ...prev, rorHistory: [] }))
        }
    }

    const clearCaucusHistory = () => {
        if (confirm('Clear all caucus history?')) {
            setSessionLog(prev => ({ ...prev, caucusHistory: [] }))
        }
    }

    // Moderated caucus timer
    useEffect(() => {
        if (modIsRunning && modTimeLeft > 0) {
            modTimerRef.current = setInterval(() => {
                setModTimeLeft(prev => {
                    if (prev === 31) playDingSound()
                    return prev - 1
                })
                setModSpeakerTimeLeft(prev => {
                    if (prev <= 1) {
                        if (!speakerDingPlayedRef.current) {
                            playDingSound()
                            speakerDingPlayedRef.current = true
                            setTimeout(() => { speakerDingPlayedRef.current = false }, 1000)
                        }
                        return modSpeakerTime
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (modTimeLeft === 0 && !modBellPlayedRef.current) {
            setModIsRunning(false)
            modBellPlayedRef.current = true
            playBellSound()
        }
        return () => clearInterval(modTimerRef.current)
    }, [modIsRunning, modTimeLeft, modSpeakerTime])

    useEffect(() => {
        if (modTimeLeft > 0) modBellPlayedRef.current = false
    }, [modTimeLeft])

    // Unmoderated caucus timer
    useEffect(() => {
        if (unmodIsRunning && unmodTimeLeft > 0) {
            unmodTimerRef.current = setInterval(() => {
                setUnmodTimeLeft(prev => {
                    if (prev === 31) playDingSound()
                    return prev - 1
                })
            }, 1000)
        } else if (unmodTimeLeft === 0 && !unmodBellPlayedRef.current) {
            setUnmodIsRunning(false)
            unmodBellPlayedRef.current = true
            playBellSound()
        }
        return () => clearInterval(unmodTimerRef.current)
    }, [unmodIsRunning, unmodTimeLeft])

    useEffect(() => {
        if (unmodTimeLeft > 0) unmodBellPlayedRef.current = false
    }, [unmodTimeLeft])

    // Right of Reply timer
    useEffect(() => {
        if (rorIsRunning && rorTimeLeft > 0) {
            rorTimerRef.current = setInterval(() => {
                setRorTimeLeft(prev => {
                    if (prev === 11) playDingSound()
                    return prev - 1
                })
            }, 1000)
        } else if (rorTimeLeft === 0 && !rorBellPlayedRef.current) {
            setRorIsRunning(false)
            rorBellPlayedRef.current = true
            playBellSound()
        }
        return () => clearInterval(rorTimerRef.current)
    }, [rorIsRunning, rorTimeLeft])

    useEffect(() => {
        if (rorTimeLeft > 0) rorBellPlayedRef.current = false
    }, [rorTimeLeft])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60)
        return mins > 0 ? `${mins} min` : `${seconds}s`
    }

    // Moderated handlers
    const handleModStart = () => {
        if (modTopic.trim()) {
            logCaucus(modTopic.trim(), modTotalTime, 'moderated')
        }
        setModIsRunning(true)
    }
    const handleModPause = () => setModIsRunning(false)
    const handleModReset = () => {
        setModIsRunning(false)
        setModTimeLeft(modTotalTime)
        setModSpeakerTimeLeft(modSpeakerTime)
        modBellPlayedRef.current = false
    }
    const handleNextSpeaker = () => {
        setModSpeakerTimeLeft(modSpeakerTime)
        playDingSound()
    }

    // Unmoderated handlers
    const handleUnmodStart = () => {
        logCaucus('Unmoderated Caucus', unmodTime, 'unmoderated')
        setUnmodIsRunning(true)
    }
    const handleUnmodPause = () => setUnmodIsRunning(false)
    const handleUnmodReset = () => {
        setUnmodIsRunning(false)
        setUnmodTimeLeft(unmodTime)
        unmodBellPlayedRef.current = false
    }

    // Right of Reply handlers
    const handleRorStart = () => {
        if (rorCountry) {
            logRoR(rorCountry)
            setRorIsRunning(true)
        }
    }
    const handleRorPause = () => setRorIsRunning(false)
    const handleRorReset = () => {
        setRorIsRunning(false)
        setRorTimeLeft(rorTime)
        rorBellPlayedRef.current = false
    }

    return (
        <div className="h-full flex flex-col">
            {/* Module Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-kamun-navy">Caucus Manager</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        All sessions are automatically logged
                    </p>
                </div>

                {/* Caucus Type Toggle */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => setCaucusType('moderated')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${caucusType === 'moderated'
                            ? 'royal-gradient text-white shadow-md'
                            : 'text-slate-500 hover:text-kamun-navy'
                            }`}
                    >
                        Moderated
                    </button>
                    <button
                        onClick={() => setCaucusType('unmoderated')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${caucusType === 'unmoderated'
                            ? 'royal-gradient text-white shadow-md'
                            : 'text-slate-500 hover:text-kamun-navy'
                            }`}
                    >
                        Unmoderated
                    </button>
                    <button
                        onClick={() => setCaucusType('ror')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${caucusType === 'ror'
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'text-slate-500 hover:text-kamun-navy'
                            }`}
                    >
                        ⚖️ RoR
                    </button>
                    <button
                        onClick={() => setCaucusType('history')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${caucusType === 'history'
                            ? 'bg-slate-700 text-white shadow-md'
                            : 'text-slate-500 hover:text-kamun-navy'
                            }`}
                    >
                        📋 History
                    </button>
                </div>
            </div>

            {/* Caucus Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    {caucusType === 'moderated' && (
                        <motion.div
                            key="moderated"
                            className="h-full flex items-center justify-center"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            <div className="w-full max-w-3xl glass-panel-elevated p-6">
                                {/* Topic Input */}
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-500 mb-2 font-medium">Caucus Topic / Subtopic</label>
                                    <input
                                        type="text"
                                        value={modTopic}
                                        onChange={(e) => setModTopic(e.target.value)}
                                        placeholder="e.g., Humanitarian aid distribution"
                                        disabled={modIsRunning}
                                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-kamun-navy font-medium focus:outline-none focus:border-kamun-royal disabled:opacity-50"
                                    />
                                </div>

                                {/* Time Settings */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm text-slate-500 mb-2 font-medium">Total Time</label>
                                        <select
                                            value={modTotalTime}
                                            onChange={(e) => {
                                                const newTime = parseInt(e.target.value)
                                                setModTotalTime(newTime)
                                                if (!modIsRunning) setModTimeLeft(newTime)
                                            }}
                                            disabled={modIsRunning}
                                            className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-kamun-navy focus:outline-none focus:border-kamun-royal disabled:opacity-50"
                                        >
                                            <option value={300}>5:00</option>
                                            <option value={600}>10:00</option>
                                            <option value={900}>15:00</option>
                                            <option value={1200}>20:00</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-500 mb-2 font-medium">Speaker Time</label>
                                        <select
                                            value={modSpeakerTime}
                                            onChange={(e) => {
                                                const newTime = parseInt(e.target.value)
                                                setModSpeakerTime(newTime)
                                                if (!modIsRunning) setModSpeakerTimeLeft(newTime)
                                            }}
                                            disabled={modIsRunning}
                                            className="w-full px-4 py-2 bg-white border-2 border-slate-200 rounded-lg text-kamun-navy focus:outline-none focus:border-kamun-royal disabled:opacity-50"
                                        >
                                            <option value={30}>0:30</option>
                                            <option value={45}>0:45</option>
                                            <option value={60}>1:00</option>
                                            <option value={90}>1:30</option>
                                            <option value={120}>2:00</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dual Timer Display */}
                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1 font-medium">Total</p>
                                        <div className={`text-4xl font-bold timer-display ${modTimeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-kamun-navy'}`}>
                                            {formatTime(modTimeLeft)}
                                        </div>
                                        <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${modTimeLeft < 30 ? 'bg-red-500' : 'bg-kamun-royal'}`}
                                                initial={false}
                                                animate={{ width: `${(modTimeLeft / modTotalTime) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-center p-4 royal-gradient-subtle rounded-xl border border-kamun-royal/10">
                                        <p className="text-xs text-kamun-royal mb-1 font-medium">Speaker</p>
                                        <div className={`text-4xl font-bold timer-display ${modSpeakerTimeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-kamun-navy'}`}>
                                            {formatTime(modSpeakerTimeLeft)}
                                        </div>
                                        <div className="mt-2 h-2 bg-kamun-royal/20 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${modSpeakerTimeLeft < 10 ? 'bg-red-500' : 'bg-kamun-royal'}`}
                                                initial={false}
                                                animate={{ width: `${(modSpeakerTimeLeft / modSpeakerTime) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-3">
                                    {!modIsRunning ? (
                                        <button onClick={handleModStart} className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors shadow-md">
                                            Start
                                        </button>
                                    ) : (
                                        <button onClick={handleModPause} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors shadow-md">
                                            Pause
                                        </button>
                                    )}
                                    <button onClick={handleNextSpeaker} className="px-6 py-2 btn-royal">
                                        Next Speaker
                                    </button>
                                    <button onClick={handleModReset} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {caucusType === 'unmoderated' && (
                        <motion.div
                            key="unmoderated"
                            className="h-full flex items-center justify-center"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <div className="w-full max-w-2xl glass-panel-elevated p-8 text-center">
                                <div className="mb-6">
                                    <label className="block text-sm text-slate-500 mb-2 font-medium">Duration</label>
                                    <select
                                        value={unmodTime}
                                        onChange={(e) => {
                                            const newTime = parseInt(e.target.value)
                                            setUnmodTime(newTime)
                                            if (!unmodIsRunning) setUnmodTimeLeft(newTime)
                                        }}
                                        disabled={unmodIsRunning}
                                        className="px-6 py-2 bg-white border-2 border-slate-200 rounded-lg text-kamun-navy text-lg focus:outline-none focus:border-kamun-royal disabled:opacity-50"
                                    >
                                        <option value={180}>3:00</option>
                                        <option value={300}>5:00</option>
                                        <option value={600}>10:00</option>
                                        <option value={900}>15:00</option>
                                    </select>
                                </div>

                                <div className="mb-6">
                                    <div className={`text-6xl font-bold timer-display ${unmodTimeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-kamun-navy'}`}>
                                        {formatTime(unmodTimeLeft)}
                                    </div>
                                    <div className="mt-4 h-3 bg-slate-100 rounded-full overflow-hidden max-w-md mx-auto">
                                        <motion.div
                                            className={`h-full ${unmodTimeLeft < 30 ? 'bg-red-500' : 'bg-kamun-royal'}`}
                                            initial={false}
                                            animate={{ width: `${(unmodTimeLeft / unmodTime) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    {!unmodIsRunning ? (
                                        <button onClick={handleUnmodStart} className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-lg font-semibold rounded-xl transition-colors shadow-md">
                                            Start
                                        </button>
                                    ) : (
                                        <button onClick={handleUnmodPause} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-semibold rounded-xl transition-colors shadow-md">
                                            Pause
                                        </button>
                                    )}
                                    <button onClick={handleUnmodReset} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-lg font-medium rounded-xl transition-colors">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {caucusType === 'ror' && (
                        <motion.div
                            key="ror"
                            className="h-full flex items-center justify-center"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                        >
                            <div className="w-full max-w-2xl glass-panel-elevated p-6 text-center">
                                <div className="mb-4">
                                    <span className="text-3xl mb-1 block">⚖️</span>
                                    <h3 className="text-xl font-bold text-kamun-navy">Right of Reply</h3>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm text-slate-500 mb-2 font-medium">Select Delegate</label>
                                    <select
                                        value={rorCountry}
                                        onChange={(e) => setRorCountry(e.target.value)}
                                        disabled={rorIsRunning}
                                        className="w-full max-w-md mx-auto px-6 py-3 bg-white border-2 border-amber-200 rounded-xl text-kamun-navy text-lg focus:outline-none focus:border-amber-500 disabled:opacity-50"
                                    >
                                        <option value="">-- Choose a country --</option>
                                        {presentDelegates.map(d => (
                                            <option key={d.id} value={d.country_name}>
                                                {d.country_name} {d.delegate_name ? `(${d.delegate_name})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm text-slate-500 mb-2 font-medium">Time</label>
                                    <select
                                        value={rorTime}
                                        onChange={(e) => {
                                            const newTime = parseInt(e.target.value)
                                            setRorTime(newTime)
                                            if (!rorIsRunning) setRorTimeLeft(newTime)
                                        }}
                                        disabled={rorIsRunning}
                                        className="px-6 py-2 bg-white border-2 border-slate-200 rounded-lg text-kamun-navy focus:outline-none focus:border-kamun-royal disabled:opacity-50"
                                    >
                                        <option value={30}>0:30</option>
                                        <option value={45}>0:45</option>
                                        <option value={60}>1:00</option>
                                        <option value={90}>1:30</option>
                                        <option value={120}>2:00</option>
                                    </select>
                                </div>

                                {rorCountry && (
                                    <motion.div
                                        className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <p className="text-xs text-amber-600 font-medium">Responding</p>
                                        <p className="text-xl font-bold text-kamun-navy">{rorCountry}</p>
                                    </motion.div>
                                )}

                                <div className="mb-4">
                                    <div className={`text-6xl font-bold timer-display ${rorTimeLeft < 10 ? 'text-red-500 animate-pulse' : rorTimeLeft < 20 ? 'text-amber-500' : 'text-kamun-navy'}`}>
                                        {formatTime(rorTimeLeft)}
                                    </div>
                                    <div className="mt-3 h-3 bg-slate-100 rounded-full overflow-hidden max-w-md mx-auto">
                                        <motion.div
                                            className={`h-full ${rorTimeLeft < 10 ? 'bg-red-500' : 'bg-amber-500'}`}
                                            initial={false}
                                            animate={{ width: `${(rorTimeLeft / rorTime) * 100}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-4">
                                    {!rorIsRunning ? (
                                        <button
                                            onClick={handleRorStart}
                                            disabled={!rorCountry}
                                            className="px-8 py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors shadow-md disabled:cursor-not-allowed"
                                        >
                                            Start
                                        </button>
                                    ) : (
                                        <button onClick={handleRorPause} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors shadow-md">
                                            Pause
                                        </button>
                                    )}
                                    <button onClick={handleRorReset} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors">
                                        Reset
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {caucusType === 'history' && (
                        <motion.div
                            key="history"
                            className="h-full overflow-y-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
                                {/* Caucus History */}
                                <div className="glass-panel-elevated p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-kamun-navy">📋 Caucus History</h3>
                                        {sessionLog.caucusHistory.length > 0 && (
                                            <button onClick={clearCaucusHistory} className="text-xs text-red-500 hover:text-red-700">
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    {sessionLog.caucusHistory.length === 0 ? (
                                        <p className="text-slate-400 text-center py-8">No caucuses recorded yet</p>
                                    ) : (
                                        <div className="space-y-3 max-h-80 overflow-y-auto">
                                            {[...sessionLog.caucusHistory].reverse().map((entry, i) => (
                                                <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${entry.type === 'moderated' ? 'bg-kamun-royal/10 text-kamun-royal' : 'bg-green-100 text-green-700'}`}>
                                                                {entry.type === 'moderated' ? 'Moderated' : 'Unmoderated'}
                                                            </span>
                                                            <p className="font-semibold text-kamun-navy mt-1">{entry.topic || 'Untitled Caucus'}</p>
                                                        </div>
                                                        <span className="text-xs text-slate-400">
                                                            {formatDuration(entry.duration)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* RoR History */}
                                <div className="glass-panel-elevated p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-kamun-navy">⚖️ Right of Reply History</h3>
                                        {sessionLog.rorHistory.length > 0 && (
                                            <button onClick={clearRoRHistory} className="text-xs text-red-500 hover:text-red-700">
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                    {sessionLog.rorHistory.length === 0 ? (
                                        <p className="text-slate-400 text-center py-8">No RoR recorded yet</p>
                                    ) : (
                                        <div className="space-y-2 max-h-80 overflow-y-auto">
                                            {[...sessionLog.rorHistory].reverse().map((entry, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                                                    <span className="font-semibold text-kamun-navy">{entry.country}</span>
                                                    <span className="text-xs text-amber-600">
                                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-sm text-slate-500">
                                            Total RoRs: <span className="font-bold text-amber-600">{sessionLog.rorHistory.length}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default CaucusManager

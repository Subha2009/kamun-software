import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDelegates } from '../../context/DelegateContext'
import { playBellSound, playDingSound } from '../../utils/audio'

function GSL() {
    const { delegates, markAsSpoken, resetSpokenStatus, stats } = useDelegates()
    const [speakersList, setSpeakersList] = useState([])
    const [currentSpeaker, setCurrentSpeaker] = useState(null)
    const [speakerTime, setSpeakerTime] = useState(90)
    const [timeLeft, setTimeLeft] = useState(speakerTime)
    const [isRunning, setIsRunning] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState('')
    const timerRef = useRef(null)
    const bellPlayedRef = useRef(false)

    const presentDelegates = delegates.filter(d => d.status !== 'absent')

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    // Play warning ding at 10 seconds
                    if (prev === 11) {
                        playDingSound()
                    }
                    return prev - 1
                })
            }, 1000)
        } else if (timeLeft === 0 && !bellPlayedRef.current) {
            setIsRunning(false)
            bellPlayedRef.current = true
            // Play bell sound when time is up
            playBellSound()

            // Mark as spoken and advance
            if (currentSpeaker) {
                markAsSpoken(currentSpeaker.country_name)
                if (speakersList.length > 0) {
                    setTimeout(() => handleYieldToChair(), 1500)
                }
            }
        }
        return () => clearInterval(timerRef.current)
    }, [isRunning, timeLeft, currentSpeaker, markAsSpoken])

    // Reset bell flag when time resets
    useEffect(() => {
        if (timeLeft > 0) {
            bellPlayedRef.current = false
        }
    }, [timeLeft])

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleAddSpeaker = () => {
        if (!selectedCountry) return
        const country = delegates.find(d => d.country_name === selectedCountry)
        if (country && !speakersList.find(s => s.country_name === selectedCountry)) {
            setSpeakersList(prev => [...prev, country])
            setSelectedCountry('')
        }
    }

    const handleStartSpeaker = () => {
        if (speakersList.length === 0 && !currentSpeaker) return
        if (!currentSpeaker && speakersList.length > 0) {
            setCurrentSpeaker(speakersList[0])
            setSpeakersList(prev => prev.slice(1))
        }
        setIsRunning(true)
    }

    const handlePause = () => setIsRunning(false)
    const handleReset = () => {
        setIsRunning(false)
        setTimeLeft(speakerTime)
        bellPlayedRef.current = false
    }

    const handleYieldToChair = useCallback(() => {
        setIsRunning(false)
        if (currentSpeaker) {
            markAsSpoken(currentSpeaker.country_name)
        }
        setTimeLeft(speakerTime)
        bellPlayedRef.current = false
        if (speakersList.length > 0) {
            setCurrentSpeaker(speakersList[0])
            setSpeakersList(prev => prev.slice(1))
        } else {
            setCurrentSpeaker(null)
        }
    }, [speakersList, speakerTime, currentSpeaker, markAsSpoken])

    const handleYieldToQuestions = () => {
        setIsRunning(false)
        if (currentSpeaker) {
            markAsSpoken(currentSpeaker.country_name)
        }
    }

    const removeSpeaker = (countryName) => {
        setSpeakersList(prev => prev.filter(s => s.country_name !== countryName))
    }

    const progressPercent = (timeLeft / speakerTime) * 100

    return (
        <div className="h-full flex flex-col">
            {/* Module Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-kamun-navy">General Speakers List</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {stats.spoken} of {stats.totalPresent} delegates have spoken
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={resetSpokenStatus}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 bg-slate-100 hover:bg-red-50 rounded-xl transition-colors"
                    >
                        Reset Spoken
                    </button>

                    <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-500">Time:</label>
                        <select
                            value={speakerTime}
                            onChange={(e) => {
                                const newTime = parseInt(e.target.value)
                                setSpeakerTime(newTime)
                                if (!isRunning) setTimeLeft(newTime)
                            }}
                            className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-kamun-navy text-sm focus:outline-none focus:border-kamun-royal"
                        >
                            <option value={60}>1:00</option>
                            <option value={90}>1:30</option>
                            <option value={120}>2:00</option>
                            <option value={180}>3:00</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timer Panel */}
                <motion.div
                    className="glass-panel-elevated p-6 flex flex-col"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    {/* Current Speaker */}
                    <div className="text-center mb-6">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-2 font-medium">Current Speaker</p>
                        {currentSpeaker ? (
                            <div className="flex flex-col items-center gap-2">
                                <img
                                    src={currentSpeaker.flag_url}
                                    alt={currentSpeaker.country_name}
                                    className="w-16 h-12 rounded shadow-lg"
                                />
                                <h3 className="text-2xl font-bold text-kamun-navy">{currentSpeaker.country_name}</h3>
                                {currentSpeaker.delegate_name && (
                                    <p className="text-sm text-slate-500 italic">{currentSpeaker.delegate_name}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">No speaker selected</p>
                        )}
                    </div>

                    {/* Timer Display */}
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                            <svg className="w-48 h-48 transform -rotate-90">
                                <circle cx="96" cy="96" r="88" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                                <motion.circle
                                    cx="96" cy="96" r="88" fill="none"
                                    stroke={timeLeft < 10 ? '#ef4444' : '#1e3a8a'}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={553}
                                    strokeDashoffset={553 - (553 * progressPercent) / 100}
                                    initial={false}
                                    animate={{ strokeDashoffset: 553 - (553 * progressPercent) / 100 }}
                                    transition={{ duration: 0.5 }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-5xl font-bold timer-display ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-kamun-navy'}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            {!isRunning ? (
                                <button
                                    onClick={handleStartSpeaker}
                                    disabled={!currentSpeaker && speakersList.length === 0}
                                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    {currentSpeaker ? 'Resume' : 'Start'}
                                </button>
                            ) : (
                                <button
                                    onClick={handlePause}
                                    className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl transition-colors shadow-md"
                                >
                                    Pause
                                </button>
                            )}
                            <button
                                onClick={handleReset}
                                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-xl transition-colors"
                            >
                                Reset
                            </button>
                        </div>

                        {/* Yield Buttons */}
                        {currentSpeaker && (
                            <div className="flex items-center gap-3 mt-4">
                                <button
                                    onClick={handleYieldToChair}
                                    className="px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200 font-medium"
                                >
                                    Yield to Chair
                                </button>
                                <button
                                    onClick={handleYieldToQuestions}
                                    className="px-4 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors border border-purple-200 font-medium"
                                >
                                    Yield to Questions
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Speakers Queue Panel */}
                <motion.div
                    className="glass-panel-elevated p-6 flex flex-col"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h3 className="text-lg font-bold text-kamun-navy mb-4">Speakers Queue</h3>

                    {/* Add Speaker */}
                    <div className="flex gap-2 mb-4">
                        <select
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="flex-1 px-3 py-2 bg-white border-2 border-slate-200 rounded-lg text-kamun-navy text-sm focus:outline-none focus:border-kamun-royal"
                        >
                            <option value="">Select a country...</option>
                            {presentDelegates.map(d => (
                                <option key={d.id} value={d.country_name}>
                                    {d.country_name} {d.has_spoken ? '✓' : ''}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAddSpeaker}
                            disabled={!selectedCountry}
                            className="btn-royal disabled:opacity-50"
                        >
                            Add
                        </button>
                    </div>

                    {/* Queue List */}
                    <div className="flex-1 overflow-auto space-y-2">
                        <AnimatePresence mode="popLayout">
                            {speakersList.length === 0 ? (
                                <p className="text-slate-400 text-center py-8">No speakers in queue</p>
                            ) : (
                                speakersList.map((speaker, index) => (
                                    <motion.div
                                        key={speaker.country_name}
                                        className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        layout
                                    >
                                        <span className="w-6 h-6 flex items-center justify-center bg-kamun-royal/10 rounded-full text-xs text-kamun-royal font-bold">
                                            {index + 1}
                                        </span>
                                        <img src={speaker.flag_url} alt={speaker.country_name} className="w-8 h-6 rounded shadow" />
                                        <div className="flex-1">
                                            <span className="text-kamun-navy font-medium">{speaker.country_name}</span>
                                            {speaker.has_spoken && (
                                                <span className="ml-2 text-xs text-green-600 font-medium">spoken</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeSpeaker(speaker.country_name)}
                                            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Queue Stats */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm text-slate-500">
                        <span>Speakers remaining: <strong className="text-kamun-navy">{speakersList.length}</strong></span>
                        <span>Est. time: <strong className="text-kamun-navy">{formatTime(speakersList.length * speakerTime)}</strong></span>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default GSL

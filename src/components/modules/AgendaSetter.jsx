import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../../context/SessionContext'
import { supabase, isSupabaseConfigured } from '../../config/supabaseClient'

function AgendaSetter() {
    const { currentSessionId, currentAgenda, setCurrentAgenda } = useSession()
    const [inputValue, setInputValue] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState(null)

    // Initialize input with current agenda
    useEffect(() => {
        setInputValue(currentAgenda || '')
    }, [currentAgenda])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const agenda = inputValue.trim()

        if (!agenda) return

        setIsSaving(true)
        setCurrentAgenda(agenda)

        // Save to Supabase for persistence
        if (isSupabaseConfigured() && currentSessionId) {
            try {
                const { error } = await supabase
                    .from('session_state')
                    .update({ current_agenda: agenda })
                    .eq('session_id', currentSessionId)

                if (!error) {
                    setLastSaved(new Date())
                }
            } catch (err) {
                console.error('Failed to save agenda:', err)
            }
        } else {
            // Local storage fallback
            localStorage.setItem('kamun_agenda', agenda)
            setLastSaved(new Date())
        }

        setIsSaving(false)
    }

    const handleClear = async () => {
        setInputValue('')
        setCurrentAgenda('')

        if (isSupabaseConfigured() && currentSessionId) {
            await supabase
                .from('session_state')
                .update({ current_agenda: '' })
                .eq('session_id', currentSessionId)
        } else {
            localStorage.removeItem('kamun_agenda')
        }
    }

    const SUGGESTIONS = [
        'The situation in the Middle East',
        'Climate Change and Sustainable Development',
        'Nuclear Non-Proliferation and Disarmament',
        'International Humanitarian Law',
        'Cybersecurity and Digital Governance',
        'Global Health Security',
    ]

    return (
        <div className="h-full flex flex-col">
            {/* Module Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-kamun-navy">Agenda Setter</h2>
                <p className="text-slate-500 text-sm mt-1">
                    Set the current topic of discussion • Changes are saved automatically
                </p>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center">
                <motion.div
                    className="w-full max-w-2xl glass-panel-elevated p-8"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {/* Current Agenda Display */}
                    {currentAgenda && (
                        <div className="mb-8">
                            <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-medium">Current Agenda</p>
                            <div className="p-6 royal-gradient-subtle rounded-xl border border-kamun-royal/10">
                                <h3 className="text-2xl font-bold text-kamun-navy text-center">{currentAgenda}</h3>
                            </div>
                            {lastSaved && (
                                <p className="text-xs text-green-600 mt-2 text-center">
                                    ✓ Saved {lastSaved.toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Agenda Input Form */}
                    <form onSubmit={handleSubmit}>
                        <label className="block mb-2">
                            <span className="text-sm text-slate-600 font-medium">
                                {currentAgenda ? 'Update Agenda' : 'Set New Agenda'}
                            </span>
                        </label>

                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Enter the agenda topic..."
                                className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-kamun-navy placeholder-slate-400 focus:outline-none focus:border-kamun-royal focus:ring-4 focus:ring-kamun-royal/10 transition-all font-medium"
                            />

                            <motion.button
                                type="submit"
                                disabled={isSaving || !inputValue.trim()}
                                className="btn-royal disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Set Agenda'
                                )}
                            </motion.button>
                        </div>
                    </form>

                    {/* Clear Button */}
                    {currentAgenda && (
                        <button
                            onClick={handleClear}
                            className="mt-4 text-sm text-slate-400 hover:text-red-500 transition-colors font-medium"
                        >
                            Clear current agenda
                        </button>
                    )}

                    {/* Quick Suggestions */}
                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-medium">Quick Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => setInputValue(suggestion)}
                                    className="px-3 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg hover:bg-kamun-royal/5 hover:text-kamun-royal transition-colors border border-slate-200 hover:border-kamun-royal/20 font-medium"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default AgendaSetter

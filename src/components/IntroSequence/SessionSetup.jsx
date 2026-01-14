import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../../context/SessionContext'

function SessionSetup() {
    const { createNewSession, error } = useSession()
    const [sessionName, setSessionName] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [localError, setLocalError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const name = sessionName.trim()

        if (!name) {
            setLocalError('Please enter a session name')
            return
        }

        setIsCreating(true)
        setLocalError(null)

        const result = await createNewSession(name)

        if (!result.success) {
            setLocalError(result.error || 'Failed to create session')
            setIsCreating(false)
        }
        // If successful, SessionContext will advance to 'admin' stage
    }

    const suggestedNames = [
        `MUN Session ${new Date().toLocaleDateString()}`,
        'Security Council',
        'General Assembly',
        'Human Rights Council',
        'ECOSOC Session',
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-8">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <motion.div
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl royal-gradient flex items-center justify-center shadow-xl"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                    >
                        <span className="text-3xl">🇺🇳</span>
                    </motion.div>
                    <h1 className="text-3xl font-bold text-kamun-navy">KA-MUN OS</h1>
                    <p className="text-slate-500 mt-2">Model UN Session Manager</p>
                </div>

                {/* Create Session Card */}
                <motion.div
                    className="glass-panel-elevated p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-xl font-bold text-kamun-navy mb-2">Create New Session</h2>
                    <p className="text-slate-500 text-sm mb-6">
                        Each session keeps track of its own attendance, votes, and resolutions.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label className="block mb-2">
                            <span className="text-sm font-medium text-slate-600">Session Name</span>
                        </label>
                        <input
                            type="text"
                            value={sessionName}
                            onChange={(e) => setSessionName(e.target.value)}
                            placeholder="e.g., Security Council Day 1"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-kamun-navy placeholder-slate-400 focus:outline-none focus:border-kamun-royal focus:ring-4 focus:ring-kamun-royal/10 transition-all font-medium"
                            autoFocus
                        />

                        {/* Error Display */}
                        {(localError || error) && (
                            <p className="mt-2 text-sm text-red-500">
                                {localError || error}
                            </p>
                        )}

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={isCreating}
                            className="w-full mt-4 btn-royal disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isCreating ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Session...
                                </>
                            ) : (
                                <>
                                    <span>Create Session</span>
                                    <span>→</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Quick Suggestions */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-medium">Quick Suggestions</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedNames.map((name) => (
                                <button
                                    key={name}
                                    onClick={() => setSessionName(name)}
                                    className="px-3 py-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg hover:bg-kamun-royal/5 hover:text-kamun-royal transition-colors border border-slate-200 hover:border-kamun-royal/20 font-medium"
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-400 mt-6">
                    Session data is securely stored in the cloud
                </p>
            </motion.div>
        </div>
    )
}

export default SessionSetup

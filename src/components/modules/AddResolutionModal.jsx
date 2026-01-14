import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function AddResolutionModal({ isOpen, onClose, onSubmit, delegates }) {
    const [code, setCode] = useState('')
    const [title, setTitle] = useState('')
    const [sponsors, setSponsors] = useState([])
    const [signatories, setSignatories] = useState([])

    const presentDelegates = delegates?.filter(d => d.status === 'present' || d.status === 'present_voting') || []

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!code.trim()) return

        onSubmit({
            code: code.trim(),
            title: title.trim(),
            sponsor: sponsors.join(', '),
            signatories: signatories,
        })

        // Reset form
        setCode('')
        setTitle('')
        setSponsors([])
        setSignatories([])
        onClose()
    }

    const toggleSponsor = (country) => {
        setSponsors(prev =>
            prev.includes(country)
                ? prev.filter(s => s !== country)
                : [...prev, country]
        )
        // Remove from signatories if added as sponsor
        setSignatories(prev => prev.filter(s => s !== country))
    }

    const toggleSignatory = (country) => {
        setSignatories(prev =>
            prev.includes(country)
                ? prev.filter(s => s !== country)
                : [...prev, country]
        )
        // Remove from sponsors if added as signatory
        setSponsors(prev => prev.filter(s => s !== country))
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-kamun-navy">Add New Resolution</h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Select sponsors and signatories from present delegates
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Code & Title */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Resolution Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="e.g., WP 1.1 or DR 2.3"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-kamun-royal text-kamun-navy font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Title (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Brief description"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-kamun-royal text-kamun-navy"
                                />
                            </div>
                        </div>

                        {/* Sponsors */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <span className="text-kamun-gold">★</span> Main Sponsors
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                Countries that authored the resolution. Their approval is needed for friendly amendments.
                            </p>
                            <div className="max-h-36 overflow-y-auto border-2 border-kamun-gold/30 rounded-xl p-3 bg-amber-50/30">
                                <div className="grid grid-cols-3 gap-2">
                                    {presentDelegates.map(d => {
                                        const isSelected = sponsors.includes(d.country_name)
                                        const isSignatory = signatories.includes(d.country_name)
                                        return (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => toggleSponsor(d.country_name)}
                                                disabled={isSignatory}
                                                className={`p-2 rounded-lg text-left text-sm transition-all flex items-center gap-2 ${isSelected
                                                        ? 'bg-kamun-gold text-white font-medium'
                                                        : isSignatory
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            : 'bg-white border border-slate-200 hover:border-kamun-gold hover:bg-amber-50'
                                                    }`}
                                            >
                                                <img src={d.flag_url} alt="" className="w-5 h-4 rounded shadow-sm" />
                                                <span className="truncate">{d.country_name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            {sponsors.length > 0 && (
                                <p className="text-xs text-kamun-gold mt-2 font-medium">
                                    ★ {sponsors.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Signatories */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <span className="text-blue-500">✎</span> Signatories
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                Countries that support bringing the resolution to the floor (not necessarily voting for it).
                            </p>
                            <div className="max-h-36 overflow-y-auto border-2 border-blue-200 rounded-xl p-3 bg-blue-50/30">
                                <div className="grid grid-cols-3 gap-2">
                                    {presentDelegates.map(d => {
                                        const isSelected = signatories.includes(d.country_name)
                                        const isSponsor = sponsors.includes(d.country_name)
                                        return (
                                            <button
                                                key={d.id}
                                                type="button"
                                                onClick={() => toggleSignatory(d.country_name)}
                                                disabled={isSponsor}
                                                className={`p-2 rounded-lg text-left text-sm transition-all flex items-center gap-2 ${isSelected
                                                        ? 'bg-blue-500 text-white font-medium'
                                                        : isSponsor
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            : 'bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50'
                                                    }`}
                                            >
                                                <img src={d.flag_url} alt="" className="w-5 h-4 rounded shadow-sm" />
                                                <span className="truncate">{d.country_name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            {signatories.length > 0 && (
                                <p className="text-xs text-blue-600 mt-2 font-medium">
                                    ✎ {signatories.join(', ')}
                                </p>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <h4 className="text-sm font-medium text-slate-700 mb-2">Summary</h4>
                            <div className="text-sm space-y-1">
                                <p><span className="text-slate-500">Sponsors:</span> <span className="font-medium">{sponsors.length > 0 ? sponsors.join(', ') : 'None selected'}</span></p>
                                <p><span className="text-slate-500">Signatories:</span> <span className="font-medium">{signatories.length > 0 ? signatories.join(', ') : 'None selected'}</span></p>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!code.trim()}
                                className="flex-1 px-6 py-3 bg-kamun-royal hover:bg-kamun-royal/90 disabled:bg-slate-300 text-white font-semibold rounded-xl transition-colors shadow-lg disabled:cursor-not-allowed"
                            >
                                Add Resolution
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

export default AddResolutionModal

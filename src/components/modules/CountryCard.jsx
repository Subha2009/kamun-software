import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDelegates } from '../../context/DelegateContext'

const STATUS_OPTIONS = [
    { value: 'absent', label: 'Absent', color: 'bg-slate-400', textColor: 'text-slate-600' },
    { value: 'present', label: 'Present', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { value: 'present_voting', label: 'Present & Voting', color: 'bg-kamun-gold', textColor: 'text-kamun-gold' },
]

const STATUS_STYLES = {
    absent: {
        card: 'bg-slate-50 border-slate-200 opacity-50',
        badge: 'bg-slate-400 text-white',
    },
    present: {
        card: 'bg-white border-blue-300 shadow-md',
        badge: 'bg-blue-500 text-white',
    },
    present_voting: {
        card: 'bg-gradient-to-br from-amber-50 to-yellow-50 border-kamun-gold shadow-lg gold-glow',
        badge: 'bg-kamun-gold text-white',
    },
}

function CountryCard({ delegate, showDelegateName = true }) {
    const { setDelegateStatus } = useDelegates()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)
    const styles = STATUS_STYLES[delegate.status]
    const currentOption = STATUS_OPTIONS.find(o => o.value === delegate.status)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleStatusChange = (newStatus) => {
        setDelegateStatus(delegate.country_name, newStatus)
        setIsOpen(false)
    }

    return (
        <motion.div
            ref={dropdownRef}
            className={`
        relative p-5 rounded-2xl border-2 card-hover
        transition-all duration-300
        flex flex-col items-center gap-3
        ${styles.card}
      `}
            variants={{
                hidden: { opacity: 0, y: 20, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
            }}
        >
            {/* GSL Spoken Badge */}
            {delegate.has_spoken && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full shadow-sm">
                    GSL ✓
                </div>
            )}

            {/* Flag */}
            <div className="relative w-20 h-14 rounded-lg overflow-hidden shadow-lg">
                <img
                    src={delegate.flag_url}
                    alt={delegate.country_name}
                    className={`w-full h-full object-cover ${delegate.status === 'absent' ? 'grayscale' : ''}`}
                    loading="lazy"
                />
                <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-lg" />
            </div>

            {/* Country Name */}
            <span className="text-sm font-bold text-kamun-navy text-center leading-tight">
                {delegate.country_name}
            </span>

            {/* Delegate Name */}
            {showDelegateName && delegate.delegate_name && (
                <span className="text-xs text-slate-500 text-center -mt-1 italic">
                    {delegate.delegate_name}
                </span>
            )}

            {/* Status Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between gap-2
          transition-all duration-200 hover:opacity-90
          ${styles.badge}
        `}
            >
                <span>{currentOption?.label}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                    >
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handleStatusChange(option.value)}
                                className={`
                  w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3
                  transition-colors hover:bg-slate-50
                  ${delegate.status === option.value ? 'bg-slate-50' : ''}
                  ${option.textColor}
                `}
                            >
                                <span className={`w-3 h-3 rounded-full ${option.color}`} />
                                <span>{option.label}</span>
                                {delegate.status === option.value && (
                                    <svg className="w-4 h-4 ml-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Gold Voting indicator */}
            {delegate.status === 'present_voting' && (
                <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-kamun-gold pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            )}
        </motion.div>
    )
}

export default CountryCard

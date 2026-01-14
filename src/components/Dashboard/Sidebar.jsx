import { motion } from 'framer-motion'

const ICONS = {
    rollcall: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    agenda: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    gsl: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
    ),
    caucus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    resolutions: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    voting: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
    ),
}

function Sidebar({ activeModule, setActiveModule, modules }) {
    return (
        <aside className="w-32 md:w-80 h-screen glass-panel-elevated m-4 mr-0 flex flex-col">
            {/* Logo Section */}
            <div className="p-4 md:p-8 border-b border-slate-100 flex-shrink-0">
                <div className="flex flex-col items-center">
                    <img
                        src="/kamun-logo.png"
                        alt="Krishnagar Academy Model United Nations"
                        className="h-28 md:h-44 w-auto object-contain"
                    />
                    <div className="hidden md:block text-center mt-5">
                        <p className="text-kamun-royal font-bold text-base tracking-wide">
                            KA-MUN
                        </p>
                        <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase">
                            Operating System
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation - scrollable if needed */}
            <nav className="flex-1 p-3 md:p-4 space-y-1.5 overflow-y-auto">
                {Object.entries(modules).map(([key, { name }]) => {
                    const isActive = activeModule === key

                    return (
                        <motion.button
                            key={key}
                            onClick={() => setActiveModule(key)}
                            className={`
                w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'royal-gradient text-white shadow-lg shadow-kamun-royal/20'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-kamun-navy'
                                }
              `}
                            whileHover={{ scale: isActive ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className={isActive ? 'text-white' : 'text-slate-400'}>
                                {ICONS[key]}
                            </span>
                            <span className="hidden md:block font-semibold text-sm">{name}</span>

                            {isActive && (
                                <motion.div
                                    className="hidden md:block ml-auto w-2 h-2 rounded-full bg-white/80"
                                    layoutId="activeIndicator"
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                        </motion.button>
                    )
                })}
            </nav>

            {/* Footer - fixed at bottom */}
            <div className="p-4 border-t border-slate-100 flex-shrink-0">
                <div className="hidden md:flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-xs text-slate-400 font-medium">Session Active</p>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar

import { motion } from 'framer-motion'
import { useSession } from '../../context/SessionContext'
import { useDelegates } from '../../context/DelegateContext'

function Header() {
    const { currentAgenda } = useSession()
    const { stats } = useDelegates()

    return (
        <header className="glass-panel-elevated m-4 mb-0 p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
                {/* Left: Agenda */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 live-pulse flex-shrink-0" />
                        <span className="text-xs text-red-500 font-bold uppercase tracking-widest flex-shrink-0">Live</span>
                        <div className="h-4 w-px bg-slate-200 flex-shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Agenda</p>
                            <h1 className="text-kamun-navy font-semibold truncate">
                                {currentAgenda || 'No agenda set'}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Right: Stats */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-center px-4 py-2 bg-slate-50 rounded-xl">
                        <p className="text-2xl font-bold text-kamun-navy">{stats.totalPresent}</p>
                        <p className="text-xs text-slate-400">Total Present</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                        <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                        <p className="text-xs text-slate-400">Can Abstain</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-kamun-gold/10 rounded-xl">
                        <p className="text-2xl font-bold text-kamun-gold">{stats.presentVoting}</p>
                        <p className="text-xs text-slate-400">Must Vote</p>
                    </div>
                    <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                        <p className="text-2xl font-bold text-blue-600">{stats.simpleMajority}</p>
                        <p className="text-xs text-slate-400">Majority</p>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header

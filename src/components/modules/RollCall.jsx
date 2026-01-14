import { motion } from 'framer-motion'
import { useDelegates } from '../../context/DelegateContext'
import CountryCard from './CountryCard'

function RollCall() {
    const { delegates, stats, resetAllDelegates, isLoaded } = useDelegates()

    return (
        <div className="h-full flex flex-col">
            {/* Module Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-kamun-navy">Roll Call</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Click on a country to cycle: <span className="text-slate-400">Absent</span> → <span className="text-blue-500">Present</span> → <span className="text-kamun-gold font-semibold">Present & Voting</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats badges */}
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200">
                            <span className="text-slate-500 text-sm">Absent: </span>
                            <span className="text-slate-700 font-bold">{stats.absent}</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200">
                            <span className="text-blue-500 text-sm">Present: </span>
                            <span className="text-blue-700 font-bold">{stats.present}</span>
                        </div>
                        <div className="px-4 py-2 rounded-xl gold-gradient text-kamun-navy shadow-md">
                            <span className="text-amber-800 text-sm">Voting: </span>
                            <span className="font-bold">{stats.presentVoting}</span>
                        </div>
                    </div>

                    {/* Reset button */}
                    <button
                        onClick={resetAllDelegates}
                        className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 rounded-xl transition-colors border border-slate-200 hover:border-red-200"
                    >
                        Reset All
                    </button>
                </div>
            </div>

            {/* Loading state */}
            {!isLoaded ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-kamun-gold/20 border-t-kamun-gold rounded-full animate-spin" />
                        <p className="text-slate-400">Loading delegates...</p>
                    </div>
                </div>
            ) : (
                <motion.div
                    className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 content-start overflow-auto pr-2"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: { staggerChildren: 0.03 },
                        },
                    }}
                >
                    {delegates.map((delegate) => (
                        <CountryCard key={delegate.id} delegate={delegate} />
                    ))}
                </motion.div>
            )}
        </div>
    )
}

export default RollCall

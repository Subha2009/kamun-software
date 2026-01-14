import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDelegates } from '../../context/DelegateContext'
import { useSession } from '../../context/SessionContext'
import { useResolutions } from '../../context/ResolutionContext'

function VotingSystem() {
    const { delegates, stats } = useDelegates()
    const { currentSessionId } = useSession()
    const { draftResolutions, updateResolutionStatus } = useResolutions()

    const [selectedResolutionId, setSelectedResolutionId] = useState('')
    const [isVotingOpen, setIsVotingOpen] = useState(false)
    const [localVotes, setLocalVotes] = useState({})
    const [votingComplete, setVotingComplete] = useState(false)
    const [lastResult, setLastResult] = useState(null)

    // Get selected resolution
    const selectedResolution = draftResolutions.find(r => r.id === selectedResolutionId)

    // Get eligible voters (present or present_voting)
    const eligibleVoters = useMemo(() =>
        delegates.filter(d => d.status === 'present' || d.status === 'present_voting'),
        [delegates]
    )

    // Calculate results - MAJORITY BASED ON (YES + NO) ONLY
    const voteResults = useMemo(() => {
        const yesCount = Object.values(localVotes).filter(v => v === 'yes').length
        const noCount = Object.values(localVotes).filter(v => v === 'no').length
        const abstainCount = Object.values(localVotes).filter(v => v === 'abstain').length
        const totalVoted = yesCount + noCount + abstainCount

        // Majority is calculated from Yes + No only (abstentions excluded)
        const substantiveVotes = yesCount + noCount
        const required = substantiveVotes > 0 ? Math.floor(substantiveVotes / 2) + 1 : 1

        return {
            yes: yesCount,
            no: noCount,
            abstain: abstainCount,
            totalVoted,
            totalEligible: eligibleVoters.length,
            substantiveVotes,
            required,
            passed: yesCount >= required && substantiveVotes > 0,
            allVoted: totalVoted === eligibleVoters.length,
        }
    }, [localVotes, eligibleVoters.length])

    const handleVote = (countryName, vote) => {
        setLocalVotes(prev => ({
            ...prev,
            [countryName]: vote,
        }))
    }

    const handleStartVoting = () => {
        if (!selectedResolutionId && draftResolutions.length === 0) {
            // Allow voting without a resolution selected
        }
        setLocalVotes({})
        setIsVotingOpen(true)
        setVotingComplete(false)
        setLastResult(null)
    }

    const handleEndVoting = async () => {
        setIsVotingOpen(false)
        setVotingComplete(true)

        const passed = voteResults.passed
        setLastResult({ passed, resolution: selectedResolution })

        // Update resolution status if one was selected
        if (selectedResolution) {
            await updateResolutionStatus(selectedResolution.id, passed ? 'passed' : 'failed')
            setSelectedResolutionId('') // Clear selection
        }
    }

    const handleResetVoting = () => {
        setLocalVotes({})
        setIsVotingOpen(false)
        setVotingComplete(false)
        setLastResult(null)
    }

    // Check if delegate can abstain (only "Present" can abstain, not "Present & Voting")
    const canAbstain = (delegate) => delegate.status === 'present'

    return (
        <div className="h-full flex flex-col">
            {/* Module Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-kamun-navy">Voting</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        "Present & Voting" delegates <span className="text-red-500 font-medium">cannot abstain</span>
                    </p>
                </div>

                {/* Resolution Selection & Controls */}
                <div className="flex items-center gap-3">
                    {/* Resolution Dropdown */}
                    <select
                        value={selectedResolutionId}
                        onChange={(e) => setSelectedResolutionId(e.target.value)}
                        disabled={isVotingOpen}
                        className="px-4 py-2 bg-white border-2 border-slate-200 rounded-xl text-kamun-navy font-medium focus:outline-none focus:border-kamun-royal disabled:opacity-50 min-w-[200px]"
                    >
                        <option value="">-- Select Resolution --</option>
                        {draftResolutions.map(res => (
                            <option key={res.id} value={res.id}>
                                {res.code}{res.title ? ` - ${res.title}` : ''}
                            </option>
                        ))}
                    </select>

                    {!isVotingOpen ? (
                        <button
                            onClick={handleStartVoting}
                            disabled={eligibleVoters.length === 0}
                            className="btn-royal disabled:opacity-50"
                        >
                            Open Voting
                        </button>
                    ) : (
                        <button
                            onClick={handleEndVoting}
                            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-md"
                        >
                            Close Voting
                        </button>
                    )}
                </div>
            </div>

            {/* No draft resolutions message */}
            {draftResolutions.length === 0 && !isVotingOpen && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-amber-700 text-sm">
                        ⚠️ No draft resolutions available. Add resolutions in the <strong>Resolution Tracker</strong> and move them to "Draft" status to vote on them.
                    </p>
                </div>
            )}

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Voting Results Panel */}
                <motion.div
                    className="glass-panel-elevated p-6 lg:col-span-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h3 className="text-lg font-bold text-kamun-navy mb-4">Results</h3>

                    {/* Current Resolution */}
                    {selectedResolution && (
                        <div className="mb-4 p-3 bg-kamun-royal/5 rounded-lg border border-kamun-royal/20">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Voting on</p>
                            <p className="text-kamun-navy font-bold">{selectedResolution.code}</p>
                            {selectedResolution.title && (
                                <p className="text-sm text-slate-600 mt-1">{selectedResolution.title}</p>
                            )}
                        </div>
                    )}

                    {/* Result Display */}
                    <div className="space-y-4 mb-6">
                        {/* Yes */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-green-600 font-semibold">Yes</span>
                                <span className="text-kamun-navy font-bold text-lg">{voteResults.yes}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-green-500"
                                    initial={false}
                                    animate={{
                                        width: voteResults.substantiveVotes > 0
                                            ? `${(voteResults.yes / voteResults.substantiveVotes) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* No */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-red-600 font-semibold">No</span>
                                <span className="text-kamun-navy font-bold text-lg">{voteResults.no}</span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-red-500"
                                    initial={false}
                                    animate={{
                                        width: voteResults.substantiveVotes > 0
                                            ? `${(voteResults.no / voteResults.substantiveVotes) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Abstain */}
                        <div>
                            <div className="flex justify-between mb-1">
                                <span className="text-slate-500 font-semibold">Abstain</span>
                                <span className="text-slate-600 font-bold">{voteResults.abstain}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-slate-400"
                                    initial={false}
                                    animate={{
                                        width: voteResults.totalEligible > 0
                                            ? `${(voteResults.abstain / voteResults.totalEligible) * 100}%`
                                            : '0%'
                                    }}
                                />
                            </div>
                            <p className="text-xs text-slate-400 mt-1 italic">Not counted in majority</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-slate-600">
                            <span>Voted</span>
                            <span className="font-bold text-kamun-navy">{voteResults.totalVoted} / {voteResults.totalEligible}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Substantive Votes (Yes + No)</span>
                            <span className="font-bold text-kamun-navy">{voteResults.substantiveVotes}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Required for Majority</span>
                            <span className="font-bold text-kamun-royal">{voteResults.required}</span>
                        </div>
                    </div>

                    {/* Result Banner - shows when voting is complete */}
                    <AnimatePresence>
                        {votingComplete && lastResult && (
                            <motion.div
                                className={`mt-6 p-4 rounded-xl text-center ${lastResult.passed
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                                    }`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                            >
                                <p className={`text-2xl font-bold ${lastResult.passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {lastResult.passed ? '✓ PASSED' : '✗ FAILED'}
                                </p>
                                {lastResult.resolution && (
                                    <p className="text-sm mt-2 text-slate-600">
                                        {lastResult.resolution.code} moved to {lastResult.passed ? 'Passed' : 'Failed'}
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Reset Button */}
                    {!isVotingOpen && voteResults.totalVoted > 0 && (
                        <button
                            onClick={handleResetVoting}
                            className="mt-4 w-full text-sm text-slate-500 hover:text-kamun-navy transition-colors font-medium"
                        >
                            Reset Voting
                        </button>
                    )}
                </motion.div>

                {/* Voting Grid */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-kamun-navy">
                            {isVotingOpen ? 'Cast Votes' : 'Delegates'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {eligibleVoters.length} eligible voters
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {eligibleVoters.map((delegate) => {
                                const currentVote = localVotes[delegate.country_name]
                                const canDelegate = canAbstain(delegate)

                                return (
                                    <motion.div
                                        key={delegate.id}
                                        className={`p-4 rounded-xl border-2 transition-all ${currentVote
                                            ? currentVote === 'yes'
                                                ? 'bg-green-50 border-green-300'
                                                : currentVote === 'no'
                                                    ? 'bg-red-50 border-red-300'
                                                    : 'bg-slate-50 border-slate-300'
                                            : 'bg-white border-slate-200'
                                            }`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <img
                                                src={delegate.flag_url}
                                                alt={delegate.country_name}
                                                className="w-8 h-6 rounded shadow"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-kamun-navy text-sm truncate">
                                                    {delegate.country_name}
                                                </p>
                                                {delegate.delegate_name && (
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {delegate.delegate_name}
                                                    </p>
                                                )}
                                            </div>
                                            {!canDelegate && (
                                                <span className="text-xs bg-kamun-gold/20 text-kamun-gold px-2 py-0.5 rounded-full font-medium">
                                                    P&V
                                                </span>
                                            )}
                                        </div>

                                        {isVotingOpen && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleVote(delegate.country_name, 'yes')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${currentVote === 'yes'
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        }`}
                                                >
                                                    Yes
                                                </button>
                                                <button
                                                    onClick={() => handleVote(delegate.country_name, 'no')}
                                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${currentVote === 'no'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        }`}
                                                >
                                                    No
                                                </button>
                                                {canDelegate && (
                                                    <button
                                                        onClick={() => handleVote(delegate.country_name, 'abstain')}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${currentVote === 'abstain'
                                                            ? 'bg-slate-500 text-white'
                                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                            }`}
                                                    >
                                                        Abstain
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {!isVotingOpen && currentVote && (
                                            <div className={`text-center py-2 rounded-lg font-semibold text-sm ${currentVote === 'yes'
                                                ? 'bg-green-100 text-green-700'
                                                : currentVote === 'no'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                }`}>
                                                {currentVote.toUpperCase()}
                                            </div>
                                        )}
                                    </motion.div>
                                )
                            })}
                        </div>

                        {eligibleVoters.length === 0 && (
                            <div className="h-full flex items-center justify-center text-center">
                                <div>
                                    <p className="text-slate-400 text-lg mb-2">No eligible voters</p>
                                    <p className="text-slate-500 text-sm">Mark delegates as "Present" or "Present & Voting" in Roll Call</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VotingSystem

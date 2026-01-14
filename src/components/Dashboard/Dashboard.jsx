import { useState } from 'react'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import RollCall from '../modules/RollCall'
import AgendaSetter from '../modules/AgendaSetter'
import GSL from '../modules/GSL'
import CaucusManager from '../modules/CaucusManager'
import VotingSystem from '../modules/VotingSystem'
import ResolutionTracker from '../modules/ResolutionTracker'

const MODULES = {
    rollcall: { name: 'Roll Call', component: RollCall },
    agenda: { name: 'Agenda', component: AgendaSetter },
    gsl: { name: 'Speakers List', component: GSL },
    caucus: { name: 'Caucus', component: CaucusManager },
    resolutions: { name: 'Resolutions', component: ResolutionTracker },
    voting: { name: 'Voting', component: VotingSystem },
}

function Dashboard() {
    const [activeModule, setActiveModule] = useState('rollcall')

    const ActiveComponent = MODULES[activeModule]?.component || RollCall

    return (
        <motion.div
            className="h-screen w-full flex bg-slate-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Fixed Sidebar */}
            <div className="flex-shrink-0">
                <Sidebar
                    activeModule={activeModule}
                    setActiveModule={setActiveModule}
                    modules={MODULES}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Fixed Header */}
                <div className="flex-shrink-0">
                    <Header />
                </div>

                {/* Scrollable Content Area */}
                <main className="flex-1 p-6 overflow-auto">
                    <motion.div
                        key={activeModule}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                    >
                        <ActiveComponent />
                    </motion.div>
                </main>
            </div>
        </motion.div>
    )
}

export default Dashboard

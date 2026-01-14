import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../../context/SessionContext'
import CurtainTransition from './CurtainTransition'

function SplashScreen() {
    const { advanceToVideo, currentAgenda } = useSession()
    const [showCurtain, setShowCurtain] = useState(false)
    const hasTransitionedRef = useRef(false)

    // Alt + S to advance to video
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.altKey && e.key.toLowerCase() === 's') {
                e.preventDefault()
                if (!showCurtain && !hasTransitionedRef.current) {
                    setShowCurtain(true)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showCurtain])

    const handleCurtainComplete = () => {
        if (!hasTransitionedRef.current) {
            hasTransitionedRef.current = true
            advanceToVideo()
        }
    }

    return (
        <>
            <motion.div
                className="min-h-screen w-full flex flex-col items-center justify-center bg-white relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8 }}
            >
                {/* Subtle background pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 2px 2px, #1e3a8a 1px, transparent 0)`,
                        backgroundSize: '40px 40px',
                    }} />
                </div>

                {/* Main content - centered */}
                <motion.div
                    className="relative z-10 flex flex-col items-center px-8 max-w-5xl"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 1.2,
                        ease: [0.22, 1, 0.36, 1],
                        delay: 0.2
                    }}
                >
                    {/* Logo */}
                    <motion.img
                        src="/kamun-logo.png"
                        alt="Krishnagar Academy Model United Nations"
                        className="w-auto max-w-[70vw] h-auto max-h-[50vh] object-contain"
                        initial={{ filter: 'blur(20px)', scale: 0.9 }}
                        animate={{ filter: 'blur(0px)', scale: 1 }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                    />

                    {/* Agenda Display - Beautiful formatting */}
                    {currentAgenda && (
                        <motion.div
                            className="text-center mt-16 max-w-4xl"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 1 }}
                        >
                            {/* Decorative line */}
                            <motion.div
                                className="flex items-center justify-center gap-4 mb-8"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                            >
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-kamun-royal/30" />
                                <span className="text-xs text-kamun-royal/50 uppercase tracking-[0.4em] font-medium">
                                    Agenda
                                </span>
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-kamun-royal/30" />
                            </motion.div>

                            {/* Agenda Text */}
                            <motion.h1
                                className="text-3xl md:text-4xl lg:text-5xl font-light text-kamun-navy leading-tight tracking-wide"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.4, duration: 1 }}
                            >
                                "{currentAgenda}"
                            </motion.h1>

                            {/* Decorative bottom element */}
                            <motion.div
                                className="mt-8 flex justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.8, duration: 0.8 }}
                            >
                                <div className="w-12 h-1 bg-gradient-to-r from-kamun-royal via-kamun-blue to-kamun-royal rounded-full" />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* If no agenda, show subtitle */}
                    {!currentAgenda && (
                        <motion.div
                            className="text-center mt-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <p className="text-kamun-royal/40 text-sm tracking-widest uppercase">
                                Krishnagar Academy Model United Nations
                            </p>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>

            {/* Curtain Transition Overlay */}
            {showCurtain && (
                <CurtainTransition onComplete={handleCurtainComplete} />
            )}
        </>
    )
}

export default SplashScreen

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CORRECT_PASSWORD = 'MUNofClass2025-26'

function PasswordGate({ onUnlock }) {
    const [password, setPassword] = useState('')
    const [displayText, setDisplayText] = useState('')
    const [isShaking, setIsShaking] = useState(false)
    const [isUnlocking, setIsUnlocking] = useState(false)
    const [showError, setShowError] = useState(false)
    const [cursorVisible, setCursorVisible] = useState(true)
    const inputRef = useRef(null)

    // Blinking cursor effect
    useEffect(() => {
        const interval = setInterval(() => {
            setCursorVisible(v => !v)
        }, 530)
        return () => clearInterval(interval)
    }, [])

    // High-tech character scramble effect on typing
    useEffect(() => {
        if (password.length === 0) {
            setDisplayText('')
            return
        }

        // Show scrambled characters briefly then dots
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`0123456789ABCDEF'
        let iterations = 0
        const maxIterations = 3

        const scramble = setInterval(() => {
            iterations++
            if (iterations >= maxIterations) {
                clearInterval(scramble)
                setDisplayText('●'.repeat(password.length))
            } else {
                setDisplayText(
                    password.split('').map((_, i) =>
                        i === password.length - 1
                            ? chars[Math.floor(Math.random() * chars.length)]
                            : '●'
                    ).join('')
                )
            }
        }, 50)

        return () => clearInterval(scramble)
    }, [password])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    const handleChange = (e) => {
        setShowError(false)
        setPassword(e.target.value)
    }

    const handleSubmit = () => {
        if (password === CORRECT_PASSWORD) {
            setIsUnlocking(true)
            // Store in sessionStorage so refresh doesn't require re-auth
            sessionStorage.setItem('kamun_authenticated', 'true')
            setTimeout(() => {
                onUnlock()
            }, 1500)
        } else {
            setIsShaking(true)
            setShowError(true)
            setTimeout(() => setIsShaking(false), 500)
        }
    }

    const focusInput = () => {
        inputRef.current?.focus()
    }

    return (
        <motion.div
            className="fixed inset-0 bg-slate-950 flex items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
        >
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                        animation: 'grid-move 20s linear infinite',
                    }}
                />
            </div>

            {/* Glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <AnimatePresence mode="wait">
                {isUnlocking ? (
                    <motion.div
                        key="unlocking"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        className="text-center"
                    >
                        <motion.div
                            className="w-24 h-24 mx-auto mb-6 rounded-full border-4 border-green-500 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                        >
                            <motion.svg
                                className="w-12 h-12 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </motion.svg>
                        </motion.div>
                        <motion.p
                            className="text-green-400 text-xl font-mono tracking-widest"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            ACCESS GRANTED
                        </motion.p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="password-form"
                        className="relative z-10 text-center"
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Logo */}
                        <motion.img
                            src="/kamun-logo.png"
                            alt="KA-MUN"
                            className="h-32 mx-auto mb-8 drop-shadow-2xl"
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        />

                        {/* Title */}
                        <motion.h1
                            className="text-3xl font-bold text-white mb-2 tracking-wider"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            SECURE ACCESS
                        </motion.h1>
                        <motion.p
                            className="text-slate-500 text-sm mb-8 font-mono"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            AUTHORIZATION REQUIRED
                        </motion.p>

                        {/* Password Input Container */}
                        <motion.div
                            className="relative w-80 mx-auto"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onClick={focusInput}
                        >
                            <div className={`
                                relative bg-slate-900/80 border-2 rounded-xl px-6 py-4 cursor-text
                                backdrop-blur-sm transition-all duration-300
                                ${showError ? 'border-red-500 shadow-red-500/20 shadow-lg' : 'border-slate-700 hover:border-blue-500/50'}
                            `}>
                                {/* Hidden input */}
                                <input
                                    ref={inputRef}
                                    type="password"
                                    value={password}
                                    onChange={handleChange}
                                    onKeyDown={handleKeyDown}
                                    className="absolute opacity-0 w-full h-full top-0 left-0"
                                    autoFocus
                                />

                                {/* Display area */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <span className="text-blue-400 font-mono text-sm mr-2">{'>'}</span>
                                        <span className="text-blue-300 font-mono text-lg tracking-widest">
                                            {displayText || (
                                                <span className="text-slate-600">Enter password...</span>
                                            )}
                                        </span>
                                        <span className={`w-2 h-5 bg-blue-400 ml-1 ${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
                                    </div>
                                </div>

                                {/* Scan line effect */}
                                <motion.div
                                    className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl"
                                    initial={false}
                                >
                                    <motion.div
                                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50"
                                        animate={{ top: ['0%', '100%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    />
                                </motion.div>
                            </div>

                            {/* Error message */}
                            <AnimatePresence>
                                {showError && (
                                    <motion.p
                                        className="text-red-400 text-sm mt-3 font-mono"
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        ⚠ ACCESS DENIED - INVALID CREDENTIALS
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Submit button */}
                        <motion.button
                            onClick={handleSubmit}
                            className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl
                                       hover:from-blue-500 hover:to-cyan-500 transition-all duration-300
                                       shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40
                                       border border-blue-400/30"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                AUTHENTICATE
                            </span>
                        </motion.button>

                        {/* Decorative elements */}
                        <motion.div
                            className="mt-8 flex items-center justify-center gap-4 text-slate-600 text-xs font-mono"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                SYSTEM ONLINE
                            </span>
                            <span>|</span>
                            <span>ENCRYPTED CONNECTION</span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSS for grid animation */}
            <style>{`
                @keyframes grid-move {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
            `}</style>
        </motion.div>
    )
}

export default PasswordGate

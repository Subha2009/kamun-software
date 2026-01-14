import { motion } from 'framer-motion'

function CurtainTransition({ onComplete }) {
    return (
        <motion.div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            {/* Left Curtain */}
            <motion.div
                className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-slate-950 via-kamun-navy to-kamun-navy"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                transition={{
                    duration: 0.5,
                    ease: [0.76, 0, 0.24, 1],
                }}
                onAnimationComplete={() => {
                    // Immediately trigger the next stage
                    onComplete()
                }}
            >
                {/* Sheen effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Right Curtain */}
            <motion.div
                className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-950 via-kamun-navy to-kamun-navy"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                transition={{
                    duration: 0.5,
                    ease: [0.76, 0, 0.24, 1],
                }}
            >
                {/* Sheen effect */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-l from-transparent via-white/5 to-transparent"
                    initial={{ x: '100%' }}
                    animate={{ x: '-200%' }}
                    transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Center gold line with glow */}
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full"
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.35 }}
            >
                <div className="w-full h-full bg-gradient-to-b from-transparent via-kamun-gold/50 to-transparent" />
            </motion.div>

            {/* Logo - centered, appears after curtains close */}
            <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
            >
                <img
                    src="/kamun-logo.png"
                    alt="KA-MUN"
                    className="h-24 w-auto drop-shadow-2xl"
                />
            </motion.div>

            {/* Top accent line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-kamun-gold/40 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            />

            {/* Bottom accent line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-kamun-gold/40 to-transparent"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
            />
        </motion.div>
    )
}

export default CurtainTransition

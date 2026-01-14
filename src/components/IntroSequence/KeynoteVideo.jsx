import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import YouTube from 'react-youtube'
import { useSession } from '../../context/SessionContext'
import CurtainTransition from './CurtainTransition'

function KeynoteVideo() {
    const { advanceToDashboard } = useSession()
    const [isReady, setIsReady] = useState(false)
    const [showCurtain, setShowCurtain] = useState(false)
    const containerRef = useRef(null)
    const hasTransitionedRef = useRef(false) // Prevent double navigation

    const videoId = 'tU80rfP6p7M'

    // Focus the container so keyboard events work
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus()
        }
    }, [])

    // Handle keyboard shortcuts - Alt+S or ESC to skip
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.altKey && e.key.toLowerCase() === 's') || e.key === 'Escape') {
                e.preventDefault()
                if (!showCurtain && !hasTransitionedRef.current) {
                    setShowCurtain(true)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown, true)
        document.addEventListener('keydown', handleKeyDown, true)

        return () => {
            window.removeEventListener('keydown', handleKeyDown, true)
            document.removeEventListener('keydown', handleKeyDown, true)
        }
    }, [showCurtain])

    const handleCurtainComplete = () => {
        // Only advance once
        if (!hasTransitionedRef.current) {
            hasTransitionedRef.current = true
            advanceToDashboard()
        }
    }

    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            fs: 0,
            iv_load_policy: 3,
        },
    }

    const handleReady = () => setIsReady(true)
    const handleEnd = () => {
        if (!showCurtain) {
            setShowCurtain(true)
        }
    }

    return (
        <>
            <motion.div
                ref={containerRef}
                tabIndex={0}
                className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden outline-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Video Container */}
                <div className="absolute inset-0">
                    <YouTube
                        videoId={videoId}
                        opts={opts}
                        onReady={handleReady}
                        onEnd={handleEnd}
                        className="w-full h-full"
                        iframeClassName="w-full h-full"
                    />
                </div>

                {/* Loading overlay */}
                {!isReady && (
                    <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                            <svg className="w-12 h-12 text-white/30" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            {/* Curtain Transition */}
            {showCurtain && (
                <CurtainTransition onComplete={handleCurtainComplete} variant="dashboard" />
            )}
        </>
    )
}

export default KeynoteVideo

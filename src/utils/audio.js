// Timer bell sound using Web Audio API
export function playBellSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()

        // Create oscillators for a bell-like sound
        const createBellTone = (frequency, startTime, duration, volume = 0.3) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(frequency, startTime)

            // Bell envelope - quick attack, long slow decay
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.02)
            // Longer exponential decay for "ringing" effect
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.start(startTime)
            oscillator.stop(startTime + duration)
        }

        const now = audioContext.currentTime

        // Play high-pitched chime chord (C6 Major equivalent but higher)
        // C6, E6, G6, C7
        createBellTone(1046.5, now, 4.0, 0.2)      // C6
        createBellTone(1318.5, now + 0.1, 4.0, 0.2) // E6
        createBellTone(2093.0, now + 0.2, 5.0, 0.15) // C7 (High ringing top note)

        // Cleanup after sound finishes
        setTimeout(() => {
            if (audioContext.state !== 'closed') {
                audioContext.close()
            }
        }, 5500)

    } catch (err) {
        console.log('Could not play bell sound:', err)
    }
}

// Shorter single ding for warnings
export function playDingSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = 'triangle' // Slightly sharper than sine
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime) // A5 (Higher than before)

        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1.0)

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start()
        oscillator.stop(audioContext.currentTime + 1.0)

        setTimeout(() => {
            if (audioContext.state !== 'closed') {
                audioContext.close()
            }
        }, 1200)
    } catch (err) {
        console.log('Could not play ding:', err)
    }
}

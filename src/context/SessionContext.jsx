import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'

const SessionContext = createContext(null)

// Initial list of delegates (used when creating a new session)
const INITIAL_DELEGATES = [
    { country_name: 'United States', flag_url: 'https://flagcdn.com/w80/us.png' },
    { country_name: 'United Kingdom', flag_url: 'https://flagcdn.com/w80/gb.png' },
    { country_name: 'France', flag_url: 'https://flagcdn.com/w80/fr.png' },
    { country_name: 'Russia', flag_url: 'https://flagcdn.com/w80/ru.png' },
    { country_name: 'China', flag_url: 'https://flagcdn.com/w80/cn.png' },
    { country_name: 'Germany', flag_url: 'https://flagcdn.com/w80/de.png' },
    { country_name: 'Japan', flag_url: 'https://flagcdn.com/w80/jp.png' },
    { country_name: 'India', flag_url: 'https://flagcdn.com/w80/in.png' },
    { country_name: 'Brazil', flag_url: 'https://flagcdn.com/w80/br.png' },
    { country_name: 'South Africa', flag_url: 'https://flagcdn.com/w80/za.png' },
    { country_name: 'Australia', flag_url: 'https://flagcdn.com/w80/au.png' },
    { country_name: 'Canada', flag_url: 'https://flagcdn.com/w80/ca.png' },
    { country_name: 'Italy', flag_url: 'https://flagcdn.com/w80/it.png' },
    { country_name: 'Spain', flag_url: 'https://flagcdn.com/w80/es.png' },
    { country_name: 'Mexico', flag_url: 'https://flagcdn.com/w80/mx.png' },
    { country_name: 'South Korea', flag_url: 'https://flagcdn.com/w80/kr.png' },
    { country_name: 'Indonesia', flag_url: 'https://flagcdn.com/w80/id.png' },
    { country_name: 'Saudi Arabia', flag_url: 'https://flagcdn.com/w80/sa.png' },
    { country_name: 'Turkey', flag_url: 'https://flagcdn.com/w80/tr.png' },
    { country_name: 'Argentina', flag_url: 'https://flagcdn.com/w80/ar.png' },
    { country_name: 'Nigeria', flag_url: 'https://flagcdn.com/w80/ng.png' },
    { country_name: 'Egypt', flag_url: 'https://flagcdn.com/w80/eg.png' },
    { country_name: 'Pakistan', flag_url: 'https://flagcdn.com/w80/pk.png' },
    { country_name: 'Bangladesh', flag_url: 'https://flagcdn.com/w80/bd.png' },
]

// Stages: loading -> needsSession -> admin -> splash -> video -> dashboard
export function SessionProvider({ children }) {
    const [stage, setStage] = useState('loading')
    const [currentSessionId, setCurrentSessionId] = useState(null)
    const [currentSessionName, setCurrentSessionName] = useState('')
    const [currentAgenda, setCurrentAgenda] = useState('')
    const [currentSpeaker, setCurrentSpeaker] = useState(null)
    const [isInitializing, setIsInitializing] = useState(true)
    const [error, setError] = useState(null)
    const [allSessions, setAllSessions] = useState([])

    // Fetch all sessions for sidebar
    const fetchAllSessions = useCallback(async () => {
        if (!isSupabaseConfigured()) return

        const { data, error } = await supabase
            .from('sessions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50)

        if (!error && data) {
            setAllSessions(data)
        }
    }, [])

    // Check for active session on mount
    useEffect(() => {
        const initSession = async () => {
            // Check if already authenticated
            const isAuthenticated = sessionStorage.getItem('kamun_authenticated') === 'true'

            if (!isAuthenticated) {
                setStage('locked')
                setIsInitializing(false)
                return
            }

            if (!isSupabaseConfigured()) {
                // Demo mode - skip session management
                console.log('🎭 Demo mode - skipping session management')
                setStage('admin')
                setIsInitializing(false)
                return
            }

            try {
                // Fetch all sessions for sidebar
                await fetchAllSessions()

                // Look for an active session
                const { data: activeSession, error: fetchError } = await supabase
                    .from('sessions')
                    .select('*')
                    .eq('is_active', true)
                    .limit(1)
                    .maybeSingle()

                if (fetchError) throw fetchError

                if (activeSession) {
                    // Found an active session
                    setCurrentSessionId(activeSession.id)
                    setCurrentSessionName(activeSession.name)
                    console.log('✅ Loaded session:', activeSession.name)

                    // Load the session's agenda
                    const { data: stateData } = await supabase
                        .from('session_state')
                        .select('current_agenda')
                        .eq('session_id', activeSession.id)
                        .maybeSingle()

                    if (stateData?.current_agenda) {
                        setCurrentAgenda(stateData.current_agenda)
                    }

                    setStage('admin')
                } else {
                    // No active session - prompt to create one
                    setStage('needsSession')
                }
            } catch (err) {
                console.error('Failed to initialize session:', err)
                setError(err.message)
                setStage('needsSession')
            } finally {
                setIsInitializing(false)
            }
        }

        initSession()
    }, [fetchAllSessions])

    // Create a new session
    const createNewSession = useCallback(async (sessionName) => {
        if (!isSupabaseConfigured()) {
            // Demo mode
            setCurrentSessionId('demo-session')
            setCurrentSessionName(sessionName)
            setStage('admin')
            return { success: true }
        }

        try {
            setError(null)

            // 1. Set all existing sessions to inactive
            await supabase
                .from('sessions')
                .update({ is_active: false })
                .eq('is_active', true)

            // 2. Create new session
            const { data: newSession, error: createError } = await supabase
                .from('sessions')
                .insert({
                    name: sessionName,
                    is_active: true,
                })
                .select()
                .single()

            if (createError) throw createError

            // 3. Create session_state entry (fresh start)
            await supabase
                .from('session_state')
                .insert({
                    session_id: newSession.id,
                    current_agenda: '',
                })

            // 4. Initialize attendance with empty delegate names (each session is independent)
            const attendanceRows = INITIAL_DELEGATES.map(d => ({
                session_id: newSession.id,
                country_name: d.country_name,
                flag_url: d.flag_url,
                status: 'absent',
                delegate_name: '',
                has_spoken: false,
            }))

            await supabase.from('attendance').insert(attendanceRows)

            // 5. Update state
            setCurrentSessionId(newSession.id)
            setCurrentSessionName(newSession.name)
            setCurrentAgenda('')
            setStage('admin')

            console.log('✅ Created new session:', newSession.name)

            // 6. Refresh sessions list
            await fetchAllSessions()

            return { success: true }

        } catch (err) {
            console.error('Failed to create session:', err)
            setError(err.message)
            return { success: false, error: err.message }
        }
    }, [fetchAllSessions])

    // Switch to an existing session
    const switchSession = useCallback(async (sessionId) => {
        if (!isSupabaseConfigured()) return { success: false }

        try {
            // 1. Set all sessions to inactive
            await supabase
                .from('sessions')
                .update({ is_active: false })
                .eq('is_active', true)

            // 2. Set selected session to active
            const { data: session, error } = await supabase
                .from('sessions')
                .update({ is_active: true })
                .eq('id', sessionId)
                .select()
                .single()

            if (error) throw error

            // 3. Load session state
            const { data: stateData } = await supabase
                .from('session_state')
                .select('current_agenda')
                .eq('session_id', sessionId)
                .maybeSingle()

            setCurrentSessionId(session.id)
            setCurrentSessionName(session.name)
            setCurrentAgenda(stateData?.current_agenda || '')
            setStage('admin')

            return { success: true }
        } catch (err) {
            console.error('Failed to switch session:', err)
            return { success: false, error: err.message }
        }
    }, [])

    // End current session (doesn't delete, just deactivates)
    const endSession = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            setCurrentSessionId(null)
            setCurrentSessionName('')
            setStage('needsSession')
            return
        }

        try {
            if (currentSessionId) {
                await supabase
                    .from('sessions')
                    .update({ is_active: false })
                    .eq('id', currentSessionId)
            }

            setCurrentSessionId(null)
            setCurrentSessionName('')
            setCurrentAgenda('')
            setStage('needsSession')
        } catch (err) {
            console.error('Failed to end session:', err)
        }
    }, [currentSessionId])

    // Delete a session permanently
    const deleteSession = useCallback(async (sessionId) => {
        if (!isSupabaseConfigured()) return { success: false }

        try {
            // Delete the session (cascade will remove related data)
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionId)

            if (error) throw error

            // Refresh the sessions list
            await fetchAllSessions()

            // If we deleted the current session, just clear state (stay on admin page)
            if (sessionId === currentSessionId) {
                setCurrentSessionId(null)
                setCurrentSessionName('')
                setCurrentAgenda('')
                // Don't redirect - stay on admin screen
            }

            console.log('🗑️ Deleted session:', sessionId)
            return { success: true }
        } catch (err) {
            console.error('Failed to delete session:', err)
            return { success: false, error: err.message }
        }
    }, [currentSessionId, fetchAllSessions])

    // Stage advancement functions
    const advanceToSplash = useCallback(() => setStage('splash'), [])
    const advanceToVideo = useCallback(() => setStage('video'), [])
    const advanceToDashboard = useCallback(() => setStage('dashboard'), [])

    const resetSession = useCallback(() => {
        setStage('admin')
        setCurrentAgenda('')
        setCurrentSpeaker(null)
    }, [])

    // Unlock after password authentication
    const unlock = useCallback(async () => {
        setIsInitializing(true)

        if (!isSupabaseConfigured()) {
            setStage('admin')
            setIsInitializing(false)
            return
        }

        try {
            await fetchAllSessions()

            const { data: activeSession } = await supabase
                .from('sessions')
                .select('*')
                .eq('is_active', true)
                .limit(1)
                .maybeSingle()

            if (activeSession) {
                setCurrentSessionId(activeSession.id)
                setCurrentSessionName(activeSession.name)

                const { data: stateData } = await supabase
                    .from('session_state')
                    .select('current_agenda')
                    .eq('session_id', activeSession.id)
                    .maybeSingle()

                if (stateData?.current_agenda) {
                    setCurrentAgenda(stateData.current_agenda)
                }
                setStage('admin')
            } else {
                setStage('needsSession')
            }
        } catch (err) {
            console.error('Failed to initialize after unlock:', err)
            setStage('needsSession')
        } finally {
            setIsInitializing(false)
        }
    }, [fetchAllSessions])

    const value = {
        // Session data
        currentSessionId,
        currentSessionName,
        isInitializing,
        error,
        allSessions,

        // Session actions
        createNewSession,
        switchSession,
        endSession,
        deleteSession,
        fetchAllSessions,

        // Stage management
        stage,
        setStage,
        advanceToSplash,
        advanceToVideo,
        advanceToDashboard,
        resetSession,
        unlock,

        // Agenda/Speaker
        currentAgenda,
        setCurrentAgenda,
        currentSpeaker,
        setCurrentSpeaker,
    }

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    )
}

export function useSession() {
    const context = useContext(SessionContext)
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider')
    }
    return context
}

export default SessionContext

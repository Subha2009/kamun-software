import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'

/**
 * Hook for managing session storage with Supabase backend
 * Falls back to localStorage if Supabase is not configured
 */
export function useSessionStorage() {
    const [sessions, setSessions] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    // Load sessions on mount
    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        setIsLoading(true)

        if (isSupabaseConfigured()) {
            try {
                const { data, error } = await supabase
                    .from('saved_sessions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(30)

                if (error) throw error

                // Parse JSON data fields
                const parsed = (data || []).map(s => ({
                    id: s.id,
                    name: s.name,
                    timestamp: s.created_at,
                    delegates: s.delegates_data || [],
                    agenda: s.agenda || '',
                    resolutions: s.resolutions_data || {},
                    speakersList: s.speakers_data || [],
                }))

                setSessions(parsed)
                // Also save to localStorage as backup
                localStorage.setItem('kamun_saved_sessions', JSON.stringify(parsed))
            } catch (err) {
                console.error('Failed to load from Supabase:', err)
                // Fallback to localStorage
                loadFromLocalStorage()
            }
        } else {
            loadFromLocalStorage()
        }

        setIsLoading(false)
    }

    const loadFromLocalStorage = () => {
        try {
            const saved = localStorage.getItem('kamun_saved_sessions')
            if (saved) {
                setSessions(JSON.parse(saved))
            }
        } catch (err) {
            console.error('Failed to load from localStorage:', err)
        }
    }

    const saveSession = useCallback(async (sessionData) => {
        setIsSaving(true)

        const newSession = {
            id: Date.now().toString(),
            name: sessionData.name || `Session ${new Date().toLocaleString()}`,
            timestamp: new Date().toISOString(),
            delegates: sessionData.delegates || [],
            agenda: sessionData.agenda || '',
            resolutions: sessionData.resolutions || {},
            speakersList: sessionData.speakersList || [],
        }

        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase
                    .from('saved_sessions')
                    .insert({
                        id: newSession.id,
                        name: newSession.name,
                        agenda: newSession.agenda,
                        delegates_data: newSession.delegates,
                        resolutions_data: newSession.resolutions,
                        speakers_data: newSession.speakersList,
                        created_at: newSession.timestamp,
                    })

                if (error) throw error

                // Refresh from server
                await loadSessions()
            } catch (err) {
                console.error('Failed to save to Supabase:', err)
                // Fallback to localStorage
                saveToLocalStorage(newSession)
            }
        } else {
            saveToLocalStorage(newSession)
        }

        setIsSaving(false)
        return newSession
    }, [])

    const saveToLocalStorage = (newSession) => {
        const updated = [newSession, ...sessions].slice(0, 30)
        setSessions(updated)
        localStorage.setItem('kamun_saved_sessions', JSON.stringify(updated))
    }

    const deleteSession = useCallback(async (sessionId) => {
        if (isSupabaseConfigured()) {
            try {
                const { error } = await supabase
                    .from('saved_sessions')
                    .delete()
                    .eq('id', sessionId)

                if (error) throw error
                await loadSessions()
            } catch (err) {
                console.error('Failed to delete from Supabase:', err)
                deleteFromLocalStorage(sessionId)
            }
        } else {
            deleteFromLocalStorage(sessionId)
        }
    }, [sessions])

    const deleteFromLocalStorage = (sessionId) => {
        const updated = sessions.filter(s => s.id !== sessionId)
        setSessions(updated)
        localStorage.setItem('kamun_saved_sessions', JSON.stringify(updated))
    }

    return {
        sessions,
        isLoading,
        isSaving,
        saveSession,
        deleteSession,
        loadSessions,
        isSupabaseConnected: isSupabaseConfigured(),
    }
}

export default useSessionStorage

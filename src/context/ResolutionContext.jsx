import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'
import { useSession } from './SessionContext'

const ResolutionContext = createContext(null)

export function ResolutionProvider({ children }) {
    const { currentSessionId } = useSession()
    const [resolutions, setResolutions] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load resolutions from Supabase when session changes
    useEffect(() => {
        if (!currentSessionId) {
            setResolutions([])
            setIsLoaded(true)
            return
        }

        const loadResolutions = async () => {
            if (!isSupabaseConfigured()) {
                const saved = localStorage.getItem(`kamun_resolutions_${currentSessionId}`)
                if (saved) {
                    try {
                        setResolutions(JSON.parse(saved))
                    } catch (e) {
                        console.error('Failed to load resolutions:', e)
                        setResolutions([])
                    }
                } else {
                    setResolutions([])
                }
                setIsLoaded(true)
                return
            }

            const { data, error } = await supabase
                .from('resolutions')
                .select('*')
                .eq('session_id', currentSessionId)
                .order('position', { ascending: true })

            if (error) {
                console.error('Failed to load resolutions:', error)
            } else {
                setResolutions(data || [])
            }
            setIsLoaded(true)
        }

        loadResolutions()
    }, [currentSessionId])

    // Save to localStorage in demo mode
    useEffect(() => {
        if (!isSupabaseConfigured() && isLoaded && currentSessionId) {
            localStorage.setItem(`kamun_resolutions_${currentSessionId}`, JSON.stringify(resolutions))
        }
    }, [resolutions, isLoaded, currentSessionId])

    // Add a resolution
    const addResolution = useCallback(async (code, title = '', sponsor = '', signatories = []) => {
        if (!currentSessionId) return null

        const newResolution = {
            id: crypto.randomUUID(),
            session_id: currentSessionId,
            code,
            title,
            sponsor,
            signatories,
            status: 'working_paper',
            position: resolutions.length,
        }

        if (!isSupabaseConfigured()) {
            setResolutions(prev => [...prev, newResolution])
            return newResolution
        }

        // Only insert fields that exist in Supabase table
        const supabaseData = {
            id: newResolution.id,
            session_id: currentSessionId,
            code,
            title,
            sponsor,
            status: 'working_paper',
            position: resolutions.length,
        }

        const { data, error } = await supabase
            .from('resolutions')
            .insert(supabaseData)
            .select()
            .single()

        if (error) {
            console.error('Failed to add resolution:', error)
            setResolutions(prev => [...prev, newResolution])
            return newResolution
        }

        setResolutions(prev => [...prev, { ...data, signatories: signatories }])
        return data
    }, [currentSessionId, resolutions.length])

    // Update resolution status
    const updateResolutionStatus = useCallback(async (resolutionId, newStatus) => {
        if (!isSupabaseConfigured()) {
            setResolutions(prev =>
                prev.map(r => r.id === resolutionId ? { ...r, status: newStatus } : r)
            )
            return
        }

        const { error } = await supabase
            .from('resolutions')
            .update({ status: newStatus })
            .eq('id', resolutionId)

        if (error) {
            console.error('Failed to update resolution status:', error)
            return
        }

        setResolutions(prev =>
            prev.map(r => r.id === resolutionId ? { ...r, status: newStatus } : r)
        )
    }, [])

    // Delete resolution
    const deleteResolution = useCallback(async (resolutionId) => {
        if (!isSupabaseConfigured()) {
            setResolutions(prev => prev.filter(r => r.id !== resolutionId))
            return
        }

        const { error } = await supabase
            .from('resolutions')
            .delete()
            .eq('id', resolutionId)

        if (error) {
            console.error('Failed to delete resolution:', error)
            return
        }

        setResolutions(prev => prev.filter(r => r.id !== resolutionId))
    }, [])

    // Get resolutions by status
    const getByStatus = useCallback((status) => {
        return resolutions.filter(r => r.status === status)
    }, [resolutions])

    // Get draft resolutions (votable)
    const draftResolutions = resolutions.filter(r => r.status === 'draft')

    const value = {
        resolutions,
        isLoaded,
        addResolution,
        updateResolutionStatus,
        deleteResolution,
        getByStatus,
        draftResolutions,
    }

    return (
        <ResolutionContext.Provider value={value}>
            {children}
        </ResolutionContext.Provider>
    )
}

export function useResolutions() {
    const context = useContext(ResolutionContext)
    if (!context) {
        throw new Error('useResolutions must be used within a ResolutionProvider')
    }
    return context
}

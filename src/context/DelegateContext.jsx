import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'
import { useSession } from './SessionContext'

const DelegateContext = createContext(null)

// Fallback delegate list for demo mode
const INITIAL_DELEGATES = [
    { id: '1', country_name: 'United States', flag_url: 'https://flagcdn.com/w80/us.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '2', country_name: 'United Kingdom', flag_url: 'https://flagcdn.com/w80/gb.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '3', country_name: 'France', flag_url: 'https://flagcdn.com/w80/fr.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '4', country_name: 'Russia', flag_url: 'https://flagcdn.com/w80/ru.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '5', country_name: 'China', flag_url: 'https://flagcdn.com/w80/cn.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '6', country_name: 'Germany', flag_url: 'https://flagcdn.com/w80/de.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '7', country_name: 'Japan', flag_url: 'https://flagcdn.com/w80/jp.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '8', country_name: 'India', flag_url: 'https://flagcdn.com/w80/in.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '9', country_name: 'Brazil', flag_url: 'https://flagcdn.com/w80/br.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '10', country_name: 'South Africa', flag_url: 'https://flagcdn.com/w80/za.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '11', country_name: 'Australia', flag_url: 'https://flagcdn.com/w80/au.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '12', country_name: 'Canada', flag_url: 'https://flagcdn.com/w80/ca.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '13', country_name: 'Italy', flag_url: 'https://flagcdn.com/w80/it.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '14', country_name: 'Spain', flag_url: 'https://flagcdn.com/w80/es.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '15', country_name: 'Mexico', flag_url: 'https://flagcdn.com/w80/mx.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '16', country_name: 'South Korea', flag_url: 'https://flagcdn.com/w80/kr.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '17', country_name: 'Indonesia', flag_url: 'https://flagcdn.com/w80/id.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '18', country_name: 'Saudi Arabia', flag_url: 'https://flagcdn.com/w80/sa.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '19', country_name: 'Turkey', flag_url: 'https://flagcdn.com/w80/tr.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '20', country_name: 'Argentina', flag_url: 'https://flagcdn.com/w80/ar.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '21', country_name: 'Nigeria', flag_url: 'https://flagcdn.com/w80/ng.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '22', country_name: 'Egypt', flag_url: 'https://flagcdn.com/w80/eg.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '23', country_name: 'Pakistan', flag_url: 'https://flagcdn.com/w80/pk.png', status: 'absent', delegate_name: '', has_spoken: false },
    { id: '24', country_name: 'Bangladesh', flag_url: 'https://flagcdn.com/w80/bd.png', status: 'absent', delegate_name: '', has_spoken: false },
]

const STATUS_CYCLE = {
    absent: 'present',
    present: 'present_voting',
    present_voting: 'absent',
}

export function DelegateProvider({ children }) {
    const { currentSessionId } = useSession()
    const [delegates, setDelegates] = useState([])
    const [isLoaded, setIsLoaded] = useState(false)
    const delegateNameDebounceRef = useRef({}) // Debounce timer for delegate name updates

    // Load delegates from Supabase when session changes
    useEffect(() => {
        // Demo mode (Supabase not configured) - always load from localStorage
        if (!isSupabaseConfigured()) {
            const saved = localStorage.getItem('kamun_delegates')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved)
                    const withSpoken = parsed.map(d => ({ ...d, has_spoken: d.has_spoken || false }))
                    setDelegates(withSpoken)
                } catch (e) {
                    console.error('Failed to parse saved delegates:', e)
                    setDelegates(INITIAL_DELEGATES)
                }
            } else {
                setDelegates(INITIAL_DELEGATES)
            }
            setIsLoaded(true)
            return
        }

        // Supabase mode - need a session ID
        if (!currentSessionId) {
            setDelegates([])
            setIsLoaded(true)
            return
        }

        // Fetch from Supabase
        const fetchDelegates = async () => {
            const { data, error } = await supabase
                .from('attendance')
                .select('*')
                .eq('session_id', currentSessionId)
                .order('country_name')

            if (error) {
                console.error('Failed to fetch delegates:', error)
                return
            }

            setDelegates(data || [])
            setIsLoaded(true)
        }

        fetchDelegates()

        // Subscribe to realtime changes
        const channel = supabase
            .channel(`attendance_${currentSessionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'attendance',
                    filter: `session_id=eq.${currentSessionId}`,
                },
                (payload) => {
                    if (payload.eventType === 'UPDATE') {
                        setDelegates(prev =>
                            prev.map(d => d.id === payload.new.id ? payload.new : d)
                        )
                    } else if (payload.eventType === 'INSERT') {
                        setDelegates(prev => [...prev, payload.new])
                    } else if (payload.eventType === 'DELETE') {
                        setDelegates(prev => prev.filter(d => d.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentSessionId])

    // Save to localStorage in demo mode
    useEffect(() => {
        if (!isSupabaseConfigured() && isLoaded && delegates.length > 0) {
            localStorage.setItem('kamun_delegates', JSON.stringify(delegates))
        }
    }, [delegates, isLoaded])

    // Update delegate in Supabase
    const updateDelegate = useCallback(async (countryName, updates) => {
        if (!currentSessionId) return

        if (!isSupabaseConfigured()) {
            setDelegates(prev =>
                prev.map(d => d.country_name === countryName ? { ...d, ...updates } : d)
            )
            return
        }

        const { error } = await supabase
            .from('attendance')
            .update(updates)
            .eq('session_id', currentSessionId)
            .eq('country_name', countryName)

        if (error) {
            console.error('Failed to update delegate:', error)
        }
    }, [currentSessionId])

    const toggleStatus = useCallback((countryName) => {
        const delegate = delegates.find(d => d.country_name === countryName)
        if (!delegate) return

        const newStatus = STATUS_CYCLE[delegate.status]
        updateDelegate(countryName, { status: newStatus })

        // Optimistic update for local state
        setDelegates(prev =>
            prev.map(d => d.country_name === countryName ? { ...d, status: newStatus } : d)
        )
    }, [delegates, updateDelegate])

    const setDelegateStatus = useCallback((countryName, status) => {
        updateDelegate(countryName, { status })
        setDelegates(prev =>
            prev.map(d => d.country_name === countryName ? { ...d, status } : d)
        )
    }, [updateDelegate])

    const setDelegateName = useCallback((countryName, delegateName) => {
        // Update local state immediately for smooth typing
        setDelegates(prev =>
            prev.map(d => d.country_name === countryName ? { ...d, delegate_name: delegateName } : d)
        )

        // Debounce the Supabase update to prevent lag
        if (delegateNameDebounceRef.current[countryName]) {
            clearTimeout(delegateNameDebounceRef.current[countryName])
        }

        delegateNameDebounceRef.current[countryName] = setTimeout(() => {
            updateDelegate(countryName, { delegate_name: delegateName })
        }, 500)
    }, [updateDelegate])

    const markAsSpoken = useCallback((countryName) => {
        updateDelegate(countryName, { has_spoken: true })
        setDelegates(prev =>
            prev.map(d => d.country_name === countryName ? { ...d, has_spoken: true } : d)
        )
    }, [updateDelegate])

    const resetSpokenStatus = useCallback(async () => {
        if (!currentSessionId) return

        if (!isSupabaseConfigured()) {
            setDelegates(prev => prev.map(d => ({ ...d, has_spoken: false })))
            return
        }

        await supabase
            .from('attendance')
            .update({ has_spoken: false })
            .eq('session_id', currentSessionId)

        setDelegates(prev => prev.map(d => ({ ...d, has_spoken: false })))
    }, [currentSessionId])

    const resetAllDelegates = useCallback(async () => {
        if (!currentSessionId) return

        if (!isSupabaseConfigured()) {
            setDelegates(prev => prev.map(d => ({ ...d, status: 'absent' })))
            return
        }

        await supabase
            .from('attendance')
            .update({ status: 'absent' })
            .eq('session_id', currentSessionId)

        setDelegates(prev => prev.map(d => ({ ...d, status: 'absent' })))
    }, [currentSessionId])

    const stats = useMemo(() => {
        const present = delegates.filter(d => d.status === 'present').length
        const presentVoting = delegates.filter(d => d.status === 'present_voting').length
        const absent = delegates.filter(d => d.status === 'absent').length
        const spoken = delegates.filter(d => d.has_spoken).length
        const totalPresent = present + presentVoting

        return {
            total: delegates.length,
            present,
            presentVoting,
            absent,
            totalPresent,
            // Majority is based on ALL present delegates (both "Present" and "Present & Voting")
            simpleMajority: totalPresent > 0 ? Math.floor(totalPresent / 2) + 1 : 0,
            twoThirdsMajority: totalPresent > 0 ? Math.ceil((totalPresent * 2) / 3) : 0,
            spoken,
        }
    }, [delegates])

    const value = {
        delegates,
        setDelegates,
        toggleStatus,
        setDelegateStatus,
        setDelegateName,
        markAsSpoken,
        resetSpokenStatus,
        resetAllDelegates,
        stats,
        isLoaded,
        presentVotingDelegates: delegates.filter(d => d.status === 'present_voting'),
    }

    return (
        <DelegateContext.Provider value={value}>
            {children}
        </DelegateContext.Provider>
    )
}

export function useDelegates() {
    const context = useContext(DelegateContext)
    if (!context) {
        throw new Error('useDelegates must be used within a DelegateProvider')
    }
    return context
}

export default DelegateContext

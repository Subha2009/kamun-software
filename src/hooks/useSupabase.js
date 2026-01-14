import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../config/supabaseClient'

/**
 * Custom hook for real-time Supabase sync with session filtering
 * Falls back to local state if Supabase is not configured
 */
export function useSupabase(table, sessionId, initialData = []) {
    const [data, setData] = useState(initialData)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isConnected, setIsConnected] = useState(false)

    // Fetch initial data filtered by session_id
    useEffect(() => {
        if (!sessionId) {
            setLoading(false)
            return
        }

        if (!isSupabaseConfigured()) {
            console.log('Supabase not configured, using local state')
            setLoading(false)
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                const { data: tableData, error: fetchError } = await supabase
                    .from(table)
                    .select('*')
                    .eq('session_id', sessionId)
                    .order('created_at', { ascending: true })

                if (fetchError) throw fetchError

                setData(tableData || [])
                setIsConnected(true)
            } catch (err) {
                console.error('Supabase fetch error:', err)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [table, sessionId])

    // Set up real-time subscription with session filter
    useEffect(() => {
        if (!isSupabaseConfigured() || !sessionId) return

        const channel = supabase
            .channel(`${table}_${sessionId}_changes`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: table,
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    console.log('Real-time update:', payload)

                    if (payload.eventType === 'INSERT') {
                        setData(prev => [...prev, payload.new])
                    } else if (payload.eventType === 'UPDATE') {
                        setData(prev =>
                            prev.map(item =>
                                item.id === payload.new.id ? payload.new : item
                            )
                        )
                    } else if (payload.eventType === 'DELETE') {
                        setData(prev => prev.filter(item => item.id !== payload.old.id))
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [table, sessionId])

    // CRUD operations - all include session_id
    const insert = useCallback(async (newItem) => {
        if (!sessionId) return { data: null, error: 'No session' }

        if (!isSupabaseConfigured()) {
            const localItem = {
                ...newItem,
                id: crypto.randomUUID(),
                session_id: sessionId,
                created_at: new Date().toISOString()
            }
            setData(prev => [...prev, localItem])
            return { data: localItem, error: null }
        }

        const { data: inserted, error: insertError } = await supabase
            .from(table)
            .insert({ ...newItem, session_id: sessionId })
            .select()
            .single()

        if (insertError) {
            setError(insertError.message)
            return { data: null, error: insertError }
        }

        return { data: inserted, error: null }
    }, [table, sessionId])

    const update = useCallback(async (id, updates) => {
        if (!isSupabaseConfigured()) {
            setData(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
            return { data: { id, ...updates }, error: null }
        }

        const { data: updated, error: updateError } = await supabase
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (updateError) {
            setError(updateError.message)
            return { data: null, error: updateError }
        }

        return { data: updated, error: null }
    }, [table])

    const remove = useCallback(async (id) => {
        if (!isSupabaseConfigured()) {
            setData(prev => prev.filter(item => item.id !== id))
            return { error: null }
        }

        const { error: deleteError } = await supabase
            .from(table)
            .delete()
            .eq('id', id)

        if (deleteError) {
            setError(deleteError.message)
            return { error: deleteError }
        }

        return { error: null }
    }, [table])

    return {
        data,
        setData,
        loading,
        error,
        isConnected,
        insert,
        update,
        remove,
    }
}

/**
 * Hook for real-time voting with session filtering
 */
export function useVoting(resolutionId, sessionId) {
    const [votes, setVotes] = useState({ yes: 0, no: 0, abstain: 0 })
    const [voters, setVoters] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!resolutionId || !sessionId) {
            setLoading(false)
            return
        }

        if (!isSupabaseConfigured()) {
            setLoading(false)
            return
        }

        const fetchVotes = async () => {
            const { data, error } = await supabase
                .from('votes')
                .select('*')
                .eq('session_id', sessionId)
                .eq('resolution_id', resolutionId)

            if (!error && data) {
                const voteCounts = data.reduce(
                    (acc, vote) => {
                        acc[vote.vote] = (acc[vote.vote] || 0) + 1
                        return acc
                    },
                    { yes: 0, no: 0, abstain: 0 }
                )
                setVotes(voteCounts)
                setVoters(data)
            }
            setLoading(false)
        }

        fetchVotes()

        // Real-time subscription for votes filtered by session
        const channel = supabase
            .channel(`votes_${sessionId}_${resolutionId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'votes',
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    // Only re-fetch if it's for our resolution
                    if (payload.new?.resolution_id === resolutionId ||
                        payload.old?.resolution_id === resolutionId) {
                        fetchVotes()
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [resolutionId, sessionId])

    const castVote = useCallback(async (countryName, voteValue) => {
        if (!sessionId) return { error: 'No session' }

        if (!isSupabaseConfigured()) {
            // Local voting simulation
            setVotes(prev => ({
                ...prev,
                [voteValue]: prev[voteValue] + 1,
            }))
            setVoters(prev => [...prev, { country_name: countryName, vote: voteValue }])
            return { error: null }
        }

        const { error } = await supabase
            .from('votes')
            .upsert(
                {
                    session_id: sessionId,
                    resolution_id: resolutionId,
                    country_name: countryName,
                    vote: voteValue
                },
                { onConflict: 'session_id,resolution_id,country_name' }
            )

        return { error }
    }, [resolutionId, sessionId])

    const resetVotes = useCallback(async () => {
        setVotes({ yes: 0, no: 0, abstain: 0 })
        setVoters([])

        if (!isSupabaseConfigured() || !sessionId) return { error: null }

        const { error } = await supabase
            .from('votes')
            .delete()
            .eq('session_id', sessionId)
            .eq('resolution_id', resolutionId)

        return { error }
    }, [resolutionId, sessionId])

    return {
        votes,
        voters,
        loading,
        castVote,
        resetVotes,
        totalVotes: votes.yes + votes.no + votes.abstain,
    }
}

export default useSupabase

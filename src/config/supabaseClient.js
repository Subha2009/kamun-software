import { createClient } from '@supabase/supabase-js'

// Get env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate URL is actually a valid https URL
const isValidUrl = (url) => {
    if (!url || typeof url !== 'string') return false
    try {
        const parsed = new URL(url)
        return parsed.protocol === 'https:'
    } catch {
        return false
    }
}

// Check if Supabase is configured with valid credentials
export const isSupabaseConfigured = () => {
    return isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey.length > 20
}

// Create a mock client for demo mode
const createMockClient = () => {
    const chainable = () => {
        const obj = {
            select: () => obj,
            insert: () => obj,
            update: () => obj,
            delete: () => obj,
            upsert: () => obj,
            eq: () => obj,
            neq: () => obj,
            order: () => obj,
            limit: () => obj,
            single: () => Promise.resolve({ data: null, error: null }),
            then: (resolve) => Promise.resolve({ data: [], error: null }).then(resolve),
            catch: (reject) => Promise.resolve({ data: [], error: null }).catch(reject),
        }
        return obj
    }

    return {
        from: chainable,
        channel: () => ({
            on: function () { return this },
            subscribe: () => { },
        }),
        removeChannel: () => { },
    }
}

// Create the client
let supabase

try {
    if (isSupabaseConfigured()) {
        supabase = createClient(supabaseUrl, supabaseAnonKey)
        console.log('✅ Connected to Supabase')
    } else {
        supabase = createMockClient()
        console.log('🎭 Running in demo mode (localStorage only)')
    }
} catch (err) {
    console.error('Supabase init error:', err)
    supabase = createMockClient()
}

export { supabase }

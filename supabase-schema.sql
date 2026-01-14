-- KA-MUN OS Supabase Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- SAVED SESSIONS TABLE (Main storage)
-- ===========================================
CREATE TABLE IF NOT EXISTS saved_sessions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    agenda TEXT,
    delegates_data JSONB DEFAULT '[]'::jsonb,
    resolutions_data JSONB DEFAULT '{}'::jsonb,
    speakers_data JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_saved_sessions_created_at ON saved_sessions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (adjust for production)
CREATE POLICY "Allow all operations on saved_sessions" ON saved_sessions
    FOR ALL USING (true) WITH CHECK (true);

-- ===========================================
-- TRIGGER: Auto-update updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_saved_sessions_updated_at ON saved_sessions;
CREATE TRIGGER update_saved_sessions_updated_at
    BEFORE UPDATE ON saved_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ENABLE REALTIME (Optional)
-- ===========================================
ALTER PUBLICATION supabase_realtime ADD TABLE saved_sessions;

-- ===========================================
-- INSTRUCTIONS
-- ===========================================
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Go to Table Editor and verify 'saved_sessions' table exists
-- 3. Go to Database > Replication and enable realtime for saved_sessions
-- 4. Copy your Supabase URL and anon key to .env file:
--    VITE_SUPABASE_URL=https://your-project.supabase.co
--    VITE_SUPABASE_ANON_KEY=your-anon-key

-- That's it! Sessions will now persist to Supabase.

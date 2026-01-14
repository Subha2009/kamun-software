-- ===========================================
-- KA-MUN OS Session ID Migration
-- Run this in your Supabase SQL Editor
-- ===========================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- 1. CREATE SESSIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sessions" ON sessions
    FOR ALL USING (true) WITH CHECK (true);

-- Index for faster active session lookup
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(is_active) WHERE is_active = true;

-- ===========================================
-- 2. CREATE ATTENDANCE TABLE (Delegates)
-- ===========================================
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    country_name TEXT NOT NULL,
    flag_url TEXT,
    status TEXT DEFAULT 'absent' CHECK (status IN ('absent', 'present', 'present_voting')),
    delegate_name TEXT DEFAULT '',
    has_spoken BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, country_name)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on attendance" ON attendance
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);

-- ===========================================
-- 3. CREATE SPEAKERS_LIST TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS speakers_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    country_name TEXT NOT NULL,
    flag_url TEXT,
    delegate_name TEXT DEFAULT '',
    position INTEGER DEFAULT 0,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE speakers_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on speakers_list" ON speakers_list
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_speakers_session ON speakers_list(session_id);

-- ===========================================
-- 4. CREATE VOTES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    resolution_id TEXT NOT NULL,
    country_name TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('yes', 'no', 'abstain')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, resolution_id, country_name)
);

ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on votes" ON votes
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_votes_session ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_votes_resolution ON votes(session_id, resolution_id);

-- ===========================================
-- 5. CREATE RESOLUTIONS TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS resolutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT DEFAULT '',
    status TEXT DEFAULT 'working_paper' CHECK (status IN ('working_paper', 'draft', 'passed', 'failed')),
    position INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on resolutions" ON resolutions
    FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_resolutions_session ON resolutions(session_id);

-- ===========================================
-- 6. CREATE SESSION_STATE TABLE (for agenda, etc.)
-- ===========================================
CREATE TABLE IF NOT EXISTS session_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    current_agenda TEXT DEFAULT '',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id)
);

ALTER TABLE session_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on session_state" ON session_state
    FOR ALL USING (true) WITH CHECK (true);

-- ===========================================
-- 7. AUTO-UPDATE TRIGGER FOR updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
DROP TRIGGER IF EXISTS update_attendance_updated_at ON attendance;
CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_resolutions_updated_at ON resolutions;
CREATE TRIGGER update_resolutions_updated_at
    BEFORE UPDATE ON resolutions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_session_state_updated_at ON session_state;
CREATE TRIGGER update_session_state_updated_at
    BEFORE UPDATE ON session_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- 8. ENABLE REALTIME
-- ===========================================
-- Note: Run these one at a time if you get errors
ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE speakers_list;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;
ALTER PUBLICATION supabase_realtime ADD TABLE resolutions;
ALTER PUBLICATION supabase_realtime ADD TABLE session_state;

-- ===========================================
-- DONE! 
-- ===========================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Verify tables exist in Table Editor
-- 3. Enable Realtime in Database > Replication
-- ===========================================

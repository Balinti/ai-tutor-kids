-- Add trial_id columns for guest trial mode
-- This allows tracking trial sessions and linking them to accounts on signup

ALTER TABLE children ADD COLUMN IF NOT EXISTS trial_id text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS trial_id text;

-- Index for quick trial lookup
CREATE INDEX IF NOT EXISTS idx_children_trial_id ON children(trial_id) WHERE trial_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sessions_trial_id ON sessions(trial_id) WHERE trial_id IS NOT NULL;

-- Create demo parent profile for trial users (if not exists)
INSERT INTO profiles (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000000', 'demo@wordproblemcoach.app', 'Demo Parent', 'parent')
ON CONFLICT (id) DO NOTHING;

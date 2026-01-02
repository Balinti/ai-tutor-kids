-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1) profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('parent', 'admin')),
  email text NOT NULL,
  full_name text,
  stripe_customer_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2) children
CREATE TABLE children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade int NOT NULL CHECK (grade BETWEEN 5 AND 8),
  kid_pin_hash text,
  timezone text NOT NULL DEFAULT 'America/New_York',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_children_parent_id ON children(parent_id);

-- 3) subscriptions
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('free', 'pro', 'pro_plus')),
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')),
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_parent_id ON subscriptions(parent_id);

-- 4) standards
CREATE TABLE standards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  grade int NOT NULL CHECK (grade BETWEEN 5 AND 8),
  domain text NOT NULL,
  cluster text NOT NULL,
  description text NOT NULL
);

CREATE INDEX idx_standards_grade ON standards(grade);
CREATE INDEX idx_standards_code ON standards(code);

-- 5) problems
CREATE TABLE problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade int NOT NULL CHECK (grade BETWEEN 5 AND 8),
  standard_id uuid NOT NULL REFERENCES standards(id),
  difficulty int NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  prompt text NOT NULL,
  answer_type text NOT NULL CHECK (answer_type IN ('number', 'integer', 'decimal', 'fraction', 'percent', 'mixed', 'multi')),
  canonical_answer text NOT NULL,
  canonical_equation text,
  solution_steps jsonb NOT NULL,
  misconception_tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  source text NOT NULL DEFAULT 'vetted_bank',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_problems_grade ON problems(grade);
CREATE INDEX idx_problems_standard_id ON problems(standard_id);
CREATE INDEX idx_problems_active ON problems(active);
CREATE INDEX idx_problems_difficulty ON problems(difficulty);

-- 6) problem_choices (for represent step UI)
CREATE TABLE problem_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id uuid NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
  representation_type text NOT NULL CHECK (representation_type IN ('equation', 'table', 'diagram', 'ratio', 'words')),
  expected text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_problem_choices_problem_id ON problem_choices(problem_id);

-- 7) sessions
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  plan_at_time text NOT NULL CHECK (plan_at_time IN ('free', 'pro', 'pro_plus')),
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  target_problem_count int NOT NULL DEFAULT 8,
  completed_problem_count int NOT NULL DEFAULT 0,
  total_time_seconds int NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_child_id ON sessions(child_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);

-- 8) session_problems
CREATE TABLE session_problems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  problem_id uuid NOT NULL REFERENCES problems(id),
  position int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, position)
);

CREATE INDEX idx_session_problems_session_id ON session_problems(session_id);

-- 9) attempts
CREATE TABLE attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  problem_id uuid NOT NULL REFERENCES problems(id),
  standard_id uuid NOT NULL REFERENCES standards(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  time_spent_seconds int NOT NULL DEFAULT 0,
  hints_used int NOT NULL DEFAULT 0,
  final_answer text,
  final_equation text,
  is_correct boolean,
  verification_details jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_attempts_child_id ON attempts(child_id);
CREATE INDEX idx_attempts_session_id ON attempts(session_id);
CREATE INDEX idx_attempts_problem_id ON attempts(problem_id);
CREATE INDEX idx_attempts_standard_id ON attempts(standard_id);
CREATE INDEX idx_attempts_submitted_at ON attempts(submitted_at);

-- 10) attempt_steps
CREATE TABLE attempt_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
  step text NOT NULL CHECK (step IN ('read', 'represent', 'solve', 'check')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_attempt_steps_attempt_id ON attempt_steps(attempt_id);

-- 11) mastery
CREATE TABLE mastery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  standard_id uuid NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  attempts_count int NOT NULL DEFAULT 0,
  correct_count int NOT NULL DEFAULT 0,
  accuracy_rolling numeric(5,2) NOT NULL DEFAULT 0.00,
  avg_time_seconds numeric(10,2) NOT NULL DEFAULT 0.00,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_id, standard_id)
);

CREATE INDEX idx_mastery_child_id ON mastery(child_id);

-- 12) weekly_reports
CREATE TABLE weekly_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  accuracy numeric(5,2) NOT NULL,
  avg_time_seconds numeric(10,2) NOT NULL,
  problems_completed int NOT NULL,
  practice_days int NOT NULL,
  missed_days int NOT NULL,
  improved_standards jsonb NOT NULL DEFAULT '[]'::jsonb,
  stuck_standards jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_week_focus jsonb NOT NULL DEFAULT '[]'::jsonb,
  email_sent_at timestamptz,
  UNIQUE (child_id, week_start, week_end)
);

CREATE INDEX idx_weekly_reports_parent_id ON weekly_reports(parent_id);
CREATE INDEX idx_weekly_reports_child_id ON weekly_reports(child_id);

-- 13) audit_events
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_profile_id uuid REFERENCES profiles(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_actor ON audit_events(actor_profile_id);
CREATE INDEX idx_audit_events_type ON audit_events(event_type);
CREATE INDEX idx_audit_events_created_at ON audit_events(created_at);

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Children: parents can manage their own children
CREATE POLICY "Parents can read their children" ON children
  FOR SELECT USING (auth.uid() = parent_id);
CREATE POLICY "Parents can insert their children" ON children
  FOR INSERT WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "Parents can update their children" ON children
  FOR UPDATE USING (auth.uid() = parent_id);
CREATE POLICY "Parents can delete their children" ON children
  FOR DELETE USING (auth.uid() = parent_id);

-- Subscriptions: parents can read their own subscriptions
CREATE POLICY "Parents can read their subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = parent_id);

-- Standards: anyone can read
CREATE POLICY "Anyone can read standards" ON standards
  FOR SELECT USING (true);

-- Problems: anyone can read active problems
CREATE POLICY "Anyone can read active problems" ON problems
  FOR SELECT USING (active = true);

-- Problem choices: anyone can read
CREATE POLICY "Anyone can read problem choices" ON problem_choices
  FOR SELECT USING (true);

-- Sessions: parents can read their children's sessions
CREATE POLICY "Parents can read their children sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = sessions.child_id AND c.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can insert sessions for their children" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = sessions.child_id AND c.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can update their children sessions" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = sessions.child_id AND c.parent_id = auth.uid()
    )
  );

-- Session problems: same as sessions
CREATE POLICY "Parents can read their children session problems" ON session_problems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN children c ON c.id = s.child_id
      WHERE s.id = session_problems.session_id AND c.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can insert session problems for their children" ON session_problems
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      JOIN children c ON c.id = s.child_id
      WHERE s.id = session_problems.session_id AND c.parent_id = auth.uid()
    )
  );

-- Attempts: parents can read their children's attempts
CREATE POLICY "Parents can read their children attempts" ON attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = attempts.child_id AND c.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can insert attempts for their children" ON attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = attempts.child_id AND c.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can update their children attempts" ON attempts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = attempts.child_id AND c.parent_id = auth.uid()
    )
  );

-- Attempt steps: same as attempts
CREATE POLICY "Parents can read their children attempt steps" ON attempt_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM attempts a
      JOIN children c ON c.id = a.child_id
      WHERE a.id = attempt_steps.attempt_id AND c.parent_id = auth.uid()
    )
  );
CREATE POLICY "Parents can insert attempt steps for their children" ON attempt_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM attempts a
      JOIN children c ON c.id = a.child_id
      WHERE a.id = attempt_steps.attempt_id AND c.parent_id = auth.uid()
    )
  );

-- Mastery: parents can read their children's mastery
CREATE POLICY "Parents can read their children mastery" ON mastery
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM children c WHERE c.id = mastery.child_id AND c.parent_id = auth.uid()
    )
  );

-- Weekly reports: parents can read their own reports
CREATE POLICY "Parents can read their weekly reports" ON weekly_reports
  FOR SELECT USING (auth.uid() = parent_id);

-- Audit events: admins only (via service role)
CREATE POLICY "No direct access to audit events" ON audit_events
  FOR SELECT USING (false);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, full_name)
  VALUES (
    NEW.id,
    'parent',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Create free subscription
  INSERT INTO public.subscriptions (parent_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update mastery after attempt
CREATE OR REPLACE FUNCTION public.update_mastery_on_attempt()
RETURNS trigger AS $$
DECLARE
  v_attempts_count int;
  v_correct_count int;
  v_accuracy numeric(5,2);
  v_avg_time numeric(10,2);
BEGIN
  IF NEW.submitted_at IS NOT NULL AND NEW.is_correct IS NOT NULL THEN
    -- Calculate new stats
    SELECT
      COUNT(*),
      COUNT(*) FILTER (WHERE is_correct = true),
      COALESCE(AVG(time_spent_seconds), 0)
    INTO v_attempts_count, v_correct_count, v_avg_time
    FROM attempts
    WHERE child_id = NEW.child_id
      AND standard_id = NEW.standard_id
      AND submitted_at IS NOT NULL;

    v_accuracy := CASE
      WHEN v_attempts_count > 0 THEN (v_correct_count::numeric / v_attempts_count * 100)
      ELSE 0
    END;

    -- Upsert mastery record
    INSERT INTO mastery (child_id, standard_id, attempts_count, correct_count, accuracy_rolling, avg_time_seconds, updated_at)
    VALUES (NEW.child_id, NEW.standard_id, v_attempts_count, v_correct_count, v_accuracy, v_avg_time, now())
    ON CONFLICT (child_id, standard_id)
    DO UPDATE SET
      attempts_count = v_attempts_count,
      correct_count = v_correct_count,
      accuracy_rolling = v_accuracy,
      avg_time_seconds = v_avg_time,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for mastery update
CREATE TRIGGER on_attempt_submitted
  AFTER UPDATE ON attempts
  FOR EACH ROW
  WHEN (OLD.submitted_at IS NULL AND NEW.submitted_at IS NOT NULL)
  EXECUTE FUNCTION public.update_mastery_on_attempt();

-- Function to update subscription timestamps
CREATE OR REPLACE FUNCTION public.update_subscription_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_subscription_update
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_subscription_timestamp();

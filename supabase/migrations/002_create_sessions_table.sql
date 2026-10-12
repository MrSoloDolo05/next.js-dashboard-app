-- Sessions entity (Entity 2): linked to students via student_id FK.
-- Run after 001_create_students_table.sql in the Supabase SQL Editor.

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INT GENERATED ALWAYS AS (
    CASE
      WHEN start_time IS NOT NULL AND end_time IS NOT NULL
      THEN (EXTRACT(EPOCH FROM (end_time - start_time)) / 60)::INT
      ELSE NULL
    END
  ) STORED,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_centre_id ON sessions(centre_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS: mirror the students policies so the two-user proof works identically.
-- Admins see everything.
CREATE POLICY "Admins can view all sessions" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers see sessions in their centre.
CREATE POLICY "Centre managers can view centre sessions" ON sessions
  FOR SELECT USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Tutors see sessions assigned to them or in their centre.
CREATE POLICY "Tutors can view assigned sessions" ON sessions
  FOR SELECT USING (
    tutor_id = auth.uid()
    OR centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tutor'
    )
  );

-- Inserts: admins anywhere, managers in own centre, tutors for own sessions.
CREATE POLICY "Admins can insert sessions" ON sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Centre managers can insert centre sessions" ON sessions
  FOR INSERT WITH CHECK (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

CREATE POLICY "Tutors can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (tutor_id = auth.uid());

-- Updates: admins anywhere, managers in own centre, tutors own sessions.
CREATE POLICY "Admins can update sessions" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Centre managers can update centre sessions" ON sessions
  FOR UPDATE USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

CREATE POLICY "Tutors can update own sessions" ON sessions
  FOR UPDATE USING (tutor_id = auth.uid());

-- Deletes: admins anywhere, managers in own centre.
CREATE POLICY "Admins can delete sessions" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Centre managers can delete centre sessions" ON sessions
  FOR DELETE USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- updated_at trigger (reuses function from 001; create if 001 not applied).
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create a profiles row for every new Supabase Auth user so login never
-- orphans: without this, createStudent/createSession fail with
-- "Profile not found" because centre_id lookup finds no row.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, centre_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'tutor',
    '00000000-0000-0000-0000-000000000001'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

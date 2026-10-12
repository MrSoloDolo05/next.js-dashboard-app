-- Create roles enum
CREATE TYPE user_role AS ENUM ('admin', 'centre_manager', 'tutor');

-- Create centres table (for multi-location support)
CREATE TABLE centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'tutor',
  centre_id UUID REFERENCES centres(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create students table
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  grade_level TEXT,
  subjects TEXT[],
  parent_name TEXT,
  parent_phone TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'graduated')),
  preferred_tutor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  centre_id UUID NOT NULL REFERENCES centres(id) ON DELETE CASCADE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for centres
-- Admins can see all centres
CREATE POLICY "Admins can view all centres" ON centres
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers can view their own centre
CREATE POLICY "Centre managers can view own centre" ON centres
  FOR SELECT USING (
    id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Admins can insert centres
CREATE POLICY "Admins can insert centres" ON centres
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update centres
CREATE POLICY "Admins can update centres" ON centres
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete centres
CREATE POLICY "Admins can delete centres" ON centres
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for profiles
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers can view profiles in their centre
CREATE POLICY "Centre managers can view centre profiles" ON profiles
  FOR SELECT USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can insert profiles (for user management)
CREATE POLICY "Admins can insert profiles" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update any profile
CREATE POLICY "Admins can update profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for students
-- Admins can view all students
CREATE POLICY "Admins can view all students" ON students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers can view students in their centre
CREATE POLICY "Centre managers can view centre students" ON students
  FOR SELECT USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Tutors can view students assigned to them or in their centre
CREATE POLICY "Tutors can view assigned students" ON students
  FOR SELECT USING (
    preferred_tutor_id = auth.uid()
    OR centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'tutor'
    )
  );

-- Admins can insert students
CREATE POLICY "Admins can insert students" ON students
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers can insert students in their centre
CREATE POLICY "Centre managers can insert centre students" ON students
  FOR INSERT WITH CHECK (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Admins can update students
CREATE POLICY "Admins can update students" ON students
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers can update students in their centre
CREATE POLICY "Centre managers can update centre students" ON students
  FOR UPDATE USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Tutors can update students assigned to them
CREATE POLICY "Tutors can update assigned students" ON students
  FOR UPDATE USING (preferred_tutor_id = auth.uid());

-- Admins can delete students
CREATE POLICY "Admins can delete students" ON students
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Centre managers can delete students in their centre
CREATE POLICY "Centre managers can delete centre students" ON students
  FOR DELETE USING (
    centre_id IN (
      SELECT centre_id FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'centre_manager'
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_centres_updated_at
  BEFORE UPDATE ON centres
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a default centre for development
INSERT INTO centres (id, name, address)
VALUES ('00000000-0000-0000-0000-000000000001', 'Main Centre', '123 Main St')
ON CONFLICT DO NOTHING;
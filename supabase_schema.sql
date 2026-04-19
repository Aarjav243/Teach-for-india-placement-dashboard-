-- ============================================================
-- TFI Placement Dashboard - Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('career_advisor', 'program_manager')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'career_advisor')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  school TEXT,
  batch INTEGER,
  career_advisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  engagement_status TEXT,
  contact_number TEXT,
  current_grade TEXT,
  current_college TEXT,
  current_course TEXT,
  course_duration TEXT,
  graduation_status TEXT,
  graduation_status_jan_2025 TEXT,
  graduation_status_sep_oct_2025 TEXT,
  graduation_status_july_2024 TEXT,
  placement_eligible_year TEXT,
  placement_status TEXT CHECK (placement_status IN (
    'Working with Graduation Degree',
    'Working without Graduation Degree',
    'NEET',
    'Placement in Progress',
    'Placement Not Done',
    'Data Not Available'
  )),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS students_updated_at ON students;
CREATE TRIGGER students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PLACEMENTS (multiple per student allowed)
-- ============================================================
CREATE TABLE IF NOT EXISTS placements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  organization TEXT,
  job_role TEXT,
  role_description TEXT,
  industry TEXT CHECK (industry IN (
    'Information Technology (IT)', 'Customer Service', 'Banking and Finance',
    'Non-profit and Social Services', 'Education', 'Human Resources',
    'Retail', 'Hospitality', 'Transportation and Logistics',
    'Research and Development', 'Engineering', 'Other'
  )),
  opportunity_source TEXT CHECK (opportunity_source IN (
    'Career Centre', 'Own', 'Through College/Org Placement'
  )),
  salary_range TEXT CHECK (salary_range IN (
    '0-10k', '11-15k', '16-20k', '21-25k', '25-30k', 'More than 30k'
  )),
  exact_monthly_salary INTEGER,
  placement_month TEXT,
  placement_year INTEGER,
  time_from_graduation TEXT,
  goal_salary TEXT,
  goal_industry_1 TEXT,
  goal_industry_2 TEXT,
  ownership_score TEXT,
  right_fit_job_score TEXT,
  is_current BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SESSIONS (one per student)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE UNIQUE NOT NULL,
  job_readiness_check BOOLEAN DEFAULT FALSE,
  session_1_done BOOLEAN DEFAULT FALSE,
  session_2_done BOOLEAN DEFAULT FALSE,
  resume_link TEXT,
  linkedin_link TEXT,
  session_3_done BOOLEAN DEFAULT FALSE,
  session_4_done BOOLEAN DEFAULT FALSE,
  application_status TEXT,
  job_support_through TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS sessions_updated_at ON sessions;
CREATE TRIGGER sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- APPLICATIONS (up to 3 per student)
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT,
  role TEXT,
  result TEXT CHECK (result IN (
    'Selected', 'Rejected at Screening Level',
    'Rejected at Interview Level', 'Pending'
  )),
  application_number INTEGER CHECK (application_number IN (1, 2, 3)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating
DROP POLICY IF EXISTS "read_all_profiles" ON profiles;
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
DROP POLICY IF EXISTS "read_all_students" ON students;
DROP POLICY IF EXISTS "insert_students" ON students;
DROP POLICY IF EXISTS "update_students" ON students;
DROP POLICY IF EXISTS "delete_students" ON students;
DROP POLICY IF EXISTS "all_placements" ON placements;
DROP POLICY IF EXISTS "all_sessions" ON sessions;
DROP POLICY IF EXISTS "all_applications" ON applications;

-- All authenticated users can read all data
CREATE POLICY "read_all_profiles" ON profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "read_all_students" ON students FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "insert_students" ON students FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "update_students" ON students FOR UPDATE TO authenticated USING (TRUE);
CREATE POLICY "delete_students" ON students FOR DELETE TO authenticated USING (TRUE);

CREATE POLICY "all_placements" ON placements FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "all_sessions" ON sessions FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "all_applications" ON applications FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

export type UserRole = 'career_advisor' | 'program_manager'

export interface Profile {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: string
}

export type PlacementStatus =
  | 'Working with Graduation Degree'
  | 'Working without Graduation Degree'
  | 'NEET'
  | 'Placement in Progress'
  | 'Placement Not Done'
  | 'Data Not Available'

export type GraduationStatus =
  | 'Graduate'
  | '1st Year (Studying)'
  | '2nd Year (Studying)'
  | '3rd Year (Studying)'
  | '4th Year (Studying)'
  | 'Gap Year'
  | 'Dropout - Doing Job'
  | 'Dropout - Doing Business'
  | 'Dropout - Doing Nothing'
  | 'Not in Touch'

export type Industry =
  | 'Information Technology (IT)'
  | 'Customer Service'
  | 'Banking and Finance'
  | 'Non-profit and Social Services'
  | 'Education'
  | 'Human Resources'
  | 'Retail'
  | 'Hospitality'
  | 'Transportation and Logistics'
  | 'Research and Development'
  | 'Engineering'
  | 'Other'

export type SalaryRange =
  | '0-10k'
  | '11-15k'
  | '16-20k'
  | '21-25k'
  | '25-30k'
  | 'More than 30k'

export type OpportunitySource =
  | 'Career Centre'
  | 'Own'
  | 'Through College/Org Placement'

export type ApplicationResult =
  | 'Selected'
  | 'Rejected at Screening Level'
  | 'Rejected at Interview Level'
  | 'Pending'

export interface Student {
  id: string
  student_id: string
  name: string
  school: string | null
  batch: number | null
  career_advisor_id: string | null
  career_advisor?: Profile
  engagement_status: string | null
  contact_number: string | null
  current_grade: string | null
  current_college: string | null
  current_course: string | null
  course_duration: string | null
  graduation_status: GraduationStatus | null
  graduation_status_jan_2025: GraduationStatus | null
  graduation_status_sep_oct_2025: GraduationStatus | null
  graduation_status_july_2024: GraduationStatus | null
  placement_eligible_year: string | null
  placement_status: PlacementStatus | null
  notes: string | null
  created_at: string
  updated_at: string
  placements?: Placement[]
  sessions?: Session
  applications?: Application[]
}

export interface Placement {
  id: string
  student_id: string
  organization: string | null
  job_role: string | null
  role_description: string | null
  industry: Industry | null
  opportunity_source: OpportunitySource | null
  salary_range: SalaryRange | null
  exact_monthly_salary: number | null
  placement_month: string | null
  placement_year: number | null
  time_from_graduation: string | null
  goal_salary: SalaryRange | null
  goal_industry_1: Industry | null
  goal_industry_2: Industry | null
  ownership_score: string | null
  right_fit_job_score: string | null
  is_current: boolean
  created_at: string
}

export interface Session {
  id: string
  student_id: string
  job_readiness_check: boolean
  session_1_done: boolean
  session_2_done: boolean
  resume_link: string | null
  linkedin_link: string | null
  session_3_done: boolean
  session_4_done: boolean
  application_status: string | null
  job_support_through: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  student_id: string
  organization_name: string | null
  role: string | null
  result: ApplicationResult | null
  application_number: number
  created_at: string
}

export interface InsightMetrics {
  totalStudents: number
  placedCount: number
  placementRate: number
  neetCount: number
  avgSalary: number
  inProgressCount: number
}

import type { PlacementStatus, GraduationStatus, Industry, SalaryRange, OpportunitySource, ApplicationResult } from '../types'

export const PLACEMENT_STATUSES: PlacementStatus[] = [
  'Working with Graduation Degree',
  'Working without Graduation Degree',
  'NEET',
  'Placement in Progress',
  'Placement Not Done',
  'Data Not Available',
]

export const GRADUATION_STATUSES: GraduationStatus[] = [
  'Graduate',
  '1st Year (Studying)',
  '2nd Year (Studying)',
  '3rd Year (Studying)',
  '4th Year (Studying)',
  'Gap Year',
  'Dropout - Doing Job',
  'Dropout - Doing Business',
  'Dropout - Doing Nothing',
  'Not in Touch',
]

export const INDUSTRIES: Industry[] = [
  'Information Technology (IT)',
  'Customer Service',
  'Banking and Finance',
  'Non-profit and Social Services',
  'Education',
  'Human Resources',
  'Retail',
  'Hospitality',
  'Transportation and Logistics',
  'Research and Development',
  'Engineering',
  'Other',
]

export const SALARY_RANGES: SalaryRange[] = [
  '0-10k',
  '11-15k',
  '16-20k',
  '21-25k',
  '25-30k',
  'More than 30k',
]

export const OPPORTUNITY_SOURCES: OpportunitySource[] = [
  'Career Centre',
  'Own',
  'Through College/Org Placement',
]

export const APPLICATION_RESULTS: ApplicationResult[] = [
  'Selected',
  'Rejected at Screening Level',
  'Rejected at Interview Level',
  'Pending',
]

export const COURSE_DURATIONS = [
  '1 Year Course',
  '2 Year Course',
  '3 Year Course',
  '4 Year Course',
  'Diploma',
  'Other',
]

export const ENGAGEMENT_STATUSES = [
  'Active',
  'Inactive',
  'Not in Touch',
  'Dropped Out',
]

export const SCHOOLS = ['ADH', 'BJR', 'Other']

export const PLACEMENT_STATUS_COLORS: Record<string, string> = {
  'Working with Graduation Degree': '#B7C930',
  'Working without Graduation Degree': '#0EC0E2',
  'NEET': '#EF5879',
  'Placement in Progress': '#F59E0B',
  'Placement Not Done': '#9CA3AF',
  'Data Not Available': '#D1D5DB',
}

export const INDUSTRY_COLORS = [
  '#EF5879', '#B7C930', '#0EC0E2', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
  '#6366F1', '#84CC16', '#06B6D4', '#A78BFA',
]

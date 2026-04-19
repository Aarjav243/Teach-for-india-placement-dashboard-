import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import fs from 'fs'

const SUPABASE_URL = 'https://oepscnyomgcjyvanadvm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lcHNjbnlvbWdjanl2YW5hZHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDI0NTksImV4cCI6MjA5MjE3ODQ1OX0.1Nu4tDDBEDGs_rd1-Ts3sT9f_P_3lw_zv7EmaCrSlH8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in first so RLS passes
await supabase.auth.signInWithPassword({
  email: 'aarjav223@gmail.com',
  password: 'Aarjavjain@06'
})

// ── Normalizers ──────────────────────────────────────────────
function clean(v) {
  if (!v || v === 'NA' || v === 'N/A' || v === '#N/A' || v === '#REF!' || v.trim() === '') return null
  return v.trim()
}

function parseBool(v) {
  if (!v) return false
  return v.toString().toUpperCase() === 'TRUE'
}

function parseNum(v) {
  const n = parseInt(clean(v))
  return isNaN(n) ? null : n
}

function normalizePlacementStatus(v) {
  const s = (clean(v) || '').toUpperCase()
  if (s.includes('WITHOUT')) return 'Working without Graduation Degree'
  if (s.includes('WITH')) return 'Working with Graduation Degree'
  if (s.includes('NEET')) return 'NEET'
  if (s.includes('IN PROGRESS')) return 'Placement in Progress'
  if (s.includes('NOT DONE')) return 'Placement Not Done'
  if (s.includes('DATA NOT')) return 'Data Not Available'
  return null
}

function normalizeGradStatus(v) {
  const s = (clean(v) || '').toLowerCase()
  if (s.includes('graduate') && !s.includes('post')) return 'Graduate'
  if (s.includes('first') || s.includes('1.')) return '1st Year (Studying)'
  if (s.includes('second') || s.includes('2.')) return '2nd Year (Studying)'
  if (s.includes('third') || s.includes('3.')) return '3rd Year (Studying)'
  if (s.includes('forth') || s.includes('fourth') || s.includes('4.')) return '4th Year (Studying)'
  if (s.includes('gap')) return 'Gap Year'
  if (s.includes('business')) return 'Dropout - Doing Business'
  if (s.includes('doing job')) return 'Dropout - Doing Job'
  if (s.includes('doing nothing')) return 'Dropout - Doing Nothing'
  if (s.includes('not in touch')) return 'Not in Touch'
  return null
}

function normalizeIndustry(v) {
  const s = (clean(v) || '').toLowerCase()
  if (s.includes('information') || s.includes('it') || s.includes('software') || s.includes('tech')) return 'Information Technology (IT)'
  if (s.includes('customer')) return 'Customer Service'
  if (s.includes('bank') || s.includes('financ') || s.includes('insurance')) return 'Banking and Finance'
  if (s.includes('non-profit') || s.includes('nonprofit') || s.includes('social') || s.includes('ngo')) return 'Non-profit and Social Services'
  if (s.includes('educat') || s.includes('teach') || s.includes('school')) return 'Education'
  if (s.includes('human resource') || s.includes('hr') || s.includes('recruit')) return 'Human Resources'
  if (s.includes('retail') || s.includes('sales')) return 'Retail'
  if (s.includes('hospital') || s.includes('hotel') || s.includes('chef')) return 'Hospitality'
  if (s.includes('transport') || s.includes('logistics') || s.includes('marine')) return 'Transportation and Logistics'
  if (s.includes('research') || s.includes('analyst')) return 'Research and Development'
  if (s.includes('engineer') || s.includes('mechanic') || s.includes('civil')) return 'Engineering'
  if (clean(v)) return 'Other'
  return null
}

function normalizeSalary(v) {
  const s = (clean(v) || '').toLowerCase()
  if (s.includes('0-10') || s.includes('0 - 10')) return '0-10k'
  if (s.includes('11-15') || s.includes('11 - 15')) return '11-15k'
  if (s.includes('16-20') || s.includes('16 - 20')) return '16-20k'
  if (s.includes('21-25') || s.includes('21 - 25')) return '21-25k'
  if (s.includes('25-30') || s.includes('25 - 30')) return '25-30k'
  if (s.includes('more than') || s.includes('21k') || s.includes('>20')) return 'More than 30k'
  return null
}

function normalizeSource(v) {
  const s = (clean(v) || '').toLowerCase()
  if (s.includes('career centre') || s.includes('career center')) return 'Career Centre'
  if (s.includes('college') || s.includes('org placement')) return 'Through College/Org Placement'
  if (s.includes('own') || s.includes('self')) return 'Own'
  return null
}

function normalizeResult(v) {
  const s = (clean(v) || '').toLowerCase()
  if (s.includes('selected')) return 'Selected'
  if (s.includes('screening')) return 'Rejected at Screening Level'
  if (s.includes('interview')) return 'Rejected at Interview Level'
  if (s.includes('pending')) return 'Pending'
  return null
}

// ── Read CSV ──────────────────────────────────────────────────
const csvPath = '../File to be sent to Suraj (15th April).xlsx - Student Tracker.csv'
const csvContent = fs.readFileSync(csvPath, 'utf-8')

const rows = parse(csvContent, {
  relax_column_count: true,
  skip_empty_lines: true,
  from_line: 1,
})

// The header spans 6 lines due to multi-line cell values; data starts line 7
const dataRows = rows.slice(6)
console.log(`Parsed ${dataRows.length} student rows`)

// ── Import ────────────────────────────────────────────────────
let imported = 0, skipped = 0, errors = 0

for (const row of dataRows) {
  const rawName = clean(row[0])
  if (!rawName) { skipped++; continue }

  // Parse student_id and name (format: "2017001:ABHISHEK KADAM")
  const colonIdx = rawName.indexOf(':')
  const studentId = colonIdx > -1 ? rawName.substring(0, colonIdx).trim() : rawName
  const name = colonIdx > -1 ? rawName.substring(colonIdx + 1).trim() : rawName

  if (!studentId || !name) { skipped++; continue }

  const studentData = {
    student_id: studentId,
    name,
    school: clean(row[1]),
    batch: parseNum(row[2]),
    engagement_status: clean(row[4]),
    contact_number: clean(row[5]),
    current_grade: clean(row[6]),
    current_college: clean(row[7]),
    current_course: clean(row[8]),
    course_duration: clean(row[9]),
    graduation_status: normalizeGradStatus(row[10]),
    graduation_status_jan_2025: normalizeGradStatus(row[11]),
    graduation_status_sep_oct_2025: normalizeGradStatus(row[12]),
    graduation_status_july_2024: normalizeGradStatus(row[13]),
    placement_eligible_year: clean(row[14]),
    placement_status: normalizePlacementStatus(row[15]),
    notes: clean(row[47]),
  }

  const { data: student, error: sErr } = await supabase
    .from('students')
    .upsert(studentData, { onConflict: 'student_id' })
    .select('id')
    .single()

  if (sErr || !student) {
    console.error(`Error inserting ${studentId}:`, sErr?.message)
    errors++
    continue
  }

  const sid = student.id

  // Placement
  const org = clean(row[16])
  const jobRole = clean(row[17])
  if (org || jobRole) {
    await supabase.from('placements').upsert({
      student_id: sid,
      organization: org,
      job_role: jobRole,
      role_description: clean(row[18]),
      industry: normalizeIndustry(row[19]),
      opportunity_source: normalizeSource(row[20]),
      salary_range: normalizeSalary(row[21]),
      exact_monthly_salary: parseNum(row[22]),
      placement_month: clean(row[23]),
      placement_year: parseNum(row[24]),
      time_from_graduation: clean(row[25]),
      goal_salary: normalizeSalary(row[26]),
      goal_industry_1: normalizeIndustry(row[27]),
      goal_industry_2: normalizeIndustry(row[28]),
      ownership_score: clean(row[45]),
      right_fit_job_score: clean(row[46]),
      is_current: true,
    }, { onConflict: 'student_id,is_current' })
  }

  // Sessions
  await supabase.from('sessions').upsert({
    student_id: sid,
    job_readiness_check: parseBool(row[29]),
    session_1_done: parseBool(row[30]),
    session_2_done: parseBool(row[31]),
    resume_link: clean(row[32]),
    linkedin_link: clean(row[33]),
    session_3_done: parseBool(row[34]),
    session_4_done: parseBool(row[35]),
    application_status: clean(row[37]),
    job_support_through: clean(row[44]),
  }, { onConflict: 'student_id' })

  // Applications
  const apps = [
    { org: clean(row[38]), result: normalizeResult(row[39]), num: 1 },
    { org: clean(row[40]), result: normalizeResult(row[41]), num: 2 },
    { org: clean(row[42]), result: normalizeResult(row[43]), num: 3 },
  ].filter(a => a.org)

  for (const app of apps) {
    await supabase.from('applications').upsert({
      student_id: sid,
      organization_name: app.org,
      result: app.result,
      application_number: app.num,
    }, { onConflict: 'student_id,application_number' })
  }

  imported++
  if (imported % 50 === 0) console.log(`  ✓ ${imported} students imported...`)
}

console.log(`\nDone! Imported: ${imported} | Skipped: ${skipped} | Errors: ${errors}`)
process.exit(0)

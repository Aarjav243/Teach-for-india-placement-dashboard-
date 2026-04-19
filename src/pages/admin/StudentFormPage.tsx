import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, User, GraduationCap, Briefcase, ClipboardList, Send, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import {
  PLACEMENT_STATUSES, GRADUATION_STATUSES, INDUSTRIES, SALARY_RANGES,
  OPPORTUNITY_SOURCES, APPLICATION_RESULTS, COURSE_DURATIONS, ENGAGEMENT_STATUSES, SCHOOLS
} from '../../constants'
import { SelectField, InputField, TextAreaField, CheckboxField } from '../../components/ui/FormField'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Header from '../../components/layout/Header'

const BATCHES = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

type Section = 'basic' | 'education' | 'placement' | 'sessions' | 'applications' | 'notes'

const SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'basic', label: 'Basic Info', icon: User },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'placement', label: 'Placement', icon: Briefcase },
  { id: 'sessions', label: 'Sessions', icon: ClipboardList },
  { id: 'applications', label: 'Applications', icon: Send },
  { id: 'notes', label: 'Notes', icon: FileText },
]

export default function StudentFormPage() {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [activeSection, setActiveSection] = useState<Section>('basic')
  const [saving, setSaving] = useState(false)
  const [advisors, setAdvisors] = useState<{ id: string; name: string }[]>([])

  // Basic
  const [studentId, setStudentId] = useState('')
  const [name, setName] = useState('')
  const [school, setSchool] = useState('')
  const [batch, setBatch] = useState('')
  const [advisorId, setAdvisorId] = useState('')
  const [engagementStatus, setEngagementStatus] = useState('')
  const [contactNumber, setContactNumber] = useState('')

  // Education
  const [grade, setGrade] = useState('')
  const [college, setCollege] = useState('')
  const [course, setCourse] = useState('')
  const [courseDuration, setCourseDuration] = useState('')
  const [gradStatus, setGradStatus] = useState('')
  const [gradStatusJan25, setGradStatusJan25] = useState('')
  const [gradStatusSep25, setGradStatusSep25] = useState('')
  const [gradStatusJuly24, setGradStatusJuly24] = useState('')
  const [eligibleYear, setEligibleYear] = useState('')
  const [placementStatus, setPlacementStatus] = useState('')

  // Placement
  const [org, setOrg] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [roleDesc, setRoleDesc] = useState('')
  const [industry, setIndustry] = useState('')
  const [oppSource, setOppSource] = useState('')
  const [salaryRange, setSalaryRange] = useState('')
  const [exactSalary, setExactSalary] = useState('')
  const [placementMonth, setPlacementMonth] = useState('')
  const [placementYear, setPlacementYear] = useState('')
  const [timeFromGrad, setTimeFromGrad] = useState('')
  const [goalSalary, setGoalSalary] = useState('')
  const [goalIndustry1, setGoalIndustry1] = useState('')
  const [goalIndustry2, setGoalIndustry2] = useState('')
  const [ownershipScore, setOwnershipScore] = useState('')
  const [rightFitScore, setRightFitScore] = useState('')

  // Sessions
  const [jobReadiness, setJobReadiness] = useState(false)
  const [session1, setSession1] = useState(false)
  const [session2, setSession2] = useState(false)
  const [resumeLink, setResumeLink] = useState('')
  const [linkedinLink, setLinkedinLink] = useState('')
  const [session3, setSession3] = useState(false)
  const [session4, setSession4] = useState(false)
  const [appStatus, setAppStatus] = useState('')
  const [jobSupportThrough, setJobSupportThrough] = useState('')

  // Applications
  const [app1Org, setApp1Org] = useState('')
  const [app1Role, setApp1Role] = useState('')
  const [app1Result, setApp1Result] = useState('')
  const [app2Org, setApp2Org] = useState('')
  const [app2Role, setApp2Role] = useState('')
  const [app2Result, setApp2Result] = useState('')
  const [app3Org, setApp3Org] = useState('')
  const [app3Role, setApp3Role] = useState('')
  const [app3Result, setApp3Result] = useState('')

  // Notes
  const [notes, setNotes] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('id,name').eq('role', 'career_advisor')
      .then(({ data }) => setAdvisors(data ?? []))

    if (isEdit) loadStudent()
    else if (profile?.role === 'career_advisor') setAdvisorId(profile.id)
  }, [id])

  async function loadStudent() {
    const { data: s } = await supabase.from('students').select('*').eq('id', id).single()
    if (!s) return
    setStudentId(s.student_id ?? ''); setName(s.name ?? ''); setSchool(s.school ?? '')
    setBatch(s.batch?.toString() ?? ''); setAdvisorId(s.career_advisor_id ?? '')
    setEngagementStatus(s.engagement_status ?? ''); setContactNumber(s.contact_number ?? '')
    setGrade(s.current_grade ?? ''); setCollege(s.current_college ?? ''); setCourse(s.current_course ?? '')
    setCourseDuration(s.course_duration ?? ''); setGradStatus(s.graduation_status ?? '')
    setGradStatusJan25(s.graduation_status_jan_2025 ?? ''); setGradStatusSep25(s.graduation_status_sep_oct_2025 ?? '')
    setGradStatusJuly24(s.graduation_status_july_2024 ?? ''); setEligibleYear(s.placement_eligible_year ?? '')
    setPlacementStatus(s.placement_status ?? ''); setNotes(s.notes ?? '')

    const { data: pl } = await supabase.from('placements').select('*').eq('student_id', id).eq('is_current', true).single()
    if (pl) {
      setOrg(pl.organization ?? ''); setJobRole(pl.job_role ?? ''); setRoleDesc(pl.role_description ?? '')
      setIndustry(pl.industry ?? ''); setOppSource(pl.opportunity_source ?? ''); setSalaryRange(pl.salary_range ?? '')
      setExactSalary(pl.exact_monthly_salary?.toString() ?? ''); setPlacementMonth(pl.placement_month ?? '')
      setPlacementYear(pl.placement_year?.toString() ?? ''); setTimeFromGrad(pl.time_from_graduation ?? '')
      setGoalSalary(pl.goal_salary ?? ''); setGoalIndustry1(pl.goal_industry_1 ?? '')
      setGoalIndustry2(pl.goal_industry_2 ?? ''); setOwnershipScore(pl.ownership_score ?? '')
      setRightFitScore(pl.right_fit_job_score ?? '')
    }

    const { data: se } = await supabase.from('sessions').select('*').eq('student_id', id).single()
    if (se) {
      setJobReadiness(se.job_readiness_check); setSession1(se.session_1_done); setSession2(se.session_2_done)
      setResumeLink(se.resume_link ?? ''); setLinkedinLink(se.linkedin_link ?? '')
      setSession3(se.session_3_done); setSession4(se.session_4_done)
      setAppStatus(se.application_status ?? ''); setJobSupportThrough(se.job_support_through ?? '')
    }

    const { data: apps } = await supabase.from('applications').select('*').eq('student_id', id).order('application_number')
    if (apps) {
      const a1 = apps.find(a => a.application_number === 1)
      const a2 = apps.find(a => a.application_number === 2)
      const a3 = apps.find(a => a.application_number === 3)
      if (a1) { setApp1Org(a1.organization_name ?? ''); setApp1Role(a1.role ?? ''); setApp1Result(a1.result ?? '') }
      if (a2) { setApp2Org(a2.organization_name ?? ''); setApp2Role(a2.role ?? ''); setApp2Result(a2.result ?? '') }
      if (a3) { setApp3Org(a3.organization_name ?? ''); setApp3Role(a3.role ?? ''); setApp3Result(a3.result ?? '') }
    }
  }

  async function handleSave() {
    if (!name || !studentId) { alert('Student name and ID are required'); return }
    setSaving(true)

    const studentData = {
      student_id: studentId, name, school: school || null, batch: batch ? parseInt(batch) : null,
      career_advisor_id: advisorId || null, engagement_status: engagementStatus || null,
      contact_number: contactNumber || null, current_grade: grade || null,
      current_college: college || null, current_course: course || null,
      course_duration: courseDuration || null, graduation_status: gradStatus || null,
      graduation_status_jan_2025: gradStatusJan25 || null,
      graduation_status_sep_oct_2025: gradStatusSep25 || null,
      graduation_status_july_2024: gradStatusJuly24 || null,
      placement_eligible_year: eligibleYear || null,
      placement_status: placementStatus || null, notes: notes || null,
    }

    let studentUid = id
    if (isEdit) {
      await supabase.from('students').update(studentData).eq('id', id)
    } else {
      const { data } = await supabase.from('students').insert(studentData).select('id').single()
      studentUid = data?.id
    }

    if (!studentUid) { setSaving(false); return }

    // Placement
    if (org || jobRole) {
      const placementData = {
        student_id: studentUid, organization: org || null, job_role: jobRole || null,
        role_description: roleDesc || null, industry: industry || null,
        opportunity_source: oppSource || null, salary_range: salaryRange || null,
        exact_monthly_salary: exactSalary ? parseInt(exactSalary) : null,
        placement_month: placementMonth || null, placement_year: placementYear ? parseInt(placementYear) : null,
        time_from_graduation: timeFromGrad || null, goal_salary: goalSalary || null,
        goal_industry_1: goalIndustry1 || null, goal_industry_2: goalIndustry2 || null,
        ownership_score: ownershipScore || null, right_fit_job_score: rightFitScore || null, is_current: true,
      }
      if (isEdit) {
        const { data: existing } = await supabase.from('placements').select('id').eq('student_id', studentUid).eq('is_current', true).single()
        if (existing) await supabase.from('placements').update(placementData).eq('id', existing.id)
        else await supabase.from('placements').insert(placementData)
      } else {
        await supabase.from('placements').insert(placementData)
      }
    }

    // Sessions
    const sessionData = {
      student_id: studentUid, job_readiness_check: jobReadiness, session_1_done: session1,
      session_2_done: session2, resume_link: resumeLink || null, linkedin_link: linkedinLink || null,
      session_3_done: session3, session_4_done: session4,
      application_status: appStatus || null, job_support_through: jobSupportThrough || null,
    }
    await supabase.from('sessions').upsert(sessionData, { onConflict: 'student_id' })

    // Applications
    await supabase.from('applications').delete().eq('student_id', studentUid)
    const appsToInsert = [
      { org: app1Org, role: app1Role, result: app1Result, num: 1 },
      { org: app2Org, role: app2Role, result: app2Result, num: 2 },
      { org: app3Org, role: app3Role, result: app3Result, num: 3 },
    ].filter(a => a.org || a.role).map(a => ({
      student_id: studentUid!, organization_name: a.org || null,
      role: a.role || null, result: a.result || null, application_number: a.num,
    }))
    if (appsToInsert.length > 0) await supabase.from('applications').insert(appsToInsert)

    setSaving(false)
    navigate(`/admin/students/${studentUid}`)
  }

  const sectionCompleteness: Record<Section, boolean> = {
    basic: !!(name && studentId),
    education: !!(gradStatus && placementStatus),
    placement: !!(org || jobRole),
    sessions: session1 || session2 || session3 || session4,
    applications: !!(app1Org || app2Org),
    notes: !!notes,
  }

  return (
    <div>
      <Header
        title={isEdit ? 'Edit Student' : 'Add Student'}
        subtitle={isEdit ? `Editing: ${name || '...'}` : 'Fill in student details below'}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSave}>
              {isEdit ? 'Save Changes' : 'Add Student'}
            </Button>
          </div>
        }
      />

      <div className="p-8">
        <div className="flex gap-6">
          {/* Section nav */}
          <div className="w-52 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              {SECTIONS.map((sec) => {
                const Icon = sec.icon
                const done = sectionCompleteness[sec.id]
                return (
                  <button key={sec.id} onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                      activeSection === sec.id
                        ? 'bg-tfi-pink text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{sec.label}</span>
                    {done && activeSection !== sec.id && (
                      <div className="w-2 h-2 rounded-full bg-tfi-green flex-shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 max-w-2xl">
            {activeSection === 'basic' && (
              <Card>
                <h2 className="text-base font-semibold text-tfi-dark mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-tfi-pink" /> Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Student ID" value={studentId} onChange={setStudentId} placeholder="e.g. 2017001" required />
                  <InputField label="Full Name" value={name} onChange={setName} placeholder="Student full name" required className="col-span-2" />
                  <SelectField label="School" value={school} onChange={setSchool} options={SCHOOLS} placeholder="Select school" />
                  <SelectField label="Batch Year" value={batch} onChange={setBatch} options={BATCHES.map(String)} placeholder="Select batch" />
                  <SelectField label="Career Advisor" value={advisorId} onChange={setAdvisorId}
                    options={advisors.map(a => a.id)} placeholder="Select advisor"
                    className="col-span-2"
                  />
                  <SelectField label="Engagement Status" value={engagementStatus} onChange={setEngagementStatus}
                    options={ENGAGEMENT_STATUSES} placeholder="Select status" />
                  <InputField label="Contact Number" value={contactNumber} onChange={setContactNumber} placeholder="+91 XXXXX XXXXX" type="tel" />
                </div>
                {/* Show advisor names not IDs */}
                {advisorId && (
                  <p className="mt-2 text-xs text-gray-400">
                    Assigned to: <span className="text-tfi-pink font-medium">{advisors.find(a => a.id === advisorId)?.name ?? advisorId}</span>
                  </p>
                )}
              </Card>
            )}

            {activeSection === 'education' && (
              <Card>
                <h2 className="text-base font-semibold text-tfi-dark mb-5 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-tfi-pink" /> Education Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Grade / CGPA / Percentage" value={grade} onChange={setGrade} placeholder="e.g. 72.5 or 8.5 CGPA" />
                  <InputField label="Current College" value={college} onChange={setCollege} placeholder="College name" className="col-span-2" />
                  <InputField label="Current Course" value={course} onChange={setCourse} placeholder="e.g. B.Com, BSc CS" />
                  <SelectField label="Course Duration" value={courseDuration} onChange={setCourseDuration} options={COURSE_DURATIONS} placeholder="Select duration" />

                  <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Graduation Status Checkpoints</p>
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Current Status" value={gradStatus} onChange={setGradStatus} options={GRADUATION_STATUSES} placeholder="Select status" />
                      <SelectField label="Status (July 2024)" value={gradStatusJuly24} onChange={setGradStatusJuly24} options={GRADUATION_STATUSES} placeholder="Select" />
                      <SelectField label="Status (Jan 2025)" value={gradStatusJan25} onChange={setGradStatusJan25} options={GRADUATION_STATUSES} placeholder="Select" />
                      <SelectField label="Status (Sep-Oct 2025)" value={gradStatusSep25} onChange={setGradStatusSep25} options={GRADUATION_STATUSES} placeholder="Select" />
                    </div>
                  </div>

                  <InputField label="Eligible for Placement Year" value={eligibleYear} onChange={setEligibleYear} placeholder="e.g. 2022-23" />
                  <SelectField label="Placement Status" value={placementStatus} onChange={setPlacementStatus} options={PLACEMENT_STATUSES} placeholder="Select status" />
                </div>
              </Card>
            )}

            {activeSection === 'placement' && (
              <Card>
                <h2 className="text-base font-semibold text-tfi-dark mb-5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-tfi-pink" /> Placement Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Organization" value={org} onChange={setOrg} placeholder="Company name" className="col-span-2" />
                  <InputField label="Job Role / Title" value={jobRole} onChange={setJobRole} placeholder="e.g. Software Engineer" />
                  <SelectField label="Industry" value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select industry" />
                  <TextAreaField label="Role Description" value={roleDesc} onChange={setRoleDesc} placeholder="Brief description of responsibilities..." className="col-span-2" />
                  <SelectField label="Opportunity Source" value={oppSource} onChange={setOppSource} options={OPPORTUNITY_SOURCES} placeholder="How was the job found?" className="col-span-2" />

                  <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Salary</p>
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Salary Range" value={salaryRange} onChange={setSalaryRange} options={SALARY_RANGES} placeholder="Select range" />
                      <InputField label="Exact Monthly Salary (₹)" value={exactSalary} onChange={setExactSalary} type="number" placeholder="e.g. 18000" />
                    </div>
                  </div>

                  <SelectField label="Placement Month" value={placementMonth} onChange={setPlacementMonth} options={MONTHS} placeholder="Select month" />
                  <InputField label="Placement Year" value={placementYear} onChange={setPlacementYear} type="number" placeholder="e.g. 2023" />
                  <InputField label="Time from Graduation" value={timeFromGrad} onChange={setTimeFromGrad} placeholder="e.g. 3 months" className="col-span-2" />

                  <div className="col-span-2 border-t border-gray-100 pt-4 mt-1">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Placement Goals</p>
                    <div className="grid grid-cols-2 gap-4">
                      <SelectField label="Goal Salary" value={goalSalary} onChange={setGoalSalary} options={SALARY_RANGES} placeholder="Select" />
                      <SelectField label="Goal Industry #1" value={goalIndustry1} onChange={setGoalIndustry1} options={INDUSTRIES} placeholder="Select" />
                      <SelectField label="Goal Industry #2" value={goalIndustry2} onChange={setGoalIndustry2} options={INDUSTRIES} placeholder="Select" />
                    </div>
                  </div>

                  <InputField label="Ownership Score" value={ownershipScore} onChange={setOwnershipScore} placeholder="Describe student's ownership" />
                  <InputField label="Right Fit Job Score" value={rightFitScore} onChange={setRightFitScore} placeholder="Score as per rubric" />
                </div>
              </Card>
            )}

            {activeSection === 'sessions' && (
              <Card>
                <h2 className="text-base font-semibold text-tfi-dark mb-5 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-tfi-pink" /> Placement Support Sessions
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <CheckboxField label="Job Readiness Check Done" checked={jobReadiness} onChange={setJobReadiness}
                      description="Initial assessment of student's job readiness" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <CheckboxField label="Session 1 — Placement Goal Setting" checked={session1} onChange={setSession1}
                      description="Student sets placement goals, salary expectations, and target industries" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <CheckboxField label="Session 2 — Making Job Collaterals" checked={session2} onChange={setSession2}
                      description="Resume building, LinkedIn profile setup" />
                    {session2 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <InputField label="Resume Link" value={resumeLink} onChange={setResumeLink} placeholder="Google Drive / Dropbox URL" />
                        <InputField label="LinkedIn Profile" value={linkedinLink} onChange={setLinkedinLink} placeholder="linkedin.com/in/..." />
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <CheckboxField label="Session 3 — Interview Readiness" checked={session3} onChange={setSession3}
                      description="Mock interviews, interview skills practice" />
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <CheckboxField label="Session 4 — Shortlisting Jobs" checked={session4} onChange={setSession4}
                      description="Job search strategy, shortlisting opportunities" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <InputField label="Application Status Summary" value={appStatus} onChange={setAppStatus} placeholder="e.g. Applied at 3 places" />
                    <InputField label="Job Support Through" value={jobSupportThrough} onChange={setJobSupportThrough} placeholder="e.g. Career Centre, Own" />
                  </div>
                </div>
              </Card>
            )}

            {activeSection === 'applications' && (
              <Card>
                <h2 className="text-base font-semibold text-tfi-dark mb-5 flex items-center gap-2">
                  <Send className="w-4 h-4 text-tfi-pink" /> Job Applications
                </h2>
                <div className="space-y-5">
                  {[
                    { num: 1, org: app1Org, setOrg: setApp1Org, role: app1Role, setRole: setApp1Role, result: app1Result, setResult: setApp1Result },
                    { num: 2, org: app2Org, setOrg: setApp2Org, role: app2Role, setRole: setApp2Role, result: app2Result, setResult: setApp2Result },
                    { num: 3, org: app3Org, setOrg: setApp3Org, role: app3Role, setRole: setApp3Role, result: app3Result, setResult: setApp3Result },
                  ].map((app) => (
                    <div key={app.num} className="p-4 border border-gray-100 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600 mb-3">Application #{app.num}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <InputField label="Organization" value={app.org} onChange={app.setOrg} placeholder="Company name" />
                        <InputField label="Role Applied For" value={app.role} onChange={app.setRole} placeholder="Job title" />
                        <SelectField label="Result" value={app.result} onChange={app.setResult}
                          options={APPLICATION_RESULTS} placeholder="Select result" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {activeSection === 'notes' && (
              <Card>
                <h2 className="text-base font-semibold text-tfi-dark mb-5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-tfi-pink" /> Notes
                </h2>
                <TextAreaField
                  label="Advisor Notes"
                  value={notes}
                  onChange={setNotes}
                  placeholder="Post graduation details, rejection notes, any additional context about the student's journey..."
                  rows={8}
                />
              </Card>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="secondary" onClick={() => {
                const idx = SECTIONS.findIndex(s => s.id === activeSection)
                if (idx > 0) setActiveSection(SECTIONS[idx - 1].id)
              }} disabled={activeSection === 'basic'}>Previous</Button>
              <div className="flex gap-2">
                {activeSection !== 'notes' && (
                  <Button variant="secondary" onClick={() => {
                    const idx = SECTIONS.findIndex(s => s.id === activeSection)
                    if (idx < SECTIONS.length - 1) setActiveSection(SECTIONS[idx + 1].id)
                  }}>Next</Button>
                )}
                <Button icon={<Save className="w-4 h-4" />} loading={saving} onClick={handleSave}>
                  {isEdit ? 'Save Changes' : 'Add Student'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

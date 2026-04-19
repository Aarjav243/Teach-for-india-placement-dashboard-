import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Edit2, ArrowLeft, Phone, Building2, GraduationCap, Briefcase, CheckCircle2, Circle, ExternalLink, Link2, FileText } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Student, Placement, Session, Application } from '../../types'
import Header from '../../components/layout/Header'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { getInitials, formatCurrency } from '../../lib/utils'

export default function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [placement, setPlacement] = useState<Placement | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: s }, { data: pl }, { data: se }, { data: apps }] = await Promise.all([
        supabase.from('students').select('*, career_advisor:profiles(id,name,email,role)').eq('id', id).single(),
        supabase.from('placements').select('*').eq('student_id', id).eq('is_current', true).single(),
        supabase.from('sessions').select('*').eq('student_id', id).single(),
        supabase.from('applications').select('*').eq('student_id', id).order('application_number'),
      ])
      setStudent(s as Student)
      setPlacement(pl)
      setSession(se)
      setApplications(apps ?? [])
      setLoading(false)
    }
    if (id) load()
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-tfi-pink border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!student) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Student not found.</p>
    </div>
  )

  const sessionsCompleted = [session?.session_1_done, session?.session_2_done, session?.session_3_done, session?.session_4_done].filter(Boolean).length

  const RESULT_STYLES: Record<string, string> = {
    'Selected': 'bg-green-50 text-green-700 border-green-200',
    'Rejected at Screening Level': 'bg-red-50 text-red-600 border-red-200',
    'Rejected at Interview Level': 'bg-orange-50 text-orange-600 border-orange-200',
    'Pending': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  }

  return (
    <div>
      <Header
        title="Student Profile"
        subtitle={student.student_id}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>
            <Button icon={<Edit2 className="w-4 h-4" />} onClick={() => navigate(`/admin/students/${id}/edit`)}>Edit</Button>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Hero card */}
        <Card>
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #EF5879, #c73d60)' }}>
              {getInitials(student.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-bold text-tfi-dark">{student.name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{student.student_id} · Batch {student.batch} · {student.school}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {student.placement_status && <Badge label={student.placement_status} variant="status" />}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                {student.contact_number && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" /> {student.contact_number}
                  </div>
                )}
                {(student.career_advisor as any)?.name && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="text-gray-400">Advisor:</span> {(student.career_advisor as any).name}
                  </div>
                )}
                {student.placement_eligible_year && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <span className="text-gray-400">Eligible:</span> {student.placement_eligible_year}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-6">
          {/* Education */}
          <Card className="col-span-1">
            <h3 className="text-sm font-semibold text-tfi-dark mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-tfi-cyan" /> Education
            </h3>
            <div className="space-y-3">
              <InfoRow label="College" value={student.current_college} />
              <InfoRow label="Course" value={student.current_course} />
              <InfoRow label="Grade" value={student.current_grade} />
              <InfoRow label="Duration" value={student.course_duration} />
              <InfoRow label="Graduation" value={student.graduation_status} />
            </div>
          </Card>

          {/* Sessions progress */}
          <Card className="col-span-1">
            <h3 className="text-sm font-semibold text-tfi-dark mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tfi-green" /> Session Progress
            </h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-500">Completed</span>
                <span className="text-sm font-semibold text-tfi-dark">{sessionsCompleted}/4</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${(sessionsCompleted / 4) * 100}%`, backgroundColor: '#B7C930' }} />
              </div>
            </div>
            <div className="space-y-2.5">
              {[
                { done: session?.job_readiness_check, label: 'Job Readiness Check' },
                { done: session?.session_1_done, label: 'S1: Goal Setting' },
                { done: session?.session_2_done, label: 'S2: Job Collaterals' },
                { done: session?.session_3_done, label: 'S3: Interview Prep' },
                { done: session?.session_4_done, label: 'S4: Job Shortlisting' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  {s.done
                    ? <CheckCircle2 className="w-4 h-4 text-tfi-green flex-shrink-0" />
                    : <Circle className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                  <span className={`text-sm ${s.done ? 'text-gray-700' : 'text-gray-400'}`}>{s.label}</span>
                </div>
              ))}
            </div>
            {(session?.resume_link || session?.linkedin_link) && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {session.resume_link && (
                  <a href={session.resume_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-tfi-pink hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> Resume
                  </a>
                )}
                {session.linkedin_link && (
                  <a href={session.linkedin_link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-tfi-cyan hover:underline">
                    <Link2 className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </Card>

          {/* Placement */}
          <Card className="col-span-1">
            <h3 className="text-sm font-semibold text-tfi-dark mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-tfi-pink" /> Current Placement
            </h3>
            {placement?.organization ? (
              <div className="space-y-3">
                <div className="p-3 bg-tfi-pink/5 rounded-xl border border-tfi-pink/20">
                  <p className="font-semibold text-tfi-dark text-sm">{placement.job_role}</p>
                  <p className="text-tfi-pink text-xs mt-0.5">{placement.organization}</p>
                </div>
                <InfoRow label="Industry" value={placement.industry} />
                <InfoRow label="Salary" value={placement.exact_monthly_salary ? formatCurrency(placement.exact_monthly_salary) + '/mo' : placement.salary_range} />
                <InfoRow label="Placed" value={[placement.placement_month, placement.placement_year].filter(Boolean).join(' ')} />
                <InfoRow label="Source" value={placement.opportunity_source} />
              </div>
            ) : (
              <div className="py-6 text-center">
                <Building2 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No placement recorded yet</p>
              </div>
            )}
          </Card>
        </div>

        {/* Applications */}
        {applications.length > 0 && (
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-4">Job Applications</h3>
            <div className="grid grid-cols-3 gap-4">
              {applications.map((app) => (
                <div key={app.id} className="p-4 border border-gray-100 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-tfi-dark">{app.organization_name ?? '—'}</p>
                      <p className="text-xs text-gray-500">{app.role ?? '—'}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full border flex-shrink-0 ${RESULT_STYLES[app.result ?? ''] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {app.result ?? 'Unknown'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Notes */}
        {student.notes && (
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" /> Advisor Notes
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{student.notes}</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-xs text-gray-400 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-700 text-right">{value || '—'}</span>
    </div>
  )
}

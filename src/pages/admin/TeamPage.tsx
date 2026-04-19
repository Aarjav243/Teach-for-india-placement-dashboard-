import { useEffect, useState } from 'react'
import { UserPlus, Users, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { getInitials } from '../../lib/utils'

interface AdvisorRow {
  id: string
  name: string
  email: string
  role: string
  studentCount: number
}

export default function TeamPage() {
  const { profile } = useAuth()
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'career_advisor' | 'program_manager'>('career_advisor')
  const [showPw, setShowPw] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function fetchTeam() {
    setLoading(true)
    const { data: profiles } = await supabase.from('profiles').select('id, name, email, role').order('name')
    if (!profiles) { setLoading(false); return }

    const counts: AdvisorRow[] = await Promise.all(
      profiles.map(async (p) => {
        const { count } = await supabase
          .from('students')
          .select('id', { count: 'exact', head: true })
          .eq('career_advisor_id', p.id)
        return { ...p, studentCount: count ?? 0 }
      })
    )
    setAdvisors(counts)
    setLoading(false)
  }

  useEffect(() => { fetchTeam() }, [])

  async function handleCreate() {
    if (!newName || !newEmail || !newPassword) { setError('All fields are required'); return }
    setCreating(true)
    setError('')
    setSuccess('')

    // Save current session to restore after signUp replaces it
    const { data: { session: currentSession } } = await supabase.auth.getSession()

    const { error: signUpError } = await supabase.auth.signUp({
      email: newEmail,
      password: newPassword,
      options: { data: { name: newName, role: newRole } },
    })

    if (signUpError) {
      // Restore session regardless
      if (currentSession) await supabase.auth.setSession({ access_token: currentSession.access_token, refresh_token: currentSession.refresh_token })
      setError(signUpError.message)
      setCreating(false)
      return
    }

    // Restore original session
    if (currentSession) {
      await supabase.auth.setSession({ access_token: currentSession.access_token, refresh_token: currentSession.refresh_token })
    }

    setSuccess(`Account created for ${newName}. They can now log in with ${newEmail}.`)
    setNewName(''); setNewEmail(''); setNewPassword(''); setNewRole('career_advisor')
    setShowForm(false)
    fetchTeam()
    setCreating(false)
  }

  const isPM = profile?.role === 'program_manager'

  return (
    <div>
      <Header
        title="Team"
        subtitle="Manage career advisors and their student assignments"
        action={
          isPM ? (
            <Button icon={<UserPlus className="w-4 h-4" />} onClick={() => { setShowForm(!showForm); setError(''); setSuccess('') }}>
              Add Team Member
            </Button>
          ) : undefined
        }
      />

      <div className="p-8 space-y-6">
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Create form */}
        {showForm && isPM && (
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-tfi-pink" /> New Team Member
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name</label>
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)} type="email"
                  placeholder="advisor@teachforindia.org"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink" />
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Temporary Password</label>
                <input value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink" />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 bg-white text-gray-700">
                  <option value="career_advisor">Career Advisor</option>
                  <option value="program_manager">Program Manager</option>
                </select>
              </div>
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            <div className="flex gap-2 mt-4">
              <Button loading={creating} onClick={handleCreate}>Create Account</Button>
              <Button variant="secondary" onClick={() => { setShowForm(false); setError('') }}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Team table */}
        <Card padding="none">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-tfi-pink border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Member</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Students Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {advisors.map((a) => (
                  <tr key={a.id} className={`${a.id === profile?.id ? 'bg-tfi-pink/5' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                          style={{ background: a.role === 'program_manager' ? 'linear-gradient(135deg,#0EC0E2,#0891b2)' : 'linear-gradient(135deg,#B7C930,#84a010)' }}>
                          {getInitials(a.name)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-tfi-dark">
                            {a.name} {a.id === profile?.id && <span className="text-xs text-gray-400 font-normal">(you)</span>}
                          </p>
                          <p className="text-xs text-gray-400">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge label={a.role} variant="role" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-300" />
                        <span className="text-sm font-medium text-gray-700">{a.studentCount}</span>
                        {a.studentCount === 0 && a.role === 'career_advisor' && (
                          <span className="text-xs text-gray-400">— no students assigned yet</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <p className="text-xs text-gray-400">
          To assign students to a career advisor, open any student's edit form and select their advisor in the Basic Info section.
        </p>
      </div>
    </div>
  )
}

import { useEffect, useState, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search, Plus, Filter, ChevronRight, Users, UserCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Student } from '../../types'
import { PLACEMENT_STATUSES, SCHOOLS } from '../../constants'
import Header from '../../components/layout/Header'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { getInitials } from '../../lib/utils'

const BATCHES = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterBatch, setFilterBatch] = useState('')
  const [filterSchool, setFilterSchool] = useState('')
  const [totalCount, setTotalCount] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()
  const viewMine = searchParams.get('view') === 'mine'

  const { profile } = useAuth()
  const navigate = useNavigate()

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('students')
      .select('*, career_advisor:profiles(id,name,email,role)', { count: 'exact' })
      .order('batch', { ascending: false })
      .order('name')

    if (viewMine && profile?.id) {
      query = query.eq('career_advisor_id', profile.id)
    }
    if (filterStatus) query = query.eq('placement_status', filterStatus)
    if (filterBatch) query = query.eq('batch', parseInt(filterBatch))
    if (filterSchool) query = query.eq('school', filterSchool)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data, count, error } = await query.range(0, 99)
    if (!error) {
      setStudents(data as Student[])
      setTotalCount(count ?? 0)
    }
    setLoading(false)
  }, [viewMine, profile?.id, filterStatus, filterBatch, filterSchool, search])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  function toggleView() {
    setSearchParams(viewMine ? {} : { view: 'mine' })
  }

  const hasFilters = filterStatus || filterBatch || filterSchool

  return (
    <div>
      <Header
        title={viewMine ? 'My Students' : 'All Students'}
        subtitle={`${totalCount} student${totalCount !== 1 ? 's' : ''} found`}
        action={
          <Button icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/admin/students/new')}>
            Add Student
          </Button>
        }
      />

      <div className="p-8 space-y-6">
        {/* View toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => !viewMine || toggleView()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!viewMine ? 'bg-white text-tfi-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="w-4 h-4" /> All Students
            </button>
            <button
              onClick={() => viewMine || toggleView()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMine ? 'bg-white text-tfi-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <UserCheck className="w-4 h-4" /> My Students
            </button>
          </div>
        </div>

        {/* Search + Filters */}
        <Card padding="sm">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 text-gray-600 bg-white"
              >
                <option value="">All Batches</option>
                {BATCHES.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>

              <select
                value={filterSchool}
                onChange={(e) => setFilterSchool(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 text-gray-600 bg-white"
              >
                <option value="">All Schools</option>
                {SCHOOLS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 text-gray-600 bg-white"
              >
                <option value="">All Statuses</option>
                {PLACEMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {hasFilters && (
                <button onClick={() => { setFilterStatus(''); setFilterBatch(''); setFilterSchool('') }}
                  className="text-xs text-tfi-pink hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card padding="none">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-3 border-tfi-pink border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-500 text-sm mt-3">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium">No students found</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or add a new student</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">Student</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Batch</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">School</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Advisor</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">Status</th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-4">College</th>
                    <th className="px-4 py-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {students.map((s) => (
                    <tr key={s.id} onClick={() => navigate(`/admin/students/${s.id}`)}
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-tfi-pink to-pink-400 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{getInitials(s.name)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-tfi-dark">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.student_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 font-medium">{s.batch ?? '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{s.school ?? '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{(s.career_advisor as any)?.name ?? '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        {s.placement_status
                          ? <Badge label={s.placement_status} variant="status" />
                          : <span className="text-gray-400 text-sm">—</span>}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 truncate max-w-[160px] block">{s.current_college ?? '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-tfi-pink transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

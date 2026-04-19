import { useEffect, useState, useCallback } from 'react'
import { Users, TrendingUp, AlertTriangle, IndianRupee, UserCheck, Users2, Clock, CheckCircle2 } from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { INDUSTRY_COLORS, PLACEMENT_STATUS_COLORS, SALARY_RANGES } from '../../constants'
import Header from '../../components/layout/Header'
import Card from '../../components/ui/Card'
import { formatCurrency, salaryRangeToMidpoint } from '../../lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  color: string
  bg: string
}

function MetricCard({ label, value, sub, icon: Icon, color, bg }: MetricCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-tfi-dark mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </Card>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-xl px-4 py-3">
      {label && <p className="text-xs text-gray-500 mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: p.color ?? p.fill }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

const GRAD_STATUS_COLORS: Record<string, string> = {
  'Graduate': '#B7C930',
  '1st Year (Studying)': '#0EC0E2',
  '2nd Year (Studying)': '#22D3EE',
  '3rd Year (Studying)': '#67E8F9',
  '4th Year (Studying)': '#A5F3FC',
  'Gap Year': '#F59E0B',
  'Dropout - Doing Job': '#6366F1',
  'Dropout - Doing Business': '#8B5CF6',
  'Dropout - Doing Nothing': '#EF5879',
  'Not in Touch': '#9CA3AF',
}

const APP_RESULT_COLORS: Record<string, string> = {
  'Selected': '#B7C930',
  'Rejected at Screening Level': '#EF5879',
  'Rejected at Interview Level': '#F59E0B',
  'Pending': '#9CA3AF',
}

export default function InsightsDashboard() {
  const { profile } = useAuth()
  const [viewMine, setViewMine] = useState(false)
  const [filterBatch, setFilterBatch] = useState('')
  const [loading, setLoading] = useState(true)

  // Metric cards
  const [totalStudents, setTotalStudents] = useState(0)
  const [placedCount, setPlacedCount] = useState(0)
  const [neetCount, setNeetCount] = useState(0)
  const [avgSalary, setAvgSalary] = useState(0)
  const [inProgressCount, setInProgressCount] = useState(0)
  const [sessionsCompleteCount, setSessionsCompleteCount] = useState(0)

  // Charts
  const [placementStatusData, setPlacementStatusData] = useState<{ name: string; value: number }[]>([])
  const [industryData, setIndustryData] = useState<{ name: string; value: number }[]>([])
  const [salaryData, setSalaryData] = useState<{ range: string; count: number }[]>([])
  const [batchData, setBatchData] = useState<{ batch: string; placed: number; total: number; rate: number }[]>([])
  const [sessionFunnelData, setSessionFunnelData] = useState<{ name: string; value: number }[]>([])
  const [sourceData, setSourceData] = useState<{ name: string; value: number }[]>([])
  const [gradStatusData, setGradStatusData] = useState<{ name: string; value: number }[]>([])
  const [schoolData, setSchoolData] = useState<{ school: string; placed: number; total: number }[]>([])
  const [appOutcomeData, setAppOutcomeData] = useState<{ name: string; value: number }[]>([])
  const [goalVsActualData, setGoalVsActualData] = useState<{ name: string; goal: number; actual: number }[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)

    const advisorFilter = viewMine && profile?.id ? profile.id : null
    const batchFilter = filterBatch ? parseInt(filterBatch) : null

    // ── Students ──
    let sQuery = supabase.from('students').select(
      'placement_status, batch, career_advisor_id, graduation_status, school'
    )
    if (advisorFilter) sQuery = sQuery.eq('career_advisor_id', advisorFilter)
    if (batchFilter) sQuery = sQuery.eq('batch', batchFilter)
    const { data: students } = await sQuery

    if (!students) { setLoading(false); return }
    setTotalStudents(students.length)

    const placed = students.filter(s =>
      s.placement_status === 'Working with Graduation Degree' ||
      s.placement_status === 'Working without Graduation Degree'
    ).length
    setPlacedCount(placed)
    setNeetCount(students.filter(s => s.placement_status === 'NEET').length)
    setInProgressCount(students.filter(s => s.placement_status === 'Placement in Progress').length)

    const statusCounts: Record<string, number> = {}
    students.forEach(s => { if (s.placement_status) statusCounts[s.placement_status] = (statusCounts[s.placement_status] ?? 0) + 1 })
    setPlacementStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))

    const batchMap: Record<string, { placed: number; total: number }> = {}
    students.forEach(s => {
      if (!s.batch) return
      const k = s.batch.toString()
      if (!batchMap[k]) batchMap[k] = { placed: 0, total: 0 }
      batchMap[k].total++
      if (s.placement_status === 'Working with Graduation Degree' || s.placement_status === 'Working without Graduation Degree') batchMap[k].placed++
    })
    setBatchData(Object.entries(batchMap).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([batch, d]) => ({
      batch, placed: d.placed, total: d.total, rate: Math.round((d.placed / d.total) * 100)
    })))

    // Graduation status breakdown
    const gradCounts: Record<string, number> = {}
    students.forEach(s => { if (s.graduation_status) gradCounts[s.graduation_status] = (gradCounts[s.graduation_status] ?? 0) + 1 })
    setGradStatusData(Object.entries(gradCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))

    // School-wise performance
    const schoolMap: Record<string, { placed: number; total: number }> = {}
    students.forEach(s => {
      const school = s.school || 'Unknown'
      if (!schoolMap[school]) schoolMap[school] = { placed: 0, total: 0 }
      schoolMap[school].total++
      if (s.placement_status === 'Working with Graduation Degree' || s.placement_status === 'Working without Graduation Degree') schoolMap[school].placed++
    })
    setSchoolData(Object.entries(schoolMap).map(([school, d]) => ({ school, placed: d.placed, total: d.total })).sort((a, b) => b.total - a.total))

    // ── Placements ──
    let pQuery = supabase
      .from('placements')
      .select('industry, salary_range, exact_monthly_salary, opportunity_source, goal_industry_1, student:students!inner(batch, career_advisor_id)')
      .eq('is_current', true)
    if (advisorFilter) pQuery = pQuery.eq('student.career_advisor_id', advisorFilter)
    if (batchFilter) pQuery = pQuery.eq('student.batch', batchFilter)
    const { data: placements } = await pQuery

    if (placements && placements.length > 0) {
      const industryCounts: Record<string, number> = {}
      placements.forEach(p => { if (p.industry) industryCounts[p.industry] = (industryCounts[p.industry] ?? 0) + 1 })
      setIndustryData(Object.entries(industryCounts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([name, value]) => ({ name, value })))

      const salaryCounts: Record<string, number> = {}
      placements.forEach(p => { if (p.salary_range) salaryCounts[p.salary_range] = (salaryCounts[p.salary_range] ?? 0) + 1 })
      setSalaryData(SALARY_RANGES.map(r => ({ range: r, count: salaryCounts[r] ?? 0 })))

      const exactSalaries = placements.filter(p => p.exact_monthly_salary && p.exact_monthly_salary > 0).map(p => p.exact_monthly_salary as number)
      if (exactSalaries.length) {
        setAvgSalary(Math.round(exactSalaries.reduce((a, b) => a + b, 0) / exactSalaries.length))
      } else {
        const ranged = placements.filter(p => p.salary_range).map(p => salaryRangeToMidpoint(p.salary_range!))
        if (ranged.length) setAvgSalary(Math.round(ranged.reduce((a, b) => a + b, 0) / ranged.length))
      }

      const sourceCounts: Record<string, number> = {}
      placements.forEach(p => { if (p.opportunity_source) sourceCounts[p.opportunity_source] = (sourceCounts[p.opportunity_source] ?? 0) + 1 })
      setSourceData(Object.entries(sourceCounts).map(([name, value]) => ({ name, value })))

      // Goal vs Actual industry
      const goalCounts: Record<string, number> = {}
      const actualCounts: Record<string, number> = {}
      placements.forEach(p => {
        if (p.goal_industry_1) goalCounts[p.goal_industry_1] = (goalCounts[p.goal_industry_1] ?? 0) + 1
        if (p.industry) actualCounts[p.industry] = (actualCounts[p.industry] ?? 0) + 1
      })
      const allInds = new Set([...Object.keys(goalCounts), ...Object.keys(actualCounts)])
      const combined = Array.from(allInds).map(ind => ({
        name: ind,
        goal: goalCounts[ind] ?? 0,
        actual: actualCounts[ind] ?? 0,
      })).sort((a, b) => (b.goal + b.actual) - (a.goal + a.actual)).slice(0, 7)
      setGoalVsActualData(combined)
    }

    // ── Sessions ──
    let seQuery = supabase
      .from('sessions')
      .select('job_readiness_check, session_1_done, session_2_done, session_3_done, session_4_done, student:students!inner(batch, career_advisor_id)')
    if (advisorFilter) seQuery = seQuery.eq('student.career_advisor_id', advisorFilter)
    if (batchFilter) seQuery = seQuery.eq('student.batch', batchFilter)
    const { data: sessions } = await seQuery

    if (sessions && sessions.length > 0) {
      setSessionFunnelData([
        { name: 'Job Readiness Check', value: sessions.filter(s => s.job_readiness_check).length },
        { name: 'S1: Goal Setting', value: sessions.filter(s => s.session_1_done).length },
        { name: 'S2: Collaterals', value: sessions.filter(s => s.session_2_done).length },
        { name: 'S3: Interview Prep', value: sessions.filter(s => s.session_3_done).length },
        { name: 'S4: Shortlisting', value: sessions.filter(s => s.session_4_done).length },
      ])
      setSessionsCompleteCount(sessions.filter(s =>
        s.session_1_done && s.session_2_done && s.session_3_done && s.session_4_done
      ).length)
    }

    // ── Applications ──
    let appQuery = supabase
      .from('applications')
      .select('result, student:students!inner(batch, career_advisor_id)')
    if (advisorFilter) appQuery = appQuery.eq('student.career_advisor_id', advisorFilter)
    if (batchFilter) appQuery = appQuery.eq('student.batch', batchFilter)
    const { data: appRows } = await appQuery

    if (appRows && appRows.length > 0) {
      const resultCounts: Record<string, number> = {}
      appRows.forEach(a => { if (a.result) resultCounts[a.result] = (resultCounts[a.result] ?? 0) + 1 })
      setAppOutcomeData(Object.entries(resultCounts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
    }

    setLoading(false)
  }, [viewMine, filterBatch, profile?.id])

  useEffect(() => { fetchData() }, [fetchData])

  const placementRate = totalStudents > 0 ? Math.round((placedCount / totalStudents) * 100) : 0
  const BATCHES = [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]

  return (
    <div>
      <Header title="Insights Dashboard" subtitle="Live overview of placement outcomes" />
      <div className="p-8 space-y-6">

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            <button onClick={() => setViewMine(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${!viewMine ? 'bg-white text-tfi-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <Users2 className="w-4 h-4" /> All Students
            </button>
            <button onClick={() => setViewMine(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMine ? 'bg-white text-tfi-dark shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <UserCheck className="w-4 h-4" /> My Students
            </button>
          </div>
          <select value={filterBatch} onChange={(e) => setFilterBatch(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 text-gray-600">
            <option value="">All Batches</option>
            {BATCHES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          {loading && <div className="w-4 h-4 border-2 border-tfi-pink border-t-transparent rounded-full animate-spin" />}
        </div>

        {/* Metric cards — 3 cols × 2 rows */}
        <div className="grid grid-cols-3 gap-4">
          <MetricCard label="Total Students" value={totalStudents.toLocaleString()} icon={Users} color="#EF5879" bg="#EF587915" sub="in current view" />
          <MetricCard label="Placement Rate" value={`${placementRate}%`} icon={TrendingUp} color="#B7C930" bg="#B7C93015" sub={`${placedCount} placed`} />
          <MetricCard label="Avg. Salary" value={avgSalary > 0 ? formatCurrency(avgSalary) + '/mo' : '—'} icon={IndianRupee} color="#0EC0E2" bg="#0EC0E215" sub="across placed students" />
          <MetricCard label="NEET Count" value={neetCount} icon={AlertTriangle} color="#EF5879" bg="#EF587915" sub="needs attention" />
          <MetricCard label="In Progress" value={inProgressCount} icon={Clock} color="#F59E0B" bg="#F59E0B15" sub="placement ongoing" />
          <MetricCard label="All 4 Sessions Done" value={sessionsCompleteCount} icon={CheckCircle2} color="#B7C930" bg="#B7C93015" sub="fully session-complete" />
        </div>

        {/* Row 2: Placement status + Industry */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Placement Status Breakdown</h3>
            {placementStatusData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={placementStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {placementStatusData.map((entry) => (
                        <Cell key={entry.name} fill={PLACEMENT_STATUS_COLORS[entry.name] ?? '#9CA3AF'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2.5">
                  {placementStatusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PLACEMENT_STATUS_COLORS[entry.name] ?? '#9CA3AF' }} />
                      <span className="text-xs text-gray-600 flex-1 leading-tight">{entry.name}</span>
                      <span className="text-xs font-semibold text-tfi-dark">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <EmptyChart />}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Top Industries</h3>
            {industryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={industryData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={150} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Students" radius={[0, 4, 4, 0]}>
                    {industryData.map((_, i) => <Cell key={i} fill={INDUSTRY_COLORS[i % INDUSTRY_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </Card>
        </div>

        {/* Row 3: Salary distribution + Batch placement rate */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Salary Distribution</h3>
            {salaryData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={salaryData} margin={{ bottom: 20 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Students" fill="#EF5879" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Placement Rate by Batch</h3>
            {batchData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={batchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="batch" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip content={<CustomTooltip />} formatter={(v) => [`${v}%`, 'Placement Rate']} />
                  <Line type="monotone" dataKey="rate" name="Placement %" stroke="#B7C930" strokeWidth={2.5} dot={{ fill: '#B7C930', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </Card>
        </div>

        {/* Row 4: Session funnel + Opportunity source */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-1">Session Completion Funnel</h3>
            <p className="text-xs text-gray-400 mb-4">% of all students who have completed each step</p>
            {sessionFunnelData.some(d => d.value > 0) ? (
              <div className="space-y-2.5">
                {sessionFunnelData.map((step, i) => {
                  const barMax = Math.max(...sessionFunnelData.map(d => d.value), 1)
                  const barPct = Math.round((step.value / barMax) * 100)
                  const ofTotal = totalStudents > 0 ? Math.round((step.value / totalStudents) * 100) : 0
                  const colors = ['#EF5879', '#c96a7f', '#B7C930', '#0EC0E2', '#6366F1']
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">{step.name}</span>
                        <span className="text-xs font-semibold text-tfi-dark">{step.value} <span className="text-gray-400 font-normal">({ofTotal}% of students)</span></span>
                      </div>
                      <div className="w-full h-7 bg-gray-100 rounded-lg overflow-hidden">
                        <div className="h-full rounded-lg transition-all"
                          style={{ width: `${Math.max(barPct, 3)}%`, backgroundColor: colors[i] }}>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : <EmptyChart />}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">How Students Found Jobs</h3>
            {sourceData.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={sourceData} cx="50%" cy="50%" outerRadius={70} paddingAngle={4} dataKey="value">
                      <Cell fill="#EF5879" />
                      <Cell fill="#B7C930" />
                      <Cell fill="#0EC0E2" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {sourceData.map((entry, i) => {
                    const colors = ['#EF5879', '#B7C930', '#0EC0E2']
                    const total = sourceData.reduce((a, b) => a + b.value, 0)
                    return (
                      <div key={entry.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[i] }} />
                            <span className="text-xs text-gray-600">{entry.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-tfi-dark">{entry.value}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full">
                          <div className="h-full rounded-full" style={{ width: `${(entry.value / total) * 100}%`, backgroundColor: colors[i] }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : <EmptyChart />}
          </Card>
        </div>

        {/* Row 5 NEW: Graduation Status + School Performance */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Student Pipeline (Graduation Status)</h3>
            {gradStatusData.length > 0 ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={gradStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                      {gradStatusData.map((entry) => (
                        <Cell key={entry.name} fill={GRAD_STATUS_COLORS[entry.name] ?? '#D1D5DB'} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {gradStatusData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: GRAD_STATUS_COLORS[entry.name] ?? '#D1D5DB' }} />
                      <span className="text-xs text-gray-600 flex-1 leading-tight">{entry.name}</span>
                      <span className="text-xs font-semibold text-tfi-dark">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : <EmptyChart />}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">School-wise Placement Performance</h3>
            {schoolData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={schoolData} margin={{ bottom: 10 }}>
                  <XAxis dataKey="school" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="total" name="Total Students" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="placed" name="Placed" fill="#B7C930" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </Card>
        </div>

        {/* Row 6 NEW: Application Outcomes + Goal vs Actual Industry */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Application Outcomes</h3>
            {appOutcomeData.length > 0 ? (
              <div className="space-y-3">
                {appOutcomeData.map((entry) => {
                  const total = appOutcomeData.reduce((a, b) => a + b.value, 0)
                  const pct = Math.round((entry.value / total) * 100)
                  const color = APP_RESULT_COLORS[entry.name] ?? '#9CA3AF'
                  return (
                    <div key={entry.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                          <span className="text-xs text-gray-600">{entry.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-tfi-dark">{entry.value} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  )
                })}
                <p className="text-xs text-gray-400 pt-1">
                  Total applications tracked: {appOutcomeData.reduce((a, b) => a + b.value, 0)}
                </p>
              </div>
            ) : <EmptyChart />}
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-tfi-dark mb-5">Goal vs Actual Industry</h3>
            {goalVsActualData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={goalVsActualData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={145} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="goal" name="Aspired" fill="#0EC0E2" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="actual" name="Placed" fill="#EF5879" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <EmptyChart />}
          </Card>
        </div>

      </div>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="h-40 flex items-center justify-center">
      <p className="text-sm text-gray-400">No data available yet</p>
    </div>
  )
}

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Layout from './components/layout/Layout'
import StudentsPage from './pages/admin/StudentsPage'
import StudentFormPage from './pages/admin/StudentFormPage'
import StudentDetailPage from './pages/admin/StudentDetailPage'
import TeamPage from './pages/admin/TeamPage'
import InsightsDashboard from './pages/insights/InsightsDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-tfi-pink border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/admin/students" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/admin/students" replace />} />
      <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="students" replace />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>
      <Route path="/insights" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<InsightsDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

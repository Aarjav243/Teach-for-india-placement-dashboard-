import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, GraduationCap } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/admin/students')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #EF5879 0%, #c73d60 100%)' }}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
              <GraduationCap className="w-6 h-6 text-tfi-pink" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Teach For India</p>
              <p className="text-white/70 text-xs">Placement Dashboard</p>
            </div>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Every student<br />deserves a<br />great future.
            </h1>
            <p className="mt-4 text-white/80 text-lg leading-relaxed">
              Track placements, monitor progress, and celebrate the journeys of every TFI alumna and alumnus.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-4 flex-1 text-center">
              <p className="text-white text-2xl font-bold">1000+</p>
              <p className="text-white/70 text-sm mt-1">Students Tracked</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-4 flex-1 text-center">
              <p className="text-white text-2xl font-bold">7+</p>
              <p className="text-white/70 text-sm mt-1">Batches</p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-2xl px-5 py-4 flex-1 text-center">
              <p className="text-white text-2xl font-bold">12+</p>
              <p className="text-white/70 text-sm mt-1">Industries</p>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
        <div className="absolute top-1/2 right-8 w-24 h-24 bg-tfi-green/30 rounded-full" />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-tfi-pink rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-tfi-dark text-lg">Teach For India</p>
              <p className="text-gray-500 text-xs">Placement Dashboard</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-tfi-dark">Welcome back</h2>
            <p className="mt-2 text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@teachforindia.org"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink transition-all pr-12 placeholder-gray-400"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-tfi-pink text-white font-semibold rounded-xl hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-tfi-pink focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-tfi-pink/25">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-400">
            Contact your program manager if you need access.
          </p>
        </div>
      </div>
    </div>
  )
}

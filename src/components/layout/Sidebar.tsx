import { NavLink, useNavigate } from 'react-router-dom'
import { Users, LayoutDashboard, GraduationCap, PlusCircle, UserCheck, LogOut, ChevronRight, UsersRound } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../lib/utils'

const navItems = [
  {
    section: 'Insights',
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, to: '/insights' },
    ],
  },
  {
    section: 'Admin',
    items: [
      { label: 'All Students', icon: Users, to: '/admin/students' },
      { label: 'My Students', icon: UserCheck, to: '/admin/students?view=mine' },
      { label: 'Add Student', icon: PlusCircle, to: '/admin/students/new' },
      { label: 'Team', icon: UsersRound, to: '/admin/team' },
    ],
  },
]

export default function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-tfi-dark flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #EF5879, #c73d60)' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">iTeach</p>
            <p className="text-white/40 text-xs">Placement Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {navItems.map((section) => (
          <div key={section.section}>
            <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              {section.section}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/insights'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                        isActive
                          ? 'bg-tfi-pink text-white shadow-lg shadow-tfi-pink/25'
                          : 'text-white/60 hover:text-white hover:bg-white/10'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight className="w-3 h-3 text-white/60" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Role badge */}
      <div className="px-3 py-2">
        <div className="px-3 py-2 rounded-xl bg-white/5 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${profile?.role === 'program_manager' ? 'bg-tfi-cyan' : 'bg-tfi-green'}`} />
          <span className="text-white/50 text-xs capitalize">
            {profile?.role === 'program_manager' ? 'Program Manager' : 'Career Advisor'}
          </span>
        </div>
      </div>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-tfi-pink flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">
              {profile ? getInitials(profile.name) : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.name ?? 'User'}</p>
            <p className="text-white/40 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-red-500/20 transition-all group">
          <LogOut className="w-4 h-4 flex-shrink-0 text-white/40 group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}

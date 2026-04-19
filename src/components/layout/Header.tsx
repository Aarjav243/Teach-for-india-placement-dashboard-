import { Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { profile } = useAuth()

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-xl font-bold text-tfi-dark">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {action}
        <button className="relative w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
          <div className="w-6 h-6 rounded-full bg-tfi-pink flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {profile?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {profile?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  )
}

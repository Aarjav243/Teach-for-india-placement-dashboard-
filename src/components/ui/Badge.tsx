import { PLACEMENT_STATUS_COLORS } from '../../constants'
import { cn } from '../../lib/utils'

interface BadgeProps {
  label: string
  variant?: 'status' | 'industry' | 'role' | 'default'
  className?: string
}

const ROLE_STYLES: Record<string, string> = {
  program_manager: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  career_advisor: 'bg-green-50 text-green-700 border-green-200',
}

export default function Badge({ label, variant = 'default', className }: BadgeProps) {
  if (variant === 'status') {
    const color = PLACEMENT_STATUS_COLORS[label] ?? '#9CA3AF'
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', className)}
        style={{ backgroundColor: `${color}15`, color, borderColor: `${color}40` }}>
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
        {label}
      </span>
    )
  }

  if (variant === 'role') {
    return (
      <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize', ROLE_STYLES[label] ?? 'bg-gray-50 text-gray-600 border-gray-200', className)}>
        {label === 'program_manager' ? 'Program Manager' : 'Career Advisor'}
      </span>
    )
  }

  return (
    <span className={cn('inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600', className)}>
      {label}
    </span>
  )
}

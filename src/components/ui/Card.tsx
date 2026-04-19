import { cn } from '../../lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const PADDING = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' }

export default function Card({ children, className, padding = 'md' }: CardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm', PADDING[padding], className)}>
      {children}
    </div>
  )
}

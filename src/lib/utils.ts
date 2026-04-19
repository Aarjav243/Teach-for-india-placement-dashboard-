import { SALARY_RANGES } from '../constants'

export function salaryRangeToMidpoint(range: string): number {
  const map: Record<string, number> = {
    '0-10k': 7500,
    '11-15k': 13000,
    '16-20k': 18000,
    '21-25k': 23000,
    '25-30k': 27500,
    'More than 30k': 35000,
  }
  return map[range] ?? 0
}

export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`
  return `₹${amount}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const SALARY_ORDER = SALARY_RANGES

import { cn } from '../../lib/utils'

interface SelectFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  required?: boolean
  className?: string
}

interface InputFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  className?: string
}

interface TextAreaFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

const inputClass = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tfi-pink/30 focus:border-tfi-pink transition-all bg-white placeholder-gray-400'
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5'

export function SelectField({ label, value, onChange, options, placeholder, required, className }: SelectFieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required && <span className="text-tfi-pink ml-0.5">*</span>}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cn(inputClass, !value && 'text-gray-400')}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export function InputField({ label, value, onChange, type = 'text', placeholder, required, className }: InputFieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}{required && <span className="text-tfi-pink ml-0.5">*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
    </div>
  )
}

export function TextAreaField({ label, value, onChange, placeholder, rows = 3, className }: TextAreaFieldProps) {
  return (
    <div className={className}>
      <label className={labelClass}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(inputClass, 'resize-none')}
      />
    </div>
  )
}

interface CheckboxFieldProps {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}

export function CheckboxField({ label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={cn(
          'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all',
          checked ? 'bg-tfi-pink border-tfi-pink' : 'border-gray-300 bg-white group-hover:border-tfi-pink/50'
        )}>
          {checked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </label>
  )
}

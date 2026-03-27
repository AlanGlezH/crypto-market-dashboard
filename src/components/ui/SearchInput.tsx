import type { ChangeEvent } from 'react'

export type SearchInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({
  id,
  label,
  value,
  onChange,
  placeholder = 'Search by name or symbol',
}: SearchInputProps) {
  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value)
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="w-full max-w-sm rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60"
      />
    </div>
  )
}

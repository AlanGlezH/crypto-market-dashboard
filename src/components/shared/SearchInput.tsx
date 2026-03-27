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

  function handleClear() {
    onChange('')
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {label}
      </label>
      <div className="relative w-full max-w-sm">
        <input
          id={id}
          type="search"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-md border border-slate-200 bg-white py-2 pl-3 pr-8 text-sm text-slate-900 shadow-sm placeholder:text-slate-500 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300/60"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute inset-y-0 right-0 flex w-8 cursor-pointer items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
          >
            <svg
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-3 w-3"
              aria-hidden
            >
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

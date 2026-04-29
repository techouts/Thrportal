import * as React from 'react'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export interface MultiSelectOption {
  value: string
  label: string
  meta?: any
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  emptyText?: string
  disabled?: boolean
  className?: string
}

/**
 * Chip-based multi-select.
 *
 * Built on Radix Popover + plain buttons (not cmdk CommandItem) because
 * cmdk's onSelect/onClick handlers conflict with Radix Dialog focus-trap,
 * causing clicks inside a Dialog to do nothing. This implementation uses
 * a fully controlled list of buttons and a debounced text filter, so click
 * selection is deterministic.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  emptyText = 'Nothing found.',
  disabled,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')

  const labelByValue = React.useMemo(() => {
    const m = new Map<string, string>()
    for (const o of options) m.set(o.value, o.label)
    return m
  }, [options])

  const filtered = React.useMemo(() => {
    if (!query.trim()) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  const toggle = React.useCallback(
    (v: string) => {
      if (value.includes(v)) onChange(value.filter((x) => x !== v))
      else onChange([...value, v])
    },
    [value, onChange],
  )

  const removeChip = (v: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter((x) => x !== v))
  }

  return (
    // `modal` is required when this is rendered inside a Radix Dialog, otherwise
    // the Dialog's pointer-event scope swallows clicks on popover items.
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'w-full justify-between min-h-9 h-auto py-1.5',
            !value.length && 'text-muted-foreground',
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 items-center max-w-full">
            {value.length === 0 && <span>{placeholder}</span>}
            {value.map((v) => (
              <Badge key={v} variant="secondary" className="gap-1 pr-1">
                <span className="truncate max-w-[200px]">{labelByValue.get(v) ?? v}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => removeChip(v, e)}
                  className="rounded hover:bg-background/80 ml-0.5 inline-flex"
                >
                  <X className="h-3 w-3" />
                </span>
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        // Don't pull focus into the popover — that would close the parent
        // Dialog's autofocus. We let the Input below focus naturally.
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="p-2 border-b">
          <Input
            autoFocus
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8"
          />
        </div>
        <div className="max-h-[260px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">{emptyText}</div>
          ) : (
            filtered.map((o) => {
              const selected = value.includes(o.value)
              return (
                <button
                  type="button"
                  key={o.value}
                  // Plain onClick — fires reliably regardless of focus trap
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggle(o.value)
                  }}
                  className={cn(
                    'w-full text-left flex items-center px-3 py-1.5 text-sm cursor-pointer',
                    'hover:bg-accent hover:text-accent-foreground',
                    selected && 'bg-accent/40',
                  )}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selected ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className="truncate">{o.label}</span>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

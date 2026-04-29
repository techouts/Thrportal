import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Filters } from './types'

interface Props {
  filters: Filters
  onChange: (next: Filters) => void
  options: {
    countries: string[]
    departments: string[]
    clients: string[]
    projects: string[]
  }
}

const ALL = '__all__'

// Radix <Select.Item> forbids empty string as `value` — it conflicts with the
// "clear selection / show placeholder" semantics. Strip blanks defensively.
const clean = (xs: string[]) => Array.from(new Set(xs.map((x) => x?.trim()).filter(Boolean)))

export function FilterBar({ filters, onChange, options }: Props) {
  const set = (k: keyof Filters, v: string) =>
    onChange({ ...filters, [k]: v === ALL ? '' : (v as any) })

  const countries = clean(options.countries)
  const departments = clean(options.departments)
  const clients = clean(options.clients)

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Input
        placeholder="Search name, code, client, project…"
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        className="w-64"
      />

      <Select value={filters.country || ALL} onValueChange={(v) => set('country', v)}>
        <SelectTrigger className="w-36"><SelectValue placeholder="Country" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All countries</SelectItem>
          {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.department || ALL} onValueChange={(v) => set('department', v)}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All departments</SelectItem>
          {departments.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.client || ALL} onValueChange={(v) => set('client', v)}>
        <SelectTrigger className="w-48"><SelectValue placeholder="Client" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All clients</SelectItem>
          {clients.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>

      <Select value={filters.billable || ALL} onValueChange={(v) => set('billable', v)}>
        <SelectTrigger className="w-40"><SelectValue placeholder="Billable" /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All</SelectItem>
          <SelectItem value="BILLABLE">Billable</SelectItem>
          <SelectItem value="NON_BILLABLE">Non-billable</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={() => onChange({})}>Reset</Button>
    </div>
  )
}

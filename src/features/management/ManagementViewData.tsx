import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileSpreadsheet } from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { useAuth } from '@/auth/AuthContext'
import { FilterBar } from './FilterBar'
import { AllocationsTable } from './AllocationsTable'
import { EditAllocationModal } from './EditAllocationModal'
import { fetchAllocations, fetchDashboard, fetchOptions, updateRow } from './api'
import type { AllocationRow, DashboardResponse, Filters, ListResponse, ManagementOptions } from './types'

const EDIT_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'MANAGEMENT', 'HR_MANAGER'])

// Export shape mirrors the table; arrays are joined into a single cell.
const EXPORT_COLS: Array<{ key: keyof AllocationRow; label: string }> = [
  { key: 'employeeCode',      label: 'Employee #' },
  { key: 'preferredName',     label: 'Preferred Name' },
  { key: 'hireDate',          label: 'Hire Date' },
  { key: 'department',        label: 'Department' },
  { key: 'jobTitle',          label: 'Job Title' },
  { key: 'country',           label: 'Country' },
  { key: 'clients',           label: 'Clients' },
  { key: 'projects',          label: 'Projects' },
  { key: 'billable',          label: 'Billable / Non Billable' },
  { key: 'commenced',         label: 'Commenced (earliest active)' },
  { key: 'nonBillableReason', label: 'Status / Reason' },
  { key: 'allocationCount',   label: 'Allocations' },
]

function exportCellValue(v: unknown): string | number {
  if (Array.isArray(v))    return v.join(', ')
  if (v === 'BILLABLE')    return 'Billable'
  if (v === 'NON_BILLABLE') return 'Non-Billable'
  if (v === null || v === undefined) return ''
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10)
  return v as string | number
}

export function ManagementViewData() {
  const { user } = useAuth()
  const canEdit = !!user && EDIT_ROLES.has(user.role)

  const [filters, setFilters] = useState<Filters>({})
  const [list, setList] = useState<ListResponse | null>(null)
  const [filterOpts, setFilterOpts] = useState<DashboardResponse['filterOptions']>({
    countries: [], departments: [], clients: [], projects: [],
  })
  const [options, setOptions] = useState<ManagementOptions | null>(null)
  const [loading, setLoading] = useState(false)
  const [editRow, setEditRow] = useState<AllocationRow | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  // Load dropdown options once when the tab mounts (or after a save, to pick up
  // newly distinct departments/job titles).
  const loadOptions = useCallback(async () => {
    try {
      const o = await fetchOptions()
      setOptions(o)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load dropdown options')
    }
  }, [])

  useEffect(() => { loadOptions() }, [loadOptions])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [l, d] = await Promise.all([
        fetchAllocations(filters, 1, 500),
        fetchDashboard(filters),
      ])
      setList(l)
      setFilterOpts(d.filterOptions)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleSave = async (patch: Parameters<typeof updateRow>[0] extends infer P ? Omit<Extract<P, object>, 'userId'> : never) => {
    if (!editRow) return
    await updateRow({ userId: editRow.employeeId, ...patch })
    toast.success('Saved')
    // Refresh both the list and the option lists (new distinct values may exist)
    await Promise.all([load(), loadOptions()])
  }

  const buildExportRows = () =>
    (list?.items ?? []).map((r) => {
      const out: Record<string, string | number> = {}
      for (const c of EXPORT_COLS) out[c.label] = exportCellValue((r as any)[c.key])
      return out
    })

  const exportXlsx = () => {
    if (!list?.items?.length) { toast.error('Nothing to export'); return }
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(buildExportRows(), { header: EXPORT_COLS.map((c) => c.label) })
    XLSX.utils.book_append_sheet(wb, ws, 'Workforce')
    XLSX.writeFile(wb, `management-workforce-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const exportCsv = () => {
    if (!list?.items?.length) { toast.error('Nothing to export'); return }
    const ws = XLSX.utils.json_to_sheet(buildExportRows(), { header: EXPORT_COLS.map((c) => c.label) })
    const csv = XLSX.utils.sheet_to_csv(ws)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `management-workforce-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <FilterBar filters={filters} onChange={setFilters} options={filterOpts} />
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={exportXlsx} disabled={!list?.items?.length}>
                <FileSpreadsheet className="h-4 w-4 mr-1" /> Export XLSX
              </Button>
              <Button variant="outline" size="sm" onClick={exportCsv} disabled={!list?.items?.length}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              {list ? (
                <>
                  Employees <span className="text-muted-foreground">({list.items.length} of {list.total})</span>
                </>
              ) : '—'}
            </div>
            {loading && <span className="text-xs text-muted-foreground">Loading…</span>}
          </div>

          <AllocationsTable
            rows={list?.items ?? []}
            canEdit={canEdit}
            onEdit={(r) => { setEditRow(r); setModalOpen(true) }}
            onDelete={() => { /* no delete — soft delete via is_active flag is the right path */ }}
          />
        </CardContent>
      </Card>

      <EditAllocationModal
        open={modalOpen}
        initial={editRow}
        options={options}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  )
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil } from 'lucide-react'
import type { AllocationRow } from './types'

interface Props {
  rows: AllocationRow[]
  canEdit: boolean
  onEdit: (row: AllocationRow) => void
  onDelete: (row: AllocationRow) => void
}

export function AllocationsTable({ rows, canEdit, onEdit, onDelete }: Props) {
  if (rows.length === 0) {
    return <div className="py-10 text-center text-sm text-muted-foreground">No employees match the current filters.</div>
  }

  const dateOnly = (v?: string | null) => (v ? String(v).slice(0, 10) : '—')

  return (
    <div className="rounded-md border w-full overflow-x-auto">
      <Table className="min-w-[1600px] text-sm">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="min-w-[100px]">Employee #</TableHead>
            <TableHead className="min-w-[180px]">Preferred Name</TableHead>
            <TableHead className="min-w-[110px]">Hire Date</TableHead>
            <TableHead className="min-w-[160px]">Department</TableHead>
            <TableHead className="min-w-[160px]">Job Title</TableHead>
            <TableHead className="min-w-[90px]">Country</TableHead>
            <TableHead className="min-w-[180px]">Clients</TableHead>
            <TableHead className="min-w-[260px]">Projects</TableHead>
            <TableHead className="min-w-[130px]">Billable</TableHead>
            <TableHead className="min-w-[110px]">Commenced</TableHead>
            <TableHead className="min-w-[180px]">Status / Reason</TableHead>
            {canEdit && <TableHead className="sticky right-0 bg-background w-20 min-w-[80px]">Edit</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            const clientList = r.clients?.length ? r.clients.join(', ') : '—'
            const projectList = r.projects?.length ? r.projects.join(', ') : '—'
            return (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.employeeCode ?? '—'}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{r.preferredName ?? '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{dateOnly(r.hireDate)}</TableCell>
                <TableCell className="whitespace-nowrap">{r.department ?? '—'}</TableCell>
                <TableCell className="whitespace-nowrap">{r.jobTitle ?? '—'}</TableCell>
                <TableCell>{r.country ?? '—'}</TableCell>
                <TableCell className="max-w-[260px]" title={clientList}>
                  {r.clients?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {r.clients.map((c) => <Badge key={c} variant="outline">{c}</Badge>)}
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell className="max-w-[360px]" title={projectList}>
                  {r.projects?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {r.projects.map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
                    </div>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  <Badge variant={r.billable === 'BILLABLE' ? 'default' : 'secondary'}>
                    {r.billable === 'BILLABLE' ? 'Billable' : 'Non-billable'}
                  </Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">{dateOnly(r.commenced)}</TableCell>
                <TableCell className="whitespace-nowrap">{r.nonBillableReason ?? (r.billable === 'BILLABLE' ? 'Active' : '—')}</TableCell>
                {canEdit && (
                  <TableCell className="sticky right-0 bg-background">
                    <Button size="icon" variant="ghost" onClick={() => onEdit(r)} title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

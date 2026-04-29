import { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/ui/multi-select'
import type { AllocationRow, ManagementOptions } from './types'

interface Props {
  open: boolean
  initial: AllocationRow | null
  options: ManagementOptions | null
  onClose: () => void
  onSave: (patch: {
    department?: string
    country?: string
    jobTitle?: string
    hireDate?: string
    preferredName?: string
    clientIds?: string[]
    projectIds?: string[]
    billable?: 'BILLABLE' | 'NON_BILLABLE'
    commenced?: string
  }) => Promise<void>
}

const NONE = '__none__'

export function EditAllocationModal({ open, initial, options, onClose, onSave }: Props) {
  // Employee-level fields
  const [form, setForm] = useState<Partial<AllocationRow>>({})
  // Allocation-level state (multi-selects + status + date)
  const [selectedClientIds,  setSelectedClientIds]  = useState<string[]>([])
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [billable, setBillable] = useState<'BILLABLE' | 'NON_BILLABLE'>('BILLABLE')
  const [commenced, setCommenced] = useState<string>('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize from the row whenever the modal opens
  useEffect(() => {
    if (!open) return
    setForm(initial ? { ...initial } : {})
    setError(null)

    // Map current client/project NAMES (from the row) → IDs (from options)
    const opts = options
    if (!opts || !initial) {
      setSelectedClientIds([])
      setSelectedProjectIds([])
      setBillable(initial?.billable ?? 'BILLABLE')
      setCommenced(initial?.commenced ? String(initial.commenced).slice(0, 10) : '')
      return
    }
    const clientNameToId = new Map(opts.clients.map((c) => [c.name, c.id]))
    const projectNameToId = new Map(opts.projects.map((p) => [p.name, p.id]))
    setSelectedClientIds((initial.clients ?? []).map((n) => clientNameToId.get(n)!).filter(Boolean))
    setSelectedProjectIds((initial.projects ?? []).map((n) => projectNameToId.get(n)!).filter(Boolean))
    setBillable(initial.billable ?? 'BILLABLE')
    setCommenced(initial.commenced ? String(initial.commenced).slice(0, 10) : '')
  }, [open, initial, options])

  // NOTE: previously a useEffect auto-deselected projects when the Client
  // filter changed. That silently dropped allocations on save — removed.
  // The Clients multi-select is now ONLY a visibility filter for the
  // Projects dropdown; it never mutates the selected projects.

  // Project options — filtered by selected clients only for visibility.
  // Each label shows "Project — Client" so the choice is unambiguous.
  const projectMSOptions = useMemo(() => {
    if (!options) return []
    const clientsById = new Map(options.clients.map((c) => [c.id, c.name]))
    const list = selectedClientIds.length === 0
      ? options.projects
      : options.projects.filter((p) => p.clientId && selectedClientIds.includes(p.clientId))
    return list.map((p) => {
      const clientName = p.clientId ? clientsById.get(p.clientId) : null
      return {
        value: p.id,
        label: clientName ? `${p.name} — ${clientName}` : p.name,
        meta: p.clientId,
      }
    })
  }, [options, selectedClientIds])

  const clientMSOptions = useMemo(
    () => (options?.clients ?? []).map((c) => ({ value: c.id, label: c.name })),
    [options],
  )

  const set = <K extends keyof AllocationRow>(k: K, v: any) =>
    setForm((f) => ({ ...f, [k]: v }))
  const dropdown = (v: string) => (v === NONE ? '' : v)
  const dateOnly = (v?: string | null) => (v ? String(v).slice(0, 10) : '')

  const submit = async () => {
    setSaving(true); setError(null)
    try {
      await onSave({
        preferredName: form.preferredName ?? undefined,
        hireDate:      form.hireDate ?? undefined,
        country:       form.country ?? undefined,
        department:    form.department ?? undefined,
        jobTitle:      form.jobTitle ?? undefined,
        clientIds:     selectedClientIds,
        projectIds:    selectedProjectIds,
        billable,
        commenced:     commenced || undefined,
      })
      onClose()
    } catch (e: any) {
      setError(e?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Employee #">
            <Input value={form.employeeCode ?? ''} readOnly disabled className="font-mono" />
          </Field>
          <Field label="Preferred Name">
            <Input value={form.preferredName ?? ''} onChange={(e) => set('preferredName', e.target.value)} />
          </Field>

          <Field label="Hire Date">
            <Input type="date" value={dateOnly(form.hireDate)} onChange={(e) => set('hireDate', e.target.value)} />
          </Field>

          <Field label="Country">
            <Select value={form.country || NONE} onValueChange={(v) => set('country', dropdown(v))}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {options?.countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Department">
            <Select value={form.department || NONE} onValueChange={(v) => set('department', dropdown(v))}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {options?.departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Job Title">
            <Select value={form.jobTitle || NONE} onValueChange={(v) => set('jobTitle', dropdown(v))}>
              <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>—</SelectItem>
                {options?.jobTitles.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>

        {/* Allocations — now editable */}
        <div className="space-y-3 border-t pt-4 mt-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase">Allocations</div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Filter projects by client (display only)">
              <MultiSelect
                options={clientMSOptions}
                value={selectedClientIds}
                onChange={setSelectedClientIds}
                placeholder="All clients"
              />
            </Field>

            <Field label="Projects (selected = active assignments)">
              <MultiSelect
                options={projectMSOptions}
                value={selectedProjectIds}
                onChange={setSelectedProjectIds}
                placeholder="Select projects"
                emptyText={selectedClientIds.length ? 'No projects under selected clients.' : 'No projects.'}
              />
            </Field>

            <Field label="Billable status">
              <Select value={billable} onValueChange={(v) => setBillable(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BILLABLE">Billable</SelectItem>
                  <SelectItem value="NON_BILLABLE">Non-billable</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Commenced">
              <Input type="date" value={commenced} onChange={(e) => setCommenced(e.target.value)} />
            </Field>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Projects</strong> is the source of truth — the clients column is derived
            from each project's parent client. The Clients filter only narrows the project
            dropdown for easier picking; it never adds or removes selections by itself.
            Projects you remove get soft-archived (kept for history).
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Copy, Mail } from 'lucide-react'
import { inviteEmployee, type InviteEmployeeInput, type InviteEmployeeResult } from '@/features/auth/api'

interface Props {
  open: boolean
  onClose: () => void
  onInvited?: (result: InviteEmployeeResult) => void
}

const ROLE_OPTIONS = ['EMPLOYEE', 'MANAGER', 'HR_MANAGER', 'RECRUITER', 'PROJECT_LEAD', 'ADMIN']

export function InviteEmployeeModal({ open, onClose, onInvited }: Props) {
  const [form, setForm] = useState<InviteEmployeeInput>({
    firstName: '', lastName: '', email: '', phone: '', role: ['EMPLOYEE'],
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<InviteEmployeeResult | null>(null)

  const set = <K extends keyof InviteEmployeeInput>(k: K, v: InviteEmployeeInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const reset = () => {
    setForm({ firstName: '', lastName: '', email: '', phone: '', role: ['EMPLOYEE'] })
    setResult(null)
  }

  const submit = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error('First name, last name, email, and phone are required')
      return
    }
    setSubmitting(true)
    try {
      const r = await inviteEmployee(form)
      setResult(r)
      onInvited?.(r)
      toast.success(`Invited ${r.user.email}`)
    } catch (e: any) {
      toast.error(e?.message || 'Invite failed')
    } finally {
      setSubmitting(false)
    }
  }

  const close = () => {
    reset()
    onClose()
  }

  const copyTemp = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.temporaryPassword)
    toast.success('Temporary password copied')
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && close()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{result ? 'Employee Invited' : 'Invite Employee'}</DialogTitle>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                <span className="font-medium">{result.user.email}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.user.firstName} {result.user.lastName} · roles: {result.user.roles.join(', ')}
              </p>
            </div>

            <div className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
              <div className="text-xs uppercase font-semibold text-amber-700 dark:text-amber-300">
                One-time temporary password (expires in {result.expiresInHours}h)
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-lg select-all bg-background px-3 py-2 rounded">
                  {result.temporaryPassword}
                </code>
                <Button size="sm" variant="outline" onClick={copyTemp}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this with the employee. They'll be forced to set a new password on first login.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => { reset() }}>Invite another</Button>
              <Button onClick={close}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name *">
                <Input value={form.firstName} onChange={(e) => set('firstName', e.target.value)} />
              </Field>
              <Field label="Last Name *">
                <Input value={form.lastName} onChange={(e) => set('lastName', e.target.value)} />
              </Field>
              <Field label="Email *" colSpan={2}>
                <Input type="email" placeholder="name@techouts.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field label="Phone *">
                <Input placeholder="+919876543210" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field label="Role *">
                <Select value={form.role[0]} onValueChange={(v) => set('role', [v])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Department">
                <Input value={form.department ?? ''} onChange={(e) => set('department', e.target.value)} />
              </Field>
              <Field label="Employee Type">
                <Input placeholder="FULL_TIME / CONTRACT" value={form.employeeType ?? ''} onChange={(e) => set('employeeType', e.target.value)} />
              </Field>
              <Field label="City">
                <Input value={form.city ?? ''} onChange={(e) => set('city', e.target.value)} />
              </Field>
              <Field label="Business Unit">
                <Input value={form.businessUnit ?? ''} onChange={(e) => set('businessUnit', e.target.value)} />
              </Field>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={close} disabled={submitting}>Cancel</Button>
              <Button onClick={submit} disabled={submitting}>
                {submitting ? 'Inviting…' : 'Invite'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children, colSpan = 1 }: { label: string; children: React.ReactNode; colSpan?: 1 | 2 }) {
  return (
    <div className={`space-y-1 ${colSpan === 2 ? 'col-span-2' : ''}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

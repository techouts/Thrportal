import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { resetPasswordWithTemp } from '@/features/auth/api'

export default function SetPassword() {
  const nav = useNavigate()
  const location = useLocation() as { state?: { email?: string; tempPassword?: string } }
  const { signOut, signIn } = useAuth()

  const [email, setEmail] = useState(location.state?.email ?? '')
  const [tempPassword, setTempPassword] = useState(location.state?.tempPassword ?? '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return }

    setLoading(true)
    try {
      // Reset the password — backend revokes all existing refresh tokens
      await resetPasswordWithTemp({ email, temporaryPassword: tempPassword, newPassword, confirmPassword })

      // Clear the now-invalidated session and re-login with the new password
      await signOut().catch(() => {})
      await signIn(email, newPassword)
      toast.success('Password updated. Welcome!')
      nav('/Home')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to set password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8 space-y-6">
        <div className="text-center space-y-2">
          <ShieldCheck className="h-10 w-10 mx-auto text-primary" />
          <h1 className="text-2xl font-bold">Set your password</h1>
          <p className="text-sm text-muted-foreground">
            One-time setup — choose a permanent password to access HRMS.
          </p>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required readOnly={!!location.state?.email} />
          </div>
          <div className="space-y-1">
            <Label>Temporary password</Label>
            <Input type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Confirm new password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Setting password…' : 'Set password & continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}

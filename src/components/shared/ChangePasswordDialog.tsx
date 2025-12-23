import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Check, X, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/auth/AuthContext"
import {
  hasMinLength,
  hasNumber,
  hasSpecialChar,
  passwordsMatch,
  isDefaultPassword
} from "@/lib/passwordValidation"

interface ChangePasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Validation states
  const validations = {
    minLength: hasMinLength(newPassword),
    hasNumber: hasNumber(newPassword),
    hasSpecialChar: hasSpecialChar(newPassword),
    passwordsMatch: passwordsMatch(newPassword, confirmPassword),
    notSameAsOld: newPassword.length > 0 && !isDefaultPassword(newPassword, oldPassword)
  }

  const allValid = Object.values(validations).every(Boolean) && oldPassword.length > 0

  const resetForm = () => {
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
  }

  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  const handleChangePassword = async () => {
    if (!allValid || !user?.email) return

    setIsLoading(true)
    try {
      // Step 1: Verify old password by attempting sign-in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword
      })

      if (signInError) {
        toast({
          title: "Incorrect Password",
          description: "The old password you entered is incorrect.",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Step 2: Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        toast({
          title: "Update Failed",
          description: updateError.message,
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully."
      })

      handleClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const ValidationItem = ({ valid, label }: { valid: boolean; label: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={valid ? "text-green-500" : "text-muted-foreground"}>{label}</span>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Old Password */}
          <div className="space-y-2">
            <Label htmlFor="old-password">Current Password</Label>
            <div className="relative">
              <Input
                id="old-password"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Validation Requirements */}
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-foreground">Password Requirements:</p>
            <div className="grid gap-1">
              <ValidationItem valid={validations.minLength} label="At least 6 characters" />
              <ValidationItem valid={validations.hasNumber} label="Contains at least 1 number" />
              <ValidationItem valid={validations.hasSpecialChar} label="Contains at least 1 special character" />
              <ValidationItem valid={validations.passwordsMatch} label="Passwords match" />
              <ValidationItem valid={validations.notSameAsOld} label="Different from current password" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleChangePassword} disabled={!allValid || isLoading}>
            {isLoading ? "Updating..." : "Change Password"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

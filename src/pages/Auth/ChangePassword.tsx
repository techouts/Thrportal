import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/auth/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X, KeyRound } from "lucide-react";
import {
  hasMinLength,
  hasNumber,
  hasSpecialChar,
  passwordsMatch,
  isDefaultPassword,
} from "@/lib/passwordValidation";

export default function ChangePassword() {
  const nav = useNavigate();
  const { user, signOut } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get the temporarily stored password to prevent reuse
  const tempPassword = sessionStorage.getItem("temp_pwd") || "";

  // Redirect if no user or if password change not required
  useEffect(() => {
    if (!user) {
      nav("/Auth/SignIn");
    }
  }, [user, nav]);

  // Validation states
  const validations = {
    minLength: hasMinLength(newPassword),
    hasNumber: hasNumber(newPassword),
    hasSpecial: hasSpecialChar(newPassword),
    matches: passwordsMatch(newPassword, confirmPassword),
    notDefault: !isDefaultPassword(newPassword, tempPassword),
  };

  const allValid =
    validations.minLength &&
    validations.hasNumber &&
    validations.hasSpecial &&
    validations.matches &&
    validations.notDefault;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      // Update password via Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      // Update the password_change_required flag to false
      if (user?.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ password_change_required: false })
          .eq("id", user.id);

        if (profileError) {
          console.error("[CHANGE_PASSWORD] Error updating profile flag:", profileError);
          // Don't throw - password was changed successfully
        }
      }

      // Clear the temporary password
      sessionStorage.removeItem("temp_pwd");

      // Sign out user so they can log in with new password
      await signOut();

      toast.success("Password changed successfully! Please sign in with your new password.");
      nav("/Auth/SignIn");
    } catch (error: any) {
      console.error("[CHANGE_PASSWORD] Error:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({
    valid,
    label,
  }: {
    valid: boolean;
    label: string;
  }) => (
    <div className="flex items-center gap-2 text-sm">
      {valid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={valid ? "text-green-600" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Change Your Password
          </h1>
          <p className="text-muted-foreground text-sm">
            For security reasons, you must change your password before
            continuing.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleChangePassword}>
          {/* Email display (read-only) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-muted/50"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                placeholder="Enter new password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                placeholder="Confirm new password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-muted/30 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Password Requirements
            </p>
            <ValidationItem
              valid={validations.minLength}
              label="At least 6 characters"
            />
            <ValidationItem
              valid={validations.hasNumber}
              label="Contains at least 1 number"
            />
            <ValidationItem
              valid={validations.hasSpecial}
              label="Contains at least 1 special character"
            />
            <ValidationItem
              valid={validations.matches}
              label="Passwords match"
            />
            {tempPassword && (
              <ValidationItem
                valid={validations.notDefault}
                label="Cannot reuse your initial password"
              />
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || !allValid}
            className="w-full h-11"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Changing Password...
              </span>
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Check, X, Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import {
  hasMinLength,
  hasNumber,
  hasSpecialChar,
  passwordsMatch,
} from "@/lib/passwordValidation";
import NodeApiClient from "@/services/nodeApiClient";

type ForgotPasswordStep = "email" | "sent" | "reset";

// Hardcoded temporary password for now
const TEMP_PASSWORD = "Hrmsportal@123";

export default function ForgotPassword() {
  const nav = useNavigate();
  const [step, setStep] = useState<ForgotPasswordStep>("email");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTempPassword, setShowTempPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const validations = {
    minLength: hasMinLength(newPassword),
    hasNumber: hasNumber(newPassword),
    hasSpecial: hasSpecialChar(newPassword),
    matches: passwordsMatch(newPassword, confirmPassword),
  };

  const allValid =
    validations.minLength &&
    validations.hasNumber &&
    validations.hasSpecial &&
    validations.matches;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await NodeApiClient.post("/auth/forgot-password", {
        email: email,
      });

      setStep("sent");
    } catch (error: any) {
      console.error("[CHANGE_PASSWORD] Error:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }

    // Move to next step (simulated - no actual email sent)
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    setLoading(true);
    try {
      await NodeApiClient.post("/auth/reset-password", {
        email: email,
        temporaryPassword: tempPassword,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });

      toast.success(
        "Password reset successfully! Please sign in with your new password.",
      );
      nav("/Auth/SignIn");
    } catch (error: any) {
      console.error("[FORGOT_PASSWORD] Error:", error);
      toast.error(error.message || "Failed to reset password");
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
        <Check className="h-4 w-4 text-primary" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={valid ? "text-primary" : "text-muted-foreground"}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="w-full max-w-md bg-card rounded-2xl shadow-xl border p-8 space-y-8">
        {/* Step 1: Email Entry */}
        {step === "email" && (
          <>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Reset Password</h1>
              <p className="text-muted-foreground text-sm">
                Enter your email address and we'll send you a temporary password.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleEmailSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                />
              </div>

              <Button type="submit" className="w-full h-11">
                Reset Password
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => nav("/Auth/SignIn")}
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 2: Email Sent Confirmation */}
        {step === "sent" && (
          <>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Email Sent</h1>
              <p className="text-muted-foreground text-sm">
                A temporary password has been sent to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Please check your inbox and enter the details below.
              </p>
            </div>

            <Button
              onClick={() => setStep("reset")}
              className="w-full h-11"
            >
              Continue
            </Button>
          </>
        )}

        {/* Step 3: Set New Password */}
        {step === "reset" && (
          <>
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
              <p className="text-muted-foreground text-sm">
                Enter the temporary password from your email and create a new password.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handlePasswordSubmit}>
              {/* Email display (read-only) */}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} disabled className="bg-muted/50" />
              </div>

              {/* Temporary Password */}
              <div className="space-y-2">
                <Label htmlFor="tempPassword">Temporary Password</Label>
                <div className="relative">
                  <Input
                    id="tempPassword"
                    placeholder="Enter temporary password"
                    type={showTempPassword ? "text" : "password"}
                    value={tempPassword}
                    onChange={(e) => setTempPassword(e.target.value)}
                    autoComplete="off"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTempPassword(!showTempPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showTempPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
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
              </div>

              <Button
                type="submit"
                disabled={loading || !allValid}
                className="w-full h-11"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Resetting Password...
                  </span>
                ) : (
                  "Submit"
                )}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => nav("/Auth/SignIn")}
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Sign In
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
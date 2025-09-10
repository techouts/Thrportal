import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { DEV_USERS } from "../../auth/devUsers";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function SignIn() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dev = import.meta.env.VITE_DEV_AUTH === "true" || import.meta.env.DEV;

  const doSignIn = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    setLoading(true);
    try {
      await signIn(email, password); 
      nav("/Home"); 
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickSignIn = async (userEmail: string, userPassword: string) => {
    setLoading(true);
    try {
      await signIn(userEmail, userPassword);
      nav("/Home");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-xl bg-card rounded-2xl shadow-lg border p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">HRMS Portal</h1>
          <p className="text-muted-foreground">Sign in to continue</p>
        </div>
        
        {dev ? (
          <div>
            <p className="mb-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border">
              <strong>DevAuth enabled</strong> — Click a role to sign in instantly:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEV_USERS.map(u => (
                <button 
                  key={u.email} 
                  onClick={() => quickSignIn(u.email, u.password)} 
                  disabled={loading}
                  className="border rounded-xl p-4 text-left hover:shadow-md transition-all hover:bg-muted/50 disabled:opacity-50"
                >
                  <div className="font-medium text-foreground">{u.display_name}</div>
                  <div className="text-xs text-muted-foreground">{u.role}</div>
                  {u.mfa_enabled && (
                    <div className="text-xs text-amber-600 mt-1">🔐 MFA</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={doSignIn}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input 
                className="w-full border rounded-lg p-3 bg-background text-foreground" 
                placeholder="your-email@company.com" 
                type="email"
                value={email} 
                onChange={e=>setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Password</label>
              <input 
                className="w-full border rounded-lg p-3 bg-background text-foreground" 
                placeholder="Enter your password" 
                type="password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full rounded-lg p-3 bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              SSO options (Microsoft/Google) will be available in production
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
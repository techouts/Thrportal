import { useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";

export default function SignOut() { 
  const { signOut } = useAuth(); 
  
  useEffect(() => { 
    signOut(); 
    window.location.href = "/Auth/SignIn"; 
  }, []); 
  
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <div className="text-lg">Signing out...</div>
      </div>
    </div>
  ); 
}
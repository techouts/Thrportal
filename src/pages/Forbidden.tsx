import { Link } from "react-router-dom";
import { ShieldX, ArrowLeft } from "lucide-react";

export default function Forbidden() { 
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <ShieldX className="h-24 w-24 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">403</h1>
          <h2 className="text-xl font-semibold text-foreground">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have the required permissions to access this resource.
          </p>
        </div>
        <Link 
          to="/Home" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  ); 
}
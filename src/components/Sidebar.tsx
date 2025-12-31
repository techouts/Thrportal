import { Link, useLocation } from "react-router-dom";
import { MENU } from "../menu/config";
import { useVisible } from "../hooks/useVisible";
import { useAuth } from "../auth/AuthContext";
import { LogOut, User } from "lucide-react";

export default function Sidebar() {
  const loc = useLocation();
  const { user, signOut } = useAuth();
  
  return (
    <aside className="w-64 border-r bg-card flex flex-col h-screen">
      {/* User info header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm truncate">{user?.display_name}</div>
            <div className="text-xs text-muted-foreground">
              {user?.primaryRole}
              {user?.roles && user.roles.length > 1 && (
                <span className="ml-1 text-xs bg-primary/10 px-1 rounded">
                  +{user.roles.length - 1}
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={signOut}
            className="p-1 hover:bg-muted rounded"
            title="Sign out"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {MENU.map(section => {
          const visible = useVisible(section.requiresAny);
          if (!visible) return null;
          
          return (
            <div key={section.label}>
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2 px-2">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items?.map(item => (
                  useVisible(item.requiresAny) ? (
                    <Link 
                      key={item.route} 
                      to={item.route} 
                      className={`block rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors ${
                        loc.pathname === item.route 
                          ? 'bg-primary text-primary-foreground font-medium' 
                          : 'text-foreground'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : null
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t text-xs text-muted-foreground">
        HRMS Portal v2.0
      </div>
    </aside>
  );
}
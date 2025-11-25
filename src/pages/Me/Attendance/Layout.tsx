import { Link, Outlet, useLocation } from "react-router-dom";
import { useVisible } from "../../../hooks/useVisible";

const TABS = [
  { label: "Stats",   route: "/Me/Attendance/Stats",    requiresAny: ["attendance.read"] },
  { label: "Clock-in",route: "/Me/Attendance/Clock-in", requiresAny: ["attendance.clock_in"] },
  { label: "Logs",    route: "/Me/Attendance/Logs",     requiresAny: ["attendance.read"] }
];

export default function AttendanceLayout() {
  const loc = useLocation();
  
  return (
    <div className="p-6">
      <div className="flex gap-2 border-b mb-4">
        {TABS.filter(t => useVisible(t.requiresAny)).map(t => (
          <Link 
            key={t.route} 
            to={t.route} 
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              loc.pathname === t.route 
                ? 'border-primary text-primary' 
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <Outlet/>
    </div>
  );
}
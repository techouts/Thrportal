export interface Workday {
  targetHoursToday: number;
  workedToday: number;
  checkInAt?: string;
  checkOutAt?: string;
  lastActionAt?: string;
  breakMinutes: number;
  isOnTimeToday: "on-time" | "slightly-late" | "late";
  mode: "WFO" | "WFH";
}

export interface WeekOverview {
  days: Array<{ date: string; effectiveHours: number; timesheet: "submitted"|"due"|"missing" }>;
}

export interface LeaveSnapshot {
  balances: Array<{ type: "CL"|"SL"|"Other"; days: number }>;
  upcoming?: { start: string; end: string; type: string };
  wfh: { usedThisMonth: number; quotaThisMonth: number };
}

export interface Expenses {
  pendingAmount: number;
  lastClaimStatus: "submitted"|"approved"|"reimbursed"|"rejected";
  medianCycleDays: number;
}

export interface Helpdesk {
  counts: { open: number; inProgress: number; waiting: number };
  slaRiskCount: number;
}

export interface Goal {
  id: string; 
  title: string; 
  weightPct: number; 
  progressPct: number; 
  nextUpdateDue?: string;
}

export interface Goals { 
  items: Goal[]; 
  weightedProgressPct: number;
}

export interface OneOnOnes { 
  lastDate?: string; 
  nextDate?: string; 
}

export interface Learning { 
  assigned: number; 
  inProgress: number; 
  completed: number; 
  dueSoonCount: number; 
}

export interface IjpMatch { 
  id: string; 
  title: string; 
  bu: string; 
  location: string; 
  tags: string[]; 
}

export interface Referrals { 
  funnel: { referred: number; interviewing: number; offer: number; hired: number }; 
}

export interface PeopleWidget {
  manager: { name: string; initials: string };
  peers: Array<{ name: string; initials: string }>;
  celebrations: Array<{ name: string; type: "birthday"|"anniversary"; date: string }>;
}

export interface SmartNudge { 
  id: string; 
  text: string; 
  link: string;
}

export interface MeDashboardData {
  user: { firstName: string };
  workday: Workday;
  week: WeekOverview;
  leave: LeaveSnapshot;
  expenses: Expenses;
  helpdesk: Helpdesk;
  goals: Goals;
  oneOnOnes: OneOnOnes;
  learning: Learning;
  ijp: IjpMatch[];
  referrals: Referrals;
  people: PeopleWidget;
  nudges: SmartNudge[];
}

export const sampleMeDashboardData: MeDashboardData = {
  user: { firstName: "Pavan" },
  workday: {
    targetHoursToday: 8, 
    workedToday: 3.5, 
    checkInAt: "2025-09-04T09:08:00+05:30",
    lastActionAt: "2025-09-04T12:42:00+05:30", 
    breakMinutes: 20, 
    isOnTimeToday: "on-time", 
    mode: "WFO"
  },
  week: {
    days: [
      { date: "2025-09-01", effectiveHours: 7.8, timesheet: "submitted" },
      { date: "2025-09-02", effectiveHours: 8.1, timesheet: "submitted" },
      { date: "2025-09-03", effectiveHours: 7.2, timesheet: "missing" },
      { date: "2025-09-04", effectiveHours: 3.5, timesheet: "due" },
      { date: "2025-09-05", effectiveHours: 0, timesheet: "due" },
      { date: "2025-09-06", effectiveHours: 0, timesheet: "due" },
      { date: "2025-09-07", effectiveHours: 0, timesheet: "due" }
    ]
  },
  leave: {
    balances: [
      { type: "CL", days: 6 }, 
      { type: "SL", days: 5 }, 
      { type: "Other", days: 2 }
    ],
    upcoming: { start: "2025-09-13", end: "2025-09-16", type: "CL" },
    wfh: { usedThisMonth: 1, quotaThisMonth: 2 }
  },
  expenses: { 
    pendingAmount: 4320, 
    lastClaimStatus: "approved", 
    medianCycleDays: 5 
  },
  helpdesk: { 
    counts: { open: 1, inProgress: 0, waiting: 1 }, 
    slaRiskCount: 1 
  },
  goals: {
    items: [
      { id: "g1", title: "Ship /Me/Dashboard", weightPct: 40, progressPct: 60, nextUpdateDue: "2025-09-06" },
      { id: "g2", title: "Reduce timesheet misses", weightPct: 30, progressPct: 50 },
      { id: "g3", title: "Complete React course", weightPct: 30, progressPct: 20 }
    ],
    weightedProgressPct: 46
  },
  oneOnOnes: { lastDate: "2025-08-28", nextDate: "2025-09-11" },
  learning: { assigned: 3, inProgress: 1, completed: 1, dueSoonCount: 1 },
  ijp: [
    { id: "ij1", title: "Senior React Engineer", bu: "Apps", location: "Hyderabad", tags: ["React", "Vite", "UI"] },
    { id: "ij2", title: "Node.js Lead", bu: "Platform", location: "Remote", tags: ["Node", "Postgres"] }
  ],
  referrals: { funnel: { referred: 2, interviewing: 1, offer: 0, hired: 0 } },
  people: {
    manager: { name: "Anita Rao", initials: "AR" },
    peers: [{ name: "Karthik", initials: "K" }, { name: "Meera", initials: "M" }],
    celebrations: [{ name: "Vikram", type: "birthday", date: "2025-09-05" }]
  },
  nudges: [
    { id: "n1", text: "Timesheet missing for Wed — fill now", link: "/Me/Timesheet?tab=Fill" },
    { id: "n2", text: "Goal check-in due by Sat", link: "/Me/Performance?tab=My%20Goals" },
    { id: "n3", text: "SLA at risk: 1 ticket", link: "/Me/Helpdesk?tab=My%20Tickets" }
  ]
};
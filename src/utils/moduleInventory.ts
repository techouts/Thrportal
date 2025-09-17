/**
 * Module Inventory and Integration Status Tracker
 * This file tracks all available modules and their integration status
 * to prevent future development loss.
 */

export interface ModuleInventory {
  module: string
  route: string
  pageComponent: string
  serviceComponent?: string
  integratedIn: {
    mePage: boolean
    myTeamPage: boolean
    hrPage: boolean
  }
  status: 'active' | 'missing-integration' | 'partial-integration'
  description: string
}

export const MODULE_INVENTORY: ModuleInventory[] = [
  // Fully Integrated Modules
  {
    module: 'Dashboard',
    route: '/Dashboard',
    pageComponent: 'Dashboard.tsx',
    integratedIn: { mePage: true, myTeamPage: true, hrPage: false },
    status: 'active',
    description: 'Main dashboard with metrics and overview'
  },
  {
    module: 'Profile',
    route: '/Profile',
    pageComponent: 'Profile.tsx',
    integratedIn: { mePage: true, myTeamPage: false, hrPage: false },
    status: 'active',
    description: 'User profile management'
  },
  {
    module: 'Leave',
    route: '/Leave',
    pageComponent: 'LeavePage.tsx',
    serviceComponent: 'leaveService.ts',
    integratedIn: { mePage: true, myTeamPage: true, hrPage: false },
    status: 'active',
    description: 'Leave management system'
  },
  {
    module: 'Performance',
    route: '/Performance',
    pageComponent: 'PerformanceComponents',
    integratedIn: { mePage: true, myTeamPage: true, hrPage: true },
    status: 'active',
    description: 'Performance management and reviews'
  },
  {
    module: 'Timesheet',
    route: '/Timesheet',
    pageComponent: 'TimesheetModule.tsx',
    integratedIn: { mePage: true, myTeamPage: true, hrPage: false },
    status: 'active',
    description: 'Time tracking and timesheet management'
  },

  // Recently Integrated Modules
  {
    module: 'Learning',
    route: '/Learning',
    pageComponent: 'LearningPage.tsx',
    integratedIn: { mePage: true, myTeamPage: true, hrPage: true },
    status: 'active',
    description: 'Learning and development management'
  },
  {
    module: 'Recognition',
    route: '/Recognition',
    pageComponent: 'RecognitionPage.tsx',
    integratedIn: { mePage: true, myTeamPage: true, hrPage: true },
    status: 'active',
    description: 'Employee recognition and rewards'
  },
  {
    module: 'Finance',
    route: '/Finance',
    pageComponent: 'FinancePage.tsx',
    integratedIn: { mePage: true, myTeamPage: false, hrPage: false },
    status: 'active',
    description: 'Finance and payroll management'
  },

  // Modules Still Using Generic Placeholders (Need Proper Components)
  {
    module: 'Expenses',
    route: '/Expenses',
    pageComponent: 'ExpensePage.tsx (needed)',
    integratedIn: { mePage: false, myTeamPage: true, hrPage: false },
    status: 'partial-integration',
    description: 'Expense management and approvals'
  },
  {
    module: 'IJP',
    route: '/IJP',
    pageComponent: 'IJPPage.tsx (needed)',
    integratedIn: { mePage: false, myTeamPage: false, hrPage: false },
    status: 'missing-integration',
    description: 'Internal job postings and applications'
  },
  {
    module: 'Referrals',
    route: '/Referrals',
    pageComponent: 'ReferralsPage.tsx (needed)',
    integratedIn: { mePage: false, myTeamPage: false, hrPage: false },
    status: 'missing-integration',
    description: 'Employee referral program'
  },
  {
    module: 'Helpdesk',
    route: '/Helpdesk',
    pageComponent: 'HelpdeskPage.tsx (needed)',
    integratedIn: { mePage: false, myTeamPage: false, hrPage: false },
    status: 'missing-integration',
    description: 'IT support and ticketing system'
  },
  {
    module: 'Attendance',
    route: '/Attendance',
    pageComponent: 'AttendancePage.tsx (needed)',
    integratedIn: { mePage: false, myTeamPage: false, hrPage: false },
    status: 'missing-integration',
    description: 'Attendance tracking and management'
  }
]

/**
 * Get modules that are missing integration in specific pages
 */
export function getMissingIntegrations() {
  return {
    mePage: MODULE_INVENTORY.filter(m => !m.integratedIn.mePage && m.status !== 'missing-integration'),
    myTeamPage: MODULE_INVENTORY.filter(m => !m.integratedIn.myTeamPage && m.status !== 'missing-integration'),
    hrPage: MODULE_INVENTORY.filter(m => !m.integratedIn.hrPage && m.status !== 'missing-integration')
  }
}

/**
 * Get development checklist for new modules
 */
export function getModuleDevelopmentChecklist() {
  return [
    '✓ Create page component in appropriate directory (/Me, /MyTeam, /HR)',
    '✓ Create service layer following ServiceRegistry pattern',
    '✓ Add to tabConfig in MePage.tsx, MyTeamPage.tsx, HRPage.tsx as needed',
    '✓ Add case in renderContent() switch statement',
    '✓ Add import statement for the new page component',
    '✓ Update MODULE_INVENTORY in moduleInventory.ts',
    '✓ Register module spec in moduleRegistry.ts',
    '✓ Test navigation and functionality',
    '✓ Verify service layer integration',
    '✓ Update documentation'
  ]
}

/**
 * Integration verification function
 */
export function verifyModuleIntegration(moduleName: string): {
  isComplete: boolean
  missing: string[]
  recommendations: string[]
} {
  const module = MODULE_INVENTORY.find(m => m.module === moduleName)
  if (!module) {
    return {
      isComplete: false,
      missing: ['Module not found in inventory'],
      recommendations: ['Add module to MODULE_INVENTORY']
    }
  }

  const missing: string[] = []
  const recommendations: string[] = []

  if (!module.integratedIn.mePage && module.module !== 'Dashboard') {
    missing.push('MePage integration')
    recommendations.push('Add to MePage.tsx tabConfig and renderContent()')
  }

  if (!module.integratedIn.myTeamPage && ['Leave', 'Performance', 'Learning', 'Recognition', 'Expenses', 'Timesheet'].includes(module.module)) {
    missing.push('MyTeamPage integration')
    recommendations.push('Add to MyTeamPage.tsx renderContent()')
  }

  if (!module.integratedIn.hrPage && ['Performance', 'Learning', 'Recognition'].includes(module.module)) {
    missing.push('HRPage integration')
    recommendations.push('Add to HRPage.tsx renderContent()')
  }

  return {
    isComplete: missing.length === 0,
    missing,
    recommendations
  }
}
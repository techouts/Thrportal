import {
  SecurityConfiguration,
  RolePermissionMatrix,
  AuditLogEntry,
  PermissionCheck,
  PermissionResult,
  CandidatePermission,
  DEFAULT_CANDIDATE_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  CANDIDATE_ROLES,
  CandidateRole
} from '@/types/candidateSecurity';

class CandidateSecurityService {
  private static instance: CandidateSecurityService;
  private mockConfiguration: SecurityConfiguration;
  private mockAuditLogs: AuditLogEntry[] = [];

  static getInstance(): CandidateSecurityService {
    if (!CandidateSecurityService.instance) {
      CandidateSecurityService.instance = new CandidateSecurityService();
    }
    return CandidateSecurityService.instance;
  }

  constructor() {
    this.initializeDefaultConfiguration();
    this.initializeMockAuditLogs();
  }

  private initializeDefaultConfiguration() {
    // Create default role permission matrices
    const roles: RolePermissionMatrix[] = Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([roleId, permissions]) => ({
      roleId,
      roleName: this.getRoleDisplayName(roleId as CandidateRole),
      permissions: permissions.reduce((acc, permId) => {
        acc[permId] = true;
        return acc;
      }, {} as Record<string, boolean>),
      restrictions: this.getDefaultRestrictions(roleId as CandidateRole)
    }));

    this.mockConfiguration = {
      id: 'candidates-security-config',
      name: 'Candidates Security Configuration',
      description: 'Role-based access control configuration for Candidates module',
      isActive: true,
      roles,
      auditSettings: {
        enableAuditLogging: true,
        retentionDays: 365,
        logSuccessfulActions: true,
        logFailedActions: true,
        logDataAccess: true,
        logPermissionChanges: true,
        realTimeAlerts: true,
        alertThresholds: {
          failedLoginAttempts: 5,
          suspiciousActivityScore: 80
        }
      },
      complianceSettings: {
        gdprEnabled: true,
        dpdpEnabled: true,
        consentRequired: true,
        dataRetentionDays: 2555, // 7 years
        anonymizationEnabled: true,
        rightToForgotten: true,
        dataPortability: true,
        consentWithdrawalEnabled: true
      },
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Administrator'
    };
  }

  private getRoleDisplayName(roleId: CandidateRole): string {
    const displayNames: Record<CandidateRole, string> = {
      RECRUITER: 'Recruiter',
      STAFFING_MANAGER: 'Staffing Manager',
      HR_MANAGER: 'HR Manager',
      HIRING_MANAGER: 'Hiring Manager',
      LEADERSHIP: 'Leadership',
      CLIENT_SPOC: 'Client SPOC',
      ADMIN: 'Administrator'
    };
    return displayNames[roleId] || roleId;
  }

  private getDefaultRestrictions(roleId: CandidateRole) {
    const restrictions: Record<CandidateRole, any[]> = {
      RECRUITER: [
        {
          id: 'no-offer-approval',
          type: 'approval_required',
          description: 'Cannot approve offers - requires manager approval'
        },
        {
          id: 'no-cross-recruiter-reassign',
          type: 'data_access',
          description: 'Cannot reassign candidates across recruiters'
        },
        {
          id: 'no-sla-override',
          type: 'escalation_required',
          description: 'Cannot override SLA breaches - must escalate'
        }
      ],
      STAFFING_MANAGER: [
        {
          id: 'no-personal-details-edit',
          type: 'data_access',
          description: 'Cannot edit candidate personal details'
        },
        {
          id: 'no-direct-offer-approval',
          type: 'approval_required',
          description: 'Cannot directly approve offers unless configured in Offer Matrix'
        }
      ],
      HR_MANAGER: [
        {
          id: 'no-recruiter-assignment',
          type: 'data_access',
          description: 'Cannot manage recruiter assignment to JDs'
        },
        {
          id: 'no-client-offer-approval',
          type: 'approval_required',
          description: 'Cannot approve client-side offers'
        }
      ],
      HIRING_MANAGER: [],
      LEADERSHIP: [
        {
          id: 'view-only',
          type: 'data_access',
          description: 'View-only access - cannot modify any data'
        }
      ],
      CLIENT_SPOC: [
        {
          id: 'restricted-portal',
          type: 'data_access',
          description: 'Restricted portal view of submitted candidates only'
        },
        {
          id: 'no-internal-access',
          type: 'data_access',
          description: 'No access to recruiter notes, internal dashboards, or reports'
        }
      ],
      ADMIN: []
    };
    return restrictions[roleId] || [];
  }

  private initializeMockAuditLogs() {
    this.mockAuditLogs = [
      {
        id: 'audit-1',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userRole: 'RECRUITER',
        action: 'create',
        resource: 'candidate_profile',
        resourceId: 'candidate-1',
        resourceName: 'John Smith',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        success: true,
        details: { source: 'LinkedIn', skills: ['React', 'Node.js'] }
      },
      {
        id: 'audit-2',
        userId: 'user-2',
        userName: 'Mike Rodriguez',
        userRole: 'STAFFING_MANAGER',
        action: 'reassign',
        resource: 'candidate_profile',
        resourceId: 'candidate-2',
        resourceName: 'Emily Chen',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        success: true,
        previousValue: { recruiter: 'Alice Brown' },
        newValue: { recruiter: 'Bob Wilson' }
      },
      {
        id: 'audit-3',
        userId: 'user-3',
        userName: 'Lisa Thompson',
        userRole: 'HR_MANAGER',
        action: 'approve',
        resource: 'candidate_offers',
        resourceId: 'offer-1',
        resourceName: 'David Wilson - Senior Developer',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        success: true,
        details: { offerAmount: 140000, approvalLevel: 'HR' }
      },
      {
        id: 'audit-4',
        userId: 'user-4',
        userName: 'John Anderson',
        userRole: 'RECRUITER',
        action: 'view_sensitive',
        resource: 'candidate_profile',
        resourceId: 'candidate-3',
        resourceName: 'Sarah Davis',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
        success: false,
        errorMessage: 'Insufficient permissions to view sensitive data'
      }
    ];
  }

  // Security Configuration
  async getSecurityConfiguration(): Promise<SecurityConfiguration> {
    return { ...this.mockConfiguration };
  }

  async updateSecurityConfiguration(config: Partial<SecurityConfiguration>): Promise<SecurityConfiguration> {
    this.mockConfiguration = {
      ...this.mockConfiguration,
      ...config,
      updatedAt: new Date().toISOString()
    };
    
    // Log permission changes
    await this.logAuditEvent({
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'ADMIN',
      action: 'edit',
      resource: 'candidate_audit_logs',
      resourceId: 'security-config',
      timestamp: new Date().toISOString(),
      success: true,
      details: { changedFields: Object.keys(config) }
    });

    return this.mockConfiguration;
  }

  // Role Permissions
  async getRolePermissions(roleId?: string): Promise<RolePermissionMatrix[]> {
    if (roleId) {
      const role = this.mockConfiguration.roles.find(r => r.roleId === roleId);
      return role ? [role] : [];
    }
    return [...this.mockConfiguration.roles];
  }

  async updateRolePermissions(roleId: string, permissions: Record<string, boolean>): Promise<RolePermissionMatrix> {
    const roleIndex = this.mockConfiguration.roles.findIndex(r => r.roleId === roleId);
    if (roleIndex === -1) {
      throw new Error(`Role ${roleId} not found`);
    }

    const oldPermissions = { ...this.mockConfiguration.roles[roleIndex].permissions };
    this.mockConfiguration.roles[roleIndex].permissions = permissions;
    this.mockConfiguration.updatedAt = new Date().toISOString();

    // Log permission changes
    await this.logAuditEvent({
      userId: 'current-user',
      userName: 'Current User',
      userRole: 'ADMIN',
      action: 'edit',
      resource: 'candidate_audit_logs',
      resourceId: `role-${roleId}`,
      timestamp: new Date().toISOString(),
      success: true,
      previousValue: oldPermissions,
      newValue: permissions,
      details: { roleId, changedPermissions: this.getChangedPermissions(oldPermissions, permissions) }
    });

    return this.mockConfiguration.roles[roleIndex];
  }

  private getChangedPermissions(oldPerms: Record<string, boolean>, newPerms: Record<string, boolean>): string[] {
    const changes: string[] = [];
    const allPermissionIds = new Set([...Object.keys(oldPerms), ...Object.keys(newPerms)]);
    
    allPermissionIds.forEach(permId => {
      if (oldPerms[permId] !== newPerms[permId]) {
        changes.push(`${permId}: ${oldPerms[permId]} → ${newPerms[permId]}`);
      }
    });
    
    return changes;
  }

  // Permission Checking
  async checkPermission(check: PermissionCheck): Promise<PermissionResult> {
    // Mock permission checking logic
    const userRole = this.getCurrentUserRole(); // In real app, get from auth context
    const roleConfig = this.mockConfiguration.roles.find(r => r.roleId === userRole);
    
    if (!roleConfig) {
      return {
        allowed: false,
        reason: 'User role not found in configuration',
        auditRequired: true
      };
    }

    const hasPermission = roleConfig.permissions[check.permission] === true;
    const restrictions = roleConfig.restrictions.filter(r => this.checkRestriction(r, check));

    // Log the permission check
    await this.logAuditEvent({
      userId: check.userId,
      userName: 'Current User',
      userRole,
      action: 'view',
      resource: 'candidate_audit_logs',
      resourceId: check.resourceId || 'permission-check',
      timestamp: new Date().toISOString(),
      success: hasPermission,
      details: { 
        permissionChecked: check.permission,
        context: check.context,
        restrictions: restrictions.map(r => r.description)
      }
    });

    return {
      allowed: hasPermission && restrictions.length === 0,
      reason: hasPermission ? undefined : 'Permission denied',
      restrictions: restrictions.map(r => r.description),
      auditRequired: this.mockConfiguration.auditSettings.logDataAccess
    };
  }

  private getCurrentUserRole(): string {
    // In real implementation, get from auth context
    return 'RECRUITER';
  }

  private checkRestriction(restriction: any, check: PermissionCheck): boolean {
    // Mock restriction checking - in real app, implement proper logic
    return false;
  }

  // Audit Logging
  async logAuditEvent(event: Omit<AuditLogEntry, 'id' | 'ipAddress' | 'userAgent'>): Promise<void> {
    const auditEntry: AuditLogEntry = {
      ...event,
      id: `audit-${Date.now()}`,
      ipAddress: '192.168.1.100', // Mock IP
      userAgent: 'Mozilla/5.0...' // Mock user agent
    };

    this.mockAuditLogs.unshift(auditEntry);

    // Keep only recent logs for demo
    if (this.mockAuditLogs.length > 100) {
      this.mockAuditLogs = this.mockAuditLogs.slice(0, 100);
    }

    // In real implementation, send to audit logging service
    if (this.mockConfiguration.auditSettings.realTimeAlerts && !event.success) {
      this.triggerSecurityAlert(auditEntry);
    }
  }

  private triggerSecurityAlert(event: AuditLogEntry): void {
    // Mock security alert - in real app, send to monitoring system
    console.warn('Security Alert:', {
      type: 'Permission Denied',
      user: event.userName,
      action: event.action,
      resource: event.resource,
      timestamp: event.timestamp
    });
  }

  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
    successOnly?: boolean;
  }): Promise<AuditLogEntry[]> {
    let logs = [...this.mockAuditLogs];

    if (filters) {
      if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        logs = logs.filter(log => log.resource === filters.resource);
      }
      if (filters.startDate) {
        logs = logs.filter(log => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter(log => log.timestamp <= filters.endDate!);
      }
      if (filters.successOnly !== undefined) {
        logs = logs.filter(log => log.success === filters.successOnly);
      }
    }

    return logs;
  }

  // Available Permissions
  async getAvailablePermissions(): Promise<CandidatePermission[]> {
    return [...DEFAULT_CANDIDATE_PERMISSIONS];
  }

  async getPermissionsByCategory(category?: string): Promise<Record<string, CandidatePermission[]>> {
    const permissions = DEFAULT_CANDIDATE_PERMISSIONS;
    
    if (category) {
      return {
        [category]: permissions.filter(p => p.category === category)
      };
    }

    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, CandidatePermission[]>);
  }

  // Compliance
  async exportComplianceReport(): Promise<string> {
    const report = {
      generatedAt: new Date().toISOString(),
      configuration: this.mockConfiguration,
      auditLogsSummary: {
        totalEvents: this.mockAuditLogs.length,
        successfulEvents: this.mockAuditLogs.filter(log => log.success).length,
        failedEvents: this.mockAuditLogs.filter(log => !log.success).length,
        recentEvents: this.mockAuditLogs.slice(0, 10)
      }
    };

    // Mock export URL
    return `https://exports.company.com/compliance-report-${Date.now()}.json`;
  }
}

export const candidateSecurityService = CandidateSecurityService.getInstance();

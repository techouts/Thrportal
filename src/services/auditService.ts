export interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorRole: string
  action: string
  target: string
  before?: any
  after?: any
  reason?: string
  ipAddress?: string
  source?: string
  category: 'settings' | 'approval' | 'system'
}

class AuditService {
  private static instance: AuditService
  private auditEntries: AuditEntry[] = []

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService()
    }
    return AuditService.instance
  }

  async logChange(entry: Omit<AuditEntry, 'id' | 'timestamp' | 'ipAddress'>): Promise<void> {
    const auditEntry: AuditEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ipAddress: await this.getClientIP()
    }

    this.auditEntries.unshift(auditEntry)
    
    // Keep only last 1000 entries in memory
    if (this.auditEntries.length > 1000) {
      this.auditEntries = this.auditEntries.slice(0, 1000)
    }

    // In a real implementation, this would be sent to the backend
    console.log('Audit Entry:', auditEntry)
  }

  async getAuditTrail(filters?: {
    category?: string
    actor?: string
    startDate?: string
    endDate?: string
    search?: string
  }): Promise<AuditEntry[]> {
    let filtered = [...this.auditEntries]

    if (filters?.category) {
      filtered = filtered.filter(entry => entry.category === filters.category)
    }

    if (filters?.actor) {
      filtered = filtered.filter(entry => 
        entry.actor.toLowerCase().includes(filters.actor!.toLowerCase())
      )
    }

    if (filters?.startDate) {
      filtered = filtered.filter(entry => entry.timestamp >= filters.startDate!)
    }

    if (filters?.endDate) {
      filtered = filtered.filter(entry => entry.timestamp <= filters.endDate!)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(entry => 
        entry.action.toLowerCase().includes(searchLower) ||
        entry.target.toLowerCase().includes(searchLower) ||
        (entry.reason && entry.reason.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  async exportAuditTrail(format: 'csv' | 'pdf' = 'csv'): Promise<string> {
    const entries = await this.getAuditTrail()
    
    if (format === 'csv') {
      const headers = ['Timestamp', 'Actor', 'Role', 'Action', 'Target', 'Before', 'After', 'Reason', 'IP Address', 'Source']
      const csvContent = [
        headers.join(','),
        ...entries.map(entry => [
          entry.timestamp,
          entry.actor,
          entry.actorRole,
          entry.action,
          entry.target,
          entry.before ? JSON.stringify(entry.before) : '',
          entry.after ? JSON.stringify(entry.after) : '',
          entry.reason || '',
          entry.ipAddress || '',
          entry.source || ''
        ].map(field => `\"${field}\"`).join(','))
      ].join('\n')
      
      return csvContent
    }

    // PDF export would be implemented here
    return 'PDF export not implemented yet'
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  private async getClientIP(): Promise<string> {
    // In a real implementation, this would get the client's IP address
    return '192.168.1.100'
  }

  // Helper method to log settings changes
  async logSettingsChange(
    actor: string,
    actorRole: string,
    section: string,
    setting: string,
    before: any,
    after: any,
    reason?: string
  ): Promise<void> {
    await this.logChange({
      actor,
      actorRole,
      action: 'Settings Change',
      target: `${section} > ${setting}`,
      before,
      after,
      reason,
      category: 'settings'
    })
  }
}

export const auditService = AuditService.getInstance()

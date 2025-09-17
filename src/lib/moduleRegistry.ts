interface ModuleSpec {
  route: string
  owner?: string
  brdStatus: 'draft' | 'review' | 'approved' | 'implemented'
  promptStatus: 'pending' | 'processing' | 'completed' | 'failed'
  lastUpdated: string
  description?: string
  // Integration tracking
  isIntegrated?: boolean
  integrationStatus?: 'not-started' | 'in-progress' | 'completed' | 'verified'
  integrationNotes?: string
  // Component tracking
  hasPageComponent?: boolean
  hasServiceLayer?: boolean
  followsServicePattern?: boolean
}

class ModuleRegistry {
  private specs: Map<string, ModuleSpec> = new Map()

  registerModuleSpec(route: string, spec: Omit<ModuleSpec, 'route' | 'lastUpdated'>) {
    const moduleSpec: ModuleSpec = {
      ...spec,
      route,
      lastUpdated: new Date().toISOString()
    }
    
    this.specs.set(route, moduleSpec)
    console.log(`📋 Module registered: ${route}`, moduleSpec)
    
    // Store in localStorage for persistence
    this.saveToStorage()
    
    return moduleSpec
  }

  getModuleSpec(route: string): ModuleSpec | undefined {
    return this.specs.get(route)
  }

  getAllSpecs(): ModuleSpec[] {
    return Array.from(this.specs.values())
  }

  updateSpecStatus(
    route: string, 
    updates: Partial<Pick<ModuleSpec, 'brdStatus' | 'promptStatus' | 'owner'>>
  ) {
    const existing = this.specs.get(route)
    if (existing) {
      const updated = {
        ...existing,
        ...updates,
        lastUpdated: new Date().toISOString()
      }
      this.specs.set(route, updated)
      this.saveToStorage()
      return updated
    }
    return null
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.specs)
      localStorage.setItem('t-hr-module-specs', JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save module specs:', error)
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem('t-hr-module-specs')
      if (data) {
        const parsed = JSON.parse(data)
        this.specs = new Map(Object.entries(parsed))
      }
    } catch (error) {
      console.error('Failed to load module specs:', error)
    }
  }

  // Initialize with default specs for existing routes
  initializeDefaults() {
    this.loadFromStorage()
    
    const defaultRoutes = [
      '/Home',
      '/Me/Dashboard',
      '/Me/Profile',
      '/Me/Attendance',
      '/Me/Leave',
      '/MyTeam/Dashboard',
      '/Hiring/Dashboard',
      '/Project/Dashboard',
      '/Org/EmployeeDirectory',
      '/HR/Performance',
      '/Management/Dashboard',
      '/Reports/Mine',
      '/Admin/Tenant'
    ]

    defaultRoutes.forEach(route => {
      if (!this.specs.has(route)) {
        this.registerModuleSpec(route, {
          brdStatus: 'draft',
          promptStatus: 'pending',
          description: `Default module for ${route}`,
          owner: 'System'
        })
      }
    })
  }
}

export const moduleRegistry = new ModuleRegistry()

// Initialize on module load
moduleRegistry.initializeDefaults()

// Export the registration function for easy use
export const registerModuleSpec = (
  route: string, 
  spec: Omit<ModuleSpec, 'route' | 'lastUpdated'>
) => moduleRegistry.registerModuleSpec(route, spec)

export type { ModuleSpec }
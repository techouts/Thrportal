# Module Development Standards

## Overview
This document outlines the standards and best practices for developing new modules in the HR platform to ensure proper integration and prevent development loss.

## Module Architecture

### 1. Directory Structure
```
src/pages/
├── Me/               # Employee self-service modules
├── MyTeam/           # Manager/team lead modules  
├── HR/               # HR administrator modules
└── shared/           # Shared components
```

### 2. Required Components
Every module MUST have:
- **Page Component**: Main UI component for the module
- **Service Layer**: API/data management following ServiceRegistry pattern
- **Integration**: Proper integration into parent page components

## Development Checklist

### ✅ Phase 1: Component Creation
1. **Create Page Component**
   ```typescript
   // src/pages/[Section]/[ModuleName]Page.tsx
   export default function ModuleNamePage() {
     // Component implementation
   }
   ```

2. **Create Service Layer**
   ```typescript
   // src/services/moduleNameService.ts
   export const moduleNameService = {
     // Service implementation following ServiceRegistry pattern
   }
   ```

### ✅ Phase 2: Integration (CRITICAL)
3. **Update Parent Page Components**
   - Add to `tabConfig` object
   - Add import statement
   - Add case in `renderContent()` switch statement

4. **Integration Points**
   - **Me Section**: Always integrate if it's an employee-facing feature
   - **MyTeam Section**: Integrate if managers need oversight/approval
   - **HR Section**: Integrate if HR needs administration/reporting

### ✅ Phase 3: Registration
5. **Update Module Registry**
   ```typescript
   // src/lib/moduleRegistry.ts
   moduleRegistry.registerModuleSpec(`/Section/ModuleName`, {
     brdStatus: 'draft',
     promptStatus: 'pending', 
     description: 'Module description',
     isIntegrated: true,
     hasPageComponent: true,
     hasServiceLayer: true
   })
   ```

6. **Update Module Inventory**
   ```typescript
   // src/utils/moduleInventory.ts
   // Add new module to MODULE_INVENTORY array
   ```

## Integration Templates

### Me Page Integration
```typescript
// 1. Add import
import ModuleNamePage from '@/pages/Me/ModuleNamePage'

// 2. Add to tabConfig
const tabConfig = {
  // existing entries...
  ModuleName: { icon: IconName, description: 'Module description' }
}

// 3. Add case in renderContent()
case 'ModuleName':
  return <ModuleNamePage />
```

### MyTeam Page Integration
```typescript
// 1. Add import
import MyTeamModuleNamePage from '@/pages/MyTeam/ModuleNamePage'

// 2. Add condition in renderContent()
if (defaultTab === 'ModuleName') {
  return <MyTeamModuleNamePage />;
}
```

### HR Page Integration
```typescript
// 1. Add import
import HRModuleNamePage from '@/pages/HR/ModuleNamePage'

// 2. Add condition in renderContent()
if (defaultTab === 'ModuleName') {
  return <HRModuleNamePage />;
}
```

## Service Layer Standards

### ServiceRegistry Pattern
```typescript
// Register service with multiple modes
registerService({
  name: 'moduleNameService',
  singleton: true,
  mock: () => new MockModuleNameService(),
  api: () => new APIModuleNameService(), 
  supabase: () => new SupabaseModuleNameService()
})
```

### Service Interface
```typescript
interface ModuleNameService {
  getModuleData(params: any): Promise<ServiceResponse<any>>
  createRecord(data: any): Promise<ServiceResponse<any>>
  updateRecord(id: string, data: any): Promise<ServiceResponse<any>>
  deleteRecord(id: string): Promise<ServiceResponse<boolean>>
}
```

## Verification Process

### Automated Checks
Use the verification utility:
```typescript
import { verifyModuleIntegration } from '@/utils/moduleInventory'

const result = verifyModuleIntegration('ModuleName')
if (!result.isComplete) {
  console.log('Missing:', result.missing)
  console.log('Recommendations:', result.recommendations)
}
```

### Manual Testing
1. **Navigation**: Verify module is accessible via route
2. **Functionality**: Test all features work as expected
3. **Service Layer**: Confirm API calls work properly
4. **Cross-Section**: Test module works in all applicable sections

## Common Pitfalls to Avoid

### ❌ DON'T
- Create page components without integrating them
- Use direct Supabase calls instead of service layer
- Skip updating MODULE_INVENTORY
- Forget to add icon imports
- Leave generic placeholders for completed features

### ✅ DO
- Follow the complete checklist for every module
- Use semantic design tokens for styling
- Implement proper error handling
- Add loading states
- Include comprehensive testing

## Future-Proofing

### Integration Testing
Create tests that verify:
- All registered modules are properly integrated
- No orphaned page components exist
- Service layers follow established patterns

### Documentation Updates
- Update this document when patterns change
- Maintain MODULE_INVENTORY accuracy
- Document any deviations from standards

## Emergency Recovery

If modules go missing:
1. Check MODULE_INVENTORY for all available modules
2. Use `getMissingIntegrations()` to identify gaps
3. Follow integration templates to restore access
4. Verify service layer connections
5. Test functionality thoroughly

## Contact
For questions about module development standards, consult:
- Technical documentation
- Module inventory utilities
- Service registry patterns
- Integration verification tools

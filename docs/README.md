# T-HR 3-Pass Development Workflow

This project follows a structured 3-pass development methodology for rapid, scalable HR application development.

## Overview

The T-HR system is built with a modular architecture that supports iterative development through three distinct passes:

1. **Pass-1: Scaffold** - Create route structure, shared components, and mock data
2. **Pass-2: Wireframes** - Convert BRD requirements into functional wireframes 
3. **Pass-3: Deep Spec** - Replace mocks with live APIs, add integrations and analytics

## Architecture

### Technology Stack
- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **State Management**: Jotai + React Query
- **Routing**: React Router v6
- **Backend Ready**: Node.js/Express + Prisma + PostgreSQL
- **Mock Data**: Faker.js with JSON fallbacks

### Key Features
- Role-based access control (RBAC)
- Shared component library
- Mock/Live API switching
- Automated testing
- Module registration system

## Pass-1: Scaffold ✅

**Status**: Complete
**Goal**: Create foundational structure with placeholders

### What's Included:
- ✅ Complete navigation structure (11 main sections, 60+ routes)
- ✅ Role-based route guards (`/config/rolePolicies.json`)
- ✅ Shared UI components (DataTable, FormKit, KPICard, etc.)
- ✅ Mock data infrastructure with Faker.js
- ✅ OpenAPI specification (`/api/openapi.yaml`)
- ✅ Module registration system
- ✅ Testing setup with Playwright
- ✅ Development workflow documentation

### File Structure:
```
src/
├── components/
│   ├── guards/RBACGuard.tsx
│   ├── shared/
│   │   ├── DataTable.tsx
│   │   ├── FormKit.tsx
│   │   ├── PageHeader.tsx
│   │   ├── KPICard.tsx
│   │   ├── ChartKit.tsx
│   │   ├── EmptyState.tsx
│   │   └── FilterDrawer.tsx
│   └── layout/MainLayout.tsx
├── lib/
│   ├── mockAdapter.ts
│   └── moduleRegistry.ts
├── pages/
│   └── [module]/[page].tsx
config/
├── rolePolicies.json
api/
└── openapi.yaml
```

## Pass-2: Wireframes

**Goal**: Convert BRD into functional wireframes using shared components

### Process:
1. Receive module BRD (Business Requirements Document)
2. Update module spec: `registerModuleSpec(route, { owner, brdStatus: 'approved' })`
3. Replace placeholder page with functional wireframes:
   - Use shared components (DataTable, FormKit, etc.)
   - Implement forms, tables, and workflows
   - Connect to mock APIs
   - Add proper filtering and pagination
4. Update `promptStatus: 'completed'`

### Example BRD Structure:
```json
{
  "module": "/Me/Leave",
  "owner": "HR Team",
  "requirements": {
    "pages": ["List", "Submit", "History"],
    "features": ["Request submission", "Approval workflow", "Balance tracking"],
    "data": ["Leave types", "Approval hierarchy", "Balance calculations"]
  }
}
```

### Implementation Pattern:
```tsx
// Before (Pass-1): Placeholder
<div className="p-8 text-center">
  <h1>Leave Management</h1>
  <p>Under development</p>
</div>

// After (Pass-2): Functional wireframes
<PageHeader title="My Leave" owner="HR Team" brdStatus="approved" />
<DataTable 
  data={mockLeaveRequests} 
  columns={leaveColumns}
  searchable
  exportable
/>
<FormKit 
  schema={leaveRequestSchema}
  fields={leaveFormFields}
  onSubmit={handleSubmitLeave}
/>
```

## Pass-3: Deep Spec

**Goal**: Replace mocks with live backend, add integrations

### Process:
1. Receive detailed technical specification
2. Replace mock data with live API calls
3. Implement database models (Prisma)
4. Add authentication/authorization
5. Integrate third-party services
6. Add analytics and monitoring
7. Performance optimization

### Backend Integration:
```typescript
// Environment toggle
const USE_MOCK = process.env.VITE_USE_MOCK === 'true'

// API service with mock fallback
export const apiService = {
  getEmployees: USE_MOCK 
    ? () => mockApiCall(generateMockEmployees())
    : () => fetch('/api/employees').then(r => r.json())
}
```

## Development Commands

```bash
# Development with mocks (default)
npm run dev

# Development with live backend
VITE_USE_MOCK=false npm run dev

# Run tests
npm run test

# Run Playwright tests
npm run test:e2e

# Build for production
npm run build
```

## Module Registration

Track module development status:

```typescript
import { registerModuleSpec } from '@/lib/moduleRegistry'

// Register module specification
registerModuleSpec('/Me/Leave', {
  owner: 'Sarah (HR)',
  brdStatus: 'approved',
  promptStatus: 'completed',
  description: 'Employee leave management with approval workflow'
})
```

## Role-Based Access Control

Defined in `/config/rolePolicies.json`:

- **Employee**: Basic self-service access
- **Manager**: Team management capabilities
- **Recruiter**: Hiring-specific permissions  
- **HR**: Comprehensive HR functions
- **Management**: Strategic oversight
- **Admin**: System administration

Usage:
```tsx
<RBACGuard route="/HR/Performance">
  <PerformanceManagement />
</RBACGuard>
```

## Testing Strategy

### Unit Tests (Jest)
- Component functionality
- Business logic
- API integrations

### E2E Tests (Playwright)
- User workflows
- Navigation
- Form submissions
- Data loading

### Test Data
All tests use deterministic mock data for consistency.

## Next Steps

1. **Complete Pass-1**: All routes scaffolded ✅
2. **Begin Pass-2**: Await module BRDs for wireframe development
3. **Prepare Pass-3**: Set up backend infrastructure

## Support

For questions about the 3-pass workflow:
- Review this documentation
- Check module registry status
- Examine existing wireframe implementations
- Refer to OpenAPI specification

The system is designed for rapid iteration while maintaining code quality and architectural consistency.
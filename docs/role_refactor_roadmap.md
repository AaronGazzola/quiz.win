# Better Auth Role Access Refactor Complete Implementation Roadmap

This roadmap outlines the complete migration from the current custom role system to Better Auth's organization and admin plugins, implementing proper multi-tenant role-based access control for the Learning Management System.

## 🎯 Current Status (Updated: 2025-09-26)

### ✅ COMPLETED PHASES

- **Analysis Phase** - Comprehensive review of current implementation and Better Auth capabilities

### 🔄 IN PROGRESS

- **Phase 0: Planning & Documentation** - Creating implementation roadmap and migration strategy

### ⏳ REMAINING WORK

- **Phase 1**: Better Auth Plugin Setup & Configuration
- **Phase 2**: Database Schema Migration
- **Phase 3**: Authentication System Integration
- **Phase 4**: Role Utilities Refactor
- **Phase 5**: Invitation System Migration
- **Phase 6**: User Management Updates
- **Phase 7**: Data Access Control Implementation
- **Phase 8**: UI Updates & Testing

### 🚀 READY TO USE

Current system provides:
- Basic multi-tenant organization support with custom implementation
- User invitation system via magic links
- Global and organization-specific role management
- Content access control based on organization membership
- User management with ban/unban functionality

### 📍 NEXT STEPS

1. Install Better Auth organization and admin plugins
2. Configure plugin settings and access control rules
3. Create database migration strategy
4. Set up parallel implementation for safe migration

## Prerequisites

- ✅ Better Auth already configured in project
- ✅ PostgreSQL database with multi-schema support
- ✅ Resend email service for invitations
- ✅ Prisma ORM for database management
- ⏳ Better Auth v1.0+ with organization and admin plugins
- ⏳ Development environment for testing migration

## ⏳ Phase 1: Better Auth Plugin Setup & Configuration

Setup Better Auth organization and admin plugins with proper access control configuration.

### ⏳ 1.1 Install Better Auth Plugins (`package.json`) - PENDING

Install required Better Auth plugins and update dependencies:

- Install `better-auth` latest version with organization plugin support
- Ensure compatibility with existing authentication setup
- Update TypeScript types for new plugin APIs

**Key Dependencies Required:**

- `better-auth@latest` - Core authentication with plugin support
- Update existing Better Auth configuration to include plugins

### ⏳ 1.2 Configure Organization Plugin (`lib/auth.ts`) - PENDING

Configure Better Auth with organization plugin and custom access control:

- Setup organization plugin with custom roles and permissions
- Define access control rules for quiz, question, response, and user resources
- Configure organization limits and member permissions
- Setup email templates for invitations

**Key Configuration Required:**

```typescript
organization({
  ac: createAccessControl({
    quiz: ["create", "read", "update", "delete"],
    question: ["create", "read", "update", "delete"],
    response: ["read", "delete", "export"],
    user: ["invite", "remove", "update-role", "view"]
  }),
  roles: ["owner", "admin", "member"],
  creatorRole: "admin",
  organizationLimit: 10,
  memberLimit: 100
})
```

### ⏳ 1.3 Configure Admin Plugin (`lib/auth.ts`) - PENDING

Setup admin plugin for system-wide user management:

- Configure admin plugin with custom permissions
- Setup super-admin role hierarchy
- Define admin-specific access control rules
- Configure impersonation settings

**Key Configuration Required:**

```typescript
admin({
  defaultRole: "user",
  adminRole: "super-admin",
  impersonationSessionDuration: 60 * 60, // 1 hour
  disableBannedUserMessage: true
})
```

### ⏳ 1.4 Environment Configuration (`.env`) - PENDING

Add required environment variables:

- Organization-related configuration
- Admin plugin settings
- Email template configurations
- Base URL for invitation callbacks

## ⏳ Phase 2: Database Schema Migration

Migrate from custom organization schema to Better Auth's generated schema.

### ⏳ 2.1 Generate Better Auth Schema (`prisma/schema.prisma`) - PENDING

Generate new database schema with Better Auth plugins:

- Run Better Auth schema generation
- Review generated organization, member, invitation tables
- Plan migration from existing custom tables
- Ensure schema compatibility with existing user data

**Key Schema Changes:**

- Replace custom `Organization` model with Better Auth version
- Replace custom `Member` model with Better Auth version
- Replace custom `Invitation` model with Better Auth version
- Maintain references in `Quiz`, `Question`, `Response` models

### ⏳ 2.2 Create Migration Scripts (`prisma/migrations/`) - PENDING

Create database migration scripts to transfer existing data:

- Create migration to backup existing data
- Map existing organization data to new schema
- Transfer member relationships with role mapping
- Migrate pending invitations to new system
- Create rollback procedures

**Key Migration Tasks:**

- `backup_existing_data.sql` - Backup current organization data
- `transfer_organizations.sql` - Migrate organization records
- `transfer_members.sql` - Migrate member relationships
- `cleanup_old_tables.sql` - Remove deprecated tables

### ⏳ 2.3 Update Content Model References (`prisma/schema.prisma`) - PENDING

Update existing models to reference Better Auth organization structure:

- Update `Quiz` model organization references
- Ensure proper foreign key constraints
- Add organization-scoped indexes for performance
- Update related model relationships

**Key Model Updates:**

- Quiz.organizationId → references Better Auth organization
- Add organization-scoped compound indexes
- Update cascade deletion rules

## ⏳ Phase 3: Authentication System Integration

Integrate Better Auth plugins with existing authentication system.

### ⏳ 3.1 Update Auth Client (`lib/auth-client.ts`) - PENDING

Extend auth client with organization and admin capabilities:

- Add organization management methods
- Include admin functionality for user management
- Setup proper TypeScript types for new APIs
- Integrate with existing session management

**Key Methods Required:**

- `auth.organization.create()` - Organization creation
- `auth.organization.invite()` - User invitations
- `auth.admin.listUsers()` - User management
- `auth.admin.updateUserRole()` - Role management

### ⏳ 3.2 Update Session Handling (`lib/auth.utils.ts`) - PENDING

Update authentication utilities to work with new plugin structure:

- Modify `getAuthenticatedClient()` to include organization context
- Update user session validation
- Add organization and admin permission checking
- Ensure backward compatibility during migration

**Key Updates Required:**

- Enhanced session validation with organization context
- Permission checking utilities using Better Auth APIs
- Proper error handling for authorization failures

### ⏳ 3.3 Update User Types (`app/layout.types.ts`) - PENDING

Update user type definitions to match Better Auth schema:

- Update `ExtendedUser` interface for Better Auth compatibility
- Add organization relationship types
- Include admin-specific user properties
- Maintain compatibility with existing components

## ⏳ Phase 4: Role Utilities Refactor

Replace custom role management with Better Auth API calls.

### ⏳ 4.1 Refactor Role Utils (`lib/role.utils.ts`) - PENDING

Replace custom role functions with Better Auth API calls:

- Replace `isOrgAdmin()` with Better Auth organization role check
- Update `canManageContent()` to use proper permission checking
- Implement `canViewContent()` with organization membership validation
- Add async/await patterns for Better Auth API calls

**Key Function Updates:**

```typescript
// Replace custom logic with Better Auth APIs
export const isOrgAdmin = async (userId: string, organizationId: string) => {
  return await auth.api.organization.hasRole({
    userId, organizationId, role: "admin"
  })
}

export const canManageQuizzes = async (userId: string, organizationId: string) => {
  return await auth.api.organization.hasPermission({
    userId, organizationId, resource: "quiz", action: "create"
  })
}
```

### ⏳ 4.2 Create Organization Utils (`lib/org.utils.ts`) - PENDING

Create new utility functions for organization management:

- Organization creation and management utilities
- Member invitation and role management helpers
- Organization switching and context management
- Permission checking helpers

**Key Utilities Required:**

- `getUserOrganizations(userId)` - Get user's organizations with roles
- `switchActiveOrganization(userId, orgId)` - Change active organization
- `validateOrgAccess(userId, orgId, action)` - Check specific permissions

### ⏳ 4.3 Update Permission Middleware (`lib/permissions.ts`) - PENDING

Create middleware for route-level permission checking:

- Organization-scoped route protection
- Admin-only route protection
- Resource-specific permission checking
- Integration with Next.js middleware

**Key Middleware Functions:**

- `requireOrgMembership()` - Ensure user is organization member
- `requireOrgAdmin()` - Ensure user is organization admin
- `requireSuperAdmin()` - Ensure user is system admin

## ⏳ Phase 5: Invitation System Migration

Replace custom invitation system with Better Auth organization invitations.

### ⏳ 5.1 Update Invitation Actions (`app/dashboard/invite/page.actions.ts`) - PENDING

Replace custom invitation logic with Better Auth organization API:

- Use Better Auth's built-in invitation system
- Remove custom magic link generation
- Implement proper role assignment during invitation
- Add invitation validation and error handling

**Key Action Updates:**

```typescript
export const sendInvitationsAction = async (
  emails: string[],
  role: "admin" | "member",
  organizationId: string
) => {
  // Replace custom logic with Better Auth organization invitation
  for (const email of emails) {
    await auth.api.organization.inviteUser({
      userId: session.user.id,
      organizationId,
      email,
      role,
      inviteRedirectURI: `${baseUrl}/dashboard/accept-invitation`
    })
  }
}
```

### ⏳ 5.2 Update Invitation Hooks (`app/dashboard/invite/page.hooks.ts`) - PENDING

Update React Query hooks to use new Better Auth APIs:

- Modify organization fetching to use Better Auth APIs
- Update invitation sending to use organization plugin
- Add proper error handling for Better Auth responses
- Maintain existing UI state management patterns

### ⏳ 5.3 Create Invitation Acceptance Flow (`app/dashboard/accept-invitation/`) - PENDING

Create new page for handling invitation acceptance:

- Parse invitation tokens from Better Auth
- Display invitation details (organization, role)
- Handle invitation acceptance/rejection
- Redirect to appropriate dashboard after acceptance
- Integration with Better Auth invitation handling

**Key Components Required:**

- `page.tsx` - Invitation acceptance UI
- `page.actions.ts` - Invitation processing server actions
- `page.hooks.ts` - React Query hooks for invitation handling

## ⏳ Phase 6: User Management Updates

Update user management system to use Better Auth patterns.

### ⏳ 6.1 Update User Management Actions (`app/dashboard/users/page.actions.ts`) - PENDING

Refactor user management to use Better Auth admin and organization APIs:

- Replace custom user filtering with Better Auth queries
- Use organization-scoped user retrieval
- Implement Better Auth user ban/unban functionality
- Add role management through Better Auth APIs

**Key Action Updates:**

```typescript
export const getUsersAction = async (organizationId?: string) => {
  // Use Better Auth organization API for user listing
  const users = await auth.api.organization.listMembers({
    organizationId,
    userId: session.user.id
  })

  return users.filter(user =>
    hasPermission(session.user.id, organizationId, "user", "view")
  )
}

export const updateUserRoleAction = async (userId: string, organizationId: string, role: string) => {
  return await auth.api.organization.updateMemberRole({
    userId: session.user.id,
    organizationId,
    targetUserId: userId,
    role
  })
}
```

### ⏳ 6.2 Update User Management Hooks (`app/dashboard/users/page.hooks.ts`) - PENDING

Update React Query hooks for new user management APIs:

- Modify user fetching to use Better Auth organization APIs
- Update user ban/unban to use admin plugin
- Add role update functionality through Better Auth
- Maintain existing pagination and filtering logic

### ⏳ 6.3 Create Organization Switching (`components/OrganizationSwitcher.tsx`) - PENDING

Enhance organization switcher with Better Auth integration:

- Use Better Auth APIs to fetch user organizations
- Implement active organization context management
- Add organization creation through Better Auth
- Update organization switching logic

## ⏳ Phase 7: Data Access Control Implementation

Implement organization-scoped data access throughout the application.

### ⏳ 7.1 Update Quiz Management (`app/dashboard/quizzes/`) - PENDING

Implement organization-scoped quiz access control:

- Update quiz creation to enforce organization membership
- Add organization context to quiz queries
- Implement permission checking for quiz operations
- Ensure data isolation between organizations

**Key Updates Required:**

- `page.actions.ts` - Organization-scoped quiz CRUD operations
- `page.hooks.ts` - Updated React Query hooks with organization context
- Permission validation for quiz management operations

### ⏳ 7.2 Create Data Access Utilities (`lib/data-access.ts`) - PENDING

Create utilities for organization-scoped data operations:

- Generic organization-scoped query wrapper
- Permission-based data filtering
- Automatic organization context injection
- Error handling for authorization failures

**Key Utilities:**

```typescript
export const getOrgScopedData = async <T>(
  userId: string,
  organizationId: string,
  resource: string,
  action: string,
  queryFn: (orgId: string) => Promise<T>
): Promise<T | null> => {
  const hasAccess = await auth.api.organization.hasPermission({
    userId, organizationId, resource, action
  })

  if (!hasAccess) throw new Error('Insufficient permissions')

  return await queryFn(organizationId)
}
```

### ⏳ 7.3 Update Dashboard Layout (`app/dashboard/layout.tsx`) - PENDING

Update dashboard to include organization context:

- Add organization context provider
- Implement organization-aware navigation
- Add organization switching interface
- Update layout with organization branding

## ⏳ Phase 8: UI Updates & Testing

Update UI components and implement comprehensive testing.

### ⏳ 8.1 Update Role Display Components - PENDING

Update UI components to display Better Auth roles correctly:

- Update role display logic in user tables
- Add organization-specific role badges
- Update invitation forms with correct role options
- Ensure consistent role terminology throughout UI

**Components to Update:**

- `app/dashboard/users/page.tsx` - User role display
- `app/dashboard/invite/page.tsx` - Role selection dropdown
- `components/UserAvatar.tsx` - Role-based user display

### ⏳ 8.2 Create Organization Management UI - PENDING

Create comprehensive organization management interface:

- Organization settings page
- Member management interface
- Role assignment tools
- Organization switching interface
- Invitation management dashboard

**New Components Required:**

- `app/dashboard/organization/settings/page.tsx` - Organization settings
- `app/dashboard/organization/members/page.tsx` - Member management
- `components/MemberRoleSelector.tsx` - Role assignment interface

### ⏳ 8.3 Implement Comprehensive Testing - PENDING

Create test suite for new role system:

- Unit tests for role utility functions
- Integration tests for organization operations
- E2E tests for invitation flow
- Permission boundary testing
- Data isolation testing

**Test Files Required:**

- `__tests__/lib/role.utils.test.ts` - Role utility tests
- `__tests__/auth/organization.test.ts` - Organization API tests
- `__tests__/e2e/invitation-flow.test.ts` - End-to-end invitation tests
- `__tests__/auth/permissions.test.ts` - Permission system tests

### ⏳ 8.4 Migration Testing & Cleanup - PENDING

Validate migration success and cleanup legacy code:

- Test data integrity after migration
- Validate all role-based permissions work correctly
- Remove legacy role management code
- Update documentation and code comments
- Performance testing for new permission system

**Cleanup Tasks:**

- Remove old organization models and utilities
- Clean up unused imports and types
- Update API documentation
- Archive migration scripts
- Performance optimization

## Quality Gates

After each phase:

1. **Unit Tests**: Test new utility functions and API integrations
2. **Integration Tests**: Test Better Auth plugin integration
3. **Permission Tests**: Validate role-based access control
4. **Data Tests**: Ensure proper data isolation between organizations
5. **UI Tests**: Verify user interface updates work correctly
6. **Migration Tests**: Validate data migration integrity

## Implementation Notes

### Migration Strategy

- **Feature Flags**: Use environment variables to switch between old/new systems
- **Parallel Testing**: Run both systems side-by-side during migration
- **Gradual Rollout**: Migrate one organization at a time if needed
- **Rollback Plan**: Maintain ability to revert to previous system

### Security Considerations

- **Permission Validation**: Double-check all permission boundaries
- **Data Isolation**: Ensure complete separation between organizations
- **Access Control**: Validate all role-based access patterns
- **Audit Trail**: Log all role and permission changes

### Performance Optimization

- **Caching**: Implement role and permission caching
- **Database Indexes**: Add organization-scoped database indexes
- **Query Optimization**: Optimize organization-filtered queries
- **API Efficiency**: Minimize Better Auth API calls where possible

This roadmap provides a comprehensive migration path from the current custom role system to Better Auth's robust plugin-based approach, ensuring proper multi-tenant access control while maintaining system functionality throughout the migration process.
# Better Auth Role Access Refactor Complete Implementation Roadmap

This roadmap outlines the complete migration from the current custom role system to Better Auth's organization and admin plugins, implementing proper multi-tenant role-based access control for the Learning Management System.

## 🎯 Current Status (Updated: 2025-09-26)

### ✅ COMPLETED PHASES

- **Analysis Phase** - Comprehensive review of current implementation and Better Auth capabilities
- **Phase 0: Planning & Documentation** - Creating implementation roadmap and migration strategy
- **Phase 1: Better Auth Plugin Setup & Configuration** - ✅ COMPLETE
  - ✅ Updated Better Auth to latest version with organization and admin plugins
  - ✅ Configured organization plugin with access control for quiz/question/response/user resources
  - ✅ Configured admin plugin with super-admin role and impersonation settings
  - ✅ Environment variables already properly configured
- **Phase 2: Database Schema Migration** - ✅ COMPLETE
  - ✅ Generated Better Auth schema with organization models using CLI
  - ✅ Successfully migrated database with Prisma while preserving existing models
  - ✅ Fixed invitation-user relationship for proper schema validation
- **Phase 3: Authentication System Integration** - ✅ COMPLETE
  - ✅ Extended auth client with organization and admin capabilities
  - ✅ Updated session handling with organization context and permission utilities
  - ✅ Enhanced user types and stores for Better Auth compatibility
- **Phase 4: Role Utilities Refactor** - ✅ COMPLETE
  - ✅ Completely replaced custom role logic with Better Auth API calls
  - ✅ Implemented async role checking functions using Better Auth permissions
  - ✅ Added resource-specific permission functions (quiz, response, user management)
- **Phase 5: Invitation System Migration** - ✅ COMPLETE
  - ✅ Updated invitation page to use Better Auth organization permissions
  - ✅ Replaced custom invitation logic with Better Auth organization API
  - ✅ Updated React Query hooks to use new Better Auth APIs
  - ✅ Created client-safe role checking utilities for UI components
  - ✅ Fixed TypeScript types and resolved build issues
- **Phase 6: User Management Updates** - ✅ COMPLETE
  - ✅ Implemented advanced users data table with organization filtering
  - ✅ Updated user management actions to use Better Auth APIs
  - ✅ Refactored user management hooks with organization-scoped access
  - ✅ Created comprehensive user management stores with table state
- **Phase 7: Data Access Control Implementation** - ✅ COMPLETE
  - ✅ Updated dashboard page with organization-scoped data access
  - ✅ Implemented dual-table quiz management with radio selection and admin-only responses
  - ✅ Updated take quiz page with Better Auth organization membership validation
  - ✅ Updated quiz results page with organization-scoped access control
  - ✅ Created comprehensive data access utilities for permission checking
  - ✅ Updated dashboard layout with organization context support

### 🔄 IN PROGRESS

- None - Ready to proceed with Phase 8

### ⏳ REMAINING WORK

- **Phase 8**: UI Updates & Testing

### 🚀 READY TO USE

Current system provides:

- ✅ Better Auth organization plugin with multi-tenant access control
- ✅ Resource-based permissions (quiz, question, response, user management)
- ✅ Organization role hierarchy (owner, admin, member)
- ✅ Database schema migrated to Better Auth models
- ✅ Async role checking functions using Better Auth APIs
- ✅ Organization context in session handling
- ✅ Enhanced type system for Better Auth compatibility
- ✅ Fully migrated invitation system with Better Auth organization invitations
- ✅ Client-safe role checking utilities for UI components
- ✅ Advanced user management with organization-scoped data tables
- ✅ Complete data access control implementation throughout application
- ✅ Dual-table quiz management with admin-only response viewing
- ✅ Organization-scoped quiz taking and results viewing
- ✅ Comprehensive data access utilities and permission checking

### 📍 NEXT STEPS

1. Update UI components with role-based displays and Better Auth integration
2. Remove deprecated responses page and clean up navigation
3. Implement comprehensive testing for Better Auth integration
4. Performance optimization and cleanup of legacy code

## 📄 Existing Page Routes & Implementation Strategy

### Dashboard Pages (All Organization-Scoped)

- **`/dashboard`** - Main dashboard showing organization-filtered data and metrics
- **`/dashboard/invite`** - Invite users to organizations (admin-only permission)
- **`/dashboard/users`** - Advanced data table of organization users (admin-only view)
- **`/dashboard/quizzes`** - Dual-table layout: quizzes + responses (radio-button selection)
- **`/dashboard/take-quiz/[id]`** - Quiz taking interface (member access to org quizzes)
- **`/dashboard/quiz-results/[id]`** - Quiz results view (organization-scoped access)

### Page-Specific Functionality

**Invite Page** (`/dashboard/invite`):
- Only accessible to users who are admins of at least one organization
- Organization dropdown for users with multiple admin organizations
- Role assignment (admin/member) when sending invitations

**Users Page** (`/dashboard/users`):
- Advanced data table implementation (see Table_Prompt.md)
- Organization filter dropdown (showing only admin organizations)
- Display users from selected organization with full CRUD operations
- Multi-select bulk operations for user management

**Quizzes Page** (`/dashboard/quizzes`):
- **Top Table**: Organization-scoped quizzes with radio button selection
- **Bottom Table**: Responses for selected quiz (admin-only, populated on selection)
- Both tables follow advanced data table patterns
- **Removed**: Separate `/dashboard/responses` page (functionality integrated here)

**Quiz Access Pages**:
- All quiz-related pages show only organization-member accessible content
- Permission validation before displaying quiz data
- Results scoped to user's organization memberships

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
    user: ["invite", "remove", "update-role", "view"],
  }),
  roles: ["owner", "admin", "member"],
  creatorRole: "admin",
  organizationLimit: 10,
  memberLimit: 100,
});
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
  disableBannedUserMessage: true,
});
```

### ⏳ 1.4 Environment Configuration (`.env`) - PENDING

Add required environment variables:

- Organization-related configuration
- Admin plugin settings
- Email template configurations
- Base URL for invitation callbacks

## ⏳ Phase 2: Database Schema Migration

Migrate from custom organization schema to Better Auth's generated schema using Prisma's recommended approach.

### ⏳ 2.1 Update Schema with Better Auth Models (`prisma/schema.prisma`) - PENDING

Update database schema to use Better Auth organization plugin models:

- Generate Better Auth schema using plugin configuration
- Replace custom `Organization`, `Member`, and `Invitation` models
- Update existing models to reference Better Auth organization structure
- Add organization-scoped indexes for performance

**Key Schema Changes:**

- Remove custom `Organization`, `Member`, `Invitation` models
- Add Better Auth generated models via plugin
- Update `Quiz.organizationId` to reference Better Auth organization
- Add organization-scoped compound indexes
- Update cascade deletion rules

### ⏳ 2.2 Apply Schema Migration (`npx prisma migrate dev`) - PENDING

Apply schema changes using Prisma's development migration workflow:

```bash
# Reset database and apply new schema
npx prisma migrate reset

# Generate and apply new migration
npx prisma migrate dev --name "migrate-to-better-auth-organizations"

# Re-seed database with updated data structure
npx prisma db seed
```

**Migration Steps:**

- Reset existing database (acceptable for development)
- Generate migration with Better Auth organization models
- Apply migration using Prisma's recommended workflow
- Re-seed database with initial data

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
    userId,
    organizationId,
    role: "admin",
  });
};

export const canManageQuizzes = async (
  userId: string,
  organizationId: string
) => {
  return await auth.api.organization.hasPermission({
    userId,
    organizationId,
    resource: "quiz",
    action: "create",
  });
};
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

## ✅ Phase 5: Invitation System Migration - COMPLETE

Replace custom invitation system with Better Auth organization invitations on existing invite page.

### ✅ 5.1 Update Invitation Page (`app/dashboard/invite/page.tsx`) - COMPLETE

Updated existing invite page to use Better Auth organization permissions:

- ✅ Updated to only show organizations where user has admin permissions
- ✅ Fixed role selection to use "admin" instead of "org-admin" for Better Auth compatibility
- ✅ Implemented client-safe role checking for super admin features
- ✅ Updated TypeScript types for Better Auth organization structure

**Completed Updates:**

- Updated organization fetching to use `getUserAdminOrganizations()`
- Fixed role value mapping for Better Auth standards
- Created client-safe utilities in `lib/client-role.utils.ts`

### ✅ 5.2 Update Invitation Actions (`app/dashboard/invite/page.actions.ts`) - COMPLETE

Replaced custom invitation logic with Better Auth organization API:

- ✅ Migrated to `auth.api.inviteToOrganization()` for sending invitations
- ✅ Removed custom magic link generation in favor of Better Auth's built-in system
- ✅ Implemented proper permission validation using `auth.api.hasPermission()`
- ✅ Updated organization fetching to use Better Auth APIs
- ✅ Fixed TypeScript types for Better Auth compatibility

**Completed Implementation:**

```typescript
// Updated to use Better Auth organization invitation API
export const sendInvitationsAction = async (
  emails: string[],
  role: "admin" | "member",
  organizationId: string
) => {
  const canManageUsers = await auth.api.hasPermission({
    userId: session.user.id,
    organizationId,
    resource: "user",
    action: "invite",
    headers: await headers(),
  });

  for (const email of validEmails) {
    await auth.api.inviteToOrganization({
      userId: session.user.id,
      organizationId,
      email: email.trim(),
      role,
      headers: await headers(),
    });
  }
};
```

### ✅ 5.3 Update Invitation Hooks (`app/dashboard/invite/page.hooks.ts`) - COMPLETE

Updated React Query hooks to use new Better Auth APIs:

- ✅ Updated mutation function to use new role types ("admin" | "member")
- ✅ Maintained existing React Query patterns and error handling
- ✅ Fixed TypeScript types for Better Auth compatibility
- ✅ Preserved existing UI state management and success/error toast patterns

**Completed Updates:**

- Updated `useSendInvitations` hook with correct role types
- Maintained existing React Query patterns for consistency
- Preserved toast notification system for user feedback

## ✅ Phase 6: User Management Updates - COMPLETE

Update existing users page to use Better Auth patterns with advanced data table implementation.

### ✅ 6.1 Implement Advanced Users Data Table (`app/dashboard/users/page.tsx`) - COMPLETE

Replace existing users page with advanced data table (see Table_Prompt.md):

- Display users from organizations where signed-in user is admin
- Organization filter dropdown to switch between admin organizations
- Multi-select functionality for bulk user operations
- Search across user names and emails with debounced input
- Column sorting (name, email, role, status, join date)
- Dynamic pagination based on viewport height
- Role management toggles for admin users

**Key Features:**

- Organization-scoped data access with admin permission validation
- Bulk operations: role updates, ban/unban users
- Row actions: individual user management, role changes
- Responsive design with mobile-friendly interactions

### ✅ 6.2 Update User Management Actions (`app/dashboard/users/page.actions.ts`) - COMPLETE

Refactor user management to use Better Auth admin and organization APIs:

- Fetch users only from organizations where user is admin
- Implement organization filtering with Better Auth queries
- Add bulk user operations with proper permission validation
- Role management through Better Auth APIs

**Key Action Updates:**

```typescript
export const getUsersAction = async (
  organizationId?: string,
  search?: string,
  page?: number,
  limit?: number
) => {
  // Only fetch from organizations where user is admin
  const adminOrgs = await auth.api.organization.listOrganizations({
    userId: session.user.id,
    role: "admin"
  });

  const targetOrgId = organizationId || adminOrgs[0]?.id;
  if (!targetOrgId) return [];

  const users = await auth.api.organization.listMembers({
    organizationId: targetOrgId,
    userId: session.user.id,
    search,
    offset: page * limit,
    limit
  });

  return users;
};

export const updateUserRoleAction = async (
  userId: string,
  organizationId: string,
  role: string
) => {
  // Validate admin permissions
  const isAdmin = await auth.api.organization.hasRole({
    userId: session.user.id,
    organizationId,
    role: "admin"
  });

  if (!isAdmin) throw new Error("Insufficient permissions");

  return await auth.api.organization.updateMemberRole({
    userId: session.user.id,
    organizationId,
    targetUserId: userId,
    role
  });
};
```

### ✅ 6.3 Update User Management Hooks (`app/dashboard/users/page.hooks.ts`) - COMPLETE

Implement advanced table hooks following Table_Prompt.md patterns:

- Debounced search hook for real-time filtering
- Organization selection hook for admin organizations
- Bulk operations hook with loading states
- Dynamic pagination hook with viewport-based calculations
- User data fetching with Better Auth organization APIs

### ✅ 6.4 Create User Management Stores (`app/dashboard/users/page.stores.tsx`) - COMPLETE

Implement Zustand stores for table state management:

- User table state (pagination, sorting, search, selection)
- Organization filter state
- Bulk operation modal states
- Selection tracking with Set-based operations

## ✅ Phase 7: Data Access Control Implementation - COMPLETE

Implement organization-scoped data access throughout existing application pages.

### ✅ 7.1 Update Dashboard Page (`app/dashboard/page.tsx`) - COMPLETE

Implement organization-scoped dashboard data:

- Show only data from organizations user is member of
- Display organization-filtered metrics and recent activity
- Add organization context for all dashboard widgets
- Ensure proper permission checking for displayed data

### ✅ 7.2 Update Quiz Management Page (`app/dashboard/quizzes/page.tsx`) - COMPLETE

Replace existing quizzes page with dual-table layout and organization-scoped access:

- **Quiz Table**: Advanced data table showing organization-scoped quizzes
  - Display quizzes from user's member organizations
  - Search, sort, and pagination following Table_Prompt.md
  - Radio button selection for each quiz row
  - Admin-only actions: create, edit, delete quizzes

- **Responses Table**: Below quiz table, populated by radio selection
  - Only show when quiz is selected via radio button
  - Display responses for selected quiz from user's admin organizations only
  - Admin permission required to view responses
  - Advanced table features: search, sort, export responses

**Implementation Details:**

```typescript
// Quiz selection state
const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

// Only load responses when quiz selected and user is admin
const canViewResponses = await auth.api.organization.hasRole({
  userId: session.user.id,
  organizationId: quiz.organizationId,
  role: "admin"
});
```

### ✅ 7.3 Update Take Quiz Page (`app/dashboard/take-quiz/[id]/page.tsx`) - COMPLETE

Implement organization-scoped quiz access:

- Validate user membership in quiz's organization before allowing access
- Show quiz only if user is member of the organization
- Proper permission validation and error handling
- Redirect unauthorized users with appropriate message

### ✅ 7.4 Update Quiz Results Page (`app/dashboard/quiz-results/[id]/page.tsx`) - COMPLETE

Implement organization-scoped results access:

- Show results only for quizzes from user's member organizations
- Validate user has permission to view specific quiz results
- Display results with organization context
- Admin users see aggregate results, members see only their own

### ✅ 7.5 Create Data Access Utilities (`lib/data-access.ts`) - COMPLETE

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
    userId,
    organizationId,
    resource,
    action,
  });

  if (!hasAccess) throw new Error("Insufficient permissions");

  return await queryFn(organizationId);
};

export const getUserMemberOrganizations = async (userId: string) => {
  return await auth.api.organization.listOrganizations({
    userId,
    role: ["owner", "admin", "member"]
  });
};

export const getUserAdminOrganizations = async (userId: string) => {
  return await auth.api.organization.listOrganizations({
    userId,
    role: ["owner", "admin"]
  });
};
```

### ✅ 7.6 Update Dashboard Layout (`app/dashboard/layout.tsx`) - COMPLETE

Update dashboard to include organization context:

- ✅ Add organization context provider for user's organizations
- ✅ Implement organization-aware navigation
- ✅ Update layout with current organization context
- ✅ Remove references to deprecated responses page route

## ⏳ Phase 8: UI Updates & Testing

Update existing UI components and implement comprehensive testing.

### ⏳ 8.1 Update Role Display Components - PENDING

Update existing UI components to display Better Auth roles correctly:

- Update role display logic in user tables (users page)
- Add organization-specific role badges
- Update invitation forms with correct role options (invite page)
- Update user avatars and profile displays with role context
- Ensure consistent role terminology throughout existing UI

**Existing Components to Update:**

- `app/dashboard/users/page.tsx` - Advanced table with role display
- `app/dashboard/invite/page.tsx` - Role selection dropdown with permissions
- Existing user avatar and profile components - Role-based display

### ⏳ 8.2 Update Navigation and Layout Components - PENDING

Update existing dashboard navigation and layout:

- Remove responses page route from navigation
- Update sidebar navigation to reflect new page structure
- Add organization context to layout components
- Update breadcrumb navigation for organization-scoped pages
- Ensure all navigation respects organization permissions

**Layout Updates:**

- Remove `/dashboard/responses` route references
- Update navigation menu structure
- Add organization switching interface to existing layout
- Update page titles and metadata with organization context

### ⏳ 8.3 Implement Comprehensive Testing - PENDING

Create test suite for Better Auth integration:

- Unit tests for role utility functions
- Integration tests for organization operations
- E2E tests for invitation flow using existing pages
- Permission boundary testing across all existing pages
- Data isolation testing for organization-scoped data

**Test Files Required:**

- `__tests__/lib/role.utils.test.ts` - Role utility tests
- `__tests__/auth/organization.test.ts` - Organization API tests
- `__tests__/e2e/existing-pages.test.ts` - End-to-end tests for updated pages
- `__tests__/auth/permissions.test.ts` - Permission system tests
- `__tests__/pages/dual-table.test.ts` - Quiz/responses dual table tests

### ⏳ 8.4 Cleanup Legacy Code - PENDING

Remove deprecated code and update existing implementations:

- Remove deprecated responses page (`app/dashboard/responses/`)
- Remove legacy role management code and custom organization models
- Update existing API routes to use Better Auth
- Clean up unused imports and types from existing files
- Performance optimization for Better Auth API calls

**Cleanup Tasks:**

- Delete entire `app/dashboard/responses/` directory
- Remove old organization models and utilities from schema
- Clean up unused imports and types in existing files
- Update existing API documentation
- Remove any hardcoded role references in existing components

## Implementation Notes

### Migration Strategy

- **Schema Reset**: Use Prisma's `migrate reset` to start with clean Better Auth schema
- **Development Migration**: Apply changes using `npx prisma migrate dev` workflow
- **Database Re-seeding**: Re-populate database with initial data after schema migration
- **Simple Approach**: Acceptable to reset development database for clean migration

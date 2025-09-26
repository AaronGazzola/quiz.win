# Role Access Control Analysis & Recommendations

## Current Implementation Analysis

### Database Schema Structure

The current system implements a dual-role approach:

1. **Global User Roles** (User.role field):
   - `user` (default)
   - `admin`
   - `super-admin`

2. **Organization-specific Roles** (Member.role field):
   - `member` (default)
   - `admin` (organization admin)

### Current Role Logic Implementation

#### Global Roles (lib/role.utils.ts)
- `isSuperAdmin()`: Full system access
- `isAdmin()`: Global admin or super-admin access
- `isOrgAdmin()`: Organization-specific admin access or super-admin

#### Permission Functions
- `canManageContent()`: Super-admin or org-admin for specific organization
- `canViewContent()`: Super-admin or member of organization
- `canManageUsers()`: Super-admin or org-admin for specific organization

### Invitation System
- Uses Better Auth's `signIn.magicLink()` for invitations
- Role conversion: "org-admin" → "admin", "member" → "member" (in Member table)
- Super-admins and org-admins can invite to organizations they manage

### User Management
- Super-admins can view/manage all users
- Org-admins can only view/manage users from their admin organizations
- Complex filtering logic for organization-based access

## Issues with Current Implementation

### 1. Inconsistent Role Terminology
- UI uses "org-admin" but database stores as "admin"
- Global "admin" role vs organization "admin" role creates confusion
- Mixed role systems (global vs organization-specific)

### 2. Complex Permission Logic
- Multiple role checks scattered across codebase
- Manual filtering in getUsersAction (lines 42-69)
- Inconsistent access control patterns

### 3. Missing Better Auth Integration
- Custom invitation system instead of Better Auth's organization plugin
- No use of Better Auth's built-in admin/organization features
- Manual role management instead of plugin-based approach

### 4. Data Isolation Issues
- Organization data separation not enforced at database level
- Relies on application-level filtering
- Potential for data leakage between organizations

## Better Auth Organization Plugin Features

### Built-in Capabilities
- **Default Roles**: owner, admin, member
- **Organization Management**: Create, update, delete organizations
- **Invitation System**: Built-in email invitations with role assignment
- **Access Control**: Hierarchical permissions with custom resource actions
- **Database Schema**: Optimized tables for organizations, members, invitations
- **Team Support**: Optional team grouping within organizations

### Admin Plugin Features
- **User Management**: Create, list, update, remove users
- **Role Management**: Set roles, manage permissions
- **Session Control**: Ban/unban users, manage sessions
- **Impersonation**: Admin user impersonation capabilities
- **Custom Permissions**: Define custom roles and access controls

## Recommended Refactor Approach

### Phase 1: Implement Better Auth Plugins

#### 1.1 Install and Configure Organization Plugin
```typescript
// lib/auth.ts
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    organization({
      ac: createAccessControl({
        quiz: ["create", "read", "update", "delete"],
        question: ["create", "read", "update", "delete"],
        response: ["read", "delete"],
        user: ["invite", "remove", "update-role"]
      })
    })
  ]
})
```

#### 1.2 Install and Configure Admin Plugin
```typescript
// lib/auth.ts (continued)
import { admin } from "better-auth/plugins"

export const auth = betterAuth({
  plugins: [
    organization(/* config */),
    admin({
      defaultRole: "user",
      adminRole: "admin"
    })
  ]
})
```

### Phase 2: Database Schema Migration

#### 2.1 Remove Custom Organization Tables
- Replace custom Organization, Member, Invitation models
- Use Better Auth's generated schema

#### 2.2 Add Organization References to Content
```prisma
model Quiz {
  id             String   @id @default(cuid())
  title          String
  description    String?
  organizationId String   // Reference to Better Auth organization
  // ... other fields
}
```

### Phase 3: Update Role Utilities

#### 3.1 Simplified Role Functions
```typescript
// lib/role.utils.ts (refactored)
import { auth } from "@/lib/auth"

export const isOrgAdmin = async (userId: string, organizationId: string) => {
  return await auth.api.organization.hasRole({
    userId,
    organizationId,
    role: "admin"
  })
}

export const isOrgMember = async (userId: string, organizationId: string) => {
  return await auth.api.organization.hasRole({
    userId,
    organizationId,
    role: "member"
  })
}

export const canManageContent = async (userId: string, organizationId: string) => {
  const isAdmin = await auth.api.admin.hasRole({
    userId,
    role: "admin"
  })

  if (isAdmin) return true

  return await isOrgAdmin(userId, organizationId)
}
```

### Phase 4: Refactor Invitation System

#### 4.1 Use Built-in Organization Invitations
```typescript
// app/dashboard/invite/page.actions.ts (refactored)
export const sendInvitationsAction = async (
  emails: string[],
  role: "admin" | "member",
  organizationId: string
) => {
  const { user } = await getAuthenticatedClient()

  // Use Better Auth's organization invitation
  for (const email of emails) {
    await auth.api.organization.inviteUser({
      userId: user.id,
      organizationId,
      email,
      role
    })
  }
}
```

### Phase 5: Implement Data Isolation

#### 5.1 Organization-scoped Queries
```typescript
// Utility for org-scoped queries
export const getOrgScopedData = async <T>(
  userId: string,
  organizationId: string,
  queryFn: (orgId: string) => Promise<T>
): Promise<T | null> => {
  const hasAccess = await auth.api.organization.hasRole({
    userId,
    organizationId,
    role: "member" // minimum role required
  })

  if (!hasAccess) return null

  return await queryFn(organizationId)
}
```

## Migration Strategy

### Step 1: Parallel Implementation
- Implement Better Auth plugins alongside existing system
- Create feature flags to switch between implementations
- Test thoroughly in development environment

### Step 2: Data Migration
- Create migration scripts to transfer existing data
- Map current roles to Better Auth role structure
- Preserve existing user relationships

### Step 3: Gradual Rollout
- Migrate invitation system first
- Update user management functionality
- Refactor content management last
- Remove legacy code after full migration

## Benefits of Refactored Approach

### 1. Standardized Role Management
- Consistent role terminology across system
- Leverage Battle-tested Better Auth patterns
- Reduced custom code maintenance

### 2. Enhanced Security
- Built-in access control validation
- Automatic permission checking
- Reduced risk of authorization bypass

### 3. Better Scalability
- Optimized database schema
- Efficient role-based queries
- Support for complex organizational structures

### 4. Improved Developer Experience
- Clear API patterns
- Comprehensive documentation
- Community support and updates

## Implementation Timeline

### Week 1-2: Planning & Setup
- Install Better Auth plugins
- Create migration plan
- Set up development environment

### Week 3-4: Core Migration
- Migrate organization structure
- Update authentication flows
- Implement basic role checking

### Week 5-6: Feature Migration
- Refactor invitation system
- Update user management
- Migrate content access control

### Week 7-8: Testing & Cleanup
- Comprehensive testing
- Remove legacy code
- Performance optimization

## Conclusion

The current implementation works but has several architectural issues that could lead to maintenance challenges and security concerns. Migrating to Better Auth's organization and admin plugins would provide a more robust, scalable, and maintainable solution that aligns with industry best practices for multi-tenant applications.

The refactored approach leverages proven patterns, reduces custom code complexity, and provides better long-term maintainability while ensuring proper data isolation between organizations.
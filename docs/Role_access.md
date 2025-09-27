# Role Access Control - Current Implementation (Standard Better Auth)

### Current Architecture

#### Authentication Configuration (lib/auth.ts)

```typescript
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: false },
  plugins: [
    magicLink({
      /* email configuration */
    }),
    admin(), // Standard Better Auth admin plugin
    organization(), // Standard Better Auth organization plugin
  ],
});
```

---

## Role System Implementation

### Organization Roles

- **`owner`**: Full organization control (can delete org, manage all members)
- **`admin`**: Organization management (can invite/manage members, cannot delete org)
- **`member`**: Basic membership (can view organization content)

### System-wide Roles

- **`user`**: Default role for all users
- **`admin`**: System-wide administration capabilities

### Database Schema

Better Auth automatically manages:

- `organization` table
- `member` table (userId + organizationId + role)
- `invitation` table
- `session` table (minimal data only)

---

## Access Control Implementation

### Data Isolation ✅

**Users only see data from their organizations:**

#### Quiz Access (app/(dashboard)/quizzes/page.actions.ts)

```typescript
// Users only see quizzes from organizations they're members of
const userMemberships = await db.member.findMany({
  where: { userId: session.user.id },
});
const userOrgIds = userMemberships.map((m) => m.organizationId);

const where = {
  organizationId: { in: targetOrgIds }, // Scoped to user's orgs
};
```

#### User Management (app/(dashboard)/users/page.actions.ts)

```typescript
// Organization admins only see/manage users from their admin organizations
const userAdminOrgs = await getUserAdminOrganizations(session.user.id);

for (const orgId of targetOrgIds) {
  const members = await auth.api.listMembers({
    organizationId: orgId, // Only orgs where user is admin
  });
}
```

### Permission Checking ✅

**Dynamic API-based permission validation:**

#### Role Checking (lib/role.utils.ts)

```typescript
export const isOrgAdmin = async (userId: string, organizationId: string) => {
  return await auth.api.hasRole({
    userId,
    organizationId,
    role: "admin",
    headers: await headers(),
  });
};

export const canManageUsers = async (
  userId: string,
  organizationId: string
) => {
  return await auth.api.hasPermission({
    userId,
    organizationId,
    resource: "user",
    action: "invite",
    headers: await headers(),
  });
};
```

#### Organization Invitation (app/(dashboard)/invite/page.actions.ts)

```typescript
// Check permission before inviting
const canInviteUsers = await auth.api.hasPermission({
  userId: session.user.id,
  organizationId,
  resource: "user",
  action: "invite",
});

// Use Better Auth's invitation system
await auth.api.inviteToOrganization({
  email: email.trim(),
  organizationId,
  role,
  userId: session.user.id,
});
```

---

## UI Implementation

### Multi-Organization Support ✅

**Organization Filter (replaces organization switching):**

- Users can view data from **all** their organizations simultaneously
- Filter UI allows selecting specific organizations
- Aggregated data display across multiple organizations

#### Dashboard (app/(dashboard)/page.tsx)

```typescript
// Users select which organizations to view
const [selectedOrganizationIds, setSelectedOrganizationIds] = useState<
  string[]
>([]);

// Initialize with all user's organizations selected
useEffect(() => {
  if (organizations && organizations.length > 0) {
    setSelectedOrganizationIds(organizations.map((org) => org.id));
  }
}, [organizations]);

// Admin access based on any selected organization
const hasAdminAccess = selectedOrganizations.some(
  (org) => org.role === "admin" || org.role === "owner"
);
```

### Permission-based UI ✅

- **Admin features** only shown to organization admins
- **User management** scoped to organizations where user is admin
- **Data tables** show organization context (org names, roles)

## Security Features ✅

### Data Isolation

- ✅ Users only access their organization's data
- ✅ Organization admins only manage their organization's members
- ✅ System admins have full access
- ✅ All queries scoped by organization membership

### Role-based Access Control

- ✅ Dynamic permission checking via Better Auth APIs
- ✅ No sensitive data stored in cookies
- ✅ Server-side authorization on all actions
- ✅ UI components protected by permission guards

### Invitation Security

- ✅ Only organization admins can invite to their organizations
- ✅ Email-based invitation system with token validation
- ✅ Role assignment controlled by inviter's permissions
- ✅ Proper invitation lifecycle management

---

## Current Capabilities

### ✅ Organization Management

- Multi-organization membership support
- Role-based access within organizations (owner/admin/member)
- Organization-scoped data access
- Dynamic organization filtering in UI

### ✅ User Administration

- Organization admins can manage their organization's members
- System admins can manage all users globally
- User invitation system with role assignment
- User ban/unban functionality

### ✅ Content Management

- Quizzes scoped to organizations
- Users see content from all their organizations
- Organization context displayed in all data views
- Permission-based content creation/editing

### ✅ Quiz Response Access Control

**Granular access control for quiz responses with proper data isolation:**

#### Access Rules

- **Users can view their own quiz responses** - Direct access to personal quiz results
- **Organization admins can view member responses** - Access to responses from members in organizations they administer
- **Super admins can view all responses** - System-wide access to all quiz responses

#### Technical Implementation (app/(dashboard)/quiz-results/[id]/page.actions.ts)

```typescript
// Permission checking for viewing other users' responses
if (isViewingOtherUser) {
  const isSuperAdminUser = await isSuperAdmin();
  const canManageResponsesForOrg = await canManageResponses(currentUserId, response.quiz.organizationId);

  if (!isSuperAdminUser && !canManageResponsesForOrg) {
    return getActionResponse({ error: "Access denied: insufficient permissions to view other users' responses" });
  }
}
```

#### Permission Utility (lib/role.utils.ts)

```typescript
export const canManageResponses = async (
  userId: string,
  organizationId: string
): Promise<boolean> => {
  return await auth.api.hasPermission({
    userId,
    organizationId,
    resource: "response",
    action: "read",
    headers: await headers(),
  });
};
```

#### Frontend Permission Validation (app/(dashboard)/quiz-results/[id]/page.tsx)

```typescript
// Check if user can view other users' responses
if (isViewingOtherUser) {
  const isSuperAdminUser = isSuperAdmin(userWithMembers || null);
  const canAccessAdminUIForOrgs = canAccessAdminUI(userWithMembers || null, selectedOrganizationIds);

  if (!isSuperAdminUser && !canAccessAdminUIForOrgs) {
    // Show access denied UI
  }
}
```

#### Security Features

- ✅ Response data scoped to user's organization memberships
- ✅ Admin access limited to organizations they administer
- ✅ No cross-organization data leakage
- ✅ URL parameter validation (`userId` query parameter)
- ✅ Both server-side and client-side permission validation

### ✅ Scalable Architecture

- Standard Better Auth implementation
- Minimal cookie footprint (no 431 errors)
- Dynamic permission checking
- Database-driven role management

---

## Summary

The current implementation successfully provides:

1. **Standard Better Auth organization and admin management**
2. **Proper data isolation** - users only see their organization's data
3. **Role-based access control** - organization admins can manage their members
4. **Secure authentication** - minimal session cookies, dynamic permission checking
5. **Multi-organization support** - users can belong to and view multiple organizations
6. **Granular quiz response access** - users can view own responses, org admins can view member responses
7. **Scalable architecture** - follows Better Auth best practices

The system is production-ready and follows industry standards for multi-tenant SaaS applications with proper security and data isolation.

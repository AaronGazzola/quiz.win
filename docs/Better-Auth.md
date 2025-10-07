# Better Auth Organization & Role Management

Complete reference for implementing multi-tenant organization and role-based access control using Better Auth.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Server Configuration](#server-configuration)
3. [Client Configuration](#client-configuration)
4. [Managing Organizations](#managing-organizations)
5. [Managing Invitations](#managing-invitations)
6. [Role-Based Access Control](#role-based-access-control)
7. [Session Management](#session-management)

## Database Schema

Better Auth requires specific tables in your Prisma schema. Use the `auth` schema for Better Auth tables and `public` for your application tables.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["auth", "public"]
}

model user {
  id               String       @id @default(cuid())
  email            String       @unique
  name             String?
  role             String       @default("user")
  banned           Boolean      @default(false)
  banReason        String?
  banExpires       DateTime?
  emailVerified    Boolean?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  image            String?
  MagicLink        MagicLink[]
  account          account[]
  invitation       invitation[]
  member           member[]
  session          session[]

  @@schema("auth")
}

model session {
  id                   String   @id @default(cuid())
  userId               String
  expiresAt            DateTime
  token                String   @unique
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
  ipAddress            String?
  userAgent            String?
  impersonatedBy       String?
  activeOrganizationId String?
  user                 user     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@schema("auth")
}

model account {
  id                    String    @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  user                  user      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@schema("auth")
}

model verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
  @@schema("auth")
}

model MagicLink {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  email     String
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      user     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@schema("auth")
}

model organization {
  id         String       @id @default(cuid())
  name       String
  slug       String       @unique
  logo       String?
  metadata   Json?
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt
  invitation invitation[]
  member     member[]

  @@schema("auth")
}

model member {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  role           String       @default("member")
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  organization   organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           user         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])
  @@schema("auth")
}

model invitation {
  id             String       @id @default(cuid())
  organizationId String
  email          String
  role           String       @default("member")
  inviterId      String
  token          String?      @unique
  status         String       @default("pending")
  expiresAt      DateTime
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  user           user         @relation(fields: [inviterId], references: [id], onDelete: Cascade)
  organization   organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([email, organizationId])
  @@schema("auth")
}
```

### Key Schema Features

- **user.role**: Global user role (e.g., "user", "super-admin")
- **member.role**: Organization-specific role (e.g., "owner", "admin", "member")
- **invitation.status**: Tracks invitation state ("pending", "accepted", "declined")
- **session.activeOrganizationId**: Stores the user's currently selected organization

## Server Configuration

Configure Better Auth in `lib/auth.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, magicLink, organization } from "better-auth/plugins";
import { Resend } from "resend";

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const urlParams = new URLSearchParams(url.split("?")[1]);
        const callbackUrl = urlParams.get("callbackURL") || "";
        const invitationParam = new URLSearchParams(
          callbackUrl.split("?")[1]
        )?.get("invitation");

        let isInvitation = false;
        let invitationData = null;

        if (invitationParam) {
          try {
            invitationData = JSON.parse(decodeURIComponent(invitationParam));
            isInvitation = true;
          } catch {}
        }

        if (isInvitation && invitationData) {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || "noreply@example.com",
            to: email,
            subject: `You've been invited to join ${invitationData.organizationName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>You've been invited to join ${invitationData.organizationName}</h2>
                <p>${invitationData.inviterName} has invited you to join their organization as a <strong>${invitationData.role === "admin" ? "Organization Admin" : "Member"}</strong>.</p>
                <p>Click the link below to accept the invitation and sign in:</p>
                <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                  Accept Invitation & Sign In
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 24px;">
                  This invitation link will expire in 5 minutes. If you didn't expect this invitation, please ignore this email.
                </p>
              </div>
            `,
          });
        } else {
          await resend.emails.send({
            from: process.env.FROM_EMAIL || "noreply@example.com",
            to: email,
            subject: "Sign in to your account",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Sign in to your account</h2>
                <p>Click the link below to sign in:</p>
                <a href="${url}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                  Sign In
                </a>
                <p style="color: #666; font-size: 14px; margin-top: 24px;">
                  This link will expire in 5 minutes. If you didn't request this email, please ignore it.
                </p>
              </div>
            `,
          });
        }
      },
      expiresIn: 300,
      disableSignUp: false,
    }),
    admin(),
    organization({
      sendInvitationEmail: async (data) => {
        const { email, organization, inviter, invitation } = data;
        const invitationId = invitation.id;

        await resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@example.com",
          to: email,
          subject: `You've been invited to join ${organization.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You've been invited to join ${organization.name}</h2>
              <p>${inviter.user.name || inviter.user.email} has invited you to join their organization.</p>
              <p>Click the link below to accept the invitation and sign in:</p>
              <a href="${process.env.BETTER_AUTH_URL}/api/auth/accept-invitation?invitationId=${invitationId}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 16px 0;">
                Accept Invitation & Sign In
              </a>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">
                This invitation link will expire soon. If you didn't expect this invitation, please ignore this email.
              </p>
            </div>
          `,
        });
      },
    }),
  ],
});
```

### Key Configuration Points

- **magicLink plugin**: Handles email-based authentication with custom invitation detection
- **organization plugin**: Manages multi-tenant organization features
- **admin plugin**: Provides admin-level user management capabilities
- **sendInvitationEmail**: Customizes invitation email templates

## Client Configuration

Configure the Better Auth client in `lib/auth-client.ts`:

```typescript
import { createAuthClient } from "better-auth/client";
import {
  adminClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [magicLinkClient(), adminClient(), organizationClient()],
});

export const {
  signIn,
  useSession,
  getSession,
  signUp,
  organization,
  admin,
  signOut,
} = authClient;
```

## Managing Organizations

### Server-Side Operations

#### Create Organization

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const result = await auth.api.createOrganization({
  body: {
    name: "Acme Corp",
    slug: "acme-corp",
  },
  headers: await headers(),
});
```

#### List Organizations

```typescript
const organizations = await auth.api.listOrganizations({
  headers: await headers(),
});
```

#### Get Organization

```typescript
const organization = await auth.api.getFullOrganization({
  query: { organizationId: "org-id" },
  headers: await headers(),
});
```

#### Update Organization

```typescript
await auth.api.updateOrganization({
  body: {
    organizationId: "org-id",
    name: "New Name",
    slug: "new-slug",
  },
  headers: await headers(),
});
```

#### Delete Organization

```typescript
await auth.api.deleteOrganization({
  body: { organizationId: "org-id" },
  headers: await headers(),
});
```

### Client-Side Operations

```typescript
import { organization } from "@/lib/auth-client";

await organization.create({
  name: "Acme Corp",
  slug: "acme-corp",
});

const orgs = await organization.list();

await organization.setActive("org-id");

const activeOrg = await organization.getActive();
```

## Managing Invitations

### Server-Side: Create Invitation

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

await auth.api.createInvitation({
  body: {
    email: "[email protected]",
    organizationId: "org-id",
    role: "member",
  },
  headers: await headers(),
});
```

**Required Parameters:**
- `email`: Email address of invitee
- `role`: Organization role ("owner", "admin", "member")

**Optional Parameters:**
- `organizationId`: Defaults to active organization
- `resend`: Resend if already invited (boolean)

### Server-Side: Accept Invitation

```typescript
await auth.api.acceptInvitation({
  body: { invitationId: "invitation-id" },
  headers: await headers(),
});
```

### Server-Side: Fetch Pending Invitations

```typescript
import { getAuthenticatedClient } from "@/lib/auth.utils";

const { db } = await getAuthenticatedClient();

const invitations = await db.invitation.findMany({
  where: {
    email: session.user.email,
    status: "pending",
    expiresAt: { gt: new Date() },
  },
  include: {
    organization: true,
    user: true,
  },
});
```

### Server-Side: Decline Invitation

```typescript
const { db } = await getAuthenticatedClient();

await db.invitation.update({
  where: { id: "invitation-id" },
  data: { status: "declined" },
});
```

### Client-Side: Invite Member

```typescript
import { organization } from "@/lib/auth-client";

await organization.inviteMember({
  email: "[email protected]",
  role: "member",
  organizationId: "org-id",
});
```

### In-App Invitation Notifications

For logged-in users, display pending invitations as persistent toast notifications:

```typescript
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetPendingInvitations = () => {
  return useQuery({
    queryKey: ["pending-invitations"],
    queryFn: async () => {
      const { data, error } = await getPendingInvitationsForUserAction();
      if (error) throw new Error(error);
      return data || [];
    },
    refetchInterval: 1000 * 60 * 2,
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data, error } = await acceptInvitationAction(invitationId);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-invitations"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Successfully joined the organization!");
    },
  });
};
```

## Role-Based Access Control

### Role Hierarchy

1. **Global Roles** (user.role):
   - `super-admin`: Full system access
   - `user`: Standard user
   - `banned`: Restricted access

2. **Organization Roles** (member.role):
   - `owner`: Full organization control
   - `admin`: Manage members and settings
   - `member`: Basic access

### Server-Side Role Checks

```typescript
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { headers } from "next/headers";

export const checkUserAccess = async (organizationId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { hasAccess: false, role: null };
  }

  const isSuperAdmin = session.user.role === "super-admin";

  const { db } = await getAuthenticatedClient();

  const membership = await db.member.findUnique({
    where: {
      userId_organizationId: {
        userId: session.user.id,
        organizationId,
      },
    },
  });

  const isAdmin = membership?.role === "admin" || membership?.role === "owner";

  return {
    hasAccess: isSuperAdmin || !!membership,
    isAdmin: isSuperAdmin || isAdmin,
    isOwner: membership?.role === "owner",
    role: membership?.role,
  };
};
```

### Client-Side Role Checks

```typescript
import { useGetUserMembers } from "@/app/layout.hooks";

export const useAdminAccess = () => {
  const { data: userWithMembers } = useGetUserMembers();

  const hasAdminRole = userWithMembers?.member?.some(
    (m) => m.role === "admin" || m.role === "owner"
  );

  const isSuperAdmin = userWithMembers?.role === "super-admin";

  return hasAdminRole || isSuperAdmin;
};
```

## Session Management

### Get Current Session

```typescript
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});

const user = session?.user;
const activeOrgId = session?.activeOrganizationId;
```

### Set Active Organization

```typescript
import { organization } from "@/lib/auth-client";

await organization.setActive("org-id");
```

### Get Active Organization

```typescript
const activeOrg = await organization.getActive();
```

### Client-Side Session Hook

```typescript
import { useSession } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session, isPending } = useSession();

  if (isPending) return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <div>Welcome, {session.user.name}</div>;
}
```

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@host:5432/database"
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@example.com"
```

## Common Patterns

### Protect Server Actions

```typescript
export const protectedAction = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const { hasAccess, isAdmin } = await checkUserAccess(organizationId);

  if (!isAdmin) {
    return { error: "Access denied" };
  }
};
```

### Fetch User with Memberships

```typescript
const { db } = await getAuthenticatedClient();

const userWithMembers = await db.user.findUnique({
  where: { id: session.user.id },
  include: {
    member: {
      include: {
        organization: true,
      },
    },
  },
});
```

### Filter Data by Organization

```typescript
const userOrgIds = userWithMembers.member.map((m) => m.organizationId);

const data = await db.resource.findMany({
  where: {
    organizationId: { in: userOrgIds },
  },
});
```

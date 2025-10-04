# Authentication Redirection

## Overview

This application implements authentication redirection using the **Data Access Layer (DAL) pattern** with server-side session verification. This approach follows 2025 Next.js best practices and avoids middleware for authentication due to security vulnerabilities (CVE-2025-29927).

## Architecture

### Core Components

1. **Session Verification Utility** (`lib/session.utils.ts`)
2. **Server Component Pages** (all private routes)
3. **Client Components** (UI logic only, no auth)

## How It Works

### 1. Session Verification Layer

**File:** `lib/session.utils.ts`

```typescript
import { cache } from 'react'
import { auth } from './auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { configuration } from '@/configuration'

export const verifySession = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect(configuration.paths.signIn)
  }

  return { user: session.user, session }
})
```

**Key Features:**
- Uses React `cache()` to prevent duplicate session queries within the same request
- Checks session validity via `auth.api.getSession()`
- Automatically redirects unauthenticated users to sign-in page
- Returns session data for authenticated users

### 2. Protected Page Pattern

All private pages follow this server component pattern:

**Example:** `app/(dashboard)/page.tsx`

```typescript
import { verifySession } from "@/lib/session.utils";
import { DashboardPageContent } from "./page.content";

export default async function DashboardPage() {
  await verifySession();

  return <DashboardPageContent />;
}
```

**Flow:**
1. Server component executes `verifySession()` before rendering
2. If unauthenticated → immediate redirect to `/sign-in`
3. If authenticated → renders client component with UI logic

### 3. Protected Routes

The following routes are protected with server-side authentication:

- `/` (dashboard home)
- `/users` (user management)
- `/invite` (invite users)
- `/take-quiz/[id]` (quiz taking)
- `/[id]` (quiz results)

**Configuration:** `configuration.ts`

```typescript
export const privatePaths = [
  "/",
  "/quizzes",
  "/users",
  "/invite",
  "/take-quiz",
];
```

## Authentication Flow

### Accessing Protected Route

```
User requests /dashboard
    ↓
Server Component renders
    ↓
verifySession() executes
    ↓
┌─────────────────────────┐
│ Check session validity  │
└─────────────────────────┘
    ↓
    ├─ No session? → redirect('/sign-in')
    │
    ├─ Valid session? → Return session data
                        ↓
                   Render page content
```

### Client Component Data Fetching

Client components use `useGetUser()` hook for reactive user data:

**File:** `app/layout.hooks.ts`

```typescript
export const useGetUser = () => {
  const { setUser, reset } = useAppStore();
  const { reset: resetAuthLayout } = useAuthLayoutStore();
  const { setUserData } = useRedirectStore();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await getUserAction();
      if (error) {
        reset();
        resetAuthLayout();
        throw error;
      }
      setUser(data ?? null);
      setUserData(data ?? null);
      return data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
```

**Note:** Client hooks do NOT redirect - redirection is handled server-side only.

## Benefits

### Security
- ✅ **No middleware vulnerabilities** (CVE-2025-29927 compliant)
- ✅ **Server-side verification** before any client code executes
- ✅ **Proximity principle** - auth checks close to data access

### Performance
- ✅ **Cached session queries** via React `cache()` - single DB lookup per request
- ✅ **No client-side redirect flash** - users never see protected content
- ✅ **Parallel data fetching** possible in server components

### Developer Experience
- ✅ **Centralized auth logic** in `verifySession()`
- ✅ **Simple page protection** - one line: `await verifySession()`
- ✅ **Type-safe** session data throughout the app

## Migration from Client-Side Redirect

### Old Pattern (Removed)
```typescript
// ❌ Client-side redirect (caused flash, security issues)
export const useGetUser = () => {
  const pathname = usePathname();
  const router = useRouter();

  return useQuery({
    queryFn: async () => {
      const { data, error } = await getUserAction();
      if (error) {
        if (privatePaths.includes(pathname)) {
          router.push('/sign-in'); // ❌ Client-side redirect
        }
        throw error;
      }
      return data;
    },
  });
};
```

### New Pattern (Current)
```typescript
// ✅ Server-side verification (no flash, secure)
export default async function ProtectedPage() {
  await verifySession(); // ✅ Blocks before render

  return <PageContent />;
}
```

## Error Handling

### Session Expired
When a session expires mid-use:
1. Server actions return error
2. Client hooks handle error state
3. User sees error message
4. Next navigation attempt triggers `verifySession()` → redirect to sign-in

### Network Errors
- React Query handles retry logic
- Error boundaries catch rendering errors
- Toast notifications inform users

## Testing

Protected routes can be tested by:
1. Accessing route without authentication → should redirect to `/sign-in`
2. Accessing route with valid session → should render page
3. Session expiry during use → next navigation redirects

## Related Files

- `lib/session.utils.ts` - Session verification utility
- `lib/auth.ts` - Better Auth configuration
- `lib/auth-client.ts` - Client-side auth methods
- `app/layout.hooks.ts` - Client hooks for user data
- `app/layout.actions.ts` - Server actions for user data
- `configuration.ts` - Path and role configuration

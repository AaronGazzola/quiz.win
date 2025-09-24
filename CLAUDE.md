# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### Core Technologies

- **Next.js 15** with App Router architecture
- **TypeScript** for type safety
- **React 19** with modern patterns
- **TailwindCSS v4** for styling
- **PostgreSQL** database with Prisma ORM
- **Better Auth** for authentication system

# General rules:

- Don't include any comments in any files.
- Import "cn" from "@/lib/shadcn.utils" to concatinate classes.
- All console.logs should be stringified and minified.

# File Organization and Naming Conventions

- Types and store files alongside anscenstor files
- Actions and hooks files alongside descendent files

```txt
app/
├── layout.tsx
├── layout.providers.tsx
├── layout.types.ts
├── layout.stores.ts ◄─── useAppStore
└── (dashboard)/
    ├── layout.tsx
    ├── layout.skeleton.tsx
    ├── layout.types.tsx
    ├── layout.stores.tsx ◄─── useDashboardStore
    ├── page.tsx              ─┐
    ├── page.hooks.tsx         ├────► useAppStore
    ├── Component.tsx          ├────► useDashboardStore
    ├── Component.hooks.tsx   ─┘
    ├── page.actions.ts
    └── Component.actions.ts
```

# Hook, action, store and type patterns

- Better-auth client methods are called directly in the react-query hooks.
- Prisma client queries are called in actions via getAuthenticatedClient.
- Actions are called via react-query hooks.
- Data returned in the onSuccess function of react-query hooks is used to update the corresponding zustand store.
- Loading and error state is managed via the react-query hooks, NOT the zustand store.
- All db types should be defined from `"@prisma/client"`

## Types file example:

```typescript
import { User } from "@prisma/client";

export interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  tempEmail?: string;
  setTempEmail: (tempEmail: string) => void;
  reset: () => void;
}

export interface SignInData {
  email: string;
  password: string;
}
```

## Stores file example:

```typescript
import { UserRole } from "@prisma/client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppState, ExtendedUser, RedirectState } from "./layout.types";

const initialState = {
  user: null,
};

export const useAppStore = create<AppState>()((set) => ({
  ...initialState,
  setUser: (user) => set({ user, profile: user?.profile || null }),
  reset: () => set(initialState),
}));
```

## Actions file example:

```typescript
"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getAuthenticatedClient } from "@/lib/auth.utils";
import { User } from "@prisma/client";
import { headers } from "next/headers";

export const getUserAction = async (): Promise<ActionResponse<User | null>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return getActionResponse();

    const { db } = await getAuthenticatedClient();

    const prismaUser = await db.user.findUnique({
      where: { id: session.user.id },
    });

    return getActionResponse({ data: prismaUser });
  } catch (error) {
    return getActionResponse({ error });
  }
};
```

# Hooks file example

```typescript
"use client";

import { configuration, privatePaths } from "@/configuration";
import { signIn } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Toast } from "../(components)/Toast";
import { CypressDataAttributes } from "../../types/cypress.types";
import { useAppStore, useRedirectStore } from "../layout.stores";
import { SignInData } from "../layout.types";
import { getUserAction } from "./layout.actions";
import { useAuthLayoutStore } from "./layout.stores";

export const useGetUser = () => {
  const { setUser, reset } = useAppStore();
  const { reset: resetAuthLayout } = useAuthLayoutStore();
  const { setUserData } = useRedirectStore();
  const pathname = usePathname();

  const router = useRouter();
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await getUserAction();
      if (!data || error) {
        if (privatePaths.includes(pathname)) {
          router.push(configuration.paths.signIn);
        }
        reset();
        resetAuthLayout();
      }
      if (error) throw error;
      setUser(data ?? null);

      setUserData(data);

      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSignIn = () => {
  const { setUser, setTempEmail } = useAppStore();
  const { setUserData } = useRedirectStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (signInData: SignInData) => {
      const { error } = await signIn.email({
        email: signInData.email,
        password: signInData.password,
      });

      if (error?.status === 403) setTempEmail(signInData.email);

      if (error) throw error;
      const { data: userData, error: userError } = await getUserAction();

      if (userError) throw new Error(userError);

      return userData;
    },
    onSuccess: (data) => {
      if (data) {
        setUser(data);
        setUserData(data);
      }
      toast.custom(() => (
        <Toast
          variant="success"
          title="Success"
          message="Successfully signed in"
          data-cy={CypressDataAttributes.TOAST_SUCCESS}
        />
      ));
      if (data && !data.profile?.isOnboardingComplete) {
        router.push(configuration.paths.onboarding);
        return;
      }
      router.push(configuration.paths.home);
    },
    onError: (
      error: {
        code?: string | undefined;
        message?: string | undefined;
        status: number;
        statusText: string;
      } | null
    ) => {
      if (error?.status === 403) return;
      toast.custom(() => (
        <Toast
          variant="error"
          title="Sign In Failed"
          message={error?.message || "Failed to sign in"}
          data-cy={CypressDataAttributes.TOAST_ERROR}
        />
      ));
    },
  });
};
```

# Testing

All tests should be performed with Jest or Playwright and documented in the `Test.md` document

## Test.md

The test document should list all tests in the repo, with each test case listed in a single line with an indented line below with the pass condition.
Test document should begin with an index and number each test as demonstrated below:

# Test.md file example:

```md
# Test Documentation

## Run All Tests

**Command:** `npm run test`
✓ Runs the complete test suite across all test files

## Test Index

1. [Name](#1-name-tests) - `npm run test:name`

## 1. Name Tests

**File:** `__tests__/name.test.ts`
**Command:** `npm run test:name`

### Name Test

- should do something
  ✓ Validates expected results

- should do something else
  ✓ Validates expected results
```

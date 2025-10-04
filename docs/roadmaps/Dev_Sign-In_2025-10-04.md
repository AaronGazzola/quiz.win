# Dev Sign-In System Complete Implementation Roadmap

Complete implementation of a development sign-in system with password-based authentication and user selection interface. This roadmap covers database schema updates, seed data generation with themed organizations (healthcare and corporate), and a modern UX with password verification and user card selection.

## 🎯 Current Status (Updated: 2025-10-04)

### ✅ COMPLETED PHASES

- **Phase 1: Database Schema & Environment Setup** - Password table and environment variables configured
- **Phase 2: Seed Script Enhancement** - Themed organizations, password hashing, and user data complete
- **Phase 3: Backend Actions & API** - Password verification and user retrieval actions created

### 🔄 IN PROGRESS

- **Phase 4: Sign-In Page UX** - Implement modern password input and user card selection interface

### ⏳ REMAINING WORK

- **Phase 5: Production Build Validation** - Ensure zero errors and warnings

### 🚀 READY TO USE

Current features remain available:
- Magic link authentication
- Existing user management
- Organization and quiz functionality

### 📍 NEXT STEPS

1. Create types definition file (page.types.ts)
2. Create React Query hooks file (page.hooks.ts)
3. Implement password input component in page.tsx
4. Implement user cards display with organization grouping

## Prerequisites

- ✅ PostgreSQL database configured
- ✅ Better Auth setup complete
- ✅ Next.js 15 with App Router
- ✅ Shadcn component library
- ✅ TailwindCSS v4
- ✅ React Query configured

## ✅ Phase 1: Database Schema & Environment Setup

Add Password table to public schema and configure environment variables for development password.

### ✅ 1.1 Database Schema Update (`prisma/schema.prisma`)

Added Password table to store hashed development password:

- ✅ Added Password model in public schema
- ✅ Included length field (Int) to store unhashed password length
- ✅ Included hash field (String) to store hashed password
- ✅ Added createdAt and updatedAt timestamp fields
- ✅ Used @@schema("public") directive

**Key Fields:**
- `id` - String @id @default(cuid())
- `length` - Int
- `hash` - String
- `createdAt` - DateTime @default(now())
- `updatedAt` - DateTime @updatedAt

### ✅ 1.2 Environment Variables (`.env.example`)

Added development password environment variables:

- ✅ Added DEV_PASSWORD for server-side password hashing
- ✅ Added NEXT_PUBLIC_DEV_PASSWORD for client-side password pre-fill (optional)
- ✅ Updated .env.example with placeholder values

### ✅ 1.3 Database Migration

Generated Prisma client with current schema:

- ✅ Ran `npx prisma generate`
- ✅ Password table exists in public schema
- ✅ Schema synchronized with database

## ✅ Phase 2: Seed Script Enhancement

Updated seed script to create themed organizations (healthcare and corporate) with realistic data and password hashing.

### ✅ 2.1 Update Organization Data (`scripts/seed.ts`)

Replaced existing organizations with healthcare and corporate themed data:

- ✅ Created "HealthCare Partners" organization with healthcare theme
- ✅ Created "TechCorp Solutions" organization with corporate theme
- ✅ Updated organization metadata to reflect themes
- ✅ Updated quiz content to align with organization themes
- ✅ Ensured proper slug generation for both organizations

**Organizations:**
- HealthCare Partners: Medical training, patient care, compliance
- TechCorp Solutions: Technology training, software development, security

### ✅ 2.2 Enhanced User Data with Avatars (`scripts/seed.ts`)

Updated user creation with realistic names, roles, and avatar images:

- ✅ Added healthcare-themed names for HealthCare Partners users (Dr. Sarah Chen, Dr. James Wilson, Emily Davis RN, Michael Brown)
- ✅ Added corporate-themed names for TechCorp Solutions users (John Smith, Lisa Anderson, David Martinez, Jennifer Taylor)
- ✅ Added super-admin user (System Administrator, not affiliated with any organization)
- ✅ Added user.image field with Dicebear avatar URLs
- ✅ Assigned appropriate roles: super-admin, owner, admin, member
- ✅ Distributed users across both organizations

**User Distribution:**
- 1 super-admin (system-wide)
- 4 users per organization (owner, admin, 2 members)
- Each user has name and avatar image

### ✅ 2.3 Password Hashing Implementation (`scripts/seed.ts`)

Implemented DEV_PASSWORD hashing and storage:

- ✅ Used better-auth password hashing via signup endpoint
- ✅ Hashed DEV_PASSWORD environment variable
- ✅ Deleted all existing rows in Password table during cleanup
- ✅ Created single Password row with hashed password and length
- ✅ Stored original password length in length field
- ✅ Handled missing DEV_PASSWORD with error message

**Key Methods:**
- Used better-auth's password hashing
- Calculated password length before hashing
- Ensured single Password row exists

### ✅ 2.4 User Password Assignment (`scripts/seed.ts`)

Set DEV_PASSWORD for all seeded users:

- ✅ Updated user creation to use DEV_PASSWORD for all users
- ✅ Ensured consistent password across all development users
- ✅ Password properly hashed in Account table via better-auth

### ✅ 2.5 Healthcare-Themed Quiz Content (`scripts/seed.ts`)

Updated quiz content for HealthCare Partners organization:

- ✅ Created quizzes about patient care, medical procedures, compliance
- ✅ Updated questions to reflect healthcare scenarios
- ✅ Ensured realistic healthcare training content

**Implemented Quizzes:**
- Patient Safety Protocols (4 questions)
- HIPAA Compliance Fundamentals (3 questions)
- Medical Terminology Basics (3 questions)

### ✅ 2.6 Corporate-Themed Quiz Content (`scripts/seed.ts`)

Updated quiz content for TechCorp Solutions organization:

- ✅ Created quizzes about software development, project management, technology
- ✅ Updated questions to reflect corporate training scenarios
- ✅ Ensured realistic corporate training content

**Implemented Quizzes:**
- Cybersecurity Best Practices (4 questions)
- Agile Project Management (3 questions)
- Software Development Lifecycle (3 questions)

## ✅ Phase 3: Backend Actions & API

Created server actions for password verification and user retrieval.

### ✅ 3.1 Password Length Action (`app/(auth)/sign-in/page.actions.ts`)

Created action to fetch stored password length:

- ✅ Implemented getPasswordLengthAction server action
- ✅ Queries Password table for length field
- ✅ Returns ActionResponse with password length
- ✅ Handles case where Password table is empty
- ✅ Uses getActionResponse utility from @/lib/action.utils

**Key Methods:**
- `getPasswordLengthAction()` - Returns password length or error

### ✅ 3.2 Password Verification Action (`app/(auth)/sign-in/page.actions.ts`)

Created action to verify password against stored hash:

- ✅ Implemented verifyPasswordAction server action
- ✅ Accepts password string parameter
- ✅ Queries Password table for hash field
- ✅ Compares provided password with stored hash using bcrypt
- ✅ Returns ActionResponse with boolean success indicator
- ✅ Handles errors appropriately

**Key Methods:**
- `verifyPasswordAction(password: string)` - Returns boolean verification result

### ✅ 3.3 Users Retrieval Action (`app/(auth)/sign-in/page.actions.ts`)

Created action to fetch all users with organization data:

- ✅ Implemented getUsersWithOrganizationsAction server action
- ✅ Queries all users with their organization memberships
- ✅ Includes user.image, user.name, user.email, user.role
- ✅ Includes organization.name for grouping
- ✅ Returns users with organization data
- ✅ Handles super-admin user separately (no organization)

**Key Methods:**
- `getUsersWithOrganizationsAction()` - Returns users with organization data

## ⏳ Phase 4: Sign-In Page UX

Implement modern password input and user card selection interface with animations and loading states.

### ⏳ 4.1 Types Definition (`app/(auth)/sign-in/page.types.ts`)

Define TypeScript types for sign-in page:

- UserWithOrganization interface extending User from @prisma/client
- PasswordVerificationState type for UI states
- SignInFormState interface for component state
- Organization grouping types

### ⏳ 4.2 React Query Hooks (`app/(auth)/sign-in/page.hooks.ts`)

Create custom hooks for data fetching and mutations:

- useGetPasswordLength hook using useQuery
- useVerifyPassword hook using useMutation
- useGetUsers hook using useQuery (triggered after password verification)
- useSignInWithPassword hook using useMutation
- Handle loading, error, and success states
- Show toast notifications for errors and success
- Follow patterns from @docs/util.md

**Key Hooks:**
- `useGetPasswordLength()` - Fetches password length on mount
- `useVerifyPassword()` - Verifies password, triggers on length match
- `useGetUsers()` - Fetches users after password verified
- `useSignInWithPassword()` - Signs in selected user with password

### ⏳ 4.3 Password Input Component (`app/(auth)/sign-in/page.tsx`)

Create sleek password input with auto-verification:

- Remove existing sign-in UX completely
- Add single Shadcn Card component
- Add password input field (sleek, modern styling)
- Fetch password length on component mount
- Pre-fill password if NEXT_PUBLIC_DEV_PASSWORD is defined
- Watch password input length
- Trigger verification mutation when length matches stored length
- Show loading spinner on right side during verification
- Show X icon on verification failure, then fade out and clear input
- Show checkmark icon on verification success
- Disable and gray out input on success
- Use TailwindCSS v4 for styling
- Implement smooth animations for icon transitions

**Key Features:**
- Auto-trigger verification on length match
- Visual feedback with icons (spinner, X, checkmark)
- Input clearing on failure
- Disabled state on success

### ⏳ 4.4 User Cards Display (`app/(auth)/sign-in/page.tsx`)

Create user selection cards with organization grouping:

- Expand card to reveal user cards after password verification
- Group users by organization
- Display super-admin user separately at top
- Each user card is thin rectangle with:
  - Avatar image circle on left (from user.image)
  - User name in large font above horizontal line
  - User email in smaller font below horizontal line
- Make each card clickable button
- Implement responsive layout:
  - Large screens: columns for each organization, super-admin centered above
  - Small screens: vertical stack, super-admin on top
- Use TailwindCSS v4 for layout and styling
- Smooth expansion animation when cards appear

**Card Layout:**
- Avatar (left) | Name (above line) / Email (below line)
- Grouped by organization with headers
- Responsive grid/stack layout

### ⏳ 4.5 User Card Click Handler (`app/(auth)/sign-in/page.tsx`)

Implement sign-in on user card click:

- Replace avatar with loading spinner on click
- Trigger signIn mutation with user email and stored password
- Use signIn.email from @lib/auth-client.ts
- Show success toast on successful sign-in
- Show error toast on sign-in failure
- Redirect to home page on success
- Follow toast pattern from @docs/util.md

**Key Flow:**
1. User clicks card
2. Avatar → loading spinner
3. Call signIn.email({ email, password })
4. Show toast (success/error)
5. Redirect to home on success

### ⏳ 4.6 Organization Grouping UI (`app/(auth)/sign-in/page.tsx`)

Display organization headers and groupings:

- Show organization name above each group of user cards
- Style organization headers distinctly
- Separate super-admin section from organization sections
- Use consistent spacing and padding
- Implement with TailwindCSS v4

### ⏳ 4.7 Animations & Transitions (`app/(auth)/sign-in/page.tsx`)

Add smooth animations throughout:

- Card expansion animation when password verified
- Icon transitions (spinner → X/checkmark)
- Fade out effect for X icon
- Avatar to spinner transition on card click
- Use CSS transitions and TailwindCSS v4 animation utilities
- Ensure smooth, modern feel

## ⏳ Phase 5: Production Build Validation

Ensure production-ready code with zero errors and warnings.

### ⏳ 5.1 Initial Build

Run production build:

- Execute `npm run build`
- Document all errors and warnings
- Create plan to address issues

### ⏳ 5.2 Fix Build Errors

Resolve all build errors:

- Fix TypeScript errors
- Fix import/export issues
- Fix missing dependencies
- Fix configuration issues
- Run build after each fix

### ⏳ 5.3 Fix Build Warnings

Resolve all build warnings:

- Fix unused variables
- Fix missing dependencies in useEffect
- Fix key prop warnings
- Fix accessibility warnings
- Run build after each fix

### ⏳ 5.4 Final Build Verification

Confirm zero errors and warnings:

- Run `npm run build`
- Verify clean build output
- Confirm production readiness
- Document successful build

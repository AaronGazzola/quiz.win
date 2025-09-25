# Learning Management System Prototype Roadmap

Quiz-focused LMS platform with Better Auth organization management, magic link authentication, and role-based access control.

## 🎯 Current Status (Updated: 2025-09-25)

### ✅ COMPLETED PHASES

- **Initial Setup**: Project scaffolding and core dependencies configured ✨ COMPLETE
- **Phase 1: Authentication Foundation** - Better Auth setup with magic link, admin, and organization plugins ✨ COMPLETE
- **Phase 2: User Management & Onboarding** - Magic link auth, profile onboarding, and role-based access ✨ COMPLETE
- **Phase 3: Dashboard & Quiz Management** - Advanced data table and organization management ✨ COMPLETE

### ⏳ REMAINING WORK

- **Phase 4: Learning Experience** - Quiz taking interface with response tracking

### 🚀 READY TO USE

**Phase 1, 2 & 3 Complete - Full Quiz Management Platform:**

**Authentication & User Management:**
- Better Auth server with magic link, admin, and organization plugins
- Dual schema PostgreSQL database (auth/public schemas)
- Complete database models for authentication and LMS
- Super admin assignment script (`npm run admin <email>`)
- Magic link authentication with email-only sign-in
- Profile onboarding flow with user preferences
- Role-based access control (user/admin/super-admin)
- User session management and sign-out functionality

**Dashboard & Quiz Management:**
- Comprehensive role-based dashboard with organization switching
- Advanced quiz data table with search, sorting, and pagination (see @docs/Table_Prompt.md)
- Full quiz CRUD operations with dialog-based editing
- Organization member management with role assignment
- User invitation system with bulk email invites
- Real-time quiz statistics and overview cards
- Multi-select bulk operations for quiz management
- Organization-scoped data access and permissions

**Development Environment:**
- Next.js 15 application with App Router and React 19
- TypeScript for comprehensive type safety
- TailwindCSS v4 styling framework with responsive design
- Shadcn component library utilities
- Zustand for state management
- React Query for server state management
- Toast notifications with Sonner
- Development database and migrations ready

### 📍 NEXT STEPS

**Phase 4: Learning Experience** - Quiz taking interface with response tracking and data collection

## Prerequisites

- ✅ Next.js 15 with App Router architecture
- ✅ TypeScript for comprehensive type safety
- ✅ TailwindCSS v4 for responsive styling
- ✅ Shadcn component library
- ✅ PostgreSQL database setup
- ✅ Prisma ORM for database management
- ✅ Better Auth for authentication system
- ✅ Resend for email delivery

## Phase 1: Authentication Foundation ✅ COMPLETE

Better Auth setup with magic link authentication and organization management.

### 1.1 Better Auth Configuration (`lib/auth.ts`) - ✅ COMPLETE

Better Auth server setup with plugins:

- Magic link authentication (no passwords)
- Admin plugin for super admin role management
- Organization plugin for multi-organization membership
- Resend integration for email delivery
- Dual schema configuration (auth/public)

**Key Plugins Required:**
- `magicLink({ sendMagicLink: resendHandler })` - Passwordless authentication
- `admin({ defaultRole: "user" })` - Role management system
- `organization({ allowUserToCreateOrganization: false })` - Multi-org support

### 1.2 Database Schema (`prisma/schema.prisma`) - ✅ COMPLETE

Dual schema configuration with Better Auth and LMS models:

**Auth Schema (Better Auth tables):**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          String    @default("user") // admin plugin
  banned        Boolean   @default(false)  // admin plugin
  banReason     String?   // admin plugin
  banExpires    DateTime? // admin plugin
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  @@schema("auth")
}

model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  logo      String?
  metadata  Json?
  createdAt DateTime @default(now())
  @@schema("auth")
}

model Member {
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           String   @default("member") // owner, admin, member
  createdAt      DateTime @default(now())
  @@schema("auth")
}
```

**Public Schema (LMS models):**
```prisma
model Profile {
  id                    String  @id @default(cuid())
  userId                String  @unique // Links to auth.User
  isOnboardingComplete  Boolean @default(false)
  preferences           Json?
  createdAt            DateTime @default(now())
  @@schema("public")
}

model Quiz {
  id             String       @id @default(cuid())
  title          String
  description    String?
  organizationId String
  questions      Question[]
  responses      Response[]
  createdAt      DateTime     @default(now())
  @@schema("public")
}

model Question {
  id            String   @id @default(cuid())
  quizId        String
  question      String
  options       String[] // JSON array for multiple choice
  correctAnswer String
  order         Int
  @@schema("public")
}

model Response {
  id          String   @id @default(cuid())
  quizId      String
  userId      String
  answers     Json     // User's answers with timestamps
  score       Float?
  completedAt DateTime @default(now())
  @@schema("public")
}

model Invitation {
  id             String   @id @default(cuid())
  email          String
  organizationId String
  invitedBy      String   // User ID of inviter
  status         String   @default("pending") // pending, accepted, declined
  createdAt      DateTime @default(now())
  expiresAt      DateTime
  @@schema("public")
}
```

### 1.3 Super Admin Script (`scripts/assign-admin.ts`) - ✅ COMPLETE

TypeScript script for super admin assignment:

- Command: `npm run admin [email]`
- Updates user role to "super-admin" in auth schema
- Validates email exists before assignment
- Error handling and confirmation messages

**Key Features Required:**
- Email validation and user lookup
- Role assignment via Prisma client
- Command line argument parsing
- Success/error feedback

### 1.4 Client Configuration (`lib/auth-client.ts`) - ✅ COMPLETE

Better Auth client setup with plugins:

- Magic link client plugin configuration
- Organization client plugin for org switching
- TypeScript interfaces for auth state
- Action hooks for authentication flows

**Key Methods Required:**
- `signIn.magicLink({ email, callbackURL })` - Magic link authentication
- `organization.listUserOrganizations()` - Multi-org support
- `getSession()` - Session state management

## Phase 2: User Management & Onboarding ✅ COMPLETE

Magic link authentication, profile onboarding, and role-based access control system.

### 2.1 Magic Link Authentication (`app/(auth)/` routes) - ✅ COMPLETE

Passwordless authentication flow:

- Sign-in page with email input only
- Magic link email delivery via Resend
- Email verification and session creation
- Redirect logic based on onboarding status

**Key Components Implemented:**
- ✅ `SignInPage` - Email input with magic link request
- ✅ Magic link email delivery via Better Auth + Resend
- ✅ Session management and automatic redirects
- ✅ Callback URL handling for proper navigation

### 2.2 Organization Management (`app/dashboard/admin/` routes) - ✅ COMPLETE

Role-based organization and user management:

- Super admins can create organizations and assign all user roles
- Organization admins can assign roles within their organizations
- Users can be members of multiple organizations
- Organization type indicators (healthcare vs corporate)

**Key Features Implemented:**
- ✅ Admin area with role-based access control
- ✅ Super admin vs admin role distinction and UI
- ✅ Organization management interface structure
- ✅ Role-based navigation and access restrictions
- 📋 Organization CRUD operations (ready for Phase 3)

### 2.3 Profile Onboarding (`app/onboarding/` routes) - ✅ COMPLETE

Simple onboarding flow for new users:

- Profile completion after first magic link sign-in
- Organization selection (if user belongs to multiple)
- Basic user preferences setup
- Invitation acceptance dialog for pending invites
- Redirect to dashboard after completion

**Key Components Implemented:**
- ✅ `OnboardingPage` - Complete profile setup interface
- ✅ User preferences configuration (notifications, theme)
- ✅ Profile creation via server actions with Prisma
- ✅ Onboarding completion status tracking
- ✅ Automatic dashboard redirect after completion
- 📋 Organization selection (ready for Phase 3 multi-org support)

## Phase 3: Dashboard & Quiz Management ✅ COMPLETE

Comprehensive dashboard with advanced data table for quiz management and organization administration.

### 3.1 Comprehensive Dashboard UX (`app/dashboard/page.tsx`) - ✅ COMPLETE

Role-based dashboard with organization management:

- ✅ Shadcn card elements displaying quiz statistics per user role
- ✅ Organization context switching for multi-org users via dropdown
- ✅ Quick action buttons for common tasks
- ✅ Role-based content visibility (admin vs member views)
- ✅ Real-time quiz metrics and activity overview

**Key Components Implemented:**
- ✅ `OrganizationSwitcher` - Multi-org context selection dropdown
- ✅ `QuizOverview` - Summary cards with quiz statistics and recent activity
- ✅ `MembersTable` - Organization member management (admin only)
- ✅ `InviteUsersCard` - Bulk user invitation system (admin only)

### 3.2 Advanced Data Table (`app/dashboard/quizzes/page.tsx`) - ✅ COMPLETE

Full implementation following `@docs/Table_Prompt.md` specifications:

- ✅ Quiz listing with organization filter and advanced search (title/description)
- ✅ Sortable columns (title, created date, question count, responses) with three-state indicators
- ✅ Multi-select operations with bulk delete functionality
- ✅ Dynamic pagination based on viewport height with ResizeObserver
- ✅ Organization-scoped data access with role-based permissions
- ✅ Loading states with skeleton animations and error handling

**Advanced Features Implemented:**
- ✅ Debounced search with immediate UI feedback
- ✅ Viewport-based pagination calculation (ROW_HEIGHT = 60px)
- ✅ Multi-select with Set-based selection tracking
- ✅ Bulk operations popover with loading states
- ✅ Organization context switching integration
- ✅ Role-based row actions (edit/delete for admins)

### 3.3 Quiz CRUD Interface (`app/dashboard/quizzes/QuizDialog.tsx`) - ✅ COMPLETE

Full quiz management with question creation:

- ✅ Quiz creation/editing via Radix UI dialog with form validation
- ✅ Question management within quiz dialog (add, edit, delete questions)
- ✅ Multiple choice question format with dynamic option management (2-6 options)
- ✅ Correct answer selection with visual confirmation
- ✅ Organization-scoped quiz ownership and access control

**Key Components Implemented:**
- ✅ `QuizDialog` - Modal for quiz creation and editing with validation
- ✅ Dynamic question management with order tracking
- ✅ Multiple choice editor with add/remove option functionality
- ✅ Form state management with proper error handling

### 3.4 Member Management Interface (`app/dashboard/components/`) - ✅ COMPLETE

Complete organization member administration:

- ✅ Organization members data table with real-time role assignment (see @docs/Table_Prompt.md for table patterns)
- ✅ In-line role editor with dropdown selection (member/admin/owner)
- ✅ Member removal functionality with confirmation dialogs
- ✅ Role-based permissions (admin/super-admin only access)

**Key Components Implemented:**
- ✅ `MembersTable` - Data table showing organization members with role management
- ✅ In-line role editing with instant updates via React Query
- ✅ Member removal with optimistic UI updates
- ✅ Role visualization with icons and color coding

### 3.5 User Invitation System (`app/dashboard/components/InviteUsersCard.tsx`) - ✅ COMPLETE

Comprehensive invitation workflow:

- ✅ Bulk email invitation via comma/line-separated input
- ✅ Role assignment for invited users (member/admin)
- ✅ Pending invitation tracking with expiration dates
- ✅ Smart duplicate handling (existing users/members/pending invites)
- ✅ Invitation revocation functionality

**Key Features Implemented:**
- ✅ Bulk email processing with validation and feedback
- ✅ Pending invitations display with revocation options
- ✅ Expiration date tracking (7-day default)
- ✅ Real-time invitation status updates
- ✅ Comprehensive error handling and user feedback

## Phase 4: Learning Experience

Quiz taking interface with response tracking and data collection.

### 4.1 Quiz Taking Interface (`app/dashboard/take-quiz/[id]/page.tsx`) - PENDING

Simple quiz player for organization members:

- Question navigation (next/previous/skip)
- Multiple choice answer selection
- Progress tracking during quiz
- Quiz completion and scoring

**Key Components Required:**
- `QuizPlayer` - Main quiz taking interface
- `QuestionDisplay` - Individual question rendering
- `AnswerSelector` - Multiple choice selection
- `ProgressTracker` - Visual progress indicator

### 4.2 Response Tracking (`app/dashboard/take-quiz/` actions) - PENDING

Data collection and storage system:

- Quiz response storage with user identification
- Timestamp tracking for all interactions
- Score calculation and completion status
- Progress analytics per user/organization

**Key Features Required:**
- Real-time response saving via server actions
- Timestamp tracking for each answer
- Score calculation and storage
- Completion status management

### 4.3 Response Analytics Tables - PENDING

Response and progress data tables for administrators (implement using @docs/Table_Prompt.md patterns):

- Quiz response data table with filtering and export capabilities
- User progress tracking table with completion status
- Organization-wide analytics dashboard with data tables
- Individual user performance history tables

**Key Components Required:**
- `ResponseDataTable` - Tabular display of quiz responses (follow @docs/Table_Prompt.md)
- `UserProgressTable` - User progress tracking with sorting and filtering
- `AnalyticsDashboard` - Organization analytics with multiple data tables
- `PerformanceHistoryTable` - Individual user quiz history and scores

## Implementation Approach

### Sequential Development

```
Phase 1 → Complete & Test → Phase 2 → Complete & Test → Phase 3 → Complete & Test → Phase 4 → Complete & Test
```

### Quality Gates

After each phase:
1. **Unit Tests**: Test individual components with Jest
2. **Integration Tests**: Test component interactions with Playwright
3. **Manual Testing**: Verify functionality works as expected
4. **Code Review**: Ensure code quality and best practices

### Technology Stack

- **Frontend**: Next.js 15 with React 19 and TypeScript
- **Styling**: TailwindCSS v4 with Shadcn components
- **Backend**: Next.js server actions with Better Auth
- **Database**: PostgreSQL with Prisma ORM (dual schema)
- **Authentication**: Better Auth with magic link, admin, and organization plugins
- **Email**: Resend for magic link delivery
- **State Management**: Zustand for client state
- **Data Fetching**: React Query (@tanstack/react-query)
- **Testing**: Jest and Playwright

### Success Metrics (Prototype Scope)

- **Phase 1**: Magic link authentication with role-based access
- **Phase 2**: Multi-organization membership with proper role management
- **Phase 3**: Advanced quiz management interface with data table
- **Phase 4**: Quiz taking with comprehensive response tracking

## Job Requirement Mapping

**✅ Prototype Addresses:**
1. **Web-based** - Next.js web application
2. **Individual logins** - Better Auth magic link authentication
3. **Organization management** - Multi-organization membership with role-based access
4. **Question data collection** - Quiz responses with timestamps
5. **Section bypass** - Not applicable (quiz-focused approach)
6. **Data retrieval** - PostgreSQL storage ready for CRM integration

**🔄 Foundation for Future:**
4. **AI-informed questions** - Manual question creation with structure ready for AI enhancement
7. **CRM/visualization** - Data export capabilities and structured response data

This prototype demonstrates core LMS capabilities with a focus on quiz-based learning while providing technical foundations for AI integration and advanced reporting features.

## Future Enhancement Path

**Phase 5: AI Integration**
- OpenAI integration for dynamic question generation
- Intelligent question sequencing and difficulty adjustment
- Personalized learning recommendations

**Phase 6: Advanced Features**
- Rich content support (images, videos, documents)
- Advanced analytics and reporting dashboard
- CRM connector development (Salesforce, HubSpot)
- Real-time collaboration features

**Phase 7: Specialized Interfaces**
- Healthcare patient portal with HIPAA compliance
- Corporate training platform with skills tracking
- Mobile applications and offline capability
- Advanced role and permission management
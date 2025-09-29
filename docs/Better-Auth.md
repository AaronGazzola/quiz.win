## Example `schema.prisma` file:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
  schemas   = ["public", "better_auth"]
}

enum DiscountType {
  amount
  percentage

  @@schema("public")
}

enum UserRole {
  anon
  user
  admin
  banned

  @@schema("public")
}

enum NotificationType {
  referral
  subscription
  announcement

  @@schema("public")
}

model User {
  id                    String                    @id
  name                  String
  email                 String
  emailVerified         Boolean
  image                 String?
  createdAt             DateTime
  updatedAt             DateTime
  lastLogin             DateTime?
  role                  UserRole                  @default(user)
  stripeCustomerId      String?
  sessions              Session[]
  accounts              Account[]
  profile               Profile?
  subscriptions         Subscription[]            @relation("UserSubscriptions")
  referralCode          ReferralCode?
  referralRedemptions   ReferralRedemption[]      @relation("ReferralRedemptions")
  notifications         Notification[]
  notificationPreferences NotificationPreferences?

  @@unique([email])
  @@map("user")
  @@schema("public")
}

model Session {
  id        String   @id
  expiresAt DateTime @db.Timestamptz
  token     String
  createdAt DateTime @db.Timestamptz
  updatedAt DateTime @db.Timestamptz
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([token])
  @@map("session")
  @@schema("better_auth")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime
  updatedAt             DateTime

  @@map("account")
  @@schema("better_auth")
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime  @db.Timestamptz
  createdAt  DateTime? @db.Timestamptz
  updatedAt  DateTime? @db.Timestamptz

  @@map("verification")
  @@schema("better_auth")
}

model Subscription {
  id                   String               @id
  plan                 String
  referenceId          String
  stripeCustomerId     String?
  stripeSubscriptionId String?
  status               String?
  periodStart          DateTime?
  periodEnd            DateTime?
  cancelAtPeriodEnd    Boolean?
  seats                Int?
  user                 User                 @relation("UserSubscriptions", fields: [referenceId], references: [id], onDelete: Cascade)
  referralRedemptions  ReferralRedemption[]

  @@map("subscription")
  @@schema("public")
}

model Profile {
  id                    String    @id @default(cuid())
  firstName             String
  lastName              String
  acceptPrivacy         Boolean
  acceptTerms           Boolean
  hearAbout             String?
  intendedUse           String?
  isOnboardingComplete  Boolean   @default(false)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  deletedAt             DateTime?
  userId                String    @unique
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profile")
  @@schema("public")
}

model Notification {
  id        String           @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  subtitle  String?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)


  @@map("notification")
  @@schema("public")
}

model NotificationPreferences {
  id                    String  @id @default(cuid())
  userId                String  @unique
  referralEmail         Boolean @default(false)
  referralInApp         Boolean @default(true)
  subscriptionEmail     Boolean @default(true)
  subscriptionInApp     Boolean @default(true)
  announcementEmail     Boolean @default(true)
  announcementInApp     Boolean @default(true)
  user                  User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_preferences")
  @@schema("public")
}

```

## Organization Invitations

### Server-side API

Use `auth.api.createInvitation()` to invite users to organizations:

```typescript
await auth.api.createInvitation({
  body: {
    email: "[email protected]",
    organizationId: "org-id",
    role: "member", // "admin" | "member" | "guest"
  },
  headers: await headers(),
});
```

Required parameters:

- `email`: The email address of the user to invite (string)
- `role`: The role to assign ("admin" | "member" | "guest")

Optional parameters:

- `organizationId`: The organization ID (defaults to active organization)
- `resend`: Whether to resend if already invited (boolean)
- `teamId`: The team ID to invite to (string)

### Client-side API

Use `authClient.organization.inviteMember()` for client-side invitations:

```typescript
await authClient.organization.inviteMember({
  email: "[email protected]",
  role: "member",
  organizationId: "org-id",
  resend: true,
});
```

### Email Configuration

The invitation emails are configured in the `sendMagicLink` function within the magicLink plugin. The system automatically detects invitation links and sends appropriate invitation emails with organization context.

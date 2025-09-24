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

enum MailStatus {
  processed
  pending
  error

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
  mailItems             Mail[]

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
  dateOfBirth           String
  nationality           String
  street                String?
  city                  String?
  state                 String?
  postalCode            String?
  country               String?
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

model ReferralCode {
  id             String                @id @default(cuid())
  code           String                @unique
  userId         String                @unique
  discountAmount Decimal               @default(10.00) @db.Money
  discountType   DiscountType          @default(amount)
  isActive       Boolean               @default(true)
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt
  user           User                  @relation(fields: [userId], references: [id], onDelete: Cascade)
  redemptions    ReferralRedemption[]

  @@map("referral_code")
  @@schema("public")
}

model ReferralRedemption {
  id               String        @id @default(cuid())
  referralCodeId   String
  redeemedByUserId String
  subscriptionId   String?
  redeemedAt       DateTime      @default(now())
  referralCode     ReferralCode  @relation(fields: [referralCodeId], references: [id], onDelete: Cascade)
  redeemedBy       User          @relation("ReferralRedemptions", fields: [redeemedByUserId], references: [id], onDelete: Cascade)
  subscription     Subscription? @relation(fields: [subscriptionId], references: [id])

  @@unique([referralCodeId, redeemedByUserId])
  @@map("referral_redemption")
  @@schema("public")
}

model PendingReferralCode {
  id        String    @id @default(cuid())
  emailHash String    @unique
  code      String
  expiresAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("pending_referral_code")
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
  mail      Mail?            @relation(fields: [mailId], references: [id], onDelete: SetNull)

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

import { user } from "@prisma/client";

export interface OrganizationMembership {
  organizationName: string;
  role: "owner" | "admin" | "member";
}

export interface UserWithOrganization extends user {
  organizationName?: string;
  organizations: OrganizationMembership[];
}

export type PasswordVerificationState = "idle" | "verifying" | "success" | "failure";

export interface SignInFormState {
  password: string;
  verificationState: PasswordVerificationState;
  selectedUserId: string | null;
}

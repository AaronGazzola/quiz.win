import { User } from "@prisma/client";

export interface UserWithOrganization extends User {
  organizationName?: string;
}

export type PasswordVerificationState = "idle" | "verifying" | "success" | "failure";

export interface SignInFormState {
  password: string;
  verificationState: PasswordVerificationState;
  selectedUserId: string | null;
}

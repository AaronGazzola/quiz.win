import { User, Profile, Member, Organization } from "@prisma/client";

export interface ExtendedUser extends User {
  profile?: Profile | null;
  members?: (Member & { organization: Organization })[];
}

export interface UserWithOrganizations extends User {
  profile?: Profile | null;
  members?: (Member & { organization: Organization })[];
  organizations?: Organization[];
}

export interface OrganizationContext {
  organization: Organization;
  role: string;
  hasAdminAccess: boolean;
}

export interface AppState {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
  activeOrganization: OrganizationContext | null;
  setActiveOrganization: (org: OrganizationContext | null) => void;
  tempEmail?: string;
  setTempEmail: (tempEmail: string) => void;
  reset: () => void;
}

export interface RedirectState {
  userData: ExtendedUser | null;
  setUserData: (userData: ExtendedUser | null) => void;
  reset: () => void;
}

export interface SignInData {
  email: string;
  password: string;
}
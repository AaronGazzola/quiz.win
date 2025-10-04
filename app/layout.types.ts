import { user, Profile, member, organization } from "@prisma/client";

export interface ExtendedUser extends user {
  profile?: Profile | null;
  member?: (member & { organization: organization })[];
}

export interface UserWithorganizations extends user {
  profile?: Profile | null;
  member?: (member & { organization: organization })[];
  organizations?: organization[];
}

export interface organizationWithmember extends organization {
  member: member;
}

export interface AppState {
  user: user | null;
  setUser: (user: user | null) => void;
  tempEmail?: string;
  setTempEmail: (tempEmail: string) => void;
  selectedOrganizationIds: string[];
  setSelectedOrganizationIds: (organizationIds: string[]) => void;
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
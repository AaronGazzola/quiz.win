import { User, Profile, Member, Campus } from "@prisma/client";

export interface ExtendedUser extends User {
  profile?: Profile | null;
  members?: (Member & { campus: Campus })[];
}

export interface UserWithCampuses extends User {
  profile?: Profile | null;
  members?: (Member & { campus: Campus })[];
  campuses?: Campus[];
}

export interface CampusWithMember extends Campus {
  member: Member;
}

export interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
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
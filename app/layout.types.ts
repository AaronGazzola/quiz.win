import { User, Profile, Member } from "@prisma/client";

export interface ExtendedUser extends User {
  profile?: Profile | null;
  members?: Member[];
}

export interface AppState {
  user: ExtendedUser | null;
  setUser: (user: ExtendedUser | null) => void;
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
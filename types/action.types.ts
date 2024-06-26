import { Database } from "@/types/database.types";
import { ProfileRow } from "@/types/db.types";
import { Notification } from "@/types/notification.types";
import { Session, User } from "@supabase/supabase-js";

export interface UseActionOptions {
  successNotification?: Partial<Notification> | null;
  errorNotification?: Partial<Notification> | null;
  onSuccess?: (data?: any) => void;
  onError?: (error?: string) => void;
  endPendingOnSuccess?: boolean;
}

export interface ActionResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AuthActionValues {
  email: string;
  password: string;
}

export type SessionResponse = ActionResponse<{
  profile: ProfileRow;
  session: Session;
}>;

export interface ForgotPasswordFormValues {
  email: string;
}

export interface ResetPasswordFormValues {
  password: string;
}

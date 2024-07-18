"use client";
import getOrCreateSessionByIdAction from "@/actions/getOrCreateSessionByIdAction";
import useNotification from "@/hooks/useNotification";
import useSupabase from "@/hooks/useSupabase";
import { getLocalSessionId } from "@/lib/util/localStorage";
import { SessionRow } from "@/types/db.types";
import { NotificationStyle, Notifications } from "@/types/notification.types";
import { User } from "@supabase/supabase-js";
import React, {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

const AuthContext = createContext<{
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  session: SessionRow | null;
  setSession: Dispatch<SetStateAction<SessionRow | null>>;
} | null>(null);

const AuthClientProvider = ({
  children,
  user: userProp,
}: {
  children: ReactNode;
  user: User | null;
}) => {
  const [user, setUser] = useState(userProp);
  const [session, setSession] = useState<SessionRow | null>(null);
  const { showNotification } = useNotification();

  const supabase = useSupabase();

  useEffect(() => {
    const listener = supabase.auth.onAuthStateChange((state, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const localSessionId = getLocalSessionId();
      const { data, error } = await getOrCreateSessionByIdAction(
        localSessionId
      );
      if (data) setSession(data);
      if (error) {
        showNotification({
          message: Notifications.GetSessionError,
          style: NotificationStyle.Error,
        });
        console.log(error);
      }
    };
    if (!user && !session) fetch();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        session,
        setSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthClientProvider;

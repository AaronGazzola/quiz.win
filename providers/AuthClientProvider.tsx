"use client";
import useSupabase from "@/hooks/useSupabase";
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
} | null>(null);

const AuthClientProvider = ({
  children,
  user: userProp,
}: {
  children: ReactNode;
  user: User | null;
}) => {
  const [user, setUser] = useState(userProp);

  const supabase = useSupabase();

  useEffect(() => {
    const listener = supabase.auth.onAuthStateChange((state, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.data.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthClientProvider;

"use client";

import { configuration, privatePaths } from "@/configuration";
import { signIn } from "@/lib/auth-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppStore, useRedirectStore } from "./layout.stores";
import { SignInData } from "./layout.types";
import { getUserAction, getUserMembersAction, getUserProfileAction } from "./layout.actions";
import { useAuthLayoutStore } from "./(auth)/layout.stores";

export const useGetUser = () => {
  const { setUser, reset } = useAppStore();
  const { reset: resetAuthLayout } = useAuthLayoutStore();
  const { setUserData } = useRedirectStore();
  const pathname = usePathname();
  const router = useRouter();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data, error } = await getUserAction();
      if (!data || error) {
        if (privatePaths.includes(pathname)) {
          router.push(configuration.paths.signIn);
        }
        reset();
        resetAuthLayout();
      }
      if (error) throw error;
      setUser(data ?? null);
      setUserData(data ?? null);
      return data ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useSignIn = () => {
  const { setUser, setTempEmail } = useAppStore();
  const { setUserData } = useRedirectStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (signInData: SignInData) => {
      console.log(JSON.stringify({hook:"useSignIn",step:"start",data:{email:signInData.email?.substring(0,3)+"***"}}));

      try {
        console.log(JSON.stringify({hook:"useSignIn",step:"calling_signIn.email"}));
        const { error } = await signIn.email({
          email: signInData.email,
          password: signInData.password,
        });

        console.log(JSON.stringify({hook:"useSignIn",step:"signIn.email_response",error:error?{status:error.status,message:error.message}:null}));

        if (error?.status === 403) {
          console.log(JSON.stringify({hook:"useSignIn",step:"setting_temp_email"}));
          setTempEmail(signInData.email);
        }

        if (error) throw error;

        console.log(JSON.stringify({hook:"useSignIn",step:"calling_getUserAction"}));
        const { data: userData, error: userError } = await getUserAction();

        console.log(JSON.stringify({hook:"useSignIn",step:"getUserAction_response",hasData:!!userData,error:userError}));

        if (userError) throw new Error(userError);

        return userData;
      } catch (err) {
        console.log(JSON.stringify({hook:"useSignIn",step:"error_caught",error:err instanceof Error?{name:err.name,message:err.message}:err}));
        throw err;
      }
    },
    onSuccess: (data) => {
      console.log(JSON.stringify({hook:"useSignIn",step:"onSuccess",hasData:!!data}));
      if (data) {
        setUser(data);
        setUserData(data);
      }
      toast.success("Successfully signed in");
      console.log(JSON.stringify({hook:"useSignIn",step:"redirecting_to_home"}));
      router.push(configuration.paths.home);
    },
    onError: (error: { status?: number; message?: string }) => {
      console.log(JSON.stringify({hook:"useSignIn",step:"onError",error:{status:error?.status,message:error?.message}}));
      if (error?.status === 403) return;
      toast.error(error?.message || "Failed to sign in");
    },
  });
};

export const useGetUserMembers = () => {
  const { user } = useAppStore();

  return useQuery({
    queryKey: ["user", "members", user?.id],
    queryFn: async () => {
      const { data, error } = await getUserMembersAction();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useGetUserProfile = () => {
  const { user } = useAppStore();

  return useQuery({
    queryKey: ["user", "profile", user?.id],
    queryFn: async () => {
      const { data, error } = await getUserProfileAction();
      if (error) throw error;
      return data ?? null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10,
  });
};
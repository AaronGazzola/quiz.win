"use client";

import { configuration, privatePaths } from "@/configuration";
import { signIn } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthLayoutStore } from "./(auth)/layout.stores";
import {
  getUserAction,
  getUserMembersAction,
  getUserProfileAction,
  createOrganizationAction,
  getAllOrganizationsAction,
} from "./layout.actions";
import { useAppStore, useRedirectStore } from "./layout.stores";
import { SignInData } from "./layout.types";
import { isSuperAdmin, canAccessAdminUI } from "@/lib/client-role.utils";

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
      if (error) {
        if (privatePaths.includes(pathname)) {
          router.push(configuration.paths.signIn);
        }
        reset();
        resetAuthLayout();
        throw error;
      }
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signInData: SignInData) => {

      try {
        const { error } = await signIn.email({
          email: signInData.email,
          password: signInData.password,
        });


        if (error?.status === 403) {
          setTempEmail(signInData.email);
        }

        if (error) throw error;

        const { data: userData, error: userError } = await getUserAction();


        if (userError) throw new Error(userError);

        return userData;
      } catch (err) {
        throw err;
      }
    },
    onSuccess: (data) => {
      if (data) {
        setUser(data);
        setUserData(data);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user", "members"] });
      toast.success("Successfully signed in");
      router.push(configuration.paths.home);
    },
    onError: (error: { status?: number; message?: string }) => {
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

export const useAdminAccess = () => {
  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds } = useAppStore();

  const isSuperAdminUser = isSuperAdmin(userWithMembers || null);
  const hasAdminUI = canAccessAdminUI(userWithMembers || null, selectedOrganizationIds);

  return isSuperAdminUser || hasAdminUI;
};

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await createOrganizationAction(name);
      if (error) throw new Error(error);
      return data;
    },
    onSuccess: () => {
      toast.success("Organization created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });
};

export const useGetAllOrganizations = () => {
  const { user } = useAppStore();

  return useQuery({
    queryKey: ["organizations", "all"],
    queryFn: async () => {
      const { data, error } = await getAllOrganizationsAction();
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id && user?.role === "super-admin",
    staleTime: 1000 * 60 * 10,
  });
};

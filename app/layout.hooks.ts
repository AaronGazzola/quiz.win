"use client";

import { configuration } from "@/configuration";
import { signIn } from "@/lib/auth-client";
import { canAccessAdminUI, isSuperAdmin } from "@/lib/client-role.utils";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthLayoutStore } from "./(auth)/layout.stores";
import {
  createOrganizationAction,
  getAllOrganizationsAction,
  getUserMembersAction,
  getUserProfileAction,
} from "./layout.actions";
import { useAppStore, useRedirectStore } from "./layout.stores";
import { SignInData } from "./layout.types";

export const useGetUser = () => {
  const { setUser, reset } = useAppStore();
  const { reset: resetAuthLayout } = useAuthLayoutStore();
  const { setUserData } = useRedirectStore();

  conditionalLog(
    { hook: "useGetUser", status: "initialized" },
    { label: LOG_LABELS.DATA_FETCH }
  );

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      conditionalLog(
        { hook: "useGetUser", status: "fetching" },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getUserMembersAction();
      if (error) {
        conditionalLog(
          { hook: "useGetUser", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        reset();
        resetAuthLayout();
        throw error;
      }
      conditionalLog(
        {
          hook: "useGetUser",
          status: "success",
          userId: data?.id,
          memberCount: data?.member?.length,
          role: data?.role,
        },
        { label: LOG_LABELS.DATA_FETCH }
      );
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

  conditionalLog(
    { hook: "useSignIn", status: "initialized" },
    { label: LOG_LABELS.DATA_FETCH }
  );

  return useMutation({
    mutationFn: async (signInData: SignInData) => {
      conditionalLog(
        { hook: "useSignIn", status: "mutating", email: signInData.email },
        { label: LOG_LABELS.DATA_FETCH }
      );
      try {
        const { error } = await signIn.email({
          email: signInData.email,
          password: signInData.password,
        });

        if (error?.status === 403) {
          conditionalLog(
            { hook: "useSignIn", status: "403_verification_required" },
            { label: LOG_LABELS.DATA_FETCH }
          );
          setTempEmail(signInData.email);
        }

        if (error) throw error;

        conditionalLog(
          { hook: "useSignIn", status: "auth_success_fetching_user" },
          { label: LOG_LABELS.DATA_FETCH }
        );
        const { data: userData, error: userError } =
          await getUserMembersAction();

        if (userError) throw new Error(userError);

        conditionalLog(
          {
            hook: "useSignIn",
            status: "user_fetched",
            userId: userData?.id,
            memberCount: userData?.member?.length,
          },
          { label: LOG_LABELS.DATA_FETCH }
        );
        return userData;
      } catch (err) {
        conditionalLog(
          { hook: "useSignIn", status: "error", error: err },
          { label: LOG_LABELS.DATA_FETCH }
        );
        throw err;
      }
    },
    onSuccess: async (data) => {
      conditionalLog(
        { hook: "useSignIn", status: "success", userId: data?.id },
        { label: LOG_LABELS.DATA_FETCH }
      );
      if (data) {
        setUser(data);
        setUserData(data);
      }

      conditionalLog(
        { hook: "useSignIn", status: "prefetching_data" },
        { label: LOG_LABELS.DATA_FETCH }
      );

      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: ["user"],
          queryFn: () => getUserMembersAction(),
        }),
        data?.role === "super-admin"
          ? queryClient.prefetchQuery({
              queryKey: ["organizations", "all"],
              queryFn: () => getAllOrganizationsAction(),
            })
          : Promise.resolve(),
      ]);

      conditionalLog(
        { hook: "useSignIn", status: "prefetch_complete_navigating" },
        { label: LOG_LABELS.DATA_FETCH }
      );
      toast.success("Successfully signed in");
      router.push(configuration.paths.home);
    },
    onError: (error: { status?: number; message?: string }) => {
      conditionalLog(
        { hook: "useSignIn", status: "mutation_error", error },
        { label: LOG_LABELS.DATA_FETCH }
      );
      if (error?.status === 403) return;
      toast.error(error?.message || "Failed to sign in");
    },
  });
};

export const useGetUserMembers = () => {
  conditionalLog(
    { hook: "useGetUserMembers", status: "deprecated_use_useGetUser_instead" },
    { label: LOG_LABELS.DATA_FETCH }
  );
  return useGetUser();
};

export const useGetUserProfile = () => {
  const { user } = useAppStore();

  const enabled = !!user?.id;
  conditionalLog(
    {
      hook: "useGetUserProfile",
      status: "initialized",
      enabled,
      userId: user?.id,
    },
    { label: LOG_LABELS.DATA_FETCH }
  );

  return useQuery({
    queryKey: ["user", "profile", user?.id],
    queryFn: async () => {
      conditionalLog(
        { hook: "useGetUserProfile", status: "fetching", userId: user?.id },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getUserProfileAction();
      if (error) {
        conditionalLog(
          { hook: "useGetUserProfile", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        throw error;
      }
      conditionalLog(
        { hook: "useGetUserProfile", status: "success", hasProfile: !!data },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data ?? null;
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

export const useAdminAccess = () => {
  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds } = useAppStore();

  const isSuperAdminUser = isSuperAdmin(userWithMembers || null);
  const hasAdminUI = canAccessAdminUI(
    userWithMembers || null,
    selectedOrganizationIds
  );

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
  const { data: user } = useGetUser();

  const enabled = !!user?.id && user?.role === "super-admin";
  conditionalLog(
    {
      hook: "useGetAllOrganizations",
      status: "initialized",
      enabled,
      userId: user?.id,
      role: user?.role,
    },
    { label: LOG_LABELS.DATA_FETCH }
  );

  return useQuery({
    queryKey: ["organizations", "all"],
    queryFn: async () => {
      conditionalLog(
        { hook: "useGetAllOrganizations", status: "fetching" },
        { label: LOG_LABELS.DATA_FETCH }
      );
      const { data, error } = await getAllOrganizationsAction();
      if (error) {
        conditionalLog(
          { hook: "useGetAllOrganizations", status: "error", error },
          { label: LOG_LABELS.DATA_FETCH }
        );
        throw error;
      }
      conditionalLog(
        {
          hook: "useGetAllOrganizations",
          status: "success",
          orgCount: data?.length,
        },
        { label: LOG_LABELS.DATA_FETCH }
      );
      return data ?? [];
    },
    enabled,
    staleTime: 1000 * 60 * 10,
  });
};

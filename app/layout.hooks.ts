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
  getUserMembersAction,
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
        console.error(JSON.stringify({hook:"useGetUser",error}));
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
  const { setTempEmail } = useAppStore();
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
        { hook: "useSignIn", status: "auth_success" },
        { label: LOG_LABELS.DATA_FETCH }
      );
    },
    onSuccess: async () => {
      conditionalLog(
        { hook: "useSignIn", status: "success" },
        { label: LOG_LABELS.DATA_FETCH }
      );

      queryClient.invalidateQueries({ queryKey: ["user"] });

      conditionalLog(
        { hook: "useSignIn", status: "navigating_to_dashboard" },
        { label: LOG_LABELS.DATA_FETCH }
      );
      toast.success("Successfully signed in");
      router.push(configuration.paths.home);
    },
    onError: (error: { status?: number; message?: string }) => {
      console.error(JSON.stringify({ hook: "useSignIn", error }));
      conditionalLog(
        { hook: "useSignIn", status: "mutation_error", error },
        { label: LOG_LABELS.DATA_FETCH }
      );
      if (error?.status === 403) return;
      toast.error(error?.message || "Failed to sign in");
    },
  });
};


export const useAdminAccess = () => {
  const { user, selectedOrganizationIds } = useAppStore();

  const isSuperAdminUser = isSuperAdmin(user || null);
  const hasAdminUI = canAccessAdminUI(
    user || null,
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
      console.error(JSON.stringify({ hook: "useCreateOrganization", error }));
      toast.error(error.message || "Failed to create organization");
    },
  });
};

"use client";

import { useAuthLayoutStore } from "@/app/(auth)/layout.stores";
import {
  useQuizTableStore,
  useResponseTableStore,
  useResponseDetailStore,
  useBulkOperationStore,
  useQuizDialogStore,
  useDashboardDataStore,
  useResponseDataStore,
} from "@/app/(dashboard)/page.stores";
import { useQuizPlayerStore } from "@/app/(dashboard)/take-quiz/[id]/page.stores";
import { useGamificationStore } from "@/app/(dashboard)/gamification/gamification.stores";
import {
  useUserTableStore,
  useUserRoleManagementDialogStore,
  useConfirmationDialogStore,
} from "@/app/(dashboard)/users/page.stores";
import { useAdminAccess, useGetUser } from "@/app/layout.hooks";
import { useAppStore, useRedirectStore } from "@/app/layout.stores";
import { configuration } from "@/configuration";
import { InvitationToasts } from "@/components/InvitationToasts";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { signOut } from "@/lib/auth-client";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useGetUser();
  const { user, reset } = useAppStore();
  const { reset: resetRedirect } = useRedirectStore();
  const hasAdminAccess = useAdminAccess();
  const { reset: resetAuthLayout } = useAuthLayoutStore();
  const { reset: resetQuizTable } = useQuizTableStore();
  const { reset: resetResponseTable } = useResponseTableStore();
  const { reset: resetResponseDetail } = useResponseDetailStore();
  const { reset: resetBulkOperation } = useBulkOperationStore();
  const { close: closeQuizDialog } = useQuizDialogStore();
  const { reset: resetDashboardData } = useDashboardDataStore();
  const { reset: resetResponseData } = useResponseDataStore();
  const { resetQuiz } = useQuizPlayerStore();
  const { reset: resetGamification } = useGamificationStore();
  const { reset: resetUserTable } = useUserTableStore();
  const { closeDialog: closeRoleDialog } = useUserRoleManagementDialogStore();
  const { closeDialog: closeConfirmationDialog } = useConfirmationDialogStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignOut = async () => {
    try {
      conditionalLog({ location: "handleSignOut", status: "start", userId: user?.id }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "calling_signOut" }, { label: LOG_LABELS.AUTH });
      await signOut();
      conditionalLog({ location: "handleSignOut", status: "signOut_complete" }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "clearing_cache" }, { label: LOG_LABELS.AUTH });
      queryClient.clear();
      conditionalLog({ location: "handleSignOut", status: "cache_cleared" }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "resetting_stores" }, { label: LOG_LABELS.AUTH });
      reset();
      resetRedirect();
      resetAuthLayout();
      resetQuizTable();
      resetResponseTable();
      resetResponseDetail();
      resetBulkOperation();
      closeQuizDialog();
      resetDashboardData();
      resetResponseData();
      resetQuiz();
      resetGamification();
      resetUserTable();
      closeRoleDialog();
      closeConfirmationDialog();
      conditionalLog({ location: "handleSignOut", status: "stores_reset" }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "navigating_to_sign_in" }, { label: LOG_LABELS.AUTH });
      router.push(configuration.paths.signIn);
      conditionalLog({ location: "handleSignOut", status: "complete" }, { label: LOG_LABELS.AUTH });
    } catch (error) {
      conditionalLog({ location: "handleSignOut", status: "error", error }, { label: LOG_LABELS.AUTH });
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <InvitationToasts />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex flex-1 items-center space-x-8">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              LMS Dashboard
            </Link>
            <nav className="hidden md:flex space-x-6">
              {hasAdminAccess && (
                <Link
                  href="/invite"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Invite Users
                </Link>
              )}
              {hasAdminAccess && (
                <Link
                  href="/users"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  User Management
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <OrganizationSelector />
            <UserAvatarMenu
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}

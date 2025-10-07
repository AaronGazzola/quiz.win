"use client";

import { useAuthLayoutStore } from "@/app/(auth)/layout.stores";
import {
  useQuizTableStore,
  useResponseTableStore,
} from "@/app/(dashboard)/page.stores";
import { useQuizPlayerStore } from "@/app/(dashboard)/take-quiz/[id]/page.stores";
import { useAdminAccess, useGetUser } from "@/app/layout.hooks";
import { queryClient } from "@/app/layout.providers";
import { useAppStore } from "@/app/layout.stores";
import { ExtendedUser } from "@/app/layout.types";
import { InvitationToasts } from "@/components/InvitationToasts";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { signOut } from "@/lib/auth-client";
import { conditionalLog, LOG_LABELS } from "@/lib/log.util";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const { reset } = useAppStore();
  const hasAdminAccess = useAdminAccess();
  const { reset: resetAuthLayout } = useAuthLayoutStore();
  const { reset: resetQuizTable } = useQuizTableStore();

  const { reset: resetResponseTable } = useResponseTableStore();

  const { resetQuiz } = useQuizPlayerStore();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      conditionalLog({ location: "handleSignOut", status: "start", userId: user?.id }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "calling_signOut" }, { label: LOG_LABELS.AUTH });
      await signOut();
      conditionalLog({ location: "handleSignOut", status: "signOut_complete" }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "invalidating_queries" }, { label: LOG_LABELS.AUTH });
      queryClient.invalidateQueries();
      conditionalLog({ location: "handleSignOut", status: "queries_invalidated" }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "resetting_stores" }, { label: LOG_LABELS.AUTH });
      reset();
      resetAuthLayout();
      resetQuizTable();
      resetResponseTable();
      resetQuiz();
      conditionalLog({ location: "handleSignOut", status: "stores_reset" }, { label: LOG_LABELS.AUTH });

      conditionalLog({ location: "handleSignOut", status: "navigating_to_sign_in" }, { label: LOG_LABELS.AUTH });
      router.push("/sign-in");
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
              user={user as ExtendedUser | null}
              onSignOut={handleSignOut}
              isLoading={isLoading}
            />
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6">{children}</main>
    </div>
  );
}

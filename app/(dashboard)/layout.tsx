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
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { signOut } from "@/lib/auth-client";
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
    await signOut();

    queryClient.invalidateQueries();

    reset();
    resetAuthLayout();
    resetQuizTable();
    resetResponseTable();
    resetQuiz();

    router.push("/sign-in");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex flex-1 items-center space-x-8">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              Abraham Lincoln Academy
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/classrooms"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Classrooms
              </Link>
              <Link
                href="/students"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Students
              </Link>
              <Link
                href="/teachers"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Teachers
              </Link>
              <Link
                href="/parents"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Parents
              </Link>
              <Link
                href="/assessments"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Assessments
              </Link>
              <Link
                href="/messages"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Messages
              </Link>
              <Link
                href="/announcements"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Announcements
              </Link>
              {hasAdminAccess && (
                <>
                  <Link
                    href="/campus"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Campus
                  </Link>
                  <Link
                    href="/users"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Users
                  </Link>
                  <Link
                    href="/invite"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Invitations
                  </Link>
                </>
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

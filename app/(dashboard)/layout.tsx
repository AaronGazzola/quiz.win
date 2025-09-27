"use client";

import { useGetUser, useGetUserMembers } from "@/app/layout.hooks";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/app/layout.stores";
import { canAccessAdminUI } from "@/lib/client-role.utils";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { OrganizationSelector } from "@/components/OrganizationSelector";
import { DashboardLayoutSkeleton } from "@/components/DashboardLayoutSkeleton";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const { data: userWithMembers } = useGetUserMembers();
  const { reset, selectedOrganizationIds } = useAppStore();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    reset();
    router.push("/sign-in");
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/sign-in");
      return;
    }
  }, [user, isLoading, router]);


  if (isLoading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
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
              <Link
                href="/quizzes"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Quizzes
              </Link>
              {canAccessAdminUI(userWithMembers || null, selectedOrganizationIds) && (
                <Link
                  href="/invite"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Invite Users
                </Link>
              )}
              {canAccessAdminUI(userWithMembers || null, selectedOrganizationIds) && (
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
            <UserAvatarMenu user={user} onSignOut={handleSignOut} />
          </div>
        </div>
      </header>
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
"use client";

import { useGetUser } from "@/app/layout.hooks";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/app/layout.stores";
import { useGetUserOrganizations } from "./quizzes/page.hooks";
import { isAdmin, isSuperAdmin } from "@/lib/client-role.utils";
import { UserAvatarMenu } from "@/components/user-avatar-menu";
import { OrganizationSwitcher } from "./components/OrganizationSwitcher";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const { reset } = useAppStore();
  const router = useRouter();
  const { data: organizations = [] } = useGetUserOrganizations();
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");

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

  useEffect(() => {
    if (organizations.length > 0 && !selectedOrganization) {
      setSelectedOrganization(organizations[0].id);
    }
  }, [organizations, selectedOrganization]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg text-foreground">Loading...</div>
      </div>
    );
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
              href="/dashboard"
              className="flex items-center text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
            >
              LMS Dashboard
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Quizzes
              </Link>
              {isAdmin(user) && (
                <Link
                  href="/dashboard/invite"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Invite Users
                </Link>
              )}
              {(isSuperAdmin(user) || user.members?.some(member => member.role === 'admin')) && (
                <Link
                  href="/dashboard/users"
                  className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  User Management
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {organizations.length > 1 && (
              <OrganizationSwitcher
                organizations={organizations}
                selectedOrganization={selectedOrganization}
                onOrganizationChange={setSelectedOrganization}
              />
            )}
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
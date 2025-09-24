"use client";

import { useGetUser } from "@/app/layout.hooks";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppStore } from "@/app/layout.stores";
import { isAdmin, getRoleLabel } from "@/lib/role.utils";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const { reset } = useAppStore();
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

    if (user && !user.profile?.isOnboardingComplete) {
      router.push("/onboarding");
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-semibold hover:text-gray-700">
                LMS Dashboard
              </Link>
              <nav className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/quizzes"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Quizzes
                </Link>
                {isAdmin(user) && (
                  <Link
                    href="/dashboard/admin"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Admin
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-sm text-gray-600">
                  {user.email}
                </span>
                <span className="text-xs text-gray-500">
                  {getRoleLabel(user.role as "user" | "admin" | "super-admin")}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
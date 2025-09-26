"use client";

import { useGetUser } from "@/app/layout.hooks";
import { isSuperAdmin, isAdmin } from "@/lib/client-role.utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const router = useRouter();

  const hasAccess = user && (isSuperAdmin(user) || isAdmin(user));

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router, hasAccess]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return <div>{children}</div>;
}
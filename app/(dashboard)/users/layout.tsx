"use client";

import { useGetUser, useGetUserMembers } from "@/app/layout.hooks";
import { canAccessAdminUI } from "@/lib/client-role.utils";
import { useAppStore } from "@/app/layout.stores";
import { SimpleLayoutSkeleton } from "@/components/SimpleLayoutSkeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const { data: userWithMembers } = useGetUserMembers();
  const { selectedOrganizationIds } = useAppStore();
  const router = useRouter();

  const hasAccess = userWithMembers && canAccessAdminUI(userWithMembers, selectedOrganizationIds);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push("/");
    }
  }, [user, userWithMembers, selectedOrganizationIds, isLoading, router, hasAccess]);

  if (isLoading) {
    return <SimpleLayoutSkeleton />;
  }

  if (!hasAccess) {
    return null;
  }

  return <div>{children}</div>;
}
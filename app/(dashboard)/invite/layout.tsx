"use client";

import { useGetUser } from "@/app/layout.hooks";
import { canAccessAdminUI } from "@/lib/client-role.utils";
import { useAppStore } from "@/app/layout.stores";
import { SimpleLayoutSkeleton } from "@/components/SimpleLayoutSkeleton";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const { selectedOrganizationIds } = useAppStore();
  const router = useRouter();

  const hasAccess = user && canAccessAdminUI(user, selectedOrganizationIds);

  useEffect(() => {
    if (!isLoading && !hasAccess) {
      router.push("/");
    }
  }, [user, selectedOrganizationIds, isLoading, router, hasAccess]);

  if (isLoading) {
    return <SimpleLayoutSkeleton />;
  }

  if (!hasAccess) {
    return null;
  }

  return <div>{children}</div>;
}
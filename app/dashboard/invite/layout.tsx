"use client";

import { useGetUser } from "@/app/layout.hooks";
import { canInviteUsers } from "@/lib/client-role.utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: user, isLoading } = useGetUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !canInviteUsers(user))) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user || !canInviteUsers(user)) {
    return null;
  }

  return <div>{children}</div>;
}
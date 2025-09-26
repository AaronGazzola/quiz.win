import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReactNode } from "react";

interface PermissionGuardProps {
  userId?: string;
  organizationId?: string;
  resource?: string;
  action?: string;
  role?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export async function PermissionGuard({
  userId,
  organizationId,
  resource,
  action,
  role,
  children,
  fallback = <div className="text-center py-8 text-muted-foreground">Access denied</div>
}: PermissionGuardProps) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return fallback;
    }

    const targetUserId = userId || session.user.id;

    if (role && organizationId) {
      const hasRole = await auth.api.hasRole({
        userId: targetUserId,
        organizationId,
        role,
        headers: await headers(),
      });

      if (!hasRole) {
        return fallback;
      }
    }

    if (resource && action && organizationId) {
      const hasPermission = await auth.api.hasPermission({
        userId: targetUserId,
        organizationId,
        resource,
        action,
        headers: await headers(),
      });

      if (!hasPermission) {
        return fallback;
      }
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Permission check failed:", error);
    return fallback;
  }
}
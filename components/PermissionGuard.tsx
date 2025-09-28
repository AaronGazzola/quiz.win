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

    if (role && organizationId) {
      // TODO: Implement role checking when auth.api.hasRole is available
      // For now, skip role validation
    }

    if (resource && action && organizationId) {
      // TODO: Implement permission checking when auth.api.hasPermission is available
      // For now, skip permission validation
    }

    return <>{children}</>;
  } catch (error) {
    console.error("Permission check failed:", error);
    return fallback;
  }
}
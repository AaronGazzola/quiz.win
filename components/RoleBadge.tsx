"use client";

import { Shield, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/shadcn.utils";

interface RoleBadgeProps {
  role: "super-admin" | "owner" | "admin" | "member" | string;
  organizationName?: string;
  variant?: "default" | "compact" | "icon-only";
  className?: string;
}

export function RoleBadge({
  role,
  organizationName,
  variant = "default",
  className
}: RoleBadgeProps) {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "super-admin":
        return {
          label: "Super Admin",
          icon: Shield,
          bgClass: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
          iconColor: "text-purple-600",
        };
      case "owner":
        return {
          label: "Owner",
          icon: ShieldCheck,
          bgClass: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
          iconColor: "text-amber-600",
        };
      case "admin":
        return {
          label: "Admin",
          icon: ShieldCheck,
          bgClass: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
          iconColor: "text-blue-600",
        };
      case "member":
        return {
          label: "Member",
          icon: User,
          bgClass: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
          iconColor: "text-green-600",
        };
      default:
        return {
          label: "User",
          icon: User,
          bgClass: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
          iconColor: "text-gray-600",
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;

  if (variant === "icon-only") {
    return (
      <span title={`${config.label}${organizationName ? ` - ${organizationName}` : ''}`}>
        <Icon
          className={cn("w-4 h-4", config.iconColor, className)}
        />
      </span>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        config.bgClass,
        className
      )}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
      config.bgClass,
      className
    )}>
      <Icon className="w-3 h-3 mr-1.5" />
      <span>
        {config.label}
        {organizationName && role !== "super-admin" && (
          <span className="ml-1 opacity-75">• {organizationName}</span>
        )}
      </span>
    </div>
  );
}
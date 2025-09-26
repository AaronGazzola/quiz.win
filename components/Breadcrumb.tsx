"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  organizationName?: string;
}

export function Breadcrumb({ items, organizationName }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors"
      >
        Dashboard
      </Link>

      {organizationName && (
        <>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">{organizationName}</span>
        </>
      )}

      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="w-4 h-4" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
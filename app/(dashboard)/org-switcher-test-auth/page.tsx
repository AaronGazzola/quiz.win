"use client";

import { SimplifiedOrgSwitcher } from "@/app/(test)/org-switcher-test/SimplifiedOrgSwitcher";

export default function OrgSwitcherAuthTestPage() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Auth-Protected Org Switcher Test</h1>
      <p className="text-muted-foreground">This page requires authentication</p>
      <SimplifiedOrgSwitcher />
    </div>
  );
}

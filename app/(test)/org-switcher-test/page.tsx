"use client";

import { SimplifiedOrgSwitcher } from "./SimplifiedOrgSwitcher";

export default function OrgSwitcherTestPage() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Organization Switcher Test Page</h1>
      <p className="text-muted-foreground">This page tests the org switcher component in isolation</p>
      <SimplifiedOrgSwitcher />
    </div>
  );
}

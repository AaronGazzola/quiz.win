"use client";

import { RealDataOrgSwitcher } from "./RealDataOrgSwitcher";

export default function OrgSwitcherDataTestPage() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Real Data Org Switcher Test</h1>
      <p className="text-muted-foreground">Uses actual user data and stores</p>
      <RealDataOrgSwitcher />
    </div>
  );
}

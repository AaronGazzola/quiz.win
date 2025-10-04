import { verifySession } from "@/lib/session.utils";
import { Suspense } from "react";
import { DashboardPageContent } from "./page.content";

export default async function DashboardPage() {
  await verifySession();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

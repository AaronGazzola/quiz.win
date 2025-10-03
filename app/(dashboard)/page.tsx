import { auth } from "@/lib/auth";
import { configuration } from "@/configuration";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { DashboardPageContent } from "./page.content";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect(configuration.paths.signIn);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </Suspense>
  );
}

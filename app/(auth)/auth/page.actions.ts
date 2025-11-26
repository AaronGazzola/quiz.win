"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ActionResponse, getActionResponse } from "@/lib/action.utils";

export const createOrganizationAfterSignUpAction = async (
  organizationName: string,
  slug: string
): Promise<ActionResponse<{ success: boolean }>> => {
  try {
    console.log("🟡 [ACTION] Starting createOrganizationAfterSignUpAction", { organizationName, slug });

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("🟡 [ACTION] Session check:", session?.user ? `authenticated as ${session.user.email}` : "not authenticated");

    if (!session?.user) {
      console.error("🔴 [ACTION] No session found, returning error");
      return getActionResponse({ error: "Not authenticated" });
    }

    console.log("🟡 [ACTION] Calling auth.api.createOrganization");

    await auth.api.createOrganization({
      body: { name: organizationName, slug },
      headers: await headers(),
    });

    console.log("🟡 [ACTION] Organization created successfully");
    return getActionResponse({ data: { success: true } });
  } catch (error) {
    console.error("🔴 [ACTION] Error creating organization:", error);
    return getActionResponse({ error });
  }
};

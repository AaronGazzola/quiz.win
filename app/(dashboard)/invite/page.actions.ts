"use server";

import { ActionResponse, getActionResponse } from "@/lib/action.utils";
import { auth } from "@/lib/auth";
import { getUserAdminOrganizations, isSuperAdmin } from "@/lib/role.utils";
import { headers } from "next/headers";

export const getOrganizationsAction = async (): Promise<ActionResponse<Array<{id: string; name: string; slug: string}>>> => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return getActionResponse({ error: "Not authenticated" });
    }

    let organizations;

    if (await isSuperAdmin()) {
      organizations = await auth.api.listOrganizations({
        headers: await headers(),
      });
    } else {
      organizations = await getUserAdminOrganizations(session.user.id);
    }

    return getActionResponse({ data: organizations || [] });
  } catch (error) {
    return getActionResponse({ error });
  }
};



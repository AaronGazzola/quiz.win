import createMiddlewareClient from "@/clients/middleware-client";
import configuration from "@/lib/configuration";
import { GlobalRole } from "@/types/session.types";
import { NextRequest, NextResponse } from "next/server";

async function adminMiddleware(request: NextRequest, response: NextResponse) {
  const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

  if (!isAdminPath) return response;

  const supabase = createMiddlewareClient(request, response);
  const user = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(configuration.paths.signIn);

  const role = user.data.user?.app_metadata["role"];

  // If user is not an admin, redirect to 404 page.
  if (!role || role !== GlobalRole.SuperAdmin)
    return NextResponse.redirect(`${configuration.site.siteUrl}/404`);

  return response;
}

export default adminMiddleware;

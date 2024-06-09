import adminMiddleware from "@/middleware/adminMiddleware";
import authMiddleware from "@/middleware/authMiddleware";
import csrffMiddleware from "@/middleware/csrfMiddleware";
import sessionMiddleware from "@/middleware/sessionMiddleware";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const csrfResponse = await csrffMiddleware(request, response);
  const sessionResponse = await sessionMiddleware(request, csrfResponse);
  const authResponse = await authMiddleware(request, sessionResponse);
  const adminResponse = await adminMiddleware(request, authResponse);
  return adminResponse;
}

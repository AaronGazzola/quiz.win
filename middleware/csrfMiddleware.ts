import configuration from "@/lib/configuration";
import { HttpStatusCode } from "@/types/http.types";
import { CsrfError, createCsrfProtect } from "@edge-csrf/nextjs";
import { NextRequest, NextResponse } from "next/server";

const CSRF_SECRET_COOKIE = "csrfSecret";
const NEXT_ACTION_HEADER = "next-action";

function isServerAction(request: NextRequest) {
  const headers = new Headers(request.headers);
  return headers.has(NEXT_ACTION_HEADER);
}

const csrffMiddleware = async (
  request: NextRequest,
  response: NextResponse
) => {
  // set up CSRF protection
  const csrfProtect = createCsrfProtect({
    cookie: {
      secure: configuration.production,
      name: CSRF_SECRET_COOKIE,
    },
    // ignore CSRF errors for server actions since protection is built-in
    ignoreMethods: isServerAction(request)
      ? ["POST"]
      : // always ignore GET, HEAD, and OPTIONS requests
        ["GET", "HEAD", "OPTIONS"],
  });

  try {
    await csrfProtect(request, response);
  } catch (err) {
    if (err instanceof CsrfError)
      return new NextResponse("invalid csrf token", {
        status: HttpStatusCode.Forbidden,
      });
    throw err;
  }

  return response;
};

export default csrffMiddleware;

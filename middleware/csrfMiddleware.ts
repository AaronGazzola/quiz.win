import { createCsrfMiddleware } from "@edge-csrf/nextjs";
import configuration from "@/lib/configuration";
import { HttpStatusCode } from "@/types/http.types";
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
  const middleware = createCsrfMiddleware({
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

  const csrfError = await middleware(request);

  // if there is a CSRF error, return a 403 response
  if (csrfError) {
    return NextResponse.json("Invalid CSRF token", {
      status: HttpStatusCode.Forbidden,
    });
  }

  // otherwise, return the response
  return response;
};
export default csrffMiddleware;

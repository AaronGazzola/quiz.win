import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const headersList = await headers();
  const allHeaders = Object.fromEntries(headersList.entries());

  const cookieHeader = headersList.get("cookie") || "";
  const cookies = cookieHeader.split(";").map(c => c.trim());

  const cookieSizes = cookies.map(cookie => ({
    cookie: cookie.substring(0, 50) + (cookie.length > 50 ? "..." : ""),
    size: cookie.length
  }));

  const totalCookieSize = cookieHeader.length;
  const totalHeaderSize = JSON.stringify(allHeaders).length;

  return NextResponse.json({
    totalHeaderSize,
    totalCookieSize,
    cookieCount: cookies.filter(c => c.length > 0).length,
    cookieSizes: cookieSizes.filter(c => c.size > 0).sort((a, b) => b.size - a.size),
    headers: {
      "content-length": allHeaders["content-length"],
      "user-agent": allHeaders["user-agent"]?.substring(0, 100) + "...",
      "cookie-preview": cookieHeader.substring(0, 200) + (cookieHeader.length > 200 ? "..." : ""),
    }
  });
}
import { NextResponse } from "next/server";
import { decrypt } from "@/utils/session";
import { cookies } from "next/headers";

const protectedRoutes = [];
const publicRoutes = ["/admin"];

export default async function middleware(req) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) => {
    return path.startsWith(route);
  });

  const isPublicRoute = publicRoutes.includes(path);

  const cookieStore = await cookies();

  const encryptedSession = cookieStore.get("session")?.value;

  const sessionData = await decrypt(encryptedSession);

  const isSessionValid =
    sessionData && new Date(sessionData.expiresAt) > new Date();

  if (isProtectedRoute && !isSessionValid) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  if (
    isPublicRoute &&
    isSessionValid &&
    !req.nextUrl.pathname.startsWith("/admin/user")
  ) {
    return NextResponse.redirect(new URL("/admin/user", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

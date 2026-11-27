import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((request) => {
  if (request.auth) return NextResponse.next();

  const { pathname, search, origin } = request.nextUrl;
  const signInUrl = new URL("/signin", origin);
  signInUrl.searchParams.set("callbackUrl", pathname + search);

  return NextResponse.redirect(signInUrl);
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookmarks/:path*",
    "/settings/:path*",
    "/create/:path*",
    "/blogs/:slug/edit",
  ],
};

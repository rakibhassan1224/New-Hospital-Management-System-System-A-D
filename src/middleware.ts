import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");
    const role = token?.role as string;

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }
      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Redirect Patients from main dashboard to their portal
    if (req.nextUrl.pathname === "/dashboard" && role === "PATIENT") {
      return NextResponse.redirect(new URL("/patient/dashboard", req.url));
    }

    // Role-based protection example
    if (req.nextUrl.pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    // Doctor routes
    if (req.nextUrl.pathname.startsWith("/medical-records") && role !== "DOCTOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Patient routes protection
    if ((req.nextUrl.pathname === "/patient" || req.nextUrl.pathname.startsWith("/patient/")) && role !== "PATIENT") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return null;
  },
  {
    callbacks: {
      authorized: () => true, // We handle authorization in the middleware function above
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/patients/:path*", "/appointments/:path*", "/medical-records/:path*", "/patient/:path*"],
};

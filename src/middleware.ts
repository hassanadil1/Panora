import { authMiddleware, getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default authMiddleware({
  // Routes that can be accessed while signed out
  publicRoutes: [
    "/", // Allow guest access to home page
    "/sign-in", 
    "/sign-up", 
    "/api/webhook",
    "/properties" // Allow access to properties page
  ],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ["/api/webhook"],
  
  // Redirect logged-in users away from auth pages
  afterAuth: (auth, req) => {
    const url = req.nextUrl.clone();

    // If user is logged in and tries to access auth pages, redirect to home
    if (auth.userId && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    
    // If user is not logged in and tries to access a protected route (besides home/properties)
    if (!auth.userId && !auth.isPublicRoute) {
      // Redirect them to the sign-in page
      url.pathname = '/sign-in';
      return NextResponse.redirect(url);
    }

    // Allow the request to proceed otherwise
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 
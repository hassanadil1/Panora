import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

// Define the public routes
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/properties(.*)"
]);

// This uses clerkMiddleware instead of authMiddleware
export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl.clone();
  
  // If user is logged in and tries to access auth pages, redirect to home
  if (await auth().userId && (url.pathname === '/sign-in' || url.pathname === '/sign-up')) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  // If user is not logged in and tries to access a protected route (besides public routes)
  if (!await auth().userId && !isPublicRoute(req)) {
    // Redirect them to the sign-in page
    url.pathname = '/sign-in';
    return NextResponse.redirect(url);
  }

  // Allow the request to proceed otherwise
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|mp4|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}; 
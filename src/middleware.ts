import { authMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from "next/server";

// Define the protected routes that require authentication
const protectedRoutes = [
  '/properties/(.*)',
  '/residences/(.*)',
  '/favorites/(.*)',
  '/profile/(.*)',
  '/dashboard/(.*)',
];

export default authMiddleware({
  // Allow all routes by default
  publicRoutes: (req) => {
    // Check if the URL path matches any protected route pattern
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(pattern => {
      // Convert the pattern to a regex
      const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
      return regex.test(path);
    });

    // If not a protected route, it's public
    return !isProtectedRoute;
  },
  
  // Routes that can always be accessed, no auth info needed
  ignoredRoutes: [
    '/api/webhooks/clerk'
  ],
  
  // Custom function to handle middleware authentication
  afterAuth(auth, req) {
    // If the user is not signed in and trying to access a private route,
    // redirect them to the sign-in page
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files with extensions (.png, .jpg, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't need authentication (like login, reset password)
const publicRoutes = ['/login', '/register', '/api/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Retrieve token from cookies 
  const token = request.cookies.get('token')?.value;

  // If there's no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    // You can also pass the originally requested URL as a query param to redirect back after login
    loginUrl.searchParams.set('redirectUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pass control to the requested route
  return NextResponse.next();
}

// Ensure the middleware runs on restricted paths, for example, the main app routes
export const config = {
  matcher: [
    '/browse/:path*',
    '/upload/:path*',
    '/dashboard/:path*',
    '/settings/:path*'
  ],
};

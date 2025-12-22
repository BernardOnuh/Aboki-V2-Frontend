// ============= middleware.ts (Create in root directory) =============
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow these routes without PWA check
  const allowedRoutes = [
    '/install',
    '/_next',
    '/api',
    '/manifest.json',
    '/sw.js',
    '/favicon.ico',
  ];

  // Check if the route should bypass PWA check
  const shouldBypass = allowedRoutes.some(route => pathname.startsWith(route)) ||
                       pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/);

  if (shouldBypass) {
    return NextResponse.next();
  }

  // Check if request is from PWA (standalone mode)
  const userAgent = request.headers.get('user-agent') || '';
  const secFetchDest = request.headers.get('sec-fetch-dest');
  const secFetchMode = request.headers.get('sec-fetch-mode');
  
  // Indicators that it might be PWA
  const isPWARequest = 
    userAgent.includes('wv') || // WebView
    secFetchMode === 'navigate' ||
    request.headers.get('x-requested-with') === 'com.android.browser';

  // Check for standalone query param (set by PWA)
  const url = request.nextUrl.clone();
  const isStandalone = url.searchParams.has('pwa') || url.searchParams.has('standalone');

  // If not from PWA and not already on install page, redirect to install
  if (!isPWARequest && !isStandalone && pathname !== '/install') {
    // Store the original URL to redirect after install
    const redirectUrl = url.clone();
    redirectUrl.pathname = '/install';
    redirectUrl.searchParams.set('redirect', pathname);
    
    console.log('🚫 Browser access detected, redirecting to /install');
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files with extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
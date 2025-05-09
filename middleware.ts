import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  console.log(`[Middleware] Request: ${request.method} ${request.nextUrl.pathname}`);
  console.log(`[Middleware] Search params: ${request.nextUrl.search}`);
  
  // Pokračovat k další middleware nebo k samotné aplikaci
  return NextResponse.next();
}

// Konfigurace na jaké cesty se middleware aplikuje
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ],
}; 
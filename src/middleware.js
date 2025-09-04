import { NextResponse } from 'next/server';

export function middleware(request) {
  // معالجة CORS لـ Geidea
  if (request.nextUrl.pathname.startsWith('/api/geidea/')) {
    const response = NextResponse.next();
    
    // إضافة headers لـ CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Correlation-ID');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // معالجة preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }

  // معالجة CORS لـ Upload API
  if (request.nextUrl.pathname.startsWith('/api/upload/')) {
    const response = NextResponse.next();
    
    // إضافة headers لـ CORS
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // معالجة preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }
  
  // لا نضبط CSP هنا لتفادي التعارض مع الرؤوس المُدارة من next.config.js
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/geidea/:path*',
    '/api/upload/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 

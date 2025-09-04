import { NextRequest, NextResponse } from 'next/server';

// Known broken image patterns
const BROKEN_IMAGE_PATTERNS = [
  'test-url.com',
  'example.com',
  'placeholder.com',
  'fake-image',
  'dummy-image',
  'undefined',
  'null',
  '[object Object]',
  '/avatars/undefined/',
  '/avatars/null/',
  '/avatars//',
];

// Check if image URL is broken
const isBrokenImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return true;
  
  // Prevent redirect loops by allowing default images to pass through
  if (url.includes('default-avatar.png') || 
      url.includes('club-avatar.png') || 
      url.includes('agent-avatar.png')) {
    return false;
  }
  
  return BROKEN_IMAGE_PATTERNS.some(pattern => url.includes(pattern)) ||
         url.length < 10 ||
         !url.startsWith('http') && !url.startsWith('/');
};

// Image middleware handler
export function imageFilterMiddleware(request: NextRequest) {
  try {
    const { pathname, searchParams } = request.nextUrl;
    
    // Handle Next.js image optimization requests
    if (pathname.startsWith('/_next/image')) {
      const imageUrl = searchParams.get('url');
      
      if (imageUrl) {
        const decodedUrl = decodeURIComponent(imageUrl);
        
        // Only redirect if it's not already a fallback image
        if (isBrokenImageUrl(decodedUrl) && !decodedUrl.includes('default-avatar.png')) {
          console.warn('🚨 Blocked broken image URL:', decodedUrl);
          
          // Create default image URL
          const defaultImageUrl = new URL(request.nextUrl);
          defaultImageUrl.searchParams.set('url', '/default-avatar.png');
          defaultImageUrl.searchParams.set('w', '96');
          defaultImageUrl.searchParams.set('q', '75');
          
          return NextResponse.redirect(defaultImageUrl);
        }
      }
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Image filter middleware error:', error);
    // في حالة حدوث خطأ، نمرر الطلب كما هو
    return NextResponse.next();
  }
}

export default imageFilterMiddleware; 

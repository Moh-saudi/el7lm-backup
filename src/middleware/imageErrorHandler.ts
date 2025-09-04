/**
 * معالج أخطاء الصور لـ Next.js
 * Image Error Handler Middleware
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * معالج أخطاء تحسين الصور
 * يتعامل مع الصور المكسورة ويوجه إلى fallback
 */
export function imageErrorHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');
    
    // If no image URL provided
    if (!imageUrl) {
      return NextResponse.redirect(new URL('/default-avatar.png', request.url));
    }
    
    // Check blocked domains
    const blockedDomains = [
      'test-url.com',
      'example.com',
      'placeholder.com',
      'undefined',
      'null',
      '[object Object]',
      '/avatars/undefined/',
      '/avatars/null/',
      '/avatars//',
    ];
    
    // Prevent redirect loops by allowing default images
    if (imageUrl.includes('default-avatar.png') || 
        imageUrl.includes('club-avatar.png') || 
        imageUrl.includes('agent-avatar.png')) {
      return NextResponse.next();
    }
    
    const isBlocked = blockedDomains.some(domain => imageUrl.includes(domain));
    
    if (isBlocked) {
      console.warn(`Blocked image URL: ${imageUrl}`);
      return NextResponse.redirect(new URL('/default-avatar.png', request.url));
    }
    
    // Allow valid images to pass through
    return NextResponse.next();
  } catch (error) {
    console.error('Image error handler error:', error);
    // في حالة حدوث خطأ، نمرر الطلب كما هو
    return NextResponse.next();
  }
}

/**
 * فحص إضافي للصور المكسورة
 */
export async function validateImageResponse(imageUrl: string): Promise<boolean> {
  try {
    // Skip validation for default images
    if (imageUrl.includes('default-avatar.png') || 
        imageUrl.includes('club-avatar.png') || 
        imageUrl.includes('agent-avatar.png')) {
      return true;
    }

    const response = await fetch(imageUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000) // timeout after 5 seconds
    });
    
    return response.ok && (response.headers.get('content-type')?.startsWith('image/') ?? false);
  } catch (error) {
    console.warn(`Image validation failed: ${imageUrl}`, error);
    return false;
  }
}

/**
 * تنظيف headers للصور المحسنة
 */
export function sanitizeImageHeaders(headers: Headers): Headers {
  try {
    const cleanHeaders = new Headers();
    
    // نسخ headers الضرورية فقط
    const allowedHeaders = [
      'cache-control',
      'content-type',
      'content-length',
      'etag',
      'last-modified',
      'date'
    ];
    
    allowedHeaders.forEach(header => {
      const value = headers.get(header);
      if (value) {
        cleanHeaders.set(header, value);
      }
    });
    
    // إضافة headers للأمان
    cleanHeaders.set('x-content-type-options', 'nosniff');
    cleanHeaders.set('cache-control', 'public, max-age=31536000, immutable');
    
    return cleanHeaders;
  } catch (error) {
    console.error('Sanitize headers error:', error);
    return new Headers();
  }
} 

import { initializeFirebaseAdmin, getAdminDb } from '@/lib/firebase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

// دالة لتطبيع رقم الهاتف
function normalizePhoneNumber(phone: string): string[] {
  // إزالة جميع الرموز غير الرقمية
  let cleaned = phone.replace(/[^\d]/g, '');
  
  // إزالة الصفر من البداية إذا كان موجوداً
  cleaned = cleaned.replace(/^0+/, '');
  
  // إنشاء قائمة بالتنسيقات المحتملة
  const formats = [cleaned];
  
  // إذا كان الرقم يبدأ بـ 974 (كود قطر)، أضف تنسيق بدون الكود
  if (cleaned.startsWith('974') && cleaned.length > 9) {
    formats.push(cleaned.substring(3));
  }
  
  // إذا كان الرقم لا يبدأ بـ 974، أضف تنسيق مع الكود
  if (!cleaned.startsWith('974') && cleaned.length <= 9) {
    formats.push('974' + cleaned);
  }
  
  // إزالة التكرار
  return [...new Set(formats)];
}

export async function POST(request: NextRequest) {
  let email, phone;
  try {
    // rate limit by IP
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`auth:check:${clientIp}`, { windowMs: 60_000, max: 60 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    const body = await request.json();
    email = body.email;
    phone = body.phone;
  } catch (err) {
    return NextResponse.json({
      error: 'يرجى إرسال البيانات بصيغة JSON صحيحة (مثال: { "phone": "..." })',
        emailExists: false,
        phoneExists: false 
    }, { status: 400 });
  }
  
  try {
    let emailExists = false;
    let phoneExists = false;
    
    console.log('🔍 Checking user exists:', { email, phone });
    
    // تهيئة Firebase Admin أولاً
        initializeFirebaseAdmin();
        
        // استخدام Firebase Admin للوصول إلى Firestore
        const db = getAdminDb();
        console.log('✅ Firestore instance created successfully');
        
    // قائمة جميع collections للبحث فيها
    const collections = ['users', 'clubs', 'players', 'academies', 'agents', 'trainers'];
    
    // دالة للبحث مع timeout
    const searchWithTimeout = async (collectionName: string, field: string, value: string) => {
      try {
        const query = await Promise.race([
          db.collection(collectionName).where(field, '==', value).limit(1).get(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]);
        return { collectionName, found: !query.empty };
      } catch (error) {
        console.log(`⚠️ Timeout or error searching ${collectionName}:`, error.message);
        return { collectionName, found: false };
      }
    };
    
    // البحث عن المستخدم بالبريد الإلكتروني (متوازي)
        if (email) {
      console.log('📧 Starting parallel email search...');
      const emailPromises = collections.map(collection => 
        searchWithTimeout(collection, 'email', email)
      );
      
      const emailResults = await Promise.all(emailPromises);
      emailExists = emailResults.some(result => result.found);
      
      if (emailExists) {
        const foundIn = emailResults.find(result => result.found)?.collectionName;
        console.log(`📧 Email found in ${foundIn}:`, emailExists);
      }
          console.log('📧 Email check result:', emailExists);
        }
        
    // البحث عن المستخدم برقم الهاتف (متوازي)
        if (phone) {
      console.log('📱 Starting parallel phone search...');
      
      // تطبيع الرقم للحصول على جميع التنسيقات المحتملة
      const phoneFormats = normalizePhoneNumber(phone);
      console.log('📱 Phone formats to search:', phoneFormats);
      
      // البحث في جميع التنسيقات
      const allPhonePromises = [];
      
      for (const collectionName of collections) {
        for (const phoneFormat of phoneFormats) {
          allPhonePromises.push(
            searchWithTimeout(collectionName, 'phone', phoneFormat)
          );
        }
      }
      
      const phoneResults = await Promise.all(allPhonePromises);
      phoneExists = phoneResults.some(result => result.found);
      
      if (phoneExists) {
        const foundResult = phoneResults.find(result => result.found);
        console.log(`📱 Phone found in ${foundResult?.collectionName}:`, phoneExists);
      }
      console.log('📱 Phone check result:', phoneExists);
    }
    
    console.log('✅ User existence check completed:', { emailExists, phoneExists });
    
    return NextResponse.json({ 
      emailExists,
      phoneExists,
      message: 'User existence check completed successfully'
    });
    
  } catch (error) {
    console.error('❌ Error checking user existence:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        emailExists: false,
        phoneExists: false 
      },
      { status: 500 }
    );
  }
} 

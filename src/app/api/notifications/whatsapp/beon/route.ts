import { NextRequest, NextResponse } from 'next/server';

// تخزين مؤقت للطلبات لمنع الإرسال المتكرر
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ بين الطلبات

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp, name, type = 'whatsapp' } = body;

    console.log('📱 BeOn WhatsApp OTP Request:', { phone, name, type });

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
    }

    // حماية ضد الإرسال المتكرر
    const now = Date.now();
    const cacheKey = phone;
    const cachedRequest = requestCache.get(cacheKey);
    
    if (cachedRequest) {
      const timeDiff = now - cachedRequest.timestamp;
      const lastRequestDiff = now - cachedRequest.lastRequest;
      
      // التحقق من الفاصل الزمني الأدنى بين الطلبات
      if (lastRequestDiff < MIN_INTERVAL_BETWEEN_REQUESTS) {
        console.log('🛑 Too frequent requests for:', phone, 'last request was', lastRequestDiff, 'ms ago');
        return NextResponse.json(
          { 
            success: false, 
            error: 'يرجى الانتظار 5 ثوانٍ قبل إرسال طلب جديد' 
          },
          { status: 429 }
        );
      }
      
      // إذا كان الطلب في آخر دقيقة
      if (timeDiff < CACHE_DURATION) {
        if (cachedRequest.count >= MAX_REQUESTS_PER_MINUTE) {
          console.log('🛑 Rate limit exceeded for:', phone);
          return NextResponse.json(
            { 
              success: false, 
              error: 'تم تجاوز الحد الأقصى للطلبات. يرجى الانتظار دقيقة واحدة قبل المحاولة مرة أخرى.' 
            },
            { status: 429 }
          );
        }
        
        // زيادة العداد
        cachedRequest.count++;
        cachedRequest.lastRequest = now;
        requestCache.set(cacheKey, cachedRequest);
      } else {
        // إعادة تعيين العداد بعد انتهاء المدة
        requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
      }
    } else {
      // أول طلب لهذا الرقم
      requestCache.set(cacheKey, { timestamp: now, count: 1, lastRequest: now });
    }

    // تنظيف الكاش القديم
    for (const [key, value] of requestCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        requestCache.delete(key);
      }
    }

    console.log('📱 Rate limit check passed for:', phone);

    // إرسال OTP عبر BeOn API الجديد
    const beonResult = await sendBeOnOTP(phone, name, type);

    if (beonResult.success) {
      console.log('📱 BeOn OTP sent successfully to:', phone);
      
      return NextResponse.json({
        success: true,
        message: beonResult.message || 'تم إرسال رمز التحقق بنجاح',
        phoneNumber: phone,
        otp: beonResult.otp, // OTP المرسل من الخادم
        link: beonResult.link,
        fallback: beonResult.fallback
      });
    } else {
      console.error('❌ Failed to send BeOn OTP:', beonResult.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: beonResult.error || 'فشل في إرسال رمز التحقق' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ BeOn API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في الخادم',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// دالة إرسال OTP عبر BeOn API الجديد
async function sendBeOnOTP(phoneNumber: string, name: string, type: string = 'whatsapp') {
  try {
    const BEON_TOKEN = process.env.BEON_WHATSAPP_TOKEN || 'vSCuMzZwLjDxzR882YphwEgW';

    if (!BEON_TOKEN) {
      console.error('❌ No BeOn token available');
      return { success: false, error: 'BeOn token not configured' };
    }

    console.log('📱 Using BeOn token:', BEON_TOKEN.substring(0, 10) + '...');

    // إنشاء FormData
    const formData = new FormData();
    formData.append('phoneNumber', phoneNumber);
    formData.append('name', name || 'El7lm User');
    formData.append('type', type); // whatsapp أو sms
    formData.append('otp_length', '6');
    formData.append('lang', 'ar');

    console.log('📱 BeOn API request data:', {
      phoneNumber,
      name: name || 'El7lm User',
      type,
      otp_length: 6,
      lang: 'ar'
    });

    const response = await fetch('https://v3.api.beon.chat/api/v3/messages/otp', {
      method: 'POST',
      headers: {
        'beon-token': BEON_TOKEN
      },
      body: formData
    });

    console.log('📱 BeOn API response status:', response.status);
    const result = await response.json();
    console.log('📱 BeOn API response data:', result);

    if (response.ok && result.status === 200) {
      console.log('✅ BeOn OTP sent successfully to:', phoneNumber);
      return { 
        success: true, 
        otp: result.data, // OTP المرسل من الخادم
        message: result.message || 'OTP sent successfully',
        link: result.link // إذا كان هناك رابط WhatsApp
      };
    } else {
      console.error('❌ BeOn OTP sending failed:', result);
      
      // إذا فشل WhatsApp، جرب SMS كبديل
      if (type === 'whatsapp') {
        console.log('📱 Trying SMS fallback...');
        const smsResult = await sendBeOnOTP(phoneNumber, name, 'sms');
        if (smsResult.success) {
          return { 
            success: true, 
            otp: smsResult.otp,
            message: 'تم إرسال رمز التحقق عبر SMS (WhatsApp غير متاح)',
            fallback: true
          };
        }
      }
      
      return { 
        success: false, 
        error: result.message || `HTTP ${response.status}: Failed to send OTP` 
      };
    }
  } catch (error: any) {
    console.error('❌ BeOn OTP sending error:', error);
    return { success: false, error: error.message };
  }
} 

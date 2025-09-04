import { NextRequest, NextResponse } from 'next/server';
import { sendSmartOTP } from '@/lib/whatsapp/smart-otp-service';
import { storeOTP, getOTP } from '../../sms/otp-storage';

// تخزين مؤقت للطلبات لمنع الإرسال المتكرر
const requestCache = new Map<string, { timestamp: number; count: number; lastRequest: number }>();
const CACHE_DURATION = 60000; // دقيقة واحدة
const MAX_REQUESTS_PER_MINUTE = 3;
const MIN_INTERVAL_BETWEEN_REQUESTS = 5000; // 5 ثوانٍ بين الطلبات

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, name, country, countryCode } = body;

    console.log('📱 Smart OTP Request:', { phone, name, country, countryCode });

    if (!phone || !name || !country || !countryCode) {
      return NextResponse.json(
        { success: false, error: 'جميع البيانات مطلوبة (phone, name, country, countryCode)' },
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

    // إرسال OTP باستخدام الخدمة الذكية
    const result = await sendSmartOTP(phone, name, country, countryCode);

    if (result.success) {
      console.log('📱 Smart OTP sent successfully to:', phone);
      
                  // تخزين OTP في نفس المكان الذي يبحث عنه نظام التحقق
            if (result.otp) {
        // تخزين الـ OTP مع تحديد نوع الرسالة الصحيح
        const source = result.method || 'whatsapp';
        await storeOTP(phone, result.otp, source);
        console.log('💾 Smart OTP stored for verification:', phone, result.otp, 'Source:', source);
        
        // فحص فوري للتخزين
        const checkStored = await getOTP(phone);
        if (checkStored) {
          console.log('✅ OTP confirmed stored:', checkStored.otp, 'Source:', checkStored.source);
        } else {
          console.log('❌ OTP storage failed for:', phone);
        }
      } else {
        console.log('❌ No OTP received from service for:', phone);
            }
      
      let responseMessage = result.message || 'تم إرسال رمز التحقق بنجاح';
      
      // إضافة معلومات إضافية حسب نوع الإرسال
      if (result.method === 'both') {
        responseMessage = 'تم إرسال رمز التحقق عبر WhatsApp و SMS (مصر)';
      } else if (result.method === 'whatsapp') {
        responseMessage = 'تم إرسال رمز التحقق عبر WhatsApp';
      } else if (result.method === 'sms') {
        responseMessage = 'تم إرسال رمز التحقق عبر SMS';
      }
      
      return NextResponse.json({
        success: true,
        message: responseMessage,
        phoneNumber: phone,
        otp: result.otp,
        method: result.method,
        country: country,
        fallback: result.fallback
      });
    } else {
      console.error('❌ Failed to send Smart OTP:', result.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'فشل في إرسال رمز التحقق' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Smart OTP API error:', error);
    
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

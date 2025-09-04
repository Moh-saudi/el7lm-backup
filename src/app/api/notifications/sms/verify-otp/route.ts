import { NextRequest, NextResponse } from 'next/server';
import { getOTP, clearOTP, incrementAttempts } from '../../../sms/otp-storage';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Global rate limit per IP
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`sms:verify:${clientIp}`, { windowMs: 60_000, max: 10, minIntervalMs: 1000 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { success: false, error: 'تم تجاوز عدد المحاولات. يرجى المحاولة لاحقاً.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { phoneNumber, otpCode } = body;

    console.log('🔍 Verifying OTP:', { phoneNumber, otpCode: '***' });

    // التحقق من البيانات المطلوبة
    if (!phoneNumber || !otpCode) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف ورمز التحقق مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من وجود OTP مخزن
    const storedOTP = await getOTP(phoneNumber);
    if (!storedOTP) {
      console.log('❌ No OTP found for:', phoneNumber);
      return NextResponse.json(
        { success: false, error: 'لم يتم العثور على رمز تحقق لهذا الرقم' },
        { status: 404 }
      );
    }

    // التحقق من انتهاء صلاحية OTP
    if (storedOTP.expired) {
      console.log('⏰ OTP expired for:', phoneNumber);
      await clearOTP(phoneNumber);
      return NextResponse.json(
        { success: false, error: 'انتهت صلاحية رمز التحقق' },
        { status: 400 }
      );
    }

    // التحقق من عدد المحاولات
    if (storedOTP.attempts >= 3) {
      console.log('🔒 Max attempts reached for:', phoneNumber);
      await clearOTP(phoneNumber);
      return NextResponse.json(
        { success: false, error: 'تم تجاوز الحد الأقصى للمحاولات' },
        { status: 400 }
      );
    }

    // التحقق من صحة OTP
    if (storedOTP.otp !== otpCode) {
      console.log('❌ Invalid OTP for:', phoneNumber);
      await incrementAttempts(phoneNumber);
      return NextResponse.json(
        { success: false, error: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }

    // نجاح التحقق
    console.log('✅ OTP verified successfully for:', phoneNumber);
    await clearOTP(phoneNumber);

    return NextResponse.json({
      success: true,
      message: 'تم التحقق من رمز التحقق بنجاح'
    });

  } catch (error) {
    console.error('❌ Error in OTP verification:', error);
    return NextResponse.json(
      { success: false, error: 'خطأ في التحقق من رمز التحقق' },
      { status: 500 }
    );
  }
}

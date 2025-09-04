import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      phoneNumber,
      name = 'Test',
      otp_length = 6,
      lang = 'ar',
      reference = `ref_${Date.now()}`,
      custom_code = '',
      type = 'sms',
    } = body;

    console.log('📱 BeOn SMS OTP Request:', { phoneNumber, name, otp_length, lang });

    // فحص تكوين BeOn SMS
    console.log('📱 Checking BeOn SMS configuration...');
    const configCheck = {
      BEON_SMS_TOKEN: !!process.env.BEON_SMS_TOKEN,
      BEON_SMS_TOKEN_REGULAR: !!process.env.BEON_SMS_TOKEN_REGULAR,
      BEON_SMS_TOKEN_TEMPLATE: !!process.env.BEON_SMS_TOKEN_TEMPLATE,
      BEON_SMS_TOKEN_BULK: !!process.env.BEON_SMS_TOKEN_BULK,
      BEON_SENDER_NAME: !!process.env.BEON_SENDER_NAME
    };
    console.log('📱 BeOn SMS Config status:', configCheck);

    // التحقق من وجود tokens
    const hasValidTokens = Object.values(configCheck).some(Boolean);
    if (!hasValidTokens) {
      console.error('❌ No BeOn SMS tokens configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'لم يتم تكوين رموز BeOn SMS. يرجى التحقق من متغيرات البيئة.' 
        },
        { status: 500 }
      );
    }

    if (!phoneNumber) {
      return NextResponse.json({ success: false, error: 'phoneNumber is required' }, { status: 400 });
    }

    console.log('📱 Starting BeOn SMS OTP send...');

    // إرسال OTP عبر BeOn SMS
    const beonResult = await sendBeOnSMSOTP(phoneNumber, name, otp_length, lang, reference, custom_code, type);

    if (beonResult.success) {
      console.log('📱 BeOn SMS OTP sent successfully to:', phoneNumber);
      
      return NextResponse.json({
        success: true,
        message: beonResult.message || 'تم إرسال رمز التحقق عبر SMS بنجاح',
        phoneNumber: phoneNumber,
        otp: beonResult.otp, // نرسل OTP في الاستجابة للاختبار فقط
        reference: beonResult.reference
      });
    } else {
      console.error('❌ Failed to send BeOn SMS OTP:', beonResult.error);
      
      return NextResponse.json(
        { 
          success: false, 
          error: beonResult.error || 'فشل في إرسال رمز التحقق عبر SMS' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ BeOn SMS API error:', error);
    console.error('❌ Error stack:', error.stack);
    
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

// دالة إرسال OTP عبر BeOn SMS
async function sendBeOnSMSOTP(phoneNumber: string, name: string, otp_length: number, lang: string, reference: string, custom_code: string, type: string) {
  try {
    // استخدام أول token متاح
    const BEON_SMS_TOKEN = process.env.BEON_SMS_TOKEN || 
                           process.env.BEON_SMS_TOKEN_REGULAR || 
                           process.env.BEON_SMS_TOKEN_TEMPLATE || 
                           process.env.BEON_WHATSAPP_TOKEN;

    if (!BEON_SMS_TOKEN) {
      console.error('❌ No BeOn SMS token available');
      return { success: false, error: 'BeOn SMS token not configured' };
    }

    console.log('📱 Using BeOn token:', BEON_SMS_TOKEN.substring(0, 10) + '...');

    const requestBody = {
      phoneNumber,
      name,
      type,
      otp_length,
      lang,
      reference,
      custom_code
    };

    console.log('📱 BeOn SMS request body:', requestBody);
    console.log('📱 BeOn SMS endpoint: https://beon.chat/api/send/message/otp');

    const response = await fetch('https://beon.chat/api/send/message/otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'beon-token': BEON_SMS_TOKEN
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📱 BeOn SMS response status:', response.status);
    console.log('📱 BeOn SMS response headers:', Object.fromEntries(response.headers.entries()));

    let result;
    try {
      const responseText = await response.text();
      console.log('📱 BeOn SMS response text:', responseText);
      
      if (responseText) {
        result = JSON.parse(responseText);
      } else {
        result = { message: 'Empty response from BeOn API' };
      }
    } catch (parseError) {
      console.error('❌ Failed to parse BeOn SMS response:', parseError);
      result = { message: 'Invalid JSON response from BeOn API' };
    }

    console.log('📱 BeOn SMS API parsed response:', result);

    if (response.ok && result.status === 200) {
      return { 
        success: true, 
        otp: result.data,
        message: result.message || 'OTP sent successfully',
        reference: reference
      };
    } else {
      console.error('❌ BeOn SMS API error response:', result);
      return { 
        success: false, 
        error: result.message || `HTTP ${response.status}: Failed to send OTP via SMS` 
      };
    }
  } catch (error: any) {
    console.error('❌ BeOn SMS API error:', error);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    return { success: false, error: error.message };
  }
} 

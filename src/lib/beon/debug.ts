// دالة تشخيص مشاكل BeOn API
export function debugBeOnAPI() {
  console.log('🔍 === تشخيص BeOn API ===');
  
  // فحص متغيرات البيئة
  const envVars = {
    BEON_API_TOKEN: process.env.BEON_API_TOKEN ? '✅ موجود' : '❌ مفقود',
    BEON_BASE_URL: process.env.BEON_BASE_URL ? '✅ موجود' : '❌ مفقود',
    BEON_SMS_TOKEN: process.env.BEON_SMS_TOKEN ? '✅ موجود' : '❌ مفقود',
    BEON_WHATSAPP_TOKEN: process.env.BEON_WHATSAPP_TOKEN ? '✅ موجود' : '❌ مفقود',
    BEON_OTP_TOKEN: process.env.BEON_OTP_TOKEN ? '✅ موجود' : '❌ مفقود',
    NODE_ENV: process.env.NODE_ENV || '❌ غير محدد',
    ENABLE_SMS_SIMULATION: process.env.ENABLE_SMS_SIMULATION || '❌ غير محدد'
  };
  
  console.log('📋 متغيرات البيئة:', envVars);
  
  // فحص التكوين
  const config = {
    baseUrl: process.env.BEON_BASE_URL || 'https://v3.api.beon.chat',
    smsEndpoint: '/api/send/message/sms',
    whatsappEndpoint: '/api/send/message/whatsapp',
    otpEndpoint: '/api/send/message/otp'
  };
  
  console.log('⚙️ التكوين:', config);
  
  // فحص الشبكة
  const networkInfo = {
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
    location: typeof window !== 'undefined' ? window.location.href : 'Server'
  };
  
  console.log('🌐 معلومات الشبكة:', networkInfo);
  
  console.log('🔍 === انتهاء التشخيص ===');
  
  return {
    envVars,
    config,
    networkInfo
  };
}

// دالة اختبار الاتصال بـ BeOn API
export async function testBeOnConnection() {
  console.log('🧪 === اختبار الاتصال بـ BeOn API ===');
  
  try {
    const baseUrl = process.env.BEON_BASE_URL || 'https://v3.api.beon.chat';
    const token = process.env.BEON_SMS_TOKEN || process.env.BEON_API_TOKEN;
    
    if (!token) {
      console.error('❌ لا يوجد Token للاتصال');
      return { success: false, error: 'No token available' };
    }
    
    // اختبار الاتصال الأساسي
    const response = await fetch(`${baseUrl}/api/send/message/sms`, {
      method: 'POST',
      headers: {
        'beon-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber: '+201000000000', // رقم وهمي للاختبار
        message: 'Test message',
        type: 'sms'
      })
    });
    
    console.log('📡 استجابة API:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const responseText = await response.text();
    console.log('📄 محتوى الاستجابة:', responseText);
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText
    };
    
  } catch (error) {
    console.error('❌ خطأ في اختبار الاتصال:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

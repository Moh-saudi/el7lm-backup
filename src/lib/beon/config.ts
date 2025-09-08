// تكوين BeOn V3 API حسب الوثائق الرسمية المحدثة
export const BEON_CONFIG = {
  // API Integration Token - الـ Token الجديد لـ V3
  TOKENS: {
    // V3 API Token - للجميع
    V3_API: process.env.BEON_V3_TOKEN || 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv',
    // SMS Regular - للرسائل العادية
    SMS_REGULAR: process.env.BEON_SMS_TOKEN || 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv',
    // SMS Template - للرسائل القوالب
    SMS_TEMPLATE: process.env.BEON_SMS_TEMPLATE_TOKEN || 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv',
    // SMS Bulk - للرسائل الجماعية
    SMS_BULK: process.env.BEON_BULK_SMS_TOKEN || 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv',
    // WhatsApp OTP
    WHATSAPP_OTP: process.env.BEON_WHATSAPP_OTP_TOKEN || process.env.BEON_OTP_TOKEN || 'yK1zYZRgjvuVC5wJcmkMwL0zFsRi9BhytEYPXgnzbNCyPFkaJBp9ngjmO6q4',
    // WhatsApp
    WHATSAPP: process.env.BEON_WHATSAPP_TOKEN || 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv'
  },
  
  // API Endpoints حسب الوثائق الرسمية V3
  ENDPOINTS: {
    BASE_URL: process.env.BEON_BASE_URL || 'https://v3.api.beon.chat',
    
    // SMS Regular - للرسائل العادية (endpoint صحيح)
    SMS: '/api/send/message/sms',
    
    // SMS Template - للرسائل القوالب
    SMS_TEMPLATE: '/api/send/message/sms/template',
    
    // SMS Bulk - للرسائل الجماعية
    SMS_BULK: '/api/send/message/sms/bulk',
    
    // WhatsApp OTP
    WHATSAPP_OTP: '/api/send/message/otp',
    
    // WhatsApp
    WHATSAPP: '/api/send/message/whatsapp'
  },
  
  // إعدادات افتراضية
  DEFAULTS: {
    SENDER_NAME: process.env.BEON_SENDER_NAME || 'El7lm',
    LANGUAGE: 'ar',
    OTP_LENGTH: 4,
    CALLBACK_URL: process.env.BEON_CALLBACK_URL || 'http://www.el7lm.com/beon/'
  },
  
  // Headers المطلوبة حسب الوثائق الرسمية V3
  HEADERS: {
    CONTENT_TYPE: 'application/json',
    TOKEN_HEADER: 'beon-token', // ✅ Header الصحيح حسب الوثائق V3
    AUTHORIZATION_HEADER: 'Authorization'
  }
};

// دالة للحصول على Token المناسب حسب نوع الخدمة
export function getBeOnToken(serviceType: 'sms' | 'template' | 'bulk' | 'whatsapp' | 'whatsapp_otp'): string {
  switch (serviceType) {
    case 'sms':
      return BEON_CONFIG.TOKENS.SMS_REGULAR;
    case 'template':
      return BEON_CONFIG.TOKENS.SMS_TEMPLATE;
    case 'bulk':
      return BEON_CONFIG.TOKENS.SMS_BULK;
    case 'whatsapp':
      return BEON_CONFIG.TOKENS.WHATSAPP;
    case 'whatsapp_otp':
      return BEON_CONFIG.TOKENS.WHATSAPP_OTP;
    default:
      return BEON_CONFIG.TOKENS.API_TOKEN;
  }
}

// دالة للحصول على Endpoint المناسب
export function getBeOnEndpoint(serviceType: 'sms' | 'template' | 'bulk' | 'whatsapp' | 'whatsapp_otp'): string {
  switch (serviceType) {
    case 'sms':
      return BEON_CONFIG.ENDPOINTS.SMS;
    case 'template':
      return BEON_CONFIG.ENDPOINTS.SMS_TEMPLATE;
    case 'bulk':
      return BEON_CONFIG.ENDPOINTS.SMS_BULK;
    case 'whatsapp':
      return BEON_CONFIG.ENDPOINTS.WHATSAPP;
    case 'whatsapp_otp':
      return BEON_CONFIG.ENDPOINTS.WHATSAPP_OTP;
    default:
      return BEON_CONFIG.ENDPOINTS.SMS;
  }
}

// دالة إنشاء Headers
export function createBeOnHeaders(token: string): Record<string, string> {
  return {
    'Content-Type': BEON_CONFIG.HEADERS.CONTENT_TYPE,
    'beon-token': token // ✅ Header الصحيح حسب الوثائق V3
  };
}

// دالة التحقق من صحة التكوين
export function validateBeOnConfig(): boolean {
  const requiredTokens = [
    BEON_CONFIG.TOKENS.API_TOKEN,
    BEON_CONFIG.TOKENS.SMS_REGULAR,
    BEON_CONFIG.TOKENS.SMS_TEMPLATE,
    BEON_CONFIG.TOKENS.SMS_BULK
  ];
  
  return requiredTokens.every(token => token && token.length > 0);
}

// دالة طباعة معلومات التكوين للتصحيح
export function logBeOnConfig(): void {
  console.log('🔧 BeOn V3 Configuration:');
  console.log('📱 Base URL:', BEON_CONFIG.ENDPOINTS.BASE_URL);
  console.log('🔑 API Token:', BEON_CONFIG.TOKENS.API_TOKEN.substring(0, 20) + '...');
  console.log('📧 SMS Token:', BEON_CONFIG.TOKENS.SMS_REGULAR.substring(0, 20) + '...');
  console.log('📋 Template Token:', BEON_CONFIG.TOKENS.SMS_TEMPLATE.substring(0, 20) + '...');
  console.log('📦 Bulk Token:', BEON_CONFIG.TOKENS.SMS_BULK.substring(0, 20) + '...');
  console.log('✅ Config Valid:', validateBeOnConfig());
}

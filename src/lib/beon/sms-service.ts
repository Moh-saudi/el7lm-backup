// src/lib/beon/sms-service.ts
import { BEON_CONFIG, getBeOnEndpoint, getBeOnToken } from '@/lib/beon/config';

interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

interface OTPResponse {
  success: boolean;
  otp?: string;
  message?: string;
  error?: string;
}

interface BeOnSMSConfig {
  token: string;
  smsToken: string;
  templateToken: string;
  bulkToken: string;
  baseUrl: string;
  senderName: string;
}

function normalizePhone(countryCode: string, phone: string) {
  const local = phone.replace(/\D/g, '');
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

class BeOnSMSService {
  private config: BeOnSMSConfig;

  constructor() {
    this.config = {
      token: process.env.BEON_SMS_TOKEN || 'SPb4sgedfe', // Token الافتراضي من الوثائق
      smsToken: process.env.BEON_SMS_TOKEN || 'SPb4sgedfe',
      templateToken: process.env.BEON_SMS_TOKEN_TEMPLATE || 'SPb4sbemr5bwb7sjzCqTcL',
      bulkToken: process.env.BEON_SMS_TOKEN_BULK || 'nzQ7ytW8q6yfQdJRFM57yRfR',
      baseUrl: process.env.BEON_BASE_URL || 'https://beon.chat/api',
      senderName: process.env.BEON_SENDER_NAME || 'el7lm'
    };
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    console.log('🔍 Validating SMS config...');
    console.log('🔍 SMS Token:', this.config.smsToken ? '✅ Set' : '❌ Missing');
    console.log('🔍 Template Token:', this.config.templateToken ? '✅ Set' : '❌ Missing');
    console.log('🔍 Bulk Token:', this.config.bulkToken ? '✅ Set' : '❌ Missing');
    console.log('🔍 Base URL:', this.config.baseUrl);
    console.log('🔍 Sender Name:', this.config.senderName);

    return true;
  }

  // إرسال SMS عادي - حسب الوثائق الرسمية
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
    console.log('📱 sendSMS called with:', { phoneNumber, messageLength: message.length });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const requestBody = {
        name: this.config.senderName,
        phoneNumber: phoneNumber,
        message: message
      };
      
      const url = `${BEON_CONFIG.ENDPOINTS.BASE_URL}${getBeOnEndpoint('sms')}`;
      const token = getBeOnToken('sms');
      console.log('📱 SMS request body:', requestBody);
      console.log('📱 SMS endpoint:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': token // ✅ Header الصحيح حسب وثائق V3
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ SMS sent successfully to:', phoneNumber);
        return { success: true, message: 'SMS sent successfully' };
      } else {
        console.error('❌ SMS sending failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال OTP عبر SMS Template - حسب الوثائق الرسمية
  async sendOTP(phoneNumber: string, templateId: number, otp: string, name?: string): Promise<OTPResponse> {
    console.log('📱 sendOTP called with:', { phoneNumber, templateId, otp, name });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const requestBody = {
        template_id: templateId,
        phoneNumber: phoneNumber,
        name: name || this.config.senderName,
        vars: [otp] // OTP كمتغير أول
      };
      
      const url = `${BEON_CONFIG.ENDPOINTS.BASE_URL}${getBeOnEndpoint('template')}`;
      const token = getBeOnToken('template');
      console.log('📱 SMS Template request body:', requestBody);
      console.log('📱 SMS Template endpoint:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': token // ✅ Header الصحيح حسب وثائق V3
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS Template response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ SMS OTP sent successfully to:', phoneNumber);
        return { success: true, otp: otp, message: 'SMS OTP sent successfully' };
      } else {
        console.error('❌ SMS OTP sending failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS OTP sending error:', error);
      return { success: false, error: error.message };
    }
  }

  // إرسال OTP عبر واجهة V3 الجديدة (multipart/form-data)
  async sendOTPNew(phoneNumber: string, name: string | undefined, otpLength: number = 4, lang: string = 'ar'): Promise<OTPResponse> {
    try {
      // استخدم إعدادات V3 من BEON_CONFIG مباشرة لضمان صحة الـ URL والـ token
      const { BEON_CONFIG } = await import('@/lib/beon/config');
      const token = BEON_CONFIG.TOKENS.WHATSAPP_OTP || this.config.templateToken || this.config.smsToken;
      const url = `${BEON_CONFIG.ENDPOINTS.BASE_URL}${BEON_CONFIG.ENDPOINTS.WHATSAPP_OTP}`;

      // صياغة الرقم بتنسيق E.164 مع علامة + كما في نموذج المزود
      const toE164Egypt = (phone: string): string => {
        let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
        if (cleaned.startsWith('+')) {
          return cleaned;
        }
        const digits = cleaned.replace(/\D/g, '');
        if (digits.startsWith('0')) return '+20' + digits.substring(1);
        if (digits.startsWith('20')) return '+' + digits;
        if (digits.length === 11 && digits.startsWith('01')) return '+20' + digits.substring(1);
        if (digits.length === 10 && digits.startsWith('1')) return '+20' + digits;
        return '+' + digits;
      };

      const e164Phone = toE164Egypt(phoneNumber);

      const form = new FormData();
      form.append('phoneNumber', e164Phone);
      if (name) form.append('name', name);
      form.append('type', 'sms');
      form.append('otp_length', String(otpLength || 4));
      form.append('lang', lang || 'ar');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'beon-token': token
          // لا نحدد Content-Type يدوياً كي يضبط fetch الـ boundary تلقائياً
        },
        body: form as any
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      // الوثيقة تشير لرجوع JSON يحوي status/message/data
      let data: any = null;
      try { data = await response.json(); } catch {}
      const otp = data?.data ? String(data.data) : undefined;
      return { success: true, otp, message: data?.message || 'otp send' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'OTP sending failed' };
    }
  }

  // إرسال SMS Bulk - حسب الوثائق الرسمية
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<SMSResponse> {
    console.log('📱 sendBulkSMS called with:', { phoneNumbersCount: phoneNumbers.length, messageLength: message.length });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'SMS configuration is missing' };
    }

    try {
      const requestBody = {
        phoneNumbers: phoneNumbers,
        message: message
      };
      
      const url = `${BEON_CONFIG.ENDPOINTS.BASE_URL}${getBeOnEndpoint('bulk')}`;
      const token = getBeOnToken('bulk');
      console.log('📱 SMS Bulk request body:', requestBody);
      console.log('📱 SMS Bulk endpoint:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'beon-token': token // ✅ Header الصحيح حسب وثائق V3
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS Bulk response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ SMS Bulk sent successfully to:', phoneNumbers.length, 'numbers');
        return { success: true, message: `SMS Bulk sent successfully to ${phoneNumbers.length} numbers` };
      } else {
        console.error('❌ SMS Bulk sending failed:', response.status, response.statusText);
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error: any) {
      console.error('❌ SMS Bulk sending error:', error);
      return { success: false, error: error.message };
    }
  }
}

export default BeOnSMSService;

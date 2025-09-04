import { BEON_CONFIG, getBeOnToken, getBeOnEndpoint, createBeOnHeaders } from './config';

interface WhatsAppResponse {
  success: boolean;
  message?: string;
  error?: string;
  method?: 'whatsapp' | 'sms';
}

interface OTPResponse {
  success: boolean;
  otp?: string;
  message?: string;
  error?: string;
  method?: 'whatsapp' | 'sms';
}

class BeOnWhatsAppService {
  private baseUrl: string;
  private token: string;
  private senderName: string;

  constructor() {
    this.baseUrl = BEON_CONFIG.ENDPOINTS.BASE_URL;
    this.token = getBeOnToken('whatsapp');
    this.senderName = BEON_CONFIG.DEFAULTS.SENDER_NAME;
  }

  // التحقق من صحة التكوين
  private validateConfig(): boolean {
    console.log('🔍 Validating WhatsApp config...');
    console.log('🔍 Base URL:', this.baseUrl);
    console.log('🔍 Token:', this.token ? '✅ Set' : '❌ Missing');
    console.log('🔍 Sender Name:', this.senderName);
    
    return !!this.token;
  }

  // إرسال رسالة WhatsApp عادية
  async sendMessage(phoneNumber: string, message: string): Promise<WhatsAppResponse> {
    console.log('📱 sendMessage called with:', { phoneNumber, messageLength: message.length });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'WhatsApp configuration is missing' };
    }

    try {
      const requestBody = {
        name: this.senderName,
        phoneNumber: phoneNumber,
        message: message
      };
      
      console.log('📱 WhatsApp request body:', requestBody);
      console.log('📱 WhatsApp endpoint:', `${this.baseUrl}${getBeOnEndpoint('whatsapp')}`);

      const response = await fetch(`${this.baseUrl}${getBeOnEndpoint('whatsapp')}`, {
        method: 'POST',
        headers: createBeOnHeaders(this.token),
        body: JSON.stringify(requestBody)
      });

      console.log('📱 WhatsApp response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ WhatsApp message sent successfully to:', phoneNumber);
        return { 
          success: true, 
          message: 'WhatsApp message sent successfully',
          method: 'whatsapp'
        };
      } else {
        console.error('❌ WhatsApp sending failed:', response.status, response.statusText);
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          method: 'whatsapp'
        };
      }
    } catch (error: any) {
      console.error('❌ WhatsApp sending error:', error);
      return { success: false, error: error.message, method: 'whatsapp' };
    }
  }

  // إرسال OTP عبر WhatsApp
  async sendOTP(phoneNumber: string, otp: string, name?: string): Promise<OTPResponse> {
    console.log('📱 sendOTP called with:', { phoneNumber, otp, name });
    
    if (!this.validateConfig()) {
      return { success: false, error: 'WhatsApp configuration is missing' };
    }

    try {
      // إنشاء رسالة OTP
      const message = this.createOTPMessage(otp, name);
      
      const requestBody = {
        name: name || this.senderName,
        phoneNumber: phoneNumber,
        message: message
      };
      
      console.log('📱 WhatsApp OTP request body:', requestBody);
      console.log('📱 WhatsApp OTP endpoint:', `${this.baseUrl}${getBeOnEndpoint('whatsapp')}`);

      const response = await fetch(`${this.baseUrl}${getBeOnEndpoint('whatsapp')}`, {
        method: 'POST',
        headers: createBeOnHeaders(this.token),
        body: JSON.stringify(requestBody)
      });

      console.log('📱 WhatsApp OTP response status:', response.status);

      // BeOn API لا يرجع response body حسب الوثائق
      if (response.ok) {
        console.log('✅ WhatsApp OTP sent successfully to:', phoneNumber);
        return { 
          success: true, 
          otp: otp,
          message: 'WhatsApp OTP sent successfully',
          method: 'whatsapp'
        };
      } else {
        console.error('❌ WhatsApp OTP sending failed:', response.status, response.statusText);
        
        // إذا فشل WhatsApp، جرب SMS كبديل
        console.log('📱 Trying SMS fallback...');
        const smsResult = await this.sendOTPViaSMS(phoneNumber, otp, name);
        if (smsResult.success) {
          return { 
            success: true, 
            otp: smsResult.otp,
            message: 'تم إرسال رمز التحقق عبر SMS (WhatsApp غير متاح)',
            method: 'sms',
            fallback: true
          };
        }
        
        return { 
          success: false, 
          error: `HTTP ${response.status}: ${response.statusText}`,
          method: 'whatsapp'
        };
      }
    } catch (error: any) {
      console.error('❌ WhatsApp OTP sending error:', error);
      return { success: false, error: error.message, method: 'whatsapp' };
    }
  }

  // إرسال OTP عبر SMS كبديل
  private async sendOTPViaSMS(phoneNumber: string, otp: string, name?: string): Promise<OTPResponse> {
    try {
      const message = this.createOTPMessage(otp, name);
      
      const requestBody = {
        name: name || this.senderName,
        phoneNumber: phoneNumber,
        message: message
      };
      
      console.log('📱 SMS fallback request body:', requestBody);
      console.log('📱 SMS fallback endpoint:', `${this.baseUrl}${getBeOnEndpoint('sms')}`);

      const response = await fetch(`${this.baseUrl}${getBeOnEndpoint('sms')}`, {
        method: 'POST',
        headers: createBeOnHeaders(getBeOnToken('sms')),
        body: JSON.stringify(requestBody)
      });

      console.log('📱 SMS fallback response status:', response.status);

      if (response.ok) {
        console.log('✅ SMS OTP sent successfully to:', phoneNumber);
        return { 
          success: true, 
          otp: otp,
          message: 'SMS OTP sent successfully',
          method: 'sms'
        };
      } else {
        console.error('❌ SMS fallback failed:', response.status, response.statusText);
        return { 
          success: false, 
          error: `SMS fallback failed: ${response.status} ${response.statusText}`,
          method: 'sms'
        };
      }
    } catch (error: any) {
      console.error('❌ SMS fallback error:', error);
      return { success: false, error: error.message, method: 'sms' };
    }
  }

  // إنشاء رسالة OTP
  private createOTPMessage(otp: string, name?: string): string {
    return `مرحباً ${name || 'عزيزي'}!

رمز التحقق الخاص بك هو:
*${otp}*

لا تشارك هذا الرمز مع أي شخص.

el7lm Team`;
  }
}

export default BeOnWhatsAppService;

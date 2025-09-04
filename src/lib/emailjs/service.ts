import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG, OTPManager } from './config';

export interface EmailServiceResult {
  success: boolean;
  message: string;
  otp?: string;
}

export class EmailService {
  private static instance: EmailService;
  private config = {
    publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
    serviceId: EMAILJS_CONFIG.SERVICE_ID,
    templateId: EMAILJS_CONFIG.TEMPLATE_ID,
  };

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // التحقق من حالة الإعدادات
  static getConfigurationStatus() {
    const service = EmailService.getInstance();
    return {
      publicKey: !!service.config.publicKey && service.config.publicKey !== 'your_public_key',
      serviceId: !!service.config.serviceId && service.config.serviceId !== 'your_service_id',
      templateId: !!service.config.templateId && service.config.templateId !== 'your_template_id',
    };
  }

  // التحقق من اكتمال الإعدادات
  static isConfigured(): boolean {
    const status = this.getConfigurationStatus();
    return status.publicKey && status.serviceId && status.templateId;
  }

  // تحديث الإعدادات
  static updateConfiguration(newConfig: {
    publicKey: string;
    serviceId: string;
    templateId: string;
  }) {
    const service = EmailService.getInstance();
    service.config = { ...newConfig };

    // حفظ في localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('emailjs_config', JSON.stringify(newConfig));
    }

    // تحديث متغيرات البيئة (في الذاكرة فقط)
    if (typeof window !== 'undefined') {
      (window as any).__EMAILJS_CONFIG__ = newConfig;
    }
  }

  // إرسال OTP
  static async sendOTP(email: string, name: string): Promise<EmailServiceResult> {
    const service = EmailService.getInstance();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'إعدادات EmailJS غير مكتملة. يرجى إكمال الإعدادات أولاً.'
      };
    }

    try {
      // إنشاء OTP جديد
      const { otp, expiry } = OTPManager.createOTP();
      
      // حفظ OTP في التخزين المحلي
      OTPManager.storeOTP(otp, expiry);
      OTPManager.storeEmail(email);

      // إعداد بيانات القالب
      const templateParams = {
        user_name: name,
        otp_code: otp,
        email: email,
        to_email: email,
        platform_name: 'el7lm',
support_email: 'info@el7lm.com'
      };

      // إرسال البريد الإلكتروني
      const result = await emailjs.send(
        service.config.serviceId,
        service.config.templateId,
        templateParams,
        service.config.publicKey
      );

      if (result.status === 200) {
        return {
          success: true,
          message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح!',
          otp: otp // في الإنتاج، لا نرسل OTP في الاستجابة
        };
      } else {
        return {
          success: false,
          message: 'فشل في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.'
        };
      }
    } catch (error: any) {
      console.error('خطأ في إرسال OTP:', error);
      
      // مسح OTP في حالة الفشل
      OTPManager.clearOTP();
      
      return {
        success: false,
        message: `خطأ في إرسال البريد الإلكتروني: ${error.message || 'خطأ غير معروف'}`
      };
    }
  }

  // التحقق من OTP
  static verifyOTP(inputOTP: string): EmailServiceResult {
    if (!OTPManager.validateOTP(inputOTP)) {
      return {
        success: false,
        message: 'رمز التحقق غير صحيح أو منتهي الصلاحية.'
      };
    }

    // مسح OTP بعد التحقق الناجح
    OTPManager.clearOTP();

    return {
      success: true,
      message: 'تم التحقق من البريد الإلكتروني بنجاح!'
    };
  }

  // إرسال بريد ترحيب
  static async sendWelcomeEmail(email: string, name: string): Promise<EmailServiceResult> {
    const service = EmailService.getInstance();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'إعدادات EmailJS غير مكتملة.'
      };
    }

    try {
      const templateParams = {
        user_name: name,
        email: email,
        to_email: email,
        platform_name: 'el7lm',
        support_email: 'info@el7lm.com'
      };

      const result = await emailjs.send(
        service.config.serviceId,
        'template_welcome', // قالب الترحيب
        templateParams,
        service.config.publicKey
      );

      if (result.status === 200) {
        return {
          success: true,
          message: 'تم إرسال بريد الترحيب بنجاح!'
        };
      } else {
        return {
          success: false,
          message: 'فشل في إرسال بريد الترحيب.'
        };
      }
    } catch (error: any) {
      console.error('خطأ في إرسال بريد الترحيب:', error);
      return {
        success: false,
        message: `خطأ في إرسال بريد الترحيب: ${error.message || 'خطأ غير معروف'}`
      };
    }
  }

  // إرسال بريد إعادة تعيين كلمة المرور
  static async sendPasswordResetEmail(email: string, name: string, resetLink: string): Promise<EmailServiceResult> {
    const service = EmailService.getInstance();
    
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'إعدادات EmailJS غير مكتملة.'
      };
    }

    try {
      const templateParams = {
        user_name: name,
        email: email,
        to_email: email,
        reset_link: resetLink,
        platform_name: 'el7lm',
        support_email: 'info@el7lm.com'
      };

      const result = await emailjs.send(
        service.config.serviceId,
        'template_password_reset', // قالب إعادة تعيين كلمة المرور
        templateParams,
        service.config.publicKey
      );

      if (result.status === 200) {
        return {
          success: true,
          message: 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح!'
        };
      } else {
        return {
          success: false,
          message: 'فشل في إرسال رابط إعادة تعيين كلمة المرور.'
        };
      }
    } catch (error: any) {
      console.error('خطأ في إرسال بريد إعادة تعيين كلمة المرور:', error);
      return {
        success: false,
        message: `خطأ في إرسال بريد إعادة تعيين كلمة المرور: ${error.message || 'خطأ غير معروف'}`
      };
    }
  }

  // اختبار الاتصال
  static async testConnection(): Promise<EmailServiceResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'إعدادات EmailJS غير مكتملة.'
      };
    }

    try {
      const testEmail = 'test@example.com';
      const testName = 'Test User';
      
      const result = await this.sendOTP(testEmail, testName);
      
      if (result.success) {
        // مسح OTP التجريبي
        OTPManager.clearOTP();
        return {
          success: true,
          message: 'تم اختبار الاتصال بنجاح!'
        };
      } else {
        return result;
      }
    } catch (error: any) {
      return {
        success: false,
        message: `خطأ في اختبار الاتصال: ${error.message || 'خطأ غير معروف'}`
      };
    }
  }
}

// تصدير نسخة افتراضية للاستخدام المباشر
export const emailService = EmailService.getInstance(); 

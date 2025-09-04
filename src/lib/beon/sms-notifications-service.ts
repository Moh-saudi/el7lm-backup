// BeOn SMS Notifications Service - للإشعارات العامة
// منفصل عن OTP لتجنب التضارب

interface SMSResponse {
  success: boolean;
  message?: string;
  error?: string;
  messageId?: string;
}

class BeOnSMSNotificationsService {
  private baseUrl: string;
  private token: string;
  private senderName: string;

  constructor() {
    // استخدام OTP API للإشعارات (يعمل مع public sender)
    this.baseUrl = 'https://beon.chat/api/send/message/otp';
    this.token = process.env.BEON_SMS_TOKEN || 'vSCuMzZwLjDxzR882YphwEgW';
    this.senderName = process.env.BEON_SENDER_NAME || 'El7lm25 Notifications';
  }

  // إرسال SMS للإشعارات
  async sendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
    try {
      console.log('📱 Sending SMS notification to:', phoneNumber);
      console.log('📱 API URL:', this.baseUrl);
      console.log('📱 Token:', this.token);
      
      const requestBody = {
        phoneNumber: phoneNumber,
        message: message
      };
      
      console.log('📱 Request body:', requestBody);
      
      // تجربة headers مختلفة
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // استخدام header الصحيح للـ OTP API
      headers['Authorization'] = `Bearer ${this.token}`;

      console.log('📱 Request headers:', headers);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      console.log('📱 Response status:', response.status);
      console.log('📱 Response headers:', Object.fromEntries(response.headers.entries()));

      // تحقق من نوع المحتوى
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response:', textResponse.substring(0, 500));
        return {
          success: false,
          error: `API returned non-JSON response (${response.status}): ${textResponse.substring(0, 100)}`
        };
      }

      const result = await response.json();
      console.log('📱 SMS API Response:', result);
      console.log('📱 Response status check:', { responseOk: response.ok, resultStatus: result.status });
      console.log('📱 Success check:', { responseOk: response.ok, resultStatus: result.status, isSuccess: response.ok && (result.status === 200 || result.status === 201) });

      // تحقق من نجاح العملية بناءً على الـ response
      if (response.ok && (result.status === 200 || result.status === 201)) {
        return {
          success: true,
          message: 'تم إرسال الإشعار عبر SMS بنجاح',
          messageId: result.data || result.messageId
        };
      } else {
        return {
          success: false,
          error: result.message || result.error || `فشل في إرسال الإشعار عبر SMS (${response.status})`
        };
      }
    } catch (error) {
      console.error('❌ SMS sending error:', error);
      return {
        success: false,
        error: `حدث خطأ في إرسال الإشعار عبر SMS: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // إرسال SMS جماعي
  async sendBulkSMS(phoneNumbers: string[], message: string): Promise<SMSResponse> {
    try {
      console.log('📱 Sending bulk SMS to:', phoneNumbers.length, 'numbers');
      
      // استخدام OTP API للـ bulk SMS أيضاً
      const response = await fetch('https://beon.chat/api/send/message/otp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.BEON_BULK_SMS_TOKEN || this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumbers: phoneNumbers,
          message: message
        })
      });

      const result = await response.json();
      console.log('📱 Bulk SMS API Response:', result);

      if (response.ok) {
        return {
          success: true,
          message: `تم إرسال الإشعار إلى ${phoneNumbers.length} رقم بنجاح`,
          messageId: result.batchId
        };
      } else {
        return {
          success: false,
          error: result.error || 'فشل في إرسال الإشعارات الجماعية'
        };
      }
    } catch (error) {
      console.error('❌ Bulk SMS sending error:', error);
      return {
        success: false,
        error: 'حدث خطأ في إرسال الإشعارات الجماعية'
      };
    }
  }
}

export default new BeOnSMSNotificationsService();

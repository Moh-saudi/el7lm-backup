import { NextRequest, NextResponse } from 'next/server';
import beonSMSService from '@/lib/beon/sms-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, phoneNumber, name, message, templateId, templateVars, bulkPhones, bulkMessage } = body;

    // التحقق من صحة رقم الهاتف
    const formattedPhone = beonSMSService.formatPhoneNumber(phoneNumber);
    
    if (!beonSMSService.validatePhoneNumber(formattedPhone)) {
      return NextResponse.json({
        success: false,
        error: 'رقم الهاتف غير صحيح'
      }, { status: 400 });
    }

    let result;

    switch (service) {
      case 'otp':
        // اختبار OTP الجديد
        result = await beonSMSService.sendOTPNew(formattedPhone, name, 4, 'ar');
        break;

      case 'sms':
        // اختبار SMS عادي
        result = await beonSMSService.sendSMS(formattedPhone, message);
        break;

      case 'template':
        // اختبار SMS Template
        const otp = beonSMSService.generateOTP();
        result = await beonSMSService.sendOTP(formattedPhone, templateId, otp, name);
        break;

      case 'bulk':
        // اختبار Bulk SMS
        const phoneNumbers = bulkPhones.split(',').map((p: string) => 
          beonSMSService.formatPhoneNumber(p.trim())
        );
        
        // التحقق من صحة جميع الأرقام
        for (const phone of phoneNumbers) {
          if (!beonSMSService.validatePhoneNumber(phone)) {
            return NextResponse.json({
              success: false,
              error: `رقم الهاتف غير صحيح: ${phone}`
            }, { status: 400 });
          }
        }
        
        result = await beonSMSService.sendBulkSMS(phoneNumbers, bulkMessage);
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'نوع الخدمة غير معروف'
        }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ BeOn API Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'حدث خطأ غير متوقع'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BeOn API Test Endpoint',
    services: {
      otp: {
        description: 'إرسال OTP باستخدام API الجديد',
        token: 'vSCuMzZwLjDxzR882YphwEgW',
        endpoint: '/api/send/message/otp'
      },
      sms: {
        description: 'إرسال SMS عادي',
        token: 'SPb4sgedfe',
        endpoint: '/api/send/message/sms'
      },
      template: {
        description: 'إرسال SMS Template',
        token: 'SPb4sbemr5bwb7sjzCqTcL',
        endpoint: '/api/send/message/sms/template'
      },
      bulk: {
        description: 'إرسال Bulk SMS',
        token: 'nzQ7ytW8q6yfQdJRFM57yRfR',
        endpoint: '/api/send/message/sms/bulk'
      }
    }
  });
} 

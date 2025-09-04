import { NextRequest, NextResponse } from 'next/server';

// مثال باستخدام Twilio
export async function POST(request: NextRequest) {
  try {
    const { phone, message, type } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    // إضافة رمز الدولة إذا لم يكن موجود
    const formattedPhone = phone.startsWith('+') ? phone : `+966${phone}`;

    let result;

    // اختيار الخدمة حسب النوع
    switch (type) {
      case 'twilio':
        // result = await sendTwilioSMS(formattedPhone, message);
        break;
      case '4jawaly':
        result = await send4jawalySMS(formattedPhone, message);
        break;
      default:
        result = await sendTwilioSMS(formattedPhone, message);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'SMS sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send SMS', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// دالة إرسال SMS عبر Twilio
// async function sendTwilioSMS(phone: string, message: string) {
//   // يحتاج تثبيت: npm install twilio
//   const twilio = require('twilio');
//   const client = twilio(
//     process.env.TWILIO_ACCOUNT_SID,
//     process.env.TWILIO_AUTH_TOKEN
//   );
//   return client.messages.create({
//     body: message,
//     from: process.env.TWILIO_PHONE_NUMBER,
//     to: phone
//   });
// }

// دالة إرسال SMS عبر 4jawaly
async function send4jawalySMS(phone: string, message: string) {
  try {
    const response = await fetch('https://api.4jawaly.com/api/v1/account/area/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JAWALY_API_KEY}`
      },
      body: JSON.stringify({
        phone: phone.replace('+', ''),
        message,
        sender_name: 'EL7LM'
      })
    });

    const result = await response.json();
    
    if (response.ok && result.status === 'success') {
      return { success: true, messageId: result.message_id };
    } else {
      return { success: false, error: result.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
} 

import { NextRequest, NextResponse } from 'next/server';

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
      case 'business':
        result = await sendWhatsAppBusinessAPI(formattedPhone, message);
        break;
      case 'green':
        result = await sendGreenAPIMessage(formattedPhone, message);
        break;
      default:
        result = await sendGreenAPIMessage(formattedPhone, message);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'WhatsApp message sent successfully'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('WhatsApp API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// دالة إرسال WhatsApp عبر Business API
async function sendWhatsAppBusinessAPI(phone: string, message: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace('+', ''),
        type: 'text',
        text: { body: message }
      })
    });

    const result = await response.json();
    
    if (response.ok && result.messages) {
      return { success: true, messageId: result.messages[0].id };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// دالة إرسال WhatsApp عبر Green API
async function sendGreenAPIMessage(phone: string, message: string) {
  try {
    const response = await fetch(
      `https://api.green-api.com/waInstance${process.env.GREEN_API_INSTANCE}/sendMessage/${process.env.GREEN_API_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${phone.replace('+', '')}@c.us`,
          message: message
        })
      }
    );

    const result = await response.json();
    
    if (response.ok && result.idMessage) {
      return { success: true, messageId: result.idMessage };
    } else {
      return { success: false, error: result.error || 'Unknown error' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
} 

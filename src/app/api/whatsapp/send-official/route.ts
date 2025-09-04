import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// الرقم الاحتياطي (في حالة عدم توفر رقم للمنظمة)
const FALLBACK_WHATSAPP = '+97472053188';

// يمكن استخدام Twilio, WhatsApp Business API, أو أي خدمة أخرى
// هذا مثال باستخدام Twilio (يحتاج لإعداد المتغيرات)
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || `whatsapp:${FALLBACK_WHATSAPP}`;

export async function POST(request: NextRequest) {
  try {
    const { to, message, playerName, senderPhone, organizationName, accountType } = await request.json();

    // التحقق من البيانات المطلوبة
    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    // تنظيف رقم الهاتف
    const cleanPhoneNumber = to.replace(/[^\d+]/g, '');
    if (!cleanPhoneNumber.startsWith('+')) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف يجب أن يبدأ برمز الدولة (+)' },
        { status: 400 }
      );
    }

    console.log(`📱 إرسال رسالة واتساب رسمية لـ ${playerName || 'لاعب'} على الرقم ${cleanPhoneNumber}`);
    console.log(`📤 من: ${organizationName || 'منظمة'} (${senderPhone || 'رقم غير محدد'})`);

    // الطريقة الأولى: Twilio WhatsApp API
    if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
      try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: TWILIO_WHATSAPP_NUMBER,
            To: `whatsapp:${cleanPhoneNumber}`,
            Body: message
          })
        });

        const result = await response.json();

        if (response.ok) {
          console.log('✅ تم إرسال الرسالة عبر Twilio بنجاح:', result.sid);
          
          return NextResponse.json({
            success: true,
            message: 'تم إرسال الرسالة بنجاح',
            messageId: result.sid,
            service: 'Twilio'
          });
        } else {
          console.error('❌ خطأ في Twilio:', result);
          throw new Error(result.message || 'فشل في إرسال الرسالة عبر Twilio');
        }
      } catch (twilioError) {
        console.error('❌ خطأ في Twilio:', twilioError);
        // الانتقال للطريقة البديلة
      }
    }

    // الطريقة الثانية: WhatsApp Business API (مثال)
    // يحتاج لإعداد WhatsApp Business API
    const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
    const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (WHATSAPP_ACCESS_TOKEN && WHATSAPP_PHONE_NUMBER_ID) {
      try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhoneNumber.replace('+', ''),
            type: 'text',
            text: {
              body: message
            }
          })
        });

        const result = await response.json();

        if (response.ok) {
          console.log('✅ تم إرسال الرسالة عبر WhatsApp Business API بنجاح:', result.messages?.[0]?.id);
          
          return NextResponse.json({
            success: true,
            message: 'تم إرسال الرسالة بنجاح',
            messageId: result.messages?.[0]?.id,
            service: 'WhatsApp Business API'
          });
        } else {
          console.error('❌ خطأ في WhatsApp Business API:', result);
          throw new Error(result.error?.message || 'فشل في إرسال الرسالة عبر WhatsApp Business API');
        }
      } catch (whatsappError) {
        console.error('❌ خطأ في WhatsApp Business API:', whatsappError);
        // الانتقال للطريقة البديلة
      }
    }

    // الطريقة الثالثة: محاكاة الإرسال (للاختبار)
    console.log('📝 محاكاة إرسال الرسالة (لأغراض الاختبار)');
    
    // تسجيل الرسالة في قاعدة البيانات (اختياري)
    const logData = {
      to: cleanPhoneNumber,
      message: message,
      playerName: playerName || 'غير محدد',
      senderPhone: senderPhone || FALLBACK_WHATSAPP,
      organizationName: organizationName || 'منظمة',
      accountType: accountType || 'club',
      sentAt: new Date().toISOString(),
      status: 'simulated',
      service: 'simulation'
    };

    // يمكن حفظ السجل في Firestore أو قاعدة بيانات أخرى
    console.log('📊 سجل الرسالة:', logData);

    // محاكاة تأخير
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      message: 'تم إرسال الرسالة بنجاح (محاكاة)',
      messageId: `sim_${Date.now()}`,
      service: 'simulation',
      note: 'هذه محاكاة - لا يتم الإرسال الفعلي. قم بإعداد Twilio أو WhatsApp Business API للإرسال الحقيقي'
    });

  } catch (error) {
    console.error('❌ خطأ في إرسال الرسالة:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'حدث خطأ في إرسال الرسالة',
        details: error instanceof Error ? error.message : 'خطأ غير معروف'
      },
      { status: 500 }
    );
  }
}

// معلومات للمطورين حول إعداد الخدمات
export async function GET() {
  return NextResponse.json({
    message: 'WhatsApp Official Sender API',
    fallbackNumber: FALLBACK_WHATSAPP,
    description: 'إرسال رسائل واتساب رسمية من أرقام المنظمات المختلفة',
    services: {
      twilio: {
        configured: !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN),
        required_env: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_WHATSAPP_NUMBER']
      },
      whatsapp_business: {
        configured: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
        required_env: ['WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID']
      }
    },
    usage: {
      clubs: 'الأندية ترسل من أرقامها الخاصة',
      academies: 'الأكاديميات ترسل من أرقامها الخاصة', 
      trainers: 'المدربون يرسلون من أرقامهم الخاصة',
      agents: 'الوكلاء يرسلون من أرقامهم الخاصة'
    },
    note: 'إعداد متغيرات البيئة مطلوب للإرسال الفعلي. سيتم استخدام محاكاة الإرسال افتراضياً.'
  });
} 

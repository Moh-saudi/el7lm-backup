import { NextRequest, NextResponse } from 'next/server';

// تنسيق رقم الهاتف المصري
const formatEgyptianPhone = (phone: string): string => {
  // إزالة جميع المسافات والرموز
  let cleaned = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // إذا كان الرقم يبدأ بـ 0 (مصري محلي)
  if (cleaned.startsWith('0')) {
    return '+20' + cleaned.substring(1);
  }
  
  // إذا كان الرقم يبدأ بـ 20 (مصري بدون +)
  if (cleaned.startsWith('20')) {
    return '+' + cleaned;
  }
  
  // إذا كان الرقم يبدأ بـ +20 (مصري صحيح)
  if (cleaned.startsWith('+20')) {
    return cleaned;
  }
  
  // إذا كان الرقم 11 رقم (مصري بدون رمز الدولة)
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    return '+20' + cleaned.substring(1);
  }
  
  // إذا كان الرقم 10 أرقام (مصري بدون 0)
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '+20' + cleaned;
  }
  
  // إذا لم يكن مصري، نعيده كما هو
  return cleaned;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('📱 === بدء طلب SMS Bulk ===');
    console.log('🕐 وقت البداية:', new Date().toISOString());
    
    const { phoneNumbers, message } = await request.json();

    console.log('📱 البيانات المستلمة:', { 
      phoneNumbersCount: phoneNumbers?.length, 
      messageLength: message?.length 
    });

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0 || !message) {
      console.error('❌ بيانات مفقودة:', { 
        hasPhoneNumbers: !!phoneNumbers, 
        isArray: Array.isArray(phoneNumbers),
        phoneCount: phoneNumbers?.length,
        hasMessage: !!message 
      });
      return NextResponse.json(
        { error: 'مصفوفة أرقام الهاتف والرسالة مطلوبان' },
        { status: 400 }
      );
    }

    // تنسيق أرقام الهاتف
    const formattedPhoneNumbers = phoneNumbers.map(formatEgyptianPhone);
    console.log('📱 تنسيق أرقام الهاتف:', { 
      original: phoneNumbers, 
      formatted: formattedPhoneNumbers 
    });

    // في وضع التطوير، نعرض رسالة محاكاة بدلاً من الإرسال الفعلي
    if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SMS_SIMULATION === 'true') {
      console.log('🔧 وضع التطوير - محاكاة SMS Bulk');
      console.log('📱 سيتم إرسال SMS إلى:', formattedPhoneNumbers);
      console.log('📱 الرسالة:', message);
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const responseTime = Date.now() - startTime;
      console.log('✅ محاكاة SMS Bulk ناجحة');
      console.log('⏱️ وقت الاستجابة:', responseTime + 'ms');
      console.log('📱 === انتهاء طلب SMS Bulk ===');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال الإشعار عبر SMS Bulk بنجاح (محاكاة)',
        method: 'sms_bulk',
        simulated: true,
        originalPhones: phoneNumbers,
        formattedPhones: formattedPhoneNumbers,
        responseTime
      });
    }

    // الحصول على Token من متغيرات البيئة
    const BEON_TOKEN = process.env.BEON_V3_TOKEN || 'Yt3A3RwMQHx49trsz1EMgSKP8qOD0CSVJXdJxy6IqNNtcYblsYWtfVAtaJpv';
    const SMS_ENDPOINT = 'https://v3.api.beon.chat/api/v3/messages/sms/bulk';

    console.log('🔧 تكوين SMS Bulk:', {
      token: BEON_TOKEN.substring(0, 10) + '...',
      endpoint: SMS_ENDPOINT,
      phoneCount: formattedPhoneNumbers.length
    });

    console.log('📱 إرسال SMS Bulk إلى:', formattedPhoneNumbers);
    console.log('📱 الرسالة:', message);
    
    // إرسال عبر SMS Bulk باستخدام API الصحيح
    const apiStartTime = Date.now();
    
    const response = await fetch(SMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'beon-token': BEON_TOKEN
      },
      body: JSON.stringify({
        phoneNumbers: formattedPhoneNumbers,
        message: message
      })
    });

    const apiResponseTime = Date.now() - apiStartTime;
    const totalResponseTime = Date.now() - startTime;

    console.log('📱 استجابة API SMS Bulk:', {
      status: response.status,
      statusText: response.statusText,
      apiResponseTime: apiResponseTime + 'ms',
      totalResponseTime: totalResponseTime + 'ms'
    });
    console.log('📱 Headers الاستجابة:', Object.fromEntries(response.headers.entries()));

    // قراءة جسم الاستجابة إن وُجد للتحقق من أخطاء المزود
    let responseBodyText = '';
    try {
      responseBodyText = await response.text();
      if (responseBodyText) {
        console.log('📄 SMS Bulk Provider body:', responseBodyText);
      } else {
        console.log('📄 SMS Bulk Provider body: <empty>');
      }
    } catch (e) {
      console.log('⚠️ تعذر قراءة جسم الاستجابة من المزود');
    }

    let providerJson: any = null;
    if (responseBodyText) {
      try {
        providerJson = JSON.parse(responseBodyText);
      } catch {
        // ليس JSON — نتحقق من وجود رسالة خطأ نصية معروفة
      }
    }

    // كشف الأخطاء على مستوى المزود حتى لو كان HTTP 200
    const providerErrorText = (responseBodyText || '').toLowerCase();
    const providerStatus = providerJson?.status ?? providerJson?.code;
    const isProviderError = (
      providerStatus === 400 || providerStatus === '400' ||
      providerErrorText.includes('public sender error') ||
      providerErrorText.includes("you can't use this api while you use public sender")
    );
    
    if (response.ok && !isProviderError) {
      console.log('✅ SMS Bulk تم إرساله بنجاح إلى:', formattedPhoneNumbers);
      console.log('📱 === انتهاء طلب SMS Bulk ===');
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال الإشعار عبر SMS Bulk بنجاح',
        method: 'sms_bulk',
        originalPhones: phoneNumbers,
        formattedPhones: formattedPhoneNumbers,
        providerStatus,
        providerBody: providerJson || responseBodyText || null,
        responseTime: totalResponseTime
      });
    } else {
      const errorPayload = {
        status: response.status,
        statusText: response.statusText,
        providerStatus,
        providerBody: providerJson || responseBodyText || null,
        phoneNumbers: formattedPhoneNumbers
      };
      console.error('❌ فشل إرسال SMS Bulk (مزود):', errorPayload);
      console.log('📱 === انتهاء طلب SMS Bulk ===');
      
      return NextResponse.json(
        { error: providerJson?.message || `فشل في إرسال الإشعار عبر SMS Bulk: ${response.status} ${response.statusText}`, details: errorPayload },
        { status: 502 }
      );
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('❌ خطأ في SMS Bulk:', error);
    console.log('📱 === انتهاء طلب SMS Bulk ===');
    
    return NextResponse.json(
      { error: 'حدث خطأ في إرسال الإشعار عبر SMS Bulk' },
      { status: 500 }
    );
  }
}

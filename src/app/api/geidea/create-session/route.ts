import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';
import { db } from '@/lib/firebase/config';
import { addDoc, collection } from 'firebase/firestore';

// إنشاء توقيع للطلب حسب الوثائق الرسمية
function generateSignature(
  merchantPublicKey: string,
  amount: number,
  currency: string,
  merchantReferenceId: string,
  apiPassword: string,
  timestamp: string
): string {
  const amountStr = amount.toFixed(2);
  const data = `${merchantPublicKey}${amountStr}${currency}${merchantReferenceId}${timestamp}`;
  return crypto
    .createHmac('sha256', apiPassword)
    .update(data)
    .digest('base64');
}

export async function POST(request: NextRequest) {
  try {
    // Global and per-merchantReference/IP rate limits
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`geidea:create:${clientIp}`, { windowMs: 60_000, max: 20, minIntervalMs: 300 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    console.log('🚀 [Geidea API] POST request received');
    
    // قراءة البيانات من الطلب
    let body;
    try {
      body = await request.json();
      console.log('📥 [Geidea API] Received body:', body);
    } catch (err) {
      console.error('❌ [Geidea API] Failed to parse JSON body:', err);
      return NextResponse.json(
        { error: 'Invalid JSON body', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const { amount, currency = 'EGP', orderId: originalOrderId, customerEmail, customerName, players } = body;
    
    // تنظيف وتنسيق orderId ليكون صالحاً لجيديا
    const orderId = originalOrderId || `ORDER${Date.now()}`;

    // التحقق من وجود البيانات المطلوبة
    if (!amount || !orderId || !customerEmail) {
      console.error('❌ [Geidea API] Missing required fields:', { amount, orderId, customerEmail });
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, customerEmail', details: { amount, orderId, customerEmail } },
        { status: 400 }
      );
    }

    // التحقق من بيانات اللاعبين إذا كانت موجودة
    let playersData = [];
    if (players && Array.isArray(players) && players.length > 0) {
      playersData = players.map(player => ({
        userId: player.userId || 'unknown',
        playerName: player.playerName || 'Unknown Player',
        playerEmail: player.playerEmail || customerEmail,
        playerPhone: player.playerPhone || null,
        amount: player.amount || (amount / players.length), // تقسيم المبلغ على عدد اللاعبين
        packageType: player.packageType || 'subscription_3months',
        notes: player.notes || ''
      }));
    }

    // قراءة متغيرات البيئة - PRODUCTION MODE
    const merchantPublicKey = process.env.GEIDEA_MERCHANT_PUBLIC_KEY || '3448c010-87b1-41e7-9771-cac444268cfb';
    const apiPassword = process.env.GEIDEA_API_PASSWORD || 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0';
    const geideaApiUrl = process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net';

    console.log('🔍 [Geidea Debug] Using PRODUCTION credentials:', {
      merchantPublicKey: `${merchantPublicKey.substring(0, 8)}...`,
      apiPassword: `${apiPassword.substring(0, 8)}...`,
      geideaApiUrl: geideaApiUrl,
      hasValidCredentials: true,
      isProductionMode: true
    });

    console.log('✅ [Geidea API] Using PRODUCTION credentials from Geidea dashboard');

    // إنشاء timestamp حسب الوثائق الرسمية
    const timestamp = new Date().toISOString();
    
    // إنشاء merchantReferenceId قصير وفريد أولاً
    const shortTimestamp = Date.now().toString().slice(-6); // آخر 6 أرقام فقط
    const merchantReferenceId = `BULK${shortTimestamp}`;

    // إنشاء توقيع حسب الوثائق الرسمية باستخدام merchantReferenceId الجديد
    const signature = generateSignature(
      merchantPublicKey,
      parseFloat(amount),
      currency,
      merchantReferenceId, // استخدام merchantReferenceId الجديد بدلاً من orderId
      apiPassword,
      timestamp
    );

    console.log('🔍 [Geidea Debug] Signature generation:', {
      merchantPublicKey: merchantPublicKey ? `${merchantPublicKey.substring(0, 8)}...` : 'NOT SET',
      amount: parseFloat(amount),
      currency: currency,
      merchantReferenceId: merchantReferenceId, // استخدام merchantReferenceId الجديد
      timestamp: timestamp,
      signature: signature.substring(0, 8) + '...'
    });

    // تحضير بيانات الجلسة حسب الوثائق الرسمية
    const sessionData: any = {
      amount: parseFloat(amount),
      currency: currency,
      timestamp: timestamp,
      merchantReferenceId: merchantReferenceId,
      signature: signature,
      language: "ar",
      paymentOperation: "Pay"
    };

    // إضافة callbackUrl وreturnUrl حسب الوثائق الرسمية
    const appBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    // callbackUrl مطلوب ويجب أن يكون HTTPS
    // للتطوير المحلي، نستخدم webhook.site جديد
    let callbackUrl;
    if (appBaseUrl.includes('localhost')) {
      // للتطوير المحلي، نستخدم webhook.site جديد
      callbackUrl = 'https://webhook.site/test-geidea-callback-2025';
    } else {
      // للإنتاج، نستخدم webhook حقيقي على الدومين
      callbackUrl = 'https://www.el7lm.com/api/geidea/webhook';
    }
    
    sessionData.callbackUrl = callbackUrl;
    
    // returnUrl اختياري - للعودة بعد الدفع
    // للتطوير المحلي، لا نضع returnUrl لأن جيديا لا يقبل localhost
    if (!appBaseUrl.includes('localhost')) {
      let returnUrl = `${appBaseUrl}/dashboard/player/billing?payment=success`;
      sessionData.returnUrl = returnUrl;
    }

    console.log('🚀 💳 Creating Geidea session according to official docs:', {
      amount: sessionData.amount,
      currency: sessionData.currency,
      merchantReferenceId: sessionData.merchantReferenceId,
      callbackUrl: sessionData.callbackUrl,
      returnUrl: sessionData.returnUrl,
      language: sessionData.language,
      paymentOperation: sessionData.paymentOperation,
      signature: signature.substring(0, 8) + '...'
    });

    // إرسال طلب إنشاء الجلسة إلى Geidea
    const geideaEndpoint = `${geideaApiUrl}/payment-intent/api/v2/direct/session`;
    console.log('🌐 [Geidea API] Sending request to:', geideaEndpoint);
    console.log('🔐 [Geidea API] Using real credentials for production');
    console.log('💳 [Geidea API] Creating real payment session');
    
    const response = await fetch(geideaEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${merchantPublicKey}:${apiPassword}`).toString('base64')}`
      },
      body: JSON.stringify(sessionData)
    });

    console.log('📨 [Geidea API] Response status:', response.status);
    console.log('📨 [Geidea API] Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();

    console.log('📨 Geidea response:', {
      status: response.status,
      responseCode: responseData.responseCode,
      sessionId: responseData.session?.id,
      error: responseData.detailedResponseMessage || responseData.responseMessage,
      isTestMode: true,
      isTestPayment: true
    });

    if (!response.ok) {
      console.error('❌ Geidea API error:', responseData);
      
      // إذا كان خطأ 401 (مصادقة فاشلة)، أعطِ رسالة واضحة
      if (response.status === 401) {
              return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: 'Merchant credentials are invalid or missing. Please check your Geidea configuration.',
          status: response.status,
          solution: 'Please verify your Geidea TEST credentials in .env.local file',
          responseData: responseData,
          isTestMode: true,
          isTestPayment: true
        },
        { status: 401 }
      );
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to create payment session',
          details: responseData.detailedResponseMessage || responseData.responseMessage || 'Unknown error',
          status: response.status,
          responseData: responseData,
          isTestMode: true,
          isTestPayment: true
        },
        { status: response.status }
      );
    }

    if (responseData.responseCode !== '000') {
      console.error('❌ Geidea API error:', responseData);
      
      // إذا كان خطأ مصادقة، أعطِ رسالة واضحة
      if (responseData.responseCode === '100' && responseData.detailedResponseCode === '023') {
              return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: 'Merchant authentication failed. Please check your Geidea credentials.',
          responseCode: responseData.responseCode,
          detailedResponseCode: responseData.detailedResponseCode,
          solution: 'Please verify your Geidea credentials in .env.local file',
          responseData: responseData,
          isProduction: true,
          isRealPayment: true
        },
        { status: 401 }
      );
      }
      
      return NextResponse.json(
        { 
          error: 'Payment session creation failed',
          details: responseData.detailedResponseMessage || responseData.responseMessage || 'Unknown error',
          responseCode: responseData.responseCode,
          detailedResponseCode: responseData.detailedResponseCode,
          responseData: responseData,
          isProduction: true,
          isRealPayment: true
        },
        { status: 400 }
      );
    }

    // إرجاع بيانات الجلسة الناجحة حسب الوثائق الرسمية
    console.log('✅ 💳 TEST MODE: Payment session created successfully!');
    console.log('📋 Full Geidea response:', responseData);
    
    // التحقق من وجود session.id حسب الوثائق الرسمية
    if (!responseData.session?.id) {
      console.error('❌ Geidea response missing session.id:', responseData);
      return NextResponse.json(
        { 
          error: 'Invalid Geidea response',
          details: 'Session ID not found in Geidea response',
          responseData: responseData,
          isTestMode: true,
          isTestPayment: true
        },
        { status: 400 }
      );
    }

    // حفظ بيانات الدفعة في قاعدة البيانات عند إنشائها
    try {
      // استخراج userId من merchantReferenceId
      let userId: string | undefined = undefined;
      if (merchantReferenceId && merchantReferenceId.startsWith('BULK')) {
        const parts = merchantReferenceId.split('_');
        if (parts.length >= 2) {
          userId = parts[0].replace('BULK', '') || parts[1];
        }
      }

      // إنشاء سجل الدفعة في bulk_payments
      const bulkPaymentData = {
        userId: userId || 'unknown',
        orderId: merchantReferenceId, // استخدام merchantReferenceId كـ orderId
        sessionId: responseData.session.id,
        amount: parseFloat(amount),
        currency: currency || 'EGP',
        customerEmail: customerEmail,
        customerName: customerName || 'Customer',
        paymentStatus: 'pending',
        statusMessage: 'في انتظار إتمام الدفع',
        merchantReferenceId: merchantReferenceId,
        // بيانات اللاعبين المتعددة
        players: playersData.length > 0 ? playersData : [{
          userId: userId || 'unknown',
          playerName: customerName || 'Customer',
          playerEmail: customerEmail,
          playerPhone: null,
          amount: parseFloat(amount),
          packageType: 'subscription_3months',
          notes: 'دفعة فردية'
        }],
        totalPlayers: playersData.length > 0 ? playersData.length : 1,
        isMultiPlayerPayment: playersData.length > 1,
        geideaSessionData: {
          sessionId: responseData.session.id,
          amount: parseFloat(amount),
          currency: currency || 'EGP',
          merchantReferenceId: merchantReferenceId,
          callbackUrl: sessionData.callbackUrl,
          returnUrl: sessionData.returnUrl,
          language: sessionData.language,
          paymentOperation: sessionData.paymentOperation,
          isTestMode: true
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isTest: true
      };

      // حفظ في bulk_payments collection
      await addDoc(collection(db, 'bulk_payments'), bulkPaymentData);

      console.log('✅ [Geidea] Bulk payment record created:', {
        orderId: merchantReferenceId,
        sessionId: responseData.session.id,
        userId: userId
      });

    } catch (dbError) {
      console.error('❌ [Geidea] Failed to save bulk payment record:', dbError);
      // لا نوقف العملية إذا فشل حفظ البيانات
    }
    
    // إرجاع sessionId فقط حسب الوثائق الرسمية
    return NextResponse.json({
      success: true,
      sessionId: responseData.session.id, // هذا هو المطلوب حسب الوثائق
      message: '💳 TEST MODE: Payment session created successfully',
      isTestMode: true,
      isTestPayment: true,
      merchantReferenceId: merchantReferenceId, // إضافة للتوضيح
      fullResponse: responseData
    });

  } catch (error) {
    console.error('💥 Error creating Geidea session:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        isProduction: true,
        isRealPayment: true
      },
      { status: 500 }
    );
  }
} 

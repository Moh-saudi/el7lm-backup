import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

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

// دالة لتحديد كود الدولة من العملة
function getCountryFromCurrency(curr: string): string {
  switch (curr) {
    case 'AED': return 'AE'; // الإمارات
    case 'SAR': return 'SA'; // السعودية
    case 'QAR': return 'QA'; // قطر
    case 'EGP': return 'EG'; // مصر
    default: return 'AE';
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIpFromHeaders(request.headers);
    const ipCheck = rateLimiter.check(`geidea:apple:${clientIp}`, { windowMs: 60_000, max: 15, minIntervalMs: 500 });
    if (!ipCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(ipCheck.retryAfterMs / 1000)) } }
      );
    }
    // قراءة البيانات من الطلب
    let body;
    try {
      body = await request.json();
      console.log('🍎 [Apple Pay API] Received body:', body);
    } catch (err) {
      console.error('❌ [Apple Pay API] Failed to parse JSON body:', err);
      return NextResponse.json(
        { error: 'Invalid JSON body', details: err instanceof Error ? err.message : 'Unknown error' },
        { status: 400 }
      );
    }

    const { 
      amount, 
      currency = 'EGP', 
      orderId, 
      customerEmail, 
      customerName,
      applePayToken 
    } = body;

    // التحقق من وجود البيانات المطلوبة
    if (!amount || !orderId || !customerEmail || !applePayToken) {
      console.error('❌ [Apple Pay API] Missing required fields:', { amount, orderId, customerEmail, hasApplePayToken: !!applePayToken });
      return NextResponse.json(
        { error: 'Missing required fields: amount, orderId, customerEmail, applePayToken' },
        { status: 400 }
      );
    }

    // قراءة متغيرات البيئة
    const merchantPublicKey = '3448c010-87b1-41e7-9771-cac444268cfb';
    const apiPassword = 'edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0';
    const geideaApiUrl = 'https://api.merchant.geidea.net';
    const applePayMerchantId = process.env.APPLE_PAY_MERCHANT_ID;

    // التحقق من وجود المفاتيح
    if (!merchantPublicKey || !apiPassword || !applePayMerchantId) {
      console.error('❌ [Apple Pay API] Missing credentials');
      return NextResponse.json(
        { error: 'Missing Apple Pay or Geidea credentials' },
        { status: 500 }
      );
    }

    // إنشاء timestamp حسب الوثائق الرسمية
    const timestamp = new Date().toISOString();
    
    // إنشاء توقيع حسب الوثائق الرسمية
    const signature = generateSignature(
      merchantPublicKey,
      parseFloat(amount),
      currency,
      orderId,
      apiPassword,
      timestamp
    );

    // تحضير بيانات Apple Pay للدفع المباشر
    const paymentData = {
      amount: parseFloat(amount),
      currency: currency,
      merchantReferenceId: orderId,
      timestamp: timestamp,
      signature: signature,
      language: "ar",
      paymentMethod: {
        type: "ApplePay",
        token: applePayToken,
        merchantIdentifier: applePayMerchantId
      },
      customer: {
        email: customerEmail,
        name: customerName || 'Apple Pay User'
      },
      callbackUrl: process.env.NEXT_PUBLIC_BASE_URL?.includes('localhost') 
        ? 'https://webhook.site/c32729f0-39f0-4cf8-a8c2-e932a146b685'
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/geidea/callback`,
      billingAddress: {
        countryCode: getCountryFromCurrency(currency)
      }
    };

    console.log('🍎 Creating Apple Pay payment with Geidea:', {
      ...paymentData,
      signature: signature.substring(0, 8) + '...',
      paymentMethod: {
        ...paymentData.paymentMethod,
        token: 'APPLE_PAY_TOKEN_HIDDEN'
      }
    });

    // إرسال طلب الدفع المباشر إلى Geidea
    const response = await fetch(`${geideaApiUrl}/payment-intent/api/v2/direct/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${merchantPublicKey}:${apiPassword}`).toString('base64')}`
      },
      body: JSON.stringify(paymentData)
    });

    const responseData = await response.json();

    console.log('📨 Apple Pay Geidea response:', {
      status: response.status,
      responseCode: responseData.responseCode,
      transactionId: responseData.transactionId
    });

    if (!response.ok || responseData.responseCode !== '000') {
      console.error('❌ Apple Pay Geidea error:', responseData);
      return NextResponse.json(
        { 
          error: 'Failed to process Apple Pay payment',
          details: responseData.detailedResponseMessage || responseData.responseMessage || 'Unknown error',
          responseCode: responseData.responseCode
        },
        { status: response.status }
      );
    }

    // إرجاع بيانات الدفع الناجح
    console.log('✅ Apple Pay payment processed successfully!');
    return NextResponse.json({
      success: true,
      transactionId: responseData.transactionId,
      merchantReferenceId: orderId,
      message: 'Apple Pay payment processed successfully',
      paymentMethod: 'ApplePay'
    });

  } catch (error) {
    console.error('💥 Error processing Apple Pay payment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 

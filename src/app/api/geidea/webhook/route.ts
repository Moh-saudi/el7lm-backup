import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import crypto from 'crypto';
import { rateLimiter, getClientIpFromHeaders } from '@/lib/security/rate-limit';

// تكوين Geidea
const GEIDEA_CONFIG = {
  webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET || '',
  baseUrl: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net'
};

// التحقق من صحة التوقيع - محسن وآمن
function verifySignature(payload: string, signature: string): boolean {
  if (!GEIDEA_CONFIG.webhookSecret) {
    console.error('🚨 SECURITY: GEIDEA_WEBHOOK_SECRET غير محدد - رفض الطلب');
    return false;
  }

  if (!signature || typeof signature !== 'string') {
    console.error('🚨 SECURITY: توقيع غير صالح');
    return false;
  }

  try {
    // إنشاء التوقيع المتوقع
    const expectedSignature = crypto
      .createHmac('sha256', GEIDEA_CONFIG.webhookSecret)
      .update(payload, 'utf8')
      .digest('hex');

    // تنظيف التوقيع من البريفكس إذا كان موجوداً
    const cleanSignature = signature.replace(/^sha256=/, '');
    
    // مقارنة آمنة للتوقيعات
    const isValid = crypto.timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      console.error('🚨 SECURITY: فشل التحقق من التوقيع - طلب مرفوض');
      console.error('Expected signature length:', expectedSignature.length);
      console.error('Received signature length:', cleanSignature.length);
    }

    return isValid;
  } catch (error) {
    console.error('🚨 SECURITY: خطأ في التحقق من التوقيع:', error);
    return false;
  }
}

// معالجة webhook
async function handleWebhook(payload: any) {
  const { 
    orderId, 
    merchantReferenceId, 
    status, 
    amount, 
    currency,
    customerEmail,
    paymentMethod,
    transactionId,
    timestamp 
  } = payload;

  console.log('📥 Webhook received:', {
    orderId,
    merchantReferenceId,
    status,
    amount,
    currency,
    customerEmail,
    paymentMethod,
    transactionId,
    timestamp
  });

  try {
    // تحديث حالة الدفع في قاعدة البيانات
    if (merchantReferenceId) {
      // هنا يمكنك تحديث حالة الدفع في Firestore أو أي قاعدة بيانات أخرى
      console.log('✅ Payment status updated:', {
        merchantReferenceId,
        status,
        orderId,
        transactionId
      });
    }

    // إرسال تأكيد بالبريد الإلكتروني (اختياري)
    if (customerEmail && status === 'SUCCESS') {
      console.log('📧 Sending confirmation email to:', customerEmail);
      // هنا يمكنك إرسال تأكيد بالبريد الإلكتروني
    }

    return { success: true, message: 'Webhook processed successfully' };
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    return { success: false, error: 'Failed to process webhook' };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔔 [Geidea Webhook] Received webhook:', body);

    // استخراج البيانات من payload الجديد
    const order = body.order;
    if (!order) {
      console.error('❌ [Geidea Webhook] Missing order data');
      return NextResponse.json({ error: 'Missing order data' }, { status: 400 });
    }

    const {
      orderId,
      merchantReferenceId,
      amount,
      currency,
      status,
      detailedStatus,
      totalAmount,
      settleAmount,
      createdDate,
      updatedDate,
      customerEmail,
      customerName,
      customerPhoneNumber,
      customerPhoneCountryCode,
      paymentMethod,
      transactions
    } = order;

    // التحقق من صحة الطلب
    if (!orderId || !merchantReferenceId) {
      console.error('❌ [Geidea Webhook] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // حفظ نتيجة الدفع في Firebase مع البيانات الجديدة
    const paymentResult = {
      orderId,
      merchantReferenceId,
      amount: totalAmount || amount,
      currency,
      status: detailedStatus || status,
      paymentMethod: paymentMethod?.type || 'Unknown',
      cardBrand: paymentMethod?.brand || null,
      maskedCardNumber: paymentMethod?.maskedCardNumber || null,
      customerEmail,
      customerName,
      customerPhoneNumber,
      customerPhoneCountryCode,
      createdDate,
      updatedDate,
      processedAt: new Date().toISOString(),
      webhookReceived: true,
      isTest: order.isTest || false,
      transactions: transactions || [],
      fullWebhookData: body // حفظ البيانات الكاملة للرجوع إليها
    };

    // حفظ في collection منفصل لنتائج الدفع
    await setDoc(doc(db, 'payment_results', orderId), paymentResult);

    // البحث عن الدفعة المرتبطة وتحديث حالتها
    const bulkPaymentsRef = collection(db, 'bulk_payments');
    const q = query(bulkPaymentsRef, where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const bulkPaymentDoc = querySnapshot.docs[0];
      const bulkPaymentData = bulkPaymentDoc.data();

      // تحديد حالة الدفع من البيانات الجديدة
      let paymentStatus = 'pending';
      let statusMessage = 'في انتظار التأكيد';

      if (status === 'Success' || detailedStatus === 'Paid') {
        paymentStatus = 'success';
        statusMessage = 'تم الدفع بنجاح';
      } else if (status === 'Failed' || detailedStatus === 'Failed') {
        paymentStatus = 'failed';
        statusMessage = 'فشل في الدفع';
      } else if (status === 'Pending' || detailedStatus === 'Pending') {
        paymentStatus = 'pending';
        statusMessage = 'في انتظار التأكيد من البنك';
      }

      // تحديث حالة الدفعة مع البيانات الجديدة
      await updateDoc(doc(db, 'bulk_payments', bulkPaymentDoc.id), {
        paymentStatus,
        statusMessage,
        lastUpdated: new Date().toISOString(),
        geideaResponse: paymentResult,
        // إضافة بيانات العميل المحسنة
        customerEmail: customerEmail || bulkPaymentData.customerEmail,
        customerName: customerName || bulkPaymentData.customerName,
        customerPhoneNumber: customerPhoneNumber || bulkPaymentData.customerPhoneNumber,
        customerPhoneCountryCode: customerPhoneCountryCode || bulkPaymentData.customerPhoneCountryCode,
        paymentMethod: paymentMethod?.type || 'Unknown',
        cardBrand: paymentMethod?.brand || null,
        maskedCardNumber: paymentMethod?.maskedCardNumber || null,
        // إضافة بيانات المعاملات
        transactions: transactions || [],
        totalAmount: totalAmount || amount,
        settleAmount: settleAmount || amount,
        createdDate: createdDate || new Date().toISOString(),
        updatedDate: updatedDate || new Date().toISOString(),
        // تحديث حالة اللاعبين إذا كان الدفع ناجح
        ...(paymentStatus === 'success' && bulkPaymentData.players ? {
          players: bulkPaymentData.players.map(player => ({
            ...player,
            paymentStatus: 'success',
            paymentDate: new Date().toISOString(),
            transactionId: transactionId || null
          }))
        } : {})
      });

      console.log('✅ [Geidea Webhook] Payment status updated:', {
        orderId,
        paymentStatus,
        statusMessage,
        customerEmail,
        customerName
      });

      // إذا كان الدفع ناجح، يمكن إضافة منطق إضافي هنا
      if (paymentStatus === 'success') {
        console.log('🎉 [Geidea Webhook] Payment successful! Processing additional logic...');
        
        // هنا يمكن إضافة منطق إضافي مثل:
        // - إرسال إشعارات للمستخدمين
        // - تحديث حالة الاشتراك
        // - إرسال رسائل تأكيد
        // - تحديث إحصائيات المدفوعات
      }
    } else {
      // لم نجد مستند سابق لهذه العملية، سننشئ سجلاً جديداً في bulk_payments
      try {
              // استنتاج userId من merchantReferenceId إذا كان بتنسيق BULK{uid}_{ts}
      let userId: string | undefined = undefined;
      if (merchantReferenceId && merchantReferenceId.startsWith('BULK')) {
        const parts = merchantReferenceId.split('_');
        if (parts.length >= 2) userId = parts[0].replace('BULK', '') || parts[1];
      }

      // تحديد الحالة من البيانات الجديدة
      let paymentStatus = 'pending' as 'success' | 'failed' | 'pending';
      let statusMessage = 'في انتظار التأكيد';
      if (status === 'Success' || detailedStatus === 'Paid') {
        paymentStatus = 'success';
        statusMessage = 'تم الدفع بنجاح';
      } else if (status === 'Failed' || detailedStatus === 'Failed') {
        paymentStatus = 'failed';
        statusMessage = 'فشل في الدفع';
      }

      await addDoc(collection(db, 'bulk_payments'), {
        userId: userId || 'unknown',
        orderId,
        amount: (totalAmount || amount) ?? 0,
        totalAmount: (totalAmount || amount) ?? 0,
        settleAmount: (settleAmount || amount) ?? 0,
        currency: currency || 'EGP',
        paymentStatus,
        statusMessage,
        // بيانات العميل المحسنة
        customerEmail: customerEmail || 'unknown@example.com',
        customerName: customerName || 'Unknown Customer',
        customerPhoneNumber: customerPhoneNumber || null,
        customerPhoneCountryCode: customerPhoneCountryCode || null,
        paymentMethod: paymentMethod?.type || 'Unknown',
        cardBrand: paymentMethod?.brand || null,
        maskedCardNumber: paymentMethod?.maskedCardNumber || null,
        // بيانات المعاملات
        transactions: transactions || [],
        createdDate: createdDate || new Date().toISOString(),
        updatedDate: updatedDate || new Date().toISOString(),
        geideaResponse: {
          orderId,
          merchantReferenceId,
          status,
          detailedStatus,
          amount: totalAmount || amount,
          currency,
          customerEmail,
          customerName,
          paymentMethod: paymentMethod?.type || 'Unknown',
          cardBrand: paymentMethod?.brand || null,
          createdDate,
          updatedDate,
          isTest: order.isTest || false,
          transactions: transactions || []
        },
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      });

        console.log('✅ [Geidea Webhook] New bulk_payments record created:', { orderId, paymentStatus });
      } catch (e) {
        console.error('❌ [Geidea Webhook] Failed to create bulk_payments record:', e);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('❌ [Geidea Webhook] Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// للاختبار فقط - لا تستخدم في الإنتاج
export async function GET(request: NextRequest) {
  console.log('🔍 Webhook endpoint test');
  
  return NextResponse.json({
    message: 'Geidea webhook endpoint is working',
    timestamp: new Date().toISOString(),
    config: {
      hasWebhookSecret: !!GEIDEA_CONFIG.webhookSecret,
      baseUrl: GEIDEA_CONFIG.baseUrl
    }
  });
} 

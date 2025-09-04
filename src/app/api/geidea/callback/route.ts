import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [Geidea Webhook] Received callback');
    
    const body = await request.json();
    console.log('📥 [Geidea Webhook] Callback data:', body);

    // التحقق من صحة البيانات
    if (!body || !body.sessionId || !body.merchantReferenceId) {
      console.error('❌ [Geidea Webhook] Invalid callback data');
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    const {
      sessionId,
      merchantReferenceId,
      status,
      amount,
      currency,
      responseCode,
      detailedResponseCode,
      responseMessage
    } = body;

    console.log('🔍 [Geidea Webhook] Processing payment:', {
      sessionId,
      merchantReferenceId,
      status,
      amount,
      currency,
      responseCode
    });

    // التحقق من نجاح الدفع
    if (responseCode === '000' && status === 'Paid') {
      console.log('✅ [Geidea Webhook] Payment successful, updating subscription');
      
      try {
        // استخراج معرف المستخدم من merchantReferenceId
        // تنسيق: ORDER1754299715055 أو BULK1754299709562
        const orderId = merchantReferenceId;
        
        // البحث عن بيانات الدفع في Firestore
        const bulkPaymentsRef = collection(db, 'bulkPayments');
        
        // حفظ بيانات الدفع المحدثة
        const paymentData = {
          sessionId,
          merchantReferenceId,
          status: 'completed',
          amount: parseFloat(amount),
          currency,
          responseCode,
          detailedResponseCode,
          responseMessage,
          completedAt: new Date(),
          updatedAt: new Date()
        };

        // استخراج معرف المستخدم من merchantReferenceId
        // تنسيق: ORDER1754302832029 أو BULK1754302832029
        let userId = 'unknown';
        if (merchantReferenceId.includes('BULK')) {
          // تنسيق: BULK_USERID_TIMESTAMP
          const parts = merchantReferenceId.split('_');
          if (parts.length >= 2) {
            userId = parts[1]; // استخراج معرف المستخدم
          }
        }
        
        // حفظ في مجموعة bulkPayments
        await addDoc(bulkPaymentsRef, {
          ...paymentData,
          userId: userId,
          createdAt: new Date()
        });

        console.log('✅ [Geidea Webhook] Payment data saved to Firestore');

        // تحديث حالة الاشتراك للمستخدم
        if (userId && userId !== 'unknown') {
          try {
            await updateUserSubscription(userId, paymentData);
            console.log('✅ [Geidea Webhook] User subscription updated successfully');
          } catch (subscriptionError) {
            console.error('❌ [Geidea Webhook] Error updating user subscription:', subscriptionError);
          }
        } else {
          console.log('⚠️ [Geidea Webhook] Could not extract userId from merchantReferenceId:', merchantReferenceId);
        }

        return NextResponse.json({ 
          success: true, 
          message: 'Payment processed successfully',
          sessionId,
          merchantReferenceId
        });

      } catch (error) {
        console.error('❌ [Geidea Webhook] Error updating subscription:', error);
        return NextResponse.json({ 
          error: 'Failed to update subscription',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }

    } else {
      console.log('⚠️ [Geidea Webhook] Payment failed or pending:', {
        responseCode,
        status,
        responseMessage
      });

      // حفظ بيانات الدفع الفاشل
      const paymentData = {
        sessionId,
        merchantReferenceId,
        status: 'failed',
        amount: parseFloat(amount),
        currency,
        responseCode,
        detailedResponseCode,
        responseMessage,
        failedAt: new Date(),
        updatedAt: new Date()
      };

        // استخراج معرف المستخدم من merchantReferenceId
        let userId = 'unknown';
        if (merchantReferenceId.includes('BULK')) {
          const parts = merchantReferenceId.split('_');
          if (parts.length >= 2) {
            userId = parts[1];
          }
        }
        
        const bulkPaymentsRef = collection(db, 'bulkPayments');
        await addDoc(bulkPaymentsRef, {
          ...paymentData,
          userId: userId,
          createdAt: new Date()
        });

      return NextResponse.json({ 
        success: false, 
        message: 'Payment failed or pending',
        sessionId,
        merchantReferenceId
      });
    }

  } catch (error) {
    console.error('❌ [Geidea Webhook] Error processing callback:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// دالة مساعدة لتحديث اشتراك المستخدم
async function updateUserSubscription(userId: string, paymentData: any) {
  try {
    console.log('🔄 [Geidea Webhook] Updating subscription for user:', userId);

    // حساب تاريخ انتهاء الاشتراك (3 أشهر من الآن)
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);

    // البحث عن المستخدم في جميع المجموعات
    const collections = ['users', 'players', 'clubs', 'academies', 'agents', 'trainers'];
    let userFound = false;
    let userCollection = '';
    let userDocRef = null;

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const userQuery = query(collectionRef, where('__name__', '==', userId));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          userFound = true;
          userCollection = collectionName;
          userDocRef = doc(db, collectionName, userId);
          console.log(`✅ [Geidea Webhook] Found user in collection: ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ [Geidea Webhook] Error searching in ${collectionName}:`, error);
      }
    }

    if (!userFound) {
      console.log('⚠️ [Geidea Webhook] User not found in any collection, trying users collection directly');
      userDocRef = doc(db, 'users', userId);
      userCollection = 'users';
    }

    // تحديث بيانات المستخدم
    if (userDocRef) {
      try {
        await updateDoc(userDocRef, {
          subscriptionStatus: 'active',
          subscriptionEndDate: endDate,
          lastPaymentDate: new Date(),
          lastPaymentAmount: paymentData.amount,
          lastPaymentMethod: 'geidea',
          updatedAt: new Date()
        });
        console.log(`✅ [Geidea Webhook] User data updated in ${userCollection}`);
      } catch (updateError) {
        console.error(`❌ [Geidea Webhook] Error updating user in ${userCollection}:`, updateError);
        
        // محاولة إنشاء المستخدم إذا لم يكن موجوداً
        try {
          await setDoc(userDocRef, {
            subscriptionStatus: 'active',
            subscriptionEndDate: endDate,
            lastPaymentDate: new Date(),
            lastPaymentAmount: paymentData.amount,
            lastPaymentMethod: 'geidea',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log(`✅ [Geidea Webhook] User created in ${userCollection}`);
        } catch (createError) {
          console.error(`❌ [Geidea Webhook] Error creating user in ${userCollection}:`, createError);
        }
      }
    }

    // حفظ سجل الاشتراك
    const subscriptionRef = doc(db, 'subscriptions', userId);
    await setDoc(subscriptionRef, {
      userId,
      status: 'active',
      startDate: new Date(),
      endDate: endDate,
      paymentMethod: 'geidea',
      amount: paymentData.amount,
      currency: paymentData.currency,
      transactionId: paymentData.sessionId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ [Geidea Webhook] Subscription record created successfully');

  } catch (error) {
    console.error('❌ [Geidea Webhook] Error updating user subscription:', error);
    throw error;
  }
} 

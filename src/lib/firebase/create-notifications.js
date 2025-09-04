// ملف لإنشاء الإشعارات التجريبية
// يمكن تشغيله في console المتصفح

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

// إنشاء إشعار تجريبي
export async function createTestNotification(userId) {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    const testNotification = {
      userId: userId,
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي لاختبار نظام الإشعارات',
      type: 'info',
      isRead: false,
      scope: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notificationsRef, testNotification);
    console.log('✅ تم إنشاء إشعار تجريبي:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعار التجريبي:', error);
    throw error;
  }
}

// إنشاء إشعار تفاعلي تجريبي
export async function createTestInteractionNotification(userId) {
  try {
    const interactionNotificationsRef = collection(db, 'interaction_notifications');
    
    const testNotification = {
      userId: userId,
      viewerId: 'test-viewer',
      viewerName: 'مستخدم تجريبي',
      viewerType: 'player',
      viewerAccountType: 'player',
      type: 'profile_view',
      title: 'شخص ما شاهد ملفك الشخصي',
      message: 'مستخدم تجريبي قام بمشاهدة ملفك الشخصي',
      emoji: '👀',
      isRead: false,
      priority: 'medium',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(interactionNotificationsRef, testNotification);
    console.log('✅ تم إنشاء إشعار تفاعلي تجريبي:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعار التفاعلي التجريبي:', error);
    throw error;
  }
}

// إنشاء إشعار دفع تجريبي
export async function createTestPaymentNotification(userId) {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    const testNotification = {
      userId: userId,
      title: 'تم استلام دفعة جديدة',
      message: 'تم استلام دفعة بقيمة 500 جنيه مصري',
      type: 'success',
      isRead: false,
      link: '/dashboard/subscription',
      metadata: {
        paymentId: 'test-payment-123',
        amount: 500,
        currency: 'EGP',
        paymentMethod: 'بطاقة ائتمان'
      },
      scope: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notificationsRef, testNotification);
    console.log('✅ تم إنشاء إشعار دفع تجريبي:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء إشعار الدفع التجريبي:', error);
    throw error;
  }
}

// إنشاء إشعار تحذير تجريبي
export async function createTestWarningNotification(userId) {
  try {
    const notificationsRef = collection(db, 'notifications');
    
    const testNotification = {
      userId: userId,
      title: 'اشتراكك على وشك الانتهاء',
      message: 'سينتهي اشتراكك خلال 3 أيام. يرجى تجديد الاشتراك',
      type: 'warning',
      isRead: false,
      link: '/dashboard/subscription',
      metadata: {
        daysRemaining: 3
      },
      scope: 'system',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(notificationsRef, testNotification);
    console.log('✅ تم إنشاء إشعار تحذير تجريبي:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء إشعار التحذير التجريبي:', error);
    throw error;
  }
}

// دالة لإنشاء جميع الإشعارات التجريبية
export async function createAllTestNotifications(userId) {
  try {
    console.log('🚀 بدء إنشاء الإشعارات التجريبية...');
    
    await Promise.all([
      createTestNotification(userId),
      createTestInteractionNotification(userId),
      createTestPaymentNotification(userId),
      createTestWarningNotification(userId)
    ]);
    
    console.log('🎉 تم إنشاء جميع الإشعارات التجريبية بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعارات التجريبية:', error);
  }
}

// دالة لإنشاء إشعارات متعددة
export async function createMultipleNotifications(userId, count = 5) {
  try {
    console.log(`🚀 بدء إنشاء ${count} إشعارات تجريبية...`);
    
    const promises = [];
    for (let i = 0; i < count; i++) {
      promises.push(createTestNotification(userId));
    }
    
    await Promise.all(promises);
    console.log(`🎉 تم إنشاء ${count} إشعارات تجريبية بنجاح!`);
  } catch (error) {
    console.error('❌ خطأ في إنشاء الإشعارات المتعددة:', error);
  }
}


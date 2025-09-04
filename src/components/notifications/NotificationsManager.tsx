'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  doc,
  updateDoc,
  limit,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import NotificationsList from './NotificationsList';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
  scope: 'system' | 'club' | 'academy' | 'trainer' | string;
  organizationId?: string;
  createdAt: any;
  updatedAt: any;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  senderAccountType?: string;
  actionType?: 'profile_view' | 'message_sent' | 'connection_request' | 'follow' | 'like' | 'comment';
}

interface NotificationsManagerProps {
  title?: string;
  description?: string;
  showSenderInfo?: boolean;
  showStats?: boolean;
  showFilters?: boolean;
  showTestButtons?: boolean;
  accountType?: string;
}

export default function NotificationsManager({
  title = "الإشعارات",
  description = "تابع جميع الإشعارات والتنبيهات المهمة",
  showSenderInfo = true,
  showStats = true,
  showFilters = true,
  showTestButtons = false,
  accountType
}: NotificationsManagerProps) {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<Notification[]>([]);
  const [interactionNotifications, setInteractionNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // جلب معلومات المرسل
  const fetchSenderInfo = async (senderId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', senderId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          senderId,
          senderName: userData.displayName || userData.name || 'مستخدم غير معروف',
          senderAvatar: userData.photoURL || userData.avatar,
          senderAccountType: userData.accountType
        };
      }
    } catch (error) {
      console.error('خطأ في جلب معلومات المرسل:', error);
    }
    return null;
  };

  // جلب الإشعارات
  useEffect(() => {
    if (!user) {
      console.log('⚠️ NotificationsManager: لا يوجد مستخدم مسجل دخول');
      return;
    }
    
    if (!userData) {
      console.log('⚠️ NotificationsManager: بيانات المستخدم غير متوفرة بعد، انتظار...');
      return;
    }
    
    console.log('✅ NotificationsManager: بدء جلب الإشعارات للمستخدم:', user.uid);

    // جلب الإشعارات النظامية
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    // جلب الإشعارات التفاعلية
    const interactionNotificationsQuery = query(
      collection(db, 'interaction_notifications'),
      where('userId', '==', user.uid),
      limit(100)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      setSystemNotifications(notificationsData);
    }, (error) => {
      console.error('خطأ في جلب الإشعارات النظامية:', error);
    });

    const unsubscribeInteractionNotifications = onSnapshot(interactionNotificationsQuery, async (snapshot) => {
      const interactionNotificationsData = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // جلب معلومات المرسل إذا كان موجوداً
          let senderInfo = {};
          if (data.viewerId || data.senderId) {
            const senderData = await fetchSenderInfo(data.viewerId || data.senderId);
            if (senderData) {
              senderInfo = senderData;
            }
          }

          return {
            id: doc.id,
            userId: data.userId,
            title: data.title || 'إشعار تفاعلي',
            message: data.message || 'لا توجد تفاصيل',
            type: data.type === 'profile_view' ? 'info' : 
                  data.type === 'message_sent' ? 'success' : 
                  data.type === 'connection_request' ? 'warning' : 'info',
            isRead: data.isRead || false,
            link: data.actionUrl,
            metadata: data,
            scope: 'system',
            createdAt: data.createdAt,
            updatedAt: data.createdAt,
            actionType: data.type,
            ...senderInfo
          } as Notification;
        })
      );
      
      // ترتيب البيانات يدوياً حسب التاريخ
      const sortedData = interactionNotificationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setInteractionNotifications(sortedData);
    }, (error) => {
      console.error('خطأ في جلب الإشعارات التفاعلية:', error);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeInteractionNotifications();
    };
  }, [user, userData]);

  // دمج الإشعارات
  useEffect(() => {
    const allNotifications = [...systemNotifications, ...interactionNotifications];
    const sortedNotifications = allNotifications.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });
    
    setNotifications(sortedNotifications);
    setLoading(false);
  }, [systemNotifications, interactionNotifications]);

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      // محاولة تحديث في notifications أولاً
      try {
        await updateDoc(doc(db, 'notifications', notificationId), {
          isRead: true,
          updatedAt: new Date()
        });
        toast.success('تم تحديد الإشعار كمقروء');
      } catch (error) {
        // إذا فشل، جرب interaction_notifications
        await updateDoc(doc(db, 'interaction_notifications', notificationId), {
          isRead: true
        });
        toast.success('تم تحديد الإشعار كمقروء');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
      toast.error('حدث خطأ في تحديث الإشعار');
    }
  };

  // أرشفة الإشعار
  const archiveNotification = async (notificationId: string) => {
    try {
      // هنا يمكن إضافة منطق الأرشفة في Firebase
      toast.success('تم أرشفة الإشعار');
    } catch (error) {
      console.error('خطأ في أرشفة الإشعار:', error);
      toast.error('حدث خطأ في أرشفة الإشعار');
    }
  };

  // حذف الإشعار
  const deleteNotification = async (notificationId: string) => {
    try {
      // هنا يمكن إضافة منطق الحذف في Firebase
      toast.success('تم حذف الإشعار');
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
      toast.error('حدث خطأ في حذف الإشعار');
    }
  };

  // الرد على الإشعار
  const replyToNotification = (notification: Notification) => {
    // هنا يمكن إضافة منطق الرد
    toast.success('سيتم فتح صفحة الرد');
  };

  // إعادة توجيه الإشعار
  const forwardNotification = (notification: Notification) => {
    // هنا يمكن إضافة منطق إعادة التوجيه
    toast.success('سيتم فتح صفحة إعادة التوجيه');
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(async (notification) => {
        try {
          // محاولة تحديث في notifications أولاً
          await updateDoc(doc(db, 'notifications', notification.id), {
            isRead: true,
            updatedAt: new Date()
          });
        } catch (error) {
          // إذا فشل، جرب interaction_notifications
          await updateDoc(doc(db, 'interaction_notifications', notification.id), {
            isRead: true
          });
        }
      });
      
      await Promise.all(updatePromises);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
      toast.error('حدث خطأ في تحديث الإشعارات');
    }
  };

  // الانتقال لصفحة المرسل
  const navigateToSender = (senderId: string) => {
    // تحديد نوع الحساب والانتقال للصفحة المناسبة
    const notification = notifications.find(n => n.senderId === senderId);
    if (notification?.senderAccountType) {
      router.push(`/dashboard/${notification.senderAccountType}/profile/${senderId}`);
    } else {
      router.push(`/dashboard/profile/${senderId}`);
    }
  };

  // الانتقال لصفحة الإجراء
  const navigateToAction = (notification: Notification) => {
    if (notification.link) {
      if (notification.link.startsWith('http')) {
        window.open(notification.link, '_blank');
      } else {
        router.push(notification.link);
      }
    } else if (notification.metadata?.actionUrl) {
      if (notification.metadata.actionUrl.startsWith('http')) {
        window.open(notification.metadata.actionUrl, '_blank');
      } else {
        router.push(notification.metadata.actionUrl);
      }
    }
  };

  // إنشاء إشعارات تجريبية
  const createTestNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      // استيراد ديناميكي لتجنب مشاكل في وقت البناء
      const { 
        createTestNotification, 
        createTestInteractionNotification, 
        createTestPaymentNotification, 
        createTestWarningNotification 
      } = await import('@/lib/firebase/test-notifications');
      
      await Promise.all([
        createTestNotification(user.uid),
        createTestInteractionNotification(user.uid),
        createTestPaymentNotification(user.uid),
        createTestWarningNotification(user.uid)
      ]);
      
      toast.success('تم إنشاء الإشعارات التجريبية بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء الإشعارات التجريبية:', error);
      toast.error('حدث خطأ في إنشاء الإشعارات التجريبية');
    }
  };

  // إنشاء إشعارات متعددة
  const createMultipleNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      const { createTestNotification } = await import('@/lib/firebase/test-notifications');
      
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(createTestNotification(user.uid));
      }
      
      await Promise.all(promises);
      toast.success('تم إنشاء 10 إشعارات تجريبية بنجاح');
    } catch (error) {
      console.error('خطأ في إنشاء الإشعارات المتعددة:', error);
      toast.error('حدث خطأ في إنشاء الإشعارات المتعددة');
    }
  };

  // معالجة حالة عدم وجود مستخدم
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            يجب تسجيل الدخول أولاً
          </h3>
          <p className="text-gray-600">
            يرجى تسجيل الدخول لعرض الإشعارات
          </p>
        </div>
      </div>
    );
  }

  // معالجة حالة عدم وجود بيانات المستخدم
  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            جاري تحميل البيانات
          </h3>
          <p className="text-gray-600">
            يرجى الانتظار قليلاً...
          </p>
        </div>
      </div>
    );
  }

  return (
    <NotificationsList
      notifications={notifications}
      loading={loading}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onNavigateToSender={navigateToSender}
      onNavigateToAction={navigateToAction}
      onArchive={archiveNotification}
      onDelete={deleteNotification}
      onReply={replyToNotification}
      onForward={forwardNotification}
      onCreateTestNotifications={showTestButtons ? createTestNotifications : undefined}
      onCreateMultipleNotifications={showTestButtons ? createMultipleNotifications : undefined}
      showSenderInfo={showSenderInfo}
      title={title}
      description={description}
      showStats={showStats}
      showFilters={showFilters}
      showTestButtons={showTestButtons}
    />
  );
}

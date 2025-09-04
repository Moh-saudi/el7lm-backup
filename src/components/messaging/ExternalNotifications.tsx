'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, writeBatch, limit } from 'firebase/firestore';
import { Bell, X, Check, MessageSquare, User, Calendar, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  senderName: string;
  senderId: string;
  senderType: string;
  link: string;
  isRead: boolean;
  createdAt: any;
  updatedAt: any;
}

export default function ExternalNotifications() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // إضافة حالة التحميل للتعامل مع Hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // مراقبة الإشعارات - يجب أن يكون هذا useEffect دائماً موجود
  useEffect(() => {
    if (!user || !isClient) return;

    let retryCount = 0;
    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    const fetchNotifications = () => {
      // استخدام استعلام بسيط لا يحتاج فهرس مركب
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        limit(50) // تحديد عدد النتائج
      );

      return onSnapshot(
        notificationsQuery,
        {
          next: (snapshot) => {
            const newNotifications = snapshot.docs
              .map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Notification[];

            // ترتيب الإشعارات حسب التاريخ على جانب العميل
            const sortedNotifications = newNotifications.sort((a, b) => {
              const timeA = a.createdAt?.toMillis() || 0;
              const timeB = b.createdAt?.toMillis() || 0;
              return timeB - timeA;
            });

            setNotifications(sortedNotifications);
            setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
          },
          error: (error) => {
            console.error('خطأ في مراقبة الإشعارات:', error);
            
            // إعادة المحاولة في حالة الفشل
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(() => {
                console.log(`إعادة محاولة جلب الإشعارات (${retryCount}/${maxRetries})`);
                unsubscribe();
                setupListener();
              }, retryDelay);
            }
          }
        }
      );
    };

    let unsubscribe = () => {};
    
    const setupListener = () => {
      try {
        unsubscribe = fetchNotifications();
      } catch (error) {
        console.error('خطأ في إعداد مراقب الإشعارات:', error);
      }
    };

    setupListener();
    return () => unsubscribe();
  }, [user, isClient]);

  const formatTimeAgo = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return '';

    try {
      const date = timestamp.toDate();
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diff / (1000 * 60));

      if (diffMinutes < 1) return 'الآن';
      if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
      if (diffMinutes < 1440) return `منذ ${Math.floor(diffMinutes / 60)} ساعة`;
      if (diffMinutes < 10080) return `منذ ${Math.floor(diffMinutes / 1440)} يوم`;
      return date.toLocaleDateString('ar-EG');
    } catch (error) {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'user':
        return <User className="w-5 h-5 text-green-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const markAsRead = async (notification: Notification) => {
    if (!user) return;

    try {
      // تحديث حالة القراءة
      await updateDoc(doc(db, 'notifications', notification.id), {
        isRead: true,
        updatedAt: new Date()
      }).catch(error => {
        console.error('خطأ في تحديث حالة الإشعار:', error);
        throw error;
      });

      // التوجيه إلى الرابط إذا وجد
      if (notification.link) {
        router.push(notification.link);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
      toast.error('حدث خطأ في تحديث حالة الإشعار');
    }
  };

  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      let batchCount = 0;
      const maxBatchSize = 500;
      
      // تقسيم العمليات إلى مجموعات إذا تجاوز العدد الحد الأقصى
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      for (const notification of unreadNotifications) {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, {
          isRead: true,
          updatedAt: new Date()
        });
        
        batchCount++;
        
        // إذا وصلنا للحد الأقصى، نقوم بتنفيذ المجموعة الحالية
        if (batchCount === maxBatchSize) {
          await batch.commit();
          batchCount = 0;
        }
      }
      
      // تنفيذ المجموعة الأخيرة إذا تبقت عمليات
      if (batchCount > 0) {
        await batch.commit();
      }

      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعارات:', error);
      toast.error('حدث خطأ في تحديث حالة الإشعارات');
    }
  };

  // إذا كان التطبيق لا يزال في حالة التحميل أو لم يتم تحميله على العميل، لا نعرض شيئاً
  if (!isClient || loading) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          disabled
        >
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    );
  }

  // إذا لم يكن هناك مستخدم، لا نعرض المكون
  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="w-5 h-5" />
        {isClient && unreadCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-red-500"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* قائمة الإشعارات */}
      {isClient && isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border overflow-hidden z-50">
          <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold">الإشعارات</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <Check className="w-4 h-4 ml-1" />
                  تحديد الكل كمقروء
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                لا توجد إشعارات
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification)}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.body}
                        </p>
                        {!notification.isRead && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              جديد
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

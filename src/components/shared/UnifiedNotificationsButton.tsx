import React, { useState, useEffect } from 'react';
import { Bell, MessageCircle, X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, limit, writeBatch } from 'firebase/firestore';
import { UnifiedNotificationService } from '@/lib/notifications/unified-notification-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'interactive' | 'smart' | 'message' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  userId: string;
  accountType: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  interactive: number;
  smart: number;
  messages: number;
  system: number;
}

export default function UnifiedNotificationsButton() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({
    total: 0,
    unread: 0,
    interactive: 0,
    smart: 0,
    messages: 0,
    system: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // جلب الإشعارات من Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const notificationsRef = collection(db, 'notifications');
    
    // استخدام استعلام بدون ترتيب لتجنب مشاكل Firebase Indexing
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      const newStats: NotificationStats = {
        total: 0,
        unread: 0,
        interactive: 0,
        smart: 0,
        messages: 0,
        system: 0
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        const notification: Notification = {
          id: doc.id,
          type: data.type || 'system',
          title: data.title || '',
          message: data.message || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          priority: data.priority || 'medium',
          actionUrl: data.actionUrl,
          userId: data.userId,
          accountType: data.accountType || 'player'
        };

        notifs.push(notification);
        newStats.total++;
        
        if (!notification.read) {
          newStats.unread++;
        }

        switch (notification.type) {
          case 'interactive':
            newStats.interactive++;
            break;
          case 'smart':
            newStats.smart++;
            break;
          case 'message':
            newStats.messages++;
            break;
          case 'system':
            newStats.system++;
            break;
        }
      });

      // ترتيب البيانات يدوياً لتجنب مشاكل Firebase Indexing
      const sortedNotifs = notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // إضافة بيانات تجريبية إذا لم تكن هناك إشعارات
      if (sortedNotifs.length === 0 && user.accountType === 'trainer') {
        const demoNotifications: Notification[] = [
          {
            id: 'demo-1',
            type: 'interactive',
            title: 'جلسة تدريب جديدة',
            message: 'تم جدولة جلسة تدريب جديدة مع اللاعب أحمد محمد',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 دقيقة مضت
            read: false,
            priority: 'high',
            userId: user.uid,
            accountType: 'trainer'
          },
          {
            id: 'demo-2',
            type: 'smart',
            title: 'تحديث البرنامج التدريبي',
            message: 'تم تحديث البرنامج التدريبي بناءً على تقدم اللاعب',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // ساعتين مضتا
            read: false,
            priority: 'medium',
            userId: user.uid,
            accountType: 'trainer'
          },
          {
            id: 'demo-3',
            type: 'message',
            title: 'رسالة من الإدارة',
            message: 'يرجى مراجعة التقارير الأسبوعية قبل نهاية اليوم',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 ساعات مضت
            read: true,
            priority: 'medium',
            userId: user.uid,
            accountType: 'trainer'
          }
        ];

        sortedNotifs.push(...demoNotifications);
        newStats.total = 3;
        newStats.unread = 2;
        newStats.interactive = 1;
        newStats.smart = 1;
        newStats.messages = 1;
      }

      setNotifications(sortedNotifs);
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error('خطأ في جلب الإشعارات:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // تحديث حالة القراءة
  const markAsRead = async (notificationId: string) => {
    try {
      await UnifiedNotificationService.markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة:', error);
    }
  };

  // تحديث جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      await UnifiedNotificationService.markAllNotificationsAsRead(user.uid);
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
    }
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = priority === 'high' ? 'text-red-500' : 
                     priority === 'medium' ? 'text-yellow-500' : 'text-blue-500';
    
    switch (type) {
      case 'interactive':
        return <CheckCircle className={`w-4 h-4 ${iconClass}`} />;
      case 'smart':
        return <AlertCircle className={`w-4 h-4 ${iconClass}`} />;
      case 'message':
        return <MessageCircle className={`w-4 h-4 ${iconClass}`} />;
      default:
        return <Info className={`w-4 h-4 ${iconClass}`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-6 h-6" />
        {stats.unread > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[1000] max-h-[80vh] overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">الإشعارات</CardTitle>
                <div className="flex items-center gap-2">
                  {stats.unread > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
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
              
              {/* إحصائيات سريعة */}
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <span>إجمالي: {stats.total}</span>
                <span>غير مقروء: {stats.unread}</span>
                <span>تفاعلية: {stats.interactive}</span>
                <span>ذكية: {stats.smart}</span>
                <span>رسائل: {stats.messages}</span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <Bell className="w-12 h-12 mb-2 opacity-50" />
                    <p>لا توجد إشعارات جديدة</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div
                          className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            !notification.read ? 'bg-orange-50 dark:bg-orange-950' : ''
                          } ${getPriorityColor(notification.priority)}`}
                          onClick={() => {
                            if (!notification.read) {
                              markAsRead(notification.id);
                            }
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            {getNotificationIcon(notification.type, notification.priority)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(notification.timestamp, { 
                                    addSuffix: true, 
                                    locale: ar 
                                  })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type === 'interactive' ? 'تفاعلية' :
                                   notification.type === 'smart' ? 'ذكية' :
                                   notification.type === 'message' ? 'رسالة' : 'نظام'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

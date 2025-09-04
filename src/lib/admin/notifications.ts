// نظام التنبيهات المتقدم للأدمن
import { collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export interface AdminNotification {
  id?: string;
  type: 'payment' | 'user' | 'system' | 'security' | 'error' | 'warning' | 'info' | 'video';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  adminId?: string;
  metadata?: any;
  createdAt: Timestamp;
  readAt?: Timestamp;
  action?: {
    label: string;
    url: string;
  };
}

export interface NotificationSettings {
  adminId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationTypes: {
    payments: boolean;
    newUsers: boolean;
    systemAlerts: boolean;
    securityEvents: boolean;
    errorReports: boolean;
    newVideos: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

class AdminNotificationService {
  private static instance: AdminNotificationService;
  private notificationSubscription: PushSubscription | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.checkSupport();
  }

  static getInstance(): AdminNotificationService {
    if (!AdminNotificationService.instance) {
      AdminNotificationService.instance = new AdminNotificationService();
    }
    return AdminNotificationService.instance;
  }

  private checkSupport() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // تسجيل الأدمن للإشعارات
  async registerForNotifications(adminId: string): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      this.notificationSubscription = subscription;

      // حفظ الاشتراك في قاعدة البيانات
      await addDoc(collection(db, 'admin_subscriptions'), {
        adminId,
        subscription: JSON.stringify(subscription),
        createdAt: Timestamp.now(),
        isActive: true
      });

      return true;
    } catch (error) {
      console.error('Failed to register for notifications:', error);
      return false;
    }
  }

  // إرسال تنبيه جديد
  async sendNotification(notification: Omit<AdminNotification, 'id' | 'createdAt' | 'isRead'>): Promise<string> {
    try {
      const notificationData: AdminNotification = {
        ...notification,
        isRead: false,
        createdAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'admin_notifications'), notificationData);

      // إرسال Push Notification إذا كان مفعل
      await this.sendPushNotification(notificationData);

      // إرسال إشعارات أخرى حسب الإعدادات
      await this.sendEmailNotification(notificationData);

      return docRef.id;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  // جلب الإشعارات للأدمن
  async getNotifications(adminId?: string, unreadOnly: boolean = false): Promise<AdminNotification[]> {
    try {
      let q = query(
        collection(db, 'admin_notifications'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      if (adminId) {
        q = query(q, where('adminId', '==', adminId));
      }

      if (unreadOnly) {
        q = query(q, where('isRead', '==', false));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as AdminNotification));
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  // تحديد إشعار كمقروء
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'admin_notifications', notificationId), {
        isRead: true,
        readAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  // تحديد جميع الإشعارات كمقروءة
  async markAllAsRead(adminId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'admin_notifications'),
        where('adminId', '==', adminId),
        where('isRead', '==', false)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, {
          isRead: true,
          readAt: Timestamp.now()
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }

  // إرسال Push Notification
  private async sendPushNotification(notification: AdminNotification): Promise<void> {
    try {
      // إرسال للخادم لإرسال Push Notification
      await fetch('/api/admin/send-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          action: notification.action
        })
      });
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  // إرسال إشعار بالبريد الإلكتروني
  private async sendEmailNotification(notification: AdminNotification): Promise<void> {
    try {
      await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'admin@el7lm.com',
subject: `[El7lm Admin] ${notification.title}`,
          message: notification.message,
          type: notification.type,
          priority: notification.priority
        })
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  // إنشاء تنبيهات تلقائية للأحداث المهمة
  async createAutoNotifications() {
    const notifications = [
      // تنبيه المدفوعات الفاشلة
      {
        type: 'payment' as const,
        title: 'مدفوعات فاشلة تحتاج مراجعة',
        message: 'هناك عدد من المدفوعات الفاشلة تحتاج إلى مراجعة فورية',
        priority: 'high' as const,
        action: { label: 'مراجعة المدفوعات', url: '/dashboard/admin/payments?status=failed' }
      },
      
      // تنبيه مستخدمين جدد
      {
        type: 'user' as const,
        title: 'مستخدمين جدد في انتظار التحقق',
        message: 'هناك مستخدمين جدد يحتاجون موافقة إدارية',
        priority: 'medium' as const,
        action: { label: 'مراجعة المستخدمين', url: '/dashboard/admin/users?verified=false' }
      },

      // تنبيه النظام
      {
        type: 'system' as const,
        title: 'تحديث أسعار العملات مطلوب',
        message: 'لم يتم تحديث أسعار العملات لأكثر من 24 ساعة',
        priority: 'medium' as const,
        action: { label: 'تحديث الأسعار', url: '/dashboard/admin/system' }
      }
    ];

    for (const notification of notifications) {
      await this.sendNotification(notification);
    }
  }

  // مراقبة الفيديوهات الجديدة وإرسال إشعارات
  async checkNewVideos() {
    try {
      const collections = ['players', 'clubs', 'agents', 'parents', 'marketers'];
      let totalNewVideos = 0;
      const newVideosByUser: { [key: string]: number } = {};

      // فحص الفيديوهات الجديدة في الساعة الماضية
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      for (const collectionName of collections) {
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);
          
          snapshot.forEach((doc) => {
            const userData = doc.data();
            const userVideos = userData.videos || [];
            
            if (Array.isArray(userVideos)) {
              const newVideos = userVideos.filter((video: any) => {
                if (!video || !video.uploadDate) return false;
                const uploadDate = video.uploadDate?.toDate ? video.uploadDate.toDate() : new Date(video.uploadDate);
                return uploadDate > oneHourAgo && video.status === 'pending';
              });

              if (newVideos.length > 0) {
                totalNewVideos += newVideos.length;
                const userName = userData.full_name || userData.name || userData.userName || 'مستخدم';
                newVideosByUser[userName] = (newVideosByUser[userName] || 0) + newVideos.length;
              }
            }
          });
        } catch (error) {
          console.error(`خطأ في فحص الفيديوهات من مجموعة ${collectionName}:`, error);
        }
      }

      // إرسال إشعار إذا كان هناك فيديوهات جديدة
      if (totalNewVideos > 0) {
        const userNames = Object.keys(newVideosByUser).slice(0, 3); // أول 3 مستخدمين فقط
        const remainingUsers = Object.keys(newVideosByUser).length - 3;
        
        let message = `تم رفع ${totalNewVideos} فيديو جديد من قبل: ${userNames.join('، ')}`;
        if (remainingUsers > 0) {
          message += ` و${remainingUsers} مستخدم آخر`;
        }
        message += '. يرجى مراجعة الفيديوهات الجديدة.';

        await this.sendNotification({
          type: 'video',
          title: `فيديوهات جديدة تحتاج مراجعة (${totalNewVideos})`,
          message,
          priority: 'medium',
          action: { 
            label: 'مراجعة الفيديوهات الجديدة', 
            url: '/dashboard/admin/videos?status=pending&sort=newest' 
          },
          metadata: {
            totalNewVideos,
            newVideosByUser,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('خطأ في فحص الفيديوهات الجديدة:', error);
    }
  }

  // إرسال إشعار فوري لفيديو جديد
  async notifyNewVideo(videoData: {
    title: string;
    userName: string;
    accountType: string;
    videoId: string;
    uploadDate: Date;
  }) {
    try {
      const accountTypeText = videoData.accountType === 'player' ? 'لاعب' :
                             videoData.accountType === 'club' ? 'نادي' :
                             videoData.accountType === 'agent' ? 'وكيل' :
                             videoData.accountType === 'parent' ? 'ولي أمر' :
                             videoData.accountType === 'marketer' ? 'مسوق' :
                             videoData.accountType;

      await this.sendNotification({
        type: 'video',
        title: `فيديو جديد: ${videoData.title}`,
        message: `تم رفع فيديو جديد من قبل ${videoData.userName} (${accountTypeText}). يرجى مراجعة الفيديو.`,
        priority: 'medium',
        action: { 
          label: 'مراجعة الفيديو', 
          url: `/dashboard/admin/videos?video=${videoData.videoId}` 
        },
        metadata: {
          videoId: videoData.videoId,
          userName: videoData.userName,
          accountType: videoData.accountType,
          uploadDate: videoData.uploadDate.toISOString()
        }
      });
    } catch (error) {
      console.error('خطأ في إرسال إشعار الفيديو الجديد:', error);
    }
  }

  // إعدادات الإشعارات
  async getNotificationSettings(adminId: string): Promise<NotificationSettings | null> {
    try {
      const q = query(
        collection(db, 'admin_notification_settings'),
        where('adminId', '==', adminId)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs[0].data() as NotificationSettings;
      }
      return null;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return null;
    }
  }

  // تحديث إعدادات الإشعارات
  async updateNotificationSettings(settings: NotificationSettings): Promise<void> {
    try {
      const q = query(
        collection(db, 'admin_notification_settings'),
        where('adminId', '==', settings.adminId)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        await updateDoc(snapshot.docs[0].ref, settings);
      } else {
        await addDoc(collection(db, 'admin_notification_settings'), settings);
      }
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  // فحص دوري للأحداث المهمة
  startPeriodicChecks() {
    // فحص كل 5 دقائق
    setInterval(async () => {
      await this.checkCriticalEvents();
    }, 5 * 60 * 1000);

    // فحص الفيديوهات الجديدة كل 15 دقيقة
    setInterval(async () => {
      await this.checkNewVideos();
    }, 15 * 60 * 1000);

    // فحص يومي للتقارير
    setInterval(async () => {
      await this.generateDailyReport();
    }, 24 * 60 * 60 * 1000);
  }

  private async checkCriticalEvents() {
    try {
      // فحص المدفوعات الفاشلة
      const failedPaymentsQuery = query(
        collection(db, 'payments'),
        where('status', '==', 'failed'),
        where('createdAt', '>', new Date(Date.now() - 60 * 60 * 1000)) // آخر ساعة
      );
      
      const failedPayments = await getDocs(failedPaymentsQuery);
      
      if (failedPayments.size > 5) {
        await this.sendNotification({
          type: 'payment',
          title: 'تحذير: عدد كبير من المدفوعات الفاشلة',
          message: `تم رصد ${failedPayments.size} مدفوعات فاشلة في الساعة الماضية`,
          priority: 'critical',
          action: { label: 'فحص الآن', url: '/dashboard/admin/payments?status=failed' }
        });
      }

      // فحص اتصال قاعدة البيانات
      await this.checkDatabaseHealth();
      
    } catch (error) {
      console.error('Error in periodic checks:', error);
      await this.sendNotification({
        type: 'system',
        title: 'خطأ في النظام',
        message: 'حدث خطأ أثناء الفحص الدوري للنظام',
        priority: 'high'
      });
    }
  }

  private async checkDatabaseHealth() {
    try {
      const testQuery = await getDocs(query(collection(db, 'users'), limit(1)));
      // إذا نجح الاستعلام فقاعدة البيانات تعمل بشكل جيد
    } catch (error) {
      await this.sendNotification({
        type: 'system',
        title: 'تحذير: مشكلة في قاعدة البيانات',
        message: 'فشل في الاتصال بقاعدة البيانات',
        priority: 'critical',
        action: { label: 'فحص النظام', url: '/dashboard/admin/system' }
      });
    }
  }

  private async generateDailyReport() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // حساب إحصائيات اليوم
      const todayStats = {
        newUsers: 0,
        newPayments: 0,
        failedPayments: 0,
        totalRevenue: 0
      };

      // إرسال تقرير يومي
      await this.sendNotification({
        type: 'info',
        title: 'التقرير اليومي',
        message: `مستخدمين جدد: ${todayStats.newUsers} | مدفوعات: ${todayStats.newPayments} | إيرادات: ${todayStats.totalRevenue} EGP`,
        priority: 'low',
        action: { label: 'عرض التفاصيل', url: '/dashboard/admin/reports/financial' }
      });
    } catch (error) {
      console.error('Failed to generate daily report:', error);
    }
  }
}

export const adminNotificationService = AdminNotificationService.getInstance();

// دوال مساعدة للاستخدام السريع
export const sendAdminAlert = (title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  return adminNotificationService.sendNotification({
    type: 'info',
    title,
    message,
    priority
  });
};

export const sendPaymentAlert = (message: string, paymentId?: string) => {
  return adminNotificationService.sendNotification({
    type: 'payment',
    title: 'تنبيه مدفوعات',
    message,
    priority: 'high',
    action: paymentId ? {
      label: 'عرض المدفوعة',
      url: `/dashboard/admin/payments?id=${paymentId}`
    } : undefined
  });
};

export const sendSecurityAlert = (message: string, userId?: string) => {
  return adminNotificationService.sendNotification({
    type: 'security',
    title: 'تحذير أمني',
    message,
    priority: 'critical',
    action: userId ? {
      label: 'عرض المستخدم',
      url: `/dashboard/admin/users?id=${userId}`
    } : undefined
  });
}; 

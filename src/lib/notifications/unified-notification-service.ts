import { db } from '@/lib/firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

export interface NotificationData {
  userId: string;
  type: 'interactive' | 'smart' | 'message' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  accountType: string;
  read?: boolean;
  metadata?: Record<string, any>;
}

export interface MessageData {
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  priority: 'low' | 'medium' | 'high';
  senderName: string;
  senderAvatar?: string;
  read?: boolean;
  metadata?: Record<string, any>;
}

export class UnifiedNotificationService {
  // إنشاء إشعار جديد
  static async createNotification(data: NotificationData): Promise<string> {
    try {
      const notificationData = {
        ...data,
        timestamp: serverTimestamp(),
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إنشاء الإشعار:', error);
      throw error;
    }
  }

  // إنشاء رسالة جديدة
  static async createMessage(data: MessageData): Promise<string> {
    try {
      const messageData = {
        ...data,
        timestamp: serverTimestamp(),
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'messages'), messageData);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إنشاء الرسالة:', error);
      throw error;
    }
  }

  // تحديث حالة القراءة للإشعار
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة للإشعار:', error);
      throw error;
    }
  }

  // تحديث حالة القراءة للرسالة
  static async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة للرسالة:', error);
      throw error;
    }
  }

  // تحديث جميع الإشعارات كمقروءة
  static async markAllNotificationsAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
      throw error;
    }
  }

  // تحديث جميع الرسائل كمقروءة
  static async markAllMessagesAsRead(userId: string): Promise<void> {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('receiverId', '==', userId),
        where('read', '==', false)
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (error) {
      console.error('خطأ في تحديث جميع الرسائل:', error);
      throw error;
    }
  }

  // حذف إشعار
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error('خطأ في حذف الإشعار:', error);
      throw error;
    }
  }

  // حذف رسالة
  static async deleteMessage(messageId: string): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await deleteDoc(messageRef);
    } catch (error) {
      console.error('خطأ في حذف الرسالة:', error);
      throw error;
    }
  }

  // جلب إحصائيات الإشعارات
  static async getNotificationStats(userId: string) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(notificationsRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const stats = {
        total: 0,
        unread: 0,
        interactive: 0,
        smart: 0,
        system: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        
        if (!data.read) {
          stats.unread++;
        }

        switch (data.type) {
          case 'interactive':
            stats.interactive++;
            break;
          case 'smart':
            stats.smart++;
            break;
          case 'system':
            stats.system++;
            break;
        }

        switch (data.priority) {
          case 'high':
            stats.high++;
            break;
          case 'medium':
            stats.medium++;
            break;
          case 'low':
            stats.low++;
            break;
        }
      });

      return stats;
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الإشعارات:', error);
      throw error;
    }
  }

  // جلب إحصائيات الرسائل
  static async getMessageStats(userId: string) {
    try {
      const messagesRef = collection(db, 'messages');
      const receivedQuery = query(
        messagesRef,
        where('receiverId', '==', userId)
      );
      const sentQuery = query(
        messagesRef,
        where('senderId', '==', userId)
      );

      const [receivedSnapshot, sentSnapshot] = await Promise.all([
        getDocs(receivedQuery),
        getDocs(sentQuery)
      ]);

      const stats = {
        total: 0,
        unread: 0,
        sent: 0,
        received: 0,
        urgent: 0,
        today: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // الرسائل المستلمة
      receivedSnapshot.forEach((doc) => {
        const data = doc.data();
        stats.total++;
        stats.received++;
        
        if (!data.read) {
          stats.unread++;
        }

        if (data.priority === 'high') {
          stats.urgent++;
        }

        if (data.timestamp?.toDate() >= today) {
          stats.today++;
        }
      });

      // الرسائل المرسلة
      sentSnapshot.forEach((doc) => {
        stats.total++;
        stats.sent++;
      });

      return stats;
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الرسائل:', error);
      throw error;
    }
  }

  // إنشاء إشعارات نظامية
  static async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    accountType: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    actionUrl?: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: 'system',
      title,
      message,
      priority,
      actionUrl,
      accountType
    });
  }

  // إنشاء إشعار تفاعلي
  static async createInteractiveNotification(
    userId: string,
    title: string,
    message: string,
    accountType: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    actionUrl?: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: 'interactive',
      title,
      message,
      priority,
      actionUrl,
      accountType
    });
  }

  // إنشاء إشعار ذكي
  static async createSmartNotification(
    userId: string,
    title: string,
    message: string,
    accountType: string,
    priority: 'low' | 'medium' | 'high' = 'medium',
    actionUrl?: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: 'smart',
      title,
      message,
      priority,
      actionUrl,
      accountType
    });
  }
}


import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { VideoActionLog, PlayerActionLog, VideoLogEntry, PlayerLogEntry } from '@/types/admin';

class ActionLogService {
  private static instance: ActionLogService;

  static getInstance(): ActionLogService {
    if (!ActionLogService.instance) {
      ActionLogService.instance = new ActionLogService();
    }
    return ActionLogService.instance;
  }

  // تسجيل إجراء على فيديو
  async logVideoAction(logData: Omit<VideoActionLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const logEntry: Omit<VideoActionLog, 'id'> = {
        ...logData,
        timestamp: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'video_action_logs'), logEntry);
      console.log(`✅ تم تسجيل إجراء الفيديو: ${logData.action} للفيديو ${logData.videoId}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في تسجيل إجراء الفيديو:', error);
      throw error;
    }
  }

  // تسجيل إجراء على لاعب
  async logPlayerAction(logData: Omit<PlayerActionLog, 'id' | 'timestamp'>): Promise<string> {
    try {
      const logEntry: Omit<PlayerActionLog, 'id'> = {
        ...logData,
        timestamp: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'player_action_logs'), logEntry);
      console.log(`✅ تم تسجيل إجراء اللاعب: ${logData.action} للاعب ${logData.playerId}`);
      return docRef.id;
    } catch (error) {
      console.error('❌ خطأ في تسجيل إجراء اللاعب:', error);
      throw error;
    }
  }

  // الحصول على سجل فيديو معين
  async getVideoLogs(videoId: string, limitCount: number = 50): Promise<VideoLogEntry[]> {
    try {
      // المحاولة 1: استعلام مع orderBy (يتطلب فهرس مركب)
      try {
        const q = query(
          collection(db, 'video_action_logs'),
          where('videoId', '==', videoId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
        const snapshot = await getDocs(q);
        const logs: VideoLogEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          logs.push({
            id: doc.id,
            videoId: data.videoId,
            playerId: data.playerId,
            playerName: data.playerName || 'مستخدم',
            videoTitle: data.videoTitle || 'فيديو',
            action: data.action,
            actionBy: data.actionBy,
            actionByType: data.actionByType,
            timestamp: data.timestamp,
            status: data.details?.newStatus || data.details?.oldStatus || 'غير محدد',
            notes: data.details?.notes || data.details?.adminNotes,
            notificationSent: data.details?.notificationType ? true : false,
            notificationType: data.details?.notificationType
          });
        });
        return logs;
      } catch (innerError: any) {
        // إذا كان الخطأ بسبب الفهرس، نستخدم مسار احتياطي بدون orderBy ونقوم بالفرز على جهة العميل
        const message = String(innerError?.message || '');
        if (message.includes('The query requires an index')) {
          console.warn('⚠️ لا يوجد فهرس مركب لاستعلام السجل. سيتم استخدام مسار احتياطي مع فرز على العميل.');
          const qNoOrder = query(
            collection(db, 'video_action_logs'),
            where('videoId', '==', videoId),
            limit(limitCount)
          );
          const snapshot = await getDocs(qNoOrder);
          const logs: VideoLogEntry[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            logs.push({
              id: doc.id,
              videoId: data.videoId,
              playerId: data.playerId,
              playerName: data.playerName || 'مستخدم',
              videoTitle: data.videoTitle || 'فيديو',
              action: data.action,
              actionBy: data.actionBy,
              actionByType: data.actionByType,
              timestamp: data.timestamp,
              status: data.details?.newStatus || data.details?.oldStatus || 'غير محدد',
              notes: data.details?.notes || data.details?.adminNotes,
              notificationSent: data.details?.notificationType ? true : false,
              notificationType: data.details?.notificationType
            });
          });
          // فرز تنازلياً حسب timestamp على جهة العميل
          logs.sort((a, b) => {
            const ta = (a.timestamp as any)?.toDate ? (a.timestamp as any).toDate().getTime() : new Date(a.timestamp as any).getTime();
            const tb = (b.timestamp as any)?.toDate ? (b.timestamp as any).toDate().getTime() : new Date(b.timestamp as any).getTime();
            return tb - ta;
          });
          return logs;
        }
        throw innerError;
      }
    } catch (error) {
      console.error('❌ خطأ في جلب سجل الفيديو:', error);
      return [];
    }
  }

  // الحصول على سجل لاعب معين
  async getPlayerLogs(playerId: string, limitCount: number = 50): Promise<PlayerLogEntry[]> {
    try {
      const q = query(
        collection(db, 'player_action_logs'),
        where('playerId', '==', playerId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const logs: PlayerLogEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          playerId: data.playerId,
          playerName: data.playerName || 'مستخدم',
          action: data.action,
          actionBy: data.actionBy,
          actionByType: data.actionByType,
          timestamp: data.timestamp,
          videoCount: data.details?.videoCount,
          videosAffected: data.details?.videosAffected,
          details: data.details
        });
      });

      return logs;
    } catch (error) {
      console.error('❌ خطأ في جلب سجل اللاعب:', error);
      return [];
    }
  }

  // الحصول على جميع سجلات الفيديوهات
  async getAllVideoLogs(limitCount: number = 100): Promise<VideoLogEntry[]> {
    try {
      const q = query(
        collection(db, 'video_action_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const logs: VideoLogEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          videoId: data.videoId,
          playerId: data.playerId,
          playerName: data.playerName || 'مستخدم',
          videoTitle: data.videoTitle || 'فيديو',
          action: data.action,
          actionBy: data.actionBy,
          actionByType: data.actionByType,
          timestamp: data.timestamp,
          status: data.details?.newStatus || data.details?.oldStatus || 'غير محدد',
          notes: data.details?.notes || data.details?.adminNotes,
          notificationSent: data.details?.notificationType ? true : false,
          notificationType: data.details?.notificationType
        });
      });

      return logs;
    } catch (error) {
      console.error('❌ خطأ في جلب جميع سجلات الفيديوهات:', error);
      return [];
    }
  }

  // الحصول على جميع سجلات اللاعبين
  async getAllPlayerLogs(limitCount: number = 100): Promise<PlayerLogEntry[]> {
    try {
      const q = query(
        collection(db, 'player_action_logs'),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const logs: PlayerLogEntry[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          playerId: data.playerId,
          playerName: data.playerName || 'مستخدم',
          action: data.action,
          actionBy: data.actionBy,
          actionByType: data.actionByType,
          timestamp: data.timestamp,
          videoCount: data.details?.videoCount,
          videosAffected: data.details?.videosAffected,
          details: data.details
        });
      });

      return logs;
    } catch (error) {
      console.error('❌ خطأ في جلب جميع سجلات اللاعبين:', error);
      return [];
    }
  }

  // تسجيل رفع فيديو جديد
  async logVideoUpload(videoData: {
    videoId: string;
    playerId: string;
    playerName: string;
    videoTitle: string;
    actionBy: string;
    actionByType: 'admin' | 'system' | 'player';
  }): Promise<void> {
    await this.logVideoAction({
      videoId: videoData.videoId,
      playerId: videoData.playerId,
      action: 'upload',
      actionBy: videoData.actionBy,
      actionByType: videoData.actionByType,
      details: {
        newStatus: 'pending'
      },
      metadata: {
        playerName: videoData.playerName,
        videoTitle: videoData.videoTitle
      }
    });

    // تسجيل إجراء اللاعب أيضاً
    await this.logPlayerAction({
      playerId: videoData.playerId,
      action: 'video_upload',
      actionBy: videoData.actionBy,
      actionByType: videoData.actionByType,
      details: {
        videoId: videoData.videoId,
        videoTitle: videoData.videoTitle
      },
      metadata: {
        playerName: videoData.playerName
      }
    });
  }

  // تسجيل مراجعة فيديو
  async logVideoReview(videoData: {
    videoId: string;
    playerId: string;
    playerName: string;
    videoTitle: string;
    oldStatus: string;
    newStatus: string;
    actionBy: string;
    actionByType: 'admin' | 'system' | 'player';
    notes?: string;
    adminNotes?: string;
  }): Promise<void> {
    await this.logVideoAction({
      videoId: videoData.videoId,
      playerId: videoData.playerId,
      action: 'status_change',
      actionBy: videoData.actionBy,
      actionByType: videoData.actionByType,
      details: {
        oldStatus: videoData.oldStatus,
        newStatus: videoData.newStatus,
        notes: videoData.notes,
        adminNotes: videoData.adminNotes
      },
      metadata: {
        playerName: videoData.playerName,
        videoTitle: videoData.videoTitle
      }
    });

    // تسجيل إجراء اللاعب أيضاً
    await this.logPlayerAction({
      playerId: videoData.playerId,
      action: 'video_review',
      actionBy: videoData.actionBy,
      actionByType: videoData.actionByType,
      details: {
        videoId: videoData.videoId,
        videoTitle: videoData.videoTitle,
        oldStatus: videoData.oldStatus,
        newStatus: videoData.newStatus,
        adminNotes: videoData.adminNotes
      },
      metadata: {
        playerName: videoData.playerName
      }
    });
  }

  // تسجيل إرسال إشعار
  async logNotificationSent(videoData: {
    videoId: string;
    playerId: string;
    playerName: string;
    videoTitle: string;
    actionBy: string;
    actionByType: 'admin' | 'system' | 'player';
    notificationType: 'sms' | 'whatsapp' | 'in_app';
    notificationMessage: string;
  }): Promise<void> {
    await this.logVideoAction({
      videoId: videoData.videoId,
      playerId: videoData.playerId,
      action: 'notification_sent',
      actionBy: videoData.actionBy,
      actionByType: videoData.actionByType,
      details: {
        notificationType: videoData.notificationType,
        notificationMessage: videoData.notificationMessage
      },
      metadata: {
        playerName: videoData.playerName,
        videoTitle: videoData.videoTitle
      }
    });

    // تسجيل إجراء اللاعب أيضاً
    await this.logPlayerAction({
      playerId: videoData.playerId,
      action: 'notification_sent',
      actionBy: videoData.actionBy,
      actionByType: videoData.actionByType,
      details: {
        videoId: videoData.videoId,
        videoTitle: videoData.videoTitle,
        notificationType: videoData.notificationType,
        notificationMessage: videoData.notificationMessage
      },
      metadata: {
        playerName: videoData.playerName
      }
    });
  }

  // التأكد من تسجيل رفع الفيديو وإرسال إشعار تلقائي مرة واحدة فقط
  async ensureUploadLoggedAndNotified(params: {
    videoId: string;
    playerId: string;
    playerName: string;
    videoTitle: string;
    notificationTitle?: string;
    notificationMessage?: string;
  }): Promise<{ created: boolean }> {
    try {
      // جلب السجلات الخاصة بالفيديو بدون orderBy لتجنب الحاجة إلى فهرس مركب
      const q = query(
        collection(db, 'video_action_logs'),
        where('videoId', '==', params.videoId),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const hasUploadLog = snapshot.docs.some(d => d.data().action === 'upload');
      if (hasUploadLog) {
        return { created: false };
      }

      // تسجيل رفع الفيديو
      await this.logVideoUpload({
        videoId: params.videoId,
        playerId: params.playerId,
        playerName: params.playerName,
        videoTitle: params.videoTitle,
        actionBy: 'system',
        actionByType: 'system'
      });

      // إنشاء إشعار داخل التطبيق للمستخدم
      const notificationTitle = params.notificationTitle || 'تم رفع الفيديو';
      const notificationBody = params.notificationMessage || `تم رفع الفيديو "${params.videoTitle}" وهو الآن قيد المراجعة.`;

      const notificationRef = doc(collection(db, 'notifications'));
      await updateDoc(notificationRef, {} as any).catch(() => {}); // no-op to ensure ref type
      await addDoc(collection(db, 'notifications'), {
        userId: params.playerId,
        title: notificationTitle,
        body: notificationBody,
        type: 'video',
        senderName: 'النظام',
        senderId: 'system',
        senderType: 'system',
        link: `/dashboard/player/videos`,
        isRead: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        metadata: {
          videoId: params.videoId,
          event: 'upload'
        }
      });

      // تسجيل إرسال الإشعار في السجلات
      await this.logNotificationSent({
        videoId: params.videoId,
        playerId: params.playerId,
        playerName: params.playerName,
        videoTitle: params.videoTitle,
        actionBy: 'system',
        actionByType: 'system',
        notificationType: 'in_app',
        notificationMessage: notificationBody
      });

      return { created: true };
    } catch (error) {
      console.error('❌ فشل ensureUploadLoggedAndNotified:', error);
      return { created: false };
    }
  }
}

export const actionLogService = ActionLogService.getInstance();


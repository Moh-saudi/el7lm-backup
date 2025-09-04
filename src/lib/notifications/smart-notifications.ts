import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DateOrTimestamp } from '../../types/common';

export interface SmartNotification {
  id?: string;
  userId: string; // المستلم
  viewerId: string; // المشاهد
  viewerName: string;
  viewerType: string;
  type: 'profile_view' | 'search_result' | 'connection_request' | 'achievement' | 'trending';
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    viewCount?: number;
    searchTerm?: string;
    achievementType?: string;
    trendingRank?: number;
  };
  createdAt: DateOrTimestamp;
  expiresAt?: DateOrTimestamp;
}

// رسائل محفزة ومتطورة
const MOTIVATIONAL_MESSAGES = {
  profile_view: [
    { emoji: '👀', title: 'شخص مهتم بك!', message: 'قام {viewerName} بمشاهدة ملفك الشخصي. اهتمامهم بك يعني أنك على الطريق الصحيح!' },
    { emoji: '⭐', title: 'ملفك يجذب الانتباه', message: '{viewerName} من {viewerType} شاهد ملفك. استمر في تطوير نفسك!' },
    { emoji: '🚀', title: 'أنت تحت الأضواء', message: 'شخص آخر اكتشف موهبتك! {viewerName} يتابع تقدمك باهتمام.' },
    { emoji: '💫', title: 'نجومك تتألق', message: 'ملفك الشخصي يجذب الانتباه! {viewerName} من {viewerType} معجب بمسارك.' },
    { emoji: '🎯', title: 'أنت في دائرة الاهتمام', message: '{viewerName} يتابعك عن كثب. استمر في التميز!' }
  ],
  search_result: [
    { emoji: '🔍', title: 'تم العثور عليك!', message: 'شخص يبحث عن {searchTerm} وجدك! أنت في قمة النتائج.' },
    { emoji: '🏆', title: 'أنت الأفضل في البحث', message: 'عند البحث عن {searchTerm}، أنت في المقدمة! تميزك واضح.' },
    { emoji: '💎', title: 'كنز تم اكتشافه', message: 'شخص يبحث عن {searchTerm} وجدك! أنت الكنز المفقود.' },
    { emoji: '🌟', title: 'نجم في السماء', message: 'عند البحث عن {searchTerm}، أنت النجم اللامع! استمر في التميز.' },
    { emoji: '🎖️', title: 'أنت الأول في البحث', message: 'عند البحث عن {searchTerm}، أنت في المرتبة الأولى! فخر لنا.' }
  ],
  connection_request: [
    { emoji: '🤝', title: 'طلب تواصل جديد!', message: '{viewerName} يريد التواصل معك. فرصة ذهبية للتعاون!' },
    { emoji: '💼', title: 'فرصة مهنية', message: '{viewerName} من {viewerType} يريد التعاون معك. مستقبلك ينتظر!' },
    { emoji: '🎯', title: 'هدف جديد', message: '{viewerName} يرى فيك شريك مثالي. استثمر في هذه العلاقة!' },
    { emoji: '🚀', title: 'انطلاق نحو النجاح', message: '{viewerName} يريد أن يكون جزءاً من رحلتك نحو النجاح!' },
    { emoji: '💫', title: 'شراكة ناجحة', message: '{viewerName} يرى فيك شريكاً مثالياً. المستقبل ينتظر!' }
  ],
  achievement: [
    { emoji: '🏆', title: 'إنجاز جديد!', message: 'لقد حققت {achievementType}! أنت تتقدم بسرعة مذهلة.' },
    { emoji: '⭐', title: 'نجم متألق', message: 'إنجاز {achievementType} يثبت أنك على الطريق الصحيح!' },
    { emoji: '🎖️', title: 'ميدالية جديدة', message: 'حصلت على {achievementType}! استمر في التميز.' },
    { emoji: '🌟', title: 'نجم في السماء', message: '{achievementType} يثبت أنك نجم حقيقي!' },
    { emoji: '💎', title: 'كنز ثمين', message: 'إنجاز {achievementType} يجعلك كنزاً ثميناً!' }
  ],
  trending: [
    { emoji: '🔥', title: 'أنت ترند!', message: 'ملفك في المرتبة {rank} في الترند! أنت نجم حقيقي.' },
    { emoji: '⚡', title: 'سرعة البرق', message: 'أنت في المرتبة {rank} في الترند! سرعتك مذهلة.' },
    { emoji: '🚀', title: 'انطلاق نحو النجوم', message: 'المرتبة {rank} في الترند! أنت تتجه نحو النجوم.' },
    { emoji: '💫', title: 'نجم متألق', message: 'في المرتبة {rank} في الترند! تألقك واضح للجميع.' },
    { emoji: '🎯', title: 'هدف محقق', message: 'المرتبة {rank} في الترند! أهدافك تتحقق بسرعة.' }
  ]
};

// رسائل عشوائية محفزة
const RANDOM_MOTIVATIONAL_MESSAGES = [
  { emoji: '💪', message: 'قوتك الداخلية تجذب الانتباه!' },
  { emoji: '🎯', message: 'أهدافك واضحة وطموحاتك عالية!' },
  { emoji: '🌟', message: 'أنت نجم في سماء النجاح!' },
  { emoji: '🚀', message: 'سرعة تقدمك مذهلة!' },
  { emoji: '💎', message: 'قيمتك الحقيقية تتجلى للجميع!' },
  { emoji: '🏆', message: 'أنت بطلاً في مجالك!' },
  { emoji: '⭐', message: 'تميزك يجعلك فريداً!' },
  { emoji: '🎖️', message: 'إنجازاتك تتحدث عن نفسها!' },
  { emoji: '🔥', message: 'شغفك يضيء الطريق للآخرين!' },
  { emoji: '💫', message: 'أنت مصدر إلهام للكثيرين!' }
];

class SmartNotificationService {
  // إرسال إشعار مشاهدة الملف الشخصي
  async sendProfileViewNotification(
    profileOwnerId: string,
    viewerId: string,
    viewerName: string,
    viewerType: string
  ): Promise<string> {
    try {
      const messages = MOTIVATIONAL_MESSAGES.profile_view;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const randomMotivational = RANDOM_MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * RANDOM_MOTIVATIONAL_MESSAGES.length)];

      const notification: SmartNotification = {
        userId: profileOwnerId,
        viewerId,
        viewerName,
        viewerType,
        type: 'profile_view',
        title: randomMessage.title,
        message: randomMessage.message
          .replace('{viewerName}', viewerName)
          .replace('{viewerType}', this.getTypeName(viewerType)) + 
          ' ' + randomMotivational.message,
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'medium',
        actionUrl: `/dashboard/profile/${viewerId}`,
        metadata: {
          viewCount: 1
        },
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // أسبوع
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), notification);
      
      // تحديث عداد المشاهدات
      await this.updateViewCount(profileOwnerId);
      
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إرسال إشعار مشاهدة الملف:', error);
      throw error;
    }
  }

  // إرسال إشعار نتيجة البحث
  async sendSearchResultNotification(
    userId: string,
    searcherId: string,
    searcherName: string,
    searcherType: string,
    searchTerm: string,
    rank: number
  ): Promise<string> {
    try {
      const messages = MOTIVATIONAL_MESSAGES.search_result;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: SmartNotification = {
        userId,
        viewerId: searcherId,
        viewerName: searcherName,
        viewerType: searcherType,
        type: 'search_result',
        title: randomMessage.title,
        message: randomMessage.message.replace('{searchTerm}', searchTerm),
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'high',
        actionUrl: `/dashboard/search?term=${encodeURIComponent(searchTerm)}`,
        metadata: {
          searchTerm,
          viewCount: rank
        },
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 أيام
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), notification);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إرسال إشعار نتيجة البحث:', error);
      throw error;
    }
  }

  // إرسال إشعار طلب تواصل
  async sendConnectionRequestNotification(
    userId: string,
    requesterId: string,
    requesterName: string,
    requesterType: string
  ): Promise<string> {
    try {
      const messages = MOTIVATIONAL_MESSAGES.connection_request;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: SmartNotification = {
        userId,
        viewerId: requesterId,
        viewerName: requesterName,
        viewerType: requesterType,
        type: 'connection_request',
        title: randomMessage.title,
        message: randomMessage.message
          .replace('{viewerName}', requesterName)
          .replace('{viewerType}', this.getTypeName(requesterType)),
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'urgent',
        actionUrl: `/dashboard/connections/${requesterId}`,
        metadata: {
          viewCount: 1
        },
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // أسبوعين
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), notification);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إرسال إشعار طلب تواصل:', error);
      throw error;
    }
  }

  // إرسال إشعار إنجاز
  async sendAchievementNotification(
    userId: string,
    achievementType: string,
    achievementValue?: number
  ): Promise<string> {
    try {
      const messages = MOTIVATIONAL_MESSAGES.achievement;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: SmartNotification = {
        userId,
        viewerId: 'system',
        viewerName: 'النظام',
        viewerType: 'system',
        type: 'achievement',
        title: randomMessage.title,
        message: randomMessage.message.replace('{achievementType}', achievementType),
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'high',
        actionUrl: `/dashboard/achievements`,
        metadata: {
          achievementType,
          viewCount: achievementValue || 1
        },
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // شهر
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), notification);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إرسال إشعار إنجاز:', error);
      throw error;
    }
  }

  // إرسال إشعار ترند
  async sendTrendingNotification(
    userId: string,
    rank: number,
    category: string
  ): Promise<string> {
    try {
      const messages = MOTIVATIONAL_MESSAGES.trending;
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      const notification: SmartNotification = {
        userId,
        viewerId: 'system',
        viewerName: 'النظام',
        viewerType: 'system',
        type: 'trending',
        title: randomMessage.title,
        message: randomMessage.message.replace('{rank}', rank.toString()),
        emoji: randomMessage.emoji,
        isRead: false,
        priority: 'urgent',
        actionUrl: `/dashboard/trending`,
        metadata: {
          trendingRank: rank,
          viewCount: 1
        },
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // يوم واحد
      };

      const docRef = await addDoc(collection(db, 'smart_notifications'), notification);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إرسال إشعار ترند:', error);
      throw error;
    }
  }

  // تحديث عداد المشاهدات
  private async updateViewCount(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        profileViews: increment(1),
        lastViewedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('خطأ في تحديث عداد المشاهدات:', error);
    }
  }

  // الحصول على اسم النوع
  private getTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      'player': 'لاعب',
      'club': 'نادي',
      'academy': 'أكاديمية',
      'agent': 'وكيل',
      'trainer': 'مدرب',
      'admin': 'مشرف'
    };
    return typeNames[type] || 'مستخدم';
  }
}

export const smartNotificationService = new SmartNotificationService(); 

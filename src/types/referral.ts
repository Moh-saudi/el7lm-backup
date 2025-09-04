import { DateOrTimestamp } from './common';

// نظام النقاط والمكافآت
export interface PlayerRewards {
  playerId: string;
  totalPoints: number;
  availablePoints: number;
  totalEarnings: number; // بالدولار
  referralCount: number;
  badges: Badge[];
  lastUpdated: DateOrTimestamp;
  createdAt: DateOrTimestamp;
}

// الشارات
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: number;
  earnedAt: DateOrTimestamp;
  category: 'referral' | 'video' | 'academy' | 'achievement';
}

// الإحالات
export interface Referral {
  id: string;
  referrerId: string;        // اللاعب المحيل
  referredId: string;        // اللاعب الجديد
  referralCode: string;      // كود الإحالة
  status: 'pending' | 'completed' | 'expired';
  createdAt: DateOrTimestamp;
  completedAt?: DateOrTimestamp;
  rewards: {
    referrerPoints: number;   // 10000 نقطة = 1 دولار
    referredPoints: number;   // 5000 نقطة للاعب الجديد
    referrerBadges: string[];
  };
}

// متجر المنتجات الرياضية
export interface SportsProduct {
  id: string;
  name: string;
  description: string;
  category: 'equipment' | 'clothing' | 'accessories' | 'nutrition';
  price: number; // بالدولار
  pointsPrice: number; // بالنقاط
  image: string;
  stock: number;
  isAvailable: boolean;
  createdAt: DateOrTimestamp;
}

// طلبات الشراء
export interface PurchaseOrder {
  id: string;
  playerId: string;
  productId: string;
  quantity: number;
  totalPoints: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: DateOrTimestamp;
  shippedAt?: DateOrTimestamp;
  deliveredAt?: DateOrTimestamp;
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    country: string;
  };
}

// دروس أكاديمية الحلم
export interface DreamAcademyLesson {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: number; // بالدقائق
  pointsPrice: number;
  videoUrl: string;
  thumbnail: string;
  category: 'technical' | 'tactical' | 'physical' | 'mental';
  level: 'beginner' | 'intermediate' | 'advanced';
  isAvailable: boolean;
  createdAt: DateOrTimestamp;
}

// طلبات الدروس
export interface LessonOrder {
  id: string;
  playerId: string;
  lessonId: string;
  pointsSpent: number;
  status: 'purchased' | 'watched' | 'completed';
  purchasedAt: DateOrTimestamp;
  watchedAt?: DateOrTimestamp;
  completedAt?: DateOrTimestamp;
}

// فيديوهات اللاعبين
export interface PlayerVideo {
  id: string;
  playerId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  views: number;
  likes: number;
  pointsEarned: number; // 1000 نقطة لكل فيديو
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: DateOrTimestamp;
  approvedAt?: DateOrTimestamp;
}

// إحصائيات الإحالات
export interface ReferralStats {
  playerId: string;
  totalReferrals: number;
  completedReferrals: number;
  totalPointsEarned: number;
  totalEarnings: number; // بالدولار
  monthlyReferrals: {
    [month: string]: number;
  };
  topReferrers: {
    playerId: string;
    playerName: string;
    referralCount: number;
    totalEarnings: number;
  }[];
}

// نظام الشارات المحدث
export const BADGES = {
  // شارات الإحالات
  REFERRAL_BADGES: [
    {
      id: 'first_referral',
      name: 'محيل مبتدئ',
      description: 'أول إحالة ناجحة',
      icon: '🎯',
      color: 'bg-blue-500',
      requirement: 1,
      category: 'referral' as const
    },
    {
      id: 'active_referrer',
      name: 'محيل نشط',
      description: '5 إحالات ناجحة',
      icon: '🔥',
      color: 'bg-orange-500',
      requirement: 5,
      category: 'referral' as const
    },
    {
      id: 'pro_referrer',
      name: 'محيل محترف',
      description: '10 إحالات ناجحة',
      icon: '⭐',
      color: 'bg-purple-500',
      requirement: 10,
      category: 'referral' as const
    },
    {
      id: 'golden_referrer',
      name: 'محيل ذهبي',
      description: '20 إحالة ناجحة',
      icon: '👑',
      color: 'bg-yellow-500',
      requirement: 20,
      category: 'referral' as const
    },
    {
      id: 'master_referrer',
      name: 'محيل أسطوري',
      description: '50 إحالة ناجحة',
      icon: '🏆',
      color: 'bg-red-500',
      requirement: 50,
      category: 'referral' as const
    }
  ],
  
  // شارات الفيديوهات
  VIDEO_BADGES: [
    {
      id: 'first_video',
      name: 'مصور مبتدئ',
      description: 'أول فيديو تم رفعه',
      icon: '📹',
      color: 'bg-green-500',
      requirement: 1,
      category: 'video' as const
    },
    {
      id: 'video_creator',
      name: 'منشئ محتوى',
      description: '5 فيديوهات',
      icon: '🎬',
      color: 'bg-teal-500',
      requirement: 5,
      category: 'video' as const
    },
    {
      id: 'video_star',
      name: 'نجم الفيديو',
      description: '10 فيديوهات',
      icon: '🌟',
      color: 'bg-pink-500',
      requirement: 10,
      category: 'video' as const
    }
  ],
  
  // شارات أكاديمية الحلم
  ACADEMY_BADGES: [
    {
      id: 'first_lesson',
      name: 'طالب مبتدئ',
      description: 'أول درس من أكاديمية الحلم',
      icon: '📚',
      color: 'bg-indigo-500',
      requirement: 1,
      category: 'academy' as const
    },
    {
      id: 'dedicated_student',
      name: 'طالب مجتهد',
      description: '5 دروس من أكاديمية الحلم',
      icon: '🎓',
      color: 'bg-blue-600',
      requirement: 5,
      category: 'academy' as const
    },
    {
      id: 'academy_expert',
      name: 'خبير الأكاديمية',
      description: '20 درس من أكاديمية الحلم',
      icon: '🏅',
      color: 'bg-yellow-600',
      requirement: 20,
      category: 'academy' as const
    }
  ]
};

// معدل التحويل
export const POINTS_CONVERSION = {
  POINTS_PER_DOLLAR: 10000,
  DOLLAR_TO_EGP: 49,
  REFERRAL_POINTS: 10000, // 1 دولار
  REFERRED_BONUS_POINTS: 5000, // 0.5 دولار للاعب الجديد
  VIDEO_POINTS: 1000, // 0.1 دولار لكل فيديو
  LESSON_POINTS: 2000, // 0.2 دولار لكل درس
  PROFILE_COMPLETION_POINTS: 2000, // 0.2 دولار
  FIRST_SUBSCRIPTION_POINTS: 5000 // 0.5 دولار
}; 

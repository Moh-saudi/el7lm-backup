import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { 
  Referral, 
  PlayerRewards, 
  Badge, 
  BADGES, 
  POINTS_CONVERSION,
  ReferralStats 
} from '@/types/referral';

class ReferralService {
  
  // إنشاء كود إحالة فريد
  generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // إنشاء أو تحديث نظام مكافآت اللاعب
  async createOrUpdatePlayerRewards(playerId: string): Promise<PlayerRewards> {
    try {
      const rewardsRef = doc(db, 'player_rewards', playerId);
      const rewardsDoc = await getDoc(rewardsRef);

      if (rewardsDoc.exists()) {
        return rewardsDoc.data() as PlayerRewards;
      }

      // إنشاء نظام مكافآت جديد
      const newRewards: PlayerRewards = {
        playerId,
        totalPoints: 0,
        availablePoints: 0,
        totalEarnings: 0,
        referralCount: 0,
        badges: [],
        lastUpdated: serverTimestamp(),
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'player_rewards'), newRewards);
      return newRewards;
    } catch (error) {
      console.error('خطأ في إنشاء نظام مكافآت اللاعب:', error);
      throw error;
    }
  }

  // إضافة نقاط للاعب
  async addPointsToPlayer(playerId: string, points: number, reason: string): Promise<void> {
    try {
      const rewardsRef = doc(db, 'player_rewards', playerId);
      
      await updateDoc(rewardsRef, {
        totalPoints: increment(points),
        availablePoints: increment(points),
        totalEarnings: increment(points / POINTS_CONVERSION.POINTS_PER_DOLLAR),
        lastUpdated: serverTimestamp()
      });

      // تسجيل المعاملة
      await addDoc(collection(db, 'point_transactions'), {
        playerId,
        points,
        reason,
        timestamp: serverTimestamp(),
        type: 'earned'
      });

      console.log(`✅ تم إضافة ${points} نقطة للاعب ${playerId} - السبب: ${reason}`);
    } catch (error) {
      console.error('خطأ في إضافة النقاط:', error);
      throw error;
    }
  }

  // إنشاء إحالة جديدة
  async createReferral(referrerId: string, referralCode: string): Promise<string> {
    try {
      const referralData: Omit<Referral, 'id'> = {
        referrerId,
        referredId: '', // سيتم تحديثه عند انضمام اللاعب الجديد
        referralCode,
        status: 'pending',
        createdAt: serverTimestamp(),
        rewards: {
          referrerPoints: POINTS_CONVERSION.REFERRAL_POINTS,
          referredPoints: POINTS_CONVERSION.REFERRED_BONUS_POINTS,
          referrerBadges: []
        }
      };

      const docRef = await addDoc(collection(db, 'referrals'), referralData);
      console.log(`✅ تم إنشاء إحالة جديدة: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error('خطأ في إنشاء الإحالة:', error);
      throw error;
    }
  }

  // إكمال الإحالة عند انضمام اللاعب الجديد
  async completeReferral(referralCode: string, newPlayerId: string): Promise<void> {
    try {
      // البحث عن الإحالة
      const referralQuery = query(
        collection(db, 'referrals'),
        where('referralCode', '==', referralCode),
        where('status', '==', 'pending')
      );
      
      const referralSnapshot = await getDocs(referralQuery);
      
      if (referralSnapshot.empty) {
        throw new Error('كود الإحالة غير صحيح أو منتهي الصلاحية');
      }

      const referralDoc = referralSnapshot.docs[0];
      const referralData = referralDoc.data() as Referral;
      
      // التحقق من عدم استخدام الكود لنفس اللاعب
      if (referralData.referrerId === newPlayerId) {
        throw new Error('لا يمكن استخدام كود الإحالة لنفس اللاعب');
      }

      // تحديث الإحالة
      await updateDoc(doc(db, 'referrals', referralDoc.id), {
        referredId: newPlayerId,
        status: 'completed',
        completedAt: serverTimestamp()
      });

      // إضافة نقاط للاعب المحيل
      await this.addPointsToPlayer(
        referralData.referrerId, 
        POINTS_CONVERSION.REFERRAL_POINTS,
        'إحالة لاعب جديد'
      );

      // إضافة نقاط للاعب الجديد
      await this.addPointsToPlayer(
        newPlayerId, 
        POINTS_CONVERSION.REFERRED_BONUS_POINTS,
        'مكافأة انضمام عبر إحالة'
      );

      // تحديث عدد الإحالات للاعب المحيل
      await updateDoc(doc(db, 'player_rewards', referralData.referrerId), {
        referralCount: increment(1)
      });

      // فحص الشارات الجديدة
      await this.checkAndAwardBadges(referralData.referrerId, 'referral');

      console.log(`✅ تم إكمال الإحالة: ${referralCode} للاعب الجديد: ${newPlayerId}`);
    } catch (error) {
      console.error('خطأ في إكمال الإحالة:', error);
      throw error;
    }
  }

  // فحص وإعطاء الشارات
  async checkAndAwardBadges(playerId: string, category: 'referral' | 'video' | 'academy'): Promise<void> {
    try {
      const rewardsRef = doc(db, 'player_rewards', playerId);
      const rewardsDoc = await getDoc(rewardsRef);
      
      if (!rewardsDoc.exists()) return;

      const rewards = rewardsDoc.data() as PlayerRewards;
      const currentBadges = rewards.badges.map(b => b.id);
      
      let badgesToAward: Badge[] = [];

      if (category === 'referral') {
        const referralCount = rewards.referralCount;
        
        for (const badge of BADGES.REFERRAL_BADGES) {
          if (referralCount >= badge.requirement && !currentBadges.includes(badge.id)) {
            badgesToAward.push({
              ...badge,
              earnedAt: serverTimestamp()
            });
          }
        }
      }

      if (badgesToAward.length > 0) {
        await updateDoc(rewardsRef, {
          badges: [...rewards.badges, ...badgesToAward]
        });

        console.log(`🏆 تم منح ${badgesToAward.length} شارة جديدة للاعب ${playerId}`);
      }
    } catch (error) {
      console.error('خطأ في فحص الشارات:', error);
    }
  }

  // جلب إحصائيات الإحالات للاعب
  async getPlayerReferralStats(playerId: string): Promise<ReferralStats> {
    try {
      // جلب الإحالات المكتملة
      const referralsQuery = query(
        collection(db, 'referrals'),
        where('referrerId', '==', playerId),
        where('status', '==', 'completed')
      );
      
      const referralsSnapshot = await getDocs(referralsQuery);
      const referrals = referralsSnapshot.docs.map(doc => doc.data() as Referral);

      // جلب نظام مكافآت اللاعب
      const rewardsRef = doc(db, 'player_rewards', playerId);
      const rewardsDoc = await getDoc(rewardsRef);
      const rewards = rewardsDoc.exists() ? rewardsDoc.data() as PlayerRewards : null;

      // حساب الإحصائيات الشهرية
      const monthlyReferrals: { [month: string]: number } = {};
      referrals.forEach(referral => {
        const date = new Date(referral.createdAt.toDate());
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyReferrals[monthKey] = (monthlyReferrals[monthKey] || 0) + 1;
      });

      return {
        playerId,
        totalReferrals: referrals.length,
        completedReferrals: referrals.length,
        totalPointsEarned: rewards?.totalPoints || 0,
        totalEarnings: rewards?.totalEarnings || 0,
        monthlyReferrals,
        topReferrers: [] // سيتم ملؤها من API منفصل
      };
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الإحالات:', error);
      throw error;
    }
  }

  // جلب أفضل المحيلين
  async getTopReferrers(limit: number = 10): Promise<ReferralStats['topReferrers']> {
    try {
      const rewardsQuery = query(
        collection(db, 'player_rewards'),
        orderBy('referralCount', 'desc'),
        orderBy('totalEarnings', 'desc')
      );
      
      const rewardsSnapshot = await getDocs(rewardsQuery);
      const topReferrers = [];

      for (const doc of rewardsSnapshot.docs.slice(0, limit)) {
        const rewards = doc.data() as PlayerRewards;
        
        // جلب اسم اللاعب
        const playerDoc = await getDoc(doc(db, 'players', rewards.playerId));
        const playerData = playerDoc.exists() ? playerDoc.data() : null;
        
        topReferrers.push({
          playerId: rewards.playerId,
          playerName: playerData?.full_name || playerData?.name || 'لاعب مجهول',
          referralCount: rewards.referralCount,
          totalEarnings: rewards.totalEarnings
        });
      }

      return topReferrers;
    } catch (error) {
      console.error('خطأ في جلب أفضل المحيلين:', error);
      throw error;
    }
  }

  // إنشاء رابط إحالة
  createReferralLink(referralCode: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/invite/${referralCode}`;
  }

  // مشاركة الإحالة عبر وسائل التواصل
  createShareMessages(referralCode: string, playerName: string): {
    whatsapp: string;
    sms: string;
    email: string;
  } {
    const referralLink = this.createReferralLink(referralCode);
    
    const message = `مرحباً! أنا ${playerName} وأدعوك للانضمام إلى منصة كرة القدم الرائدة! 🏆

🎯 احصل على:
• 5000 نقطة مجانية عند التسجيل
• خصم 20% على أول اشتراك
• دروس مجانية من أكاديمية الحلم
• منتجات رياضية بأسعار مميزة

🔗 انضم الآن: ${referralLink}

#كرة_القدم #منصة_الرياضة`;

    return {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
      sms: `sms:?body=${encodeURIComponent(message)}`,
      email: `mailto:?subject=دعوة للانضمام لمنصة كرة القدم&body=${encodeURIComponent(message)}`
    };
  }
}

export const referralService = new ReferralService(); 

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc,
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { OrganizationReferral, PlayerJoinRequest, JoinRequestNotification } from '@/types/organization-referral';

class OrganizationReferralService {
  // توليد كود إحالة فريد للمنظمة
  generateOrganizationReferralCode(orgType: string): string {
    const prefix = this.getOrgPrefix(orgType);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = prefix;
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private getOrgPrefix(orgType: string): string {
    switch (orgType) {
      case 'club': return 'CLB';
      case 'academy': return 'ACD';
      case 'trainer': return 'TRN';
      case 'agent': return 'AGT';
      default: return 'ORG';
    }
  }

  // إنشاء كود إحالة جديد للمنظمة
  async createOrganizationReferral(
    organizationId: string,
    organizationType: string,
    organizationName: string,
    options?: {
      description?: string;
      maxUsage?: number;
      expiresAt?: Date;
    }
  ): Promise<OrganizationReferral> {
    try {
      const referralCode = this.generateOrganizationReferralCode(organizationType);

      // التحقق من عدم وجود الكود مسبقاً
      const existingQuery = query(
        collection(db, 'organization_referrals'),
        where('referralCode', '==', referralCode)
      );
      const existing = await getDocs(existingQuery);

      if (!existing.empty) {
        // إعادة المحاولة مع كود جديد
        return this.createOrganizationReferral(organizationId, organizationType, organizationName, options);
      }

      const referralData: OrganizationReferral = {
        id: '',
        organizationId,
        organizationType: organizationType as any,
        organizationName,
        referralCode,
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL}/join/org/${referralCode}`,
        description: options?.description || `انضم إلى ${organizationName}`,
        isActive: true,
        maxUsage: options?.maxUsage,
        currentUsage: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: options?.expiresAt
      };

      const docRef = doc(collection(db, 'organization_referrals'));
      referralData.id = docRef.id;

      await setDoc(docRef, referralData);

      return referralData;
    } catch (error) {
      console.error('خطأ في إنشاء كود الإحالة:', error);
      throw error;
    }
  }

  // البحث عن كود الإحالة
  async findReferralByCode(referralCode: string): Promise<OrganizationReferral | null> {
    try {
      const normalized = (referralCode || '').toString().trim().toUpperCase();
      const q = query(
        collection(db, 'organization_referrals'),
        where('referralCode', '==', normalized),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const snap = snapshot.docs[0];
      return { id: snap.id, ...(snap.data() as any) } as OrganizationReferral;
    } catch (error) {
      console.error('خطأ في البحث عن كود الإحالة:', error);
      return null;
    }
  }

  // إنشاء طلب انضمام
  async createJoinRequest(
    playerId: string,
    playerData: any,
    referralCode: string
  ): Promise<PlayerJoinRequest> {
    try {
      const referral = await this.findReferralByCode(referralCode);

      if (!referral) {
        throw new Error('كود الإحالة غير صحيح أو منتهي الصلاحية');
      }

      // التحقق من الحد الأقصى للاستخدام إن وُجد
      if (typeof referral.maxUsage === 'number' && referral.maxUsage >= 0) {
        if ((referral.currentUsage || 0) >= referral.maxUsage) {
          throw new Error('تم الوصول إلى الحد الأقصى لاستخدام هذا الكود');
        }
      }

      // التحقق من أن الحساب المستهدف هو لاعب فقط
      try {
        const playerMain = await getDoc(doc(db, 'players', playerId));
        const playerAlt = await getDoc(doc(db, 'player', playerId));
        const isPlayerCollection = playerMain.exists() || playerAlt.exists();
        const isPlayerType = (playerData?.accountType || '').toString() === 'player';
        if (!isPlayerCollection && !isPlayerType) {
          throw new Error('كود الانضمام متاح لحسابات اللاعبين فقط');
        }
      } catch (e) {
        // لو فشل جلب المستندات لأي سبب، نعتمد على نوع الحساب المرسل
        if ((playerData?.accountType || '').toString() !== 'player') {
          throw new Error('كود الانضمام متاح لحسابات اللاعبين فقط');
        }
      }

      // التحقق من عدم وجود طلب سابق معلق
      const existingRequestQuery = query(
        collection(db, 'player_join_requests'),
        where('playerId', '==', playerId),
        where('organizationId', '==', referral.organizationId),
        where('status', '==', 'pending')
      );

      const existingRequests = await getDocs(existingRequestQuery);

      if (!existingRequests.empty) {
        throw new Error('لديك طلب انضمام معلق بالفعل لهذه المنظمة');
      }

      const joinRequest: PlayerJoinRequest = {
        id: '',
        playerId,
        playerName: playerData.full_name || playerData.name || '',
        playerEmail: playerData.email || '',
        playerPhone: playerData.phone || '',
        organizationId: referral.organizationId,
        organizationType: referral.organizationType,
        organizationName: referral.organizationName,
        referralCode,
        status: 'pending',
        requestedAt: new Date(),
        playerData: {
          position: playerData.primary_position || playerData.position,
          age: playerData.age,
          nationality: playerData.nationality,
          experience: playerData.experience_years
        }
      };

      const docRef = doc(collection(db, 'player_join_requests'));
      joinRequest.id = docRef.id;

      await setDoc(docRef, joinRequest);

      // تحديث عداد الاستخدام
      await updateDoc(doc(db, 'organization_referrals', referral.id), {
        currentUsage: increment(1),
        updatedAt: serverTimestamp()
      });

      // إنشاء إشعار للمنظمة
      await this.createJoinRequestNotification(joinRequest);

      return joinRequest;
    } catch (error) {
      console.error('خطأ في إنشاء طلب الانضمام:', error);
      throw error;
    }
  }

  // إنشاء إشعار طلب الانضمام
  private async createJoinRequestNotification(joinRequest: PlayerJoinRequest): Promise<void> {
    try {
      const notification: JoinRequestNotification = {
        id: '',
        organizationId: joinRequest.organizationId,
        organizationType: joinRequest.organizationType,
        requestId: joinRequest.id,
        playerId: joinRequest.playerId,
        playerName: joinRequest.playerName,
        type: 'new_join_request',
        message: `طلب انضمام جديد من اللاعب ${joinRequest.playerName}`,
        isRead: false,
        createdAt: new Date()
      };

      const docRef = doc(collection(db, 'join_request_notifications'));
      notification.id = docRef.id;

      await setDoc(docRef, notification);
    } catch (error) {
      console.error('خطأ في إنشاء الإشعار:', error);
    }
  }

  // الموافقة على طلب الانضمام
  async approveJoinRequest(
    requestId: string,
    approvedBy: string,
    approverName: string,
    notes?: string
  ): Promise<void> {
    try {
      const requestDoc = await getDoc(doc(db, 'player_join_requests', requestId));

      if (!requestDoc.exists()) {
        throw new Error('طلب الانضمام غير موجود');
      }

      const requestData = requestDoc.data() as PlayerJoinRequest;

      if (requestData.status !== 'pending') {
        throw new Error('طلب الانضمام تم معالجته مسبقاً');
      }

      // تحديث حالة الطلب
      await updateDoc(doc(db, 'player_join_requests', requestId), {
        status: 'approved',
        processedAt: serverTimestamp(),
        processedBy: approvedBy,
        notes: notes || ''
      });

      // ربط اللاعب بالمنظمة
      await this.linkPlayerToOrganization({ ...requestData, processedBy: approvedBy } as PlayerJoinRequest);

      // إنشاء إشعار للاعب
      await this.createPlayerNotification(requestData, 'approved', approverName);
    } catch (error) {
      console.error('خطأ في الموافقة على الطلب:', error);
      throw error;
    }
  }

  // ربط اللاعب بالمنظمة
  private async linkPlayerToOrganization(requestData: PlayerJoinRequest): Promise<void> {
    try {
      const orgIdField = `${requestData.organizationType}_id`;
      const updateData: any = {
        [orgIdField]: requestData.organizationId,
        organizationId: requestData.organizationId,
        organizationType: requestData.organizationType,
        organizationName: requestData.organizationName,
        joinRequestId: requestData.id,
        joinRequestStatus: 'approved',
        joinedViaReferral: true,
        referralCodeUsed: requestData.referralCode,
        organizationJoinedAt: serverTimestamp(),
        organizationApprovedBy: {
          userId: (requestData as any).processedBy,
          approvedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      };

      // البحث عن اللاعب في مجموعات مختلفة
      const collections = ['players', 'player'];

      for (const collectionName of collections) {
        const playerDoc = await getDoc(doc(db, collectionName, requestData.playerId));
        if (playerDoc.exists()) {
          await updateDoc(doc(db, collectionName, requestData.playerId), updateData);
          break;
        }
      }
    } catch (error) {
      console.error('خطأ في ربط اللاعب بالمنظمة:', error);
      throw error;
    }
  }

  // إنشاء إشعار للاعب
  private async createPlayerNotification(
    requestData: PlayerJoinRequest, 
    type: 'approved' | 'rejected',
    processorName: string
  ): Promise<void> {
    try {
      const message = type === 'approved' 
        ? `تم قبول طلب انضمامك إلى ${requestData.organizationName}`
        : `تم رفض طلب انضمامك إلى ${requestData.organizationName}`;

      const notification = {
        playerId: requestData.playerId,
        organizationId: requestData.organizationId,
        organizationName: requestData.organizationName,
        type: `request_${type}`,
        message,
        isRead: false,
        createdAt: serverTimestamp()
      };

      await setDoc(doc(collection(db, 'player_notifications')), notification);
    } catch (error) {
      console.error('خطأ في إنشاء إشعار اللاعب:', error);
    }
  }

  // رفض طلب الانضمام
  async rejectJoinRequest(
    requestId: string,
    rejectedBy: string,
    rejectorName: string,
    reason?: string
  ): Promise<void> {
    try {
      await updateDoc(doc(db, 'player_join_requests', requestId), {
        status: 'rejected',
        processedAt: serverTimestamp(),
        processedBy: rejectedBy,
        notes: reason || ''
      });

      const requestDoc = await getDoc(doc(db, 'player_join_requests', requestId));
      const requestData = requestDoc.data() as PlayerJoinRequest;

      // إنشاء إشعار للاعب
      await this.createPlayerNotification(requestData, 'rejected', rejectorName);
    } catch (error) {
      console.error('خطأ في رفض الطلب:', error);
      throw error;
    }
  }

  // جلب طلبات الانضمام للمنظمة
  async getOrganizationJoinRequests(
    organizationId: string,
    status?: string
  ): Promise<PlayerJoinRequest[]> {
    try {
      let q = query(
        collection(db, 'player_join_requests'),
        where('organizationId', '==', organizationId),
        orderBy('requestedAt', 'desc')
      );

      if (status) {
        q = query(q, where('status', '==', status));
      }

      const snapshot = await getDocs(q);

      return snapshot.docs.map(s => ({
        id: s.id,
        ...(s.data() as any)
      })) as PlayerJoinRequest[];
    } catch (error) {
      console.error('خطأ في جلب طلبات الانضمام:', error);
      return [];
    }
  }

  // جلب أكواد الإحالة للمنظمة
  async getOrganizationReferrals(organizationId: string): Promise<OrganizationReferral[]> {
    try {
      const q = query(
        collection(db, 'organization_referrals'),
        where('organizationId', '==', organizationId),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map(s => ({
        id: s.id,
        ...(s.data() as any)
      })) as OrganizationReferral[];
    } catch (error) {
      console.error('خطأ في جلب أكواد الإحالة:', error);
      return [];
    }
  }

  // تحديث بيانات كود الإحالة (تغيير الكود، التفعيل، الحد الأقصى)
  async updateOrganizationReferral(
    referralId: string,
    organizationId: string,
    updates: {
      referralCode?: string;
      isActive?: boolean;
      maxUsage?: number;
      description?: string;
      expiresAt?: Date | null;
    }
  ): Promise<OrganizationReferral> {
    try {
      const ref = doc(db, 'organization_referrals', referralId);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('كود الإحالة غير موجود');
      const data = snap.data() as OrganizationReferral;
      if (data.organizationId !== organizationId) throw new Error('صلاحيات غير كافية');

      const updateData: any = { updatedAt: serverTimestamp() };

      // تحقق من فريدة كود الإحالة إذا تم تغييره
      if (updates.referralCode && updates.referralCode !== data.referralCode) {
        const newCode = updates.referralCode.toUpperCase().replace(/\s+/g, '');
        const existQ = query(collection(db, 'organization_referrals'), where('referralCode', '==', newCode));
        const exist = await getDocs(existQ);
        if (!exist.empty && exist.docs[0].id !== referralId) {
          throw new Error('الكود مستخدم بالفعل');
        }
        updateData.referralCode = newCode;
        updateData.inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/org/${newCode}`;
      }

      if (typeof updates.isActive === 'boolean') updateData.isActive = updates.isActive;
      if (typeof updates.maxUsage === 'number') updateData.maxUsage = updates.maxUsage;
      if (typeof updates.description === 'string') updateData.description = updates.description;
      if (updates.expiresAt === null) updateData.expiresAt = null; else if (updates.expiresAt) updateData.expiresAt = updates.expiresAt;

      await updateDoc(ref, updateData);
      const updatedSnap = await getDoc(ref);
      return { id: updatedSnap.id, ...(updatedSnap.data() as any) } as OrganizationReferral;
    } catch (error) {
      console.error('خطأ في تحديث كود الإحالة:', error);
      throw error;
    }
  }
}

export const organizationReferralService = new OrganizationReferralService();



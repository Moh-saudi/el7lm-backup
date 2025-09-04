ه الطريقة ت# 🏆 مقترح ربط اللاعبين بالمنظمات - Organization Player Linking System

## 📋 نظرة عامة

هذا المقترح يهدف إلى إنشاء نظام سهل وفعال لربط اللاعبين بالمنظمات (الأندية، الأكاديميات، المدربين، الوكلاء) من خلال توسيع نظام الإحالة الحالي وإضافة آلية الموافقة.

## 🎯 الأهداف

- ✅ استخدام النظام الحالي بدلاً من إنشاء نظام جديد
- ✅ سهولة الاستخدام للمنظمات واللاعبين
- ✅ نظام موافقة آمن ومرن
- ✅ سهولة الصيانة والتطوير
- ✅ واجهة مستخدم بسيطة وغير معقدة

---

## 🏗️ البنية التقنية المطلوبة

### 1. إضافة أنواع البيانات الجديدة

#### ملف: `src/types/organization-referral.ts` (جديد)
```typescript
import { DateOrTimestamp } from './common';

// نظام إحالة المنظمات
export interface OrganizationReferral {
  id: string;
  organizationId: string;
  organizationType: 'club' | 'academy' | 'trainer' | 'agent';
  organizationName: string;
  organizationEmail?: string;
  referralCode: string;
  inviteLink: string;
  description?: string;
  isActive: boolean;
  maxUsage?: number; // عدد مرات الاستخدام المسموح (اختياري)
  currentUsage: number;
  createdAt: DateOrTimestamp;
  updatedAt: DateOrTimestamp;
  expiresAt?: DateOrTimestamp; // تاريخ انتهاء الصلاحية (اختياري)
}

// طلبات انضمام اللاعبين
export interface PlayerJoinRequest {
  id: string;
  playerId: string;
  playerName: string;
  playerEmail: string;
  playerPhone?: string;
  organizationId: string;
  organizationType: 'club' | 'academy' | 'trainer' | 'agent';
  organizationName: string;
  referralCode: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  requestedAt: DateOrTimestamp;
  processedAt?: DateOrTimestamp;
  processedBy?: string;
  notes?: string;
  playerData?: {
    position?: string;
    age?: number;
    nationality?: string;
    experience?: string;
  };
}

// إشعارات طلبات الانضمام
export interface JoinRequestNotification {
  id: string;
  organizationId: string;
  organizationType: string;
  requestId: string;
  playerId: string;
  playerName: string;
  type: 'new_join_request' | 'request_approved' | 'request_rejected';
  message: string;
  isRead: boolean;
  createdAt: DateOrTimestamp;
}

// إحصائيات المنظمة
export interface OrganizationStats {
  organizationId: string;
  totalPlayers: number;
  pendingRequests: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  activeReferralCodes: number;
  mostUsedReferralCode?: string;
  lastUpdated: DateOrTimestamp;
}
```

### 2. توسيع الأنواع الموجودة

#### ملف: `src/types/referral.ts` (تعديل)
```typescript
// إضافة هذه الأنواع للملف الموجود

// توسيع نوع الإحالة الحالي
export interface Referral {
  id: string;
  referrerId: string;
  referredId?: string;
  referralCode: string;
  referralType: 'player' | 'organization'; // جديد
  organizationType?: 'club' | 'academy' | 'trainer' | 'agent'; // جديد
  status: 'pending' | 'completed' | 'expired';
  createdAt: DateOrTimestamp;
  completedAt?: DateOrTimestamp;
  rewards?: {
    referrerPoints: number;
    referredPoints: number;
    referrerBadges: string[];
  };
}
```

### 3. إضافة حقول جديدة للاعبين

#### ملف: `src/types/player.ts` (تعديل)
```typescript
// إضافة هذه الحقول للـ Player interface الموجود

export interface Player extends BaseEntity, PlayerFormData {
  // الحقول الموجودة...
  
  // حقول جديدة لربط المنظمات
  joinRequestId?: string;
  joinRequestStatus?: 'pending' | 'approved' | 'rejected';
  joinedViaReferral?: boolean;
  referralCodeUsed?: string;
  organizationJoinedAt?: DateOrTimestamp;
  organizationApprovedBy?: {
    userId: string;
    userName: string;
    approvedAt: DateOrTimestamp;
  };
}
```

---

## 🛠️ الملفات والصفحات المطلوب إنشاؤها

### 1. خدمة إدارة إحالات المنظمات

#### ملف: `src/lib/organization/organization-referral-service.ts` (جديد)
```typescript
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
      const q = query(
        collection(db, 'organization_referrals'),
        where('referralCode', '==', referralCode),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as OrganizationReferral;
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
      await this.linkPlayerToOrganization(requestData);

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
          userId: requestData.processedBy,
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
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrganizationReferral[];

    } catch (error) {
      console.error('خطأ في جلب أكواد الإحالة:', error);
      return [];
    }
  }
}

export const organizationReferralService = new OrganizationReferralService();
```

### 2. API Routes المطلوبة

#### ملف: `src/app/api/organization-referrals/route.ts` (جديد)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { organizationReferralService } from '@/lib/organization/organization-referral-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_referral':
        const referral = await organizationReferralService.createOrganizationReferral(
          data.organizationId,
          data.organizationType,
          data.organizationName,
          data.options
        );
        return NextResponse.json({ success: true, referral });

      case 'create_join_request':
        const joinRequest = await organizationReferralService.createJoinRequest(
          data.playerId,
          data.playerData,
          data.referralCode
        );
        return NextResponse.json({ success: true, joinRequest });

      case 'approve_request':
        await organizationReferralService.approveJoinRequest(
          data.requestId,
          data.approvedBy,
          data.approverName,
          data.notes
        );
        return NextResponse.json({ success: true, message: 'تم قبول الطلب بنجاح' });

      case 'reject_request':
        await organizationReferralService.rejectJoinRequest(
          data.requestId,
          data.rejectedBy,
          data.rejectorName,
          data.reason
        );
        return NextResponse.json({ success: true, message: 'تم رفض الطلب' });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Organization Referral API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const organizationId = searchParams.get('organizationId');
    const referralCode = searchParams.get('referralCode');

    switch (action) {
      case 'get_referrals':
        if (!organizationId) {
          return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }
        const referrals = await organizationReferralService.getOrganizationReferrals(organizationId);
        return NextResponse.json({ success: true, referrals });

      case 'get_join_requests':
        if (!organizationId) {
          return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }
        const status = searchParams.get('status') || undefined;
        const requests = await organizationReferralService.getOrganizationJoinRequests(organizationId, status);
        return NextResponse.json({ success: true, requests });

      case 'find_referral':
        if (!referralCode) {
          return NextResponse.json({ error: 'Missing referralCode' }, { status: 400 });
        }
        const referral = await organizationReferralService.findReferralByCode(referralCode);
        return NextResponse.json({ success: true, referral });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Organization Referral GET API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
```

---

## 📱 الصفحات والواجهات المطلوب إنشاؤها/تعديلها

### 1. توسيع صفحة الإحالات الموحدة

#### ملف: `src/app/dashboard/[accountType]/referrals/page.tsx` (تعديل الموجود)

إضافة قسم جديد للمنظمات في الصفحة الموجودة:

```typescript
// إضافة هذه الأجزاء للصفحة الموجودة

import { organizationReferralService } from '@/lib/organization/organization-referral-service';
import { OrganizationReferral, PlayerJoinRequest } from '@/types/organization-referral';

// إضافة هذه الحالات للـ component الموجود
const [organizationReferrals, setOrganizationReferrals] = useState<OrganizationReferral[]>([]);
const [joinRequests, setJoinRequests] = useState<PlayerJoinRequest[]>([]);
const [showCreateReferral, setShowCreateReferral] = useState(false);

// إضافة هذه الدوال
const loadOrganizationReferrals = async () => {
  try {
    const referrals = await organizationReferralService.getOrganizationReferrals(user!.uid);
    setOrganizationReferrals(referrals);
  } catch (error) {
    console.error('خطأ في تحميل أكواد الإحالة:', error);
  }
};

const loadJoinRequests = async () => {
  try {
    const requests = await organizationReferralService.getOrganizationJoinRequests(user!.uid);
    setJoinRequests(requests);
  } catch (error) {
    console.error('خطأ في تحميل طلبات الانضمام:', error);
  }
};

const createNewReferralCode = async () => {
  try {
    const referral = await organizationReferralService.createOrganizationReferral(
      user!.uid,
      userData!.accountType,
      userData!.full_name || 'المنظمة'
    );
    
    toast.success('تم إنشاء كود إحالة جديد');
    loadOrganizationReferrals();
  } catch (error) {
    toast.error('فشل في إنشاء كود الإحالة');
  }
};

// إضافة هذا الجزء للـ JSX في الصفحة الموجودة
{userData?.accountType !== 'player' && (
  <>
    {/* قسم أكواد الإحالة للمنظمة */}
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">أكواد الإحالة</h2>
        <Button onClick={createNewReferralCode}>
          <Plus className="w-4 h-4 ml-2" />
          إنشاء كود جديد
        </Button>
      </div>

      <div className="grid gap-4">
        {organizationReferrals.map((referral) => (
          <div key={referral.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-mono font-bold text-blue-600">
                {referral.referralCode}
              </div>
              <Badge variant={referral.isActive ? "default" : "secondary"}>
                {referral.isActive ? "نشط" : "غير نشط"}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{referral.description}</p>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>استخدم {referral.currentUsage} مرة</span>
              <span>تم الإنشاء: {new Date(referral.createdAt).toLocaleDateString('ar')}</span>
            </div>
            
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(referral.referralCode)}
              >
                نسخ الكود
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => copyToClipboard(referral.inviteLink)}
              >
                نسخ الرابط
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* قسم طلبات الانضمام */}
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-6">طلبات الانضمام</h2>
      
      <div className="space-y-4">
        {joinRequests.filter(req => req.status === 'pending').map((request) => (
          <div key={request.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{request.playerName}</h3>
              <Badge variant="outline">في الانتظار</Badge>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <p>📧 {request.playerEmail}</p>
              {request.playerPhone && <p>📱 {request.playerPhone}</p>}
              {request.playerData?.position && <p>⚽ المركز: {request.playerData.position}</p>}
              {request.playerData?.age && <p>🎂 العمر: {request.playerData.age}</p>}
              <p>📅 طلب الانضمام: {new Date(request.requestedAt).toLocaleDateString('ar')}</p>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button 
                size="sm"
                onClick={() => approveJoinRequest(request.id)}
              >
                ✅ قبول
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => rejectJoinRequest(request.id)}
              >
                ❌ رفض
              </Button>
            </div>
          </div>
        ))}
        
        {joinRequests.filter(req => req.status === 'pending').length === 0 && (
          <p className="text-center text-gray-500 py-8">لا توجد طلبات انضمام في الانتظار</p>
        )}
      </div>
    </Card>
  </>
)}
```

### 2. صفحة انضمام اللاعبين

#### ملف: `src/app/join/org/[code]/page.tsx` (جديد)
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { organizationReferralService } from '@/lib/organization/organization-referral-service';
import { OrganizationReferral } from '@/types/organization-referral';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Users, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

interface JoinOrgPageProps {
  params: { code: string };
}

export default function JoinOrgPage({ params }: JoinOrgPageProps) {
  const { code } = params;
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [referral, setReferral] = useState<OrganizationReferral | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReferralData();
  }, [code]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const referralData = await organizationReferralService.findReferralByCode(code);
      
      if (!referralData) {
        setError('كود الانضمام غير صحيح أو منتهي الصلاحية');
      } else {
        setReferral(referralData);
      }
    } catch (error) {
      console.error('خطأ في تحميل بيانات الإحالة:', error);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!user || !userData || !referral) {
      toast.error('يجب تسجيل الدخول أولاً');
      router.push('/auth/login');
      return;
    }

    if (userData.accountType !== 'player') {
      toast.error('هذه الخدمة متاحة للاعبين فقط');
      return;
    }

    setJoining(true);

    try {
      await organizationReferralService.createJoinRequest(
        user.uid,
        userData,
        code
      );

      toast.success('تم إرسال طلب الانضمام بنجاح! سيتم إشعارك عند الموافقة عليه.');
      router.push('/dashboard/player');
      
    } catch (error: any) {
      console.error('خطأ في إرسال طلب الانضمام:', error);
      toast.error(error.message || 'فشل في إرسال طلب الانضمام');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">خطأ في كود الانضمام</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>
            العودة للرئيسية
          </Button>
        </Card>
      </div>
    );
  }

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'club': return 'نادي';
      case 'academy': return 'أكاديمية';
      case 'trainer': return 'مدرب';
      case 'agent': return 'وكيل';
      default: return 'منظمة';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              دعوة للانضمام
            </h1>
            <p className="text-gray-600">
              تم العثور على دعوة صحيحة للانضمام
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-900">
                  {referral.organizationName}
                </h2>
                <Badge variant="outline">
                  {getOrgTypeLabel(referral.organizationType)}
                </Badge>
              </div>
              
              <p className="text-blue-800 mb-4">{referral.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{referral.currentUsage} لاعب انضم</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>تم الإنشاء: {new Date(referral.createdAt).toLocaleDateString('ar')}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">ملاحظة مهمة:</h3>
              <p className="text-yellow-700 text-sm">
                عند الضغط على "طلب الانضمام"، سيتم إرسال طلبك إلى {referral.organizationName}. 
                سيتم إشعارك عندما يتم قبول أو رفض طلبك.
              </p>
            </div>

            {!user ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600">
                  يجب تسجيل الدخول أولاً للانضمام
                </p>
                <div className="flex gap-4">
                  <Button 
                    className="flex-1"
                    onClick={() => router.push('/auth/login')}
                  >
                    تسجيل الدخول
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/auth/register')}
                  >
                    إنشاء حساب جديد
                  </Button>
                </div>
              </div>
            ) : userData?.accountType !== 'player' ? (
              <div className="text-center">
                <p className="text-red-600 mb-4">
                  هذه الدعوة متاحة للاعبين فقط
                </p>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  العودة للوحة التحكم
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={handleJoinRequest}
                disabled={joining}
              >
                {joining ? 'جاري الإرسال...' : 'طلب الانضمام'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
```

### 3. إضافة حقل كود الانضمام في صفحة التسجيل

#### ملف: `src/app/auth/register/page.tsx` (تعديل الموجود)

إضافة حقل اختياري لكود الانضمام:

```typescript
// إضافة هذا للـ formData state الموجود
const [formData, setFormData] = useState({
  // الحقول الموجودة...
  organizationCode: '', // جديد
});

// إضافة هذا الحقل في الـ JSX قبل زر التسجيل
<div className="space-y-2">
  <Label htmlFor="organizationCode">كود الانضمام (اختياري)</Label>
  <Input
    id="organizationCode"
    name="organizationCode"
    type="text"
    placeholder="أدخل كود الانضمام إذا كان لديك"
    value={formData.organizationCode}
    onChange={handleInputChange}
    className="text-right"
  />
  <p className="text-xs text-gray-500">
    إذا كان لديك كود انضمام من نادي أو أكاديمية، أدخله هنا
  </p>
</div>

// تعديل دالة handleRegister لمعالجة كود الانضمام
const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setError('');
  if (!validateForm()) return;

  console.log('🚀 Starting registration process...');
  setLoading(true);
  
  try {
    // الكود الموجود لإنشاء الحساب...
    
    const userData = await registerUser(
      firebaseEmail,
      formData.password, 
      formData.accountType as UserRole,
      {
        ...registrationData,
        phone: formattedPhone,
        originalEmail: formattedPhone.trim() || null,
        firebaseEmail: firebaseEmail
      }
    );
    
    console.log('✅ Account created successfully:', userData);
    
    // معالجة كود الانضمام إذا تم إدخاله
    if (formData.organizationCode && formData.accountType === 'player') {
      try {
        await organizationReferralService.createJoinRequest(
          userData.uid,
          userData,
          formData.organizationCode
        );
        console.log('✅ Join request created successfully');
        toast.success('تم إرسال طلب الانضمام للمنظمة!');
      } catch (joinError) {
        console.warn('⚠️ Join request failed:', joinError);
        // لا نوقف عملية التسجيل إذا فشل طلب الانضمام
      }
    }
    
    setLoading(false);
    
    // إعادة التوجيه إلى لوحة التحكم
    const dashboardRoute = getDashboardRoute(formData.accountType);
    router.push(dashboardRoute);
    
  } catch (error: unknown) {
    // معالجة الأخطاء الموجودة...
  }
};
```

### 4. تحسين صفحات إدارة اللاعبين

#### ملف: `src/app/dashboard/club/players/page.tsx` (تعديل الموجود)

إضافة قسم لعرض طلبات الانضمام الجديدة:

```typescript
// إضافة هذه الحالات للـ component الموجود
const [joinRequests, setJoinRequests] = useState<PlayerJoinRequest[]>([]);
const [showJoinRequests, setShowJoinRequests] = useState(false);

// إضافة هذه الدالة
const loadJoinRequests = async () => {
  try {
    const requests = await organizationReferralService.getOrganizationJoinRequests(
      user!.uid, 
      'pending'
    );
    setJoinRequests(requests);
  } catch (error) {
    console.error('خطأ في تحميل طلبات الانضمام:', error);
  }
};

// استدعاء الدالة في useEffect
useEffect(() => {
  if (user?.uid) {
    loadPlayers();
    loadJoinRequests();
  }
}, [user]);

// إضافة هذا الجزء في أعلى الصفحة بعد العنوان
{joinRequests.length > 0 && (
  <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600" />
        <span className="font-medium text-blue-900">
          لديك {joinRequests.length} طلب انضمام جديد
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setShowJoinRequests(!showJoinRequests)}
      >
        {showJoinRequests ? 'إخفاء' : 'عرض'} الطلبات
      </Button>
    </div>
    
    {showJoinRequests && (
      <div className="mt-4 space-y-3">
        {joinRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{request.playerName}</h4>
              <Badge variant="outline">طلب جديد</Badge>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              <p>📧 {request.playerEmail}</p>
              {request.playerData?.position && (
                <p>⚽ المركز: {request.playerData.position}</p>
              )}
              <p>📅 {new Date(request.requestedAt).toLocaleDateString('ar')}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                size="sm"
                onClick={async () => {
                  try {
                    await organizationReferralService.approveJoinRequest(
                      request.id,
                      user!.uid,
                      userData?.full_name || 'النادي'
                    );
                    toast.success('تم قبول اللاعب بنجاح');
                    loadJoinRequests();
                    loadPlayers();
                  } catch (error) {
                    toast.error('فشل في قبول اللاعب');
                  }
                }}
              >
                ✅ قبول
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={async () => {
                  try {
                    await organizationReferralService.rejectJoinRequest(
                      request.id,
                      user!.uid,
                      userData?.full_name || 'النادي',
                      'تم الرفض'
                    );
                    toast.success('تم رفض الطلب');
                    loadJoinRequests();
                  } catch (error) {
                    toast.error('فشل في رفض الطلب');
                  }
                }}
              >
                ❌ رفض
              </Button>
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
)}
```

نفس التعديل يجب تطبيقه على:
- `src/app/dashboard/academy/players/page.tsx`
- `src/app/dashboard/trainer/players/page.tsx`
- `src/app/dashboard/agent/players/page.tsx`

---

## 🔔 نظام الإشعارات

### 1. مكون الإشعارات

#### ملف: `src/components/notifications/JoinRequestNotifications.tsx` (جديد)
```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { JoinRequestNotification } from '@/types/organization-referral';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, X, Check } from 'lucide-react';
import { toast } from 'react-toastify';

export default function JoinRequestNotifications() {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<JoinRequestNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user?.uid || userData?.accountType === 'player') return;

    const q = query(
      collection(db, 'join_request_notifications'),
      where('organizationId', '==', user.uid),
      where('isRead', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as JoinRequestNotification[];
      
      setNotifications(notifs);
      setUnreadCount(notifs.length);
    });

    return () => unsubscribe();
  }, [user, userData]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'join_request_notifications', notificationId), {
        isRead: true
      });
    } catch (error) {
      console.error('خطأ في تحديث الإشعار:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const promises = notifications.map(notif => 
        updateDoc(doc(db, 'join_request_notifications', notif.id), {
          isRead: true
        })
      );
      await Promise.all(promises);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      toast.error('فشل في تحديث الإشعارات');
    }
  };

  if (userData?.accountType === 'player') return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">إشعارات طلبات الانضمام</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowNotifications(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-gray-500">لا توجد إشعارات جديدة</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString('ar')}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
```

### 2. إضافة الإشعارات للسايدبار

#### ملف: `src/components/layout/UnifiedSidebar.tsx` (تعديل الموجود)

```typescript
// إضافة هذا الـ import
import JoinRequestNotifications from '@/components/notifications/JoinRequestNotifications';

// إضافة هذا الجزء في الهيدر بجانب الأزرار الأخرى
<div className="flex items-center gap-2">
  <JoinRequestNotifications />
  {/* الأزرار الموجودة الأخرى */}
</div>
```

---

## 📊 قاعدة البيانات - Collections المطلوبة

### 1. مجموعة أكواد الإحالة للمنظمات
```
organization_referrals/
├── {referralId}/
    ├── id: string
    ├── organizationId: string
    ├── organizationType: string
    ├── organizationName: string
    ├── referralCode: string
    ├── inviteLink: string
    ├── description: string
    ├── isActive: boolean
    ├── maxUsage: number (optional)
    ├── currentUsage: number
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    └── expiresAt: timestamp (optional)
```

### 2. مجموعة طلبات الانضمام
```
player_join_requests/
├── {requestId}/
    ├── id: string
    ├── playerId: string
    ├── playerName: string
    ├── playerEmail: string
    ├── playerPhone: string
    ├── organizationId: string
    ├── organizationType: string
    ├── organizationName: string
    ├── referralCode: string
    ├── status: string
    ├── requestedAt: timestamp
    ├── processedAt: timestamp (optional)
    ├── processedBy: string (optional)
    ├── notes: string (optional)
    └── playerData: object
```

### 3. مجموعة الإشعارات
```
join_request_notifications/
├── {notificationId}/
    ├── id: string
    ├── organizationId: string
    ├── organizationType: string
    ├── requestId: string
    ├── playerId: string
    ├── playerName: string
    ├── type: string
    ├── message: string
    ├── isRead: boolean
    └── createdAt: timestamp
```

### 4. مجموعة إشعارات اللاعبين
```
player_notifications/
├── {notificationId}/
    ├── playerId: string
    ├── organizationId: string
    ├── organizationName: string
    ├── type: string
    ├── message: string
    ├── isRead: boolean
    └── createdAt: timestamp
```

---

## 🚀 خطوات التنفيذ المرحلية

### المرحلة الأولى: البنية الأساسية (أسبوع 1)
1. ✅ إنشاء الأنواع الجديدة (`organization-referral.ts`)
2. ✅ إنشاء خدمة إدارة الإحالات (`organization-referral-service.ts`)
3. ✅ إنشاء API routes الأساسية
4. ✅ تحديث قاعدة البيانات بالـ collections الجديدة

### المرحلة الثانية: واجهات المنظمات (أسبوع 2)
1. ✅ توسيع صفحة الإحالات الموحدة
2. ✅ إضافة قسم طلبات الانضمام في صفحات إدارة اللاعبين
3. ✅ تحسين واجهات النوادي والأكاديميات والمدربين
4. ✅ إضافة أزرار إنشاء أكواد الإحالة

### المرحلة الثالثة: واجهات اللاعبين (أسبوع 3)
1. ✅ إنشاء صفحة الانضمام (`/join/org/[code]`)
2. ✅ تحديث صفحة التسجيل لإضافة حقل كود الانضمام
3. ✅ إضافة معالجة كود الانضمام في عملية التسجيل
4. ✅ تحسين تجربة المستخدم للاعبين

### المرحلة الرابعة: نظام الإشعارات (أسبوع 4)
1. ✅ إنشاء مكون الإشعارات
2. ✅ إضافة الإشعارات للسايدبار
3. ✅ تنفيذ الإشعارات الفورية
4. ✅ اختبار النظام بالكامل

### المرحلة الخامسة: الاختبار والتحسين (أسبوع 5)
1. ✅ اختبار جميع السيناريوهات
2. ✅ إصلاح الأخطاء
3. ✅ تحسين الأداء
4. ✅ إضافة المميزات الإضافية

---

## 🔧 إعدادات Firebase الإضافية

### Firestore Security Rules
```javascript
// إضافة هذه القواعد للملف الموجود

// Organization referrals
match /organization_referrals/{referralId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null 
    && request.auth.uid == resource.data.organizationId;
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.organizationId;
  allow delete: if request.auth != null 
    && request.auth.uid == resource.data.organizationId;
}

// Player join requests
match /player_join_requests/{requestId} {
  allow read: if request.auth != null 
    && (request.auth.uid == resource.data.playerId 
        || request.auth.uid == resource.data.organizationId);
  allow create: if request.auth != null 
    && request.auth.uid == request.resource.data.playerId;
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.organizationId;
}

// Join request notifications
match /join_request_notifications/{notificationId} {
  allow read, update: if request.auth != null 
    && request.auth.uid == resource.data.organizationId;
  allow create: if request.auth != null;
}

// Player notifications
match /player_notifications/{notificationId} {
  allow read, update: if request.auth != null 
    && request.auth.uid == resource.data.playerId;
  allow create: if request.auth != null;
}
```

---

## 📋 قائمة مراجعة التنفيذ

### الملفات الجديدة المطلوبة:
- [ ] `src/types/organization-referral.ts`
- [ ] `src/lib/organization/organization-referral-service.ts`
- [ ] `src/app/api/organization-referrals/route.ts`
- [ ] `src/app/join/org/[code]/page.tsx`
- [ ] `src/components/notifications/JoinRequestNotifications.tsx`

### الملفات المطلوب تعديلها:
- [ ] `src/types/referral.ts`
- [ ] `src/types/player.ts`
- [ ] `src/app/dashboard/[accountType]/referrals/page.tsx`
- [ ] `src/app/auth/register/page.tsx`
- [ ] `src/app/dashboard/club/players/page.tsx`
- [ ] `src/app/dashboard/academy/players/page.tsx`
- [ ] `src/app/dashboard/trainer/players/page.tsx`
- [ ] `src/app/dashboard/agent/players/page.tsx`
- [ ] `src/components/layout/UnifiedSidebar.tsx`

### إعدادات Firebase:
- [ ] إضافة Firestore Security Rules الجديدة
- [ ] إنشاء Collections الجديدة
- [ ] اختبار الصلاحيات

### الاختبارات المطلوبة:
- [ ] اختبار إنشاء كود الإحالة
- [ ] اختبار صفحة الانضمام
- [ ] اختبار عملية طلب الانضمام
- [ ] اختبار الموافقة والرفض
- [ ] اختبار الإشعارات
- [ ] اختبار ربط اللاعبين بالمنظمات

---

## 🎯 الخلاصة

هذا المقترح يوفر:
- **حل شامل** لربط اللاعبين بالمنظمات
- **استخدام البنية الموجودة** لتقليل التعقيد
- **واجهة بسيطة** وسهلة الاستخدام
- **نظام موافقة آمن** ومرن
- **إشعارات فورية** لتحسين التجربة
- **سهولة الصيانة** والتطوير المستقبلي

النظام مصمم ليكون قابلاً للتوسع ومتوافقاً مع البنية الحالية للمشروع، مع التركيز على البساطة وسهولة الاستخدام.

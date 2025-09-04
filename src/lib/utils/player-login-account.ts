import { auth, db } from '@/lib/firebase/config';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { PlayerWithOrganization } from '../../utils/player-organization';
import { DateOrTimestamp } from '../../types/common';

// الرقم السري الموحد للاعبين المحولين
const UNIFIED_PLAYER_PASSWORD = 'Player123!@#';

export interface CreateLoginAccountResult {
  success: boolean;
  message: string;
  tempPassword?: string;
  firebaseUid?: string;
}

export interface PlayerLoginData {
  full_name?: string;
  name?: string;
  email?: string;
  phone?: string;
  club_id?: string;
  academy_id?: string;
  trainer_id?: string;
  agent_id?: string;
  profile_image?: string;
  nationality?: string;
  primary_position?: string;
  position?: string;
  birth_date?: DateOrTimestamp;
  birthDate?: DateOrTimestamp;
  country?: string;
  city?: string;
  [key: string]: unknown;
}

export interface UserAccountData {
  uid: string;
  email: string;
  firebaseEmail: string;
  accountType: 'player';
  full_name: string;
  name: string;
  phone: string;
  club_id: string | null;
  academy_id: string | null;
  trainer_id: string | null;
  agent_id: string | null;
  profile_image: string;
  nationality: string;
  primary_position: string;
  birth_date: DateOrTimestamp | null;
  country: string;
  city: string;
  isActive: boolean;
  verified: boolean;
  profileCompleted: boolean;
  isNewUser: boolean;
  tempPassword: string;
  needsPasswordChange: boolean;
  convertedFromDependent: boolean;
  originalSource: string;
  unifiedPassword: boolean;
  createdAt: Date;
  updatedAt: Date;
  convertedAt: Date;
}

export interface PlayerLoginAccountInfo {
  uid: string;
  email: string;
  full_name: string;
  hasLoginAccount: boolean;
  convertedFromDependent: boolean;
  unifiedPassword: boolean;
}

/**
 * إنشاء حساب تسجيل دخول للاعب التابع
 */
export async function createPlayerLoginAccount(
  playerId: string,
  playerData: PlayerLoginData,
  source: 'players' | 'player' = 'players',
  customPassword?: string
): Promise<CreateLoginAccountResult> {
  
  try {
    // التحقق من البيانات المطلوبة
    if (!playerData.email || !playerData.full_name && !playerData.name) {
      return {
        success: false,
        message: 'الإيميل والاسم الكامل مطلوبان لإنشاء حساب الدخول'
      };
    }

    const email = playerData.email;
    const fullName = playerData.full_name || playerData.name || '';

    // التحقق من عدم وجود الحساب مسبقاً
    const existingUserQuery = query(
      collection(db, 'users'),
      where('email', '==', email)
    );
    const existingUsers = await getDocs(existingUserQuery);
    
    if (!existingUsers.empty) {
      return {
        success: false,
        message: 'حساب بهذا الإيميل موجود مسبقاً'
      };
    }

    // تحديد كلمة المرور (مخصصة أو الافتراضية)
    const password = customPassword || UNIFIED_PLAYER_PASSWORD;
    
    // إنشاء حساب Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      email, 
      password
    );
    const firebaseUser = userCredential.user;

    // إنشاء بيانات المستخدم في مجموعة users
    const userData: UserAccountData = {
      uid: firebaseUser.uid,
      email: email,
      firebaseEmail: email,
      accountType: 'player',
      full_name: fullName,
      name: fullName,
      phone: playerData.phone || '',
      
      // الاحتفاظ بالانتماء للمنظمة
      club_id: playerData.club_id || null,
      academy_id: playerData.academy_id || null,
      trainer_id: playerData.trainer_id || null,
      agent_id: playerData.agent_id || null,
      
      // معلومات إضافية
      profile_image: playerData.profile_image || '',
      nationality: playerData.nationality || '',
      primary_position: playerData.primary_position || playerData.position || '',
      birth_date: playerData.birth_date || playerData.birthDate || null,
      country: playerData.country || '',
      city: playerData.city || '',
      
      // حالة الحساب
      isActive: true,
      verified: false,
      profileCompleted: true,
      isNewUser: false,
      
      // إعدادات خاصة
      tempPassword: password,
      needsPasswordChange: true,
      convertedFromDependent: true,
      originalSource: source,
      unifiedPassword: true,
      
      // تواريخ
      createdAt: new Date(),
      updatedAt: new Date(),
      convertedAt: new Date()
    };

    // حفظ في مجموعة users
    await setDoc(doc(db, 'users', firebaseUser.uid), userData);

    // تحديث البيانات الأصلية للإشارة للتحويل
    await updateDoc(doc(db, source, playerId), {
      convertedToAccount: true,
      firebaseUid: firebaseUser.uid,
      loginAccountCreated: true,
      convertedAt: new Date(),
      hasLoginAccount: true
    });

    return {
      success: true,
      message: 'تم إنشاء حساب تسجيل الدخول بنجاح',
      tempPassword: password,
      firebaseUid: firebaseUser.uid
    };

  } catch (error: unknown) {
    console.error('خطأ في إنشاء حساب تسجيل الدخول:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في إنشاء حساب تسجيل الدخول';
    return {
      success: false,
      message: errorMessage
    };
  }
}

/**
 * التحقق من وجود حساب تسجيل دخول للاعب
 */
export async function checkPlayerHasLoginAccount(playerEmail: string): Promise<boolean> {
  try {
    const userQuery = query(
      collection(db, 'users'),
      where('email', '==', playerEmail)
    );
    const users = await getDocs(userQuery);
    return !users.empty;
  } catch (error) {
    console.error('خطأ في التحقق من حساب الدخول:', error);
    return false;
  }
}

/**
 * الحصول على معلومات حساب الدخول للاعب
 */
export async function getPlayerLoginAccountInfo(playerEmail: string): Promise<PlayerLoginAccountInfo | null> {
  try {
    const userQuery = query(
      collection(db, 'users'),
      where('email', '==', playerEmail)
    );
    const users = await getDocs(userQuery);
    
    if (users.empty) {
      return null;
    }
    
    const userData = users.docs[0].data();
    return {
      uid: userData.uid,
      email: userData.email,
      full_name: userData.full_name,
      hasLoginAccount: true,
      convertedFromDependent: userData.convertedFromDependent || false,
      unifiedPassword: userData.unifiedPassword || false
    };
  } catch (error) {
    console.error('خطأ في الحصول على معلومات حساب الدخول:', error);
    return null;
  }
} 

// utils/player-organization.ts - دوال مساعدة لتحديد انتماء اللاعبين
import { AccountType } from '../types/common';
import { Player } from '../types/player';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';

export interface PlayerOrganizationInfo {
  type: 'club' | 'academy' | 'trainer' | 'agent' | 'independent';
  id: string | null;
  name?: string;
  typeArabic: string;
  emoji: string;
}

// Type for player data that might have organization fields
export interface PlayerWithOrganization extends Partial<Player> {
  club_id?: string;
  clubId?: string;
  club_name?: string;
  clubName?: string;
  academy_id?: string;
  academyId?: string;
  academy_name?: string;
  academyName?: string;
  trainer_id?: string;
  trainerId?: string;
  trainer_name?: string;
  trainerName?: string;
  agent_id?: string;
  agentId?: string;
  agent_name?: string;
  agentName?: string;
  organizationId?: string;
  organizationType?: string;
  organizationName?: string;
}

/**
 * جلب بيانات الجهة مع الاسم والصورة من Firebase
 */
export async function getOrganizationDetails(organizationId: string, organizationType: string) {
  try {
    console.log('🔍 جلب بيانات الجهة:', { organizationId, organizationType });
    
    // تحديد المجموعات المحتملة حسب نوع الجهة
    let possibleCollections: string[] = [];
    switch (organizationType) {
      case 'club':
        possibleCollections = ['clubs', 'club', 'users'];
        break;
      case 'academy':
        possibleCollections = ['academies', 'academy', 'users'];
        break;
      case 'trainer':
        possibleCollections = ['trainers', 'trainer', 'users'];
        break;
      case 'agent':
        possibleCollections = ['agents', 'agent', 'users'];
        break;
      case 'marketer':
        possibleCollections = ['marketers', 'marketer', 'users'];
        break;
      default:
        console.log('⚠️ نوع جهة غير معروف:', organizationType);
        return null;
    }
    
    // إذا كان النوع academy، أضف مجموعة academies في البداية
    if (organizationType === 'academy') {
      possibleCollections = ['academies', 'academy', 'users'];
    }
    
    // البحث في جميع المجموعات المحتملة
    let organizationData = null;
    let foundCollection = null;
    
    for (const collectionName of possibleCollections) {
      try {
        console.log(`🔍 البحث في مجموعة: ${collectionName}`);
        const docRef = doc(db, collectionName, organizationId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // إذا كانت المجموعة هي users، تأكد من أن accountType يتطابق
          if (collectionName === 'users') {
            const accountType = data.accountType;
            console.log(`🔍 فحص accountType في users: ${accountType} vs ${organizationType}`);
            
            if (accountType && accountType !== organizationType) {
              console.log(`⚠️ accountType لا يتطابق: ${accountType} != ${organizationType}`);
              continue;
            }
          }
          
          organizationData = data;
          foundCollection = collectionName;
          console.log(`✅ تم العثور على الجهة في مجموعة: ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ خطأ في البحث في مجموعة ${collectionName}:`, error);
        continue;
      }
    }
    
    if (!organizationData) {
      console.log('⚠️ لم يتم العثور على الجهة في أي مجموعة');
      return null;
    }
    
    console.log('✅ تم جلب بيانات الجهة:', organizationData);
    console.log('🔍 تفاصيل الجهة:', {
      id: organizationId,
      type: organizationType,
      collection: foundCollection,
      accountType: organizationData.accountType,
      name: getOrganizationName(organizationData),
      isDeleted: organizationData.isDeleted
    });
    
    // فحص إذا كان الحساب محذوف
    if (organizationData.isDeleted) {
      console.log('⚠️ الحساب محذوف:', organizationId);
      return {
        id: organizationId,
        name: getOrganizationName(organizationData) || 'حساب محذوف',
        type: organizationType,
        profile_image: getOrganizationImage(organizationData),
        accountType: organizationType,
        isDeleted: true,
        collection: foundCollection
      };
    }
    
    return {
      id: organizationId,
      name: getOrganizationName(organizationData) || 'اسم غير محدد',
      type: organizationType,
      profile_image: getOrganizationImage(organizationData),
      accountType: organizationType,
      isDeleted: false,
      collection: foundCollection
    };
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات الجهة:', error);
    return null;
  }
}

/**
 * استخراج اسم الجهة من البيانات
 */
function getOrganizationName(organizationData: any): string | null {
  const possibleNameFields = [
    'name', 'full_name', 'club_name', 'academy_name', 'trainer_name', 'agent_name', 'marketer_name',
    'organization_name', 'business_name', 'company_name', 'title', 'display_name', 'brand_name',
    'academyName', 'clubName', 'trainerName', 'agentName', 'marketerName'
  ];
  
  for (const field of possibleNameFields) {
    if (organizationData[field] && typeof organizationData[field] === 'string' && organizationData[field].trim()) {
      const name = organizationData[field].trim();
      console.log(`✅ تم العثور على اسم الجهة في الحقل: ${field} = ${name}`);
      return name;
    }
  }
  
  // إذا لم يوجد اسم، جرب دمج الاسم الأول والأخير
  if (organizationData.first_name || organizationData.last_name) {
    const firstName = organizationData.first_name || '';
    const lastName = organizationData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      console.log(`✅ تم دمج اسم الجهة: ${fullName}`);
      return fullName;
    }
  }
  
  return null;
}

/**
 * استخراج صورة الجهة من البيانات
 */
function getOrganizationImage(organizationData: any): any {
  const possibleImageFields = [
    'profile_image', 'logo', 'image', 'avatar', 'photo', 'picture',
    'profile_picture', 'profile_photo', 'business_logo', 'brand_logo',
    'academy_logo', 'club_logo', 'trainer_photo', 'agent_photo'
  ];
  
  for (const field of possibleImageFields) {
    if (organizationData[field]) {
      console.log(`✅ تم العثور على صورة الجهة في الحقل: ${field}`);
      return organizationData[field];
    }
  }
  
  return null;
}

/**
 * جلب بيانات اللاعب مع الاسم والصورة من Firebase
 */
export async function getPlayerDetails(playerId: string) {
  try {
    console.log('🔍 جلب بيانات اللاعب:', { playerId });
    
    // البحث في جميع المجموعات المحتملة
    const collections = ['players', 'users', 'player'];
    let playerData = null;
    let foundCollection = null;
    
    for (const collectionName of collections) {
      try {
        const docRef = doc(db, collectionName, playerId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          playerData = docSnap.data();
          foundCollection = collectionName;
          console.log(`✅ تم العثور على اللاعب في مجموعة: ${collectionName}`);
          break;
        }
      } catch (error) {
        console.log(`⚠️ خطأ في البحث في مجموعة ${collectionName}:`, error);
        continue;
      }
    }
    
    if (!playerData) {
      console.log('⚠️ لم يتم العثور على اللاعب في أي مجموعة');
      return null;
    }
    
    console.log('✅ تم جلب بيانات اللاعب:', playerData);
    
    // فحص إذا كان الحساب محذوف
    if (playerData.isDeleted) {
      console.log('⚠️ حساب اللاعب محذوف:', playerId);
      return {
        id: playerId,
        name: getPlayerName(playerData) || 'لاعب محذوف',
        profile_image: getPlayerImage(playerData),
        isDeleted: true,
        collection: foundCollection
      };
    }
    
    return {
      id: playerId,
      name: getPlayerName(playerData) || 'اسم غير محدد',
      profile_image: getPlayerImage(playerData),
      isDeleted: false,
      collection: foundCollection,
      // إضافة البيانات الكاملة للاعب
      fullData: playerData
    };
  } catch (error) {
    console.error('❌ خطأ في جلب بيانات اللاعب:', error);
    return null;
  }
}

/**
 * استخراج اسم اللاعب من البيانات
 */
function getPlayerName(playerData: any): string | null {
  const possibleNameFields = [
    'full_name', 'name', 'player_name', 'display_name', 'first_name', 'last_name',
    'arabic_name', 'english_name', 'nickname', 'title'
  ];
  
  for (const field of possibleNameFields) {
    if (playerData[field] && typeof playerData[field] === 'string' && playerData[field].trim()) {
      const name = playerData[field].trim();
      console.log(`✅ تم العثور على اسم اللاعب في الحقل: ${field} = ${name}`);
      return name;
    }
  }
  
  // إذا لم يوجد اسم، جرب دمج الاسم الأول والأخير
  if (playerData.first_name || playerData.last_name) {
    const firstName = playerData.first_name || '';
    const lastName = playerData.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim();
    if (fullName) {
      console.log(`✅ تم دمج اسم اللاعب: ${fullName}`);
      return fullName;
    }
  }
  
  return null;
}

/**
 * استخراج صورة اللاعب من البيانات
 */
function getPlayerImage(playerData: any): any {
  const possibleImageFields = [
    'profile_image', 'image', 'avatar', 'photo', 'picture',
    'profile_picture', 'profile_photo', 'player_image', 'player_photo'
  ];
  
  for (const field of possibleImageFields) {
    if (playerData[field]) {
      console.log(`✅ تم العثور على صورة اللاعب في الحقل: ${field}`);
      return playerData[field];
    }
  }
  
  return null;
}

/**
 * تحديد الجهة التابع لها اللاعب مع دعم كلا التنسيقين (club_id و clubId)
 */
export function getPlayerOrganization(playerData: PlayerWithOrganization): PlayerOrganizationInfo {
  console.log('🔍 تحديد انتماء اللاعب:', {
    club_id: playerData?.club_id,
    clubId: playerData?.clubId,
    academy_id: playerData?.academy_id,
    academyId: playerData?.academyId,
    trainer_id: playerData?.trainer_id,
    trainerId: playerData?.trainerId,
    agent_id: playerData?.agent_id,
    agentId: playerData?.agentId,
  });

  // البحث عن النادي
  const clubId = playerData?.club_id || playerData?.clubId;
  if (clubId) {
    const clubName = playerData?.club_name || playerData?.clubName;
    console.log('✅ اللاعب تابع لنادي:', clubId, clubName);
    console.log('🔍 بيانات النادي الكاملة:', {
      club_id: playerData?.club_id,
      clubId: playerData?.clubId,
      club_name: playerData?.club_name,
      clubName: playerData?.clubName
    });
    return {
      type: 'club',
      id: clubId,
      name: clubName,
      typeArabic: 'نادي',
      emoji: '🏢'
    };
  }

  // البحث عن الأكاديمية
  const academyId = playerData?.academy_id || playerData?.academyId;
  if (academyId) {
    const academyName = playerData?.academy_name || playerData?.academyName;
    console.log('✅ اللاعب تابع لأكاديمية:', academyId, academyName);
    return {
      type: 'academy',
      id: academyId,
      name: academyName,
      typeArabic: 'أكاديمية',
      emoji: '🏆'
    };
  }

  // البحث عن المدرب
  const trainerId = playerData?.trainer_id || playerData?.trainerId;
  if (trainerId) {
    const trainerName = playerData?.trainer_name || playerData?.trainerName;
    console.log('✅ اللاعب تابع لمدرب:', trainerId, trainerName);
    return {
      type: 'trainer',
      id: trainerId,
      name: trainerName,
      typeArabic: 'مدرب',
      emoji: '👨‍🏫'
    };
  }

  // البحث عن الوكيل
  const agentId = playerData?.agent_id || playerData?.agentId;
  if (agentId) {
    const agentName = playerData?.agent_name || playerData?.agentName;
    console.log('✅ اللاعب تابع لوكيل:', agentId, agentName);
    return {
      type: 'agent',
      id: agentId,
      name: agentName,
      typeArabic: 'وكيل لاعبين',
      emoji: '💼'
    };
  }

  console.log('⚠️ اللاعب مستقل - لا يتبع لأي جهة');
  return {
    type: 'independent',
    id: null,
    typeArabic: 'مستقل',
    emoji: '🔥'
  };
}

/**
 * تحويل نوع الحساب إلى AccountType للمكتبات
 */
export function getAccountTypeFromPlayer(playerData: PlayerWithOrganization): AccountType {
  const org = getPlayerOrganization(playerData);
  
  switch (org.type) {
    case 'club':
      return 'club';
    case 'academy':
      return 'academy';
    case 'trainer':
      return 'trainer';
    case 'agent':
      return 'agent';
    default:
      return 'trainer'; // افتراضي
  }
}

/**
 * فحص شامل لبيانات اللاعب لأغراض التشخيص
 */
export function debugPlayerOrganization(playerData: PlayerWithOrganization): PlayerOrganizationInfo {
  console.group('🔍 تشخيص شامل لانتماء اللاعب');
  console.log('📋 بيانات اللاعب الكاملة:', playerData);
  
  const organization = getPlayerOrganization(playerData);
  console.log('🎯 النتيجة النهائية:', organization);
  
  console.log('📊 فحص مفصل للحقول:');
  const fields: Array<{ name: string; value?: string }> = [
    { name: 'club_id', value: playerData?.club_id },
    { name: 'clubId', value: playerData?.clubId },
    { name: 'academy_id', value: playerData?.academy_id },
    { name: 'academyId', value: playerData?.academyId },
    { name: 'trainer_id', value: playerData?.trainer_id },
    { name: 'trainerId', value: playerData?.trainerId },
    { name: 'agent_id', value: playerData?.agent_id },
    { name: 'agentId', value: playerData?.agentId },
  ];

  fields.forEach(field => {
    if (field.value) {
      console.log(`✅ ${field.name}:`, field.value);
    } else {
      console.log(`⚪ ${field.name}: غير موجود`);
    }
  });

  console.groupEnd();
  return organization;
}

/**
 * تحديث بيانات اللاعب لتوحيد تنسيق الحقول
 */
export function normalizePlayerData(playerData: PlayerWithOrganization): PlayerWithOrganization {
  const normalized: PlayerWithOrganization = { ...playerData };

  // توحيد حقل النادي
  if (normalized.clubId && !normalized.club_id) {
    normalized.club_id = normalized.clubId;
  }

  // توحيد حقل الأكاديمية
  if (normalized.academyId && !normalized.academy_id) {
    normalized.academy_id = normalized.academyId;
  }

  // توحيد حقل المدرب
  if (normalized.trainerId && !normalized.trainer_id) {
    normalized.trainer_id = normalized.trainerId;
  }

  // توحيد حقل الوكيل
  if (normalized.agentId && !normalized.agent_id) {
    normalized.agent_id = normalized.agentId;
  }

  console.log('🔄 تم توحيد بيانات اللاعب:', {
    original: playerData,
    normalized: normalized
  });

  return normalized;
} 

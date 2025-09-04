'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { auth } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { retryOperation } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  User, 
  MapPin, 
  Calendar, 
  Phone, 
  Mail, 
  Globe, 
  Award, 
  Target, 
  BookOpen, 
  Heart, 
  Activity, 
  Zap, 
  Star, 
  TrendingUp, 
  Users, 
  Building2, 
  GraduationCap, 
  Briefcase,
  Eye,
  EyeOff,
  Share2,
  Download,
  Printer,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  School,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
// import ReactPlayer from 'react-player/lazy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tooltip as UiTooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
// import { useTranslations } from '@/lib/translations/context';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip as ChartTooltip } from 'recharts';
import { debugConsole } from '@/lib/utils/console-manager';
import { getPlayerOrganization, getOrganizationDetails } from '@/utils/player-organization';
import PlayerResume from '@/components/player/PlayerResume';
import { FileText } from 'lucide-react';
import { PlayerFormData, Achievement, Injury, ContractHistory, AgentHistory } from '@/types/player';
// import { PlayerVideo } from '@/types/common';
import 'dayjs/locale/ar';

// تعيين اللغة العربية لمكتبة dayjs
dayjs.locale('ar');

// دالة التحقق من صحة رابط الصورة
const getValidImageUrl = (url: string | null | undefined, fallback: string = '/images/default-avatar.png'): string => {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return fallback;
  }
  
  // فلترة الروابط المكسورة المعروفة من Supabase
  const brokenSupabaseUrls = [
    'ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/avatars/yf0b8T8xuuMfP8QAfvS9TLOJjVt2',
    'ekyerljzfokqimbabzxm.supabase.co/storage/v1/object/public/player-images/yf0b8T8xuuMfP8QAfvS9TLOJjVt2',
    'test-url.com',
    'example.com'
  ];
  
  const isBrokenUrl = brokenSupabaseUrls.some(brokenUrl => url.includes(brokenUrl));
  
  if (isBrokenUrl) {
    console.log(`🚫 تم فلترة رابط مكسور: ${url}`);
    return fallback;
  }
  
  return url;
};

// دالة حساب العمر (محسّنة مع إصلاح تاريخ المستقبل ومعالجة Firestore)
const calculateAge = (birthDate: any) => {
  console.log('🎂 [calculateAge] بدء حساب العمر:', {
    hasData: !!birthDate,
    dataType: typeof birthDate,
    dataValue: birthDate,
    isDate: birthDate instanceof Date,
    isValidDate: birthDate instanceof Date ? !isNaN(birthDate.getTime()) : 'N/A'
  });

  if (!birthDate) {
    console.log('❌ calculateAge: لا يوجد تاريخ ميلاد');
    return null;
  }
  
  try {
    let d: Date;
    
    // التعامل مع Invalid Date أولاً
    if (birthDate instanceof Date && isNaN(birthDate.getTime())) {
      console.warn('⚠️ calculateAge: تم استقبال Invalid Date، محاولة إنشاء تاريخ افتراضي');
      // إنشاء تاريخ افتراضي معقول (عمر 20 سنة)
      const currentYear = new Date().getFullYear();
      d = new Date(currentYear - 20, 4, 1); // أول مايو من السنة المناسبة
      console.log('🔧 calculateAge: تاريخ افتراضي تم إنشاؤه:', d);
    }
    // التعامل مع Firebase Timestamp
    else if (typeof birthDate === 'object' && birthDate !== null && (birthDate as any).toDate && typeof (birthDate as any).toDate === 'function') {
      try {
        d = (birthDate as any).toDate();
        console.log('✅ calculateAge: تم تحويل Firebase Timestamp إلى Date:', d);
      } catch (timestampError) {
        console.error('❌ calculateAge: خطأ في تحويل Firestore Timestamp:', timestampError);
        const currentYear = new Date().getFullYear();
        d = new Date(currentYear - 20, 4, 1);
      }
    } 
    // التعامل مع Firebase Timestamp مع seconds
    else if (typeof birthDate === 'object' && birthDate !== null && ((birthDate as any).seconds || (birthDate as any)._seconds)) {
      const seconds = (birthDate as any).seconds || (birthDate as any)._seconds;
      d = new Date(seconds * 1000);
      console.log('✅ calculateAge: تم تحويل Firebase Timestamp (seconds) إلى Date:', d);
    }
    // التعامل مع Date object صحيح
    else if (birthDate instanceof Date && !isNaN(birthDate.getTime())) {
      d = birthDate;
      console.log('✅ calculateAge: التاريخ هو Date object صحيح:', d);
    } 
    // التعامل مع string أو number
    else if (typeof birthDate === 'string' || typeof birthDate === 'number') {
      d = new Date(birthDate);
      console.log('✅ calculateAge: تم تحويل string/number إلى Date:', d);
      
      // التحقق من نجاح التحويل
      if (isNaN(d.getTime())) {
        console.warn('⚠️ calculateAge: فشل تحويل string/number، استخدام تاريخ افتراضي');
        const currentYear = new Date().getFullYear();
        d = new Date(currentYear - 20, 4, 1);
      }
    }
    // محاولة أخيرة للتحويل
    else {
      console.log('⚠️ calculateAge: محاولة تحويل نوع غير معروف:', birthDate);
      try {
        d = new Date(birthDate);
        if (isNaN(d.getTime())) {
          throw new Error('Invalid date conversion');
        }
        console.log('✅ calculateAge: نجح التحويل النهائي:', d);
      } catch (conversionError) {
        console.warn('⚠️ calculateAge: فشل التحويل النهائي، استخدام تاريخ افتراضي');
        const currentYear = new Date().getFullYear();
        d = new Date(currentYear - 20, 4, 1);
      }
    }
    
    // التحقق من صحة التاريخ النهائي
    if (isNaN(d.getTime())) {
      console.error('❌ calculateAge: التاريخ لا يزال غير صالح بعد جميع المحاولات');
      const currentYear = new Date().getFullYear();
      d = new Date(currentYear - 20, 4, 1);
      console.log('🔧 calculateAge: استخدام تاريخ افتراضي أخير:', d);
    }
    
    const today = new Date();
    
    // إصلاح التواريخ المستقبلية - معالجة محسنة
    if (d.getFullYear() >= 2024) {
      console.warn('⚠️ calculateAge: تاريخ الميلاد يحتوي على سنة مستقبلية:', d.getFullYear());
      
      // تصحيح: إذا كان 2025 اجعله 2005، إذا كان 2024 اجعله 2004، إلخ
      const originalYear = d.getFullYear();
      const correctedYear = originalYear - 20;
      d.setFullYear(correctedYear);
      console.log('✅ calculateAge: تم تصحيح التاريخ من', originalYear, 'إلى', correctedYear);
      console.log('📅 calculateAge: التاريخ المصحح النهائي:', d);
    }
    
    // حساب العمر
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    
    // التحقق من منطقية العمر
    if (age < 0) {
      console.warn('⚠️ calculateAge: عمر سالب، تصحيح إلى موجب');
      age = Math.abs(age);
    }
    
    if (age > 100) {
      console.warn('⚠️ calculateAge: عمر كبير جداً:', age, 'استخدام عمر افتراضي');
      age = 20; // عمر افتراضي معقول
    }
    
    console.log('✅ calculateAge: العمر المحسوب النهائي:', age, 'سنة للتاريخ:', d.toLocaleDateString());
    return age;
    
  } catch (error) {
    console.error('❌ calculateAge: خطأ في حساب العمر:', error, 'للتاريخ:', birthDate);
    return null; // إرجاع null بدلاً من 20 لمعرفة المشكلة
  }
};

// تعريف أنواع المنظمات مع الأيقونات
const ORGANIZATION_TYPES = {
  club: {
    collection: 'clubs',
    type: 'نادي',
    icon: Building2,
    color: 'bg-blue-500'
  },
  academy: {
    collection: 'academies',
    type: 'أكاديمية',
    icon: School,
    color: 'bg-green-500'
  },
  trainer: {
    collection: 'trainers',
    type: 'مدرب',
    icon: Users,
    color: 'bg-purple-500'
  },
  agent: {
    collection: 'agents',
    type: 'وكيل لاعبين',
    icon: Briefcase,
    color: 'bg-orange-500'
  }
} as const;

// المكون الرئيسي
function PlayerReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [user, loading, authError] = useAuthState(auth);
  const [player, setPlayer] = useState<PlayerFormData | null>(null);
  
  // الحصول على معرف اللاعب من الرابط
  const playerIdFromUrl = params?.playerId as string;
  
  // إضافة تشخيصات مفصلة (بعد الرسم لتقليل الضجيج ومنع تداخل HMR)
  useEffect(() => {
    console.group('🔍 تشخيص صفحة تقارير اللاعب');
    console.log('معاملات URL:', {
      playerIdFromUrl,
      viewPlayerId: searchParams?.get('view'),
      fullParams: searchParams?.toString()
    });
    console.log('معلومات المستخدم:', {
      userId: user?.uid,
      userEmail: user?.email,
      isLoading: loading,
      authError: authError
    });
    console.groupEnd();
  }, [params, searchParams, user, loading, authError]);
  
  // تحديد معرف اللاعب المطلوب عرضه
  const targetPlayerId = playerIdFromUrl || searchParams?.get('view');
  
  // إضافة تشخيصات
  console.log('🔍 تشخيص صفحة التقارير:');
  console.log('  - معرف اللاعب من الرابط:', playerIdFromUrl);
  console.log('  - معرف اللاعب المستهدف:', targetPlayerId);
  console.log('  - المستخدم الحالي:', user?.uid);
  console.log('  - معاملات البحث الكاملة:', searchParams?.toString());
  
  // معالجة حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // معالجة حالة عدم وجود معرف لاعب
  if (!targetPlayerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">لاعب غير محدد</h2>
          <p className="text-gray-600 mb-4">لم يتم تحديد اللاعب المطلوب عرض تقريره</p>
          <Button onClick={() => router.back()}>
            العودة
          </Button>
        </div>
      </div>
    );
  }
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  
  // معلومات إضافية للعرض المحسن
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  const [playerOrganization, setPlayerOrganization] = useState<any>(null);
  const [organizationType, setOrganizationType] = useState<string>('');
  const [organizationLoading, setOrganizationLoading] = useState(true);

  // دالة مساعدة لإنشاء بيانات آمنة للمخططات
  const createSafeChartData = (skillsObject: any, skillsMapping: Record<string, string>) => {
    if (!skillsObject || typeof skillsObject !== 'object') {
      console.log('⚠️ [createSafeChartData] بيانات المهارات غير صحيحة:', skillsObject);
      return [];
    }
    
    const entries = Object.entries(skillsObject);
    if (entries.length === 0) {
      console.log('⚠️ [createSafeChartData] لا توجد مهارات مسجلة');
      return [];
    }
    
    const chartData = entries.map(([key, value]) => ({
      skill: skillsMapping[key] || key,
      value: Number(value) || 0
    }));
    
    console.log('✅ [createSafeChartData] تم إنشاء بيانات المخطط:', chartData);
    return chartData;
  };

  // تحويل بيانات المهارات لمخططات الرادار
  const technicalSkillsMapping = {
    'ball_control': 'التحكم بالكرة',
    'passing': 'التمرير',
    'shooting': 'التسديد',
    'dribbling': 'المراوغة',
    'heading': 'الضربات الرأسية',
    'tackling': 'العرقلة',
    'marking': 'المراقبة',
    'positioning': 'التموضع',
    'vision': 'الرؤية',
    'decision_making': 'اتخاذ القرار'
  };

  const physicalSkillsMapping = {
    'speed': 'السرعة',
    'strength': 'القوة',
    'stamina': 'التحمل',
    'agility': 'الرشاقة',
    'balance': 'التوازن',
    'flexibility': 'المرونة',
    'jumping': 'الوثب',
    'coordination': 'التنسيق',
    'reaction_time': 'وقت رد الفعل'
  };

  const socialSkillsMapping = {
    'teamwork': 'العمل الجماعي',
    'communication': 'التواصل',
    'discipline': 'الانضباط',
    'self_confidence': 'الثقة بالنفس',
    'pressure_handling': 'تحمل الضغط',
    'punctuality': 'الالتزام بالمواعيد',
    'leadership': 'القيادة',
    'adaptability': 'القدرة على التكيف',
    'motivation': 'الدافعية'
  };

  const technicalSkillsData = createSafeChartData(player?.technical_skills, technicalSkillsMapping);
  const physicalSkillsData = createSafeChartData(player?.physical_skills, physicalSkillsMapping);
  const socialSkillsData = createSafeChartData(player?.social_skills, socialSkillsMapping);
  
  // إضافة تشخيص للمهارات
  useEffect(() => {
    if (player) {
      console.log('📊 [useEffect] تشخيص المهارات:', {
        playerName: player.full_name,
        playerId: player.id,
        targetPlayerId,
        isCorrectPlayer: player.id === targetPlayerId,
        technicalSkills: technicalSkillsData.length,
        physicalSkills: physicalSkillsData.length,
        socialSkills: socialSkillsData.length,
        hasTechnicalSkills: !!player.technical_skills,
        hasPhysicalSkills: !!player.physical_skills,
        hasSocialSkills: !!player.social_skills
      });
    }
  }, [player, targetPlayerId, technicalSkillsData.length, physicalSkillsData.length, socialSkillsData.length]);

  // دالة جلب معلومات الحساب الحالي
  const fetchCurrentUserInfo = async () => {
    console.log('👤 [fetchCurrentUserInfo] بدء جلب معلومات المستخدم الحالي');
    
    if (!user?.uid) {
      console.warn('⚠️ [fetchCurrentUserInfo] لا يوجد مستخدم مسجل');
      return;
    }

    try {
      for (const [key, orgType] of Object.entries(ORGANIZATION_TYPES)) {
        console.log(`🔍 [fetchCurrentUserInfo] البحث في ${orgType.collection}`);
        
        try {
          const userDocRef = doc(db, orgType.collection, user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log(`✅ [fetchCurrentUserInfo] تم العثور على الحساب:`, {
              type: orgType.type,
              name: userData.name || userData.full_name,
              hasLogo: !!userData.logo
            });
            
            const userInfo = {
              ...userData,
              id: userDoc.id,
              type: orgType.type,
              icon: orgType.icon,
              color: orgType.color
            };
            
            setCurrentUserInfo(userInfo);
            console.log('✅ [fetchCurrentUserInfo] تم تحديث معلومات المستخدم:', userInfo);
            break;
          } else {
            console.log(`⚠️ [fetchCurrentUserInfo] المستخدم غير موجود في ${orgType.collection}`);
          }
        } catch (collectionError) {
          console.log(`⚠️ [fetchCurrentUserInfo] فشل في جلب من ${orgType.collection}:`, collectionError);
          continue;
        }
      }
    } catch (error) {
      console.error('❌ [fetchCurrentUserInfo] خطأ في جلب معلومات المستخدم:', error);
    }
  };

  // دالة تحويل مسار Supabase إلى رابط كامل (للوجو) - محسنة لتدعم جميع أنواع البوكتات
  const getSupabaseImageUrl = (path: string, organizationType?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    console.log(`🎨 معالجة مسار الصورة: ${path} لنوع المنظمة: ${organizationType}`);
    
    // تحديد البوكت المناسب حسب نوع المنظمة
    const bucketMapping: Record<string, string[]> = {
      'نادي': ['clubavatar', 'club-logos'],
      'أكاديمية': ['academyavatar', 'academy-logos', 'clubavatar'],
      'مدرب': ['traineravatar', 'trainer-logos', 'clubavatar'],
      'وكيل لاعبين': ['agentavatar', 'agent-logos', 'clubavatar']
    };
    
    const possibleBuckets = organizationType ? 
      (bucketMapping[organizationType] || ['clubavatar']) : 
      ['clubavatar', 'academyavatar', 'traineravatar', 'agentavatar'];
    
    console.log(`🗂️ البوكتات المحتملة:`, possibleBuckets);
    
    // جرب البوكتات بالترتيب حتى تجد واحد يعمل
    for (const bucket of possibleBuckets) {
      try {
        const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
        if (publicUrl) {
          console.log(`✅ تم إنشاء رابط من البوكت ${bucket}: ${publicUrl}`);
          return publicUrl;
        }
      } catch (bucketError) {
        console.log(`⚠️ فشل البوكت ${bucket}:`, bucketError);
        continue;
      }
    }
    
    // إذا فشلت جميع البوكتات، ارجع المسار الأصلي
    console.log(`❌ فشل في جميع البوكتات، استخدام المسار الأصلي: ${path}`);
    return path;
  };

  // دالة الحصول على أيقونة المنظمة
  const getOrganizationIcon = (type: string) => {
    switch (type) {
      case 'club':
        return Building2;
      case 'academy':
        return School;
      case 'trainer':
        return User;
      case 'agent':
        return Briefcase;
      default:
        return Building2;
    }
  };

  // دالة الحصول على لون المنظمة
  const getOrganizationColor = (type: string) => {
    switch (type) {
      case 'club':
        return 'blue';
      case 'academy':
        return 'green';
      case 'trainer':
        return 'purple';
      case 'agent':
        return 'orange';
      default:
        return 'gray';
    }
  };





  // دالة جلب معلومات المنظمة التابع لها اللاعب
  const fetchPlayerOrganization = async () => {
    console.log('🏢 [fetchPlayerOrganization] بدء جلب معلومات المنظمة');
    
    if (!player) {
      console.warn('⚠️ [fetchPlayerOrganization] لا توجد بيانات لاعب متاحة');
      setOrganizationLoading(false);
      setPlayerOrganization(null);
      return;
    }

    try {
      setOrganizationLoading(true);
      
      // استخدام دالة getPlayerOrganization من utils
      const organization = getPlayerOrganization(player);
      console.log('✅ [fetchPlayerOrganization] نتيجة getPlayerOrganization:', organization);
      
      if (organization.id) {
        // جلب تفاصيل المنظمة من Firebase
        const orgDetails = await getOrganizationDetails(organization.id, organization.type);
        console.log('✅ [fetchPlayerOrganization] تفاصيل المنظمة:', orgDetails);
        
        if (orgDetails) {
          const organizationInfo = {
            id: orgDetails.id,
            name: orgDetails.name,
            type: orgDetails.type,
            logo: orgDetails.profile_image,
            logoUrl: getSupabaseImageUrl(orgDetails.profile_image || '', orgDetails.type),
            icon: getOrganizationIcon(orgDetails.type),
            color: getOrganizationColor(orgDetails.type),
            emoji: organization.emoji,
            typeArabic: organization.typeArabic
          };
          
          setPlayerOrganization(organizationInfo);
          console.log('✅ [fetchPlayerOrganization] تم تحديث معلومات المنظمة:', organizationInfo);
        } else {
          console.log('⚠️ [fetchPlayerOrganization] لم يتم العثور على تفاصيل المنظمة');
          setPlayerOrganization(null);
        }
      } else {
        console.log('ℹ️ [fetchPlayerOrganization] اللاعب مستقل - لا يتبع لأي منظمة');
        setPlayerOrganization(null);
      }
      
    } catch (error) {
      console.error('❌ [fetchPlayerOrganization] خطأ في جلب معلومات المنظمة:', error);
      setPlayerOrganization(null);
    } finally {
      setOrganizationLoading(false);
    }
  };

  // دالة التحقق من صلاحية عرض رقم الهاتف
  const canViewPhoneNumber = () => {
    // إذا كان المستخدم هو نفسه اللاعب
    if (user?.uid === targetPlayerId) {
      return true;
    }

    // إذا كان اللاعب تابع للمستخدم الحالي
    if (playerOrganization && currentUserInfo) {
      return playerOrganization.id === currentUserInfo.id;
    }

    return false;
  };

  // تحديث دالة عرض المعلومات الشخصية
  const renderPersonalInfo = () => (
    <div className="mb-8 bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="flex gap-2 items-center mb-6 text-xl font-semibold">
          <User className="w-6 h-6 text-blue-600" />
          المعلومات الشخصية
        </h3>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* الاسم الكامل */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">الاسم الكامل</label>
            <div className="p-3 bg-gray-50 rounded-lg">{player?.full_name || 'غير محدد'}</div>
          </div>

          {/* تاريخ الميلاد */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">تاريخ الميلاد</label>
            <div className="p-3 bg-gray-50 rounded-lg">
              {player?.birth_date ? dayjs(player.birth_date).format('YYYY/MM/DD') : 'غير محدد'}
            </div>
          </div>

          {/* الجنسية */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">الجنسية</label>
            <div className="p-3 bg-gray-50 rounded-lg">{player?.nationality || 'غير محدد'}</div>
          </div>

          {/* الدولة */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">الدولة</label>
            <div className="p-3 bg-gray-50 rounded-lg">{player?.country || 'غير محدد'}</div>
          </div>

          {/* المدينة */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">المدينة</label>
            <div className="p-3 bg-gray-50 rounded-lg">{player?.city || 'غير محدد'}</div>
          </div>

          {/* رقم الهاتف - مع شرط العرض */}
          {canViewPhoneNumber() ? (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">رقم الهاتف</label>
              <div className="p-3 bg-gray-50 rounded-lg">{player?.phone || 'غير محدد'}</div>
            </div>
          ) : (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">رقم الهاتف</label>
              <div className="flex gap-2 items-center p-3 text-gray-500 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                محجوب - اللاعب تابع لحساب آخر
              </div>
            </div>
          )}

          {/* البريد الإلكتروني */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">البريد الإلكتروني</label>
            <div className="p-3 bg-gray-50 rounded-lg">{player?.email || 'غير محدد'}</div>
          </div>

          {/* واتساب */}
          {canViewPhoneNumber() && (
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">واتساب</label>
              <div className="p-3 bg-gray-50 rounded-lg">{player?.whatsapp || 'غير محدد'}</div>
            </div>
          )}

          {/* العنوان */}
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">العنوان</label>
            <div className="p-3 bg-gray-50 rounded-lg">{player?.address || 'غير محدد'}</div>
          </div>

          {/* نبذة مختصرة */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block mb-2 text-sm font-medium text-gray-700">نبذة مختصرة</label>
            <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
              {player?.brief ? (
                <p className="text-gray-700 leading-relaxed">{player.brief}</p>
              ) : (
                <p className="text-gray-500 italic">لا توجد نبذة مختصرة</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSportsInfo = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="mb-1 font-semibold text-blue-700">المركز الأساسي</div>
        <div className="text-lg font-bold text-blue-900">{player?.primary_position || '--'}</div>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="mb-1 font-semibold text-green-700">المركز الثانوي</div>
        <div className="text-lg font-bold text-green-900">{player?.secondary_position || '--'}</div>
      </div>
      <div className="p-4 bg-purple-50 rounded-lg">
        <div className="mb-1 font-semibold text-purple-700">القدم المفضلة</div>
        <div className="text-lg font-bold text-purple-900">{player?.preferred_foot || '--'}</div>
      </div>
      <div className="p-4 bg-yellow-50 rounded-lg">
        <div className="mb-1 font-semibold text-yellow-700">الطول</div>
        <div className="text-lg font-bold text-yellow-900">{player?.height ? `${player.height} سم` : '--'}</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="mb-1 font-semibold text-red-700">الوزن</div>
        <div className="text-lg font-bold text-red-900">{player?.weight ? `${player.weight} كجم` : '--'}</div>
      </div>
      <div className="p-4 bg-indigo-50 rounded-lg">
        <div className="mb-1 font-semibold text-indigo-700">النادي الحالي</div>
        <div className="text-lg font-bold text-indigo-900">{player?.current_club || '--'}</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="mb-1 font-semibold text-gray-700">سنوات الخبرة</div>
        <div className="text-lg font-bold text-gray-900">{player?.experience_years || '--'}</div>
      </div>
      <div className="p-4 bg-lime-50 rounded-lg">
        <div className="mb-1 font-semibold text-lime-700">رقم اللاعب</div>
        <div className="text-lg font-bold text-lime-900">{player?.player_number || '--'}</div>
      </div>
      <div className="p-4 bg-emerald-50 rounded-lg">
        <div className="mb-1 font-semibold text-emerald-700">رقم القميص المفضل</div>
        <div className="text-lg font-bold text-emerald-900">{player?.favorite_jersey_number || '--'}</div>
      </div>
      <div className="col-span-2 p-4 bg-pink-50 rounded-lg">
        <div className="mb-2 font-semibold text-pink-700">الأندية السابقة</div>
        <div className="space-y-2">
          {player?.previous_clubs && player.previous_clubs.length > 0 ? (
            player.previous_clubs.map((club: string, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {club}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد أندية سابقة مسجلة</div>
          )}
        </div>
      </div>
      <div className="col-span-2 p-4 bg-orange-50 rounded-lg">
        <div className="mb-2 font-semibold text-orange-700">الإنجازات</div>
        <div className="space-y-2">
          {player?.achievements && player.achievements.length > 0 ? (
            player.achievements.map((achievement: Achievement, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                <div className="font-semibold">{achievement.title}</div>
                <div className="text-sm text-gray-600">التاريخ: {achievement.date}</div>
                {achievement.description && (
                  <div className="mt-1 text-sm text-gray-600">{achievement.description}</div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد إنجازات مسجلة</div>
          )}
        </div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-slate-50">
        <div className="mb-1 font-semibold text-slate-700">ملاحظات رياضية</div>
        <div className="text-lg font-bold text-slate-900">{player?.sports_notes || '--'}</div>
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="mb-1 font-semibold text-blue-700">المستوى التعليمي</div>
        <div className="text-lg font-bold text-blue-900">{player?.education_level || '--'}</div>
      </div>
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="mb-1 font-semibold text-green-700">سنة التخرج</div>
        <div className="text-lg font-bold text-green-900">{player?.graduation_year || '--'}</div>
      </div>
      <div className="p-4 bg-purple-50 rounded-lg">
        <div className="mb-1 font-semibold text-purple-700">مستوى اللغة الإنجليزية</div>
        <div className="text-lg font-bold text-purple-900">{player?.english_level || '--'}</div>
      </div>
      <div className="p-4 bg-yellow-50 rounded-lg">
        <div className="mb-1 font-semibold text-yellow-700">مستوى اللغة الإسبانية</div>
        <div className="text-lg font-bold text-yellow-900">{player?.spanish_level || '--'}</div>
      </div>
      <div className="p-4 bg-red-50 rounded-lg">
        <div className="mb-1 font-semibold text-red-700">مستوى اللغة العربية</div>
        <div className="text-lg font-bold text-red-900">{player?.arabic_level || '--'}</div>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="mb-1 font-semibold text-gray-700">الدرجة العلمية</div>
        <div className="text-lg font-bold text-gray-900">{player?.degree || '--'}</div>
      </div>
      <div className="col-span-2 p-4 bg-indigo-50 rounded-lg">
        <div className="mb-2 font-semibold text-indigo-700">الدورات التدريبية</div>
        <div className="space-y-2">
          {player?.training_courses && player.training_courses.length > 0 ? (
            player.training_courses.map((course: string, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {course}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد دورات تدريبية مسجلة</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMedicalRecord = () => {
    // حساب BMI
    const height = player?.height ? parseFloat(player.height) : null;
    const weight = player?.weight ? parseFloat(player.weight) : null;
    const bmi = height && weight ? (weight / Math.pow(height / 100, 2)).toFixed(1) : null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <div className="mb-1 font-semibold text-gray-700">الوزن (كجم)</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.weight || '--'}</div>
            {bmi && <div className="mt-1 text-xs text-gray-500">BMI: {bmi}</div>}
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">الطول (سم)</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.height || '--'}</div>
            <div className="mt-1 text-xs text-gray-500">متوسط الطول العالمي: 175 سم</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">فصيلة الدم</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.blood_type || '--'}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">آخر فحص طبي</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.medical_history?.last_checkup || '--'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 font-semibold text-gray-700">هل لديك أمراض مزمنة؟</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.chronic_conditions ? 'نعم' : 'لا'}</div>
          </div>
          <div>
            <div className="mb-1 font-semibold text-gray-700">تفاصيل الأمراض المزمنة</div>
            <div className="p-2 text-center bg-gray-100 rounded">{player?.chronic_details || 'لا يوجد'}</div>
          </div>
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">الحساسية</div>
          <div className="p-2 text-center bg-gray-100 rounded">{player?.allergies ? player.allergies : 'لا يوجد'}</div>
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">الإصابات السابقة</div>
          {player?.injuries && Array.isArray(player.injuries) && player.injuries.length > 0 ? (
            player.injuries.map((injury: Injury, idx: number) => (
              <div key={idx} className="p-2 mb-2 bg-gray-100 rounded">
                <div>النوع: {injury.type || '--'}</div>
                <div>التاريخ: {injury.date || '--'}</div>
                <div>الحالة: {injury.status || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center bg-gray-100 rounded">لا يوجد</div>
          )}
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">العمليات الجراحية</div>
          {player?.surgeries && player.surgeries.length > 0 ? (
            player.surgeries.map((surgery, idx) => (
              <div key={idx} className="p-2 mb-2 bg-gray-100 rounded">
                <div>النوع: {surgery.type || '--'}</div>
                <div>التاريخ: {surgery.date || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-center bg-gray-100 rounded">لا يوجد</div>
          )}
        </div>

        <div>
          <div className="mb-1 font-semibold text-gray-700">ملاحظات طبية</div>
          <div className="p-2 text-center bg-gray-100 rounded">{player?.medical_notes || 'لا يوجد'}</div>
        </div>
      </div>
    );
  };

  const renderSkills = () => (
    <div className="space-y-8">
      {technicalSkillsData.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات الفنية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={technicalSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {technicalSkillsData.map((skillData, index) => (
              <div key={index} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {skillData.skill}
                </div>
                <div className="text-sm text-gray-600">المستوى: {skillData.value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {physicalSkillsData.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات البدنية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={physicalSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {physicalSkillsData.map((skillData, index) => (
              <div key={index} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {skillData.skill}
                </div>
                <div className="text-sm text-gray-600">المستوى: {skillData.value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {socialSkillsData.length > 0 && (
        <div>
          <h3 className="mb-4 text-xl font-semibold">المهارات الاجتماعية</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={socialSkillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 10]} />
                <Radar name="المهارات" dataKey="value" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                <ChartTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3">
            {socialSkillsData.map((skillData, index) => (
              <div key={index} className="p-2 bg-white rounded shadow">
                <div className="font-semibold">
                  {skillData.skill}
                </div>
                <div className="text-sm text-gray-600">المستوى: {skillData.value}/10</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderObjectives = () => {
    // تعريف الأهداف مع تسمياتها
    const objectiveLabels = {
      professional: 'الاحتراف',
      trials: 'إجراء التجارب',
      local_leagues: 'اللعب في الدوريات المحلية',
      arab_leagues: 'اللعب في الدوريات العربية',
      european_leagues: 'اللعب في الدوريات الأوروبية',
      training: 'التدريب والتطوير',
      other: 'أهداف أخرى'
    };

    return (
      <div className="space-y-6">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {player?.objectives && Object.entries(player.objectives).map(([key, value]: [string, boolean | string]) => {
            const label = objectiveLabels[key as keyof typeof objectiveLabels] || key;
            const displayValue = typeof value === 'boolean' ? (value ? 'نعم ✅' : 'لا ❌') : value || '--';
            const bgColor = typeof value === 'boolean' 
              ? (value ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200')
              : 'bg-blue-50 border-blue-200';
            const textColor = typeof value === 'boolean'
              ? (value ? 'text-green-700' : 'text-gray-700') 
              : 'text-blue-700';
            const valueColor = typeof value === 'boolean'
              ? (value ? 'text-green-900' : 'text-gray-900')
              : 'text-blue-900';

            return (
              <div key={key} className={`p-4 rounded-lg border-2 ${bgColor}`}>
                <div className={`mb-2 font-semibold ${textColor}`}>
                  {label}
          </div>
                <div className={`text-lg font-bold ${valueColor}`}>
                  {displayValue}
          </div>
        </div>
            );
          })}
        </div>
        
        {/* عرض ملخص الأهداف */}
        {player?.objectives && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
            <h4 className="mb-3 text-lg font-semibold text-blue-800">ملخص الأهداف والطموحات</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-green-700">الأهداف المحددة: </span>
                <span className="font-bold text-green-900">
                  {Object.values(player.objectives).filter(v => v === true).length}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-700">إجمالي الأهداف: </span>
                <span className="font-bold text-blue-900">
                  {Object.keys(player.objectives).length}
                </span>
              </div>
            </div>
          </div>
        )}
    </div>
  );
  };

  const renderMedia = () => {
    console.log('🎬 [renderMedia] بيانات اللاعب المعالجة:', {
      profile_image_url: player?.profile_image_url,
      additional_images: player?.additional_images,
      additional_images_length: player?.additional_images?.length || 0,
      videos: player?.videos,
      videos_length: player?.videos?.length || 0,
      documents: player?.documents,
      documents_length: player?.documents?.length || 0
    });

    // تجميع كل الصور من مصادر مختلفة
    const allImages: { url: string; label: string; type: 'profile' | 'additional' }[] = [];
    
    // إضافة الصورة الشخصية مع فلترة الروابط المكسورة
    if (player?.profile_image_url) {
      const validProfileImage = getValidImageUrl(player.profile_image_url);
      if (validProfileImage !== '/images/default-avatar.png') {
        console.log('✅ [renderMedia] تم العثور على صورة شخصية صالحة:', validProfileImage);
        allImages.push({ url: validProfileImage, label: 'الصورة الشخصية', type: 'profile' });
      } else {
        console.log('🚫 [renderMedia] صورة شخصية مكسورة تم فلترتها:', player.profile_image_url);
      }
    } else {
      console.log('❌ [renderMedia] لا توجد صورة شخصية');
    }
    
    // إضافة الصور الإضافية مع تحقق محسن
    if (player?.additional_images && player.additional_images.length > 0) {
      console.log('✅ [renderMedia] تم العثور على صور إضافية:', player.additional_images);
      player.additional_images.forEach((image, index) => {
        console.log(`📷 [renderMedia] معالجة الصورة الإضافية ${index + 1}:`, image);
        
        let imageUrl = '';
        
        // تحقق من البنية المختلفة للصورة
        if (typeof image === 'string') {
          imageUrl = image;
          console.log(`✅ رابط مباشر للصورة ${index + 1}:`, imageUrl);
        } else if (image && typeof image === 'object') {
          if (image.url) {
            imageUrl = image.url;
            console.log(`✅ رابط من image.url للصورة ${index + 1}:`, imageUrl);
          } else if ((image as any).src) {
            imageUrl = (image as any).src;
            console.log(`✅ رابط من image.src للصورة ${index + 1}:`, imageUrl);
          } else if ((image as any).path) {
            imageUrl = (image as any).path;
            console.log(`✅ رابط من image.path للصورة ${index + 1}:`, imageUrl);
          } else {
            console.log(`❌ لم يتم العثور على رابط للصورة ${index + 1}:`, image);
          }
        }
        
        if (imageUrl && imageUrl.trim() !== '') {
          // تطبيق فلترة الروابط المكسورة مع تحقق إضافي لروابط Supabase المعطلة
          const validImageUrl = getValidImageUrl(imageUrl);
          
          // تحقق إضافي من الروابط المعطلة
          const isBrokenSupabaseUrl = imageUrl.includes('ekyerljzfokqimbabzxm.supabase.co') && 
                                     imageUrl.includes('/avatars/yf0b8T8xuuMfP8QAfvS9TLOJjVt2');
          
          if (validImageUrl !== '/images/default-avatar.png' && !isBrokenSupabaseUrl) {
            allImages.push({ url: validImageUrl, label: `صورة إضافية ${index + 1}`, type: 'additional' });
            console.log(`✅ تم إضافة الصورة ${index + 1} إلى المجموعة`);
          } else {
            console.log(`🚫 صورة إضافية مكسورة تم فلترتها ${index + 1}:`, imageUrl);
          }
        } else {
          console.log(`❌ رابط الصورة ${index + 1} فارغ أو غير صحيح`);
        }
      });
    } else {
      console.log('❌ [renderMedia] لا توجد صور إضافية');
             console.log('🔍 تحقق من البيانات:', {
         additional_images: player?.additional_images,
         hasAdditionalImages: !!player?.additional_images,
         additionalImagesLength: player?.additional_images?.length || 0
       });
    }

    console.log('📷 [renderMedia] إجمالي الصور (بعد الفلترة):', allImages);

    return (
    <div className="space-y-8">

        
        {/* قسم جميع الصور */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">الصور</h3>
            {allImages.length > 0 && (
              <span className="px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                {allImages.length} صورة
              </span>
            )}
          </div>

          {allImages.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {allImages.map((image, index) => (
                <div key={`image-${index}`} className="overflow-hidden relative rounded-lg shadow-md aspect-square group">
                <img
                  src={image.url}
                    alt={image.label}
                    className="object-cover w-full h-full transition-opacity cursor-pointer hover:opacity-90"
                  onClick={() => {
                    setSelectedImage(image.url);
                    setSelectedImageIdx(index);
                  }}
                    onLoad={() => console.log(`✅ تم تحميل ${image.label} بنجاح`)}
                    onError={(e) => {
                      console.error(`❌ فشل في تحميل ${image.label}:`, e);
                      console.error(`❌ رابط الصورة:`, image.url);
                      // إخفاء الصورة المكسورة وإظهار صورة افتراضية
                      e.currentTarget.style.display = 'none';
                      const fallbackDiv = e.currentTarget.parentElement?.querySelector('.image-fallback');
                      if (fallbackDiv) {
                        (fallbackDiv as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                  {/* صورة افتراضية للصور المكسورة */}
                  <div className="image-fallback hidden absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-xs">صورة غير متاحة</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded">
                    {index + 1}
                  </div>
                  <div className="absolute right-2 bottom-2 left-2 px-2 py-1 text-xs text-white truncate bg-black bg-opacity-70 rounded">
                    {image.label}
                  </div>
                  {image.type === 'profile' && (
                    <div className="absolute top-2 left-2 px-2 py-1 text-xs text-white bg-blue-600 rounded">
                      ⭐ شخصية
                    </div>
                  )}

              </div>
            ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed">
              <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد صور</h3>
              <p className="mb-4 text-gray-500">أضف صورة شخصية وصور إضافية لإظهار مهاراتك وإنجازاتك</p>
              <div className="text-sm text-gray-400">
                💡 يمكنك إضافة الصور من صفحة تعديل الملف الشخصي
          </div>
        </div>
      )}
        </div>

      {/* قسم الفيديوهات المحسن */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">الفيديوهات</h3>
          <div className="flex gap-3 items-center">
            {player?.videos && player.videos.length > 0 && (
              <span className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                {player.videos.length} فيديو
              </span>
            )}
          </div>
        </div>
        
        {player?.videos && player.videos.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {player.videos.map((video: any, index: number) => {
                console.log(`🎬 [renderMedia] فيديو ${index + 1}:`, video);
                console.log(`🔗 رابط الفيديو:`, video.url);
                console.log(`📝 وصف الفيديو:`, video.desc);
                
                // التحقق من صحة رابط الفيديو
                if (!video.url || video.url.trim() === '') {
                  console.log(`❌ رابط الفيديو ${index + 1} فارغ`);
                  return (
                    <div key={index} className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-600">رابط الفيديو {index + 1} غير صحيح أو فارغ</p>
                    </div>
                  );
                }
                
                // التحقق من صحة رابط الفيديو (YouTube, Vimeo, أو رابط مباشر)
                const isValidVideoUrl = (url: string) => {
                  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
                  const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+/;
                  const directVideoRegex = /\.(mp4|webm|ogg|mov|avi|mkv)$/i;
                  
                  return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url);
                };

                if (!isValidVideoUrl(video.url)) {
                  console.log(`❌ رابط الفيديو ${index + 1} غير صالح:`, video.url);
                return (
                    <div key={index} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-yellow-700">رابط الفيديو {index + 1} غير صالح</p>
                      <p className="text-sm text-yellow-600 mt-1">الرابط: {video.url}</p>
                    </div>
                  );
                }
                
                return (
                              <div key={index} className="overflow-hidden bg-white rounded-lg border border-gray-200 shadow-md" data-video-index={index}>
                    <div className="relative bg-gray-100 aspect-video">
                  <div className="flex justify-center items-center w-full h-full bg-gray-200">
                    <div className="text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
                        </svg>
                      <p className="text-sm">فيديو {index + 1}</p>
                      <p className="text-xs mt-1">اضغط على الرابط أدناه للمشاهدة</p>
                      </div>
                  </div>
                      {/* عرض رابط الفيديو للتشخيص */}
                      <div className="absolute top-2 left-2 px-2 py-1 text-xs text-white bg-black bg-opacity-50 rounded">
                        Video {index + 1}
                      </div>
                </div>
                <div className="p-4">
                  <p className="mb-2 text-sm text-gray-700">
                    {video.desc || 'لا يوجد وصف'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">فيديو {index + 1}</span>
                        <div className="flex gap-2">
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      مشاهدة في نافذة جديدة
                    </a>

                  </div>
                </div>
              </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="py-12 text-center bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed">
            <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 002 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد فيديوهات</h3>
            <p className="mb-4 text-gray-500">لم يتم إضافة أي فيديوهات بعد</p>
          </div>
        )}
      </div>

        {/* قسم المستندات الجديد */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">المستندات والشهادات</h3>
            {player?.documents && player.documents.length > 0 && (
              <span className="px-3 py-1 text-sm text-purple-800 bg-purple-100 rounded-full">
                {player.documents.length} مستند
              </span>
            )}
          </div>

          {player?.documents && player.documents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {player.documents.map((doc: Document, index: number) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-md transition-shadow hover:shadow-lg">
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h4>
                      <p className="mt-1 text-xs text-gray-500">النوع: {doc.type}</p>
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex gap-1 items-center mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        عرض المستند
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-gray-50 rounded-lg border-2 border-gray-300 border-dashed">
              <svg className="mx-auto mb-4 w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mb-2 text-lg font-medium text-gray-900">لا توجد مستندات</h3>
              <p className="mb-4 text-gray-500">لم يتم إضافة أي مستندات بعد</p>
            </div>
          )}
        </div>
    </div>
  );
  };

  const renderContracts = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* سؤال جواز السفر */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="mb-1 font-semibold text-blue-700">هل لديك جواز سفر؟</div>
        <div className="text-lg font-bold text-blue-900">
          {player?.has_passport === 'yes' ? 'نعم' : player?.has_passport === 'no' ? 'لا' : '--'}
        </div>
      </div>
      {/* سؤال متعاقد حاليًا */}
      <div className="p-4 bg-green-50 rounded-lg">
        <div className="mb-1 font-semibold text-green-700">هل أنت متعاقد حاليًا؟</div>
        <div className="text-lg font-bold text-green-900">
          {player?.currently_contracted === 'yes' ? 'نعم' : player?.currently_contracted === 'no' ? 'لا' : '--'}
        </div>
      </div>
      {/* تاريخ التعاقدات السابقة */}
      <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
        <div className="mb-2 font-semibold text-gray-700">تاريخ التعاقدات السابقة</div>
        <div className="space-y-2">
          {player?.contract_history && player.contract_history.length > 0 ? (
            player.contract_history.map((contract: ContractHistory, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div>النادي: {contract.club || '--'}</div>
                <div>الفترة: {contract.from} - {contract.to}</div>
                <div>المركز: {contract.role || '--'}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد تعاقدات سابقة مسجلة</div>
          )}
        </div>
      </div>
      {/* بيانات وكيل اللاعبين */}
      <div className="col-span-2 p-4 bg-yellow-50 rounded-lg">
        <div className="mb-2 font-semibold text-yellow-700">تاريخ وكيل اللاعبين</div>
        <div className="space-y-2">
          {player?.agent_history && player.agent_history.length > 0 ? (
            player.agent_history.map((agent: AgentHistory, idx: number) => (
              <div key={idx} className="p-2 bg-white rounded">
                <div>الاسم: {agent.agent || '--'}</div>
                <div>الفترة: {agent.from} - {agent.to}</div>
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا يوجد وكلاء لاعبين مسجلين</div>
          )}
        </div>
      </div>
      {/* جهة الاتصال والتفاوض الرسمية */}
      <div className="col-span-2 p-4 bg-purple-50 rounded-lg">
        <div className="mb-2 font-semibold text-purple-700">جهة الاتصال والتفاوض الرسمية</div>
        <div className="p-2 bg-white rounded">
          <div>الاسم: {player?.official_contact?.name || '--'}</div>
          <div>المسمى الوظيفي: {player?.official_contact?.title || '--'}</div>
          <div>رقم الهاتف: {player?.official_contact?.phone || '--'}</div>
          <div>البريد الإلكتروني: {player?.official_contact?.email || '--'}</div>
        </div>
      </div>
      {/* كيف عرفت المنصة */}
      <div className="col-span-2 p-4 bg-orange-50 rounded-lg">
        <div className="mb-2 font-semibold text-orange-700">من أين عرفت عنا؟</div>
        <div className="p-2 bg-white rounded">
          {player?.ref_source || '--'}
        </div>
      </div>

      {/* بيانات الاشتراك */}
      <div className="col-span-2 p-4 bg-green-50 rounded-lg">
        <div className="mb-2 font-semibold text-green-700">تاريخ انتهاء الاشتراك</div>
        <div className="text-lg font-bold text-green-900">
          {player?.subscription_end ? dayjs(player.subscription_end).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 bg-yellow-50 rounded-lg">
        <div className="mb-2 font-semibold text-yellow-700">حالة الاشتراك</div>
        <div className="text-lg font-bold text-yellow-900">
          {player?.subscription_status || '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 bg-red-50 rounded-lg">
        <div className="mb-2 font-semibold text-red-700">نوع الاشتراك</div>
        <div className="text-lg font-bold text-red-900">
          {player?.subscription_type || '--'}
        </div>
      </div>
      <div className="col-span-2 p-4 bg-purple-50 rounded-lg">
        <div className="mb-2 font-semibold text-purple-700">آخر تحديث</div>
        <div className="text-lg font-bold text-purple-900">
          {player?.updated_at ? dayjs(player.updated_at).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
    </div>
  );

  const TABS = [
    { name: 'البيانات الشخصية', render: renderPersonalInfo },
    { name: 'المعلومات الرياضية', render: renderSportsInfo },
    { name: 'التعليم', render: renderEducation },
    { name: 'السجل الطبي', render: renderMedicalRecord },
    { name: 'المهارات', render: renderSkills },
    { name: 'التعاقدات', render: renderContracts },
    { name: 'الأهداف', render: renderObjectives },
    { name: 'الوسائط', render: renderMedia },
    { name: 'السيرة الذاتية', render: () => <PlayerResume player={player} playerOrganization={playerOrganization} /> },
  ];

  // دالة لحساب نسبة اكتمال الملف الشخصي
  const calculateProfileCompletion = (player: PlayerFormData | null): number => {
    if (!player) return 0;

    const requiredFields = {
      basic: [
        'full_name',
        'birth_date',
        'nationality',
        'city',
        'country',
        'phone',
        'whatsapp',
        'email',
        'profile_image_url'
      ],
      physical: [
        'height',
        'weight',
        'blood_type',
        'chronic_details'
      ],
      football: [
        'primary_position',
        'secondary_position',
        'preferred_foot',
        'current_club'
      ],
      skills: [
        'technical_skills',
        'physical_skills',
        'social_skills'
      ],
      education: [
        'education_level',
        'graduation_year',
        'english_level',
        'spanish_level',
        'arabic_level'
      ],
      objectives: [
        'objectives'
      ],
      media: [
        'additional_image_urls',
        'videos'
      ]
    };

    let totalFields = 0;
    let completedFields = 0;

    // حساب الحقول الأساسية
    for (const field of requiredFields.basic) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الحقول البدنية
    for (const field of requiredFields.physical) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الحقول المتعلقة بكرة القدم
    for (const field of requiredFields.football) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب المهارات
    for (const field of requiredFields.skills) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && Object.keys(player[field as keyof PlayerFormData] || {}).length > 0) {
        completedFields++;
      }
    }

    // حساب الحقول التعليمية
    for (const field of requiredFields.education) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && player[field as keyof PlayerFormData] !== '') {
        completedFields++;
      }
    }

    // حساب الأهداف
    totalFields++;
    if (player.objectives && Object.values(player.objectives).some(value => value === true)) {
      completedFields++;
    }

    // حساب الوسائط
    for (const field of requiredFields.media) {
      totalFields++;
      if (player[field as keyof PlayerFormData] && Array.isArray(player[field as keyof PlayerFormData]) && (player[field as keyof PlayerFormData] as any[]).length > 0) {
        completedFields++;
      }
    }

    return Math.round((completedFields / totalFields) * 100);
  };

  // جلب بيانات اللاعب من Firebase والصور من Supabase
  useEffect(() => {
    let isMounted = true;

    const fetchPlayerData = async () => {
        console.log('🔍 [fetchPlayerData] بدء جلب بيانات اللاعب');
        console.log('📋 [fetchPlayerData] المعاملات:', {
          targetPlayerId,
          playerIdFromUrl,
          userId: user?.uid,
          hasUser: !!user
        });

        if (!targetPlayerId) {
          console.error('❌ [fetchPlayerData] لا يوجد معرف لاعب محدد');
          setError("لم يتم تحديد اللاعب المطلوب");
          setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
          setError(null);
          const playerId = targetPlayerId;

        if (!playerId) {
          console.error('❌ [fetchPlayerData] معرف اللاعب غير محدد');
          setError("لم يتم تحديد اللاعب المطلوب");
          setIsLoading(false);
          return;
        }

        console.log('🔍 [fetchPlayerData] محاولة جلب بيانات اللاعب:', playerId);
      
        // دالة مساعدة لجلب document من collection مع retry
      const fetchPlayerDoc = async (collectionName: string, docId: string) => {
          console.log(`🔍 [fetchPlayerDoc] البحث في ${collectionName} عن ${docId}`);
          try {
          const docRef = doc(db, collectionName, docId);
          const docSnap = await getDoc(docRef);
            console.log(`✅ [fetchPlayerDoc] تم جلب document من ${collectionName}:`, docSnap.exists());
          return { docSnap, collectionName };
          } catch (error) {
            console.error(`❌ [fetchPlayerDoc] خطأ في جلب من ${collectionName}:`, error);
            throw error;
          }
        };
      
                 // البحث في المجموعات بالترتيب مع إضافة retry logic
         const collections = ['players', 'users', 'player'];
         let playerDoc = null;
         let dataSource = '';
         
         for (const collectionName of collections) {
           try {
             console.log(`🔍 [fetchPlayerData] محاولة جلب من ${collectionName}...`);
             const result = await retryOperation(async () => {
               return await fetchPlayerDoc(collectionName, playerId);
             }, 3, 1000);
             
             if (result.docSnap.exists()) {
            playerDoc = result.docSnap;
            dataSource = result.collectionName;
               console.log(`✅ [fetchPlayerData] تم العثور على اللاعب في ${dataSource}`);
               break;
             } else {
               console.log(`⚠️ [fetchPlayerData] اللاعب غير موجود في ${collectionName}`);
             }
          } catch (error) {
             console.log(`⚠️ [fetchPlayerData] فشل في جلب من ${collectionName}:`, error);
             continue;
          }
        }

        if (!playerDoc || !playerDoc.exists()) {
          console.warn('⚠️ [fetchPlayerData] لم يتم العثور على اللاعب في أي collection:', playerId);
          setError(`لم يتم العثور على بيانات اللاعب`);
          setIsLoading(false);
          return;
        }

        const data = playerDoc.data();
        console.log(`✅ [fetchPlayerData] تم العثور على اللاعب في ${dataSource}:`, {
          playerName: data.full_name || data.name,
          accountType: data.accountType,
          hasClubId: !!data.club_id,
          hasAcademyId: !!data.academy_id,
          hasTrainerId: !!data.trainer_id,
          hasAgentId: !!data.agent_id,
          // فحص الحقول البديلة
          hasClubIdAlt: !!data.clubId,
          hasAcademyIdAlt: !!data.academyId,
          hasTrainerIdAlt: !!data.trainerId,
          hasAgentIdAlt: !!data.agentId,
          source: dataSource,
          dataKeys: Object.keys(data),
          hasSkills: !!(data.technical_skills || data.physical_skills || data.social_skills),
          hasMedia: !!(data.profile_image_url || data.additional_images || data.videos),
          isTargetPlayer: playerId === targetPlayerId,
          // فحص حقول الصورة بالتفصيل
          profile_image_url: data.profile_image_url,
          profile_image: data.profile_image,
          avatar: data.avatar,
          photoURL: data.photoURL,
          profilePicture: data.profilePicture,
          image: data.image,
          // فحص البيانات الشخصية بالتفصيل - محسن
          personalData: {
            // حقول الاسم
            full_name: data.full_name,
            name: data.name,
            firstName: data.firstName,
            lastName: data.lastName,
            displayName: data.displayName,
            
            // حقول التاريخ
            birth_date: data.birth_date,
            birthDate: data.birthDate,
            dateOfBirth: data.dateOfBirth,
            birthday: data.birthday,
            dob: data.dob,
            
            // حقول الجنسية
            nationality: data.nationality,
            countryOfOrigin: data.countryOfOrigin,
            nationalityCountry: data.nationalityCountry,
            citizenship: data.citizenship,
            
            // حقول الدولة
            country: data.country,
            countryOfResidence: data.countryOfResidence,
            homeCountry: data.homeCountry,
            residenceCountry: data.residenceCountry,
            
            // حقول المدينة
            city: data.city,
            town: data.town,
            location: data.location,
            residenceCity: data.residenceCity,
            homeCity: data.homeCity,
            currentCity: data.currentCity,
            
            // حقول الهاتف
            phone: data.phone,
            phone_number: data.phone_number,
            mobile: data.mobile,
            contact: data.contact,
            phoneNumber: data.phoneNumber,
            mobileNumber: data.mobileNumber,
            
            // حقول الواتساب
            whatsapp: data.whatsapp,
            whatsapp_number: data.whatsapp_number,
            whatsApp: data.whatsApp,
            whatsappNumber: data.whatsappNumber,
            whatsappPhone: data.whatsappPhone,
            
            // حقول البريد الإلكتروني
            email: data.email,
            email_address: data.email_address,
            emailAddress: data.emailAddress,
            contactEmail: data.contactEmail,
            
            // حقول العنوان
            address: data.address,
            fullAddress: data.fullAddress,
            homeAddress: data.homeAddress,
            residenceAddress: data.residenceAddress,
            
            // حقول النبذة
            brief: data.brief,
            bio: data.bio,
            description: data.description,
            summary: data.summary,
            about: data.about,
            profileDescription: data.profileDescription
          },
          // طباعة جميع البيانات للفحص
          allData: data
        });

        // طباعة جميع البيانات للفحص التفصيلي
        console.log('🔍 [fetchPlayerData] جميع البيانات المتاحة:', {
          allKeys: Object.keys(data),
          allValues: Object.entries(data).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {} as any)
        });

        // معالجة البيانات
        const processedData = {
          ...data,
          id: playerId,
          source: dataSource,
          targetPlayerId: targetPlayerId, // إضافة معرف اللاعب المستهدف للتشخيص
          
          // معالجة البيانات الشخصية الأساسية - محسنة
          full_name: (() => {
            const nameFields = [data.full_name, data.name, data.firstName + ' ' + data.lastName, data.displayName];
            for (const field of nameFields) {
              if (field && field.trim() !== '' && field !== 'undefined undefined') {
                return field.trim();
              }
            }
            return 'غير محدد';
          })(),
          birth_date: (() => {
            const dateFields = [data.birth_date, data.birthDate, data.dateOfBirth, data.birthday, data.dob];
            for (const field of dateFields) {
              if (field && field !== null && field !== undefined) {
                return field;
              }
            }
            return null;
          })(),
          nationality: (() => {
            const nationalityFields = [data.nationality, data.countryOfOrigin, data.nationalityCountry, data.citizenship];
            for (const field of nationalityFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          country: (() => {
            const countryFields = [data.country, data.countryOfResidence, data.homeCountry, data.residenceCountry];
            for (const field of countryFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          city: (() => {
            const cityFields = [data.city, data.town, data.location, data.residenceCity, data.homeCity, data.currentCity];
            for (const field of cityFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          phone: (() => {
            const phoneFields = [data.phone, data.phone_number, data.mobile, data.contact, data.phoneNumber, data.mobileNumber];
            for (const field of phoneFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          whatsapp: (() => {
            const whatsappFields = [data.whatsapp, data.whatsapp_number, data.whatsApp, data.whatsappNumber, data.whatsappPhone];
            for (const field of whatsappFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          email: (() => {
            const emailFields = [data.email, data.email_address, data.emailAddress, data.contactEmail];
            for (const field of emailFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          address: (() => {
            const addressFields = [data.address, data.fullAddress, data.location, data.homeAddress, data.residenceAddress];
            for (const field of addressFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          brief: (() => {
            const briefFields = [data.brief, data.bio, data.description, data.summary, data.about, data.profileDescription];
            for (const field of briefFields) {
              if (field && field.trim() !== '') {
                return field.trim();
              }
            }
            return '';
          })(),
          // معالجة معرفات المنظمات
          club_id: data.club_id || data.clubId,
          academy_id: data.academy_id || data.academyId,
          trainer_id: data.trainer_id || data.trainerId,
          agent_id: data.agent_id || data.agentId,
          // معالجة الحقول الإضافية المحتملة
          club: data.club,
          academy: data.academy,
          trainer: data.trainer,
          agent: data.agent,
          organization: data.organization,
          organization_id: data.organization_id || data.organizationId,
          parent_id: data.parent_id || data.parentId,
          owner_id: data.owner_id || data.ownerId,
          // معالجة المهارات
          technical_skills: data.technical_skills || {},
          physical_skills: data.physical_skills || {},
          social_skills: data.social_skills || {},
          // معالجة الأهداف
          objectives: data.objectives || {},
          // معالجة الوسائط - فحص جميع الحقول المحتملة للصورة
          profile_image_url: (() => {
            // فحص جميع الحقول المحتملة للصورة بالترتيب
            const imageFields = [
              data.profile_image_url,
              data.profile_image,
              data.avatar,
              data.photoURL,
              data.profilePicture,
              data.image
            ];
            
            for (const field of imageFields) {
              if (field) {
                // إذا كان string، استخدمه مباشرة
                if (typeof field === 'string' && field.trim() !== '') {
                  console.log('✅ [fetchPlayerData] تم العثور على صورة في حقل:', field);
                  return field;
                }
                // إذا كان object مع url، استخدم الـ url
                if (typeof field === 'object' && field !== null && field.url) {
                  console.log('✅ [fetchPlayerData] تم العثور على صورة في object:', field.url);
                  return field.url;
                }
              }
            }
            
            console.log('⚠️ [fetchPlayerData] لم يتم العثور على صورة في أي حقل');
            return '';
          })(),
          additional_images: data.additional_images || [],
          videos: data.videos || [],
          documents: data.documents || []
        };

        if (isMounted) {
        setPlayer(processedData);
        setIsLoading(false);
          console.log('✅ [fetchPlayerData] تم تحديث حالة اللاعب بنجاح:', {
            playerName: processedData.full_name,
            playerId: processedData.id,
            targetPlayerId: targetPlayerId,
            isCorrectPlayer: processedData.id === targetPlayerId,
            hasSkills: Object.keys(processedData.technical_skills).length > 0,
            hasImages: !!processedData.profile_image_url || processedData.additional_images.length > 0,
            hasVideos: processedData.videos.length > 0,
            // فحص البيانات الشخصية المعالجة
            processedPersonalData: {
              full_name: processedData.full_name,
              birth_date: processedData.birth_date,
              nationality: processedData.nationality,
              country: processedData.country,
              city: processedData.city,
              phone: processedData.phone,
              whatsapp: processedData.whatsapp,
              email: processedData.email,
              address: processedData.address,
              brief: processedData.brief
            },
            // فحص معرفات المنظمات
            club_id: processedData.club_id,
            academy_id: processedData.academy_id,
            trainer_id: processedData.trainer_id,
            agent_id: processedData.agent_id,
            // فحص الحقول الإضافية
            club: processedData.club,
            academy: processedData.academy,
            trainer: processedData.trainer,
            agent: processedData.agent,
            organization: processedData.organization,
            organization_id: processedData.organization_id,
            parent_id: processedData.parent_id,
            owner_id: processedData.owner_id,
            hasOrganization: !!(processedData.club_id || processedData.academy_id || processedData.trainer_id || processedData.agent_id || processedData.club || processedData.academy || processedData.trainer || processedData.agent || processedData.organization || processedData.organization_id || processedData.parent_id || processedData.owner_id)
          });
        }

      } catch (error) {
          console.error('❌ [fetchPlayerData] خطأ في جلب بيانات اللاعب:', error);
          if (isMounted) {
            const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
            setError(`حدث خطأ أثناء جلب بيانات اللاعب: ${errorMessage}`);
        setIsLoading(false);
      }
        }
    };

    fetchPlayerData();

    return () => {
      isMounted = false;
    };
  }, [user, router, targetPlayerId]);

  // إضافة useEffect منفصل لجلب معلومات المستخدم والمنظمة
  useEffect(() => {
    if (player) {
      console.log('🔄 [useEffect] تم تحديث بيانات اللاعب، جلب المعلومات الإضافية');
      console.log('📋 [useEffect] بيانات اللاعب الجديدة:', {
        name: player.full_name,
        id: player.id,
        targetPlayerId: targetPlayerId,
        isCorrectPlayer: player.id === targetPlayerId,
        source: (player as any).source
      });
      
      // التحقق من أن البيانات صحيحة
      if (player.id !== targetPlayerId) {
        console.warn('⚠️ [useEffect] تحذير: البيانات المعروضة ليست للاعب المطلوب!', {
          displayedPlayerId: player.id,
          targetPlayerId: targetPlayerId
        });
      }
      
      // جلب المعلومات الإضافية بشكل متوازي
      Promise.all([
        fetchCurrentUserInfo(),
        fetchPlayerOrganization()
      ]).then(() => {
        console.log('✅ [useEffect] تم جلب جميع المعلومات الإضافية بنجاح');
      }).catch((error) => {
        console.error('❌ [useEffect] خطأ في جلب المعلومات الإضافية:', error);
      });
    }
  }, [player, targetPlayerId]);

  // تم دمج هذه الـ useEffect في الـ useEffect السابق لتجنب التكرار

  // إضافة useEffect لمراقبة حالة التحميل
  useEffect(() => {
    if (isLoading) {
      console.log('⏳ [useEffect] حالة التحميل: جاري تحميل بيانات اللاعب...', {
        targetPlayerId,
        playerIdFromUrl
      });
    } else if (player) {
      console.log('✅ [useEffect] تم تحميل بيانات اللاعب بنجاح', {
        playerName: player.full_name,
        playerId: player.id,
        targetPlayerId,
        isCorrectPlayer: player.id === targetPlayerId
      });
      
      // التحقق من أن البيانات صحيحة
      if (player.id !== targetPlayerId) {
        console.error('❌ [useEffect] خطأ: البيانات المعروضة ليست للاعب المطلوب!', {
          displayedPlayerId: player.id,
          displayedPlayerName: player.full_name,
          targetPlayerId: targetPlayerId
        });
        
        // إعادة تحميل البيانات الصحيحة
        console.log('🔄 [useEffect] إعادة تحميل البيانات الصحيحة...');
        setIsLoading(true);
        setError(null);
        setPlayer(null);
      }
    } else if (error) {
      console.log('❌ [useEffect] حدث خطأ في تحميل البيانات:', error);
    }
  }, [isLoading, player, error, targetPlayerId, playerIdFromUrl]);

  // إضافة useEffect للتأكد من تحميل البيانات الصحيحة
  useEffect(() => {
    if (targetPlayerId && !isLoading && !player) {
      console.log('🔄 [useEffect] إعادة تحميل البيانات - لم يتم العثور على اللاعب');
      setIsLoading(true);
      setError(null);
    }
  }, [targetPlayerId, isLoading, player]);

  // useEffect إضافي لمعالجة حالة التوقيت - عندما يتم تحديث currentUserInfo
  useEffect(() => {
    console.log('🔄 useEffect للمستخدم الحالي triggered:', {
      hasCurrentUserInfo: !!currentUserInfo,
      currentUserType: currentUserInfo?.type,
      hasPlayer: !!player,
      playerName: player?.full_name,
      organizationLoading: organizationLoading,
      hasPlayerOrganization: !!playerOrganization
    });
    
    // إذا تم تحديث currentUserInfo ولدينا لاعب ولم نحدد المنظمة بعد
    if (currentUserInfo && player && !playerOrganization && !organizationLoading) {
      console.log('🔄 إعادة تشغيل fetchPlayerOrganization بعد تحديث currentUserInfo');
      fetchPlayerOrganization();
    }
  }, [currentUserInfo]); // نستمع لتغيير currentUserInfo

  // دالة توليد رابط الملف الشخصي للمنظمة
  const getOrganizationProfileUrl = (organization: any): string => {
    if (!organization || !organization.type || !organization.id) return '';
    
    switch (organization.type) {
      case 'club':
        return `/dashboard/club/profile?id=${organization.id}`;
      case 'academy':
        return `/dashboard/academy/profile?id=${organization.id}`;
      case 'trainer':
        return `/dashboard/trainer/profile?id=${organization.id}`;
      case 'agent':
        return `/dashboard/agent/profile?id=${organization.id}`;
      case 'نادي':
        return `/dashboard/club/profile?id=${organization.id}`;
      case 'أكاديمية':
        return `/dashboard/academy/profile?id=${organization.id}`;
      case 'مدرب':
        return `/dashboard/trainer/profile?id=${organization.id}`;
      case 'وكيل لاعبين':
        return `/dashboard/agent/profile?id=${organization.id}`;
      default:
        console.warn('نوع منظمة غير معروف:', organization.type);
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header مع معلومات الحساب */}
      <div className="sticky top-0 z-50 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            {/* زر العودة */}
            <button
              onClick={() => router.back()}
              className="flex gap-2 items-center px-4 py-2 text-gray-600 rounded-lg transition-all hover:text-gray-800 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">العودة</span>
            </button>

            {/* معلومات الحساب المصادق - محسنة للوضوح */}
            {currentUserInfo && (
              <div className="flex gap-3 items-center">
                {/* تسمية توضيحية */}
                <div className="pl-3 text-sm font-medium text-gray-500 border-l border-gray-300">
                  تتصفح بحساب:
                </div>
                
                <div className="flex gap-3 items-center px-4 py-2 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border border-emerald-200 shadow-sm">
                  <div className={`p-2 rounded-full ${currentUserInfo.color} text-white shadow-sm`}>
                    {React.createElement(currentUserInfo.icon, { className: "w-5 h-5" })}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">
                      {currentUserInfo.name || currentUserInfo.full_name}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {currentUserInfo.type} • نشط
                    </div>
                  </div>
                  
                  {/* أيقونة التحقق */}
                  <div className="flex justify-center items-center w-6 h-6 bg-green-500 rounded-full">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-blue-500 animate-spin border-t-transparent"></div>
              <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="p-8 max-w-md text-center bg-white rounded-lg shadow-md">
              <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full">
                <User className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-red-600">⚠️ خطأ في تحميل البيانات</h2>
              <p className="mb-4 text-sm leading-relaxed text-gray-600">{error}</p>
              
              {/* تفاصيل إضافية للمطورين */}
              <div className="p-3 mb-4 text-xs text-left bg-gray-50 rounded-lg">
                <div className="font-mono">
                  <div>🔍 Player ID: {targetPlayerId || 'غير محدد'}</div>
                  <div>👤 User ID: {user?.uid || 'غير مسجل'}</div>
                  <div>🔗 View Mode: {playerIdFromUrl ? 'عرض لاعب آخر' : 'عرض الملف الشخصي'}</div>
                </div>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <button
                  onClick={() => router.back()}
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                  🔙 العودة
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 px-4 py-2 text-white bg-gray-600 rounded-lg transition-colors hover:bg-gray-700"
                >
                  🔄 إعادة تحميل
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* شريط توضيحي لبيانات اللاعب */}
            <div className="p-4 mb-6 text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg">
              <div className="flex gap-3 justify-between items-center">
                <div className="flex gap-3 items-center">
                  <div className="flex justify-center items-center w-8 h-8 rounded-full bg-white/20">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">ملف اللاعب التفصيلي</h2>
                    <p className="text-sm text-blue-100">جميع البيانات التالية خاصة باللاعب المعروض</p>
                  </div>
                </div>
                
                {/* زر السيرة الذاتية */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const resumeTab = document.querySelector('[data-tab="resume"]') as HTMLElement;
                      if (resumeTab) {
                        resumeTab.click();
                      }
                    }}
                    className="flex gap-2 items-center px-4 py-2 text-blue-600 bg-white rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    السيرة الذاتية
                  </button>
                </div>
              </div>
            </div>

            {/* Header اللاعب - محسن */}
            <div className="overflow-hidden mb-8 bg-white rounded-xl border border-gray-200 shadow-lg">
              <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black/20"></div>
                
                {/* تسمية توضيحية لبيانات اللاعب */}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1 text-xs font-medium text-gray-700 rounded-full shadow-sm backdrop-blur-sm bg-white/90">
                    📋 بيانات اللاعب
                  </div>
                </div>
                
                <div className="absolute right-0 bottom-0 left-0 p-6">
                  <div className="flex gap-6 items-end">
                    {/* صورة اللاعب مع لوجو الجهة التابع لها */}
                    <div className="relative">
                      <div className="overflow-hidden w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg">
                        {(() => {
                          const validImageUrl = getValidImageUrl(player?.profile_image_url);
                          return validImageUrl !== '/images/default-avatar.png' ? (
                            <img
                              src={validImageUrl}
                              alt={player?.full_name}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                if (!e.currentTarget.dataset.errorHandled) {
                                  e.currentTarget.dataset.errorHandled = 'true';
                                  e.currentTarget.src = '/images/default-avatar.png';
                                }
                              }}
                            />
                          ) : (
                            <div className="flex justify-center items-center w-full h-full bg-gradient-to-br from-blue-400 to-purple-500">
                              <User className="w-16 h-16 text-white" />
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* لوجو الجهة التابع لها مع تحسينات */}
                      {!organizationLoading && playerOrganization && (
                        <button
                          onClick={() => {
                            const profileUrl = getOrganizationProfileUrl(playerOrganization);
                            if (profileUrl) {
                              router.push(profileUrl);
                            }
                          }}
                          className="absolute -right-2 -bottom-2 w-12 h-12 bg-white rounded-full border-white shadow-lg transition-transform border-3 hover:scale-110 group"
                          title={`انتقل إلى ملف ${playerOrganization.type}: ${playerOrganization.name || playerOrganization.full_name}`}
                        >
                          {playerOrganization.logoUrl ? (
                            <img
                              src={playerOrganization.logoUrl}
                              alt={`لوجو ${playerOrganization.name || playerOrganization.full_name}`}
                              className="object-cover w-full h-full rounded-full group-hover:shadow-md"
                              onError={(e) => {
                                console.log(`❌ فشل تحميل لوجو ${playerOrganization.type}، استخدام الأيقونة الافتراضية`);
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full rounded-full ${playerOrganization.color} flex items-center justify-center text-white group-hover:shadow-md ${
                              playerOrganization.logoUrl ? 'hidden' : 'flex'
                            }`}
                          >
                            {React.createElement(playerOrganization.icon, { className: "w-6 h-6" })}
                          </div>
                          
                          {/* نص توضيحي صغير */}
                          <div className="absolute -bottom-1 left-1/2 opacity-0 transition-opacity transform -translate-x-1/2 translate-y-full group-hover:opacity-100">
                            <div className="px-2 py-1 text-xs text-white whitespace-nowrap rounded bg-black/80">
                              انقر للانتقال لـ {playerOrganization.typeArabic}
                            </div>
                          </div>
                        </button>
                      )}
                      
                      {/* شارة اللاعب المستقل - محسنة */}
                      {!organizationLoading && !playerOrganization && (
                        <div
                          className="flex absolute -right-2 -bottom-2 justify-center items-center w-12 h-12 bg-gray-500 rounded-full border-white shadow-lg border-3 group"
                          title="لاعب مستقل - غير تابع لأي جهة"
                        >
                          <User className="w-6 h-6 text-white" />
                          
                          {/* نص توضيحي */}
                          <div className="absolute -bottom-1 left-1/2 opacity-0 transition-opacity transform -translate-x-1/2 translate-y-full group-hover:opacity-100">
                            <div className="px-2 py-1 text-xs text-white whitespace-nowrap rounded bg-black/80">
                              مستقل
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* مؤشر التحميل */}
                      {organizationLoading && (
                        <div className="flex absolute -right-2 -bottom-2 justify-center items-center w-12 h-12 bg-blue-500 rounded-full border-white shadow-lg border-3">
                          <div className="w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* معلومات اللاعب */}
                    <div className="flex-1 mb-4 text-white">
                      <h1 className="mb-2 text-3xl font-bold">{player?.full_name}</h1>
                      <div className="flex gap-4 items-center text-white/90">
                        <span className="flex gap-1 items-center">
                          <Target className="w-4 h-4" />
                          {player?.primary_position || 'غير محدد'}
                        </span>
                        <span className="flex gap-1 items-center">
                          <Calendar className="w-4 h-4" />
                          {(() => {
                            const age = calculateAge(player?.birth_date);
                            return age ? `${age} سنة` : 'العمر غير محدد';
                          })()}
                        </span>
                        <span className="flex gap-1 items-center">
                          <MapPin className="w-4 h-4" />
                          {player?.nationality || player?.country || 'غير محدد'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* معلومات الجهة التابع لها والاتصال - محسنة */}
            <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
              {/* الجهة التابع لها - محسنة للوضوح */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="flex gap-2 items-center text-lg font-semibold">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    الجهة التابع لها اللاعب
                  </h3>
                  
                  {/* مؤشر الحالة */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    !organizationLoading && playerOrganization 
                      ? 'bg-green-100 text-green-800' 
                      : !organizationLoading && !playerOrganization
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {!organizationLoading && playerOrganization 
                      ? `✅ تابع ل${playerOrganization.typeArabic}` 
                      : !organizationLoading && !playerOrganization
                      ? '🔸 مستقل'
                      : '⏳ جاري التحقق'
                    }
                  </div>
                </div>
                
                {!organizationLoading && playerOrganization ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex gap-4 items-center">
                        <div className="relative">
                          {playerOrganization.logoUrl ? (
                            <img
                              src={playerOrganization.logoUrl}
                              alt={`لوجو ${playerOrganization.name || playerOrganization.full_name}`}
                              className="object-cover w-14 h-14 rounded-full border-2 border-white shadow-lg"
                              onError={(e) => {
                                console.log(`❌ فشل تحميل لوجو ${playerOrganization.type} في القسم الرئيسي`);
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-14 h-14 p-3 rounded-full ${playerOrganization.color} text-white shadow-lg ${
                            playerOrganization.logoUrl ? 'hidden' : 'flex'
                          } items-center justify-center border-2 border-white`}>
                            {React.createElement(playerOrganization.icon, { className: "w-7 h-7" })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-lg font-bold text-gray-900">
                            {playerOrganization.name || playerOrganization.full_name}
                          </div>
                          <div className="flex gap-2 items-center text-sm font-medium text-gray-700">
                            <span className={`w-2 h-2 rounded-full ${playerOrganization.color.replace('bg-', 'bg-')}`}></span>
                            {playerOrganization.type}
                            {/* إظهار إذا كان هو المستخدم الحالي */}
                            {currentUserInfo && playerOrganization.id === currentUserInfo.id && (
                              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                أنت
                              </span>
                            )}
                          </div>
                          {(playerOrganization.city || playerOrganization.country) && (
                            <div className="flex gap-1 items-center mt-1 text-xs text-gray-600">
                              <MapPin className="w-3 h-3" />
                              {playerOrganization.city}
                              {playerOrganization.city && playerOrganization.country && ', '}
                              {playerOrganization.country}
                            </div>
                          )}
                          {/* إظهار علاقة الإضافة */}
                          {(() => {
                            const addedBy = (player as any)?.addedBy || (player as any)?.created_by || (player as any)?.added_by;
                            if (addedBy === user?.uid) {
                              return (
                                <div className="flex gap-1 items-center px-2 py-1 mt-1 text-xs text-blue-600 bg-blue-50 rounded">
                                  <Plus className="w-3 h-3" />
                                  أضفت هذا اللاعب
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                        <button
                          onClick={() => {
                            const profileUrl = getOrganizationProfileUrl(playerOrganization);
                            if (profileUrl) {
                              router.push(profileUrl);
                            }
                          }}
                          disabled={!getOrganizationProfileUrl(playerOrganization)}
                          className="flex gap-2 items-center px-4 py-2 text-blue-600 rounded-lg border border-blue-200 transition-colors hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-300 hover:shadow-sm"
                          title={`انتقل إلى صفحة ${playerOrganization.typeArabic}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm font-medium">عرض {playerOrganization.typeArabic}</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* معلومات إضافية عن الجهة */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                      {playerOrganization.email && (
                        <div className="flex gap-2 items-center p-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate">{playerOrganization.email}</span>
                        </div>
                      )}
                      {playerOrganization.phone && (
                        <div className="flex gap-2 items-center p-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{playerOrganization.phone}</span>
                        </div>
                      )}
                      {playerOrganization.founded && (
                        <div className="flex gap-2 items-center p-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>تأسس: {playerOrganization.founded}</span>
                        </div>
                      )}
                      {playerOrganization.type === 'نادي' && playerOrganization.league && (
                        <div className="flex gap-2 items-center p-2 text-sm text-gray-600 bg-gray-50 rounded-lg">
                          <Trophy className="w-4 h-4 text-gray-400" />
                          <span>{playerOrganization.league}</span>
                        </div>
                      )}
                    </div>

                    {/* وصف موجز */}
                    {playerOrganization.description && (
                      <div className="pt-3 border-t border-gray-100">
                        <p className="p-3 text-sm leading-relaxed text-gray-600 bg-gray-50 rounded-lg">
                          {playerOrganization.description.length > 150 
                            ? playerOrganization.description.slice(0, 150) + '...' 
                            : playerOrganization.description}
                        </p>
                      </div>
                    )}
                  </div>
                ) : organizationLoading ? (
                  <div className="py-8 text-center text-gray-500">
                    <div className="mx-auto mb-3 w-8 h-8 rounded-full border-2 border-blue-500 animate-spin border-t-transparent"></div>
                    <p className="text-sm font-medium">جاري البحث عن المنظمة...</p>
                    <p className="mt-1 text-xs text-gray-400">فحص الارتباط بالأندية والأكاديميات والمدربين...</p>
                    <div className="inline-block px-3 py-2 mt-3 text-xs text-blue-600 bg-blue-50 rounded-lg">
                      🔍 يتم فحص جميع قواعد البيانات
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="flex justify-center items-center mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-sm">
                      <span className="text-3xl">🔥</span>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                      <p className="mb-1 text-sm font-bold text-gray-700">لاعب مستقل</p>
                      <p className="mb-3 text-xs text-gray-500">هذا اللاعب غير مرتبط بأي جهة حالياً</p>
                      <div className="space-y-2 text-xs">
                        <div className="flex gap-2 justify-center items-center text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>يمكنه الانضمام لنادي أو أكاديمية</span>
                        </div>
                        <div className="flex gap-2 justify-center items-center text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>يمكنه التعاقد مع وكيل لاعبين</span>
                        </div>
                        <div className="flex gap-2 justify-center items-center text-gray-600">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          <span>يمكنه العمل مع مدرب شخصي</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* جهة الاتصال الرسمية */}
              <div className="p-6 bg-white rounded-xl shadow-md">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-semibold">
                  <Phone className="w-5 h-5 text-green-600" />
                  جهة الاتصال الرسمية
                </h3>
                {player?.official_contact && (
                  player.official_contact.name || 
                  player.official_contact.phone || 
                  player.official_contact.email
                ) ? (
                  <div className="space-y-3">
                    <div className="flex gap-3 items-center">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{player.official_contact.name || 'غير محدد'}</div>
                        <div className="text-sm text-gray-600">{player.official_contact.title || 'غير محدد'}</div>
                      </div>
                    </div>
                    {player.official_contact.phone && (
                      <div className="flex gap-3 items-center">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`tel:${player.official_contact.phone}`}
                          className="text-blue-600 hover:underline"
                        >
                          {player.official_contact.phone}
                        </a>
                      </div>
                    )}
                    {player.official_contact.email && (
                      <div className="flex gap-3 items-center">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${player.official_contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {player.official_contact.email}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <User className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                    <p className="text-sm">لم يتم تحديد جهة اتصال رسمية</p>
                    <p className="text-xs text-gray-400">يمكن للاعب إضافة هذه المعلومات في ملفه الشخصي</p>
                  </div>
                )}
              </div>
            </div>

            {/* التبويبات */}
            <div className="overflow-hidden bg-white rounded-xl shadow-md">
              <div className="border-b border-gray-200">
                <div className="flex overflow-x-auto">
                  {TABS.map((tab, idx) => (
                    <button
                      key={tab.name}
                      data-tab={tab.name === 'السيرة الذاتية' ? 'resume' : `tab-${idx}`}
                      onClick={() => setCurrentTab(idx)}
                      className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        currentTab === idx
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6">
                {TABS[currentTab]?.render?.() || <div>التبويب غير متوفر</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PlayerReportPage;
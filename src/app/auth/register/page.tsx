'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/lib/firebase/auth-provider';
// تم حذف الترجمة
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Eye,
  EyeOff,
  Home,
  Loader2,
  Lock,
  Phone,
  Mail,
  Shield,
  Star,
  User,
  UserCheck,
  Users,
  X
} from 'lucide-react';
import UnifiedOTPVerification from '@/components/shared/UnifiedOTPVerification';

// Define user role types
type UserRole = 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin';

// قائمة الدول مع أكوادها والعملات وأطوال أرقام الهاتف
const countries = [
  { name: 'السعودية', code: '+966', currency: 'SAR', currencySymbol: 'ر.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الإمارات', code: '+971', currency: 'AED', currencySymbol: 'د.إ', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الكويت', code: '+965', currency: 'KWD', currencySymbol: 'د.ك', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'قطر', code: '+974', currency: 'QAR', currencySymbol: 'ر.ق', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'البحرين', code: '+973', currency: 'BHD', currencySymbol: 'د.ب', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'عمان', code: '+968', currency: 'OMR', currencySymbol: 'ر.ع', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'مصر', code: '+20', currency: 'EGP', currencySymbol: 'ج.م', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'الأردن', code: '+962', currency: 'JOD', currencySymbol: 'د.أ', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'لبنان', code: '+961', currency: 'LBP', currencySymbol: 'ل.ل', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'العراق', code: '+964', currency: 'IQD', currencySymbol: 'د.ع', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'سوريا', code: '+963', currency: 'SYP', currencySymbol: 'ل.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'المغرب', code: '+212', currency: 'MAD', currencySymbol: 'د.م', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الجزائر', code: '+213', currency: 'DZD', currencySymbol: 'د.ج', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'تونس', code: '+216', currency: 'TND', currencySymbol: 'د.ت', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'ليبيا', code: '+218', currency: 'LYD', currencySymbol: 'د.ل', phoneLength: 9, phonePattern: '[0-9]{9}' },
  // مضافة حديثاً
  { name: 'السودان', code: '+249', currency: 'SDG', currencySymbol: 'ج.س', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'السنغال', code: '+221', currency: 'XOF', currencySymbol: 'Fr', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'ساحل العاج', code: '+225', currency: 'XOF', currencySymbol: 'Fr', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'جيبوتي', code: '+253', currency: 'DJF', currencySymbol: 'Fr', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'إسبانيا', code: '+34', currency: 'EUR', currencySymbol: '€', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'فرنسا', code: '+33', currency: 'EUR', currencySymbol: '€', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'إنجلترا', code: '+44', currency: 'GBP', currencySymbol: '£', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'البرتغال', code: '+351', currency: 'EUR', currencySymbol: '€', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'إيطاليا', code: '+39', currency: 'EUR', currencySymbol: '€', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'اليونان', code: '+30', currency: 'EUR', currencySymbol: '€', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'قبرص', code: '+357', currency: 'EUR', currencySymbol: '€', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'تركيا', code: '+90', currency: 'TRY', currencySymbol: '₺', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'تايلاند', code: '+66', currency: 'THB', currencySymbol: '฿', phoneLength: 9, phonePattern: '[0-9]{9}' },
];

// دالة للحصول على مسار لوحة التحكم حسب نوع الحساب
const getDashboardRoute = (accountType: string) => {
  switch (accountType) {
    case 'player': return '/dashboard/player';
    case 'club': return '/dashboard/club';
    case 'agent': return '/dashboard/agent';
    case 'academy': return '/dashboard/academy';
    case 'trainer': return '/dashboard/trainer';
    case 'marketer': return '/dashboard/marketer';
    default: return '/dashboard';
  }
};

// دالة للتحقق من صحة تنسيق البريد الإلكتروني فقط
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

function normalizePhone(countryCode: string, phone: string) {
  // إزالة أي صفر في بداية الرقم المحلي
  let local = phone.replace(/^0+/, '');
  // إزالة أي رموز أو فراغات
  local = local.replace(/\D/g, '');
  // دمج كود الدولة مع الرقم المحلي (بدون +)
  return `${countryCode.replace(/\D/g, '')}${local}`;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, userData } = useAuth();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState<number>(1);

  // عبارات تسويقية متغيرة (يسار العنوان)
  const rotatingTips = [
    'ابدأ خلال دقيقة واحدة فقط',
    'سجّل برقم هاتفك بسهولة',
    'أضف بريدك الإلكتروني (اختياري)',
    'ادخل كود الانضمام لربط حسابك',
    'أمان وحماية لبياناتك دائمًا'
  ];
  const [tipIndex, setTipIndex] = useState(0);

  // التأكد من أننا على العميل
  useEffect(() => {
    setIsClient(true);
  }, []);

  // تدوير العبارات تلقائياً
  useEffect(() => {
    const id = setInterval(() => {
      setTipIndex((i) => (i + 1) % rotatingTips.length);
    }, 3500);
    return () => clearInterval(id);
  }, []);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: '',
    name: '',
    agreeToTerms: false,
    country: '',
    countryCode: '',
    currency: '',
    currencySymbol: '',
    organizationCode: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | React.ReactNode>('');
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [pendingRegistrationData, setPendingRegistrationData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [phoneExistsError, setPhoneExistsError] = useState('');
  const [enteredOTP, setEnteredOTP] = useState<string>('');
  const phoneCheckRef = useRef(false);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [orgCodeChecking, setOrgCodeChecking] = useState(false);
  const [orgCodeError, setOrgCodeError] = useState('');
  const orgCodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [orgPreview, setOrgPreview] = useState<{ name: string; type: string; logoUrl?: string } | null>(null);

  // تحقق من تكرار رقم الهاتف عند الكتابة
  const handlePhoneValidation = async (phoneNumber: string) => {
    if (!formData.countryCode) {
      setPhoneExistsError('يرجى اختيار الدولة أولاً');
      return;
    }
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }
    setPhoneExistsError('');
    if (!phoneNumber || phoneNumber.length < 6) return;
    phoneCheckTimeoutRef.current = setTimeout(async () => {
      setPhoneCheckLoading(true);
      try {
        const checkRes = await fetch('/api/auth/check-user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `${formData.countryCode}${phoneNumber}` }),
        });
        const checkData = await checkRes.json();
        if (checkData.phoneExists) {
          setPhoneExistsError('رقم الهاتف مستخدم بالفعل. يمكنك تسجيل الدخول مباشرة.');
        } else {
          setPhoneExistsError('');
        }
      } catch (e) {
        setPhoneExistsError('تعذر التحقق من رقم الهاتف. حاول لاحقًا.');
      } finally {
        setPhoneCheckLoading(false);
      }
    }, 500);
  };

  const accountTypes = [
    { value: 'player', label: 'لاعب', icon: Star },
    { value: 'club', label: 'نادي', icon: Home },
    { value: 'agent', label: 'وكيل', icon: UserCheck },
    { value: 'academy', label: 'أكاديمية', icon: Users },
    { value: 'trainer', label: 'مدرب', icon: User },
    { value: 'marketer', label: 'مسوق', icon: Users }
  ];

  // عند تحميل الصفحة: تحقق من وجود رقم هاتف معلق في localStorage
  useEffect(() => {
    const storedPendingPhone = localStorage.getItem('pendingPhoneVerification');
    if (storedPendingPhone) {
      setPendingPhone(storedPendingPhone);
      setShowPhoneVerification(true);
    }
  }, []);

  // عدل handleInputChange ليستخدم التحقق
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      handlePhoneValidation(numbersOnly);
      return;
    }

    // التحقق من كود الانضمام (اختياري ولكن يتم التحقق عند الإدخال)
    if (name === 'organizationCode') {
      const cleaned = value.trim();
      setFormData(prev => ({ ...prev, organizationCode: cleaned }));
      // إلغاء أي تحقق سابق
      if (orgCodeTimeoutRef.current) clearTimeout(orgCodeTimeoutRef.current);
      // إذا كان الحقل فارغًا، نظّف الأخطاء
      if (!cleaned) {
        setOrgCodeError('');
        setOrgCodeChecking(false);
        setOrgPreview(null);
        return;
      }
      orgCodeTimeoutRef.current = setTimeout(async () => {
        try {
          setOrgCodeChecking(true);
          setOrgCodeError('');
          const { organizationReferralService } = await import('@/lib/organization/organization-referral-service');
          const { db } = await import('@/lib/firebase/config');
          const { doc, getDoc } = await import('firebase/firestore');
          const referral = await organizationReferralService.findReferralByCode(cleaned.toUpperCase());
          if (!referral) {
            setOrgCodeError('كود الانضمام غير صحيح');
            setOrgPreview(null);
          } else if (referral && referral.isActive === false) {
            setOrgCodeError('كود الانضمام غير مفعل');
            setOrgPreview(null);
          } else if (typeof (referral as any).maxUsage === 'number' && (referral as any).maxUsage >= 0 && (referral as any).currentUsage >= (referral as any).maxUsage) {
            setOrgCodeError('تم الوصول إلى الحد الأقصى لاستخدام هذا الكود');
            setOrgPreview(null);
          } else {
            setOrgCodeError('');
            // محاولة جلب صورة وشعار المنظمة من مجموعتها
            let collectionName = '';
            switch ((referral as any).organizationType) {
              case 'club': collectionName = 'clubs'; break;
              case 'academy': collectionName = 'academies'; break;
              case 'agent': collectionName = 'agents'; break;
              case 'trainer': collectionName = 'trainers'; break;
              default: collectionName = '';
            }
            let logoUrl: string | undefined = undefined;
            let orgName: string | undefined = (referral as any).organizationName;
            if (collectionName) {
              try {
                const snap = await getDoc(doc(db, collectionName, (referral as any).organizationId));
                const data: any = snap.exists() ? snap.data() : null;
                logoUrl = data?.logo || data?.logoUrl || data?.image || data?.profileImage || data?.photoURL || undefined;
                orgName = data?.name || data?.full_name || data?.displayName || orgName;
              } catch {}
            }
            const type = (referral as any).organizationType;
            setOrgPreview({ name: orgName || 'المنظمة', type, logoUrl });
          }
        } catch (err) {
          setOrgCodeError('تعذر التحقق من كود الانضمام، حاول لاحقًا');
          setOrgPreview(null);
        } finally {
          setOrgCodeChecking(false);
        }
      }, 500);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // دالة لتحديث الدولة المختارة
  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    
    setFormData(prev => ({
      ...prev,
      country: countryName,
      countryCode: country?.code || '',
      currency: country?.currency || '',
      currencySymbol: country?.currencySymbol || '',
      phone: '' // مسح رقم الهاتف عند تغيير الدولة
    }));
  };

  const validateForm = () => {
    // التحقق من الاسم
    if (!formData.name.trim()) {
      setError('يرجى إدخال الاسم الكامل');
      return false;
    }

    // التحقق من الدولة
    if (!formData.country) {
      setError('يرجى اختيار الدولة');
      return false;
    }

    // التحقق من رقم الهاتف
    if (!formData.phone.trim()) {
      setError('يرجى إدخال رقم الهاتف');
      return false;
    }

    // التحقق من كلمة المرور
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return false;
    }

    if (!formData.accountType) {
      setError('يرجى اختيار نوع الحساب');
      return false;
    }

    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام');
      return false;
    }

    if (phoneExistsError) {
      setError(phoneExistsError);
      return false;
    }

    // إذا كان كود الانضمام موجودًا يجب أن يكون صالحًا
    if (formData.organizationCode && orgCodeError) {
      setError(orgCodeError);
      return false;
    }

    return true;
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;

    console.log('🚀 Starting registration process (OTP disabled)...');
    setLoading(true);
    
    try {
      // تخطي إرسال OTP وإنشاء الحساب مباشرة
      const formattedPhone = normalizePhone(formData.countryCode, formData.phone);
      
      console.log('⏭️ OTP verification disabled, creating account directly...');
      
      // توليد بريد إلكتروني مؤقت آمن لـ Firebase
      const cleanPhone = formattedPhone.replace(/[^0-9]/g, '');
      const cleanCountryCode = formData.countryCode.replace(/[^0-9]/g, '');
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const firebaseEmail = `user_${cleanCountryCode}_${cleanPhone}_${timestamp}_${randomSuffix}@el7lm.com`;
      
      const registrationData = {
        full_name: formData.name,
        phone: formattedPhone,
        country: formData.country,
        countryCode: formData.countryCode,
        currency: formData.currency,
        currencySymbol: formData.currencySymbol
      };
      
      // إنشاء الحساب مباشرة
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
      
      console.log('✅ Account created successfully (OTP disabled):', userData);

      // معالجة كود الانضمام إذا تم إدخاله وكان الحساب لاعب
      if (formData.organizationCode && formData.accountType === 'player') {
        try {
          const { organizationReferralService } = await import('@/lib/organization/organization-referral-service');
          await organizationReferralService.createJoinRequest(
            (userData as any).uid || (userData as any).id,
            userData,
            formData.organizationCode.trim()
          );
          console.log('✅ Join request created successfully');
        } catch (joinErr) {
          console.warn('⚠️ Join request failed:', joinErr);
        }
      }
      
      setLoading(false);
      
      // إعادة التوجيه إلى لوحة التحكم
      const dashboardRoute = getDashboardRoute(formData.accountType);
      router.push(dashboardRoute);
      
    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء التسجيل.');
      } else {
        setError('حدث خطأ غير متوقع أثناء التسجيل.');
      }
      setLoading(false);
    }
  };

  const handlePhoneVerificationClose = () => {
    console.log('🔒 Closing OTP verification modal');
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPhoneVerification');
    localStorage.removeItem('pendingRegistration');
          setError('تم إلغاء التحقق من الهاتف.');
  };

  // دالة تخطي OTP للعملاء الجدد
  const handleSkipOTP = async () => {
    console.log('⏭️ Skipping OTP verification for new customers');
    setLoading(true);
    
    try {
      // استرجاع بيانات التسجيل المعلقة
      const pendingDataStr = localStorage.getItem('pendingRegistration');
      if (!pendingDataStr) {
        throw new Error('بيانات التسجيل غير موجودة');
      }
      
      const pendingData = JSON.parse(pendingDataStr);
      
      console.log('✅ Skipping OTP, creating account directly...');
      
      // توليد بريد إلكتروني مؤقت آمن لـ Firebase
      const cleanPhone = (pendingData.phone || '').replace(/[^0-9]/g, '');
      const cleanCountryCode = (pendingData.countryCode || '').replace(/[^0-9]/g, '');
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const firebaseEmail = `user_${cleanCountryCode}_${cleanPhone}_${timestamp}_${randomSuffix}@el7lm.com`;
      
      const registrationData = {
        full_name: pendingData.name,
        phone: pendingData.phone,
        country: pendingData.country,
        countryCode: pendingData.countryCode,
        currency: pendingData.currency,
        currencySymbol: pendingData.currencySymbol
      };
      
      // إنشاء الحساب
      const userData = await registerUser(
        firebaseEmail,
        pendingData.password, 
        pendingData.accountType as UserRole,
        {
          ...registrationData,
          phone: pendingData.phone,
          originalEmail: pendingData.phone.trim() || null,
          firebaseEmail: firebaseEmail
        }
      );
      
      console.log('✅ Account created successfully (OTP skipped):', userData);
      
      // تنظيف البيانات المعلقة
      localStorage.removeItem('pendingRegistration');
      localStorage.removeItem('pendingPhoneVerification');
      
      // إغلاق نافذة التحقق
      setShowPhoneVerification(false);
      setPendingPhone(null);
      
      // إعادة التوجيه إلى لوحة التحكم
      const dashboardRoute = getDashboardRoute(pendingData.accountType);
      router.push(dashboardRoute);
      
    } catch (error: unknown) {
      console.error('❌ Account creation failed:', error);
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء إنشاء الحساب.');
      } else {
        setError('حدث خطأ غير متوقع أثناء إنشاء الحساب.');
      }
      setLoading(false);
    }
  };

  const handleOTPVerification = async (otp: string) => {
    console.log('🔐 Verifying OTP:', otp);
    setLoading(true);
    
    try {
      // استرجاع بيانات التسجيل المعلقة
      const pendingDataStr = localStorage.getItem('pendingRegistration');
      if (!pendingDataStr) {
        throw new Error('بيانات التسجيل غير موجودة');
      }
      
      const pendingData = JSON.parse(pendingDataStr);
      
      // التحقق من صحة OTP
      if (otp !== pendingData.otp) {
        throw new Error('رمز التحقق غير صحيح');
      }
      
      console.log('✅ OTP verified, creating account...');
      
      // توليد بريد إلكتروني مؤقت آمن لـ Firebase
      const cleanPhone = (pendingData.phone || '').replace(/[^0-9]/g, '');
      const cleanCountryCode = (pendingData.countryCode || '').replace(/[^0-9]/g, '');
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const firebaseEmail = `user_${cleanCountryCode}_${cleanPhone}_${timestamp}_${randomSuffix}@el7lm.com`;
      
      const registrationData = {
        full_name: pendingData.name,
        phone: pendingData.phone,
        country: pendingData.country,
        countryCode: pendingData.countryCode,
        currency: pendingData.currency,
        currencySymbol: pendingData.currencySymbol
      };
      
      // إنشاء الحساب
      const userData = await registerUser(
        firebaseEmail,
        pendingData.password, 
        pendingData.accountType as UserRole,
        {
          ...registrationData,
          phone: pendingData.phone,
          originalEmail: pendingData.phone.trim() || null,
          firebaseEmail: firebaseEmail
        }
      );
      
      console.log('✅ Account created successfully:', userData);
      
      // تنظيف البيانات المعلقة
      localStorage.removeItem('pendingRegistration');
      localStorage.removeItem('pendingPhoneVerification');
      setShowPhoneVerification(false);
      setPendingPhone(null);
      
      setMessage('✅ تم إنشاء الحساب بنجاح! سيتم تحويلك للوحة التحكم.');
      setTimeout(() => {
        const dashboardRoute = getDashboardRoute(pendingData.accountType);
        router.replace(dashboardRoute);
      }, 1000);
      
    } catch (error: unknown) {
      console.error('❌ OTP verification failed:', error);
      if (error instanceof Error) {
        setError(error.message || 'فشل في التحقق من رمز التحقق.');
      } else {
        setError('حدث خطأ غير متوقع أثناء التحقق من رمز التحقق.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${isClient && isRTL ? 'dir-rtl' : 'dir-ltr'} min-h-screen w-full flex items-center justify-center bg-purple-950 px-4 py-8`}>
      {/* Centered compact card */}
      <div className="w-full max-w-md rounded-2xl border border-purple-100 shadow-2xl backdrop-blur bg-white/95">
        <div className="px-6 pt-6 pb-3">
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2 items-center text-purple-600">
              <Shield className="w-6 h-6" />
              <span className="text-base font-bold">El7lm</span>
            </div>
            <button type="button" onClick={() => router.push('/auth/login')} className="text-xs text-gray-600 hover:text-indigo-600">لديك حساب؟ تسجيل الدخول</button>
          </div>
          <div className="mb-2 text-center">
            <h1 className="text-xl font-extrabold text-gray-900">إنشاء حساب جديد</h1>
            <p className="mt-1 text-xs text-gray-500">انضم إلى منصة El7lm وابدأ رحلتك</p>
            <div className="mt-1 min-h-[1rem]" aria-live="polite">
              <span key={tipIndex} className="inline-block text-[11px] text-purple-600 transition-opacity duration-500 ease-in-out">{rotatingTips[tipIndex]}</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="px-6 pb-3">
            <div className="flex items-center justify-center gap-1.5">
              {[1,2,3,4].map(i => (
                <span
                  key={i}
                  className={`inline-block w-6 h-1.5 rounded-full transition-all ${i <= step ? 'bg-purple-600' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              if (step < 4) {
                e.preventDefault();
                setStep(step + 1);
                return;
              }
              handleRegister(e as any);
            }}
            className="px-6 pb-6 space-y-4"
          >
            <div className="space-y-4">
            {/* Error and Success Messages */}
            {error && (
                <div className="flex gap-2 items-start p-4 text-red-700 bg-red-50 rounded-lg" role="alert" aria-live="assertive">
                <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  {typeof error === 'string' ? <p>{error}</p> : error}
                </div>
              </div>
            )}
            {message && (
              <div className="flex gap-2 items-center p-4 text-green-700 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5" />
                <p>{message}</p>
              </div>
            )}
            {/* Step 1 - Account Type */}
            {step === 1 && (
              <div className="space-y-3">
                <label className="block text-xs text-gray-600">اختر نوع الحساب</label>
                <div className="grid grid-cols-4 gap-2">
                  {accountTypes.slice(0,4).map(({ value, label, icon: Icon }) => (
                <label
                  key={value}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer border transition-all text-center ${
                    formData.accountType === value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={value}
                    checked={formData.accountType === value}
                    onChange={handleInputChange}
                    className="hidden"
                  />
                      <Icon className={`h-4 w-4 ${formData.accountType === value ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-[11px] font-medium ${formData.accountType === value ? 'text-indigo-700' : 'text-gray-600'}`}>{label}</span>
                </label>
              ))}
            </div>
                <div className="grid grid-cols-2 gap-2">
                  {accountTypes.slice(4).map(({ value, label, icon: Icon }) => (
                    <label
                      key={value}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer border transition-all text-center ${
                        formData.accountType === value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value={value}
                        checked={formData.accountType === value}
                        onChange={handleInputChange}
                        className="hidden"
                      />
                      <Icon className={`h-4 w-4 ${formData.accountType === value ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <span className={`text-[11px] font-medium ${formData.accountType === value ? 'text-indigo-700' : 'text-gray-600'}`}>{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 - Personal + Phone */}
            {step === 2 && (
              <div className="space-y-3">
              <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">الاسم الكامل</label>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                      className="py-2 pr-10 pl-4 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="أدخل اسمك الكامل"
                    required
                    maxLength={50}
                  />
                  <User className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                </div>
              </div>
              <div>
                  <label htmlFor="country" className="block mb-1.5 text-gray-700 text-sm">البلد</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="py-2 pr-10 pl-4 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    title="اختيار البلد"
                    aria-label="البلد"
                  >
                    <option value="">اختر البلد</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.name}>
                        {country.name} ({country.code}) - {country.phoneLength} أرقام
                      </option>
                    ))}
                  </select>
                </div>
              <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">رقم الهاتف</label>
                <div className="relative">
                  <div className="flex">
                      <div className="flex items-center px-2 text-xs bg-gray-50 rounded-l-lg border border-r-0 border-gray-300">
                      {formData.countryCode || '+966'}
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                        className={`w-full py-2 pl-10 pr-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent border-gray-300 text-sm ${phoneExistsError ? 'border-red-300 focus:ring-red-500' : phoneCheckLoading ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-300 focus:ring-purple-500'}`}
                        placeholder={selectedCountry ? `${selectedCountry.phoneLength} أرقام` : 'أدخل رقم الهاتف'}
                      required
                      maxLength={selectedCountry?.phoneLength || 10}
                        aria-label="رقم الهاتف"
                        title="رقم الهاتف"
                      />
                      {phoneExistsError && (
                        <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">{phoneExistsError}</p>
                    )}
                  </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 - Optional contact */}
            {step === 3 && (
              <div className="space-y-3">
                <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">البريد الإلكتروني (اختياري)</label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={(formData as any).email || ''}
                      onChange={handleInputChange}
                      className="py-2 pr-10 pl-4 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="example@mail.com"
                    />
                    <Mail className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                  </div>
                </div>
                <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">كود الانضمام (اختياري)</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="organizationCode"
                      value={formData.organizationCode}
                      onChange={handleInputChange}
                      className={`py-2 pr-10 pl-4 w-full text-sm rounded-lg border focus:ring-2 focus:border-transparent ${orgCodeError ? 'border-red-300 focus:ring-red-500' : orgCodeChecking ? 'border-purple-300 focus:ring-purple-500' : 'border-gray-300 focus:ring-indigo-500'}`}
                      placeholder="أدخل كود الانضمام إذا كان لديك"
                      aria-label="كود الانضمام"
                      title="كود الانضمام"
                    />
                    <Users className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                    {orgCodeChecking && (
                      <div className="absolute left-3 top-1/2 text-purple-500 -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                    {orgCodeError && (
                      <p className="mt-1 text-xs text-red-600" role="alert" aria-live="polite">{orgCodeError}</p>
                    )}
                    {orgPreview && !orgCodeError && (
                      <div className="flex gap-2 items-center p-2 mt-2 bg-gray-50 rounded-lg border">
                        {orgPreview.logoUrl ? (
                          <Image src={orgPreview.logoUrl} alt={orgPreview.name} width={28} height={28} className="rounded" />
                        ) : (
                          <Users className="w-5 h-5 text-gray-400" />
                        )}
                        <div className="text-sm">
                          <div className="font-semibold text-gray-800">{orgPreview.name}</div>
                          <div className="text-xs text-gray-500">نوع المنظمة: {orgPreview.type}</div>
                </div>
              </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 - Password + terms */}
            {step === 4 && (
              <div className="space-y-3">
              <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                      className="py-2 pr-10 pl-10 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="8 أحرف على الأقل"
                    required
                    minLength={8}
                  />
                  <Lock className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                  <label className="block mb-1.5 text-gray-700 text-sm">تأكيد كلمة المرور</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                      className="py-2 pr-10 pl-10 w-full text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="أعد إدخال كلمة المرور"
                    required
                  />
                  <Lock className="absolute right-3 top-1/2 w-5 h-5 text-gray-400 -translate-y-1/2" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 text-gray-400 -translate-y-1/2 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            <div className="flex gap-2 items-center">
                  <input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} className="w-4 h-4 text-indigo-600 rounded" title="الموافقة على الشروط" aria-label="الموافقة على الشروط" />
                  <span className="text-sm text-gray-600">أوافق على <button type="button" className="ml-1 text-indigo-600 hover:underline" onClick={() => setShowTerms(true)}>الشروط والأحكام</button></span>
                </div>
              </div>
            )}
            </div>

            {/* Terms and Submit */}
            <div className="flex gap-2 justify-between items-center pt-1">
              {step > 1 ? (
                <button type="button" onClick={() => setStep(step - 1)} className="px-3 py-2 text-xs text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">السابق</button>
              ) : <span />}
            <button
              type="submit"
                disabled={loading || phoneCheckLoading || (!!phoneExistsError && step === 2) || (formData.organizationCode ? (orgCodeChecking || !!orgCodeError) : false)}
                className={`px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all ${loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {loading ? 'جاري المعالجة...' : step < 4 ? 'التالي' : 'تسجيل'}
                </button>
              </div>
          </form>
              </div>
            </div>
      {/* Marketing panel (right) */}
      <div className="hidden justify-center items-center p-6 h-full bg-purple-900 rounded-2xl md:col-span-6 md:flex">
        <div className="w-full text-center text-white">
          <div className="inline-flex items-center px-3 py-1 mb-6 text-sm text-white rounded-full bg-white/20">تقييم المستخدمين 4.6★</div>
          <div className="p-6 rounded-2xl backdrop-blur-sm bg-white/10">
            <blockquote className="text-lg leading-relaxed">"أكثر ما نحبه في المنصة أنك تبدأ بسرعة دون الحاجة لتعلّم الكثير. كل ما تحتاجه متاح بخطوات بسيطة."</blockquote>
            <div className="mt-4 text-sm text-white/80">— مستخدم من مجتمع El7lm</div>
        </div>
          <div className="mt-8 text-white/80">انضم لآلاف المستخدمين الذين يثقون بالمنصة في رحلتهم.</div>
        </div>
      </div>
        {/* Terms and Conditions Dialog */}
        <AlertDialog open={showTerms} onOpenChange={setShowTerms}>
      <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
          <AlertDialogTitle>الشروط والأحكام</AlertDialogTitle>
            </AlertDialogHeader>
        <div className="text-sm text-gray-700 max-h-[60vh] overflow-y-auto space-y-2">
          <p>باستخدامك المنصة فأنت توافق على الالتزام بالقواعد والسياسات العامة، بما في ذلك سياسة الخصوصية وحماية البيانات.</p>
          <p>يجب أن تكون المعلومات المدخلة صحيحة، ويحق للمنصة إيقاف أو تعليق الحساب عند إساءة الاستخدام أو مخالفة القوانين.</p>
          <p>قد نقوم بإرسال إشعارات تتعلق بالأمان أو التحقق من الحساب. يمكنك التواصل معنا لأي استفسار.</p>
                </div>
        <div className="flex justify-end mt-4">
          <button type="button" onClick={() => setShowTerms(false)} className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700">حسنًا</button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { Shield, Phone, CheckCircle, AlertTriangle, Loader2, ArrowLeft, Check, X } from 'lucide-react';
import UnifiedOTPVerification from '@/components/shared/UnifiedOTPVerification';
import Link from 'next/link';

// قائمة الدول مع أكوادها
const countries = [
  { name: 'السعودية', code: '+966', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الإمارات', code: '+971', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الكويت', code: '+965', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'قطر', code: '+974', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'البحرين', code: '+973', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'عمان', code: '+968', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'مصر', code: '+20', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'الأردن', code: '+962', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'لبنان', code: '+961', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'العراق', code: '+964', phoneLength: 10, phonePattern: '[0-9]{10}' },
  { name: 'سوريا', code: '+963', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'المغرب', code: '+212', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'الجزائر', code: '+213', phoneLength: 9, phonePattern: '[0-9]{9}' },
  { name: 'تونس', code: '+216', phoneLength: 8, phonePattern: '[0-9]{8}' },
  { name: 'ليبيا', code: '+218', phoneLength: 9, phonePattern: '[0-9]{9}' },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [formData, setFormData] = useState({
    phone: '',
    country: '',
    countryCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | React.ReactNode>('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  // سجل لتتبع تغييرات pendingPhone
  useEffect(() => {
    console.log('🔍 pendingPhone state changed to:', pendingPhone);
  }, [pendingPhone]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [step, setStep] = useState<'phone' | 'otp' | 'password'>('phone');
  const [phoneCheckLoading, setPhoneCheckLoading] = useState(false);
  const [phoneExistsError, setPhoneExistsError] = useState('');
  const phoneCheckRef = useRef(false);
  const phoneCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // عند تحميل الصفحة: تحقق من وجود رقم هاتف معلق في localStorage
  useEffect(() => {
    const storedPendingPhone = localStorage.getItem('pendingPasswordReset');
    console.log('🔍 useEffect - storedPendingPhone from localStorage:', storedPendingPhone);
    if (storedPendingPhone) {
      console.log('✅ useEffect - setting pendingPhone from localStorage:', storedPendingPhone);
      setPendingPhone(storedPendingPhone);
      setShowPhoneVerification(true);
      setStep('otp');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // إذا كان الحقل هو رقم الهاتف، نتأكد من أنه يحتوي فقط على أرقام
    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numbersOnly
      }));
      
      // التحقق من تكرار رقم الهاتف أثناء الكتابة
      handlePhoneValidation(numbersOnly);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // دالة التحقق من تكرار رقم الهاتف أثناء الكتابة
  const handlePhoneValidation = async (phoneNumber: string) => {
    // إلغاء التحقق السابق إذا كان موجوداً
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }

    // مسح رسالة الخطأ السابقة
    setPhoneExistsError('');

    // التحقق من أن الرقم ليس فارغاً أو قصيراً جداً
    if (!phoneNumber || phoneNumber.length < 6) {
      return;
    }

    // التحقق من صحة تنسيق الرقم حسب الدولة
    const country = countries.find(c => c.name === formData.country);
    if (country) {
      const phoneRegex = new RegExp(country.phonePattern);
      if (!phoneRegex.test(phoneNumber)) {
        return;
      }
    } else {
      if (!/^[0-9]{8,10}$/.test(phoneNumber)) {
        return;
      }
    }

    // تأخير التحقق لمدة 500 مللي ثانية لتجنب الطلبات المتكررة
    phoneCheckTimeoutRef.current = setTimeout(async () => {
      // منع الاستدعاءات المتكررة
      if (phoneCheckRef.current || phoneCheckLoading) return;
      
      phoneCheckRef.current = true;
      setPhoneCheckLoading(true);
      
      try {
        const checkRes = await fetch('/api/auth/check-user-exists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: `${formData.countryCode}${phoneNumber}` || undefined,
          }),
        });
        const checkData = await checkRes.json();
        if (!checkData.phoneExists) {
          setPhoneExistsError('رقم الهاتف غير مسجل في النظام. يرجى التأكد من الرقم أو إنشاء حساب جديد.');
        }
      } catch (e) {
        setPhoneExistsError('تعذر التحقق من رقم الهاتف. حاول لاحقًا.');
      } finally {
        setPhoneCheckLoading(false);
        phoneCheckRef.current = false;
      }
    }, 500);
  };

  // دالة لتحديث الدولة المختارة
  const handleCountryChange = (countryName: string) => {
    const country = countries.find(c => c.name === countryName);
    setSelectedCountry(country);
    
    // مسح رسالة الخطأ ورقم الهاتف عند تغيير الدولة
    setPhoneExistsError('');
    if (phoneCheckTimeoutRef.current) {
      clearTimeout(phoneCheckTimeoutRef.current);
    }
    
    setFormData(prev => ({
      ...prev,
      country: countryName,
      countryCode: country?.code || '',
      phone: '' // مسح رقم الهاتف عند تغيير الدولة
    }));
  };

  const validatePhoneForm = () => {
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

    // التحقق من صحة تنسيق رقم الهاتف حسب الدولة
    const country = countries.find(c => c.name === formData.country);
    if (country) {
      const phoneRegex = new RegExp(country.phonePattern);
      if (!phoneRegex.test(formData.phone)) {
        setError(`يرجى إدخال رقم هاتف صحيح مكون من ${country.phoneLength} أرقام للدولة ${country.name}`);
        return false;
      }
    } else {
      // التحقق عام إذا لم يتم اختيار دولة
      if (!/^[0-9]{8,10}$/.test(formData.phone)) {
        setError('يرجى إدخال رقم هاتف صحيح مكون من 8-10 أرقام');
        return false;
      }
    }

    return true;
  };

  const validatePasswordForm = () => {
    // التحقق من كلمة المرور
    if (formData.newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return false;
    }

    return true;
  };

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validatePhoneForm()) return;

    // منع الإرسال المتكرر
    if (loading || showPhoneVerification) {
      console.log('🛑 Password reset blocked - already loading or OTP modal open');
      return;
    }

    setLoading(true);
    try {
      // تجهيز رقم الهاتف الكامل مع رمز الدولة
      const fullPhoneNumber = `${formData.countryCode}${formData.phone}`;
      console.log('🔍 handlePhoneSubmit - fullPhoneNumber:', fullPhoneNumber);
      console.log('🔍 handlePhoneSubmit - formData:', formData);
      
      // تحقق من القيم المطلوبة
      if (!formData.country || !formData.countryCode || !formData.phone) {
        console.error('❌ handlePhoneSubmit - missing required fields:', { country: formData.country, countryCode: formData.countryCode, phone: formData.phone });
        setError('يرجى اختيار الدولة وإدخال رقم الهاتف بشكل صحيح');
        setLoading(false);
        return;
      }
      console.log('🔍 Sending to smart-otp:', {
        phone: fullPhoneNumber,
        name: 'مستخدم',
        country: formData.country,
        countryCode: formData.countryCode
      });
      // أرسل طلب إلى API إرسال OTP باستخدام BeOn
      const otpResponse = await fetch('/api/notifications/sms/beon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          name: 'مستخدم',
          type: 'sms',
          otp_length: 4,
          lang: 'ar'
        })
      });
      const otpData = await otpResponse.json();
      if (!otpResponse.ok || !otpData.success) {
        throw new Error(otpData.error || 'فشل في إرسال رمز التحقق');
      }

      // إذا نجح، افتح نافذة التحقق
      console.log('✅ handlePhoneSubmit - setting pendingPhone to:', fullPhoneNumber);
      console.log('✅ handlePhoneSubmit - fullPhoneNumber type:', typeof fullPhoneNumber);
      console.log('✅ handlePhoneSubmit - fullPhoneNumber length:', fullPhoneNumber?.length);
      
      if (!fullPhoneNumber || fullPhoneNumber.trim() === '') {
        console.error('❌ handlePhoneSubmit - fullPhoneNumber is empty or null');
        setError('حدث خطأ في تجهيز رقم الهاتف. يرجى المحاولة مرة أخرى.');
        setLoading(false);
        return;
      }
      
      setPendingPhone(fullPhoneNumber);
      setShowPhoneVerification(true);
      localStorage.setItem('pendingPasswordReset', fullPhoneNumber);
      setStep('otp');
    } catch (error: any) {
      setError(error.message || 'حدث خطأ أثناء إرسال رمز التحقق');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerificationSuccess = async (verifiedPhone: string) => {
    console.log('✅ Phone verification success, setting pendingPhone to:', verifiedPhone);
    console.log('✅ handlePhoneVerificationSuccess - verifiedPhone type:', typeof verifiedPhone);
    console.log('✅ handlePhoneVerificationSuccess - verifiedPhone length:', verifiedPhone?.length);
    
    // التحقق من أن verifiedPhone صحيح
    if (!verifiedPhone || verifiedPhone.trim() === '') {
      console.error('❌ handlePhoneVerificationSuccess - verifiedPhone is empty or null');
      setError('حدث خطأ في التحقق من رقم الهاتف. يرجى المحاولة مرة أخرى.');
      return;
    }
    
    // أغلق نافذة التحقق فوراً بعد النجاح
    setShowPhoneVerification(false);
    setPendingPhone(verifiedPhone); // حفظ الرقم المحقق
    localStorage.setItem('pendingPasswordReset', verifiedPhone); // حفظ في localStorage
    setError('');
    setStep('password');
    setMessage('تم التحقق من رقم الهاتف بنجاح! أدخل كلمة المرور الجديدة.');
    console.log('✅ handlePhoneVerificationSuccess - pendingPhone set to:', verifiedPhone);
  };

  const handlePhoneVerificationFailed = (error: string) => {
    console.log('❌ Phone verification failed:', error);
    
    // إذا كان الخطأ يتعلق بـ WhatsApp، نعرض رسالة خاصة
    if (error.includes('WhatsApp') || error.includes('whatsapp')) {
      setError(`فشل في إرسال رمز التحقق عبر WhatsApp: ${error}. يرجى التأكد من إعدادات WhatsApp أو التواصل مع الدعم الفني.`);
    } else {
      setError(error);
    }
    
    console.log('🔒 handlePhoneVerificationFailed - setting pendingPhone to null');
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPasswordReset');
    setStep('phone');
  };

  const handlePhoneVerificationClose = () => {
    console.log('🔒 handlePhoneVerificationClose - setting pendingPhone to null');
    setShowPhoneVerification(false);
    setPendingPhone(null);
    localStorage.removeItem('pendingPasswordReset');
    setError('تم إلغاء التحقق من رقم الهاتف.');
    setStep('phone');
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!validatePasswordForm()) return;

    console.log('🔍 handlePasswordSubmit - pendingPhone:', pendingPhone);
    console.log('🔍 handlePasswordSubmit - localStorage pendingPasswordReset:', localStorage.getItem('pendingPasswordReset'));

    // التحقق من وجود رقم الهاتف
    if (!pendingPhone) {
      console.error('❌ No pending phone number found');
      console.error('❌ Current step:', step);
      console.error('❌ showPhoneVerification:', showPhoneVerification);
      setError('لم يتم العثور على رقم الهاتف المحقق. يرجى إعادة التحقق من رقم الهاتف.');
      return;
    }

    setLoading(true);
    try {
      console.log('🔐 Updating password for phone:', pendingPhone);
      
      // استدعاء API لتحديث كلمة المرور
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: pendingPhone,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log('✅ Password updated successfully');
        setMessage('تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        console.error('❌ Password update failed:', data.error);
        setError(data.error || 'حدث خطأ أثناء تحديث كلمة المرور.');
      }
      
    } catch (error: unknown) {
      console.error('❌ Password update failed:', error);
      if (error instanceof Error) {
        setError(error.message || 'حدث خطأ أثناء تحديث كلمة المرور.');
      } else {
        setError('حدث خطأ أثناء تحديث كلمة المرور.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-600 to-purple-700" dir="rtl">
        <div className="w-full max-w-xl overflow-hidden bg-white shadow-2xl rounded-xl">
          {/* Header Section */}
          <div className="p-6 text-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">إعادة تعيين كلمة المرور</h1>
            <p className="text-blue-100">استعد الوصول إلى حسابك عبر التحقق من رقم الهاتف</p>
          </div>

          {/* Step 1: Phone Number Form */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="p-8 space-y-6">
              {/* Info Message */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>كيف تعمل عملية إعادة تعيين كلمة المرور:</strong>
                  <br />
                  1️⃣ أدخل رقم هاتفك المسجل
                  <br />
                  2️⃣ سيتم إرسال رمز تحقق عبر {formData.country === 'مصر' ? 'SMS' : 'WhatsApp'}
                  <br />
                  3️⃣ أدخل الرمز للتحقق
                  <br />
                  4️⃣ أدخل كلمة المرور الجديدة
                </p>
                {formData.country && formData.country !== 'مصر' && (
                  <p className="text-xs text-blue-700 mt-2">
                    💡 ملاحظة: سيتم إرسال رمز التحقق عبر WhatsApp فقط (SMS غير متاح خارج مصر).
                    <br />
                    <a 
                      href="/whatsapp-setup" 
                      target="_blank" 
                      className="text-blue-600 hover:underline"
                    >
                      إعدادات WhatsApp
                    </a>
                  </p>
                )}
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="flex items-start gap-2 p-4 text-red-700 rounded-lg bg-red-50">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {typeof error === 'string' ? <p>{error}</p> : error}
                  </div>
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2 p-4 text-green-700 rounded-lg bg-green-50">
                  <CheckCircle className="w-5 h-5" />
                  <p>{message}</p>
                </div>
              )}

              {/* Country Selection */}
              <div>
                <label className="block mb-2 text-gray-700">الدولة</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">اختر الدولة</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number Input */}
              <div>
                <label className="block mb-2 text-gray-700">رقم الهاتف</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full py-3 pl-12 pr-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      phoneExistsError 
                        ? 'border-red-300 focus:ring-red-500' 
                        : phoneCheckLoading 
                          ? 'border-blue-300 focus:ring-blue-500'
                          : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder={selectedCountry ? `${selectedCountry.phoneLength} أرقام` : "رقم الهاتف"}
                    required
                    pattern={selectedCountry?.phonePattern}
                    maxLength={selectedCountry?.phoneLength || 10}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {phoneCheckLoading ? (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    ) : phoneExistsError ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : formData.phone.length >= 6 && !phoneExistsError ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Phone className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {selectedCountry && (
                  <p className="mt-1 text-sm text-gray-500">
                    مثال: {selectedCountry.code}123456789
                  </p>
                )}
                {phoneCheckLoading && (
                  <p className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    جاري التحقق من الرقم...
                  </p>
                )}
                {phoneExistsError && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {phoneExistsError}
                  </p>
                )}
                {formData.phone.length >= 6 && !phoneExistsError && !phoneCheckLoading && (
                  <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    رقم الهاتف مسجل في النظام
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || phoneCheckLoading || !!phoneExistsError}
                className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  loading || phoneCheckLoading || !!phoneExistsError
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <Phone className="w-5 h-5" />
                    إرسال رمز التحقق
                  </>
                )}
              </button>

              {/* Back to Login */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  العودة إلى تسجيل الدخول
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Password Reset Form */}
          {step === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="p-8 space-y-6">
              {/* Info Message */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>تم التحقق من رقم الهاتف بنجاح!</strong>
                  <br />
                  أدخل كلمة المرور الجديدة لإكمال عملية إعادة التعيين.
                </p>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="flex items-start gap-2 p-4 text-red-700 rounded-lg bg-red-50">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {typeof error === 'string' ? <p>{error}</p> : error}
                  </div>
                </div>
              )}
              {message && (
                <div className="flex items-center gap-2 p-4 text-green-700 rounded-lg bg-green-50">
                  <CheckCircle className="w-5 h-5" />
                  <p>{message}</p>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <label className="block mb-2 text-gray-700">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8 أحرف على الأقل"
                  required
                  minLength={8}
                />
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block mb-2 text-gray-700">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-lg text-white font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    تحديث كلمة المرور
                  </>
                )}
              </button>

              {/* Back to Phone Step */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  العودة إلى إدخال رقم الهاتف
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Phone Verification Modal */}
      <UnifiedOTPVerification
        phoneNumber={pendingPhone || `${formData.countryCode}${formData.phone}`}
        name="المستخدم"
        isOpen={showPhoneVerification}
        onVerificationSuccess={handlePhoneVerificationSuccess}
        onVerificationFailed={handlePhoneVerificationFailed}
        onClose={handlePhoneVerificationClose}
        title="التحقق من رقم الهاتف"
        subtitle={`تم إرسال رمز التحقق عبر ${formData.country === 'مصر' ? 'SMS' : 'WhatsApp'}`}
        otpExpirySeconds={30}
        maxAttempts={3}
        language={locale}
        t={t}
      />
    </>
  );
} 

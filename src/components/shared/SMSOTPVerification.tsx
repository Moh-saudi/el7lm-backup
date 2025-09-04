'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, X, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface SMSOTPVerificationProps {
  phoneNumber: string;
  name: string;
  isOpen: boolean;
  onVerificationSuccess: (otp: string) => void;
  onVerificationFailed: (error: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  otpExpirySeconds?: number;
  useTemplate?: boolean;
  templateId?: number;
  language?: string;
  t?: (key: string) => string;
}

export default function SMSOTPVerification({
  phoneNumber,
  name,
  isOpen,
  onVerificationSuccess,
  onVerificationFailed,
  onClose,
  title = 'التحقق من رقم الهاتف',
  subtitle = 'تم إرسال رمز التحقق إلى هاتفك',
  otpExpirySeconds = 30,
  useTemplate = false,
  templateId = 133,
  language,
  t,
}: SMSOTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // إعادة إلى 6 أرقام
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(3);
  
  // حماية قوية ضد الإرسال المتكرر
  const sentRef = useRef(false);
  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPhoneNumberRef = useRef<string>('');
  const isSendingRef = useRef(false);

  // دالة إرسال OTP محسنة مع حماية قوية
  const sendOTP = useCallback(async (isResend = false) => {
    console.log('📞 [SMSOTP] sendOTP called for:', phoneNumber, 'isResend:', isResend, 'isSending:', isSendingRef.current);
    
    // حماية قوية ضد التكرار
    if (isSendingRef.current) {
      console.log('🛑 [SMSOTP] OTP sending blocked - already sending');
      return;
    }

    // إذا كان الإرسال الأولي تم بالفعل وليس إعادة إرسال
    if (!isResend && sentRef.current) {
      console.log('🛑 [SMSOTP] Initial OTP already sent');
      return;
    }

    // التحقق من تغيير رقم الهاتف
    if (lastPhoneNumberRef.current === phoneNumber && sentRef.current && !isResend) {
      console.log('🛑 [SMSOTP] OTP already sent for this phone number');
      return;
    }

    // إلغاء أي طلب سابق
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // إنشاء AbortController جديد
    abortControllerRef.current = new AbortController();
    
    // تعيين الحماية
    isSendingRef.current = true;
    if (!isResend) {
      sentRef.current = true;
      lastPhoneNumberRef.current = phoneNumber;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      // تنسيق رقم الهاتف للاستخدام في API
      const normalizedPhone = normalizePhone(phoneNumber);
      
      // التحقق من صحة رقم الهاتف
      if (!validatePhoneNumber(normalizedPhone)) {
        setError('رقم الهاتف غير صحيح. يرجى التأكد من إدخال رقم صحيح مع رمز الدولة');
        onVerificationFailed('رقم الهاتف غير صحيح');
        setLoading(false);
        if (!isResend) sentRef.current = false;
        isSendingRef.current = false;
        return;
      }

      // فحص إضافي: التحقق من أن الرقم ليس فارغاً أو قصيراً جداً
      if (!normalizedPhone || normalizedPhone.length < 10) {
        setError('رقم الهاتف قصير جداً. يرجى التأكد من إدخال رقم صحيح مع رمز الدولة');
        onVerificationFailed('رقم الهاتف قصير جداً');
        setLoading(false);
        if (!isResend) sentRef.current = false;
        isSendingRef.current = false;
        return;
      }

      console.log('📤 Using admin backup OTP code for:', normalizedPhone);
      
      // استخدام الكود الاحتياطي بدلاً من الإرسال الحقيقي
      const adminBackupOTP = '123456';
      
      console.log('✅ SMSOTP: Admin backup OTP used for:', normalizedPhone);
      setMessage('تم إنشاء رمز التحقق (كود احتياطي للإدارة: 123456)');
      setTimeRemaining(otpExpirySeconds);
    } catch (error: any) {
      // تجاهل أخطاء الإلغاء
      if (error.name === 'AbortError') {
        console.log('🛑 SMSOTP: Request was aborted');
        return;
      }
      console.error('❌ SMSOTP: Error sending OTP:', error);
      setError('حدث خطأ في إرسال رمز التحقق');
      onVerificationFailed('حدث خطأ في إرسال رمز التحقق');
      if (!isResend) sentRef.current = false;
      isSendingRef.current = false;
    }
    
    setLoading(false);
    isSendingRef.current = false;
    console.log('📞 SMSOTP: sendOTP completed for:', phoneNumber);
  }, [phoneNumber, name, otpExpirySeconds, onVerificationFailed]);

  // إرسال OTP عند فتح المكون (مرة واحدة فقط)
  useEffect(() => {
    console.log('🔍 SMSOTP: useEffect triggered:', { 
      isOpen, 
      initialized: isInitializedRef.current, 
      sent: sentRef.current,
      phoneNumber,
      lastPhone: lastPhoneNumberRef.current
    });
    
    if (isOpen && !isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('🚀 SMSOTP: Initial OTP send triggered for:', phoneNumber);
      
      // التحقق من أن رقم الهاتف لم يتغير
      if (lastPhoneNumberRef.current === phoneNumber && sentRef.current) {
        console.log('🛑 SMSOTP: OTP already sent for this phone number, skipping...');
        return;
      }
      
      // إرسال OTP الأولي
      sendOTP(false);
    }
  }, [isOpen, sendOTP]);

  // عداد الوقت المتبقي
  useEffect(() => {
    if (timeRemaining <= 0) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // تنظيف البيانات عند إغلاق المكون
  useEffect(() => {
    if (!isOpen) {
      console.log('🔒 Component closing - resetting...');
      // إلغاء أي طلب قيد التنفيذ
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      
      // إعادة تعيين جميع المتغيرات
      sentRef.current = false;
      isInitializedRef.current = false;
      isSendingRef.current = false;
      lastPhoneNumberRef.current = '';
      
      setOtp(['', '', '', '', '', '']);
      setLoading(false);
      setResendLoading(false);
      setError('');
      setMessage('');
      setTimeRemaining(0);
      setAttempts(0);
    }
  }, [isOpen]);

  const resetComponent = () => {
    console.log('🔄 [SMSOTP] resetComponent called');
    setOtp(['', '', '', '', '', '']);
    setLoading(false);
    setResendLoading(false);
    setError('');
    setMessage('');
    setTimeRemaining(0);
    setAttempts(0);
    sentRef.current = false;
    isInitializedRef.current = false;
    lastPhoneNumberRef.current = '';
    isSendingRef.current = false;
    if (abortControllerRef.current) abortControllerRef.current.abort();
  };

  const handleOtpChange = (index: number, value: string) => {
    console.log('⌨️ [SMSOTP] handleOtpChange:', { index, value });
    if (value.length > 1) return; // منع إدخال أكثر من رقم واحد
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // الانتقال للحقل التالي تلقائياً
    if (value && index < 5) { // تغيير الشرط من 5 إلى 3
      const nextInput = document.getElementById(`sms-otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // التحقق التلقائي عند إكمال الرمز
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) { // تغيير الشرط من 6 إلى 4
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`sms-otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const verifyOTP = async (otpCode: string) => {
    console.log('🔑 [SMSOTP] verifyOTP called with:', otpCode);
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    // تنسيق رقم الهاتف للاستخدام في API
    const normalizedPhone = normalizePhone(phoneNumber);
    
    try {
      // التحقق من عدد المحاولات
      if (attempts >= maxAttempts) {
        setError('تم تجاوز الحد الأقصى للمحاولات. يرجى إعادة إرسال الرمز.');
        setLoading(false);
        return;
      }
      
      // التحقق من انتهاء صلاحية الرمز
      if (timeRemaining <= 0) {
        setError('انتهت صلاحية الرمز. أرسل رمزاً جديداً.');
        setOtp(['', '', '', '', '', '']);
        setAttempts(prev => prev + 1);
        setLoading(false);
        return;
      }
      
      // التحقق من صحة الرمز باستخدام API
      console.log('🔍 Verifying OTP with server:', { input: otpCode, phone: normalizedPhone });
      
      const verifyResponse = await fetch('/api/notifications/sms/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: normalizedPhone,
          otpCode: otpCode
        })
      });

      const verifyResult = await verifyResponse.json();
      console.log('🔑 [SMSOTP] verifyOTP response:', verifyResult);
      
      if (!verifyResponse.ok || !verifyResult.success) {
        console.error('❌ OTP verification failed:', verifyResult.error);
        setError(verifyResult.error || 'رمز التحقق غير صحيح.');
        setOtp(['', '', '', '', '', '']);
        setAttempts(prev => prev + 1);
        const firstInput = document.getElementById('sms-otp-0') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
        setLoading(false);
        return;
      }
      
      console.log('✅ OTP verification passed successfully');
      
      // تحقق ناجح
      setMessage('تم التحقق من رقم الهاتف بنجاح!');
      
      setTimeout(() => {
        onVerificationSuccess(phoneNumber);
        resetComponent();
        onClose(); // إغلاق النافذة بعد النجاح
      }, 1000);
      
    } catch (error: any) {
      console.error('خطأ في التحقق:', error);
      setError('حدث خطأ في التحقق من الرمز');
      onVerificationFailed('حدث خطأ في التحقق من الرمز');
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    console.log('🔄 [SMSOTP] handleResendOTP called');
    
    // منع التكرار إذا كان الإرسال جارياً
    if (loading || resendLoading || isSendingRef.current) {
      console.log('🛑 Resend already in progress, skipping...');
      return;
    }

    setResendLoading(true);
    setError('');
    
    // إعادة تعيين الحماية للسماح بالإرسال مرة أخرى
    setOtp(['', '', '', '', '', '']);
    setAttempts(0);
    
    console.log('🔄 Starting manual resend...');
    await sendOTP(true); // إرسال كإعادة إرسال
    setResendLoading(false);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // دالة تنسيق رقم الهاتف للعرض
  const formatPhoneNumber = (phone: string): string => {
    // إخفاء الأرقام الوسطى وإظهار البداية والنهاية فقط
    if (phone.length > 7) {
      const start = phone.substring(0, 4);
      const end = phone.substring(phone.length - 3);
      const hidden = '*'.repeat(phone.length - 7);
      return `${start}${hidden}${end}`;
    }
    return phone;
  };

  // دالة تنسيق رقم الهاتف للاستخدام في API
  const normalizePhone = (phone: string): string => {
    // إزالة جميع الأحرف غير الرقمية
    let cleaned = phone.replace(/\D/g, '');
    
    // إذا كان الرقم يبدأ بـ 966 (رمز السعودية) أو 20 (رمز مصر)
    if (cleaned.startsWith('966')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('20')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      // إذا كان يبدأ بصفر، إزالة الصفر وإضافة رمز الدولة
      cleaned = cleaned.substring(1);
      if (cleaned.length === 10) {
        return `+966${cleaned}`; // افتراض السعودية
      }
    } else if (cleaned.length === 10) {
      // رقم محلي بدون رمز دولة
      return `+966${cleaned}`; // افتراض السعودية
    } else if (cleaned.length === 11) {
      // رقم مع رمز دولة
      return `+${cleaned}`;
    }
    
    return phone; // إرجاع الرقم كما هو إذا لم يتطابق مع أي نمط
  };

  // دالة التحقق من صحة رقم الهاتف
  const validatePhoneNumber = (phone: string): boolean => {
    // إزالة جميع الأحرف غير الرقمية
    const cleaned = phone.replace(/\D/g, '');
    
    // التحقق من أن الرقم يحتوي على 10-15 رقم
    if (cleaned.length < 10 || cleaned.length > 15) {
      return false;
    }
    
    // التحقق من أن الرقم يبدأ برمز دولة صحيح
    if (phone.startsWith('+')) {
      return true;
    }
    
    return false;
  };

  if (!isOpen) return null;

  // استخدم t في كل النصوص:
  const titleText = t ? t('otp.title') : (title || 'التحقق من رقم الهاتف');
  const subtitleText = t ? t('otp.subtitle_sms') : (subtitle || 'تم إرسال رمز التحقق إلى هاتفك');
  const resendText = t ? t('otp.resend') : 'إعادة إرسال الرمز';
  const sendingText = t ? t('otp.sending') : 'جاري الإرسال...';
  const cancelText = t ? t('otp.cancel') : 'إلغاء';
  const inputLabel = t ? t('otp.inputLabel') : 'أدخل رمز التحقق المكون من 6 أرقام';
  const timeLeftText = t ? t('otp.timeLeft') : 'الوقت المتبقي';
  const expiredText = t ? t('otp.expired') : 'انتهت صلاحية الرمز';
  const attemptsLeftText = t ? t('otp.attemptsLeft') : 'المحاولات المتبقية';
  const helpText = t ? t('otp.helpText') : 'تأكد من أن هاتفك متصل بالإنترنت لاستلام الرسالة';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            <div className="flex justify-center mb-4">
              <Phone className="w-16 h-16 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">{titleText}</h2>
            <p className="text-gray-600 text-center text-lg">
              {subtitleText}
              <br />
              <span className="font-semibold text-blue-600">{formatPhoneNumber(phoneNumber)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="إغلاق"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" aria-hidden />
          </button>
        </div>

        {/* Messages */}
        {message && (
          <div className="flex items-center gap-2 p-3 mb-4 text-green-700 bg-green-50 rounded-lg">
            <CheckCircle className="w-6 h-6" />
            <p className="text-base">{message}</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-red-700 bg-red-50 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
            <p className="text-base">{error}</p>
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block mb-3 text-base font-medium text-gray-700 text-center">
            أدخل رمز التحقق المكون من 6 أرقام
          </label>
          <div className="flex justify-center gap-3" dir="rtl">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`sms-otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={loading}
                title={`رقم التحقق ${index + 1}`}
                aria-label={`رقم التحقق ${index + 1}`}
                placeholder="-"
              />
            ))}
          </div>
        </div>

        {/* Timer and Attempts */}
        <div className="text-center mb-6 space-y-2">
          {timeRemaining > 0 ? (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-base">{timeLeftText}: {formatTime(timeRemaining)}</span>
            </div>
          ) : (
            <div className="text-base text-red-600">
              {expiredText}
            </div>
          )}
          
          {attempts > 0 && (
            <div className="text-base text-orange-600">
              {attemptsLeftText}: {maxAttempts - attempts}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleResendOTP}
            disabled={resendLoading || timeRemaining > 0 || isSendingRef.current}
            className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 ${
              timeRemaining > 0 || isSendingRef.current
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {resendLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {sendingText}
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                {resendText}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-4 px-6 text-gray-600 bg-gray-100 rounded-lg font-medium text-lg hover:bg-gray-200 transition-colors"
          >
            {cancelText}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {helpText}
          </p>
        </div>
      </div>
    </div>
  );
} 

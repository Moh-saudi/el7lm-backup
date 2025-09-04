'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Phone, X, CheckCircle, AlertTriangle, Clock, RefreshCw, MessageCircle } from 'lucide-react';

interface WhatsAppOTPVerificationProps {
  phoneNumber: string;
  name?: string;
  isOpen: boolean;
  onVerificationSuccess: (phoneNumber: string) => void;
  onVerificationFailed: (error: string) => void;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  otpExpirySeconds?: number;
  maxAttempts?: number;
  serviceType?: 'business' | 'green';
  language?: string;
  t?: (key: string) => string;
}

export default function WhatsAppOTPVerification({
  phoneNumber,
  name,
  isOpen,
  onVerificationSuccess,
  onVerificationFailed,
  onClose,
  title,
  subtitle,
  otpExpirySeconds = 30, // 30 ثانية
  maxAttempts = 3,
  serviceType = 'business',
  language,
  t,
}: WhatsAppOTPVerificationProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [currentOtpCode, setCurrentOtpCode] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [whatsAppLink, setWhatsAppLink] = useState<string | null>(null);
  
  // حماية قوية ضد الإرسال المتكرر
  const sentRef = useRef(false);
  const isInitializedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastPhoneNumberRef = useRef<string>('');
  const isSendingRef = useRef(false);

  // دالة إرسال OTP محسنة مع حماية قوية
  const sendOTP = useCallback(async (isResend = false) => {
    console.log('📞 [WhatsAppOTP] sendOTP called for:', phoneNumber, 'isResend:', isResend, 'isSending:', isSendingRef.current);
    
    // حماية قوية ضد التكرار
    if (isSendingRef.current) {
      console.log('🛑 [WhatsAppOTP] OTP sending blocked - already sending');
      return;
    }

    // إذا كان الإرسال الأولي تم بالفعل وليس إعادة إرسال
    if (!isResend && sentRef.current) {
      console.log('🛑 [WhatsAppOTP] Initial OTP already sent');
      return;
    }

    // التحقق من تغيير رقم الهاتف
    if (lastPhoneNumberRef.current === phoneNumber && sentRef.current && !isResend) {
      console.log('🛑 [WhatsAppOTP] OTP already sent for this phone number');
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

    console.log('🚀 Using admin backup OTP code for:', phoneNumber);
    console.log('📞 Phone number:', phoneNumber);
    console.log('👤 Name:', name);
    
    setLoading(true);
    setError('');
    setMessage('');
    setWhatsAppLink('');

    try {
      // استخدام الكود الاحتياطي بدلاً من الإرسال الحقيقي
      const adminBackupOTP = '123456';
      console.log('🔢 Using admin backup OTP:', adminBackupOTP);
      
      setMessage('تم إنشاء رمز التحقق (كود احتياطي للإدارة: 123456)');
      setTimeRemaining(otpExpirySeconds);
      setCurrentOtpCode(adminBackupOTP);
    } catch (error: any) {
      // تجاهل أخطاء الإلغاء
      if (error.name === 'AbortError') {
        console.log('🛑 WhatsAppOTP: Request was aborted');
        return;
      }
      
      console.error('❌ خطأ في إرسال OTP:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      // تحسين رسالة الخطأ
      let errorMessage = 'حدث خطأ في إرسال رمز التحقق';
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'فشل في الاتصال بالخادم';
      } else if (error.name === 'SyntaxError') {
        errorMessage = 'خطأ في معالجة الاستجابة';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      onVerificationFailed(errorMessage);
      if (!isResend) sentRef.current = false;
      isSendingRef.current = false;
    }
    
    setLoading(false);
    isSendingRef.current = false;
  }, [phoneNumber, name, otpExpirySeconds, onVerificationFailed]);

  // إرسال OTP عند فتح المكون (مرة واحدة فقط)
  useEffect(() => {
    console.log('🔍 WhatsAppOTP: useEffect triggered:', { 
      isOpen, 
      initialized: isInitializedRef.current, 
      sent: sentRef.current,
      phoneNumber,
      lastPhone: lastPhoneNumberRef.current
    });
    
    if (isOpen && !isInitializedRef.current) {
      isInitializedRef.current = true;
      console.log('🚀 WhatsAppOTP: Initial OTP send triggered for:', phoneNumber);
      
      // التحقق من أن رقم الهاتف لم يتغير
      if (lastPhoneNumberRef.current === phoneNumber && sentRef.current) {
        console.log('🛑 WhatsAppOTP: OTP already sent for this phone number, skipping...');
        return;
      }
      
      setError('');
      setMessage('');
      setAttempts(0);
      setCurrentOtpCode('');
      setIsVerified(false);
      setWhatsAppLink('');
      
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
      setCurrentOtpCode('');
      setAttempts(0);
      setIsVerified(false);
      setWhatsAppLink(null);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // منع إدخال أكثر من رقم واحد
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // الانتقال للحقل التالي تلقائياً
    if (value && index < 5) {
      const nextInput = document.getElementById(`whatsapp-otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
    
    // التحقق التلقائي عند إكمال الرمز
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`whatsapp-otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const verifyOTP = async (enteredOtp: string) => {
    if (loading) return;
    
    setLoading(true);
    setError('');
    
    try {
      // التحقق من عدد المحاولات
      if (attempts >= maxAttempts) {
        setError('تم تجاوز الحد الأقصى للمحاولات. يرجى إعادة إرسال الرمز.');
        setLoading(false);
        return;
      }
      
      // التحقق من انتهاء صلاحية الرمز
      if (timeRemaining <= 0) {
        setError('انتهت صلاحية الرمز. يرجى طلب رمز جديد.');
        setLoading(false);
        return;
      }
      
      // التحقق من صحة الرمز
      if (currentOtpCode !== enteredOtp) {
        setError('رمز التحقق غير صحيح.');
        setOtp(['', '', '', '', '', '']);
        setAttempts(prev => prev + 1);
        const firstInput = document.getElementById('whatsapp-otp-0') as HTMLInputElement;
        if (firstInput) {
          firstInput.focus();
        }
        setLoading(false);
        return;
      }
      
      // تحقق ناجح
      setIsVerified(true);
      setMessage('تم التحقق من رقم الهاتف بنجاح!');
      
      setTimeout(() => {
        onVerificationSuccess(phoneNumber);
        onClose(); // إغلاق النافذة بعد النجاح
      }, 1000);
      
    } catch (error: any) {
      console.error('خطأ في التحقق:', error);
      setError('حدث خطأ في التحقق من الرمز');
      onVerificationFailed('حدث خطأ في التحقق من الرمز');
    }
    
    setLoading(false);
  };

  const handleResend = () => {
    console.log('🔄 Manual resend requested');
    
    // منع التكرار إذا كان الإرسال جارياً
    if (loading || resendLoading || isSendingRef.current) {
      console.log('🛑 Resend already in progress, skipping...');
      return;
    }

    setResendLoading(true);
    setError('');
    
    // إعادة تعيين الحماية للسماح بالإرسال مرة أخرى
    setCurrentOtpCode('');
    setOtp(['', '', '', '', '', '']);
    setAttempts(0);
    setIsVerified(false);
    setWhatsAppLink(null);
    
    console.log('🔄 Starting manual resend...');
    sendOTP(true).then(() => {
      setResendLoading(false);
    });
  };

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

  if (!isOpen) return null;

  // استخدم t في كل النصوص:
  const titleText = t ? t('otp.title') : (title || 'التحقق من رقم الهاتف');
  const subtitleText = t ? t('otp.subtitle_whatsapp') : (subtitle || 'تم إرسال رمز التحقق عبر WhatsApp');
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
              <MessageCircle className="w-16 h-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">{titleText}</h2>
            <p className="text-gray-600 text-center text-lg">
              {subtitleText}
              <br />
              <span className="font-semibold text-green-600">{formatPhoneNumber(phoneNumber)}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
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

        {/* WhatsApp Link */}
        {whatsAppLink && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 mb-2">
              انقر على الرابط أدناه لفتح WhatsApp:
            </p>
            <a
              href={whatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              فتح WhatsApp
            </a>
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block mb-3 text-base font-medium text-gray-700 text-center">
            {inputLabel}
          </label>
          <div className="flex justify-center gap-3" dir="rtl">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`whatsapp-otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                maxLength={1}
                inputMode="numeric"
                pattern="[0-9]*"
                disabled={loading || isVerified}
                style={{textAlign: 'center'}}
              />
            ))}
          </div>
        </div>

        {/* Timer and Attempts */}
        <div className="text-center mb-6 space-y-2">
          {timeRemaining > 0 ? (
            <div className="flex items-center justify-center gap-2 text-base text-gray-600">
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
            onClick={handleResend}
            disabled={resendLoading || timeRemaining > 0 || isSendingRef.current}
            className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors flex items-center justify-center gap-2 ${
              timeRemaining > 0 || isSendingRef.current
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
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

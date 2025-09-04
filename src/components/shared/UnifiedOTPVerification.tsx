'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getOTPMethod, getCountryName, getOTPMessage, type OTPMethod } from '@/lib/utils/otp-service-selector';
import SMSOTPVerification from './SMSOTPVerification';
import WhatsAppOTPVerification from './WhatsAppOTPVerification';

interface UnifiedOTPVerificationProps {
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
  forceMethod?: OTPMethod; // لفرض نوع معين من OTP
  language?: string;
  t?: (key: string) => string;
}

export default function UnifiedOTPVerification({
  phoneNumber,
  name,
  isOpen,
  onVerificationSuccess,
  onVerificationFailed,
  onClose,
  title,
  subtitle,
  otpExpirySeconds = 30,
  maxAttempts = 3,
  forceMethod,
  language,
  t
}: UnifiedOTPVerificationProps) {

  const [selectedMethod, setSelectedMethod] = useState<OTPMethod>('sms');
  const [countryName, setCountryName] = useState('');
  const initializedRef = useRef(false);
  const lastPhoneNumberRef = useRef<string>('');
  const lastIsOpenRef = useRef<boolean>(false);

  // تحديد نوع OTP المناسب عند فتح المكون (مرة واحدة فقط)
  useEffect(() => {
    console.log('🔧 UnifiedOTP: useEffect triggered:', { 
      isOpen, 
      initialized: initializedRef.current, 
      lastPhone: lastPhoneNumberRef.current,
      currentPhone: phoneNumber,
      lastIsOpen: lastIsOpenRef.current
    });
    
    // فقط عند فتح المكون لأول مرة أو عند تغيير رقم الهاتف
    if (isOpen && (!initializedRef.current || lastPhoneNumberRef.current !== phoneNumber)) {
      initializedRef.current = true;
      lastPhoneNumberRef.current = phoneNumber;
      lastIsOpenRef.current = isOpen;
      
      console.log('🔧 UnifiedOTP: Initializing with phone:', phoneNumber);
      
      const otpConfig = getOTPMethod(phoneNumber);
      const countryCode = phoneNumber.match(/^\+\d{1,4}/)?.[0] || '';
      const country = getCountryName(countryCode);
      setCountryName(country);
      setSelectedMethod(otpConfig.method);
      
      console.log('🔧 UnifiedOTP: Method selected:', otpConfig.method, 'for country:', country);
    }
  }, [isOpen, phoneNumber]);

  // إعادة تعيين عند الإغلاق
  useEffect(() => {
    if (!isOpen && lastIsOpenRef.current) {
      console.log('🔒 UnifiedOTP: Resetting initialization flag');
      initializedRef.current = false;
      lastIsOpenRef.current = false;
    }
  }, [isOpen]);

  // التعامل مع نجاح التحقق
  const handleVerificationSuccess = (verifiedPhone: string) => {
    console.log('✅ UnifiedOTP: Verification successful for:', verifiedPhone);
    onVerificationSuccess(verifiedPhone);
    // إغلاق النافذة بعد النجاح
    setTimeout(() => {
      onClose();
    }, 500);
  };

  // التعامل مع فشل التحقق
  const handleVerificationFailed = (error: string) => {
    console.log('❌ UnifiedOTP: OTP verification failed:', error);
    onVerificationFailed(error);
  };

  // إغلاق المكون
  const handleClose = () => {
    console.log('🔒 UnifiedOTP: Closing component');
    onClose();
  };

  // إذا لم يكن المكون مفتوحاً، لا نعرض شيئاً
  if (!isOpen) return null;

  // عرض مكون OTP المناسب
  if (selectedMethod === 'sms') {
    return (
      <SMSOTPVerification
        phoneNumber={phoneNumber}
        name={name}
        isOpen={isOpen}
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationFailed={handleVerificationFailed}
        onClose={handleClose}
        title={t ? t('otp.title') : (title || 'التحقق من رقم الهاتف')}
        subtitle={t ? t('otp.subtitle_sms') : (subtitle || getOTPMessage('sms', countryName))}
        otpExpirySeconds={otpExpirySeconds}
        maxAttempts={maxAttempts}
        language={language}
        t={t}
      />
    );
  } else {
    return (
      <WhatsAppOTPVerification
        phoneNumber={phoneNumber}
        name={name}
        isOpen={isOpen}
        onVerificationSuccess={handleVerificationSuccess}
        onVerificationFailed={handleVerificationFailed}
        onClose={handleClose}
        title={t ? t('otp.title') : (title || 'التحقق من رقم الهاتف')}
        subtitle={t ? t('otp.subtitle_whatsapp') : (subtitle || getOTPMessage('whatsapp', countryName))}
        otpExpirySeconds={otpExpirySeconds}
        maxAttempts={maxAttempts}
        serviceType="business"
        language={language}
        t={t}
      />
    );
  }
} 

'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, ShieldCheck, ShieldAlert, Lock, Unlock, Eye, Clock, Smartphone, MapPin } from 'lucide-react';
import { smartLoginSystem } from '@/lib/auth/smart-login-system';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface SecurityStatusBadgeProps {
  userPhone?: string;
  userId?: string;
  userData?: any;
  showDetails?: boolean;
  className?: string;
}

interface SecurityInfo {
  securityLevel: 'new' | 'trusted' | 'suspicious';
  successfulLogins: number;
  totalLogins: number;
  lastLogin: Date | null;
  trustedDevices: number;
  requiresOTP: boolean;
  phoneVerified: boolean;
}

export default function SecurityStatusBadge({
  userPhone,
  userId,
  userData,
  showDetails = true,
  className = ''
}: SecurityStatusBadgeProps) {
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    if (userData) {
      // استخدام البيانات الموجودة مباشرة
      setSecurityInfo({
        securityLevel: userData.securityLevel || 'new',
        successfulLogins: userData.successfulLogins || 0,
        totalLogins: userData.totalLogins || 0,
        lastLogin: userData.lastLogin?.toDate() || null,
        trustedDevices: userData.trustedDevices?.length || 0,
        requiresOTP: userData.requiresOTP || false,
        phoneVerified: userData.phoneVerified || false
      });
    } else if (userPhone) {
      loadSecurityInfo();
    }
  }, [userPhone, userData]);

  const loadSecurityInfo = async () => {
    if (!userPhone) return;
    
    setLoading(true);
    try {
      // يمكن إضافة API endpoint للحصول على معلومات الأمان
      // في الوقت الحالي، سنستخدم بيانات افتراضية
      setSecurityInfo({
        securityLevel: 'new',
        successfulLogins: 0,
        totalLogins: 0,
        lastLogin: null,
        trustedDevices: 0,
        requiresOTP: false,
        phoneVerified: false
      });
    } catch (error) {
      console.error('خطأ في تحميل معلومات الأمان:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityBadge = () => {
    if (loading) {
      return (
        <Badge variant="secondary" className={`${className}`}>
          <Clock className="w-3 h-3 mr-1" />
          فحص...
        </Badge>
      );
    }

    if (!securityInfo) {
      return (
        <Badge variant="outline" className={`text-gray-500 border-gray-300 ${className}`}>
          <Shield className="w-3 h-3 mr-1" />
          غير محدد
        </Badge>
      );
    }

    const { securityLevel, successfulLogins, phoneVerified, requiresOTP } = securityInfo;

    // تحديد اللون والأيقونة حسب مستوى الأمان
    if (securityLevel === 'trusted' && phoneVerified) {
      return (
        <Badge 
          variant="default" 
          className={`bg-green-100 text-green-800 hover:bg-green-200 ${className}`}
        >
          <ShieldCheck className="w-3 h-3 mr-1" />
          موثوق
        </Badge>
      );
    }

    if (securityLevel === 'suspicious') {
      return (
        <Badge 
          variant="destructive" 
          className={`${className}`}
        >
          <ShieldAlert className="w-3 h-3 mr-1" />
          مشبوه
        </Badge>
      );
    }

    if (successfulLogins > 0 && successfulLogins < 3) {
      return (
        <Badge 
          variant="secondary" 
          className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-200 ${className}`}
        >
          <Shield className="w-3 h-3 mr-1" />
          جديد ({successfulLogins}/3)
        </Badge>
      );
    }

    // مستخدم جديد أو غير مؤكد
    return (
      <Badge 
        variant="outline" 
        className={`text-blue-600 border-blue-300 hover:bg-blue-50 ${className}`}
      >
        <Shield className="w-3 h-3 mr-1" />
        جديد
      </Badge>
    );
  };

  const getOTPStatusBadge = () => {
    if (!securityInfo) return null;

    if (securityInfo.requiresOTP) {
      return (
        <Badge 
          variant="outline" 
          className="text-orange-600 border-orange-300 mr-1"
          title="التحقق مطلوب دائماً"
        >
          <Lock className="w-3 h-3 mr-1" />
          OTP إجباري
        </Badge>
      );
    }

    if (securityInfo.securityLevel === 'trusted') {
      return (
        <Badge 
          variant="outline" 
          className="text-green-600 border-green-300 mr-1"
          title="يمكن الدخول بكلمة المرور"
        >
          <Unlock className="w-3 h-3 mr-1" />
          مرن
        </Badge>
      );
    }

    return null;
  };

  const SecurityDetails = () => {
    if (!securityInfo) return null;

    return (
      <div className="space-y-3 p-2">
        <div className="text-sm font-medium text-gray-900 border-b pb-2">
          تفاصيل الأمان
        </div>
        
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">مستوى الأمان:</span>
            <span className="font-medium">{getSecurityLevelText()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الدخولات الناجحة:</span>
            <span className="font-medium">{securityInfo.successfulLogins} من {securityInfo.totalLogins}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الأجهزة الموثوقة:</span>
            <span className="font-medium flex items-center">
              <Smartphone className="w-3 h-3 mr-1" />
              {securityInfo.trustedDevices}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">الهاتف موثق:</span>
            <span className={`font-medium ${securityInfo.phoneVerified ? 'text-green-600' : 'text-orange-600'}`}>
              {securityInfo.phoneVerified ? '✅ نعم' : '❌ لا'}
            </span>
          </div>
          
          {securityInfo.lastLogin && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">آخر دخول:</span>
              <span className="font-medium text-xs">
                {format(securityInfo.lastLogin, 'dd MMM yyyy', { locale: ar })}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">إعداد OTP:</span>
            <span className={`font-medium ${securityInfo.requiresOTP ? 'text-orange-600' : 'text-green-600'}`}>
              {securityInfo.requiresOTP ? 'إجباري' : 'مرن'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getSecurityLevelText = () => {
    if (!securityInfo) return 'غير محدد';
    
    switch (securityInfo.securityLevel) {
      case 'trusted':
        return 'موثوق';
      case 'suspicious':
        return 'مشبوه';
      case 'new':
      default:
        return 'جديد';
    }
  };

  if (!showDetails) {
    return (
      <div className="flex items-center gap-1">
        {getSecurityBadge()}
        {getOTPStatusBadge()}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Popover open={showPopover} onOpenChange={setShowPopover}>
        <PopoverTrigger asChild>
          <div className="cursor-pointer">
            {getSecurityBadge()}
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <SecurityDetails />
        </PopoverContent>
      </Popover>
      
      {getOTPStatusBadge()}
    </div>
  );
} 

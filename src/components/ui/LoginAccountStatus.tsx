'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { checkPlayerHasLoginAccount } from '@/lib/utils/player-login-account';

interface LoginAccountStatusProps {
  playerEmail?: string;
  hasAccount?: boolean;
  className?: string;
  showLabel?: boolean;
}

export default function LoginAccountStatus({
  playerEmail,
  hasAccount,
  className = '',
  showLabel = true
}: LoginAccountStatusProps) {
  const [accountStatus, setAccountStatus] = useState<boolean | null>(hasAccount || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (accountStatus !== null || !playerEmail) return;
      
      setLoading(true);
      try {
        const hasLoginAccount = await checkPlayerHasLoginAccount(playerEmail);
        setAccountStatus(hasLoginAccount);
      } catch (error) {
        console.error('خطأ في فحص حالة حساب الدخول:', error);
        setAccountStatus(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [playerEmail, accountStatus]);

  if (loading) {
    return (
      <Badge variant="secondary" className={`${className}`}>
        <Clock className="w-3 h-3 mr-1" />
        {showLabel && 'فحص...'}
      </Badge>
    );
  }

  if (accountStatus === true) {
    return (
      <Badge 
        variant="default" 
        className={`bg-green-100 text-green-800 hover:bg-green-200 ${className}`}
      >
        <CheckCircle className="w-3 h-3 mr-1" />
        {showLabel && 'له حساب دخول'}
      </Badge>
    );
  }

  if (accountStatus === false) {
    return (
      <Badge 
        variant="secondary" 
        className={`bg-orange-100 text-orange-800 hover:bg-orange-200 ${className}`}
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        {showLabel && 'لا يوجد حساب'}
      </Badge>
    );
  }

  // إذا لم يكن هناك إيميل
  return (
    <Badge 
      variant="outline" 
      className={`text-gray-500 border-gray-300 ${className}`}
    >
      <AlertCircle className="w-3 h-3 mr-1" />
      {showLabel && 'بدون إيميل'}
    </Badge>
  );
} 

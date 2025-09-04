'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { createPlayerLoginAccount, checkPlayerHasLoginAccount } from '@/lib/utils/player-login-account';
import { toast } from 'sonner';

interface CreateLoginAccountButtonProps {
  playerId: string;
  playerData: {
    full_name?: string;
    name?: string;
    email?: string;
    phone?: string;
    club_id?: string;
    academy_id?: string;
    trainer_id?: string;
    agent_id?: string;
    [key: string]: any;
  };
  source?: 'players' | 'player';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  onSuccess?: (password: string) => void;
  showIcon?: boolean;
}

export default function CreateLoginAccountButton({
  playerId,
  playerData,
  source = 'players',
  variant = 'outline',
  size = 'sm',
  className = '',
  onSuccess,
  showIcon = true
}: CreateLoginAccountButtonProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [hasAccount, setHasAccount] = useState<boolean | null>(null);

  // التحقق من وجود حساب دخول عند تحميل المكون
  React.useEffect(() => {
    const checkAccount = async () => {
      if (playerData.email) {
        const hasLoginAccount = await checkPlayerHasLoginAccount(playerData.email);
        setHasAccount(hasLoginAccount);
      }
    };
    checkAccount();
  }, [playerData.email]);

  const handleCreateAccount = async () => {
    if (!playerData.email) {
      toast.error('لا يمكن إنشاء حساب دخول بدون إيميل');
      return;
    }

    if (!playerData.full_name && !playerData.name) {
      toast.error('لا يمكن إنشاء حساب دخول بدون اسم');
      return;
    }

    setIsCreating(true);
    
    try {
      const result = await createPlayerLoginAccount(playerId, playerData, source);
      
      if (result.success) {
        toast.success(`تم إنشاء حساب تسجيل الدخول بنجاح! كلمة المرور: ${result.tempPassword}`);
        setHasAccount(true);
        if (onSuccess && result.tempPassword) {
          onSuccess(result.tempPassword);
        }
      } else {
        toast.error(`فشل في إنشاء حساب الدخول: ${result.message}`);
      }
    } catch (error) {
      console.error('خطأ في إنشاء حساب الدخول:', error);
      toast.error('حدث خطأ في إنشاء حساب تسجيل الدخول');
    } finally {
      setIsCreating(false);
    }
  };

  // إذا كان اللاعب لديه حساب دخول بالفعل
  if (hasAccount) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`text-green-600 hover:bg-green-50 ${className}`}
        disabled
        title="اللاعب لديه حساب دخول بالفعل"
      >
        {showIcon && <CheckCircle className="w-4 h-4" />}
        <span className="hidden sm:inline mr-1">له حساب</span>
      </Button>
    );
  }

  // إذا كانت البيانات ناقصة
  if (!playerData.email || (!playerData.full_name && !playerData.name)) {
    return (
      <Button
        variant="ghost"
        size={size}
        className={`text-gray-400 hover:bg-gray-50 ${className}`}
        disabled
        title="بيانات ناقصة (الإيميل والاسم مطلوبان)"
      >
        {showIcon && <AlertCircle className="w-4 h-4" />}
        <span className="hidden sm:inline mr-1">بيانات ناقصة</span>
      </Button>
    );
  }

  // زر إنشاء حساب دخول
  return (
    <Button
      variant={variant}
      size={size}
      className={`text-blue-600 hover:bg-blue-50 ${className}`}
      onClick={handleCreateAccount}
      disabled={isCreating}
      title="إنشاء حساب تسجيل دخول للاعب"
    >
      {showIcon && (isCreating ? <Lock className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />)}
      <span className="hidden sm:inline mr-1">
        {isCreating ? 'جاري الإنشاء...' : 'إنشاء حساب'}
      </span>
    </Button>
  );
} 

'use client';

import React, { memo, useMemo } from 'react';
import Link from 'next/link';

interface SubscriptionStatusProps {
  subscription: any;
  loading: boolean;
}

const SubscriptionStatus = memo(({ subscription, loading }: SubscriptionStatusProps) => {
  // حساب حالة الاشتراك مع memoization
  const subscriptionInfo = useMemo(() => {
    if (loading) {
      return { type: 'loading', daysLeft: 0 };
    }

    if (!subscription) {
      return { type: 'inactive', daysLeft: 0 };
    }

    const endDate = subscription.end_date?.seconds
      ? new Date(subscription.end_date.seconds * 1000)
      : new Date(subscription.end_date);
    
    const now = new Date();
    const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft > 0) {
      return { type: 'active', daysLeft };
    } else {
      return { type: 'expired', daysLeft };
    }
  }, [subscription, loading]);

  // عرض شاشة تحميل
  if (subscriptionInfo.type === 'loading') {
    return (
      <div className="animate-pulse p-6 mb-8 border-4 border-gray-200 rounded-2xl bg-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
          <div className="h-6 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
    );
  }

  // اشتراك غير مفعل
  if (subscriptionInfo.type === 'inactive') {
    return (
      <div className="flex flex-col gap-3 p-6 mb-8 text-orange-900 border-4 border-yellow-400 shadow-lg rounded-2xl bg-gradient-to-r from-yellow-100 to-orange-50 animate-pulse">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span role="img" aria-label="نجمة">⭐</span>
          <span role="img" aria-label="صاروخ">🚀</span>
          <span>لم تقم بتفعيل اشتراكك بعد!</span>
          <span role="img" aria-label="كأس">🏆</span>
        </div>
        <span className="text-lg font-semibold text-orange-700">
          سارع بالاشتراك لتظهر للأندية والوكلاء وتحقق حلمك!
        </span>
        <Link 
          href="/dashboard/payment" 
          className="inline-block px-6 py-3 mt-2 text-xl font-bold text-white transition-all duration-500 ease-out bg-orange-600 shadow-lg rounded-xl hover:bg-orange-700 hover:scale-[1.02]"
        >
          <span role="img" aria-label="دفع">💳</span> دفع الاشتراك الآن
        </Link>
      </div>
    );
  }

  // اشتراك مفعل
  if (subscriptionInfo.type === 'active') {
    return (
      <div className="flex items-center gap-4 p-6 mb-8 text-green-900 border-4 border-green-400 shadow-lg rounded-2xl bg-gradient-to-r from-green-100 to-blue-50 animate-bounce">
        <span className="text-3xl" role="img" aria-label="نار">🔥</span>
        <span className="text-xl font-bold">
          اشتراكك مفعل! <b>{subscriptionInfo.daysLeft}</b> يوم متبقي
        </span>
        <span className="text-3xl" role="img" aria-label="نجمة">⭐</span>
      </div>
    );
  }

  // اشتراك منتهي الصلاحية
  if (subscriptionInfo.type === 'expired') {
    return (
      <div className="flex flex-col gap-3 p-6 mb-8 text-red-900 border-4 border-red-400 shadow-lg rounded-2xl bg-gradient-to-r from-red-100 to-yellow-50 animate-shake">
        <div className="flex items-center gap-3 text-2xl font-bold">
          <span role="img" aria-label="تنبيه">⚠️</span>
          <span>انتهى اشتراكك. لا تتوقف الآن!</span>
          <span role="img" aria-label="كرة">⚽</span>
        </div>
        <span className="text-lg font-semibold text-red-700">
          استعد للعودة بقوة وحقق حلمك في الاحتراف!
        </span>
        <Link 
          href="/dashboard/payment" 
          className="inline-block px-6 py-3 mt-2 text-xl font-bold text-white transition-all duration-500 ease-out bg-red-600 shadow-lg rounded-xl hover:bg-red-700 hover:scale-[1.02]"
        >
          <span role="img" aria-label="تجديد">🔄</span> جدد اشتراكك الآن
        </Link>
      </div>
    );
  }

  return null;
});

SubscriptionStatus.displayName = 'SubscriptionStatus';

export default SubscriptionStatus; 

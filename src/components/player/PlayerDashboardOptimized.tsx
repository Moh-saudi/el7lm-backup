'use client';

import React, { useState, useEffect, useMemo, memo, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { secureConsole } from '@/lib/utils/secure-console';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// Lazy load المكونات الثقيلة
const PlayerStats = lazy(() => import('./components/PlayerStats'));
const PlayerSkills = lazy(() => import('./components/PlayerSkills'));
const PlayerMessages = lazy(() => import('./components/PlayerMessages'));
const PlayerMedia = lazy(() => import('./components/PlayerMedia'));
const PlayerContracts = lazy(() => import('./components/PlayerContracts'));
const PlayerPayment = lazy(() => import('./components/PlayerPayment'));
const SubscriptionStatus = lazy(() => import('./components/SubscriptionStatus'));

// مكون Loading محسن
const ComponentLoader = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
));

ComponentLoader.displayName = 'ComponentLoader';

// مكون التبويبات محسن
const TabButton = memo(({ 
  id, 
  label, 
  icon, 
  isActive, 
  onClick 
}: {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: (id: string) => void;
}) => (
  <button
    onClick={() => onClick(id)}
    className={`px-4 py-2 font-bold flex items-center gap-2 rounded-t-lg transition-all duration-200 ${
      isActive
        ? 'text-blue-700 bg-blue-50 border-b-2 border-blue-700 shadow-sm'
        : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
    }`}
  >
    <span>{icon}</span>
    {label}
  </button>
));

TabButton.displayName = 'TabButton';

// التبويبات المتاحة
const TABS = [
  { id: 'overview', label: 'نظرة عامة', icon: '👁️' },
      { id: 'payment', label: 'إدارة الاشتراكات', icon: '💳' },
  { id: 'media', label: 'معرض الوسائط', icon: '🖼️' },
  { id: 'contracts', label: 'التعاقدات والاتصالات', icon: '📄' },
  { id: 'skills', label: 'المهارات', icon: '⚽' },
] as const;

type TabId = typeof TABS[number]['id'];

interface PlayerDashboardData {
  subscription: any;
  userData: Record<string, unknown>;
  loading: boolean;
}

const PlayerDashboardOptimized = memo(() => {
  const { user, userData: authUserData, loading: authLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<TabId>('overview');
  const [dashboardData, setDashboardData] = useState<PlayerDashboardData>({
    subscription: null,
    userData: {},
    loading: true
  });

  // Memoized tab change handler
  const handleTabChange = useCallback((tabId: string) => {
    secureConsole.log('🔄 Tab changed to:', tabId);
    setSelectedTab(tabId as TabId);
  }, []);

  // جلب بيانات Dashboard محسن
  const fetchDashboardData = useCallback(async () => {
    if (!user?.uid) return;
    
    const startTime = performance.now();
    secureConsole.log('📊 Fetching dashboard data...');
    
    try {
      // جلب البيانات بشكل متوازي
      const [userDoc, subscriptionDoc] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        getDoc(doc(db, 'subscriptions', user.uid))
      ]);

      setDashboardData({
        userData: userDoc.exists() ? userDoc.data() : {},
        subscription: subscriptionDoc.exists() ? subscriptionDoc.data() : null,
        loading: false
      });

      const endTime = performance.now();
      secureConsole.log('⚡ Dashboard data fetched in:', `${(endTime - startTime).toFixed(2)}ms`);
      
    } catch (error) {
      secureConsole.error('❌ Error fetching dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  }, [user?.uid]);

  // تحميل البيانات عند تغيير المستخدم
  useEffect(() => {
    if (user && !authLoading) {
      fetchDashboardData();
    }
  }, [user, authLoading, fetchDashboardData]);

  // Memoized tab content
  const tabContent = useMemo(() => {
    const renderTabContent = () => {
      switch (selectedTab) {
        case 'overview':
          return (
            <div className="space-y-6">
              <Suspense fallback={<ComponentLoader />}>
                <PlayerStats 
                  userData={dashboardData.userData} 
                  loading={dashboardData.loading} 
                />
              </Suspense>
              <Suspense fallback={<ComponentLoader />}>
                <PlayerMessages 
                  userId={user?.uid} 
                  loading={dashboardData.loading} 
                />
              </Suspense>
            </div>
          );

        case 'payment':
          return (
            <Suspense fallback={<ComponentLoader />}>
              <PlayerPayment 
                userData={dashboardData.userData} 
                loading={dashboardData.loading} 
              />
            </Suspense>
          );

        case 'media':
          return (
            <Suspense fallback={<ComponentLoader />}>
              <PlayerMedia 
                userData={dashboardData.userData} 
                loading={dashboardData.loading} 
              />
            </Suspense>
          );

        case 'contracts':
          return (
            <Suspense fallback={<ComponentLoader />}>
              <PlayerContracts 
                userData={dashboardData.userData} 
                loading={dashboardData.loading} 
              />
            </Suspense>
          );

        case 'skills':
          return (
            <Suspense fallback={<ComponentLoader />}>
              <PlayerSkills 
                userData={dashboardData.userData} 
                loading={dashboardData.loading} 
              />
            </Suspense>
          );

        default:
          return <div>المحتوى غير متوفر</div>;
      }
    };

    return renderTabContent();
  }, [selectedTab, dashboardData, user?.uid]);

  // عرض شاشة تحميل إذا كانت المصادقة تحمل
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* حالة الاشتراك */}
      <Suspense fallback={<ComponentLoader />}>
        <SubscriptionStatus 
          subscription={dashboardData.subscription}
          loading={dashboardData.loading}
        />
      </Suspense>

      {/* ملاحظة توضيحية */}
      <div className="p-3 mb-4 text-base font-semibold text-center text-yellow-800 border border-yellow-200 rounded-lg bg-yellow-50">
        يمكنك التنقل بين التبويبات بالضغط على الأزرار في الأعلى. التبويب النشط يظهر بلون أزرق وخلفية مميزة.
      </div>

      {/* التبويبات */}
      <div className="flex space-x-4 space-x-reverse border-b">
        {TABS.map((tab) => (
          <TabButton
            key={tab.id}
            id={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={selectedTab === tab.id}
            onClick={handleTabChange}
          />
        ))}
      </div>

      {/* محتوى التبويبات */}
      <div className="min-h-96">
        {tabContent}
      </div>
    </div>
  );
});

PlayerDashboardOptimized.displayName = 'PlayerDashboardOptimized';

export default PlayerDashboardOptimized; 

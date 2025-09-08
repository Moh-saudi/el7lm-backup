'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';

/**
 * مكون لإدارة Google Tag Manager DataLayer
 * لإرسال البيانات المخصصة إلى GTM
 */
const GTMDataLayer: React.FC = () => {
  const { user, userData } = useAuth();

  useEffect(() => {
    // تهيئة DataLayer إذا لم يكن موجوداً
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
    }
  }, []);

  useEffect(() => {
    // إرسال بيانات المستخدم إلى GTM
    if (typeof window !== 'undefined' && (window as any).dataLayer && user && userData) {
      (window as any).dataLayer.push({
        event: 'user_login',
        user_id: user.uid,
        user_type: userData.accountType || 'unknown',
        user_name: userData.full_name || userData.name || user.email,
        organization: userData.organizationName || null,
        account_status: userData.status || 'active',
        login_timestamp: new Date().toISOString()
      });

      console.log('📊 GTM: User data sent to dataLayer');
    }
  }, [user, userData]);

  useEffect(() => {
    // تتبع تغيير الصفحة
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      const currentPath = window.location.pathname;
      
      (window as any).dataLayer.push({
        event: 'page_view',
        page_path: currentPath,
        page_title: document.title,
        page_timestamp: new Date().toISOString()
      });

      console.log('📊 GTM: Page view tracked:', currentPath);
    }
  }, []);

  return null; // هذا المكون لا يعرض أي شيء
};

export default GTMDataLayer;


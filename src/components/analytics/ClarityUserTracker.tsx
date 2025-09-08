'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import Clarity from '@microsoft/clarity';

const ClarityUserTracker: React.FC = () => {
  const { user, userData } = useAuth();

  useEffect(() => {
    // Identify user when logged in using correct Clarity API
    if (user && userData && typeof window !== 'undefined' && (window as any).clarity) {
      const customId = user.uid;
      const friendlyName = userData.full_name || userData.name || userData.displayName || user.email || 'مستخدم';
      const customSessionId = `session_${Date.now()}`;
      const customPageId = window.location.pathname;

      // Use correct Clarity identify API
      (window as any).clarity('identify', customId, customSessionId, customPageId, friendlyName);
      
      // Set custom tags for user type and account info using correct API
      (window as any).clarity('set', 'user_type', userData.accountType || 'unknown');
      (window as any).clarity('set', 'account_status', userData.status || 'active');
      
      if (userData.organizationName) {
        (window as any).clarity('set', 'organization', userData.organizationName);
      }

      console.log('✅ Clarity user identified:', friendlyName);
    }
  }, [user, userData]);

  return null; // This component doesn't render anything
};

export default ClarityUserTracker;

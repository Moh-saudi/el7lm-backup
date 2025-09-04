'use client';

import React, { useState, useEffect } from 'react';
import ExternalNotifications from '@/components/messaging/ExternalNotifications';

export default function NotificationsButton() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // إذا لم يتم تحميل المكون على العميل بعد، نعرض نسخة بسيطة
  if (!isClient) {
    return (
      <div className="relative">
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 relative"
          disabled
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    );
  }

  return <ExternalNotifications />;
} 

'use client';

import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';

export default function PlayerVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      <UnifiedHeader 
        variant="default"
        showLanguageSwitcher={true}
        showNotifications={true}
        showUserMenu={true}
        title="فيديوهات اللاعب"
        logo="/club-avatar.png"
      />
      <div className="pt-16">
        {/* Full screen layout بدون sidebar */}
        {children}
      </div>
    </div>
  );
} 

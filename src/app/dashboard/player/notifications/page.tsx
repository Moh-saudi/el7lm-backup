'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function PlayerNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات اللاعب"
      description="تابع جميع الإشعارات والتنبيهات المهمة لك"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={true}
      accountType="player"
    />
  );
} 

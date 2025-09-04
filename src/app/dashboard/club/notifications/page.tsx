'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function ClubNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات النادي"
      description="تابع جميع الإشعارات والتنبيهات المهمة للنادي"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={false}
      accountType="club"
    />
  );
} 

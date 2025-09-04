'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function AcademyNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات الأكاديمية"
      description="تابع جميع الإشعارات والتنبيهات المهمة للأكاديمية"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={false}
      accountType="academy"
    />
  );
}

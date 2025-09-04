'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function TrainerNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات المدرب"
      description="تابع جميع الإشعارات والتنبيهات المهمة للمدرب"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={false}
      accountType="trainer"
    />
  );
}

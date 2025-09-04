'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function AgentNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات الوكيل"
      description="تابع جميع الإشعارات والتنبيهات المهمة للوكيل"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={false}
      accountType="agent"
    />
  );
}

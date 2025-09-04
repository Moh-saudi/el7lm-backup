'use client';

import React from 'react';
import NotificationsManager from '@/components/notifications/NotificationsManager';

export default function AdminNotificationsPage() {
  return (
    <NotificationsManager
      title="إشعارات المدير"
      description="تابع جميع الإشعارات والتنبيهات المهمة لإدارة النظام"
      showSenderInfo={true}
      showStats={true}
      showFilters={true}
      showTestButtons={true}
      accountType="admin"
    />
  );
}


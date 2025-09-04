'use client';

import React from 'react';
import UnifiedHeader from './UnifiedHeader';
import { Shield, Users, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminHeader() {
  const customActions = (
    <>
      <Button variant="ghost" size="icon" className="relative">
        <Shield className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <Users className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <BarChart3 className="w-5 h-5" />
      </Button>
    </>
  );

  return (
    <UnifiedHeader
      title="لوحة تحكم المدير"
      logo="/images/admin-avatar.svg"
      showNotifications={true}
      showMessages={true}
      showProfile={true}
      customActions={customActions}
    />
  );
} 

import React from 'react';
import UnifiedHeader from './UnifiedHeader';
import { GraduationCap, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AcademyHeaderNew() {
  const customActions = (
    <>
      <Button variant="ghost" size="icon" className="relative">
        <GraduationCap className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <Users className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <BookOpen className="w-5 h-5" />
      </Button>
    </>
  );

  return (
    <UnifiedHeader
      title="لوحة تحكم الأكاديمية"
      logo="/images/academy-avatar.png"
      showNotifications={true}
      showMessages={true}
      showProfile={true}
      customActions={customActions}
    />
  );
}


import React from 'react';
import UnifiedHeader from './UnifiedHeader';
import { Trophy, Target, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PlayerHeader() {
  const customActions = (
    <>
      <Button variant="ghost" size="icon" className="relative">
        <Trophy className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <Target className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="relative">
        <Calendar className="w-5 h-5" />
      </Button>
    </>
  );

  return (
    <UnifiedHeader
      title="لوحة تحكم اللاعب"
      logo="/images/player-avatar.png"
      showNotifications={true}
      showMessages={true}
      showProfile={true}
      customActions={customActions}
    />
  );
}


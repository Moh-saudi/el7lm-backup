'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import NotificationsButton from '@/components/shared/NotificationsButton';

export default function PlayerHeader() {
  const { user } = useAuth();
  const [playerData, setPlayerData] = useState(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!user?.uid) return;

      try {
        const playerRef = doc(db, 'players', user.uid);
        const playerDoc = await getDoc(playerRef);
        
        if (playerDoc.exists()) {
          setPlayerData(playerDoc.data());
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات اللاعب:', error);
      }
    };

    fetchPlayerData();
  }, [user?.uid]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight text-blue-700">منصة اللاعبين</span>
        </div>
        
        <div className="flex items-center gap-4">
          <NotificationsButton />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {playerData?.full_name || playerData?.firstName + ' ' + playerData?.lastName || 'لاعب'}
            </span>
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={playerData?.profile_photo} 
                alt={playerData?.full_name || 'صورة اللاعب'} 
              />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
} 

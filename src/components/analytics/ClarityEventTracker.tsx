'use client';

import React, { useCallback } from 'react';
import { useClarity } from '@/hooks/useClarity';

interface ClarityEventTrackerProps {
  eventName: string;
  children: React.ReactNode;
  upgradeReason?: string;
  customTags?: Record<string, string | string[]>;
  className?: string;
}

/**
 * مكون لتتبع الأحداث في Clarity
 * بناءً على وثائق Microsoft Clarity
 */
const ClarityEventTracker: React.FC<ClarityEventTrackerProps> = ({
  eventName,
  children,
  upgradeReason,
  customTags,
  className = ''
}) => {
  const { trackEvent, setTag, upgradeSession } = useClarity();

  const handleClick = useCallback(() => {
    // تتبع الحدث
    trackEvent(eventName);
    
    // تعيين العلامات المخصصة
    if (customTags) {
      Object.entries(customTags).forEach(([key, value]) => {
        setTag(key, value);
      });
    }
    
    // ترقية الجلسة إذا كان هناك سبب
    if (upgradeReason) {
      upgradeSession(upgradeReason);
    }
    
    console.log('🎯 Clarity event tracked:', eventName);
  }, [eventName, customTags, upgradeReason, trackEvent, setTag, upgradeSession]);

  return (
    <div 
      onClick={handleClick}
      className={`cursor-pointer ${className}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {children}
    </div>
  );
};

export default ClarityEventTracker;


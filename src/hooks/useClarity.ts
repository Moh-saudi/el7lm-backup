'use client';

import { useCallback } from 'react';
import Clarity from '@microsoft/clarity';

export const useClarity = () => {
  const trackEvent = useCallback((eventName: string) => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('event', eventName);
      console.log('📊 Clarity event tracked:', eventName);
    }
  }, []);

  const setTag = useCallback((key: string, value: string | string[]) => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('set', key, value);
      console.log('🏷️ Clarity tag set:', key, value);
    }
  }, []);

  const upgradeSession = useCallback((reason: string) => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('upgrade', reason);
      console.log('⬆️ Clarity session upgraded:', reason);
    }
  }, []);

  const setConsent = useCallback((consent: boolean = true) => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('consent', consent.toString());
      console.log('🍪 Clarity consent set:', consent);
    }
  }, []);

  const identifyUser = useCallback((
    customId: string,
    customSessionId?: string,
    customPageId?: string,
    friendlyName?: string
  ) => {
    if (typeof window !== 'undefined' && (window as any).clarity) {
      (window as any).clarity('identify', customId, customSessionId, customPageId, friendlyName);
      console.log('👤 Clarity user identified:', friendlyName || customId);
    }
  }, []);

  return {
    trackEvent,
    setTag,
    upgradeSession,
    setConsent,
    identifyUser
  };
};

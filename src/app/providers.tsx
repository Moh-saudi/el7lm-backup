'use client';

import { ReactNode } from 'react';
import { FirebaseAuthProvider } from '@/lib/firebase/auth-provider';
// import { TranslationProvider } from '@/lib/i18n';
import { MantineProvider } from '@mantine/core';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider>
      <FirebaseAuthProvider>
        {children}
      </FirebaseAuthProvider>
    </MantineProvider>
  );
} 

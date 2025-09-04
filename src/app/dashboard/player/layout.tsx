'use client';

import React from 'react';

interface PlayerLayoutProps {
  children: React.ReactNode;
}

export default function PlayerLayout({ children }: PlayerLayoutProps) {
  return <>{children}</>;
}

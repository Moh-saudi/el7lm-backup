'use client';

import React from 'react';

interface MarketerLayoutProps {
  children: React.ReactNode;
}

export default function MarketerLayout({ children }: MarketerLayoutProps) {
  return <>{children}</>;
} 

'use client';

import React from 'react';

interface ParentLayoutProps {
  children: React.ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  return <>{children}</>;
}

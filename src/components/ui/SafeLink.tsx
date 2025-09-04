'use client';

import React from 'react';

interface SafeLinkProps {
  href: string;
  rel?: string;
  crossOrigin?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export default function SafeLink({ 
  href, 
  rel, 
  crossOrigin, 
  children, 
  ...props 
}: SafeLinkProps) {
  // Ensure crossOrigin is always the same on server and client
  const safeCrossOrigin = crossOrigin || 'anonymous';
  
  return (
    <link 
      href={href} 
      rel={rel} 
      crossOrigin={safeCrossOrigin}
      {...props}
    >
      {children}
    </link>
  );
}

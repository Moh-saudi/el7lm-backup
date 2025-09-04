'use client';

import React, { useEffect, useState } from 'react';

interface HydrationErrorBoundaryProps {
  children: React.ReactNode;
}

export default function HydrationErrorBoundary({ children }: HydrationErrorBoundaryProps) {
  const [hasHydrationError, setHasHydrationError] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Listen for hydration errors
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('Extra attributes from the server') || 
          event.message.includes('hydration') ||
          event.message.includes('rel')) {
        console.warn('Hydration mismatch detected, suppressing error:', event.message);
        setHasHydrationError(true);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  // If there's a hydration error, render a simplified version
  if (hasHydrationError) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  // Normal rendering
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}

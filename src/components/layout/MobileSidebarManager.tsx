'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface MobileSidebarContextType {
  isMobileSidebarOpen: boolean;
  openMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  toggleMobileSidebar: () => void;
}

const MobileSidebarContext = createContext<MobileSidebarContextType | undefined>(undefined);

export const useMobileSidebar = () => {
  const context = useContext(MobileSidebarContext);
  if (!context) {
    throw new Error('useMobileSidebar must be used within a MobileSidebarProvider');
  }
  return context;
};

interface MobileSidebarProviderProps {
  children: React.ReactNode;
}

export const MobileSidebarProvider: React.FC<MobileSidebarProviderProps> = ({ children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const mobile = width < 768;
      setIsMobile(mobile);
      
      // إغلاق القائمة الجانبية عند تغيير الحجم من موبايل إلى ديسكتوب
      if (!mobile && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMobileSidebarOpen]);

  const openMobileSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(true);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const toggleMobileSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  return (
    <MobileSidebarContext.Provider
      value={{
        isMobileSidebarOpen,
        openMobileSidebar,
        closeMobileSidebar,
        toggleMobileSidebar,
      }}
    >
      {children}
    </MobileSidebarContext.Provider>
  );
};

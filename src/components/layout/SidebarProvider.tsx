'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
  isMobile: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop';
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: React.ReactNode;
}

export const SidebarProvider: React.FC<SidebarProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setIsMobile(true);
        setScreenSize('mobile');
        setIsOpen(false);
        setSidebarCollapsed(false);
      } else if (width < 1024) {
        setIsMobile(false);
        setScreenSize('tablet');
        setIsOpen(true);
        setSidebarCollapsed(true); // في التابلت، السايدبار مطوي افتراضياً
      } else {
        setIsMobile(false);
        setScreenSize('desktop');
        setIsOpen(true);
        setSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setSidebarCollapsed(true);
    }
  };

  const openSidebar = () => {
    if (isMobile) {
      setIsOpen(true);
    } else {
      setSidebarCollapsed(false);
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        isMobile,
        screenSize,
        sidebarCollapsed,
        setSidebarCollapsed
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

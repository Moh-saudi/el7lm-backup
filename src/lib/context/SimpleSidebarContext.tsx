'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SimpleSidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SimpleSidebarContext = createContext<SimpleSidebarContextType | undefined>(undefined);

export const useSimpleSidebar = () => {
  const context = useContext(SimpleSidebarContext);
  if (!context) {
    throw new Error('useSimpleSidebar must be used within a SimpleSidebarProvider');
  }
  return context;
};

interface SimpleSidebarProviderProps {
  children: ReactNode;
}

export const SimpleSidebarProvider = ({ children }: SimpleSidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading sidebar state:', error);
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    } catch (error) {
      console.error('Error saving sidebar state:', error);
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const value: SimpleSidebarContextType = {
    isCollapsed,
    setIsCollapsed,
    toggleSidebar,
  };

  return (
    <SimpleSidebarContext.Provider value={value}>
      {children}
    </SimpleSidebarContext.Provider>
  );
};


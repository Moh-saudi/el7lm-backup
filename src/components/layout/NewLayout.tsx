'use client';

import React, { useState } from 'react';
import { 
  Box
} from '@mantine/core';
import NewHeader from './NewHeader';
import NewSidebar from './NewSidebar';
import NewFooter from './NewFooter';

interface NewLayoutProps {
  children: React.ReactNode;
}

export default function NewLayout({ children }: NewLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpened, setDrawerOpened] = useState(false);

  const toggleDrawer = () => setDrawerOpened(!drawerOpened);

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <NewHeader opened={drawerOpened} toggle={toggleDrawer} />

      {/* المحتوى الرئيسي */}
      <Box className="flex">
        {/* القائمة الجانبية */}
        <Box className="hidden md:block">
          <NewSidebar collapsed={sidebarCollapsed} />
        </Box>

        {/* المحتوى */}
        <Box className="flex-1 p-4">
          {children}
        </Box>
      </Box>

      {/* الفوتر */}
      <NewFooter />
    </Box>
  );
}

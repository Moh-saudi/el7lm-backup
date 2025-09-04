'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from './SidebarProvider';

interface MobileMenuButtonProps {
  className?: string;
}

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({ className = '' }) => {
  const { isOpen, toggleSidebar, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSidebar}
      className={`lg:hidden ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </motion.div>
    </Button>
  );
};

export default MobileMenuButton;


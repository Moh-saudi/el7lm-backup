'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
// تم إلغاء LanguageSwitcher مؤقتاً
import { 
  Bell, 
  LogOut, 
  Settings, 
  Menu,
  X,
  Search
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
}

export default function DashboardHeader({ 
  showSearch = true, 
  searchPlaceholder 
}: DashboardHeaderProps) {
  const { signOut } = useAuth();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200" dir={isRTL}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-blue-600">
                El7lm
              </h1>
            </div>
          </div>

          {/* Search Bar - Desktop */}
          {showSearch && (
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={searchPlaceholder || 'header.searchPlaceholder'}
                  className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            
            {/* Language Switcher */}
            <div className="flex items-center">
              <div className="mr-2 rtl:ml-2">تم إلغاء مبدل اللغة مؤقتاً</div>
            </div>

            {/* Notifications */}
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors relative"
              title={'header.notifications'}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button 
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
              title={'header.settings'}
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Sign Out */}
            <button 
              onClick={handleSignOut}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
              title={'header.signOut'}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-2">
              
              {/* Search Bar - Mobile */}
              {showSearch && (
                <div className="px-4 py-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={searchPlaceholder || 'header.searchPlaceholder'}
                      className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              
              {/* Language Switcher for Mobile */}
              <div className="flex items-center justify-center py-2">
                <div>تم إلغاء مبدل اللغة مؤقتاً</div>
              </div>

              {/* Notifications for Mobile */}
              <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5 mr-3 rtl:ml-3" />
                {'header.notifications'}
              </button>

              {/* Settings for Mobile */}
              <button className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5 mr-3 rtl:ml-3" />
                {'header.settings'}
              </button>

              {/* Sign Out for Mobile */}
              <button 
                onClick={handleSignOut}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-5 h-5 mr-3 rtl:ml-3" />
                {'header.signOut'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </header>
  );
} 

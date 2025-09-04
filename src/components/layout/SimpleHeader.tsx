'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  LogOut, 
  Bell,
  MessageSquare,
  User,
  Settings,
  Moon,
  Sun,
  Shield,
  Star,
  Crown,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SimpleHeaderProps {
  showSearch?: boolean;
  searchPlaceholder?: string;
  title?: string;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({
  showSearch = true,
  searchPlaceholder = "ابحث عن أي شيء...",
  title = "El7lm Platform"
}) => {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get user display name - simplified
  const getUserDisplayName = () => {
    if (!userData) return 'مستخدم';
    
    const name = userData.name || userData.full_name || userData.displayName || user?.displayName || 'مستخدم';
    return name;
  };

  // Get user account type info - simplified
  const getAccountTypeInfo = () => {
    if (!userData?.accountType) return { label: 'مستخدم', icon: User, color: 'bg-slate-500' };
    
    const types = {
      'player': { label: 'لاعب', icon: User, color: 'bg-blue-500' },
      'club': { label: 'نادي', icon: Shield, color: 'bg-green-500' },
      'academy': { label: 'أكاديمية', icon: Star, color: 'bg-orange-500' },
      'trainer': { label: 'مدرب', icon: Crown, color: 'bg-purple-500' },
      'agent': { label: 'وكيل', icon: Sparkles, color: 'bg-pink-500' },
      'admin': { label: 'مدير', icon: Shield, color: 'bg-red-500' },
    };
    
    return types[userData.accountType as keyof typeof types] || types.player;
  };

  const accountInfo = getAccountTypeInfo();
  const IconComponent = accountInfo.icon;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <div className="w-8 h-8 text-white font-bold flex items-center justify-center">
                  E7
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="text-sm text-slate-600">منصة الأحلام الرياضية</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="w-full relative">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-6 pr-12 py-3 bg-white/60 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 transition-all duration-300"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right Side - Notifications, Messages, User Menu */}
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                2
              </Badge>
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/images/default-avatar.png" alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                      {getUserDisplayName().charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{getUserDisplayName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userData?.email || user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;


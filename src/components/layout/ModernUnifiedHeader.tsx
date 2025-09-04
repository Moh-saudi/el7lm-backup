'use client';

import React, { useState, useEffect } from 'react';
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
  Menu, 
  X,
  Bell,
  MessageSquare,
  User,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  Globe,
  Star,
  Heart,
  Shield,
  Crown,
  Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SmartNotifications from '@/components/notifications/SmartNotifications';
import MessageNotifications from '@/components/messaging/MessageNotifications';
import InteractionNotifications from '@/components/notifications/InteractionNotifications';
import { getPlayerAvatarUrl } from '@/lib/supabase/image-utils';

interface ModernUnifiedHeaderProps {
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  title?: string;
  variant?: 'default' | 'minimal' | 'gaming';
}

const ModernUnifiedHeader: React.FC<ModernUnifiedHeaderProps> = ({
  showSearch = true,
  onSearch,
  searchPlaceholder = "ابحث عن أي شيء...",
  title = "El7lm Platform",
  variant = 'gaming'
}) => {
  const { user, userData, logout } = useAuth();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get user display name
  const getUserDisplayName = () => {
    console.log('🔍 getUserDisplayName called');
    console.log('🔍 user object:', user);
    console.log('🔍 userData object:', userData);
    
    if (!userData) {
      console.log('❌ No userData available for name');
      return 'مستخدم';
    }
    
    console.log('✅ userData available for name:', {
      accountType: userData.accountType,
      academy_name: userData.academy_name,
      club_name: userData.club_name,
      agent_name: userData.agent_name,
      trainer_name: userData.trainer_name,
      full_name: userData.full_name,
      name: userData.name,
      displayName: userData.displayName,
      userDisplayName: user?.displayName,
      email: userData.email
    });
    
    // Handle different account types
    switch (userData.accountType) {
      case 'academy':
        const academyName = userData.academy_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'أكاديمية رياضية';
        console.log('🎓 Using academy name:', academyName);
        console.log('🎓 Source breakdown:', {
          academy_name: userData.academy_name,
          full_name: userData.full_name,
          name: userData.name,
          displayName: userData.displayName,
          userDisplayName: user?.displayName,
          fallback: 'أكاديمية رياضية'
        });
        return academyName;
      
      case 'club':
        const clubName = userData.club_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'نادي رياضي';
        console.log('Using club name:', clubName);
        return clubName;
      
      case 'agent':
        const agentName = userData.agent_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'وكيل رياضي';
        console.log('Using agent name:', agentName);
        return agentName;
      
      case 'trainer':
        const trainerName = userData.trainer_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'مدرب';
        console.log('Using trainer name:', trainerName);
        return trainerName;
      
      default: // player, admin, etc.
        const defaultName = userData.full_name || userData.name || userData.displayName || user?.displayName || 'مستخدم';
        console.log('Using default name:', defaultName);
        return defaultName;
    }
  };

  // Get user avatar
  const getUserAvatar = () => {
    try {
      const avatarUrl = getPlayerAvatarUrl(userData, user);
      return avatarUrl || '/images/default-avatar.png';
    } catch (error) {
      return '/images/default-avatar.png';
    }
  };

  // Get user account type with beautiful labels
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      await logout();
      router.push('/');
    }
  };

  const toggleLanguage = () => {
    // تم إلغاء تغيير اللغة مؤقتاً
    console.log('تم إلغاء تغيير اللغة مؤقتاً');
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
            <div className="hidden md:flex items-center gap-2">
              {/* Smart Notifications */}
              <div className="relative">
                <SmartNotifications />
              </div>

              {/* Interaction Notifications */}
              <div className="relative">
                <InteractionNotifications />
              </div>

              {/* Message Notifications */}
              <div className="relative">
                <MessageNotifications />
              </div>
            </div>

            {/* Language Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-2 border-white/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {locale === 'ar' ? 'EN' : 'عربي'}
              </span>
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="hidden md:flex border-white/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl p-2"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 p-2 hover:bg-white/60 rounded-xl transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10 ring-2 ring-white/50 shadow-lg">
                        <AvatarImage 
                          src={getUserAvatar()} 
                          alt={getUserDisplayName()}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <AvatarFallback className={`${accountInfo.color} text-white font-bold text-sm`}>
                          {getUserDisplayName().slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${accountInfo.color} rounded-full border-2 border-white flex items-center justify-center`}>
                        <accountInfo.icon className="w-2 h-2 text-white" />
                      </div>
                    </div>
                    
                    <div className="hidden md:block text-right">
                      <div className="text-sm font-semibold text-slate-800">
                        {getUserDisplayName()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className={`${accountInfo.color} text-white border-0 text-xs px-2 py-0`}>
                          {accountInfo.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <ChevronDown className="w-4 h-4 text-slate-600 hidden md:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-64 bg-white/90 backdrop-blur-lg border-white/30 shadow-2xl rounded-2xl p-2">
                <DropdownMenuLabel className="px-4 py-3">
                  <div className="flex items-center gap-3">
                                         <Avatar className="w-12 h-12">
                       <AvatarImage 
                         src={getUserAvatar()} 
                         onError={(e) => {
                           e.currentTarget.style.display = 'none';
                         }}
                       />
                       <AvatarFallback className={`${accountInfo.color} text-white font-bold`}>
                         {getUserDisplayName().slice(0, 2).toUpperCase()}
                       </AvatarFallback>
                     </Avatar>
                    <div>
                      <div className="font-semibold text-slate-800">{getUserDisplayName()}</div>
                      <div className="text-sm text-slate-600">{user?.email}</div>
                      <Badge variant="secondary" className={`${accountInfo.color} text-white border-0 text-xs mt-1`}>
                        {accountInfo.label}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-white/30" />
                
                <DropdownMenuItem 
                  onClick={() => router.push(`/dashboard/${userData?.accountType || 'player'}/profile`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/60 rounded-xl cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => router.push(`/dashboard/${userData?.accountType || 'player'}/messages`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/60 rounded-xl cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>الرسائل</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => router.push(`/dashboard/${userData?.accountType || 'player'}/notifications`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/60 rounded-xl cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span>الإشعارات</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 hover:bg-white/60 rounded-xl cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-white/30" />
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 rounded-xl cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden border-white/30 bg-white/60 backdrop-blur-sm hover:bg-white/80 rounded-xl p-2"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="md:hidden mt-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-6 pr-12 py-3 bg-white/60 backdrop-blur-sm border-white/30 shadow-lg rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400 w-full"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 p-3 hover:bg-white/60 rounded-xl">
                <Bell className="w-5 h-5" />
                <span>الإشعارات</span>
              </div>
              <div className="flex items-center gap-2 p-3 hover:bg-white/60 rounded-xl">
                <MessageSquare className="w-5 h-5" />
                <span>الرسائل</span>
              </div>
              <div className="flex items-center gap-2 p-3 hover:bg-white/60 rounded-xl" onClick={toggleLanguage}>
                <Globe className="w-5 h-5" />
                <span>{locale === 'ar' ? 'English' : 'عربي'}</span>
              </div>
              <div className="flex items-center gap-2 p-3 hover:bg-white/60 rounded-xl" onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>تغيير المظهر</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default ModernUnifiedHeader; 

'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  User, 
  MessageSquare, 
  Users, 
  Search, 
  Video, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Shield,
  GraduationCap,
  Building,
  Briefcase,
  Star,
  Crown,
  Sparkles,
  Bell,
  Settings,
  BarChart3,
  Calendar,
  Heart,
  Trophy,
  Target,
  Zap,
  Globe,
  TrendingUp
} from 'lucide-react';

interface SimpleSidebarProps {
  accountType: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SimpleSidebar: React.FC<SimpleSidebarProps> = ({
  accountType,
  collapsed,
  setCollapsed
}) => {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get user display name - simplified
  const getUserDisplayName = () => {
    if (!userData) return 'مستخدم';
    return userData.name || userData.full_name || userData.displayName || user?.displayName || 'مستخدم';
  };

  // Get account type info - simplified
  const getAccountTypeInfo = () => {
    const types = {
      'player': { 
        label: 'لاعب', 
        icon: User, 
        color: 'bg-blue-500',
        bgGradient: 'from-blue-500 to-cyan-500',
        gradient: 'from-blue-500 to-cyan-500'
      },
      'club': { 
        label: 'نادي', 
        icon: Shield, 
        color: 'bg-green-500',
        bgGradient: 'from-green-500 to-emerald-500',
        gradient: 'from-green-500 to-emerald-500'
      },
      'academy': { 
        label: 'أكاديمية', 
        icon: Star, 
        color: 'bg-orange-500',
        bgGradient: 'from-orange-500 to-red-500',
        gradient: 'from-orange-500 to-red-500'
      },
      'trainer': { 
        label: 'مدرب', 
        icon: Crown, 
        color: 'bg-purple-500',
        bgGradient: 'from-purple-500 to-indigo-500',
        gradient: 'from-purple-500 to-indigo-500'
      },
      'agent': { 
        label: 'وكيل', 
        icon: Sparkles, 
        color: 'bg-pink-500',
        bgGradient: 'from-pink-500 to-rose-500',
        gradient: 'from-pink-500 to-rose-500'
      },
      'admin': { 
        label: 'مدير', 
        icon: Shield, 
        color: 'bg-red-500',
        bgGradient: 'from-red-500 to-pink-500',
        gradient: 'from-red-500 to-pink-500'
      }
    };
    
    return types[accountType as keyof typeof types] || types.player;
  };

  const accountInfo = getAccountTypeInfo();
  const IconComponent = accountInfo.icon;

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      await logout();
      router.push('/');
    }
  };

  // Navigation items based on account type
  const getNavigationItems = () => {
    const baseItems = [
      { icon: Home, label: 'الرئيسية', href: '/dashboard' },
      { icon: User, label: 'الملف الشخصي', href: '/dashboard/profile' },
      { icon: MessageSquare, label: 'الرسائل', href: '/dashboard/messages' },
      { icon: Bell, label: 'الإشعارات', href: `/dashboard/${userData?.accountType || 'player'}/notifications` },
    ];

    const accountSpecificItems = {
      'player': [
        { icon: Trophy, label: 'الإنجازات', href: '/dashboard/player/achievements' },
        { icon: Video, label: 'الفيديوهات', href: '/dashboard/player/videos' },
        { icon: Target, label: 'الأهداف', href: '/dashboard/player/goals' },
        { icon: BarChart3, label: 'الإحصائيات', href: '/dashboard/player/stats' },
      ],
      'trainer': [
        { icon: Users, label: 'اللاعبين', href: '/dashboard/trainer/players' },
        { icon: Calendar, label: 'الجدول', href: '/dashboard/trainer/schedule' },
        { icon: FileText, label: 'التقارير', href: '/dashboard/trainer/reports' },
        { icon: Settings, label: 'الإعدادات', href: '/dashboard/trainer/settings' },
      ],
      'academy': [
        { icon: GraduationCap, label: 'الطلاب', href: '/dashboard/academy/students' },
        { icon: Building, label: 'الأقسام', href: '/dashboard/academy/departments' },
        { icon: Calendar, label: 'البرامج', href: '/dashboard/academy/programs' },
        { icon: BarChart3, label: 'التقارير', href: '/dashboard/academy/reports' },
      ],
      'club': [
        { icon: Shield, label: 'الفريق', href: '/dashboard/club/team' },
        { icon: Trophy, label: 'البطولات', href: '/dashboard/club/tournaments' },
        { icon: Calendar, label: 'المباريات', href: '/dashboard/club/matches' },
        { icon: BarChart3, label: 'الإحصائيات', href: '/dashboard/club/stats' },
      ],
      'agent': [
        { icon: Briefcase, label: 'العملاء', href: '/dashboard/agent/clients' },
        { icon: TrendingUp, label: 'العقود', href: '/dashboard/agent/contracts' },
        { icon: Globe, label: 'الفرص', href: '/dashboard/agent/opportunities' },
        { icon: BarChart3, label: 'التقارير', href: '/dashboard/agent/reports' },
      ],
      'admin': [
        { icon: Shield, label: 'المستخدمين', href: '/dashboard/admin/users' },
        { icon: Settings, label: 'الإعدادات', href: '/dashboard/admin/settings' },
        { icon: BarChart3, label: 'التقارير', href: '/dashboard/admin/reports' },
        { icon: BarChart3, label: 'Clarity Analytics', href: '/dashboard/admin/clarity' },
        { icon: Globe, label: 'النظام', href: '/dashboard/admin/system' },
      ]
    };

    return [...baseItems, ...(accountSpecificItems[accountType as keyof typeof accountSpecificItems] || [])];
  };

  const navigationItems = getNavigationItems();

  return (
    <div
      className={`fixed right-0 top-0 h-full bg-gradient-to-b ${accountInfo.bgGradient} backdrop-blur-xl border-l border-white/20 shadow-2xl z-40 flex flex-col max-w-full transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-[280px]'
      }`}
    >
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className={`p-2 sm:p-3 bg-gradient-to-br ${accountInfo.gradient} rounded-xl shadow-lg`}>
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">El7lm</h2>
                <p className="text-sm text-slate-600">Platform</p>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/60 rounded-xl"
          >
            {collapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-4 sm:p-6 border-b border-white/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/images/default-avatar.png" alt={getUserDisplayName()} />
            <AvatarFallback className={`${accountInfo.color} text-white`}>
              {getUserDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {getUserDisplayName()}
              </p>
              <div className="flex items-center gap-2">
                <Badge className={`${accountInfo.color} text-white text-xs`}>
                  {accountInfo.label}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start gap-3 h-12 ${
                    isActive 
                      ? `${accountInfo.color} text-white hover:${accountInfo.color}` 
                      : 'hover:bg-white/60 text-slate-700'
                  }`}
                  onClick={() => router.push(item.href)}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 h-12 text-red-600 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </Button>
      </div>
    </div>
  );
};

export default SimpleSidebar;


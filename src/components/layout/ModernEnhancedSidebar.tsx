'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface ModernEnhancedSidebarProps {
  accountType: string;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  userData?: any;
}

const ModernEnhancedSidebar: React.FC<ModernEnhancedSidebarProps> = ({
  accountType,
  collapsed,
  setCollapsed,
  userData
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [activeItem, setActiveItem] = useState('');

  // Update active item based on current path
  useEffect(() => {
    // Determine active item: root dashboard vs. inner page
    const normalized = pathname.replace(/\/+$/, '');
    const rootForType = `/dashboard/${accountType}`;
    if (normalized === rootForType) {
      setActiveItem('dashboard');
    } else {
      const currentPath = normalized.split('/').pop() || 'dashboard';
      setActiveItem(currentPath);
    }
  }, [pathname, accountType]);

  // Get user display info
  const getUserDisplayName = () => {
    console.log('📋 Sidebar getUserDisplayName called');
    console.log('📋 Sidebar user object:', user);
    console.log('📋 Sidebar userData object:', userData);
    
    if (!userData) {
      console.log('❌ Sidebar: No userData available for name');
      return 'مستخدم';
    }
    
    console.log('✅ Sidebar userData available for name:', {
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
        console.log('🎓 Sidebar using academy name:', academyName);
        console.log('🎓 Sidebar source breakdown:', {
          academy_name: userData.academy_name,
          full_name: userData.full_name,
          name: userData.name,
          displayName: userData.displayName,
          userDisplayName: user?.displayName,
          fallback: 'أكاديمية رياضية'
        });
        return academyName;
      
      case 'club':
        return userData.club_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'نادي رياضي';
      
      case 'agent':
        return userData.agent_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'وكيل رياضي';
      
      case 'trainer':
        return userData.trainer_name || userData.full_name || userData.name || userData.displayName || user?.displayName || 'مدرب';
      
      default: // player, admin, etc.
        return userData.full_name || userData.name || userData.displayName || user?.displayName || 'مستخدم';
    }
  };

  const getUserAvatar = () => {
    if (!userData) return null;
    
    // Check profile_image_url first
    if (userData.profile_image_url) return userData.profile_image_url;
    
    // Check profile_image (can be string or object)
    if (userData.profile_image) {
      if (typeof userData.profile_image === 'string') {
        return userData.profile_image;
      }
      if (typeof userData.profile_image === 'object' && userData.profile_image.url) {
        return userData.profile_image.url;
      }
    }
    
    // Check avatar field
    if (userData.avatar) return userData.avatar;
    
    // Check Firebase user photo
    if (user?.photoURL) return user.photoURL;
    
    return null;
  };

  // Get account type info with beautiful styling
  const getAccountTypeInfo = () => {
    const types = {
      'player': { 
        label: 'لاعب محترف', 
        icon: User, 
        gradient: 'from-blue-500 to-cyan-500',
        bgGradient: 'from-blue-50 to-cyan-50',
        emoji: '⚽'
      },
      'club': { 
        label: 'نادي رياضي', 
        icon: Shield, 
        gradient: 'from-green-500 to-emerald-500',
        bgGradient: 'from-green-50 to-emerald-50',
        emoji: '🏆'
      },
      'academy': { 
        label: 'أكاديمية تدريب', 
        icon: GraduationCap, 
        gradient: 'from-orange-500 to-red-500',
        bgGradient: 'from-orange-50 to-red-50',
        emoji: '🎓'
      },
      'trainer': { 
        label: 'مدرب معتمد', 
        icon: Crown, 
        gradient: 'from-purple-500 to-indigo-500',
        bgGradient: 'from-purple-50 to-indigo-50',
        emoji: '👨‍🏫'
      },
      'agent': { 
        label: 'وكيل رياضي', 
        icon: Briefcase, 
        gradient: 'from-pink-500 to-rose-500',
        bgGradient: 'from-pink-50 to-rose-50',
        emoji: '💼'
      },
      'admin': { 
        label: 'مدير النظام', 
        icon: Shield, 
        gradient: 'from-red-500 to-pink-500',
        bgGradient: 'from-red-50 to-pink-50',
        emoji: '👑'
      },
    };
    
    return types[accountType as keyof typeof types] || types.player;
  };

  const accountInfo = getAccountTypeInfo();

  // Get menu items based on account type
  const getMenuItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        label: 'لوحة التحكم',
        icon: Home,
        href: `/dashboard/${accountType}`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      }
    ];

    const accountSpecificItems = {
      player: [
        { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/player/profile`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/player/messages`, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
        { id: 'reports', label: 'التقارير', icon: FileText, href: `/dashboard/player/reports`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'videos', label: 'الفيديوهات', icon: Video, href: `/dashboard/player/videos`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/player/player-videos`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'search', label: 'البحث', icon: Search, href: `/dashboard/player/search`, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'stats', label: 'الإحصائيات', icon: BarChart3, href: `/dashboard/player/stats`, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { id: 'bulk-payment', label: 'الدفع الجماعي', icon: Target, href: `/dashboard/player/bulk-payment`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/player/referrals`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        // إضافة رابط حالة الاشتراك للاعبين
        { id: 'subscription-status', label: 'حالة الاشتراك', icon: TrendingUp, href: '/dashboard/player/subscription-status', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      ],
      club: [
        { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/club/profile`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/club/messages`, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
        { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/club/players`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/club/search-players`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/club/player-videos`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'contracts', label: 'العقود', icon: FileText, href: `/dashboard/club/contracts`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'marketing', label: 'التسويق', icon: Target, href: `/dashboard/club/marketing`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'ai-analysis', label: 'تحليل الذكاء الاصطناعي', icon: Zap, href: `/dashboard/club/ai-analysis`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'market-values', label: 'قيم السوق', icon: BarChart3, href: `/dashboard/club/market-values`, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
        { id: 'negotiations', label: 'المفاوضات', icon: Heart, href: `/dashboard/club/negotiations`, color: 'text-rose-600', bgColor: 'bg-rose-50' },
        { id: 'player-evaluation', label: 'تقييم اللاعبين', icon: Star, href: `/dashboard/club/player-evaluation`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { id: 'notifications', label: 'الإشعارات', icon: Bell, href: `/dashboard/club/notifications`, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'bulk-payment', label: 'الدفع الجماعي', icon: Target, href: `/dashboard/club/bulk-payment`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'subscription-status', label: 'حالة الاشتراك', icon: TrendingUp, href: '/dashboard/club/subscription-status', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'billing', label: 'الفواتير', icon: FileText, href: `/dashboard/club/billing`, color: 'text-slate-600', bgColor: 'bg-slate-50' },
        { id: 'change-password', label: 'تغيير كلمة المرور', icon: Shield, href: `/dashboard/club/change-password`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/club/referrals`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      ],
      academy: [
        { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/academy/profile`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/academy/messages`, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
        { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/academy/players`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/academy/search-players`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/academy/player-videos`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'bulk-payment', label: 'الدفع الجماعي', icon: Target, href: `/dashboard/academy/bulk-payment`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'subscription-status', label: 'حالة الاشتراك', icon: TrendingUp, href: '/dashboard/academy/subscription-status', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'billing', label: 'الفواتير', icon: FileText, href: `/dashboard/academy/billing`, color: 'text-slate-600', bgColor: 'bg-slate-50' },
        { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/academy/referrals`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      ],
      trainer: [
        { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/trainer/profile`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/trainer/messages`, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
        { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/trainer/players`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/trainer/search-players`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/trainer/player-videos`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'bulk-payment', label: 'الدفع الجماعي', icon: Target, href: `/dashboard/trainer/bulk-payment`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'subscription-status', label: 'حالة الاشتراك', icon: TrendingUp, href: '/dashboard/trainer/subscription-status', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'billing', label: 'الفواتير', icon: FileText, href: `/dashboard/trainer/billing`, color: 'text-slate-600', bgColor: 'bg-slate-50' },
        { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/trainer/referrals`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      ],
      agent: [
        { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/agent/profile`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/agent/messages`, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
        { id: 'players', label: 'اللاعبين', icon: Users, href: `/dashboard/agent/players`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'search-players', label: 'البحث عن اللاعبين', icon: Search, href: `/dashboard/agent/search-players`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'player-videos', label: 'فيديوهات اللاعبين', icon: Video, href: `/dashboard/agent/player-videos`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'bulk-payment', label: 'الدفع الجماعي', icon: Target, href: `/dashboard/agent/bulk-payment`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'subscription-status', label: 'حالة الاشتراك', icon: TrendingUp, href: '/dashboard/agent/subscription-status', color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'billing', label: 'الفواتير', icon: FileText, href: `/dashboard/agent/billing`, color: 'text-slate-600', bgColor: 'bg-slate-50' },
        { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/agent/referrals`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
        { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
      ],
      admin: [
        { id: 'profile', label: 'الملف الشخصي', icon: User, href: `/dashboard/admin/profile`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare, href: `/dashboard/admin/messages`, color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
        { id: 'users', label: 'المستخدمين', icon: Users, href: `/dashboard/admin/users`, color: 'text-purple-600', bgColor: 'bg-purple-50' },
        { id: 'convert-players', label: 'تحويل اللاعبين التابعين', icon: User, href: `/dashboard/admin/convert-dependent-players`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'employees', label: 'الموظفين', icon: User, href: `/dashboard/admin/employees`, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { id: 'reports', label: 'التقارير', icon: FileText, href: `/dashboard/admin/reports`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'payments', label: 'المدفوعات', icon: Target, href: `/dashboard/admin/payments`, color: 'text-green-600', bgColor: 'bg-green-50' },
        { id: 'subscriptions', label: 'الاشتراكات', icon: Star, href: `/dashboard/admin/subscriptions`, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { id: 'support', label: 'الدعم الفني', icon: Shield, href: `/dashboard/admin/support`, color: 'text-red-600', bgColor: 'bg-red-50' },
        { id: 'system', label: 'النظام', icon: Settings, href: `/dashboard/admin/system`, color: 'text-slate-600', bgColor: 'bg-slate-50' },
        { id: 'email-migration', label: 'ترحيل البريد الإلكتروني', icon: Globe, href: `/dashboard/admin/email-migration`, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'dream-academy-categories', label: 'فئات الأكاديمية (ديناميكي)', icon: GraduationCap, href: `/dashboard/admin/dream-academy/categories`, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
        { id: 'dream-academy', label: 'أكاديمية الحلم', icon: GraduationCap, href: `/dashboard/dream-academy`, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { id: 'referrals', label: 'الإحالات والمكافآت', icon: Users, href: `/dashboard/admin/referrals`, color: 'text-pink-600', bgColor: 'bg-pink-50' },
      ]
    };
    
    return [...baseItems, ...(accountSpecificItems[accountType as keyof typeof accountSpecificItems] || accountSpecificItems.player)];
  };

  const menuItems = getMenuItems();

  const handleNavigation = (href: string, id: string) => {
    // Guard: prevent cross-account-type navigation
    const target = href.replace(/\/+$/, '');
    const currentRoot = `/dashboard/${accountType}`;
    if (!target.startsWith(currentRoot) && !target.startsWith('/dashboard/dream-academy')) {
      // force navigation to the same account root if mismatch
      router.push(currentRoot);
      setActiveItem('dashboard');
      return;
    }
    setActiveItem(id);
    router.push(target);
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      await logout();
      router.push('/');
    }
  };

  return (
    <motion.div
      initial={{ width: collapsed ? 80 : 280 }}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed right-0 top-0 h-full bg-gradient-to-b ${accountInfo.bgGradient} backdrop-blur-xl border-l border-white/20 shadow-2xl z-40 flex flex-col max-w-full`}
    >
      {/* Header Section */}
      <div className="p-4 sm:p-6 border-b border-white/20">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <div className={`p-2 sm:p-3 bg-gradient-to-br ${accountInfo.gradient} rounded-xl shadow-lg`}>
                {(() => { const IconCmp = accountInfo.icon; return <IconCmp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />; })()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">El7lm</h2>
                <p className="text-sm text-slate-600">Platform</p>
              </div>
            </motion.div>
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
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-white/50 shadow-lg">
              <AvatarImage src={getUserAvatar() || '/default-avatar.png'} alt={getUserDisplayName()} />
              <AvatarFallback className={`bg-gradient-to-br ${accountInfo.gradient} text-white font-bold`}>
                {getUserDisplayName().slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br ${accountInfo.gradient} rounded-full border-2 border-white flex items-center justify-center text-sm`}>
              {accountInfo.emoji}
            </div>
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 min-w-0"
              >
                <div className="font-semibold text-slate-800 truncate">
                  {getUserDisplayName()}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className={`bg-gradient-to-r ${accountInfo.gradient} text-white border-0 text-xs px-2 py-1`}>
                    {accountInfo.label}
                  </Badge>
                </div>
                <div className="text-xs text-slate-600 truncate mt-1">
                  {user?.email}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-2 sm:py-4">
        <nav className="space-y-2 px-2 sm:px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.href, item.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                  ${isActive 
                    ? `bg-white/80 ${item.color} shadow-lg ring-1 ring-white/30` 
                    : 'hover:bg-white/60 text-slate-700 hover:text-slate-900'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-all duration-300
                  ${isActive 
                    ? `${item.bgColor} ${item.color}` 
                    : 'bg-white/30 group-hover:bg-white/60'
                  }
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className="p-4 border-t border-white/20">
        <motion.button
          onClick={handleLogout}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 transition-all duration-300 group"
        >
          <div className="p-2 rounded-lg bg-red-50 group-hover:bg-red-100 transition-all duration-300">
            <LogOut className="w-5 h-5" />
          </div>
          
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-medium text-sm"
              >
                تسجيل الخروج
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-center"
          >
            <div className="text-xs text-slate-500">
              منصة الأحلام الرياضية
            </div>
            <div className="text-xs text-slate-400 mt-1">
              v2.0.0
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ModernEnhancedSidebar; 

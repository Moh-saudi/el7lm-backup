'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  Home,
  User,
  FileText,
  Video,
  Search,
  BarChart3,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  Star,
  Trophy,
  Users,
  UserPlus,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe,
  Shield,
  Target,
  TrendingUp
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useMobileSidebar } from './MobileSidebarManager';

interface EnhancedSidebarProps {
  accountType?: string;
}

export default function EnhancedSidebar({ accountType = 'player' }: EnhancedSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, isMobileOpen, setIsCollapsed, closeMobileSidebar } = useSidebar();
  const { isMobileSidebarOpen, toggleMobileSidebar } = useMobileSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // كشف نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // معلومات الحساب حسب النوع
  const getAccountInfo = () => {
    const accountConfigs = {
      player: {
        title: 'اللاعب',
        subtitle: 'لوحة التحكم',
        bgGradient: 'from-blue-600 to-blue-800',
        icon: User,
        color: 'text-blue-400'
      },
      parent: {
        title: 'ولي الأمر',
        subtitle: 'إدارة الأبناء',
        bgGradient: 'from-green-600 to-green-800',
        icon: Users,
        color: 'text-green-400'
      },
      coach: {
        title: 'المدرب',
        subtitle: 'إدارة الفريق',
        bgGradient: 'from-purple-600 to-purple-800',
        icon: Target,
        color: 'text-purple-400'
      },
      club: {
        title: 'النادي',
        subtitle: 'إدارة النادي',
        bgGradient: 'from-red-600 to-red-800',
        icon: Trophy,
        color: 'text-red-400'
      },
      academy: {
        title: 'الأكاديمية',
        subtitle: 'إدارة الأكاديمية',
        bgGradient: 'from-indigo-600 to-indigo-800',
        icon: Star,
        color: 'text-indigo-400'
      },
      agent: {
        title: 'الوكيل',
        subtitle: 'إدارة اللاعبين',
        bgGradient: 'from-orange-600 to-orange-800',
        icon: TrendingUp,
        color: 'text-orange-400'
      },
      admin: {
        title: 'المدير',
        subtitle: 'إدارة النظام',
        bgGradient: 'from-gray-600 to-gray-800',
        icon: Shield,
        color: 'text-gray-400'
      }
    };

    return accountConfigs[accountType as keyof typeof accountConfigs] || accountConfigs.player;
  };

  const accountInfo = getAccountInfo();

  // القوائم حسب نوع الحساب
  const getMenuItems = () => {
    const baseItems = [
      {
        title: 'الرئيسية',
        icon: Home,
        href: '/dashboard',
        color: 'text-blue-400'
      }
    ];

    const accountSpecificItems = {
      player: [
        {
          title: 'الملف الشخصي',
          icon: User,
          href: '/dashboard/player/profile',
          color: 'text-green-400'
        },
        {
          title: 'التقارير',
          icon: FileText,
          href: '/dashboard/player/reports',
          color: 'text-purple-400'
        },
        {
          title: 'البحث عن الفرص',
          icon: Search,
          href: '/dashboard/player/search',
          color: 'text-orange-400'
        },
        {
          title: 'الرسائل',
          icon: MessageSquare,
          href: '/dashboard/player/messages',
          color: 'text-pink-400'
        },
        {
          title: 'الفيديوهات',
          icon: Video,
          href: '/dashboard/player/videos',
          color: 'text-red-400'
        },
        {
          title: 'الإحصائيات',
          icon: BarChart3,
          href: '/dashboard/player/stats',
          color: 'text-indigo-400'
        }
      ],
      parent: [
        {
          title: 'الأبناء',
          icon: Users,
          href: '/dashboard/parent/children',
          color: 'text-green-400'
        },
        {
          title: 'التقارير',
          icon: FileText,
          href: '/dashboard/parent/reports',
          color: 'text-purple-400'
        },
        {
          title: 'الرسائل',
          icon: MessageSquare,
          href: '/dashboard/parent/messages',
          color: 'text-pink-400'
        }
      ],
      coach: [
        {
          title: 'الفريق',
          icon: Users,
          href: '/dashboard/coach/team',
          color: 'text-green-400'
        },
        {
          title: 'التدريبات',
          icon: Target,
          href: '/dashboard/coach/training',
          color: 'text-blue-400'
        },
        {
          title: 'المباريات',
          icon: Trophy,
          href: '/dashboard/coach/matches',
          color: 'text-purple-400'
        },
        {
          title: 'التقارير',
          icon: FileText,
          href: '/dashboard/coach/reports',
          color: 'text-orange-400'
        }
      ],
      club: [
        {
          title: 'اللاعبين',
          icon: Users,
          href: '/dashboard/club/players',
          color: 'text-green-400'
        },
        {
          title: 'الإحالات',
          icon: UserPlus,
          href: '/dashboard/club/referrals',
          color: 'text-purple-400'
        },
        {
          title: 'المباريات',
          icon: Trophy,
          href: '/dashboard/club/matches',
          color: 'text-purple-400'
        },
        {
          title: 'التقارير',
          icon: FileText,
          href: '/dashboard/club/reports',
          color: 'text-orange-400'
        },
        {
          title: 'الإحصائيات',
          icon: BarChart3,
          href: '/dashboard/club/stats',
          color: 'text-indigo-400'
        }
      ],
      academy: [
        {
          title: 'الطلاب',
          icon: Users,
          href: '/dashboard/academy/students',
          color: 'text-green-400'
        },
        {
          title: 'البرامج',
          icon: Target,
          href: '/dashboard/academy/programs',
          color: 'text-blue-400'
        },
        {
          title: 'التقارير',
          icon: FileText,
          href: '/dashboard/academy/reports',
          color: 'text-purple-400'
        }
      ],
      agent: [
        {
          title: 'اللاعبين',
          icon: Users,
          href: '/dashboard/agent/players',
          color: 'text-green-400'
        },
        {
          title: 'العقود',
          icon: FileText,
          href: '/dashboard/agent/contracts',
          color: 'text-purple-400'
        },
        {
          title: 'الفرص',
          icon: TrendingUp,
          href: '/dashboard/agent/opportunities',
          color: 'text-orange-400'
        }
      ],
      admin: [
        {
          title: 'المستخدمين',
          icon: Users,
          href: '/dashboard/admin/users',
          color: 'text-green-400'
        },
        {
          title: 'النظام',
          icon: Settings,
          href: '/dashboard/admin/system',
          color: 'text-purple-400'
        },
        {
          title: 'التقارير',
          icon: FileText,
          href: '/dashboard/admin/reports',
          color: 'text-orange-400'
        },
        {
          title: 'Clarity Analytics',
          icon: BarChart3,
          href: '/dashboard/admin/clarity',
          color: 'text-indigo-400'
        }
      ]
    };

    return [...baseItems, ...(accountSpecificItems[accountType as keyof typeof accountSpecificItems] || [])];
  };

  const menuItems = getMenuItems();

  // إغلاق القائمة الجانبية في الموبايل
  const handleItemClick = (href: string) => {
    if (isMobile) {
      closeMobileSidebar();
    }
    router.push(href);
  };

  // إظهار القائمة الجانبية فقط إذا كانت مفتوحة أو في الديسكتوب/التابلت
  if (isMobile && !isMobileOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay للموبايل */}
      {isMobile && isMobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/50 z-30"
        />
      )}
      
      <motion.div
        initial={{ x: isMobile ? '100%' : 0 }}
        animate={{ 
          x: isMobile ? (isMobileOpen ? 0 : '100%') : 0 
        }}
        exit={{ x: isMobile ? '100%' : 0 }}
        className={`fixed top-16 bottom-20 right-0 bg-gradient-to-br from-[#1e40af] via-[#2563eb] to-[#3b82f6] z-40 shadow-2xl backdrop-blur-sm border-l border-white/10 transition-all duration-300 ease-in-out ${
          // تصميم متجاوب للقائمة الجانبية
          isMobile ? 'w-80' : // في الموبايل عرض كامل
          isTablet ? (isCollapsed ? 'w-16' : 'w-64') : // في التابلت
          isCollapsed ? 'w-20' : 'w-64' // في الديسكتوب
        }`}
        data-sidebar
      >
        {/* أزرار التحكم - تصميم عصري */}
        <div className="flex justify-between items-center p-4 bg-white/5 backdrop-blur-sm">
          {/* زر إغلاق للموبايل */}
          {isMobile && (
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={closeMobileSidebar}
              className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 touch-target"
            >
              <X size={18} />
            </motion.button>
          )}
          
          {/* زر التطويق/التوسع */}
          {!isMobile && (
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-3 bg-white/10 rounded-xl text-white hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 touch-target"
            >
              {isCollapsed ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </motion.button>
          )}
        </div>

        {/* معلومات الحساب */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20`}>
              <accountInfo.icon className={`w-5 h-5 md:w-6 md:h-6 ${accountInfo.color}`} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-white truncate">
                  {accountInfo.title}
                </h3>
                <p className="text-xs md:text-sm text-white/70 truncate">
                  {accountInfo.subtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* القائمة الرئيسية */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-4">
            {menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  onClick={() => handleItemClick(item.href)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 touch-target ${
                    pathname === item.href ? 'bg-white/20 border-white/30' : ''
                  }`}
                >
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-all duration-200`}>
                    <item.icon className={`w-4 h-4 md:w-5 md:h-5 ${item.color}`} />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm md:text-base font-medium text-white group-hover:text-white/90 transition-colors">
                      {item.title}
                    </span>
                  )}
                </button>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* القائمة السفلية */}
        <div className="p-4 border-t border-white/10">
          <div className="space-y-2">
            {/* الإشعارات */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 touch-target"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-all duration-200 relative">
                <Bell className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </div>
              {!isCollapsed && (
                <span className="text-sm md:text-base font-medium text-white group-hover:text-white/90 transition-colors">
                  الإشعارات
                </span>
              )}
            </motion.button>

            {/* الإعدادات */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick('/dashboard/settings')}
              className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 touch-target"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-all duration-200">
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              </div>
              {!isCollapsed && (
                <span className="text-sm md:text-base font-medium text-white group-hover:text-white/90 transition-colors">
                  الإعدادات
                </span>
              )}
            </motion.button>

            {/* تسجيل الخروج */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // إضافة منطق تسجيل الخروج هنا
                router.push('/auth/login');
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group hover:bg-red-500/20 backdrop-blur-sm border border-transparent hover:border-red-500/30 touch-target"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-red-500/20 group-hover:bg-red-500/30 transition-all duration-200">
                <LogOut className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              </div>
              {!isCollapsed && (
                <span className="text-sm md:text-base font-medium text-white group-hover:text-red-300 transition-colors">
                  تسجيل الخروج
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
} 

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Home,
  User,
  MessageSquare,
  FileText,
  Search,
  Video,
  BarChart3,
  CreditCard,
  CheckCircle,
  LogOut,
  Bell,
  Users,
  ShoppingCart,
  BookOpen,
  Upload,
  Play
} from 'lucide-react';
import InteractionNotifications from '@/components/notifications/InteractionNotifications';

interface PlayerSidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const PlayerSidebar: React.FC<PlayerSidebarProps> = ({ collapsed, setCollapsed }) => {
  const pathname = usePathname();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;

  const menuItems = [
    {
      title: 'الرئيسية',
      href: '/dashboard/player',
      icon: Home,
      description: 'لوحة تحكم اللاعب'
    },
    {
      title: 'الملف الشخصي',
      href: '/dashboard/player/profile',
      icon: User,
      description: 'إدارة معلوماتك الشخصية'
    },
    {
      title: 'التقارير',
      href: '/dashboard/player/reports',
      icon: FileText,
      description: 'عرض تقارير الأداء والتقدم'
    },
    {
      title: 'الإحالات والجوائز',
      href: '/dashboard/player/referrals',
      icon: Users,
      description: 'إدارة الإحالات والجوائز'
    },
    {
      title: 'متجر المنتجات',
      href: '/dashboard/player/store',
      icon: ShoppingCart,
      description: 'تصفح وشراء المنتجات'
    },
    {
      title: 'أكاديمية الحلم',
      href: '/dashboard/player/academy',
      icon: BookOpen,
      description: 'الوصول لأكاديمية الحلم'
    },
    {
      title: 'إدارة الفيديوهات',
      href: '/dashboard/player/videos',
      icon: Video,
      description: 'رفع وإدارة الفيديوهات'
    },
    {
      title: 'رفع الفيديوهات',
      href: '/dashboard/player/videos/upload',
      icon: Upload,
      description: 'رفع فيديوهات جديدة'
    },
    {
      title: 'فيديوهات اللاعبين',
      href: '/dashboard/player/player-videos',
      icon: Play,
      description: 'مشاهدة فيديوهات اللاعبين'
    },
    {
      title: 'البحث عن الفرص والأندية والأكاديميات',
      href: '/dashboard/player/search',
      icon: Search,
      description: 'البحث عن فرص جديدة'
    },
    {
      title: 'البحث عن لاعبين',
      href: '/dashboard/player/search-players',
      icon: Users,
      description: 'البحث عن لاعبين آخرين'
    },
    {
      title: 'فيديوهات اللاعبين المشتركة',
      href: '/dashboard/player/shared-videos',
      icon: Play,
      description: 'مشاهدة فيديوهات اللاعبين'
    },
    {
      title: 'الإحصائيات',
      href: '/dashboard/player/stats',
      icon: BarChart3,
      description: 'عرض الإحصائيات والأداء'
    },
    {
      title: 'الرسائل',
      href: '/dashboard/messages',
      icon: MessageSquare,
      description: 'إدارة المحادثات والرسائل'
    },
    {
      title: 'إدارة الاشتراكات',
      href: '/dashboard/player/bulk-payment',
      icon: CreditCard,
      description: 'إدارة اشتراكاتك'
    },
    {
      title: 'حالة الاشتراك',
      href: '/dashboard/subscription',
      icon: CheckCircle,
      description: 'عرض حالة اشتراكك'
    },
    {
      title: 'الإشعارات',
      href: `/dashboard/${userData?.accountType || 'player'}/notifications`,
      icon: Bell,
      description: 'عرض جميع الإشعارات'
    }
  ];

  return (
    <div className={cn(
      "fixed top-16 right-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-30",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900">El7lm</h2>
                  <p className="text-xs text-gray-500">KUWAIT CLUB</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              {!collapsed && <InteractionNotifications />}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
              >
                <div className="w-4 h-4 flex flex-col justify-center items-center">
                  <div className="w-3 h-0.5 bg-gray-600 mb-0.5"></div>
                  <div className="w-3 h-0.5 bg-gray-600 mb-0.5"></div>
                  <div className="w-3 h-0.5 bg-gray-600"></div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive 
                        ? "bg-blue-100 text-blue-700" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && (
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/auth/logout"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span>تسجيل الخروج</span>}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PlayerSidebar; 

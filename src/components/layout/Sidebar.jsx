'use client';

import { auth } from '@/lib/firebase/config';
import {
  BarChart,
  ChevronRight,
  ChevronLeft,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Search,
  User,
  Menu,
  X,
  VideoIcon,
  Users,
  Megaphone,
  BarChart3,
  DollarSign,
  Handshake,
  Star,
  Bell,
  MessageSquare,
  KeyRound,
  Play,
  GraduationCap,
  Package,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/lib/context/SidebarContext';
import { useAuth } from '@/lib/firebase/auth-provider';

const Sidebar = () => {
  const { user, userData } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggleSidebar } = useSidebar();
  const t = (key) => key; // دالة بسيطة لإرجاع النص كما هو
  const direction = 'rtl';

  // قائمة اللاعب مع الترجمة
  const playerMenuItems = [
    {
      title: 'sidebar.player.home',
      icon: <Home className="w-5 h-5" />,
      path: '/dashboard/player'
    },
    {
      title: 'sidebar.player.profile',
      icon: <User className="w-5 h-5" />,
      path: '/dashboard/player/profile'
    },
    {
      title: 'sidebar.player.reports',
      icon: <FileText className="w-5 h-5" />,
      path: '/dashboard/player/reports'
    },
    {
      title: 'sidebar.player.referrals',
      icon: <Users className="w-5 h-5" />,
      path: '/dashboard/player/referrals'
    },
    {
      title: 'sidebar.player.store',
      icon: <DollarSign className="w-5 h-5" />,
      path: '/dashboard/player/store'
    },
    {
      title: 'sidebar.player.academy',
      icon: <Star className="w-5 h-5" />,
      path: '/dashboard/player/academy'
    },
    {
      title: 'sidebar.player.videos',
      icon: <VideoIcon className="w-5 h-5" />,
      path: '/dashboard/player/videos'
    },
    {
      title: 'sidebar.player.uploadVideos',
      icon: <VideoIcon className="w-5 h-5" />,
      path: '/dashboard/player/videos/upload'
    },
    {
      title: 'sidebar.player.playerVideos',
      icon: <Play className="w-5 h-5" />,
      path: '/dashboard/player/player-videos'
    },
    {
      title: 'sidebar.player.search',
      icon: <Search className="w-5 h-5" />,
      path: '/dashboard/player/search'
    },
    {
      title: 'sidebar.player.stats',
      icon: <BarChart className="w-5 h-5" />,
      path: '/dashboard/player/stats'
    },
    {
      title: 'sidebar.common.messages',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    },
    {
      title: 'sidebar.player.subscriptions',
      icon: <CreditCard className="w-5 h-5" />,
      path: '/dashboard/player/bulk-payment'
    },
    {
      title: 'sidebar.player.subscriptionStatus',
      icon: <Clock className="w-5 h-5" />,
      path: '/dashboard/subscription'
    },
    {
      title: 'sidebar.player.notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/dashboard/player/notifications'
    }
  ];

  // قائمة النادي مع الترجمة
  const clubMenuItems = [
      {
        title: 'sidebar.club.home',
        icon: <Home className="w-5 h-5" />,
        path: '/dashboard/club'
      },
      {
        title: 'sidebar.club.profile',
        icon: <User className="w-5 h-5" />,
        path: '/dashboard/club/profile'
      },
    {
      title: 'sidebar.club.searchPlayers',
      icon: <Search className="w-5 h-5" />, 
      path: '/dashboard/club/search'
      },
      {
        title: 'sidebar.club.players',
        icon: <Users className="w-5 h-5" />,
        path: '/dashboard/club/players'
      },
    {
      title: 'sidebar.club.videos',
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/club/videos'
      },
      {
        title: 'sidebar.club.playerVideos',
      icon: <Play className="w-5 h-5" />, 
        path: '/dashboard/club/player-videos'
      },
      {
      title: 'sidebar.club.stats',
        icon: <BarChart3 className="w-5 h-5" />,
      path: '/dashboard/club/stats'
      },
      {
      title: 'sidebar.club.finances',
        icon: <DollarSign className="w-5 h-5" />,
      path: '/dashboard/club/finances'
      },
      {
        title: 'sidebar.player.referrals',
        icon: <Users className="w-5 h-5" />,
        path: '/dashboard/club/referrals'
      },
          {
      title: 'sidebar.common.messages',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    },
    {
      title: 'sidebar.player.notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/dashboard/club/notifications'
    }
  ];

  // قائمة الوكيل مع الترجمة
  const agentMenuItems = [
      {
        title: 'sidebar.agent.home',
        icon: <Home className="w-5 h-5" />,
        path: '/dashboard/agent'
      },
      {
        title: 'sidebar.agent.profile',
        icon: <User className="w-5 h-5" />,
        path: '/dashboard/agent/profile'
      },
      {
        title: 'sidebar.agent.players',
        icon: <Users className="w-5 h-5" />,
        path: '/dashboard/agent/players'
      },
    {
      title: 'sidebar.agent.clubs',
      icon: <Handshake className="w-5 h-5" />, 
      path: '/dashboard/agent/clubs'
      },
      {
        title: 'sidebar.agent.negotiations',
      icon: <MessageSquare className="w-5 h-5" />, 
        path: '/dashboard/agent/negotiations'
      },
      {
      title: 'sidebar.agent.contracts',
      icon: <FileText className="w-5 h-5" />, 
      path: '/dashboard/agent/contracts'
    },
    {
      title: 'sidebar.agent.commissions',
      icon: <DollarSign className="w-5 h-5" />, 
      path: '/dashboard/agent/commissions'
    },
    {
      title: 'sidebar.agent.stats',
      icon: <BarChart3 className="w-5 h-5" />, 
      path: '/dashboard/agent/stats'
    },
    {
      title: 'sidebar.player.referrals',
      icon: <Users className="w-5 h-5" />,
      path: '/dashboard/agent/referrals'
    },
    {
      title: 'sidebar.common.messages',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    },
    {
      title: 'sidebar.player.notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/dashboard/agent/notifications'
    }
  ];

  // قائمة الأكاديمية مع الترجمة
  const academyMenuItems = [
    {
      title: 'sidebar.academy.home',
      icon: <Home className="w-5 h-5" />, 
      path: '/dashboard/academy'
    },
    {
      title: 'sidebar.academy.profile',
      icon: <User className="w-5 h-5" />, 
      path: '/dashboard/academy/profile'
    },
    {
      title: 'sidebar.academy.students',
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/academy/students'
    },
    {
      title: 'sidebar.academy.courses',
        icon: <FileText className="w-5 h-5" />,
      path: '/dashboard/academy/courses'
    },
    {
      title: 'sidebar.academy.videos',
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/academy/videos'
    },
    {
      title: 'sidebar.academy.trainers',
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/academy/trainers'
    },
    {
      title: 'sidebar.academy.stats',
      icon: <BarChart3 className="w-5 h-5" />, 
      path: '/dashboard/academy/stats'
    },
    {
      title: 'sidebar.academy.finances',
      icon: <DollarSign className="w-5 h-5" />, 
      path: '/dashboard/academy/finances'
    },
    {
      title: 'sidebar.player.referrals',
      icon: <Users className="w-5 h-5" />,
      path: '/dashboard/academy/referrals'
    },
    {
      title: 'sidebar.common.messages',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    },
    {
      title: 'sidebar.player.notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/dashboard/academy/notifications'
    }
  ];

  // قائمة المدرب مع الترجمة
  const trainerMenuItems = [
    {
      title: 'sidebar.trainer.home',
      icon: <Home className="w-5 h-5" />, 
      path: '/dashboard/trainer'
    },
    {
      title: 'sidebar.trainer.profile',
      icon: <User className="w-5 h-5" />, 
      path: '/dashboard/trainer/profile'
    },
    {
      title: 'sidebar.trainer.sessions',
      icon: <Clock className="w-5 h-5" />, 
      path: '/dashboard/trainer/sessions'
    },
    {
      title: 'sidebar.trainer.players',
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/trainer/players'
    },
    {
      title: 'sidebar.trainer.videos',
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/trainer/videos'
    },
    {
      title: 'sidebar.trainer.programs',
      icon: <FileText className="w-5 h-5" />, 
      path: '/dashboard/trainer/programs'
    },
    {
      title: 'sidebar.trainer.stats',
      icon: <BarChart3 className="w-5 h-5" />, 
      path: '/dashboard/trainer/stats'
    },
    {
      title: 'sidebar.player.referrals',
      icon: <Users className="w-5 h-5" />,
      path: '/dashboard/trainer/referrals'
    },
    {
      title: 'sidebar.common.messages',
      icon: <MessageSquare className="w-5 h-5" />,
      path: '/dashboard/messages'
    },
    {
      title: 'sidebar.player.notifications',
      icon: <Bell className="w-5 h-5" />,
      path: '/dashboard/trainer/notifications'
    }
  ];

  // قائمة المسوق مع الترجمة
  const marketerMenuItems = [
    {
      title: 'sidebar.marketer.home',
      icon: <Home className="w-5 h-5" />, 
      path: '/dashboard/marketer'
    },
    {
      title: 'sidebar.marketer.profile',
      icon: <User className="w-5 h-5" />, 
      path: '/dashboard/marketer/profile'
    },
    {
      title: 'sidebar.marketer.players',
      icon: <Users className="w-5 h-5" />, 
      path: '/dashboard/marketer/players'
    },
    {
      title: 'sidebar.marketer.search',
      icon: <Search className="w-5 h-5" />, 
      path: '/dashboard/marketer/search'
    },
    {
      title: 'sidebar.marketer.videos',
      icon: <VideoIcon className="w-5 h-5" />, 
      path: '/dashboard/marketer/videos'
    },
    {
      title: 'sidebar.marketer.dreamAcademy',
      icon: <GraduationCap className="w-5 h-5" />, 
      path: '/dashboard/marketer/dream-academy'
    },
    {
      title: 'sidebar.marketer.payment',
      icon: <CreditCard className="w-5 h-5" />, 
      path: '/dashboard/marketer/payment'
    },
    {
      title: 'sidebar.marketer.subscription',
      icon: <Package className="w-5 h-5" />, 
      path: '/dashboard/marketer/subscription'
    },
    {
      title: 'sidebar.marketer.notifications',
      icon: <Bell className="w-5 h-5" />, 
      path: '/dashboard/marketer/notifications'
    },
    {
      title: 'sidebar.marketer.subscriptionStatus',
      icon: <CheckCircle className="w-5 h-5" />, 
      path: '/dashboard/marketer/subscription-status'
    },
    {
      title: 'sidebar.marketer.billing',
      icon: <DollarSign className="w-5 h-5" />, 
      path: '/dashboard/marketer/billing'
    },
    {
      title: 'sidebar.marketer.messages',
      icon: <MessageSquare className="w-5 h-5" />, 
      path: '/dashboard/marketer/messages'
    }
  ];

  // تحديد القائمة المناسبة حسب نوع الحساب
  const getMenuItems = () => {
    if (!user) return playerMenuItems;
    
    // استخدام userData إذا كان متاحاً
    const accountType = userData?.accountType || 'player';
    
    switch (accountType) {
      case 'club':
        return clubMenuItems;
      case 'agent':
        return agentMenuItems;
      case 'academy':
        return academyMenuItems;
      case 'trainer':
        return trainerMenuItems;
      case 'marketer':
        return marketerMenuItems; // استخدام قائمة المسوق المخصصة
      case 'parent':
        return playerMenuItems; // استخدام قائمة اللاعب للوالد
      default:
        return playerMenuItems;
    }
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ 
          x: isOpen ? 0 : '-100%',
          rtl: { x: isOpen ? 0 : '100%' }
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-16 bottom-0 right-0 rtl:left-0 w-64 bg-gradient-to-b from-[#2563eb] to-[#1e3a8a] z-30 shadow-xl`}
        dir={direction}
        style={{ bottom: '4rem' }} // إضافة مساحة للفوتر
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-400">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">E</span>
              </div>
              <span className="text-white font-bold text-lg">El7lm</span>
            </div>
        <button
          onClick={toggleSidebar}
              className="text-white hover:text-blue-200 transition-colors md:hidden"
            >
              <X className="w-6 h-6" />
        </button>
        </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-2 px-4">
              {menuItems.map((item, index) => {
            const isActive = pathname === item.path;
            return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                      className={`flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-blue-600 hover:bg-opacity-20'
                      }`}
                    >
                      <div className={`transition-colors ${
                        isActive ? 'text-blue-600' : 'text-blue-200 group-hover:text-white'
                      }`}>
                      {item.icon}
                  </div>
                      <span className="font-medium">{t(item.title)}</span>
                      {isActive && (
                      <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 rtl:right-0 w-1 h-8 bg-white rounded-r-full rtl:rounded-l-full"
                        />
                      )}
                </Link>
                  </motion.li>
            );
          })}
            </ul>
        </nav>

          {/* Footer */}
          <div className="p-4 border-t border-blue-400">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 rtl:space-x-reverse w-full px-4 py-3 text-white hover:bg-red-600 hover:bg-opacity-20 rounded-lg transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 text-red-300 group-hover:text-red-200" />
              <span className="font-medium">{'sidebar.common.logout'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  Home, 
  User, 
  Users, 
  Search, 
  Video, 
  FileText, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Shield,
  GraduationCap,
  Bell,
  MessageSquare,
  BarChart3,
  DollarSign,
  Handshake,
  Star,
  Clock,
  CreditCard,
  Target,
  Settings,
  Globe,
  Play,
  Award,
  TrendingUp,
  Zap,
  Heart,
  Building,
  Briefcase,
  Crown,
  Menu,
  X,
  UserPlus,
  BookOpen,
  Calendar,
  MapPin,
  Headphones,
  Database,
  HardDrive,
  UserCheck,
  UserCog,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface UnifiedSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  color: string;
  bgColor: string;
}

interface MenuGroup {
  id: string;
  title: string;
  icon: any;
  items: MenuItem[];
  isExpanded?: boolean;
}

const UnifiedSidebar: React.FC<UnifiedSidebarProps> = ({
  isOpen,
  onToggle,
  isMobile = false
}) => {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [activeItem, setActiveItem] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['main']));
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  // تحديد نوع الحساب
  const accountType = userData?.accountType || 'player';

  // كشف حجم الشاشة تلقائياً
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
        setCollapsed(false);
      } else if (width < 1024) {
        setScreenSize('tablet');
        setCollapsed(true); // في التابلت، السايدبار مطوي افتراضياً
      } else {
        setScreenSize('desktop');
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // معلومات أنواع الحسابات
  const ACCOUNT_TYPE_INFO = {
    player: {
      title: 'منصة اللاعب',
      subtitle: 'لاعب',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      emoji: '⚽'
    },
    club: {
      title: 'منصة النادي',
      subtitle: 'نادي',
      icon: Building,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      emoji: '🏢'
    },
    admin: {
      title: 'منصة الإدارة',
      subtitle: 'مدير',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      emoji: '👑'
    },
    agent: {
      title: 'منصة الوكيل',
      subtitle: 'وكيل',
      icon: Briefcase,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      emoji: '💼'
    },
    academy: {
      title: 'منصة الأكاديمية',
      subtitle: 'أكاديمية',
      icon: GraduationCap,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      emoji: '🎓'
    },
    trainer: {
      title: 'منصة المدرب',
      subtitle: 'مدرب',
      icon: Target,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      emoji: '🎯'
    }
  };

  const accountInfo = ACCOUNT_TYPE_INFO[accountType as keyof typeof ACCOUNT_TYPE_INFO] || ACCOUNT_TYPE_INFO.player;
  const IconComponent = accountInfo.icon;

  // تحديد عرض السايدبار حسب حجم الشاشة
  const getSidebarWidth = () => {
    if (isMobile) return 'w-80';
    if (collapsed) {
      if (screenSize === 'tablet') return 'w-16';
      return 'w-20';
    }
    if (screenSize === 'tablet') return 'w-64';
    return 'w-80';
  };

  // تحديد ما إذا كان يجب إظهار النصوص
  const shouldShowText = () => {
    if (isMobile) return true;
    if (screenSize === 'mobile') return false;
    if (screenSize === 'tablet') return !collapsed;
    return !collapsed;
  };

  // الحصول على مجموعات القائمة حسب نوع الحساب
  const getMenuGroups = (): MenuGroup[] => {
    const baseGroup: MenuGroup = {
      id: 'main',
      title: 'القائمة الرئيسية',
      icon: Home,
      items: [
        {
          id: 'dashboard',
          label: t('sidebar.common.home'),
          icon: Home,
          href: `/dashboard/${accountType}`,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        },
        {
          id: 'profile',
          label: t('sidebar.common.profile'),
          icon: User,
          href: `/dashboard/${accountType}/profile`,
          color: 'text-green-600',
          bgColor: 'bg-green-50'
        },
        {
          id: 'messages',
          label: t('sidebar.common.messages'),
          icon: MessageSquare,
          href: `/dashboard/${accountType}/messages`,
          color: 'text-cyan-600',
          bgColor: 'bg-cyan-50'
        }
      ]
    };

    const accountSpecificGroups: { [key: string]: MenuGroup[] } = {
      player: [
        {
          id: 'content',
          title: 'المحتوى والفيديوهات',
          icon: Video,
          items: [
            {
              id: 'videos',
              label: t('sidebar.player.videos'),
              icon: Video,
              href: `/dashboard/player/videos`,
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            },
            {
              id: 'uploadVideos',
              label: t('sidebar.player.uploadVideos'),
              icon: Video,
              href: `/dashboard/player/videos/upload`,
              color: 'text-pink-600',
              bgColor: 'bg-pink-50'
            },
            {
              id: 'playerVideos',
              label: t('sidebar.player.playerVideos'),
              icon: Play,
              href: `/dashboard/player/player-videos`,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50'
            }
          ]
        },
        {
          id: 'discovery',
          title: 'الاكتشاف والبحث',
          icon: Search,
          items: [
            {
              id: 'search',
              label: t('sidebar.player.search'),
              icon: Search,
              href: `/dashboard/player/search`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'academy',
              label: t('sidebar.player.academy'),
              icon: Star,
              href: `/dashboard/player/academy`,
              color: 'text-indigo-600',
              bgColor: 'bg-indigo-50'
            }
          ]
        },
        {
          id: 'management',
          title: 'الإدارة والتقارير',
          icon: FileText,
          items: [
            {
              id: 'reports',
              label: t('sidebar.player.reports'),
              icon: FileText,
              href: `/dashboard/player/reports`,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            },
            {
              id: 'stats',
              label: t('sidebar.player.stats'),
              icon: BarChart3,
              href: `/dashboard/player/stats`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            }
          ]
        },
        {
          id: 'subscription',
          title: 'الاشتراكات والمدفوعات',
          icon: CreditCard,
          items: [
            {
              id: 'subscriptions',
              label: t('sidebar.player.subscriptions'),
              icon: CreditCard,
              href: `/dashboard/player/bulk-payment`,
              color: 'text-violet-600',
              bgColor: 'bg-violet-50'
            },
            {
              id: 'subscriptionStatus',
              label: t('sidebar.player.subscriptionStatus'),
              icon: Clock,
              href: `/dashboard/subscription`,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50'
            },
            {
              id: 'store',
              label: t('sidebar.player.store'),
              icon: DollarSign,
              href: `/dashboard/player/store`,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-50'
            }
          ]
        },
        {
          id: 'rewards',
          title: 'المكافآت والإحالات',
          icon: UserPlus,
          items: [
            {
              id: 'referrals',
              label: t('sidebar.player.referrals'),
              icon: UserPlus,
              href: `/dashboard/player/referrals`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            }
          ]
        },
        {
          id: 'notifications',
          title: 'الإشعارات',
          icon: Bell,
          items: [
            {
              id: 'notifications',
              label: t('sidebar.player.notifications'),
              icon: Bell,
              href: `/dashboard/${userData?.accountType || 'player'}/notifications`,
              color: 'text-rose-600',
              bgColor: 'bg-rose-50'
            }
          ]
        }
      ],
      club: [
        {
          id: 'players',
          title: 'إدارة اللاعبين',
          icon: Users,
          items: [
            {
              id: 'searchPlayers',
              label: t('sidebar.club.searchPlayers'),
              icon: Search,
              href: `/dashboard/club/search`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'players',
              label: t('sidebar.club.players'),
              icon: Users,
              href: `/dashboard/club/players`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            }
          ]
        },
        {
          id: 'content',
          title: 'المحتوى والفيديوهات',
          icon: Video,
          items: [
            {
              id: 'videos',
              label: t('sidebar.club.videos'),
              icon: Video,
              href: `/dashboard/club/videos`,
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            },
            {
              id: 'playerVideos',
              label: t('sidebar.club.playerVideos'),
              icon: Play,
              href: `/dashboard/club/player-videos`,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50'
            }
          ]
        },
        {
          id: 'management',
          title: 'الإدارة والتقارير',
          icon: BarChart3,
          items: [
            {
              id: 'stats',
              label: t('sidebar.club.stats'),
              icon: BarChart3,
              href: `/dashboard/club/stats`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            },
            {
              id: 'finances',
              label: t('sidebar.club.finances'),
              icon: DollarSign,
              href: `/dashboard/club/finances`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ]
        },
        {
          id: 'rewards',
          title: 'المكافآت والإحالات',
          icon: UserPlus,
          items: [
            {
              id: 'referrals',
              label: t('sidebar.player.referrals'),
              icon: UserPlus,
              href: `/dashboard/club/referrals`,
              color: 'text-pink-600',
              bgColor: 'bg-pink-50'
            }
          ]
        }
      ],
      admin: [
        {
          id: 'users',
          title: 'إدارة المستخدمين',
          icon: Users,
          items: [
            {
              id: 'users',
              label: t('sidebar.admin.users'),
              icon: Users,
              href: `/dashboard/admin/users`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              id: 'employees',
              label: 'الموظفين',
              icon: UserCheck,
              href: `/dashboard/admin/employees`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'convertPlayers',
              label: 'تحويل اللاعبين التابعين',
              icon: UserCog,
              href: `/dashboard/admin/convert-dependent-players`,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ]
        },
        {
          id: 'content',
          title: 'إدارة المحتوى',
          icon: FileText,
          items: [
            {
              id: 'notifications',
              label: 'إدارة الإشعارات',
              icon: Bell,
              href: `/dashboard/admin/notifications`,
              color: 'text-cyan-600',
              bgColor: 'bg-cyan-50'
            },
            {
              id: 'careers',
              label: 'طلبات التوظيف',
              icon: FileText,
              href: `/dashboard/admin/careers`,
              color: 'text-indigo-600',
              bgColor: 'bg-indigo-50'
            }
          ]
        },
        {
          id: 'reports',
          title: 'التقارير والإحصائيات',
          icon: BarChart3,
          items: [
            {
              id: 'reports',
              label: t('sidebar.admin.reports'),
              icon: BarChart3,
              href: `/dashboard/admin/reports`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            }
          ]
        },
        {
          id: 'finances',
          title: 'المالية والمدفوعات',
          icon: DollarSign,
          items: [
            {
              id: 'payments',
              label: 'المدفوعات',
              icon: DollarSign,
              href: `/dashboard/admin/payments`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              id: 'subscriptions',
              label: 'الاشتراكات',
              icon: CreditCard,
              href: `/dashboard/admin/subscriptions`,
              color: 'text-yellow-600',
              bgColor: 'bg-yellow-50'
            }
          ]
        },
        {
          id: 'system',
          title: 'النظام والدعم',
          icon: Settings,
          items: [
            {
              id: 'support',
              label: 'الدعم الفني',
              icon: Headphones,
              href: `/dashboard/admin/support`,
              color: 'text-rose-600',
              bgColor: 'bg-rose-50'
            },
            {
              id: 'system',
              label: 'النظام',
              icon: Settings,
              href: `/dashboard/admin/system`,
              color: 'text-gray-600',
              bgColor: 'bg-gray-50'
            },
            {
              id: 'emailMigration',
              label: 'ترحيل البريد الإلكتروني',
              icon: Globe,
              href: `/dashboard/admin/email-migration`,
              color: 'text-violet-600',
              bgColor: 'bg-violet-50'
            }
          ]
        },
        {
          id: 'academy',
          title: 'أكاديمية الحلم',
          icon: GraduationCap,
          items: [
            {
              id: 'dreamAcademyVideos',
              label: 'إدارة أكاديمية الحلم',
              icon: GraduationCap,
              href: `/dashboard/admin/dream-academy/videos`,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50'
            },
            {
              id: 'dreamAcademyCategories',
              label: 'فئات الأكاديمية',
              icon: BookOpen,
              href: `/dashboard/admin/dream-academy/categories`,
              color: 'text-emerald-600',
              bgColor: 'bg-emerald-50'
            },
            {
              id: 'dreamAcademySettings',
              label: 'إعدادات أكاديمية الحلم',
              icon: Settings,
              href: `/dashboard/admin/dream-academy/settings`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            },
            {
              id: 'dreamAcademy',
              label: 'أكاديمية الحلم',
              icon: GraduationCap,
              href: `/dashboard/dream-academy`,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ]
        },
        {
          id: 'rewards',
          title: 'المكافآت والإحالات',
          icon: UserPlus,
          items: [
            {
              id: 'referrals',
              label: 'الإحالات والمكافآت',
              icon: UserPlus,
              href: `/dashboard/admin/referrals`,
              color: 'text-pink-600',
              bgColor: 'bg-pink-50'
            }
          ]
        }
      ],
      agent: [
        {
          id: 'clients',
          title: 'إدارة العملاء',
          icon: Users,
          items: [
            {
              id: 'players',
              label: t('sidebar.agent.players'),
              icon: Users,
              href: `/dashboard/agent/players`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              id: 'clubs',
              label: t('sidebar.agent.clubs'),
              icon: Handshake,
              href: `/dashboard/agent/clubs`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            }
          ]
        },
        {
          id: 'business',
          title: 'الأعمال والعقود',
          icon: FileText,
          items: [
            {
              id: 'negotiations',
              label: t('sidebar.agent.negotiations'),
              icon: MessageSquare,
              href: `/dashboard/agent/negotiations`,
              color: 'text-cyan-600',
              bgColor: 'bg-cyan-50'
            },
            {
              id: 'contracts',
              label: t('sidebar.agent.contracts'),
              icon: FileText,
              href: `/dashboard/agent/contracts`,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ]
        },
        {
          id: 'finances',
          title: 'المالية والعمولات',
          icon: DollarSign,
          items: [
            {
              id: 'commissions',
              label: t('sidebar.agent.commissions'),
              icon: DollarSign,
              href: `/dashboard/agent/commissions`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            },
            {
              id: 'stats',
              label: t('sidebar.agent.stats'),
              icon: BarChart3,
              href: `/dashboard/agent/stats`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            }
          ]
        },
        {
          id: 'rewards',
          title: 'المكافآت والإحالات',
          icon: UserPlus,
          items: [
            {
              id: 'referrals',
              label: t('sidebar.player.referrals'),
              icon: UserPlus,
              href: `/dashboard/agent/referrals`,
              color: 'text-pink-600',
              bgColor: 'bg-pink-50'
            }
          ]
        }
      ],
      academy: [
        {
          id: 'students',
          title: 'إدارة الطلاب',
          icon: Users,
          items: [
            {
              id: 'students',
              label: t('sidebar.academy.students'),
              icon: Users,
              href: `/dashboard/academy/students`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            },
            {
              id: 'trainers',
              label: t('sidebar.academy.trainers'),
              icon: Users,
              href: `/dashboard/academy/trainers`,
              color: 'text-cyan-600',
              bgColor: 'bg-cyan-50'
            }
          ]
        },
        {
          id: 'content',
          title: 'المحتوى والدورات',
          icon: FileText,
          items: [
            {
              id: 'courses',
              label: t('sidebar.academy.courses'),
              icon: FileText,
              href: `/dashboard/academy/courses`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'videos',
              label: t('sidebar.academy.videos'),
              icon: Video,
              href: `/dashboard/academy/videos`,
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            }
          ]
        },
        {
          id: 'management',
          title: 'الإدارة والتقارير',
          icon: BarChart3,
          items: [
            {
              id: 'stats',
              label: t('sidebar.academy.stats'),
              icon: BarChart3,
              href: `/dashboard/academy/stats`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            },
            {
              id: 'finances',
              label: t('sidebar.academy.finances'),
              icon: DollarSign,
              href: `/dashboard/academy/finances`,
              color: 'text-green-600',
              bgColor: 'bg-green-50'
            }
          ]
        },
        {
          id: 'rewards',
          title: 'المكافآت والإحالات',
          icon: UserPlus,
          items: [
            {
              id: 'referrals',
              label: t('sidebar.player.referrals'),
              icon: UserPlus,
              href: `/dashboard/academy/referrals`,
              color: 'text-pink-600',
              bgColor: 'bg-pink-50'
            }
          ]
        }
      ],
      trainer: [
        {
          id: 'sessions',
          title: 'الجلسات واللاعبين',
          icon: Clock,
          items: [
            {
              id: 'sessions',
              label: t('sidebar.trainer.sessions'),
              icon: Clock,
              href: `/dashboard/trainer/sessions`,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            },
            {
              id: 'players',
              label: t('sidebar.trainer.players'),
              icon: Users,
              href: `/dashboard/trainer/players`,
              color: 'text-purple-600',
              bgColor: 'bg-purple-50'
            }
          ]
        },
        {
          id: 'content',
          title: 'المحتوى والبرامج',
          icon: FileText,
          items: [
            {
              id: 'videos',
              label: t('sidebar.trainer.videos'),
              icon: Video,
              href: `/dashboard/trainer/videos`,
              color: 'text-red-600',
              bgColor: 'bg-red-50'
            },
            {
              id: 'programs',
              label: t('sidebar.trainer.programs'),
              icon: FileText,
              href: `/dashboard/trainer/programs`,
              color: 'text-orange-600',
              bgColor: 'bg-orange-50'
            }
          ]
        },
        {
          id: 'management',
          title: 'الإدارة والتقارير',
          icon: BarChart3,
          items: [
            {
              id: 'stats',
              label: t('sidebar.trainer.stats'),
              icon: BarChart3,
              href: `/dashboard/trainer/stats`,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            }
          ]
        },
        {
          id: 'rewards',
          title: 'المكافآت والإحالات',
          icon: UserPlus,
          items: [
            {
              id: 'referrals',
              label: t('sidebar.player.referrals'),
              icon: UserPlus,
              href: `/dashboard/trainer/referrals`,
              color: 'text-pink-600',
              bgColor: 'bg-pink-50'
            }
          ]
        }
      ]
    };

    return [
      baseGroup,
      ...(accountSpecificGroups[accountType as keyof typeof accountSpecificGroups] || accountSpecificGroups.player)
    ];
  };

  const menuGroups = getMenuGroups();

  // الحصول على صورة المستخدم
  const getUserAvatar = () => {
    if (userData?.photoURL) return userData.photoURL;
    if (userData?.avatar) return userData.avatar;
    if (userData?.profileImage) return userData.profileImage;
    return null;
  };

  const getUserDisplayName = () => {
    return userData?.displayName || userData?.name || user?.displayName || user?.email?.split('@')[0] || 'مستخدم';
  };

  const handleNavigation = (href: string, id: string) => {
    setActiveItem(id);
    router.push(href);
    if (isMobile) {
      onToggle();
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
    if (confirmed) {
      await logout();
      router.push('/');
    }
  };

  const toggleGroup = (groupId: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupId)) {
      newExpandedGroups.delete(groupId);
    } else {
      newExpandedGroups.add(groupId);
    }
    setExpandedGroups(newExpandedGroups);
  };

  // تحديد العنصر النشط
  useEffect(() => {
    for (const group of menuGroups) {
      const currentItem = group.items.find(item => item.href === pathname);
      if (currentItem) {
        setActiveItem(currentItem.id);
        // توسيع المجموعة التي تحتوي على العنصر النشط
        setExpandedGroups(prev => new Set([...prev, group.id]));
        break;
      }
    }
  }, [pathname, menuGroups]);

  const showText = shouldShowText();

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={isMobile ? { x: '100%' } : { width: collapsed ? 80 : 280 }}
        animate={isMobile ? { x: isOpen ? 0 : '100%' } : { width: collapsed ? (screenSize === 'tablet' ? 64 : 80) : (screenSize === 'tablet' ? 256 : 320) }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-0 right-0 h-full bg-gradient-to-b ${accountInfo.color} z-50 shadow-2xl backdrop-blur-xl border-l border-white/20 ${
          isMobile ? 'w-80' : getSidebarWidth()
        }`}
        dir={isRTL}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${accountInfo.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${accountInfo.textColor}`} />
              </div>
              <AnimatePresence>
                {showText && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col"
                  >
                    <h2 className="text-white font-bold text-lg">{accountInfo.title}</h2>
                    <p className="text-white/70 text-sm">{accountInfo.subtitle}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2">
              {!isMobile && screenSize !== 'mobile' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCollapsed(!collapsed)}
                  className="text-white hover:bg-white/20"
                >
                  {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              )}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 ring-2 ring-white/30">
                <AvatarImage src={getUserAvatar() || '/default-avatar.png'} alt={getUserDisplayName()} />
                <AvatarFallback className={`${accountInfo.bgColor} ${accountInfo.textColor} font-bold`}>
                  {getUserDisplayName().slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <AnimatePresence>
                {showText && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 min-w-0"
                  >
                    <h3 className="text-white font-semibold truncate">{getUserDisplayName()}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`${accountInfo.bgColor} ${accountInfo.textColor} border-0`}>
                        {accountInfo.emoji} {accountInfo.subtitle}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="px-4 space-y-2">
              {menuGroups.map((group, groupIndex) => {
                const isGroupExpanded = expandedGroups.has(group.id);
                const GroupIcon = group.icon;
                
                return (
                  <motion.div
                    key={group.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: groupIndex * 0.05 }}
                    className="space-y-1"
                  >
                    {/* Group Header */}
                    <Button
                      variant="ghost"
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full justify-between h-10 px-3 text-white hover:bg-white/20 ${
                        group.id === 'main' ? 'font-semibold' : 'font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <GroupIcon className="w-4 h-4" />
                        <AnimatePresence>
                          {showText && (
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="text-sm"
                            >
                              {group.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                      
                      <AnimatePresence>
                        {showText && (
                          <motion.div
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={{ opacity: 1, rotate: isGroupExpanded ? 180 : 0 }}
                            exit={{ opacity: 0, rotate: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>

                    {/* Group Items */}
                    <AnimatePresence>
                      {isGroupExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="space-y-1 pr-4">
                            {group.items.map((item, itemIndex) => {
                              const isActive = activeItem === item.id;
                              const IconComponent = item.icon;
                              
                              return (
                                <motion.div
                                  key={item.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: itemIndex * 0.05 }}
                                >
                                  <Button
                                    variant="ghost"
                                    onClick={() => handleNavigation(item.href, item.id)}
                                    className={`w-full justify-start gap-3 h-10 px-3 transition-all duration-500 ease-out ${
                                      isActive
                                        ? 'bg-white text-gray-900 shadow-lg'
                                        : 'text-white hover:bg-white/20'
                                    }`}
                                  >
                                    <div className={`p-1.5 rounded-lg transition-colors ${
                                      isActive ? item.bgColor : 'bg-white/10'
                                    }`}>
                                      <IconComponent className={`w-3.5 h-3.5 ${
                                        isActive ? item.color : 'text-white'
                                      }`} />
                                    </div>
                                    
                                    <AnimatePresence>
                                      {showText && (
                                        <motion.span
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: -10 }}
                                          className="text-sm font-medium"
                                        >
                                          {item.label}
                                        </motion.span>
                                      )}
                                    </AnimatePresence>
                                    
                                    {isActive && (
                                      <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                                      />
                                    )}
                                  </Button>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/20">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-3 h-12 px-4 text-white hover:bg-red-600/20 hover:text-red-200"
            >
              <div className="p-2 rounded-lg bg-red-600/20">
                <LogOut className="w-4 h-4 text-red-200" />
              </div>
              
              <AnimatePresence>
                {showText && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium"
                  >
                    {t('sidebar.common.logout')}
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UnifiedSidebar;

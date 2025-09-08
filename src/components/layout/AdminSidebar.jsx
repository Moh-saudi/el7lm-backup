import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  BarChart3,
  Shield,
  UserCheck,
  DollarSign,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
  Briefcase,
  MessageSquare,
  Monitor,
  MapPin,
  Database,
  HardDrive,
  Heart,
  MessageCircle,
  Headphones,
  Settings,
  UserCog,
  Building,
  GraduationCap,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const AdminSidebar = ({ isOpen, adminData, onToggle, isMobile }) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      title: 'لوحة التحكم',
      icon: LayoutDashboard,
      href: '/dashboard/admin',
      color: 'text-blue-600'
    },
    {
      title: 'إدارة المستخدمين',
      icon: Users,
      color: 'text-green-600',
      subItems: [
        { 
          title: 'جميع المستخدمين', 
          href: '/dashboard/admin/users', 
          icon: Users,
          description: 'إدارة جميع المستخدمين في النظام'
        },
        { 
          title: 'الموظفين', 
          href: '/dashboard/admin/employees', 
          icon: Briefcase,
          description: 'إدارة موظفي النظام وصلاحياتهم'
        },
        { 
          title: 'تحويل اللاعبين التابعين', 
          href: '/admin/convert-dependent-players', 
          icon: UserCheck,
          description: 'تحويل اللاعبين التابعين إلى حسابات قابلة لتسجيل الدخول'
        },
        { 
          title: 'اللاعبين', 
          href: '/dashboard/admin/users/players', 
          icon: UserCheck,
          description: 'إدارة حسابات اللاعبين'
        },
        { 
          title: 'الأكاديميات', 
          href: '/dashboard/admin/users/academies', 
          icon: GraduationCap,
          description: 'إدارة حسابات الأكاديميات'
        },
        { 
          title: 'الأندية', 
          href: '/dashboard/admin/users/clubs', 
          icon: Building,
          description: 'إدارة حسابات الأندية'
        },
        { 
          title: 'الوكلاء والمدربين', 
          href: '/dashboard/admin/users/agents', 
          icon: UserCog,
          description: 'إدارة حسابات الوكلاء والمدربين'
        }
      ]
    },
    {
      title: 'المدفوعات والاشتراكات',
      icon: CreditCard,
      color: 'text-purple-600',
      subItems: [
        { title: 'جميع المعاملات', href: '/dashboard/admin/payments', icon: DollarSign },
        { title: 'الدفعات الجماعية', href: '/dashboard/admin/payments/bulk', icon: CreditCard },
        { title: 'الاشتراكات', href: '/dashboard/admin/subscriptions', icon: FileText },
        { title: 'الفواتير', href: '/dashboard/admin/invoices', icon: FileText }
      ]
    },
    {
      title: 'التقارير والإحصائيات',
      icon: BarChart3,
      color: 'text-amber-600',
      subItems: [
        { title: 'التقارير المالية', href: '/dashboard/admin/reports/financial', icon: DollarSign },
        { title: 'إحصائيات المستخدمين', href: '/dashboard/admin/reports/users', icon: Users },
        { title: 'تقارير النشاط', href: '/dashboard/admin/reports/activity', icon: BarChart3 },
        { title: 'Clarity Analytics', href: '/dashboard/admin/clarity', icon: BarChart3 }
      ]
    },
    {
      title: 'المحتوى والوسائط',
      icon: HardDrive,
      color: 'text-rose-600',
      subItems: [
        { title: 'إدارة الملفات', href: '/dashboard/admin/media', icon: HardDrive },
        { title: 'الصور والفيديوهات', href: '/dashboard/admin/media/gallery', icon: FileText }
      ]
    },
    {
      title: 'الرسائل والدعم',
      icon: MessageCircle,
      color: 'text-pink-600',
      subItems: [
        { title: 'الرسائل', href: '/dashboard/admin/messages', icon: MessageSquare },
        { title: 'إدارة الإشعارات', href: '/dashboard/admin/notifications', icon: MessageCircle },
        { title: 'الدعم الفني', href: '/dashboard/admin/support', icon: Headphones },
        { title: 'إدارة العملاء', href: '/dashboard/admin/customer-management', icon: UserPlus }
      ]
    },
    {
      title: 'إعدادات النظام',
      icon: Settings,
      href: '/dashboard/admin/system',
      color: 'text-gray-600'
    }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const isActive = (href) => pathname === href;

  return (
    <div className={`fixed right-0 top-16 bottom-0 bg-white border-l border-gray-200 shadow-lg transition-all duration-300 z-50 flex flex-col ${
      isOpen ? 'w-64' : 'w-20'
    } ${
      isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
    }`}>
      {/* Toggle Button */}
      {!isMobile && (
        <button
          onClick={onToggle}
          className="absolute -left-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-md hover:shadow-lg transition-shadow z-10"
        >
          {isOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {(isOpen || isMobile) && (
            <div>
              <h2 className="font-bold text-gray-800">لوحة الإدارة</h2>
              <p className="text-xs text-gray-500">{adminData?.name || 'مدير النظام'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item, index) => (
          <div key={index} className="mb-2">
            {item.subItems ? (
              <details className="group">
                <summary className={`flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors ${
                  (isOpen || isMobile) ? 'justify-between' : 'justify-center'
                }`}>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    {(isOpen || isMobile) && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </div>
                  {(isOpen || isMobile) && (
                    <ChevronLeft className="w-4 h-4 transform group-open:rotate-90 transition-transform" />
                  )}
                </summary>
                {(isOpen || isMobile) && (
                  <div className="mr-7 mt-1 space-y-1">
                    {item.subItems.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={`flex items-center space-x-2 space-x-reverse p-2 rounded-md text-sm transition-colors ${
                          isActive(subItem.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                        onClick={() => isMobile && onToggle()}
                      >
                        <subItem.icon className="w-4 h-4" />
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </details>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center ${(isOpen || isMobile) ? 'space-x-3 space-x-reverse' : ''} p-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!(isOpen || isMobile) && 'justify-center'}`}
                onClick={() => isMobile && onToggle()}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                {(isOpen || isMobile) && <span className="text-sm font-medium">{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={`w-full ${!(isOpen || isMobile) && 'p-2'}`}
        >
          <LogOut className="w-5 h-5 ml-2" />
          {(isOpen || isMobile) && 'تسجيل الخروج'}
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;

import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const AdminHeader = ({ adminData, onMenuToggle, sidebarOpen, isMobile }) => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-30">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Right Section */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Menu Toggle - للجوال أو لتبديل الشريط الجانبي */}
          <Button
            variant="ghost"
            size="icon"
            className={isMobile ? '' : 'lg:hidden'}
            onClick={onMenuToggle}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="بحث..."
              className="pr-10 w-64"
            />
          </div>

          {/* عنوان الصفحة */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-gray-900">
              لوحة التحكم الإدارية
            </h1>
          </div>
        </div>

        {/* Left Section */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center"
                  variant="destructive"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>الإشعارات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <span className="font-semibold">مستخدم جديد</span>
                <span className="text-sm text-gray-500">تم تسجيل نادي جديد منذ 5 دقائق</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <span className="font-semibold">دفعة جديدة</span>
                <span className="text-sm text-gray-500">تمت عملية دفع بقيمة 500 ريال</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <span className="font-semibold">شكوى جديدة</span>
                <span className="text-sm text-gray-500">شكوى من لاعب بخصوص الدفع</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                عرض كل الإشعارات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:block">{adminData?.name || 'مدير النظام'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{adminData?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/admin/profile')}>
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard/admin/settings')}>
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 

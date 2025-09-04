'use client';

import React from 'react';
import { 
  Stack, 
  Button, 
  Text, 
  Group, 
  Avatar, 
  Badge,
  Divider,
  Box
} from '@mantine/core';
import { 
  Home,
  Trophy,
  Users,
  Calendar,
  BarChart3,
  MessageCircle,
  Settings,
  User,
  LogOut,
  Plus
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';

interface NewSidebarProps {
  collapsed?: boolean;
}

export default function NewSidebar({ collapsed = false }: NewSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserDisplayName = () => {
    if (userData?.displayName) return userData.displayName;
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'المستخدم';
  };

  const getAccountTypeText = () => {
    switch (userData?.accountType) {
      case 'player': return 'لاعب';
      case 'admin': return 'مدير';
      case 'club': return 'نادي';
      case 'academy': return 'أكاديمية';
      default: return 'مستخدم';
    }
  };

  const menuItems = [
    { icon: Home, label: 'الرئيسية', href: '/dashboard' },
    { icon: Trophy, label: 'المباريات', href: '/dashboard/matches' },
    { icon: Users, label: 'اللاعبين', href: '/dashboard/players' },
    { icon: Calendar, label: 'التقويم', href: '/dashboard/calendar' },
    { icon: BarChart3, label: 'الإحصائيات', href: '/dashboard/stats' },
    { icon: MessageCircle, label: 'الرسائل', href: '/dashboard/messages' },
  ];

  const bottomMenuItems = [
    { icon: User, label: 'الملف الشخصي', href: '/dashboard/profile' },
    { icon: Settings, label: 'الإعدادات', href: '/dashboard/settings' },
  ];

  return (
    <Box 
      className={`border-r border-gray-200 bg-white ${collapsed ? 'w-[70px]' : 'w-[280px]'}`}
    >
      <Box className="p-4">
        {/* الملف الشخصي */}
        <Group className="mb-6">
          <Avatar
            src={user?.photoURL}
            alt={getUserDisplayName()}
            size={collapsed ? "md" : "lg"}
            radius="xl"
          />
          {!collapsed && (
            <Box className="flex-1 min-w-0">
              <Text size="sm" fw={500} className="text-gray-900 truncate">
                {getUserDisplayName()}
              </Text>
              <Badge size="xs" variant="light" color="blue">
                {getAccountTypeText()}
              </Badge>
            </Box>
          )}
        </Group>

        {/* زر إضافة جديد */}
        <Button
          leftSection={!collapsed && <Plus size={16} />}
          fullWidth
          size="sm"
          className="mb-4"
          onClick={() => router.push('/dashboard/add')}
        >
          {collapsed ? <Plus size={16} /> : 'إضافة جديد'}
        </Button>
      </Box>

      <Box className="px-2 flex-1">
        <Stack gap="xs">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "filled" : "subtle"}
              leftSection={!collapsed && <item.icon size={16} />}
              fullWidth
              justify="flex-start"
              size="sm"
              onClick={() => router.push(item.href)}
              className="text-right"
            >
              {collapsed ? <item.icon size={16} /> : item.label}
            </Button>
          ))}
        </Stack>
      </Box>

      <Box className="p-2">
        <Stack gap="xs">
          <Divider />
          
          {bottomMenuItems.map((item) => (
            <Button
              key={item.href}
              variant="subtle"
              leftSection={!collapsed && <item.icon size={16} />}
              fullWidth
              justify="flex-start"
              size="sm"
              onClick={() => router.push(item.href)}
              className="text-right"
            >
              {collapsed ? <item.icon size={16} /> : item.label}
            </Button>
          ))}
          
          <Button
            variant="subtle"
            color="red"
            leftSection={!collapsed && <LogOut size={16} />}
            fullWidth
            justify="flex-start"
            size="sm"
            onClick={handleSignOut}
            className="text-right"
          >
            {collapsed ? <LogOut size={16} /> : 'تسجيل الخروج'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

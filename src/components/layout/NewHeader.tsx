'use client';

import React, { useState } from 'react';
import { 
  Group, 
  Button, 
  Text, 
  Burger, 
  Drawer, 
  Stack,
  Avatar,
  Menu,
  ActionIcon,
  Badge,
  Box,
  Divider
} from '@mantine/core';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  Home,
  Trophy,
  Users,
  Calendar,
  BarChart3,
  MessageCircle
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';

interface NewHeaderProps {
  opened: boolean;
  toggle: () => void;
}

export default function NewHeader({ opened, toggle }: NewHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userData, signOut } = useAuth();
  const [searchOpened, setSearchOpened] = useState(false);

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

  return (
    <>
      <Box className="h-[70px] border-b border-gray-200 bg-white shadow-sm flex items-center px-4">
        <Group justify="space-between" className="w-full">
          {/* الجانب الأيسر - زر القائمة واللوجو */}
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              size="sm"
              className="md:hidden"
            />
            <Text 
              size="xl" 
              fw={700} 
              className="text-blue-600 cursor-pointer"
              onClick={() => router.push('/dashboard')}
            >
              El7lm
            </Text>
          </Group>

          {/* الجانب الأوسط - البحث (في الشاشات الكبيرة) */}
          <Box className="hidden md:block flex-1 max-w-md mx-8">
            <Button
              variant="light"
              leftSection={<Search size={16} />}
              fullWidth
              onClick={() => setSearchOpened(true)}
              className="text-gray-500"
            >
              البحث...
            </Button>
          </Box>

          {/* الجانب الأيمن - الإشعارات والملف الشخصي */}
          <Group>
            {/* زر البحث في الموبايل */}
            <ActionIcon
              variant="light"
              size="lg"
              className="md:hidden"
              onClick={() => setSearchOpened(true)}
            >
              <Search size={18} />
            </ActionIcon>

            {/* الإشعارات */}
            <ActionIcon
              variant="light"
              size="lg"
              className="relative"
            >
              <Bell size={18} />
              <Badge
                size="xs"
                color="red"
                className="absolute -top-1 -right-1"
              >
                3
              </Badge>
            </ActionIcon>

            {/* الملف الشخصي */}
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button variant="subtle" className="p-0">
                  <Group gap="xs">
                    <Avatar
                      src={user?.photoURL}
                      alt={getUserDisplayName()}
                      size="md"
                      radius="xl"
                    />
                    <Box className="hidden sm:block text-right">
                      <Text size="sm" fw={500} className="text-gray-900">
                        {getUserDisplayName()}
                      </Text>
                      <Text size="xs" className="text-gray-500">
                        {getAccountTypeText()}
                      </Text>
                    </Box>
                  </Group>
                </Button>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<User size={14} />}
                  onClick={() => router.push('/dashboard/profile')}
                >
                  الملف الشخصي
                </Menu.Item>
                <Menu.Item
                  leftSection={<Settings size={14} />}
                  onClick={() => router.push('/dashboard/settings')}
                >
                  الإعدادات
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={<LogOut size={14} />}
                  color="red"
                  onClick={handleSignOut}
                >
                  تسجيل الخروج
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* Drawer للقائمة الجانبية */}
      <Drawer
        opened={opened}
        onClose={toggle}
        size="xs"
        position="right"
        title="القائمة الرئيسية"
        className="md:hidden"
      >
        <Stack gap="xs">
          {menuItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? "filled" : "subtle"}
              leftSection={<item.icon size={16} />}
              fullWidth
              justify="flex-start"
              onClick={() => {
                router.push(item.href);
                toggle();
              }}
              className="text-right"
            >
              {item.label}
            </Button>
          ))}
          
          <Divider my="md" />
          
          <Button
            variant="subtle"
            leftSection={<User size={16} />}
            fullWidth
            justify="flex-start"
            onClick={() => {
              router.push('/dashboard/profile');
              toggle();
            }}
            className="text-right"
          >
            الملف الشخصي
          </Button>
          
          <Button
            variant="subtle"
            leftSection={<Settings size={16} />}
            fullWidth
            justify="flex-start"
            onClick={() => {
              router.push('/dashboard/settings');
              toggle();
            }}
            className="text-right"
          >
            الإعدادات
          </Button>
          
          <Button
            variant="subtle"
            color="red"
            leftSection={<LogOut size={16} />}
            fullWidth
            justify="flex-start"
            onClick={() => {
              handleSignOut();
              toggle();
            }}
            className="text-right"
          >
            تسجيل الخروج
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}

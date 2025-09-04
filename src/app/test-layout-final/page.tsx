'use client';

import React, { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Group, 
  Button, 
  Stack,
  Grid,
  Badge,
  Box,
  Burger,
  Drawer,
  ActionIcon,
  Menu,
  Avatar
} from '@mantine/core';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Activity,
  Plus,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Home
} from 'lucide-react';

export default function TestLayoutFinalPage() {
  const [drawerOpened, setDrawerOpened] = useState(false);

  const stats = [
    { icon: Trophy, title: 'المباريات', value: '12', change: '+3', color: 'blue' },
    { icon: Target, title: 'الأهداف', value: '8', change: '+2', color: 'green' },
    { icon: TrendingUp, title: 'النقاط', value: '24', change: '+5', color: 'purple' },
    { icon: Activity, title: 'النشاط', value: '95%', change: '+2%', color: 'yellow' },
  ];

  const menuItems = [
    { icon: Home, label: 'الرئيسية', href: '/dashboard' },
    { icon: Trophy, label: 'المباريات', href: '/dashboard/matches' },
    { icon: Users, label: 'اللاعبين', href: '/dashboard/players' },
    { icon: Calendar, label: 'التقويم', href: '/dashboard/calendar' },
    { icon: BarChart3, label: 'الإحصائيات', href: '/dashboard/stats' },
  ];

  return (
    <Box className="min-h-screen bg-gray-50">
      {/* الهيدر */}
      <Box className="h-[70px] border-b border-gray-200 bg-white shadow-sm flex items-center px-4">
        <Group justify="space-between" className="w-full">
          <Group>
            <Burger
              opened={drawerOpened}
              onClick={() => setDrawerOpened(true)}
              size="sm"
              className="md:hidden"
            />
            <Title order={3} className="text-blue-600">
              El7lm
            </Title>
          </Group>

          <Group>
            <ActionIcon variant="light" size="lg">
              <Search size={18} />
            </ActionIcon>
            <ActionIcon variant="light" size="lg" className="relative">
              <Bell size={18} />
              <Badge size="xs" color="red" className="absolute -top-1 -right-1">
                3
              </Badge>
            </ActionIcon>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button variant="subtle" className="p-0">
                  <Group gap="xs">
                    <Avatar size="md" radius="xl" />
                    <Box className="hidden sm:block text-right">
                      <Text size="sm" fw={500}>المستخدم</Text>
                      <Text size="xs" className="text-gray-500">لاعب</Text>
                    </Box>
                  </Group>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<User size={14} />}>
                  الملف الشخصي
                </Menu.Item>
                <Menu.Item leftSection={<Settings size={14} />}>
                  الإعدادات
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<LogOut size={14} />} color="red">
                  تسجيل الخروج
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Box>

      {/* المحتوى الرئيسي */}
      <Box className="flex">
        {/* القائمة الجانبية */}
        <Box className="hidden md:block w-[280px] border-r border-gray-200 bg-white">
          <Box className="p-4">
            <Group className="mb-6">
              <Avatar size="lg" radius="xl" />
              <Box className="flex-1 min-w-0">
                <Text size="sm" fw={500} className="text-gray-900 truncate">
                  المستخدم
                </Text>
                <Badge size="xs" variant="light" color="blue">
                  لاعب
                </Badge>
              </Box>
            </Group>
            <Button leftSection={<Plus size={16} />} fullWidth size="sm" className="mb-4">
              إضافة جديد
            </Button>
          </Box>

          <Box className="px-2">
            <Stack gap="xs">
              {menuItems.map((item, index) => (
                <Button
                  key={index}
                  variant="subtle"
                  leftSection={<item.icon size={16} />}
                  fullWidth
                  justify="flex-start"
                  size="sm"
                  className="text-right"
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* المحتوى */}
        <Box className="flex-1 p-4">
          <Container size="xl" className="py-8">
            <Stack gap="lg" className="mb-8">
              <Title order={1} className="text-gray-900 text-center">
                صفحة اختبار التخطيط النهائية
              </Title>
              <Text size="lg" className="text-gray-600 text-center">
                صفحة اختبار للتخطيط الكامل مع Mantine
              </Text>
            </Stack>

            {/* الإحصائيات */}
            <Grid className="mb-8">
              {stats.map((stat, index) => (
                <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder>
                    <Group justify="space-between" className="mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                        <stat.icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <Badge color={stat.color} variant="light">
                        {stat.change}
                      </Badge>
                    </Group>
                    <Text size="2xl" fw={700} className="text-gray-900 mb-1">
                      {stat.value}
                    </Text>
                    <Text size="sm" className="text-gray-600">
                      {stat.title}
                    </Text>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* أزرار الإجراءات */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} className="mb-6 text-center">الإجراءات السريعة</Title>
              <Group gap="md" justify="center">
                <Button leftSection={<Users size={16} />} variant="light">
                  إدارة اللاعبين
                </Button>
                <Button leftSection={<Calendar size={16} />} variant="light">
                  جدول المباريات
                </Button>
                <Button leftSection={<BarChart3 size={16} />} variant="light">
                  عرض الإحصائيات
                </Button>
                <Button leftSection={<Plus size={16} />} color="blue">
                  إضافة مباراة جديدة
                </Button>
              </Group>
            </Card>

            {/* رسالة نجاح */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="mt-8">
              <Stack gap="md" className="text-center">
                <Title order={2} className="text-green-600">
                  ✅ تم التحميل بنجاح!
                </Title>
                <Text size="lg" className="text-gray-600">
                  صفحة الاختبار مع التخطيط تعمل بشكل مثالي
                </Text>
                <Text size="sm" className="text-gray-500">
                  جميع المكونات والتخطيط يعملان بشكل صحيح
                </Text>
              </Stack>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* Drawer للقائمة الجانبية في الموبايل */}
      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        size="xs"
        position="right"
        title="القائمة الرئيسية"
        className="md:hidden"
      >
        <Stack gap="xs">
          {menuItems.map((item, index) => (
            <Button
              key={index}
              variant="subtle"
              leftSection={<item.icon size={16} />}
              fullWidth
              justify="flex-start"
              onClick={() => setDrawerOpened(false)}
              className="text-right"
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Drawer>
    </Box>
  );
}

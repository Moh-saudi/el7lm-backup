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
  Avatar,
  Divider
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
  Home,
  Heart,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from 'lucide-react';

export default function TestCompletePage() {
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

  const footerLinks = [
    { label: 'الرئيسية', href: '/' },
    { label: 'عن المنصة', href: '/about' },
    { label: 'الخدمات', href: '/services' },
    { label: 'الأسئلة الشائعة', href: '/faq' },
    { label: 'سياسة الخصوصية', href: '/privacy' },
    { label: 'شروط الاستخدام', href: '/terms' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'Youtube' },
  ];

  const contactInfo = [
    { icon: Mail, text: 'info@el7lm.com' },
    { icon: Phone, text: '+966 50 123 4567' },
    { icon: MapPin, text: 'الرياض، المملكة العربية السعودية' },
  ];

  return (
    <Box className="min-h-screen bg-gray-50 flex flex-col">
      {/* الهيدر */}
      <Box className="h-[70px] border-b border-gray-200 bg-white shadow-sm flex items-center px-4 sticky top-0 z-50">
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
      <Box className="flex flex-1">
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
                صفحة اختبار كاملة مع جميع المكونات
              </Title>
              <Text size="lg" className="text-gray-600 text-center">
                صفحة اختبار للتخطيط الكامل مع Mantine والفوتر
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
                  صفحة الاختبار الكاملة تعمل بشكل مثالي
                </Text>
                <Text size="sm" className="text-gray-500">
                  جميع المكونات والتخطيط والفوتر يعملان بشكل صحيح
                </Text>
              </Stack>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* الفوتر */}
      <Box className="bg-gray-900 text-white border-t-0">
        <Box className="p-8">
          <Group justify="space-between" align="flex-start" className="mb-8">
            {/* معلومات المنصة */}
            <Stack gap="md" className="flex-1 max-w-md">
              <Text size="xl" fw={700} className="text-blue-400">
                El7lm
              </Text>
              <Text size="sm" className="text-gray-300 leading-relaxed">
                منصة شاملة لإدارة كرة القدم واللاعبين والأندية. نساعد في تطوير المواهب
                وإدارة الفرق وتحسين الأداء الرياضي.
              </Text>

              {/* معلومات التواصل */}
              <Stack gap="xs">
                {contactInfo.map((item, index) => (
                  <Group key={index} gap="xs" className="text-gray-300">
                    <item.icon size={16} />
                    <Text size="sm">{item.text}</Text>
                  </Group>
                ))}
              </Stack>
            </Stack>

            {/* الروابط السريعة */}
            <Stack gap="md" className="flex-1 max-w-xs">
              <Text size="lg" fw={600} className="text-white">
                روابط سريعة
              </Text>
              <Stack gap="xs">
                {footerLinks.map((link, index) => (
                  <Button
                    key={index}
                    variant="subtle"
                    color="gray"
                    size="sm"
                    className="text-right justify-start p-0 h-auto"
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            </Stack>

            {/* وسائل التواصل الاجتماعي */}
            <Stack gap="md" className="flex-1 max-w-xs">
              <Text size="lg" fw={600} className="text-white">
                تابعنا
              </Text>
              <Group gap="xs">
                {socialLinks.map((social, index) => (
                  <Button
                    key={index}
                    variant="light"
                    size="sm"
                    radius="xl"
                    className="bg-gray-800 hover:bg-gray-700 border-gray-600"
                  >
                    <social.icon size={16} />
                  </Button>
                ))}
              </Group>
            </Stack>
          </Group>

          <Divider className="border-gray-700 my-6" />

          {/* حقوق النشر */}
          <Group justify="space-between" align="center">
            <Text size="sm" className="text-gray-400">
              © {new Date().getFullYear()} El7lm. جميع الحقوق محفوظة.
            </Text>
            <Group gap="xs" className="text-gray-400">
              <Text size="sm">صنع بـ</Text>
              <Heart size={16} className="text-red-500" />
              <Text size="sm">في المملكة العربية السعودية</Text>
            </Group>
          </Group>
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

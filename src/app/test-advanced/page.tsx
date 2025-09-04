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
  Divider,
  Progress,
  RingProgress,
  Timeline,
  Notification,
  Alert,
  Modal,
  TextInput,
  Select,
  Textarea,
  Switch,
  Slider,
  Tabs,
  Accordion,
  Tooltip,
  HoverCard,
  Popover,
  LoadingOverlay
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
  Youtube,
  Check,
  AlertCircle,
  Info,
  Star,
  Clock,
  Award,
  Zap,
  Shield,
  Globe,
  Database,
  Cloud,
  Lock,
  Eye,
  Edit,
  Trash,
  Download,
  Upload,
  Share,
  Bookmark,
  MessageCircle,
  Video,
  Image,
  FileText,
  PieChart,
  BarChart,
  LineChart,
  TrendingDown,
  Minus,
  X,
  ChevronRight,
  ChevronLeft,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function TestAdvancedPage() {
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const stats = [
    { icon: Trophy, title: 'المباريات', value: '12', change: '+3', color: 'blue', progress: 75 },
    { icon: Target, title: 'الأهداف', value: '8', change: '+2', color: 'green', progress: 60 },
    { icon: TrendingUp, title: 'النقاط', value: '24', change: '+5', color: 'purple', progress: 85 },
    { icon: Activity, title: 'النشاط', value: '95%', change: '+2%', color: 'yellow', progress: 95 },
  ];

  const menuItems = [
    { icon: Home, label: 'الرئيسية', href: '/dashboard' },
    { icon: Trophy, label: 'المباريات', href: '/dashboard/matches' },
    { icon: Users, label: 'اللاعبين', href: '/dashboard/players' },
    { icon: Calendar, label: 'التقويم', href: '/dashboard/calendar' },
    { icon: BarChart3, label: 'الإحصائيات', href: '/dashboard/stats' },
  ];

  const timelineData = [
    { title: 'مباراة جديدة', description: 'تم إضافة مباراة ضد فريق النصر', time: 'منذ 2 ساعة', icon: Trophy, color: 'blue' },
    { title: 'لاعب جديد', description: 'انضم أحمد محمد للفريق', time: 'منذ 4 ساعات', icon: Users, color: 'green' },
    { title: 'نتيجة مباراة', description: 'فوز 3-1 ضد فريق الهلال', time: 'منذ يوم', icon: Award, color: 'yellow' },
  ];

  const handleLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <Box className="min-h-screen bg-gray-50 flex flex-col">
      <LoadingOverlay visible={loading} />
      
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
            <Tooltip label="البحث">
              <ActionIcon variant="light" size="lg">
                <Search size={18} />
              </ActionIcon>
            </Tooltip>
            
            <Popover width={300} position="bottom" withArrow shadow="md">
              <Popover.Target>
                <ActionIcon variant="light" size="lg" className="relative">
                  <Bell size={18} />
                  <Badge size="xs" color="red" className="absolute -top-1 -right-1">
                    3
                  </Badge>
                </ActionIcon>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Text size="sm" fw={500}>الإشعارات</Text>
                  <Notification title="مباراة جديدة" color="blue" icon={<Trophy size={16} />}>
                    تم إضافة مباراة جديدة للتقويم
                  </Notification>
                  <Notification title="لاعب جديد" color="green" icon={<Users size={16} />}>
                    انضم لاعب جديد للفريق
                  </Notification>
                </Stack>
              </Popover.Dropdown>
            </Popover>

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
                صفحة اختبار متقدمة مع Mantine
              </Title>
              <Text size="lg" className="text-gray-600 text-center">
                صفحة اختبار للمكونات المتقدمة والحديثة
              </Text>
            </Stack>

            {/* التنبيهات */}
            <Stack gap="md" className="mb-8">
              <Alert icon={<Info size={16} />} title="معلومات مهمة" color="blue">
                هذه صفحة اختبار للمكونات المتقدمة في Mantine
              </Alert>
              <Alert icon={<Check size={16} />} title="نجح التحميل" color="green">
                تم تحميل جميع المكونات بنجاح
              </Alert>
            </Stack>

            {/* الإحصائيات المتقدمة */}
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
                    <Text size="sm" className="text-gray-600 mb-3">
                      {stat.title}
                    </Text>
                    <Progress value={stat.progress} color={stat.color} size="sm" />
                  </Card>
                </Grid.Col>
              ))}
            </Grid>

            {/* التبويبات */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-8">
              <Tabs defaultValue="stats">
                <Tabs.List>
                  <Tabs.Tab value="stats" leftSection={<BarChart3 size={16} />}>
                    الإحصائيات
                  </Tabs.Tab>
                  <Tabs.Tab value="timeline" leftSection={<Clock size={16} />}>
                    الجدول الزمني
                  </Tabs.Tab>
                  <Tabs.Tab value="settings" leftSection={<Settings size={16} />}>
                    الإعدادات
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="stats" pt="md">
                  <Grid>
                    <Grid.Col span={6}>
                      <RingProgress
                        size={120}
                        thickness={12}
                        sections={[{ value: 75, color: 'blue' }]}
                        label={
                          <Text ta="center" size="lg" fw={700}>
                            75%
                          </Text>
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={6}>
                      <Stack gap="md">
                        <Text size="lg" fw={600}>معدل النجاح</Text>
                        <Text size="sm" className="text-gray-600">
                          معدل نجاح الفريق في المباريات الأخيرة
                        </Text>
                      </Stack>
                    </Grid.Col>
                  </Grid>
                </Tabs.Panel>

                <Tabs.Panel value="timeline" pt="md">
                  <Timeline active={1} bulletSize={24} lineWidth={2}>
                    {timelineData.map((item, index) => (
                      <Timeline.Item key={index} bullet={<item.icon size={12} />} title={item.title}>
                        <Text size="sm" className="text-gray-600">{item.description}</Text>
                        <Text size="xs" className="text-gray-500 mt-1">{item.time}</Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Tabs.Panel>

                <Tabs.Panel value="settings" pt="md">
                  <Stack gap="md">
                    <Switch label="تفعيل الإشعارات" defaultChecked />
                    <Switch label="الوضع المظلم" />
                    <Switch label="المزامنة التلقائية" defaultChecked />
                    <Slider
                      label="مستوى الصوت"
                      defaultValue={60}
                      max={100}
                      min={0}
                      step={10}
                      marks={[
                        { value: 0, label: '0%' },
                        { value: 50, label: '50%' },
                        { value: 100, label: '100%' },
                      ]}
                    />
                  </Stack>
                </Tabs.Panel>
              </Tabs>
            </Card>

            {/* الأكورديون */}
            <Card shadow="sm" padding="lg" radius="md" withBorder className="mb-8">
              <Title order={3} className="mb-6">الأسئلة الشائعة</Title>
              <Accordion>
                <Accordion.Item value="item-1">
                  <Accordion.Control>كيف يمكنني إضافة مباراة جديدة؟</Accordion.Control>
                  <Accordion.Panel>
                    يمكنك إضافة مباراة جديدة من خلال الضغط على زر "إضافة جديد" في القائمة الجانبية
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="item-2">
                  <Accordion.Control>كيف يمكنني إدارة اللاعبين؟</Accordion.Control>
                  <Accordion.Panel>
                    يمكنك إدارة اللاعبين من خلال قسم "اللاعبين" في القائمة الجانبية
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="item-3">
                  <Accordion.Control>كيف يمكنني عرض الإحصائيات؟</Accordion.Control>
                  <Accordion.Panel>
                    يمكنك عرض الإحصائيات من خلال قسم "الإحصائيات" في القائمة الجانبية
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion>
            </Card>

            {/* أزرار الإجراءات المتقدمة */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} className="mb-6 text-center">الإجراءات المتقدمة</Title>
              <Group gap="md" justify="center">
                <HoverCard width={280} shadow="md">
                  <HoverCard.Target>
                    <Button leftSection={<Users size={16} />} variant="light">
                      إدارة اللاعبين
                    </Button>
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <Text size="sm">
                      إدارة قائمة اللاعبين وإضافة لاعبين جدد وتعديل البيانات
                    </Text>
                  </HoverCard.Dropdown>
                </HoverCard>

                <Button leftSection={<Calendar size={16} />} variant="light">
                  جدول المباريات
                </Button>
                <Button leftSection={<BarChart3 size={16} />} variant="light">
                  عرض الإحصائيات
                </Button>
                <Button leftSection={<Plus size={16} />} color="blue" onClick={() => setModalOpened(true)}>
                  إضافة مباراة جديدة
                </Button>
                <Button leftSection={<Zap size={16} />} color="yellow" onClick={handleLoading}>
                  تحميل البيانات
                </Button>
              </Group>
            </Card>
          </Container>
        </Box>
      </Box>

      {/* الفوتر */}
      <Box className="bg-gray-900 text-white border-t-0">
        <Box className="p-8">
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

      {/* Modal لإضافة مباراة جديدة */}
      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="إضافة مباراة جديدة" size="md">
        <Stack gap="md">
          <TextInput
            label="اسم المباراة"
            placeholder="أدخل اسم المباراة"
            required
          />
          <Select
            label="الفريق المضيف"
            placeholder="اختر الفريق المضيف"
            data={['النصر', 'الهلال', 'الأهلي', 'الاتحاد']}
            required
          />
          <Select
            label="الفريق الضيف"
            placeholder="اختر الفريق الضيف"
            data={['النصر', 'الهلال', 'الأهلي', 'الاتحاد']}
            required
          />
          <TextInput
            label="التاريخ والوقت"
            placeholder="اختر التاريخ والوقت"
            type="datetime-local"
            required
          />
          <Textarea
            label="الملاحظات"
            placeholder="أدخل أي ملاحظات إضافية"
            rows={3}
          />
          <Group justify="flex-end" gap="md">
            <Button variant="light" onClick={() => setModalOpened(false)}>
              إلغاء
            </Button>
            <Button onClick={() => setModalOpened(false)}>
              إضافة المباراة
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}

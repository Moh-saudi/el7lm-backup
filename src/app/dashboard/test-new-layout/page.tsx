'use client';

import React from 'react';
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
  Avatar,
  Progress,
  Divider,
  Box
} from '@mantine/core';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Activity,
  Plus,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';
import NewLayout from '@/components/layout/NewLayout';

export default function TestNewLayoutPage() {
  const stats = [
    { icon: Trophy, title: 'المباريات', value: '12', change: '+3', color: 'blue' },
    { icon: Target, title: 'الأهداف', value: '8', change: '+2', color: 'green' },
    { icon: TrendingUp, title: 'النقاط', value: '24', change: '+5', color: 'purple' },
    { icon: Activity, title: 'النشاط', value: '95%', change: '+2%', color: 'yellow' },
  ];

  const recentActivities = [
    { title: 'مباراة ضد فريق النصر', description: 'أداء ممتاز مع تسجيل هدفين', time: 'منذ ساعتين', status: 'نجح' },
    { title: 'تدريب مهارات التسديد', description: 'تحسين دقة التسديد من مسافات مختلفة', time: 'منذ يوم', status: 'مكتمل' },
    { title: 'جلسة تحليل الأداء', description: 'مراجعة شاملة لأداء اللاعب', time: 'منذ يومين', status: 'قيد المراجعة' },
  ];

  return (
    <NewLayout>
      <Container size="xl" className="py-8">
        {/* العنوان الرئيسي */}
        <Stack gap="lg" className="mb-8">
          <Title order={1} className="text-gray-900">
            لوحة التحكم الجديدة
          </Title>
          <Text size="lg" className="text-gray-600">
            مرحباً بك في التصميم الجديد المحسن باستخدام Mantine
          </Text>
        </Stack>

        {/* الإحصائيات */}
        <Grid className="mb-8">
          {stats.map((stat, index) => (
            <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 3 }}>
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Group justify="space-between" className="mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
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

        {/* المحتوى الرئيسي */}
        <Grid>
          {/* النشاط الأخير */}
          <Grid.Col span={{ base: 12, lg: 8 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Group justify="space-between" className="mb-6">
                <Title order={3}>النشاط الأخير</Title>
                <Button size="sm" leftSection={<Plus size={16} />}>
                  إضافة نشاط
                </Button>
              </Group>
              
              <Stack gap="md">
                {recentActivities.map((activity, index) => (
                  <Box key={index}>
                    <Group justify="space-between" className="mb-2">
                      <Text fw={500} className="text-gray-900">
                        {activity.title}
                      </Text>
                      <Badge 
                        color={activity.status === 'نجح' ? 'green' : activity.status === 'مكتمل' ? 'blue' : 'yellow'}
                        variant="light"
                        size="sm"
                      >
                        {activity.status}
                      </Badge>
                    </Group>
                    <Text size="sm" className="text-gray-600 mb-2">
                      {activity.description}
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      {activity.time}
                    </Text>
                    {index < recentActivities.length - 1 && <Divider className="mt-4" />}
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid.Col>

          {/* الأهداف والتقدم */}
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Title order={3} className="mb-6">الأهداف والتقدم</Title>
              
              <Stack gap="lg">
                <Box>
                  <Group justify="space-between" className="mb-2">
                    <Text size="sm" fw={500}>تحسين مهارات التسديد</Text>
                    <Text size="sm" className="text-gray-500">75%</Text>
                  </Group>
                  <Progress value={75} color="blue" size="sm" className="mb-2" />
                  <Text size="xs" className="text-gray-500">
                    العمل على تحسين دقة التسديد من مسافات مختلفة
                  </Text>
                </Box>

                <Box>
                  <Group justify="space-between" className="mb-2">
                    <Text size="sm" fw={500}>زيادة اللياقة البدنية</Text>
                    <Text size="sm" className="text-gray-500">60%</Text>
                  </Group>
                  <Progress value={60} color="green" size="sm" className="mb-2" />
                  <Text size="xs" className="text-gray-500">
                    تحسين القدرة على التحمل والسرعة
                  </Text>
                </Box>

                <Box>
                  <Group justify="space-between" className="mb-2">
                    <Text size="sm" fw={500}>تطوير العمل الجماعي</Text>
                    <Text size="sm" className="text-gray-500">90%</Text>
                  </Group>
                  <Progress value={90} color="purple" size="sm" className="mb-2" />
                  <Text size="xs" className="text-gray-500">
                    تحسين التواصل والتعاون مع الفريق
                  </Text>
                </Box>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* أزرار الإجراءات السريعة */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className="mt-8">
          <Title order={3} className="mb-6">الإجراءات السريعة</Title>
          
          <Group gap="md">
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
      </Container>
    </NewLayout>
  );
}

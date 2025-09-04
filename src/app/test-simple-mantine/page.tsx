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
  Box
} from '@mantine/core';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Activity
} from 'lucide-react';

export default function TestSimpleMantinePage() {
  const stats = [
    { icon: Trophy, title: 'المباريات', value: '12', change: '+3', color: 'blue' },
    { icon: Target, title: 'الأهداف', value: '8', change: '+2', color: 'green' },
    { icon: TrendingUp, title: 'النقاط', value: '24', change: '+5', color: 'purple' },
    { icon: Activity, title: 'النشاط', value: '95%', change: '+2%', color: 'yellow' },
  ];

  return (
    <Container size="xl" className="py-8">
      <Stack gap="lg" className="mb-8">
        <Title order={1} className="text-gray-900">
          اختبار Mantine البسيط
        </Title>
        <Text size="lg" className="text-gray-600">
          صفحة اختبار بسيطة للتخطيط الجديد باستخدام Mantine
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
        <Title order={3} className="mb-6">الإجراءات السريعة</Title>
        <Group gap="md">
          <Button variant="light">
            إدارة اللاعبين
          </Button>
          <Button variant="light">
            جدول المباريات
          </Button>
          <Button variant="light">
            عرض الإحصائيات
          </Button>
          <Button color="blue">
            إضافة مباراة جديدة
          </Button>
        </Group>
      </Card>
    </Container>
  );
}

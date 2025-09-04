'use client';

import React, { useState } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UnifiedNotificationService } from '@/lib/notifications/unified-notification-service';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  Bell, 
  MessageCircle, 
  User, 
  Settings, 
  Trophy, 
  Target, 
  Calendar,
  Shield,
  Users,
  BarChart3,
  GraduationCap,
  BookOpen
} from 'lucide-react';

export default function ExampleUnifiedHeaderPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<'admin' | 'player' | 'academy'>('admin');

  const createTestNotification = async (type: 'interactive' | 'smart' | 'system') => {
    if (!user?.uid) return;

    try {
      await UnifiedNotificationService.createNotification({
        userId: user.uid,
        type,
        title: `إشعار ${type === 'interactive' ? 'تفاعلي' : type === 'smart' ? 'ذكي' : 'نظامي'} تجريبي`,
        message: `هذا إشعار تجريبي من نوع ${type} لاختبار النظام الجديد`,
        priority: 'medium',
        accountType: selectedType
      });
    } catch (error) {
      console.error('خطأ في إنشاء الإشعار التجريبي:', error);
    }
  };

  const createTestMessage = async () => {
    if (!user?.uid) return;

    try {
      await UnifiedNotificationService.createMessage({
        senderId: 'system',
        receiverId: user.uid,
        content: 'هذه رسالة تجريبية لاختبار نظام الرسائل الجديد',
        type: 'text',
        priority: 'medium',
        senderName: 'النظام'
      });
    } catch (error) {
      console.error('خطأ في إنشاء الرسالة التجريبية:', error);
    }
  };

  const getHeaderConfig = () => {
    switch (selectedType) {
      case 'admin':
        return {
          title: 'لوحة تحكم المدير',
          logo: '/images/admin-avatar.svg',
          customActions: (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Shield className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </>
          )
        };
      case 'player':
        return {
          title: 'لوحة تحكم اللاعب',
          logo: '/images/player-avatar.png',
          customActions: (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Trophy className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Target className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Calendar className="w-5 h-5" />
              </Button>
            </>
          )
        };
      case 'academy':
        return {
          title: 'لوحة تحكم الأكاديمية',
          logo: '/images/academy-avatar.png',
          customActions: (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <GraduationCap className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Users className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <BookOpen className="w-5 h-5" />
              </Button>
            </>
          )
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedHeader
        title={headerConfig.title}
        logo={headerConfig.logo}
        showNotifications={true}
        showMessages={true}
        showProfile={true}
        customActions={headerConfig.customActions}
      />

      <div className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              مثال على الهيدر الموحد
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              اختر نوع الحساب لرؤية كيفية تغيير الهيدر والإجراءات المخصصة
            </p>
          </div>

          {/* اختيار نوع الحساب */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>اختيار نوع الحساب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={selectedType === 'admin' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('admin')}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  مدير
                </Button>
                <Button
                  variant={selectedType === 'player' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('player')}
                  className="flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  لاعب
                </Button>
                <Button
                  variant={selectedType === 'academy' ? 'default' : 'outline'}
                  onClick={() => setSelectedType('academy')}
                  className="flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  أكاديمية
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* اختبار الإشعارات */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                اختبار الإشعارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 flex-wrap">
                <Button
                  variant="outline"
                  onClick={() => createTestNotification('interactive')}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  إشعار تفاعلي
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createTestNotification('smart')}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  إشعار ذكي
                </Button>
                <Button
                  variant="outline"
                  onClick={() => createTestNotification('system')}
                  className="flex items-center gap-2"
                >
                  <Bell className="w-4 h-4" />
                  إشعار نظامي
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* اختبار الرسائل */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                اختبار الرسائل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={createTestMessage}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                إنشاء رسالة تجريبية
              </Button>
            </CardContent>
          </Card>

          {/* معلومات النظام */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                معلومات النظام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">النوع المحدد</Badge>
                  <span className="text-sm font-medium">
                    {selectedType === 'admin' ? 'مدير' : 
                     selectedType === 'player' ? 'لاعب' : 'أكاديمية'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">المستخدم</Badge>
                  <span className="text-sm font-medium">
                    {user?.email || 'غير محدد'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">الحالة</Badge>
                  <span className="text-sm font-medium text-green-600">
                    نشط
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


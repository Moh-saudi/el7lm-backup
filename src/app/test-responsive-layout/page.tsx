'use client';

import React from 'react';
import ResponsiveLayoutWrapper from '@/components/layout/ResponsiveLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DeviceIndicator,
  ComprehensiveTest,
  SidebarToggle,
  LayoutControls
} from '@/components/layout/ResponsiveUtils';
import { 
  User, 
  Building, 
  Shield, 
  GraduationCap, 
  Target, 
  Briefcase,
  Home,
  Settings,
  Bell,
  MessageSquare,
  BarChart3,
  Video,
  FileText,
  Search,
  Star,
  Clock,
  DollarSign,
  TrendingUp,
  Heart,
  Award
} from 'lucide-react';

const TestResponsiveLayout = () => {
  const accountTypes = [
    { id: 'player', name: 'لاعب', icon: User, color: 'bg-blue-500' },
    { id: 'club', name: 'نادي', icon: Building, color: 'bg-green-500' },
    { id: 'admin', name: 'مدير', icon: Shield, color: 'bg-red-500' },
    { id: 'academy', name: 'أكاديمية', icon: GraduationCap, color: 'bg-indigo-500' },
    { id: 'trainer', name: 'مدرب', icon: Target, color: 'bg-pink-500' },
    { id: 'agent', name: 'وكيل', icon: Briefcase, color: 'bg-orange-500' },
  ];

  const features = [
    { icon: Home, title: 'الرئيسية', description: 'الصفحة الرئيسية للوحة التحكم' },
    { icon: Settings, title: 'الإعدادات', description: 'إدارة إعدادات الحساب' },
    { icon: Bell, title: 'الإشعارات', description: 'عرض الإشعارات الجديدة' },
    { icon: MessageSquare, title: 'الرسائل', description: 'نظام الرسائل الداخلية' },
    { icon: BarChart3, title: 'التقارير', description: 'إحصائيات وتحليلات' },
    { icon: Video, title: 'الفيديوهات', description: 'إدارة المحتوى المرئي' },
    { icon: FileText, title: 'الملفات', description: 'إدارة الملفات والمستندات' },
    { icon: Search, title: 'البحث', description: 'البحث المتقدم في النظام' },
    { icon: Star, title: 'المفضلة', description: 'العناصر المفضلة' },
    { icon: Clock, title: 'الجدول الزمني', description: 'إدارة المواعيد والجداول' },
    { icon: DollarSign, title: 'المدفوعات', description: 'إدارة المدفوعات والاشتراكات' },
    { icon: TrendingUp, title: 'الإحصائيات', description: 'تحليل الأداء والنمو' },
    { icon: Heart, title: 'المتابعون', description: 'إدارة المتابعين والمتابَعين' },
    { icon: Award, title: 'الإنجازات', description: 'الجوائز والإنجازات' },
  ];

  return (
    <>
      <ResponsiveLayoutWrapper
        accountType="player"
        showSidebar={true}
        showHeader={true}
        showFooter={true}
      >
        <div className="space-y-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">اختبار التخطيط المتجاوب</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              هذه الصفحة لاختبار التخطيط المتجاوب الجديد مع جميع أحجام الشاشات
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                📱 متجاوب مع الموبايل
              </Badge>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                📱 متجاوب مع التابلت
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                💻 متجاوب مع الديسكتوب
              </Badge>
            </div>
          </div>

          {/* Comprehensive Test */}
          <ComprehensiveTest />

          {/* Layout Controls */}
          <LayoutControls />

          {/* Device Indicator */}
          <DeviceIndicator />

        {/* Account Types Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              أنواع الحسابات المدعومة
            </CardTitle>
            <CardDescription>
              اختبار التخطيط مع مختلف أنواع الحسابات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {accountTypes.map((account) => {
                const IconComponent = account.icon;
                return (
                  <div
                    key={account.id}
                    className="flex flex-col items-center p-4 border rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 ${account.color} rounded-full flex items-center justify-center mb-2`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{account.name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              الميزات المتاحة
            </CardTitle>
            <CardDescription>
              عرض جميع الميزات المتاحة في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 hover:border-blue-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Responsive Test Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mobile Test */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                📱 اختبار الموبايل
              </CardTitle>
              <CardDescription className="text-blue-600">
                جرب تغيير حجم النافذة إلى أقل من 768px
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">السايدبار مخفي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">زر القائمة في الهيدر</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">تخطيط عمودي واحد</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tablet Test */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                📱 اختبار التابلت
              </CardTitle>
              <CardDescription className="text-green-600">
                جرب تغيير حجم النافذة إلى 768px - 1023px
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">السايدبار مطوي</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">عرض الأيقونات فقط</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">تخطيط عمودين</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Desktop Test */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                💻 اختبار الديسكتوب
              </CardTitle>
              <CardDescription className="text-purple-600">
                جرب تغيير حجم النافذة إلى أكثر من 1024px
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">السايدبار مفتوح</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">عرض النصوص والأيقونات</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">تخطيط ثلاثة أعمدة</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Test */}
        <Card>
          <CardHeader>
            <CardTitle>اختبار تفاعلي</CardTitle>
            <CardDescription>
              جرب التفاعل مع العناصر المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="default">زر أساسي</Button>
              <Button variant="secondary">زر ثانوي</Button>
              <Button variant="outline">زر محيطي</Button>
              <Button variant="ghost">زر شفاف</Button>
              <Button variant="destructive">زر حذف</Button>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Text */}
        <Card>
          <CardHeader>
            <CardTitle>اختبار النصوص المتجاوبة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              عنوان رئيسي كبير
            </h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-800">
              عنوان فرعي متوسط
            </h2>
            <h3 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-700">
              عنوان صغير
            </h3>
            <p className="text-base md:text-lg lg:text-xl text-gray-600 leading-relaxed">
              هذا نص تجريبي لاختبار كيفية ظهور النصوص بأحجام مختلفة على الشاشات المختلفة. 
              يجب أن يكون النص مقروءاً وواضحاً على جميع الأجهزة.
            </p>
          </CardContent>
                 </Card>
       </div>
     </ResponsiveLayoutWrapper>
   </>
 );
};

export default TestResponsiveLayout;

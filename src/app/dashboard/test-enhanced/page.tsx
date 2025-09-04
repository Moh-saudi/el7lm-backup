'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Star,
  Eye,
  Heart,
  Share2,
  MoreVertical,
  Calendar,
  MapPin,
  Users,
  Trophy,
  Target,
  TrendingUp,
  BarChart3,
  Activity,
  Award,
  Zap
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Enhanced Mobile Layout
import EnhancedMobileLayout, { EnhancedMobileLayoutProvider } from '@/components/layout/EnhancedMobileLayout';

// ===== مكونات الصفحة التجريبية المحسنة =====

// مكون البطاقة الإحصائية المحسنة
const EnhancedStatCard = ({ icon: Icon, title, value, change, color = 'primary' }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}) => {
  const colorClasses = {
    primary: 'bg-blue-100 text-blue-600',
    secondary: 'bg-purple-100 text-purple-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    danger: 'bg-red-100 text-red-600'
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {change && (
            <Badge variant={change.startsWith('+') ? 'default' : 'destructive'} className={change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
              {change}
            </Badge>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون البطاقة النشاط المحسنة
const EnhancedActivityCard = ({
  title,
  description,
  time,
  type = 'default',
  image,
  likes = 0,
  views = 0
}: {
  title: string;
  description: string;
  time: string;
  type?: 'default' | 'success' | 'warning' | 'danger';
  image?: string;
  likes?: number;
  views?: number;
}) => {
  const typeColors: Record<string, 'primary' | 'success' | 'warning' | 'danger'> = {
    default: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger'
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {image && (
            <Avatar
              src={image}
              name={title}
              size="lg"
              className="w-16 h-16"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
                              <Badge variant="outline" className="text-xs">
                  {type}
                </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-500">{time}</span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Eye className="w-3 h-3" />
                  <span>{views}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span>{likes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// مكون شريط التقدم المحسن
const EnhancedProgressCard = ({ title, description, progress, color = 'primary' }: {
  title: string;
  description: string;
  progress: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}) => {
  return (
    <Card className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Target className="w-6 h-6" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <p className="text-blue-100 mb-4">{description}</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">في التقدم</span>
          </div>
          <span className="text-sm">{progress}% مكتمل</span>
        </div>
        <Progress
          value={progress}
                      className={color}
          className="w-full"
          size="sm"
        />
      </CardContent>
    </Card>
  );
};

// ===== الصفحة التجريبية المحسنة =====
export default function TestEnhancedPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // بيانات تجريبية
  const stats = [
    {
      icon: Trophy,
      title: 'المباريات',
      value: '12',
      change: '+3',
      color: 'primary' as const
    },
    {
      icon: Target,
      title: 'الأهداف',
      value: '8',
      change: '+2',
      color: 'success' as const
    },
    {
      icon: TrendingUp,
      title: 'النقاط',
      value: '24',
      change: '+5',
      color: 'secondary' as const
    },
    {
      icon: Activity,
      title: 'النشاط',
      value: '95%',
      change: '+2%',
      color: 'warning' as const
    }
  ];

  const activities = [
    {
      title: 'مباراة ضد فريق النصر',
      description: 'أداء ممتاز في المباراة الأخيرة مع تسجيل هدفين',
      time: 'منذ ساعتين',
      type: 'success' as const,
      image: '/images/team/player1.jpg',
      likes: 45,
      views: 120
    },
    {
      title: 'تدريب الصباح',
      description: 'تم إكمال التدريب الصباحي بنجاح مع تحسن في الأداء',
      time: 'منذ 4 ساعات',
      type: 'default' as const,
      likes: 23,
      views: 89
    },
    {
      title: 'إصابة طفيفة',
      description: 'إصابة طفيفة في الكاحل تحتاج إلى راحة يومين',
      time: 'منذ يوم',
      type: 'warning' as const,
      likes: 12,
      views: 67
    }
  ];

  const handleAddNew = () => {
    alert('إضافة عنصر جديد');
  };

  return (
    <EnhancedMobileLayoutProvider>
      <EnhancedMobileLayout
        title="لوحة التحكم المحسنة"
        showSearch={true}
        showAddButton={true}
        onAddClick={handleAddNew}
        accountType="player"
      >
        {/* شريط البحث المحسن */}
        <div className="mb-6">
          <Input
            placeholder="البحث في النشاطات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startContent={<Search className="w-4 h-4 text-gray-400" />}
            variant="bordered"
            size="lg"
            className="w-full"
          />
        </div>

        {/* الإحصائيات المحسنة */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">الإحصائيات السريعة</h2>
            <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
              عرض الكل
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedStatCard {...stat} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* النشاطات الأخيرة المحسنة */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">النشاطات الأخيرة</h2>
            <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
              عرض الكل
            </Button>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedActivityCard {...activity} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* الأهداف القادمة المحسنة */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الأهداف القادمة</h2>
          <EnhancedProgressCard
            title="تحسين مهارات التسديد"
            description="العمل على تحسين دقة التسديد من مسافات مختلفة"
            progress={75}
            className="bg-green-500"
          />
        </div>

        {/* المباريات القادمة المحسنة */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">المباريات القادمة</h2>
          <Card className="w-full">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12 bg-blue-100">
                    <AvatarImage src="/images/team/logo.png" />
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">فريقنا vs الهلال</h3>
                    <p className="text-sm text-gray-600">دوري المحترفين</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">الجمعة</p>
                  <p className="text-xs text-gray-600">8:00 م</p>
                </div>
              </div>
              {/* <Divider className="my-3" /> */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>15 مارس 2024</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>ملعب الملك فهد</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* زر إضافة سريع محسن */}
        <motion.div
          className="fixed bottom-24 right-4 z-20"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            className="bg-blue-600 hover:bg-blue-700 w-14 h-14 shadow-lg rounded-full"
            onClick={handleAddNew}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </EnhancedMobileLayout>
    </EnhancedMobileLayoutProvider>
  );
}

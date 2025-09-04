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
import MobileLayout, { MobileLayoutProvider } from '@/components/layout/MobileLayout';

// ===== مكونات الصفحة التجريبية =====

// مكون البطاقة الإحصائية
const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  change?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {change && (
          <span className={`text-sm font-medium ${
            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </motion.div>
  );
};

// مكون البطاقة النشاط
const ActivityCard = ({ 
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
  type?: 'default' | 'success' | 'warning' | 'error';
  image?: string;
  likes?: number;
  views?: number;
}) => {
  const typeColors = {
    default: 'bg-blue-50 text-blue-600',
    success: 'bg-green-50 text-green-600',
    warning: 'bg-yellow-50 text-yellow-600',
    error: 'bg-red-50 text-red-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
    >
      <div className="flex items-start space-x-3">
        {image && (
          <img 
            src={image} 
            alt={title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[type]}`}>
              {type}
            </span>
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
    </motion.div>
  );
};

// مكون القائمة المنسدلة
const DropdownMenu = ({ 
  items, 
  trigger, 
  className = '' 
}: {
  items: { label: string; onClick: () => void; icon?: React.ComponentType<{ className?: string }> }[];
  trigger: React.ReactNode;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {trigger}
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20"
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
              </button>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
};

// ===== الصفحة التجريبية الرئيسية =====
export default function TestMobilePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');

  // بيانات تجريبية
  const stats = [
    {
      icon: Trophy,
      title: 'المباريات',
      value: '12',
      change: '+3',
      color: 'blue' as const
    },
    {
      icon: Target,
      title: 'الأهداف',
      value: '8',
      change: '+2',
      color: 'green' as const
    },
    {
      icon: TrendingUp,
      title: 'النقاط',
      value: '24',
      change: '+5',
      color: 'purple' as const
    },
    {
      icon: Activity,
      title: 'النشاط',
      value: '95%',
      change: '+2%',
      color: 'orange' as const
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

  const handleSearch = () => {
    alert(`البحث عن: ${searchQuery}`);
  };

  return (
    <MobileLayoutProvider>
      <MobileLayout
        title="لوحة التحكم التجريبية"
        showSearch={true}
        showAddButton={true}
        onAddClick={handleAddNew}
        accountType="player"
      >
        {/* شريط البحث والفلترة */}
        <div className="mb-6 space-y-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث في النشاطات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* الفلترة والترتيب */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <DropdownMenu
                items={[
                  { label: 'الكل', onClick: () => setFilterBy('all') },
                  { label: 'المباريات', onClick: () => setFilterBy('matches') },
                  { label: 'التدريبات', onClick: () => setFilterBy('training') },
                  { label: 'الإصابات', onClick: () => setFilterBy('injuries') }
                ]}
                trigger={<Filter className="w-5 h-5" />}
              />
              <span className="text-sm text-gray-600">فلترة</span>
            </div>

            <div className="flex items-center space-x-2">
              <DropdownMenu
                items={[
                  { label: 'الأحدث', onClick: () => setSortBy('recent') },
                  { label: 'الأقدم', onClick: () => setSortBy('oldest') },
                  { label: 'الأكثر شعبية', onClick: () => setSortBy('popular') }
                ]}
                trigger={sortBy === 'recent' ? <SortDesc className="w-5 h-5" /> : <SortAsc className="w-5 h-5" />}
              />
              <span className="text-sm text-gray-600">ترتيب</span>
            </div>
          </div>
        </div>

        {/* الإحصائيات */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الإحصائيات السريعة</h2>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StatCard {...stat} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* النشاطات الأخيرة */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">النشاطات الأخيرة</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              عرض الكل
            </button>
          </div>
          
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ActivityCard {...activity} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* الأهداف القادمة */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">الأهداف القادمة</h2>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white">
            <div className="flex items-center space-x-3 mb-3">
              <Target className="w-6 h-6" />
              <h3 className="font-semibold">تحسين مهارات التسديد</h3>
            </div>
            <p className="text-blue-100 mb-4">
              العمل على تحسين دقة التسديد من مسافات مختلفة
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm">في التقدم</span>
              </div>
              <span className="text-sm">75% مكتمل</span>
            </div>
            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
              <div className="bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>

        {/* المباريات القادمة */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">المباريات القادمة</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-blue-600" />
                </div>
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
          </div>
        </div>

        {/* زر إضافة سريع */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNew}
          className="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-20"
        >
          <Plus className="w-6 h-6" />
        </motion.button>
      </MobileLayout>
    </MobileLayoutProvider>
  );
}

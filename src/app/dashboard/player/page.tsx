'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  User, 
  FileText, 
  Video, 
  Search, 
  BarChart3, 
  MessageSquare, 
  CreditCard, 
  CheckCircle,
  Menu,
  X,
  Star,
  TrendingUp,
  Trophy,
  Target
} from 'lucide-react';
import { useAccountTypeAuth } from '@/hooks/useAccountTypeAuth';

export default function PlayerDashboard() {
  // التحقق من نوع الحساب - السماح فقط للاعبين وأولياء الأمور
  const { isAuthorized, isCheckingAuth } = useAccountTypeAuth({
    allowedTypes: ['player', 'parent'],
    redirectTo: '/dashboard'
  });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // كشف نوع الجهاز
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // عرض شاشة التحميل أثناء التحقق
  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600 text-sm md:text-base">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  // إذا لم يكن مصرح له، سيتم التوجيه تلقائياً
  if (!isAuthorized) {
    return null;
  }

  const quickActions = [
    {
      title: 'الملف الشخصي',
      description: 'إدارة معلوماتك الشخصية',
      icon: User,
      href: '/dashboard/player/profile',
      color: 'bg-blue-500'
    },
    {
      title: 'التقارير',
      description: 'عرض تقارير الأداء والتقدم',
      icon: FileText,
      href: '/dashboard/player/reports',
      color: 'bg-green-500'
    },
    {
      title: 'البحث عن الفرص',
      description: 'البحث عن فرص جديدة',
      icon: Search,
      href: '/dashboard/player/search',
      color: 'bg-purple-500'
    },
    {
      title: 'الرسائل',
      description: 'إدارة المحادثات والرسائل',
      icon: MessageSquare,
      href: '/dashboard/player/messages',
      color: 'bg-orange-500'
    }
  ];

  const stats = [
    {
      title: 'المباريات',
      value: '12',
      change: '+3',
      changeType: 'positive',
      icon: BarChart3
    },
    {
      title: 'الأهداف',
      value: '8',
      change: '+2',
      changeType: 'positive',
      icon: CheckCircle
    },
    {
      title: 'المساعدات',
      value: '5',
      change: '+1',
      changeType: 'positive',
      icon: CheckCircle
    },
    {
      title: 'التقييم',
      value: '8.5',
      change: '+0.3',
      changeType: 'positive',
      icon: Star
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl md:text-3xl font-bold text-gray-900">
                مرحباً بك في لوحة تحكم اللاعب
              </h1>
              <p className="mt-1 md:mt-2 text-gray-600 text-sm md:text-base">
                إدارة ملفك الشخصي وتتبع تقدمك الرياضي
              </p>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors touch-target"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="hidden md:flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-2 space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors touch-target"
                onClick={() => setIsMenuOpen(false)}
              >
                <action.icon className="w-5 h-5 mr-3" />
                <span className="text-sm font-medium">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {/* Stats Overview */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
            نظرة عامة على الأداء
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-gray-400" />
                  <span className={`text-xs md:text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-gray-600">
                  {stat.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
            الوصول السريع
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="group bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 touch-target"
              >
                <div className="flex items-center mb-3 md:mb-4">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${action.color} rounded-lg flex items-center justify-center mr-3 md:mr-4 group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
            النشاط الأخير
          </h2>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {[
                  {
                    title: 'تم تحديث ملفك الشخصي',
                    description: 'تم إضافة معلومات جديدة إلى ملفك الشخصي',
                    time: 'منذ ساعتين',
                    icon: User,
                    color: 'text-blue-500'
                  },
                  {
                    title: 'تم إرسال تقرير جديد',
                    description: 'تم إرسال تقرير الأداء الأسبوعي',
                    time: 'منذ يوم واحد',
                    icon: FileText,
                    color: 'text-green-500'
                  },
                  {
                    title: 'رسالة جديدة',
                    description: 'لديك رسالة جديدة من المدرب',
                    time: 'منذ يومين',
                    icon: MessageSquare,
                    color: 'text-orange-500'
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-lg">
                    <activity.icon className={`w-5 h-5 md:w-6 md:h-6 mt-1 ${activity.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm md:text-base font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-900 mb-4 md:mb-6">
            الأحداث القادمة
          </h2>
          <div className="bg-white rounded-xl md:rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="space-y-4">
                {[
                  {
                    title: 'مباراة تدريبية',
                    date: 'غداً - 4:00 مساءً',
                    location: 'ملعب النادي',
                    type: 'training'
                  },
                  {
                    title: 'جلسة تحليل الأداء',
                    date: 'الخميس - 6:00 مساءً',
                    location: 'قاعة الاجتماعات',
                    type: 'analysis'
                  },
                  {
                    title: 'مباراة رسمية',
                    date: 'السبت - 8:00 مساءً',
                    location: 'الملعب الرئيسي',
                    type: 'match'
                  }
                ].map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 md:p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="text-sm md:text-base font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mt-1">
                        {event.date}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.location}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.type === 'match' ? 'bg-red-100 text-red-800' :
                      event.type === 'training' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {event.type === 'match' ? 'مباراة' :
                       event.type === 'training' ? 'تدريب' : 'تحليل'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Performance Chart */}
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              تقدم الأداء
            </h3>
            <div className="space-y-3">
              {[
                { label: 'السرعة', value: 85, color: 'bg-blue-500' },
                { label: 'القوة', value: 72, color: 'bg-green-500' },
                { label: 'الدقة', value: 90, color: 'bg-purple-500' },
                { label: 'التحمل', value: 78, color: 'bg-orange-500' }
              ].map((skill) => (
                <div key={skill.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{skill.label}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 md:w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${skill.color}`}
                        style={{ width: `${skill.value}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-left">
                      {skill.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Achievements */}
          <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              الإنجازات الأخيرة
            </h3>
            <div className="space-y-3">
              {[
                { title: 'أفضل لاعب في المباراة', date: 'الأسبوع الماضي', icon: Trophy },
                { title: 'تحسن في السرعة', date: 'قبل أسبوعين', icon: TrendingUp },
                { title: 'أول هدف رسمي', date: 'قبل شهر', icon: Target }
              ].map((achievement, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <achievement.icon className="w-5 h-5 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-gray-600">
                      {achievement.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import dynamic from 'next/dynamic';
import { 
  BookOpen, 
  Languages, 
  GraduationCap, 
  Users, 
  Star, 
  Calendar,
  Clock,
  MapPin,
  Mail,
  Phone,
  Globe,
  Award,
  Target,
  CheckCircle,
  Sparkles,
  Heart,
  Brain,
  MessageSquare,
  Play,
  Download,
  ExternalLink,
  ArrowRight,
  Book,
  PenTool,
  Camera,
  Mic,
  Video,
  FileText,
  BarChart3,
  Trophy,
  Zap,
  Lightbulb,
  Shield,
  CreditCard,
  Home,
  Briefcase,
  User
} from 'lucide-react';

const UnifiedDashboardLayout = dynamic(() => import('@/components/layout/UnifiedDashboardLayout'), {
  ssr: true,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
        <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
      </div>
    </div>
  )
});

export default function DreamAcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState('languages');

  const categories = [
    { id: 'languages', label: 'تعلم اللغات', icon: Languages, color: 'bg-blue-500' },
    { id: 'life-skills', label: 'المهارات الحياتية', icon: Heart, color: 'bg-green-500' },
    { id: 'living-skills', label: 'المهارات المعيشية', icon: Home, color: 'bg-purple-500' },
    { id: 'career', label: 'التطوير المهني', icon: Briefcase, color: 'bg-orange-500' }
  ];

  const languageCourses = [
    {
      id: 1,
      title: 'دورة اللغة الإنجليزية الأساسية',
      level: 'مبتدئ',
      duration: '3 أشهر',
      instructor: 'سارة أحمد',
      rating: 4.8,
      students: 1250,
      price: 'مجاني',
      features: ['محادثات يومية', 'قواعد اللغة', 'الكتابة', 'الاستماع'],
      image: '/images/english-course.jpg'
    },
    {
      id: 2,
      title: 'دورة اللغة الإسبانية للمبتدئين',
      level: 'مبتدئ',
      duration: '4 أشهر',
      instructor: 'كارلوس رودريغيز',
      rating: 4.6,
      students: 890,
      price: 'مجاني',
      features: ['التحدث الأساسي', 'الثقافة الإسبانية', 'السفر', 'الأعمال'],
      image: '/images/spanish-course.jpg'
    },
    {
      id: 3,
      title: 'دورة اللغة الفرنسية المتقدمة',
      level: 'متقدم',
      duration: '6 أشهر',
      instructor: 'ماري كلود',
      rating: 4.9,
      students: 650,
      price: 'مجاني',
      features: ['الأدب الفرنسي', 'الأعمال', 'السياحة', 'الثقافة'],
      image: '/images/french-course.jpg'
    }
  ];

  const lifeSkillsCourses = [
    {
      id: 1,
      title: 'إدارة الوقت والتنظيم',
      level: 'جميع المستويات',
      duration: '4 أسابيع',
      instructor: 'أحمد محمد',
      rating: 4.7,
      students: 2100,
      price: 'مجاني',
      features: ['التخطيط اليومي', 'الأولويات', 'التفويض', 'التوازن'],
      image: '/images/time-management.jpg'
    },
    {
      id: 2,
      title: 'التواصل الفعال',
      level: 'متوسط',
      duration: '6 أسابيع',
      instructor: 'فاطمة علي',
      rating: 4.8,
      students: 1800,
      price: 'مجاني',
      features: ['الاستماع النشط', 'التحدث الواضح', 'لغة الجسد', 'حل النزاعات'],
      image: '/images/communication.jpg'
    },
    {
      id: 3,
      title: 'الذكاء العاطفي',
      level: 'متقدم',
      duration: '8 أسابيع',
      instructor: 'د. سارة خالد',
      rating: 4.9,
      students: 1200,
      price: 'مجاني',
      features: ['الوعي الذاتي', 'إدارة المشاعر', 'العلاقات', 'القيادة'],
      image: '/images/emotional-intelligence.jpg'
    }
  ];

  const livingSkillsCourses = [
    {
      id: 1,
      title: 'إدارة الميزانية الشخصية',
      level: 'جميع المستويات',
      duration: '6 أسابيع',
      instructor: 'محمد علي',
      rating: 4.6,
      students: 1500,
      price: 'مجاني',
      features: ['التخطيط المالي', 'الادخار', 'الاستثمار', 'إدارة الديون'],
      image: '/images/budgeting.jpg'
    },
    {
      id: 2,
      title: 'الطبخ الصحي',
      level: 'مبتدئ',
      duration: '4 أسابيع',
      instructor: 'نورا أحمد',
      rating: 4.7,
      students: 2200,
      price: 'مجاني',
      features: ['وصفات صحية', 'التخطيط للوجبات', 'التسوق الذكي', 'حفظ الطعام'],
      image: '/images/healthy-cooking.jpg'
    },
    {
      id: 3,
      title: 'الصيانة المنزلية الأساسية',
      level: 'متوسط',
      duration: '5 أسابيع',
      instructor: 'علي حسن',
      rating: 4.5,
      students: 1100,
      price: 'مجاني',
      features: ['الإصلاحات البسيطة', 'الصيانة الوقائية', 'الأدوات الأساسية', 'الأمان'],
      image: '/images/home-maintenance.jpg'
    }
  ];

  const careerCourses = [
    {
      id: 1,
      title: 'كتابة السيرة الذاتية',
      level: 'جميع المستويات',
      duration: '3 أسابيع',
      instructor: 'د. أحمد محمد',
      rating: 4.8,
      students: 2800,
      price: 'مجاني',
      features: ['كتابة السيرة الذاتية', 'خطاب التقديم', 'مقابلات العمل', 'التسويق الذاتي'],
      image: '/images/resume-writing.jpg'
    },
    {
      id: 2,
      title: 'ريادة الأعمال للمبتدئين',
      level: 'متوسط',
      duration: '8 أسابيع',
      instructor: 'سارة خالد',
      rating: 4.7,
      students: 1600,
      price: 'مجاني',
      features: ['تطوير الأفكار', 'دراسة السوق', 'خطة العمل', 'التسويق'],
      image: '/images/entrepreneurship.jpg'
    },
    {
      id: 3,
      title: 'التسويق الرقمي',
      level: 'متقدم',
      duration: '10 أسابيع',
      instructor: 'أحمد علي',
      rating: 4.9,
      students: 900,
      price: 'مجاني',
      features: ['التسويق عبر وسائل التواصل', 'تحليل البيانات', 'إعلانات جوجل', 'تحسين محركات البحث'],
      image: '/images/digital-marketing.jpg'
    }
  ];

  const getCoursesByCategory = () => {
    switch (selectedCategory) {
      case 'languages':
        return languageCourses;
      case 'life-skills':
        return lifeSkillsCourses;
      case 'living-skills':
        return livingSkillsCourses;
      case 'career':
        return careerCourses;
      default:
        return languageCourses;
    }
  };

  const courses = getCoursesByCategory();

  return (
    <UnifiedDashboardLayout 
      accountType="player" 
      title="أكاديمية الحلم" 
      showFooter={true} 
      showFloatingChat={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">أكاديمية الحلم</h1>
                <p className="text-xl text-gray-600">تعلم اللغات والمهارات الحياتية والمعيشية تمهيداً للاحتراف</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>+15,000 طالب</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>4.8 تقييم</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" />
                <span>+50 دورة مجانية</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-medium text-sm text-center">{category.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-500 text-white">
                      {course.price}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <Badge variant="secondary" className="bg-white/90">
                      {course.level}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{course.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">{course.students} طالب</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {course.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    <BookOpen className="w-4 h-4 mr-2" />
                    ابدأ الدورة
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </UnifiedDashboardLayout>
  );
} 

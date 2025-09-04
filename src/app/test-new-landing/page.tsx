'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Star, 
  Heart, 
  Users, 
  Trophy, 
  Target,
  ArrowRight,
  Play,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function TestNewLandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const features = [
    {
      icon: <Trophy className="w-8 h-8 text-yellow-500" />,
      title: 'اكتشف المواهب',
      description: 'منصة متقدمة لاكتشاف وتطوير المواهب الرياضية'
    },
    {
      icon: <Target className="w-8 h-8 text-blue-500" />,
      title: 'تحليل الأداء',
      description: 'تحليل شامل لأداء اللاعبين باستخدام أحدث التقنيات'
    },
    {
      icon: <Users className="w-8 h-8 text-green-500" />,
      title: 'شبكة عالمية',
      description: 'ربط اللاعبين بالأندية والفرص العالمية'
    },
    {
      icon: <Star className="w-8 h-8 text-purple-500" />,
      title: 'تدريب احترافي',
      description: 'برامج تدريبية متخصصة مع نخبة المدربين'
    }
  ];

  const stats = [
    { number: '1,500+', label: 'لاعب نشط' },
    { number: '250+', label: 'نادي شريك' },
    { number: '15+', label: 'دولة' },
    { number: '800+', label: 'نجاح' }
  ];

  const testimonials = [
    {
      name: 'أحمد محمد',
      role: 'لاعب محترف',
      content: 'منصة El7lm غيرت حياتي الرياضية بالكامل!',
      rating: 5
    },
    {
      name: 'سارة أحمد',
      role: 'مدربة',
      content: 'أفضل منصة لإدارة وتطوير المواهب الرياضية',
      rating: 5
    },
    {
      name: 'محمد علي',
      role: 'مدير نادي',
      content: 'اكتشفنا مواهب رائعة من خلال هذه المنصة',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                El7lm
              </span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8 space-x-reverse">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                المميزات
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                من نحن
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                اتصل بنا
              </a>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
                ابدأ الآن
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full opacity-30 blur-3xl"></div>
          </div>

          <div className="relative z-10 text-center">
            {/* Main Title */}
            <div className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                اكتشف
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {' '}مواهبك{' '}
                </span>
                الرياضية
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                منصة شاملة لتطوير وإدارة المواهب الرياضية. نربط اللاعبين بالفرص العالمية
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="ابحث عن فرص رياضية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-16 pr-6 text-lg rounded-full border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 shadow-lg"
                />
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
                  بحث
                </Button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
                <Play className="w-5 h-5 ml-2" />
                شاهد الفيديو
              </Button>
              <Button variant="outline" className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-semibold">
                تعرف علينا
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              لماذا تختار
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}El7lm؟
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              نقدم لك أفضل الأدوات والخدمات لتطوير مواهبك الرياضية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              ماذا يقول
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}عملاؤنا؟
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-blue-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ابدأ رحلتك معنا
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              انضم إلى مجتمعنا الرياضي واكتشف إمكانياتك الحقيقية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">الدردشة المباشرة</h3>
              <p className="opacity-80">تواصل معنا مباشرة</p>
            </div>
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">الهاتف</h3>
              <p className="opacity-80">+20 101 779 9580</p>
            </div>
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-xl font-semibold mb-2">البريد الإلكتروني</h3>
              <p className="opacity-80">info@el7lm.com</p>
            </div>
          </div>

          <div className="text-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold shadow-lg transform hover:scale-105 transition-all">
              ابدأ الآن مجاناً
              <ArrowRight className="w-5 h-5 mr-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span className="text-xl font-bold">El7lm</span>
              </div>
              <p className="text-gray-400">
                منصة شاملة لتطوير وإدارة المواهب الرياضية
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">الخدمات</h3>
              <ul className="space-y-2 text-gray-400">
                <li>اكتشاف المواهب</li>
                <li>تحليل الأداء</li>
                <li>التدريب الاحترافي</li>
                <li>الربط بالأندية</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">الشركة</h3>
              <ul className="space-y-2 text-gray-400">
                <li>من نحن</li>
                <li>فريق العمل</li>
                <li>الوظائف</li>
                <li>الأخبار</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">الدعم</h3>
              <ul className="space-y-2 text-gray-400">
                <li>مركز المساعدة</li>
                <li>اتصل بنا</li>
                <li>الأسئلة الشائعة</li>
                <li>الدعم الفني</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 El7lm. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Target,
  BarChart3,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Award,
  TrendingUp,
  Heart,
  MessageSquare,
  GraduationCap,
  DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PlatformGuidePage() {
  const platformFeatures = [
    {
      icon: <Users className="w-8 h-8 text-blue-500" />,
      title: 'إدارة الملف الشخصي',
      description: 'إنشاء ملف شخصي شامل يعرض مهاراتك وإنجازاتك الرياضية',
      details: [
        'رفع الصور والفيديوهات',
        'تسجيل الإحصائيات والإنجازات',
        'عرض المهارات التقنية والبدنية',
        'تحديث البيانات الشخصية'
      ]
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-green-500" />,
      title: 'تحليل الأداء',
      description: 'تحليل متقدم لأدائك الرياضي باستخدام الذكاء الاصطناعي',
      details: [
        'تحليل الفيديوهات تلقائياً',
        'إحصائيات مفصلة عن الأداء',
        'مقارنات مع اللاعبين الآخرين',
        'توصيات للتحسين'
      ]
    },
    {
      icon: <Target className="w-8 h-8 text-purple-500" />,
      title: 'البحث عن الفرص',
      description: 'اكتشف الفرص الرياضية المناسبة لمستواك وطموحاتك',
      details: [
        'بحث ذكي عن الأندية',
        'فرص التجارب والاختبارات',
        'برامج التدريب المتخصصة',
        'المنح الرياضية'
      ]
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-orange-500" />,
      title: 'التواصل المباشر',
      description: 'تواصل مباشرة مع الأندية والمدربين والوكلاء',
      details: [
        'نظام رسائل آمن',
        'إشعارات فورية',
        'مشاركة الملفات والفيديوهات',
        'جدولة المقابلات'
      ]
    },
    {
      icon: <GraduationCap className="w-8 h-8 text-indigo-500" />,
      title: 'مدرسة منصة الحلم',
      description: 'تعليم شامل للغات والعلوم والمهارات الحياتية',
      details: [
        'تعلم اللغات المختلفة',
        'العلوم والمناهج التعليمية',
        'المهارات الحياتية والـ Life Coach',
        'الإعداد البدني والتكتيكات الكروية'
      ]
    },
    {
      icon: <DollarSign className="w-8 h-8 text-emerald-500" />,
      title: 'نظام الإحالات',
      description: 'اربح المال من خلال دعوة الأصدقاء للمنصة',
      details: [
        'دولار واحد لكل إحالة ناجحة',
        'تتبع الإحالات والأرباح',
        'سحب الأموال بسهولة',
        'رابط إحالة شخصي'
      ]
    }
  ];

  const userTypes = [
    {
      type: 'اللاعبون',
      icon: '⚽',
      color: 'from-blue-500 to-blue-600',
      benefits: [
        'عرض مواهبك للعالم',
        'تحليل أدائك بدقة',
        'التواصل مع الأندية',
        'تطوير مهاراتك في مدرسة الحلم'
      ]
    },
    {
      type: 'الأندية',
      icon: '🏆',
      color: 'from-green-500 to-green-600',
      benefits: [
        'اكتشاف المواهب الجديدة',
        'تقييم اللاعبين بدقة',
        'إدارة قاعدة بيانات اللاعبين',
        'تحليل الأداء الجماعي'
      ]
    },
    {
      type: 'المدربون',
      icon: '👨‍🏫',
      color: 'from-purple-500 to-purple-600',
      benefits: [
        'متابعة تطور اللاعبين',
        'وضع خطط تدريبية',
        'تحليل نقاط القوة والضعف',
        'تقييم الأداء المستمر'
      ]
    },
    {
      type: 'الوكلاء',
      icon: '💼',
      color: 'from-orange-500 to-orange-600',
      benefits: [
        'إدارة محفظة اللاعبين',
        'البحث عن الفرص',
        'التفاوض مع الأندية',
        'متابعة تطور المواهب'
      ]
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'إنشاء الحساب',
      description: 'سجل حساباً جديداً واختر نوع المستخدم المناسب',
      icon: <Users className="w-6 h-6" />
    },
    {
      number: '02',
      title: 'إكمال الملف الشخصي',
      description: 'أضف معلوماتك الشخصية والرياضية وارفع الصور والفيديوهات',
      icon: <Trophy className="w-6 h-6" />
    },
    {
      number: '03',
      title: 'تحليل الأداء',
      description: 'احصل على تحليل شامل لأدائك من خلال الذكاء الاصطناعي',
      icon: <BarChart3 className="w-6 h-6" />
    },
    {
      number: '04',
      title: 'التواصل والفرص',
      description: 'ابدأ التواصل مع الأندية واكتشف الفرص المناسبة لك',
      icon: <Target className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 text-center relative overflow-hidden"
      >
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.h1 
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            شرح
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}المنصة
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-600 mb-8"
          >
            اكتشف كيف تعمل منصة الحلم وكيف يمكنها مساعدتك في تحقيق أهدافك الرياضية
          </motion.p>
        </div>
      </motion.section>

      {/* Platform Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              مميزات المنصة
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              أدوات متقدمة وشاملة لتطوير مسيرتك الرياضية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {platformFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="mb-6 flex justify-center">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 text-center leading-relaxed">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              لكل نوع مستخدم
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              المنصة مصممة لتلبي احتياجات جميع أطراف المجتمع الرياضي
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {userTypes.map((user, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -10 }}
              >
                <Card className="h-full overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`bg-gradient-to-br ${user.color} p-6 text-white text-center`}>
                      <div className="text-4xl mb-3">{user.icon}</div>
                      <h3 className="text-xl font-bold">{user.type}</h3>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        {user.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-2 space-x-reverse text-sm text-gray-600">
                            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              كيف تعمل المنصة؟
            </h2>
            <p className="text-xl opacity-90 max-w-3xl mx-auto">
              أربع خطوات بسيطة للبدء في رحلتك الرياضية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">{step.number}</span>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <div className="mb-4 flex justify-center text-white/80">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-white/80 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              جاهز للبدء؟
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              انضم إلى آلاف المستخدمين الذين يطورون مسيرتهم الرياضية معنا
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = '/auth/register'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold inline-flex items-center space-x-2 space-x-reverse"
              >
                <span>ابدأ مجاناً الآن</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => window.location.href = '/contact'}
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold"
              >
                تحدث مع فريقنا
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}




'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  Users, 
  TrendingUp, 
  Heart,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CareersPage() {
  const jobs = [
    {
      title: 'مطور Frontend',
      department: 'التطوير',
      location: 'القاهرة، مصر',
      type: 'دوام كامل',
      experience: '2-4 سنوات',
      description: 'نبحث عن مطور Frontend متمرس للانضمام لفريقنا',
      requirements: [
        'خبرة في React.js و Next.js',
        'معرفة قوية بـ TypeScript',
        'خبرة في Tailwind CSS',
        'فهم جيد لـ UX/UI'
      ]
    },
    {
      title: 'محلل بيانات رياضية',
      department: 'التحليل',
      location: 'الرياض، السعودية',
      type: 'دوام كامل',
      experience: '3-5 سنوات',
      description: 'محلل بيانات متخصص في الرياضة لتحليل أداء اللاعبين',
      requirements: [
        'خبرة في تحليل البيانات الرياضية',
        'معرفة بـ Python و R',
        'خبرة في Machine Learning',
        'شغف بالرياضة'
      ]
    },
    {
      title: 'مدرب كرة قدم',
      department: 'التدريب',
      location: 'دبي، الإمارات',
      type: 'دوام جزئي',
      experience: '5+ سنوات',
      description: 'مدرب كرة قدم معتمد للعمل مع الأكاديميات الشريكة',
      requirements: [
        'شهادة تدريب معتمدة',
        'خبرة في تدريب الناشئين',
        'مهارات تواصل ممتازة',
        'القدرة على السفر'
      ]
    }
  ];

  const benefits = [
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      title: 'تأمين صحي شامل',
      description: 'تغطية طبية كاملة لك ولعائلتك'
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      title: 'نمو مهني',
      description: 'فرص تطوير وتدريب مستمرة'
    },
    {
      icon: <Users className="w-6 h-6 text-blue-500" />,
      title: 'بيئة عمل مميزة',
      description: 'فريق شغوف ومتعاون'
    },
    {
      icon: <Clock className="w-6 h-6 text-purple-500" />,
      title: 'مرونة في العمل',
      description: 'إمكانية العمل من المنزل'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 px-4 text-center"
      >
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            انضم إلى
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}فريقنا
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            كن جزءاً من رؤيتنا لتطوير الرياضة العربية وصناعة المستقبل
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg">
            تصفح الوظائف
            <ArrowRight className="w-5 h-5 mr-2" />
          </Button>
        </div>
      </motion.section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              لماذا تعمل معنا؟
            </h2>
            <p className="text-xl text-gray-600">
              نوفر بيئة عمل مثالية لتحقيق طموحاتك المهنية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="text-center h-full">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Jobs */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              الوظائف المتاحة
            </h2>
            <p className="text-xl text-gray-600">
              اكتشف الفرص المثيرة المتاحة في فريقنا
            </p>
          </motion.div>

          <div className="space-y-6">
            {jobs.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-4 space-x-reverse text-gray-600 mb-4">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Briefcase className="w-4 h-4" />
                                <span>{job.department}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <MapPin className="w-4 h-4" />
                                <span>{job.location}</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <Clock className="w-4 h-4" />
                                <span>{job.type}</span>
                              </div>
                            </div>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {job.experience}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-4">
                          {job.description}
                        </p>

                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">المتطلبات:</h4>
                          <ul className="space-y-1">
                            {job.requirements.map((req, reqIndex) => (
                              <li key={reqIndex} className="flex items-center space-x-2 space-x-reverse text-gray-600">
                                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full mb-4">
                          تقدم الآن
                        </Button>
                        <Button variant="outline" className="w-full">
                          حفظ الوظيفة
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              لم تجد الوظيفة المناسبة؟
            </h2>
            <p className="text-xl mb-8 opacity-90">
              أرسل لنا سيرتك الذاتية وسنتواصل معك عند توفر فرصة مناسبة
            </p>
            <Button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full text-lg font-semibold">
              أرسل سيرتك الذاتية
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}




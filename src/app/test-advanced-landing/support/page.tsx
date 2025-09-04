'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  HelpCircle,
  Book,
  Video,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  Send
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-500" />,
      title: 'الدردشة المباشرة',
      description: 'تواصل معنا فوراً عبر الدردشة المباشرة',
      availability: 'متاح 24/7',
      action: 'ابدأ الدردشة',
      color: 'bg-blue-500'
    },
    {
      icon: <Phone className="w-8 h-8 text-green-500" />,
      title: 'الهاتف',
      description: 'اتصل بنا مباشرة للحصول على دعم سريع',
      availability: 'الأحد - الخميس: 9ص - 6م',
      action: '+20 101 779 9580',
      color: 'bg-green-500'
    },
    {
      icon: <Mail className="w-8 h-8 text-purple-500" />,
      title: 'البريد الإلكتروني',
      description: 'أرسل لنا استفسارك وسنرد خلال 24 ساعة',
      availability: 'الرد خلال 24 ساعة',
      action: 'support@el7lm.com',
      color: 'bg-purple-500'
    }
  ];

  const helpCategories = [
    {
      icon: <Book className="w-6 h-6" />,
      title: 'دليل المستخدم',
      description: 'تعلم كيفية استخدام جميع مميزات المنصة',
      articles: 25
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: 'فيديوهات تعليمية',
      description: 'شاهد فيديوهات توضيحية خطوة بخطوة',
      articles: 15
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'الأسئلة الشائعة',
      description: 'إجابات على أكثر الأسئلة شيوعاً',
      articles: 40
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: 'استكشاف الأخطاء',
      description: 'حلول للمشاكل التقنية الشائعة',
      articles: 20
    }
  ];

  const faqs = [
    {
      question: 'كيف يمكنني إنشاء حساب جديد؟',
      answer: 'يمكنك إنشاء حساب جديد بالضغط على زر "إنشاء حساب" في أعلى الصفحة، ثم ملء البيانات المطلوبة والتأكيد عبر البريد الإلكتروني.'
    },
    {
      question: 'هل يمكنني تغيير نوع اشتراكي؟',
      answer: 'نعم، يمكنك ترقية أو تغيير نوع اشتراكك في أي وقت من خلال صفحة "إعدادات الحساب". ستدفع الفرق في السعر فقط.'
    },
    {
      question: 'كيف يمكنني رفع فيديوهات أدائي؟',
      answer: 'انتقل إلى صفحة "ملفي الشخصي"، ثم اضغط على "إضافة فيديو". يمكنك رفع فيديوهات بصيغة MP4 بحجم أقصى 100 ميجابايت.'
    },
    {
      question: 'متى سأحصل على تحليل أدائي؟',
      answer: 'يتم إنشاء تحليل الأداء تلقائياً خلال 24-48 ساعة من رفع البيانات. ستحصل على إشعار عبر البريد الإلكتروني عند اكتمال التحليل.'
    },
    {
      question: 'هل يمكنني إلغاء اشتراكي؟',
      answer: 'نعم، يمكنك إلغاء اشتراكك في أي وقت من صفحة "إعدادات الحساب". سيبقى حسابك نشطاً حتى انتهاء فترة الاشتراك الحالية.'
    },
    {
      question: 'كيف يمكنني التواصل مع الأندية؟',
      answer: 'يمكنك التواصل مع الأندية المهتمة بك من خلال نظام الرسائل الداخلي في المنصة، أو عبر معلومات الاتصال المتوفرة في ملفاتهم الشخصية.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Contact form submitted:', contactForm);
    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

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
            مركز
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}الدعم
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            نحن هنا لمساعدتك في كل خطوة. ابحث عن الإجابات أو تواصل معنا مباشرة
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Input
                type="text"
                placeholder="ابحث عن المساعدة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-14 pr-16 pl-6 text-lg rounded-full border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 shadow-lg"
              />
              <Search className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full">
                بحث
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Contact Methods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              طرق التواصل
            </h2>
            <p className="text-xl text-gray-600">
              اختر الطريقة الأنسب للتواصل معنا
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className="text-center h-full overflow-hidden">
                  <CardContent className="p-0">
                    <div className={`${method.color} p-6 text-white`}>
                      <div className="mb-4 flex justify-center">
                        {method.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {method.title}
                      </h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        {method.description}
                      </p>
                      <div className="flex items-center justify-center space-x-1 space-x-reverse text-sm text-gray-500 mb-4">
                        <Clock className="w-4 h-4" />
                        <span>{method.availability}</span>
                      </div>
                      <Button className="w-full">
                        {method.action}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              مصادر المساعدة
            </h2>
            <p className="text-xl text-gray-600">
              استكشف مكتبة شاملة من المقالات والفيديوهات التعليمية
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="cursor-pointer"
              >
                <Card className="text-center h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="mb-4 flex justify-center text-blue-500">
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {category.description}
                    </p>
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {category.articles} مقال
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              الأسئلة الشائعة
            </h2>
            <p className="text-xl text-gray-600">
              إجابات على أكثر الأسئلة شيوعاً من مستخدمينا
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full p-6 text-right hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        {expandedFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                    </button>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              لم تجد ما تبحث عنه؟
            </h2>
            <p className="text-xl text-blue-100">
              أرسل لنا رسالة وسنساعدك في أقرب وقت
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الاسم الكامل
                      </label>
                      <Input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        className="w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        className="w-full"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الموضوع
                    </label>
                    <Input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                      className="w-full"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرسالة
                    </label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold inline-flex items-center space-x-2 space-x-reverse"
                    >
                      <Send className="w-5 h-5" />
                      <span>إرسال الرسالة</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

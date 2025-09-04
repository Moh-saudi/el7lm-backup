'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  FileText,
  Video,
  Users,
  Settings
} from 'lucide-react';
import { PublicResponsiveLayoutWrapper } from '@/components/layout/PublicResponsiveLayout';

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يمكن إضافة منطق إرسال الطلب
    console.log('تم إرسال طلب الدعم:', formData);
    alert('تم إرسال طلب الدعم بنجاح! سنتواصل معك قريباً.');
  };

  const supportChannels = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: 'الدردشة المباشرة',
      description: 'تواصل مع فريق الدعم مباشرة',
      status: 'متاح الآن',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      action: () => window.open('https://wa.me/201234567890', '_blank')
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: 'الهاتف',
      description: 'اتصل بنا على الرقم المجاني',
      status: 'متاح من 8 ص - 8 م',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: () => window.open('tel:+201234567890', '_blank')
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: 'البريد الإلكتروني',
      description: 'أرسل لنا رسالة بريد إلكتروني',
      status: 'رد خلال 24 ساعة',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: () => window.open('mailto:support@academy.com', '_blank')
    }
  ];

  const faqItems = [
    {
      question: 'كيف يمكنني إنشاء حساب جديد؟',
      answer: 'يمكنك إنشاء حساب جديد من خلال الضغط على زر "تسجيل جديد" في الصفحة الرئيسية وملء البيانات المطلوبة.'
    },
    {
      question: 'كيف يمكنني إعادة تعيين كلمة المرور؟',
      answer: 'يمكنك إعادة تعيين كلمة المرور من خلال الضغط على "نسيت كلمة المرور" في صفحة تسجيل الدخول.'
    },
    {
      question: 'كيف يمكنني تحديث بياناتي الشخصية؟',
      answer: 'يمكنك تحديث بياناتك الشخصية من خلال الذهاب إلى "الملف الشخصي" في القائمة الجانبية.'
    },
    {
      question: 'كيف يمكنني التواصل مع المدرب؟',
      answer: 'يمكنك التواصل مع المدرب من خلال قسم "الرسائل" في لوحة التحكم أو من خلال صفحة المدرب.'
    }
  ];

  return (
    <PublicResponsiveLayoutWrapper>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">مركز الدعم الفني</h1>
          <p className="text-lg text-gray-600">نحن هنا لمساعدتك في أي وقت تحتاج فيه إلى دعم</p>
        </div>

        {/* قائمة التبويبات */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <Button
              variant={activeTab === 'contact' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('contact')}
              className="rounded-md"
            >
              <MessageCircle className="w-4 h-4 ml-2" />
              تواصل معنا
            </Button>
            <Button
              variant={activeTab === 'faq' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('faq')}
              className="rounded-md"
            >
              <HelpCircle className="w-4 h-4 ml-2" />
              الأسئلة الشائعة
            </Button>
            <Button
              variant={activeTab === 'resources' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('resources')}
              className="rounded-md"
            >
              <FileText className="w-4 h-4 ml-2" />
              الموارد والدليل
            </Button>
          </div>
        </div>

        {/* محتوى التبويب النشط */}
        {activeTab === 'contact' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* قنوات التواصل */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">قنوات التواصل</h2>
              {supportChannels.map((channel, index) => (
                <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${channel.bgColor}`}>
                          <div className={channel.color}>{channel.icon}</div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{channel.title}</h3>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                          <Badge variant="outline" className="mt-1">
                            {channel.status}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" onClick={channel.action}>
                        تواصل الآن
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* نموذج التواصل */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  أرسل لنا رسالة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الاسم الكامل
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        placeholder="أدخل بريدك الإلكتروني"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الموضوع
                    </label>
                    <Input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                      placeholder="أدخل موضوع الرسالة"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الأولوية
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      aria-label="اختر أولوية الطلب"
                    >
                      <option value="low">منخفضة</option>
                      <option value="medium">متوسطة</option>
                      <option value="high">عالية</option>
                      <option value="urgent">عاجلة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الرسالة
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      required
                      placeholder="اشرح مشكلتك بالتفصيل..."
                      rows={5}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <CheckCircle className="w-4 h-4 ml-2" />
                    إرسال الطلب
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">الأسئلة الشائعة</h2>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      {item.question}
                    </h3>
                    <p className="text-gray-600">{item.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">الموارد والدليل</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <FileText className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">دليل المستخدم</h3>
                  <p className="text-gray-600 mb-4">تعرف على كيفية استخدام المنصة بشكل فعال</p>
                  <Button variant="outline">تحميل الدليل</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 mx-auto text-green-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">فيديوهات تعليمية</h3>
                  <p className="text-gray-600 mb-4">شاهد فيديوهات توضيحية لجميع الميزات</p>
                  <Button variant="outline">مشاهدة الفيديوهات</Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 mx-auto text-purple-600 mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">مجتمع المستخدمين</h3>
                  <p className="text-gray-600 mb-4">انضم إلى مجتمع المستخدمين واحصل على المساعدة</p>
                  <Button variant="outline">انضم للمجتمع</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* معلومات إضافية */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">أوقات العمل</h3>
              </div>
              <p className="text-gray-600">
                فريق الدعم متاح من الأحد إلى الخميس من الساعة 8:00 صباحاً حتى 8:00 مساءً
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </PublicResponsiveLayoutWrapper>
  );
}

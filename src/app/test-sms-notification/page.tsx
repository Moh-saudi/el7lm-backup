'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function TestSMSNotificationPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState({
    profileOwnerId: 'zVOLijijQMMLByP5wwGq1cxWoeL2', // ID الحساب الذي تم إنشاؤه
    viewerId: 'hWAd3JRCJnXAowZKJ5W9qSJlA7i1', // ID المشاهد (admin)
    viewerName: 'محمد السعودي',
    viewerType: 'admin',
    viewerAccountType: 'admin',
    profileType: 'player'
  });

  // قائمة بأنواع الحسابات للاختبار
  const accountTypes = [
    { value: 'admin', label: 'الإدارة', emoji: '👑' },
    { value: 'coach', label: 'مدرب', emoji: '🎯' },
    { value: 'player', label: 'لاعب', emoji: '⚽' },
    { value: 'scout', label: 'كشاف', emoji: '🔍' },
    { value: 'club', label: 'نادي', emoji: '🏢' }
  ];

  // أسماء مختلفة للاختبار
  const testNames = [
    'أحمد المصري',
    'محمد السعودي', 
    'علي الإماراتي',
    'حسن القطري',
    'عبدالله الكويتي'
  ];

  // دالة للحصول على الرسائل حسب نوع الحساب
  const getSMSMessagesByType = (accountType: string) => {
    const baseMessages = {
      'admin': [
        `يا محمد، محمد السعودي من الإدارة شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
        `يا محمد، محمد السعودي من الإدارة معجب بموهبتك على منصة الحلم! النجاح قريب جداً 🚀`,
        `يا محمد، محمد السعودي من الإدارة يتابعك الآن على منصة الحلم! فرصة ذهبية لا تفوتها ⭐`,
        `يا محمد، محمد السعودي من الإدارة اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
        `يا محمد، محمد السعودي من الإدارة مهتم بك على منصة الحلم! خطوة للقمة 🏅`
      ],
      'coach': [
        `يا محمد، المدرب محمد السعودي شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
        `يا محمد، المدرب محمد السعودي معجب بمهاراتك على منصة الحلم! فرصة تدريبية ذهبية 🚀`,
        `يا محمد، المدرب محمد السعودي يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
        `يا محمد، المدرب محمد السعودي اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
        `يا محمد، المدرب محمد السعودي مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
      ],
      'player': [
        `يا محمد، اللاعب محمد السعودي شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
        `يا محمد، اللاعب محمد السعودي معجب بمهاراتك على منصة الحلم! فرصة للتعاون 🚀`,
        `يا محمد، اللاعب محمد السعودي يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
        `يا محمد، اللاعب محمد السعودي اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
        `يا محمد، اللاعب محمد السعودي مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
      ],
      'scout': [
        `يا محمد، الكشاف محمد السعودي شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
        `يا محمد، الكشاف محمد السعودي معجب بموهبتك على منصة الحلم! فرصة اكتشاف ذهبية 🚀`,
        `يا محمد، الكشاف محمد السعودي يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
        `يا محمد، الكشاف محمد السعودي اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
        `يا محمد، الكشاف محمد السعودي مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
      ],
      'club': [
        `يا محمد، نادي محمد السعودي شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
        `يا محمد، نادي محمد السعودي معجب بموهبتك على منصة الحلم! فرصة انضمام ذهبية 🚀`,
        `يا محمد، نادي محمد السعودي يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
        `يا محمد، نادي محمد السعودي اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
        `يا محمد، نادي محمد السعودي مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
      ]
    };
    
    return baseMessages[accountType] || baseMessages['player'];
  };

  const handleTestSMSNotification = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      console.log('🧪 بدء اختبار SMS إشعار مشاهدة الملف...');
      console.log('📋 بيانات الاختبار:', formData);

      const response = await fetch('/api/notifications/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'profile_view',
          ...formData
        }),
      });

      const data = await response.json();
      console.log('📱 نتيجة الاختبار:', data);

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'فشل في إرسال الإشعار');
      }
    } catch (error) {
      console.error('❌ خطأ في الاختبار:', error);
      setError('حدث خطأ في الاختبار');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">🧪 اختبار SMS الإشعارات</h1>
        <p className="text-gray-600 text-center">
          اختبار نظام إرسال SMS عند مشاهدة الملف الشخصي
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            اختبار إشعار مشاهدة الملف
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="profileOwnerId">ID صاحب الملف</Label>
              <Input
                id="profileOwnerId"
                value={formData.profileOwnerId}
                onChange={(e) => setFormData(prev => ({ ...prev, profileOwnerId: e.target.value }))}
                placeholder="ID صاحب الملف"
              />
            </div>
            <div>
              <Label htmlFor="viewerId">ID المشاهد</Label>
              <Input
                id="viewerId"
                value={formData.viewerId}
                onChange={(e) => setFormData(prev => ({ ...prev, viewerId: e.target.value }))}
                placeholder="ID المشاهد"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewerName">اسم المشاهد</Label>
              <Input
                id="viewerName"
                value={formData.viewerName}
                onChange={(e) => setFormData(prev => ({ ...prev, viewerName: e.target.value }))}
                placeholder="اسم المشاهد"
              />
            </div>
            <div>
              <Label htmlFor="viewerType">نوع المشاهد</Label>
              <Input
                id="viewerType"
                value={formData.viewerType}
                onChange={(e) => setFormData(prev => ({ ...prev, viewerType: e.target.value }))}
                placeholder="نوع المشاهد"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="viewerAccountType">نوع حساب المشاهد</Label>
              <Input
                id="viewerAccountType"
                value={formData.viewerAccountType}
                onChange={(e) => setFormData(prev => ({ ...prev, viewerAccountType: e.target.value }))}
                placeholder="نوع حساب المشاهد"
              />
            </div>
            <div>
              <Label htmlFor="profileType">نوع الملف</Label>
              <Input
                id="profileType"
                value={formData.profileType}
                onChange={(e) => setFormData(prev => ({ ...prev, profileType: e.target.value }))}
                placeholder="نوع الملف"
              />
            </div>
          </div>

          <Button
            onClick={handleTestSMSNotification}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                جاري الاختبار...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                اختبار إرسال SMS
              </>
            )}
          </Button>

          {/* أزرار سريعة لاختبار الأنواع المختلفة */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-3 text-gray-700">اختبار سريع حسب نوع الحساب:</h4>
            <div className="grid grid-cols-2 gap-2">
              {accountTypes.map((type) => (
                <Button
                  key={type.value}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={() => {
                    const randomName = testNames[Math.floor(Math.random() * testNames.length)];
                    setFormData(prev => ({
                      ...prev,
                      viewerName: randomName,
                      viewerType: type.value,
                      viewerAccountType: type.value
                    }));
                  }}
                  className="text-xs"
                >
                  <span className="mr-1">{type.emoji}</span>
                  {type.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700 mb-2">
              <CheckCircle className="w-5 h-5" />
              <h3 className="font-semibold">✅ نجح الاختبار!</h3>
            </div>
            <pre className="text-sm bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mt-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold">❌ فشل الاختبار</h3>
            </div>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

             <Card className="mt-6">
         <CardHeader>
           <CardTitle>📋 معلومات الاختبار</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-2 text-sm">
             <p><strong>الهدف:</strong> اختبار إرسال SMS عند مشاهدة ملف شخصي</p>
             <p><strong>الرسالة المتوقعة:</strong> رسالة SMS قصيرة تحتوي على اسم المشاهد ونوع الحساب</p>
             <p><strong>المستلم:</strong> صاحب الملف الشخصي (رقم الهاتف: +201017799580)</p>
             <p><strong>المشاهد:</strong> المستخدم الذي يشاهد الملف</p>
           </div>
         </CardContent>
       </Card>

       {/* عرض الرسائل المتوقعة حسب نوع الحساب */}
       <Card className="mt-6">
         <CardHeader>
           <CardTitle>📱 الرسائل المتوقعة حسب نوع الحساب</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {accountTypes.map((type) => (
               <div key={type.value} className="border rounded-lg p-3">
                 <h4 className="font-medium mb-2 flex items-center gap-2">
                   <span>{type.emoji}</span>
                   {type.label}
                 </h4>
                 <div className="space-y-1 text-sm text-gray-600">
                   {getSMSMessagesByType(type.value).map((message, index) => (
                     <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                       {message}
                     </div>
                   ))}
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
    </div>
  );
}

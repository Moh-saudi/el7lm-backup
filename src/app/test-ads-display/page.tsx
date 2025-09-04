'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Eye, Target, Users, BarChart3 } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import AdBanner from '@/components/ads/AdBanner';
import ProfessionalAdPopup from '@/components/ads/ProfessionalAdPopup';

interface Ad {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
  priority: number;
  targetAudience: 'all' | 'new_users' | 'returning_users';
  startDate?: string;
  endDate?: string;
  views: number;
  clicks: number;
}

export default function TestAdsDisplay() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAds: 0,
    activeAds: 0,
    totalViews: 0,
    totalClicks: 0
  });

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      console.log('🔍 جاري جلب الإعلانات...');
      const q = query(
        collection(db, 'ads'),
        orderBy('priority', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const adsData: Ad[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        views: doc.data().views || 0,
        clicks: doc.data().clicks || 0
      })) as Ad[];
      
      setAds(adsData);
      
      // حساب الإحصائيات
      const totalViews = adsData.reduce((sum, ad) => sum + ad.views, 0);
      const totalClicks = adsData.reduce((sum, ad) => sum + ad.clicks, 0);
      const activeAds = adsData.filter(ad => ad.isActive).length;
      
      setStats({
        totalAds: adsData.length,
        activeAds,
        totalViews,
        totalClicks
      });
      
      console.log('✅ تم جلب الإعلانات:', adsData.length);
    } catch (error) {
      console.error('❌ خطأ في جلب الإعلانات:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'text': return '📝';
      default: return '📄';
    }
  };

  const getTargetAudienceText = (audience: string) => {
    switch (audience) {
      case 'all': return 'للجميع';
      case 'new_users': return 'مستخدمين جدد';
      case 'returning_users': return 'مستخدمين عائدين';
      default: return audience;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        ✅ نشط
      </Badge>
    ) : (
      <Badge variant="destructive">
        ❌ غير نشط
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            اختبار عرض الإعلانات على الاندج بيدج
          </h1>
          <p className="text-lg text-gray-600">
            فحص كيفية ظهور الإعلانات في الصفحة الرئيسية
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي الإعلانات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">الإعلانات النشطة</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeAds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Eye className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي النقرات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button 
            onClick={fetchAds} 
            disabled={loading}
            className="px-8 py-3 h-12 text-lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                جاري التحديث...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                تحديث الإعلانات
              </>
            )}
          </Button>
        </div>

        {/* All Ads List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              جميع الإعلانات في النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : ads.length === 0 ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  لا توجد إعلانات في النظام. قم بإضافة إعلانات من لوحة التحكم.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="p-4 border rounded-lg bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{getAdTypeIcon(ad.type)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                          {getStatusBadge(ad.isActive)}
                        </div>
                        <p className="text-gray-600 mb-3">{ad.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>الأولوية: {ad.priority}</span>
                          <span>الجمهور: {getTargetAudienceText(ad.targetAudience)}</span>
                          <span>المشاهدات: {ad.views}</span>
                          <span>النقرات: {ad.clicks}</span>
                        </div>
                        {ad.mediaUrl && (
                          <div className="mt-3">
                            <span className="text-sm text-gray-500">الوسائط: </span>
                            <a href={ad.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {ad.mediaUrl}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ad Banner Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              معاينة Ad Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg">
              <AdBanner maxAds={3} className="max-w-4xl mx-auto" />
            </div>
          </CardContent>
        </Card>

        {/* Professional Ad Popup Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              معاينة Professional Ad Popup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
              <ProfessionalAdPopup 
                maxAds={1}
                enableAnalytics={true}
                userPreferences={{
                  allowAds: true,
                  preferredTypes: ['modal', 'toast', 'banner'],
                  maxDisplaysPerDay: 3
                }}
              />
              <p className="text-center text-gray-600 mt-4">
                سيظهر الإعلان المنبثق بعد بضع ثوانٍ إذا كان هناك إعلانات نشطة
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              تعليمات الاختبار
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-orange-700 space-y-2">
              <p>• تأكد من وجود إعلانات نشطة في النظام</p>
              <p>• تحقق من أن الإعلانات تستهدف الجمهور الصحيح</p>
              <p>• اختبر الإعلانات على الصفحة الرئيسية الفعلية</p>
              <p>• راقب الإحصائيات في لوحة التحكم</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-sm font-medium text-gray-900 mb-2">للاختبار على الصفحة الرئيسية:</p>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>اذهب إلى الصفحة الرئيسية</li>
                <li>تحقق من ظهور Ad Banner</li>
                <li>انتظر ظهور Professional Ad Popup</li>
                <li>اختبر النقر على الإعلانات</li>
                <li>تحقق من تحديث الإحصائيات</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


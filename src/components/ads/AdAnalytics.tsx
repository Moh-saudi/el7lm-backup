'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Eye, 
  MousePointer,
  Clock,
  Calendar,
  DollarSign,
  Activity,
  Zap,
  Trophy
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface AdAnalytics {
  id: string;
  title: string;
  views: number;
  clicks: number;
  ctr: number; // Click Through Rate
  avgViewTime: number;
  conversionRate: number;
  revenue: number;
  cost: number;
  roi: number;
  urgency: string;
  popupType: string;
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

interface AdAnalyticsProps {
  className?: string;
  timeRange?: 'today' | 'week' | 'month' | 'all';
}

export default function AdAnalytics({ className = '', timeRange = 'week' }: AdAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AdAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'ads'),
        where('isActive', '==', true),
        orderBy('priority', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const adsData = snapshot.docs.map(doc => {
        const data = doc.data();
        const views = data.views || 0;
        const clicks = data.clicks || 0;
        const ctr = views > 0 ? (clicks / views) * 100 : 0;
        const avgViewTime = data.avgViewTime || 0;
        const conversionRate = data.conversionRate || 0;
        const revenue = data.revenue || 0;
        const cost = data.cost || 0;
        const roi = cost > 0 ? ((revenue - cost) / cost) * 100 : 0;
        
        // Calculate performance based on metrics
        let performance: 'excellent' | 'good' | 'average' | 'poor' = 'average';
        if (ctr > 5 && roi > 200) performance = 'excellent';
        else if (ctr > 3 && roi > 100) performance = 'good';
        else if (ctr > 1 && roi > 0) performance = 'average';
        else performance = 'poor';

        return {
          id: doc.id,
          title: data.title,
          views,
          clicks,
          ctr,
          avgViewTime,
          conversionRate,
          revenue,
          cost,
          roi,
          urgency: data.urgency || 'medium',
          popupType: data.popupType || 'modal',
          performance
        };
      });

      setAnalytics(adsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'average': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPerformanceIcon = (performance: string) => {
    switch (performance) {
      case 'excellent': return <TrendingUp className="h-4 w-4" />;
      case 'good': return <Activity className="h-4 w-4" />;
      case 'average': return <BarChart3 className="h-4 w-4" />;
      case 'poor': return <TrendingDown className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPopupTypeColor = (type: string) => {
    switch (type) {
      case 'modal': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'toast': return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      case 'banner': return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'side-panel': return 'text-teal-600 bg-teal-50 border-teal-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const totalViews = analytics.reduce((sum, ad) => sum + ad.views, 0);
  const totalClicks = analytics.reduce((sum, ad) => sum + ad.clicks, 0);
  const avgCTR = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;
  const totalRevenue = analytics.reduce((sum, ad) => sum + ad.revenue, 0);
  const totalCost = analytics.reduce((sum, ad) => sum + ad.cost, 0);
  const totalROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  const topPerformingAd = analytics.reduce((best, current) => 
    current.ctr > best.ctr ? current : best, analytics[0] || null
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">تحليلات الإعلانات المنبثقة</h2>
          <p className="text-gray-600">إحصائيات مفصلة عن أداء الإعلانات المنبثقة</p>
        </div>
        <div className="flex gap-2">
          {['today', 'week', 'month', 'all'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range as any)}
            >
              {range === 'today' ? 'اليوم' :
               range === 'week' ? 'الأسبوع' :
               range === 'month' ? 'الشهر' : 'الكل'}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +12.5%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">معدل النقر</p>
                <p className="text-2xl font-bold text-gray-900">{avgCTR.toFixed(2)}%</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +8.3%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <MousePointer className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +15.2%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">عائد الاستثمار</p>
                <p className="text-2xl font-bold text-gray-900">{totalROI.toFixed(1)}%</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +22.1%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Ad */}
      {topPerformingAd && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Trophy className="h-5 w-5" />
              أفضل إعلان أداءً
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-green-800">{topPerformingAd.title}</h4>
                <p className="text-sm text-green-600">أعلى معدل نقر</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-800">{topPerformingAd.ctr.toFixed(2)}%</p>
                <p className="text-sm text-green-600">معدل النقر</p>
              </div>
              <div className="text-right">
                <Badge className={getPerformanceColor(topPerformingAd.performance)}>
                  {getPerformanceIcon(topPerformingAd.performance)}
                  <span className="mr-1">
                    {topPerformingAd.performance === 'excellent' ? 'ممتاز' :
                     topPerformingAd.performance === 'good' ? 'جيد' :
                     topPerformingAd.performance === 'average' ? 'متوسط' : 'ضعيف'}
                  </span>
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>تحليل مفصل للإعلانات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-medium">الإعلان</th>
                  <th className="text-center py-3 px-4 font-medium">المشاهدات</th>
                  <th className="text-center py-3 px-4 font-medium">النقرات</th>
                  <th className="text-center py-3 px-4 font-medium">معدل النقر</th>
                  <th className="text-center py-3 px-4 font-medium">الإيرادات</th>
                  <th className="text-center py-3 px-4 font-medium">عائد الاستثمار</th>
                  <th className="text-center py-3 px-4 font-medium">الأداء</th>
                  <th className="text-center py-3 px-4 font-medium">النوع</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((ad) => (
                  <tr key={ad.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium">{ad.title}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge className={getUrgencyColor(ad.urgency)}>
                            {ad.urgency === 'critical' ? 'عاجل' :
                             ad.urgency === 'high' ? 'مهم' :
                             ad.urgency === 'medium' ? 'عادي' : 'منخفض'}
                          </Badge>
                          <Badge className={getPopupTypeColor(ad.popupType)}>
                            {ad.popupType === 'modal' ? 'مركزي' :
                             ad.popupType === 'toast' ? 'إشعار' :
                             ad.popupType === 'banner' ? 'شريط' : 'جانبي'}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">{ad.views.toLocaleString()}</td>
                    <td className="text-center py-3 px-4">{ad.clicks.toLocaleString()}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-medium ${
                        ad.ctr > 5 ? 'text-green-600' :
                        ad.ctr > 3 ? 'text-blue-600' :
                        ad.ctr > 1 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ad.ctr.toFixed(2)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">${ad.revenue.toLocaleString()}</td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-medium ${
                        ad.roi > 200 ? 'text-green-600' :
                        ad.roi > 100 ? 'text-blue-600' :
                        ad.roi > 0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {ad.roi.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge className={getPerformanceColor(ad.performance)}>
                        {getPerformanceIcon(ad.performance)}
                        <span className="mr-1">
                          {ad.performance === 'excellent' ? 'ممتاز' :
                           ad.performance === 'good' ? 'جيد' :
                           ad.performance === 'average' ? 'متوسط' : 'ضعيف'}
                        </span>
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge className={getPopupTypeColor(ad.popupType)}>
                        {ad.popupType === 'modal' ? 'مركزي' :
                         ad.popupType === 'toast' ? 'إشعار' :
                         ad.popupType === 'banner' ? 'شريط' : 'جانبي'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


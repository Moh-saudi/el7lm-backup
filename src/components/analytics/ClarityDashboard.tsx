'use client';

import { useState, useEffect } from 'react';
import { useClarityApi } from '@/hooks/useClarityApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  RefreshCw, 
  Users, 
  Eye, 
  MousePointer, 
  Clock, 
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

const ClarityDashboard: React.FC = () => {
  const {
    clarityApi,
    loading,
    error,
    insights,
    sessions,
    initializeApi,
    fetchInsights,
    exportSessions,
    exportToCSV,
    exportToJSON,
    clearError,
  } = useClarityApi();

  const [projectId, setProjectId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // تحميل الإعدادات المحفوظة
    const savedProjectId = localStorage.getItem('clarity_project_id');
    const savedApiKey = localStorage.getItem('clarity_api_key');
    
    if (savedProjectId && savedApiKey) {
      setProjectId(savedProjectId);
      setApiKey(savedApiKey);
      initializeApi(savedProjectId, savedApiKey);
    }
  }, [initializeApi]);

  const handleInitialize = () => {
    if (!projectId || !apiKey) {
      toast.error('يرجى إدخال Project ID و API Key');
      return;
    }

    // حفظ الإعدادات
    localStorage.setItem('clarity_project_id', projectId);
    localStorage.setItem('clarity_api_key', apiKey);
    
    initializeApi(projectId, apiKey);
    toast.success('تم تهيئة Clarity API بنجاح');
  };

  const handleFetchInsights = async () => {
    await fetchInsights(dateRange);
    if (!error) {
      toast.success('تم جلب الرؤى بنجاح');
    }
  };

  const handleExportSessions = async () => {
    await exportSessions(dateRange);
    if (!error && sessions) {
      toast.success(`تم تصدير ${sessions.length} جلسة`);
    }
  };

  const handleExportToCSV = () => {
    if (sessions && sessions.length > 0) {
      exportToCSV(sessions, `clarity-sessions-${dateRange.start}-to-${dateRange.end}`);
    } else {
      toast.error('لا توجد جلسات للتصدير');
    }
  };

  const handleExportToJSON = () => {
    if (insights) {
      exportToJSON(insights, `clarity-insights-${dateRange.start}-to-${dateRange.end}`);
    } else {
      toast.error('لا توجد رؤى للتصدير');
    }
  };

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Microsoft Clarity Dashboard
            </h1>
            <p className="text-gray-600 mt-2">إدارة وتحليل بيانات Clarity</p>
          </div>
          <Badge variant="outline" className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700">
            API Calls: 10/10 يومياً
          </Badge>
        </div>

      {/* إعدادات API */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
          <CardTitle className="text-xl font-bold text-gray-800">إعدادات Clarity API</CardTitle>
          <CardDescription className="text-gray-600">
            أدخل Project ID و API Key للوصول إلى بيانات Clarity
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="projectId" className="text-gray-700 font-medium">Project ID</Label>
              <Input
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="أدخل Project ID"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="apiKey" className="text-gray-700 font-medium">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="أدخل API Key"
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-gray-700 font-medium">تاريخ البداية</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-gray-700 font-medium">تاريخ النهاية</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>
          </div>
          <Button 
            onClick={handleInitialize} 
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            تهيئة API
          </Button>
        </CardContent>
      </Card>

      {/* أخطاء */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={clearError}
            >
              إغلاق
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* أزرار التحكم */}
      {clarityApi && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-gray-800">التحكم في البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleFetchInsights} 
                disabled={loading}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                جلب الرؤى
              </Button>
              <Button 
                onClick={handleExportSessions} 
                disabled={loading}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Users className="w-4 h-4 mr-2" />
                تصدير الجلسات
              </Button>
              <Button 
                onClick={handleExportToCSV} 
                disabled={!sessions || sessions.length === 0}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير CSV
              </Button>
              <Button 
                onClick={handleExportToJSON} 
                disabled={!insights}
                className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                تصدير JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* عرض الرؤى */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">الجلسات</p>
                  <p className="text-2xl font-bold text-blue-900">{insights.sessions?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">مشاهدات الصفحة</p>
                  <p className="text-2xl font-bold text-green-900">{insights.pageViews?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                  <MousePointer className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-700">معدل الارتداد</p>
                  <p className="text-2xl font-bold text-orange-900">{insights.bounceRate?.toFixed(1) || 0}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">متوسط مدة الجلسة</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {insights.averageSessionDuration ? 
                      `${Math.floor(insights.averageSessionDuration / 60)}:${(insights.averageSessionDuration % 60).toString().padStart(2, '0')}` : 
                      '0:00'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* تفصيل الأجهزة */}
      {insights?.deviceBreakdown && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-gray-800">توزيع الأجهزة</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                  <Monitor className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-700">سطح المكتب</p>
                  <p className="text-2xl font-bold text-blue-900">{insights.deviceBreakdown.desktop}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">الهاتف المحمول</p>
                  <p className="text-2xl font-bold text-green-900">{insights.deviceBreakdown.mobile}%</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
                <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                  <Tablet className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-700">التابلت</p>
                  <p className="text-2xl font-bold text-orange-900">{insights.deviceBreakdown.tablet}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* عرض الجلسات */}
      {sessions && sessions.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-gray-800">الجلسات المصدرة ({sessions.length})</CardTitle>
            <CardDescription className="text-gray-600">
              آخر {sessions.length} جلسة من Clarity
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {sessions.slice(0, 10).map((session, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">جلسة #{session.sessionId?.slice(-8)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(session.startTime).toLocaleString('ar-SA')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-blue-600">{session.duration} ثانية</p>
                      <p className="text-sm text-gray-600">{session.pageViews} صفحة</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center bg-white px-2 py-1 rounded-full">
                      <Globe className="w-4 h-4 mr-1 text-blue-500" />
                      {session.country || 'غير محدد'}
                    </span>
                    <span className="flex items-center bg-white px-2 py-1 rounded-full">
                      <Monitor className="w-4 h-4 mr-1 text-green-500" />
                      {session.device || 'غير محدد'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClarityDashboard;

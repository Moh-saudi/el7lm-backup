'use client';

import React, { useState } from 'react';
import { Download, FileText, Table, Code, Calendar, Settings, Filter, Users, DollarSign, BarChart3, Database, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  dataType: 'users' | 'payments' | 'financial' | 'system' | 'comprehensive';
  fileName?: string;
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    status?: string;
    type?: string;
    country?: string;
  };
  includeCharts?: boolean;
  language?: 'ar' | 'en';
}

interface ExportManagerProps {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
}

export default function ExportManager({ isOpen, onClose, adminId }: ExportManagerProps) {
  const [exportConfig, setExportConfig] = useState<ExportConfig>({
    format: 'excel',
    dataType: 'users',
    fileName: '',
    filters: {},
    includeCharts: false,
    language: 'ar'
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      
      // تحديد اسم الملف إذا لم يتم تحديده
      let fileName = exportConfig.fileName;
      if (!fileName) {
        const timestamp = new Date().toISOString().split('T')[0];
        fileName = `${exportConfig.dataType}_export_${timestamp}`;
      }

      console.log('🔄 [Export] بدء عملية التصدير:', exportConfig);

      // محاكاة عملية التصدير (استبدال بالتطبيق الحقيقي)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // إنشاء محتوى نموذجي للتصدير
      let content = '';
      switch (exportConfig.format) {
        case 'csv':
          content = 'الاسم,البريد,النوع,التاريخ\nمحمد أحمد,test@example.com,player,2024-01-01';
          break;
        case 'json':
          content = JSON.stringify({
            data: [{ name: 'محمد أحمد', email: 'test@example.com', type: 'player' }],
            metadata: { exportedAt: new Date(), totalRecords: 1 }
          }, null, 2);
          break;
        default:
          content = `تقرير ${exportConfig.dataType}\nتم التصدير في: ${new Date().toLocaleString('ar-SA')}`;
      }

      // تنزيل الملف
      const blob = new Blob([content], { 
        type: exportConfig.format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.${exportConfig.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // إضافة إلى سجل التصدير
      const newExport = {
        id: Date.now().toString(),
        config: exportConfig,
        timestamp: new Date(),
        status: 'completed',
        fileName: `${fileName}.${exportConfig.format}`
      };

      setExportHistory(prev => [newExport, ...prev.slice(0, 9)]); // آخر 10 عمليات تصدير

      console.log('✅ [Export] تم التصدير بنجاح');
      
    } catch (error) {
      console.error('❌ [Export] خطأ في التصدير:', error);
      alert('حدث خطأ أثناء التصدير. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'excel':
        return <Table className="w-4 h-4 text-green-500" />;
      case 'csv':
        return <Database className="w-4 h-4 text-blue-500" />;
      case 'json':
        return <Code className="w-4 h-4 text-purple-500" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'users':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'payments':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'financial':
        return <BarChart3 className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      case 'comprehensive':
        return <Database className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDataTypeLabel = (dataType: string) => {
    const labels = {
      users: 'بيانات المستخدمين',
      payments: 'بيانات المدفوعات',
      financial: 'التقرير المالي',
      system: 'إحصائيات النظام',
      comprehensive: 'التقرير الشامل'
    };
    return labels[dataType as keyof typeof labels] || dataType;
  };

  const getFormatLabel = (format: string) => {
    const labels = {
      pdf: 'PDF',
      excel: 'Excel (XLSX)',
      csv: 'CSV',
      json: 'JSON'
    };
    return labels[format as keyof typeof labels] || format;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-2xl font-bold text-white">مدير التصدير المتقدم</h2>
                  <p className="text-green-100">تصدير البيانات بتنسيقات متعددة مع فلاتر متقدمة</p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
              {/* إعدادات التصدير */}
              <div className="lg:col-span-2 space-y-6">
                {/* نوع البيانات */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-blue-600" />
                      نوع البيانات المراد تصديرها
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: 'users', label: 'المستخدمين', icon: Users, description: 'جميع أنواع المستخدمين' },
                        { value: 'payments', label: 'المدفوعات', icon: DollarSign, description: 'سجل المعاملات المالية' },
                        { value: 'financial', label: 'التقرير المالي', icon: BarChart3, description: 'تحليل مالي شامل' },
                        { value: 'system', label: 'النظام', icon: Settings, description: 'إحصائيات النظام' },
                        { value: 'comprehensive', label: 'شامل', icon: Database, description: 'جميع البيانات' }
                      ].map((type) => (
                        <div
                          key={type.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            exportConfig.dataType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setExportConfig(prev => ({ ...prev, dataType: type.value as any }))}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <type.icon className="w-5 h-5 text-blue-600" />
                            <span className="font-medium">{type.label}</span>
                          </div>
                          <p className="text-xs text-gray-600">{type.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* تنسيق التصدير */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-600" />
                      تنسيق الملف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: 'excel', label: 'Excel', icon: Table, color: 'text-green-600', description: 'جداول بيانات' },
                        { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-600', description: 'مستند مطبوع' },
                        { value: 'csv', label: 'CSV', icon: Database, color: 'text-blue-600', description: 'بيانات نصية' },
                        { value: 'json', label: 'JSON', icon: Code, color: 'text-purple-600', description: 'بيانات برمجية' }
                      ].map((format) => (
                        <div
                          key={format.value}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            exportConfig.format === format.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setExportConfig(prev => ({ ...prev, format: format.value as any }))}
                        >
                          <div className="flex flex-col items-center text-center">
                            <format.icon className={`w-8 h-8 ${format.color} mb-2`} />
                            <span className="font-medium">{format.label}</span>
                            <span className="text-xs text-gray-600">{format.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* إعدادات إضافية */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-purple-600" />
                      إعدادات إضافية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* اسم الملف */}
                    <div>
                      <label className="block text-sm font-medium mb-2">اسم الملف (اختياري)</label>
                      <Input
                        placeholder="سيتم إنشاء اسم تلقائي إذا لم يتم التحديد"
                        value={exportConfig.fileName}
                        onChange={(e) => setExportConfig(prev => ({ ...prev, fileName: e.target.value }))}
                      />
                    </div>

                    {/* اللغة */}
                    <div>
                      <label className="block text-sm font-medium mb-2">لغة التقرير</label>
                      <Select 
                        value={exportConfig.language} 
                        onValueChange={(value) => setExportConfig(prev => ({ ...prev, language: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* إدراج الرسوم البيانية */}
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="includeCharts"
                        checked={exportConfig.includeCharts}
                        onCheckedChange={(checked) => 
                          setExportConfig(prev => ({ ...prev, includeCharts: !!checked }))
                        }
                      />
                      <label htmlFor="includeCharts" className="text-sm font-medium">
                        إدراج الرسوم البيانية والإحصائيات المرئية
                      </label>
                    </div>
                  </CardContent>
                </Card>

                {/* فلاتر البيانات */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="w-5 h-5 text-orange-600" />
                      فلاتر البيانات
                    </CardTitle>
                    <CardDescription>
                      تحديد البيانات المراد تصديرها حسب معايير محددة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* فلتر التاريخ */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">من تاريخ</label>
                        <Input
                          type="date"
                          onChange={(e) => setExportConfig(prev => ({
                            ...prev,
                            filters: { ...prev.filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined }
                          }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">إلى تاريخ</label>
                        <Input
                          type="date"
                          onChange={(e) => setExportConfig(prev => ({
                            ...prev,
                            filters: { ...prev.filters, dateTo: e.target.value ? new Date(e.target.value) : undefined }
                          }))}
                        />
                      </div>
                    </div>

                    {/* فلاتر حسب نوع البيانات */}
                    {exportConfig.dataType === 'payments' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">حالة المدفوعة</label>
                        <Select 
                          onValueChange={(value) => setExportConfig(prev => ({
                            ...prev,
                            filters: { ...prev.filters, status: value === 'all' ? undefined : value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="جميع الحالات" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الحالات</SelectItem>
                            <SelectItem value="completed">مكتملة</SelectItem>
                            <SelectItem value="pending">معلقة</SelectItem>
                            <SelectItem value="failed">فاشلة</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {exportConfig.dataType === 'users' && (
                      <div>
                        <label className="block text-sm font-medium mb-2">نوع المستخدم</label>
                        <Select 
                          onValueChange={(value) => setExportConfig(prev => ({
                            ...prev,
                            filters: { ...prev.filters, type: value === 'all' ? undefined : value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="جميع الأنواع" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">جميع الأنواع</SelectItem>
                            <SelectItem value="players">اللاعبين</SelectItem>
                            <SelectItem value="clubs">الأندية</SelectItem>
                            <SelectItem value="academies">الأكاديميات</SelectItem>
                            <SelectItem value="trainers">المدربين</SelectItem>
                            <SelectItem value="agents">الوكلاء</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* معاينة وإجراءات */}
              <div className="space-y-6">
                {/* معاينة الإعدادات */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معاينة التصدير</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      {getDataTypeIcon(exportConfig.dataType)}
                      <span className="font-medium">{getDataTypeLabel(exportConfig.dataType)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getFormatIcon(exportConfig.format)}
                      <span className="font-medium">{getFormatLabel(exportConfig.format)}</span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div>اللغة: {exportConfig.language === 'ar' ? 'العربية' : 'English'}</div>
                      <div>الرسوم البيانية: {exportConfig.includeCharts ? 'مدرجة' : 'غير مدرجة'}</div>
                    </div>

                    {/* الفلاتر النشطة */}
                    {Object.keys(exportConfig.filters || {}).length > 0 && (
                      <div>
                        <div className="text-sm font-medium mb-2">الفلاتر النشطة:</div>
                        <div className="space-y-1">
                          {exportConfig.filters?.dateFrom && (
                            <Badge variant="outline" className="text-xs">
                              من: {exportConfig.filters.dateFrom.toLocaleDateString('ar-SA')}
                            </Badge>
                          )}
                          {exportConfig.filters?.dateTo && (
                            <Badge variant="outline" className="text-xs">
                              إلى: {exportConfig.filters.dateTo.toLocaleDateString('ar-SA')}
                            </Badge>
                          )}
                          {exportConfig.filters?.status && (
                            <Badge variant="outline" className="text-xs">
                              حالة: {exportConfig.filters.status}
                            </Badge>
                          )}
                          {exportConfig.filters?.type && (
                            <Badge variant="outline" className="text-xs">
                              نوع: {exportConfig.filters.type}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* زر التصدير */}
                <Card>
                  <CardContent className="p-4">
                    <Button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      size="lg"
                    >
                      {isExporting ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          جاري التصدير...
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5 ml-2" />
                          بدء التصدير
                        </>
                      )}
                    </Button>
                    
                    {isExporting && (
                      <div className="mt-3 text-center">
                        <div className="text-sm text-gray-600">يتم تحضير الملف...</div>
                        <div className="text-xs text-gray-500 mt-1">قد تستغرق العملية بضع دقائق للبيانات الكبيرة</div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* سجل التصدير الأخير */}
                {exportHistory.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">آخر عمليات التصدير</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {exportHistory.slice(0, 5).map((export_) => (
                          <div key={export_.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            {getFormatIcon(export_.config.format)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">
                                {getDataTypeLabel(export_.config.dataType)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {export_.timestamp.toLocaleTimeString('ar-SA')}
                              </div>
                            </div>
                            <Badge 
                              variant={export_.status === 'completed' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {export_.status === 'completed' ? 'مكتمل' : 'فشل'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

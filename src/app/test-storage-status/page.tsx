'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Upload, Download } from 'lucide-react';

// إنشاء Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface StorageStatus {
  bucketExists: boolean;
  bucketPublic: boolean;
  policiesExist: boolean;
  policiesCount: number;
  canUpload: boolean;
  canDownload: boolean;
  lastError: string | null;
}

export default function TestStorageStatus() {
  const [status, setStatus] = useState<StorageStatus>({
    bucketExists: false,
    bucketPublic: false,
    policiesExist: false,
    policiesCount: 0,
    canUpload: false,
    canDownload: false,
    lastError: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const checkStorageStatus = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // 1. فحص وجود bucket
      console.log('🔍 فحص وجود bucket "ads"...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('❌ خطأ في فحص buckets:', bucketError);
        setStatus(prev => ({ ...prev, lastError: bucketError.message }));
        return;
      }

      const adsBucket = buckets.find(b => b.name === 'ads');
      const bucketExists = !!adsBucket;
      const bucketPublic = adsBucket?.public || false;

      console.log('📦 Bucket status:', { bucketExists, bucketPublic, adsBucket });

      // 2. فحص السياسات
      console.log('🔍 فحص السياسات...');
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'objects')
        .eq('schemaname', 'storage')
        .like('policyname', '%ads%');

      if (policiesError) {
        console.error('❌ خطأ في فحص السياسات:', policiesError);
      }

      const policiesExist = policies && policies.length > 0;
      const policiesCount = policies?.length || 0;

      console.log('📋 Policies status:', { policiesExist, policiesCount, policies });

      // 3. اختبار الرفع
      console.log('🔍 اختبار الرفع...');
      const testFileName = `test-${Date.now()}.txt`;
      const testContent = 'Test file content';
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('ads')
        .upload(testFileName, testContent);

      const canUpload = !uploadError;
      
      if (uploadError) {
        console.error('❌ خطأ في الرفع:', uploadError);
        setTestResults(prev => [...prev, { type: 'upload', success: false, error: uploadError.message }]);
      } else {
        console.log('✅ رفع ناجح:', uploadData);
        setTestResults(prev => [...prev, { type: 'upload', success: true, data: uploadData }]);
      }

      // 4. اختبار التحميل (إذا نجح الرفع)
      let canDownload = false;
      if (canUpload && uploadData) {
        console.log('🔍 اختبار التحميل...');
        const { data: downloadData, error: downloadError } = await supabase.storage
          .from('ads')
          .download(testFileName);

        canDownload = !downloadError;
        
        if (downloadError) {
          console.error('❌ خطأ في التحميل:', downloadError);
          setTestResults(prev => [...prev, { type: 'download', success: false, error: downloadError.message }]);
        } else {
          console.log('✅ تحميل ناجح:', downloadData);
          setTestResults(prev => [...prev, { type: 'download', success: true, data: downloadData }]);
        }

        // 5. حذف ملف الاختبار
        console.log('🔍 حذف ملف الاختبار...');
        const { error: deleteError } = await supabase.storage
          .from('ads')
          .remove([testFileName]);

        if (deleteError) {
          console.error('❌ خطأ في الحذف:', deleteError);
          setTestResults(prev => [...prev, { type: 'delete', success: false, error: deleteError.message }]);
        } else {
          console.log('✅ حذف ناجح');
          setTestResults(prev => [...prev, { type: 'delete', success: true }]);
        }
      }

      setStatus({
        bucketExists,
        bucketPublic,
        policiesExist,
        policiesCount,
        canUpload,
        canDownload,
        lastError: null
      });

    } catch (error) {
      console.error('💥 خطأ عام:', error);
      setStatus(prev => ({ ...prev, lastError: error instanceof Error ? error.message : 'خطأ غير معروف' }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusBadge = (condition: boolean) => {
    return condition ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        ✅ متاح
      </Badge>
    ) : (
      <Badge variant="destructive">
        ❌ غير متاح
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            اختبار حالة Supabase Storage
          </h1>
          <p className="text-lg text-gray-600">
            فحص شامل لحالة bucket الإعلانات والسياسات
          </p>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center">
          <Button 
            onClick={checkStorageStatus} 
            disabled={isLoading}
            className="px-8 py-3 h-12 text-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                جاري الفحص...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                إعادة فحص الحالة
              </>
            )}
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Bucket Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStatusIcon(status.bucketExists)}
                حالة Bucket
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">وجود Bucket "ads"</span>
                {getStatusBadge(status.bucketExists)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Bucket عام</span>
                {getStatusBadge(status.bucketPublic)}
              </div>
            </CardContent>
          </Card>

          {/* Policies Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStatusIcon(status.policiesExist)}
                السياسات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">وجود السياسات</span>
                {getStatusBadge(status.policiesExist)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">عدد السياسات</span>
                <Badge variant="outline">{status.policiesCount}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Permissions Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getStatusIcon(status.canUpload && status.canDownload)}
                الصلاحيات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">إمكانية الرفع</span>
                {getStatusBadge(status.canUpload)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">إمكانية التحميل</span>
                {getStatusBadge(status.canDownload)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {status.lastError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>خطأ:</strong> {status.lastError}
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                نتائج الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {result.type === 'upload' && 'اختبار الرفع'}
                        {result.type === 'download' && 'اختبار التحميل'}
                        {result.type === 'delete' && 'اختبار الحذف'}
                      </span>
                    </div>
                    <Badge variant={result.success ? "default" : "destructive"}>
                      {result.success ? 'نجح' : 'فشل'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {(!status.bucketExists || !status.policiesExist || !status.canUpload) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                إجراءات مطلوبة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-orange-700 space-y-2">
                {!status.bucketExists && (
                  <p>• إنشاء bucket "ads" في Supabase Storage</p>
                )}
                {!status.policiesExist && (
                  <p>• تطبيق ملف fix-storage-policies.sql في SQL Editor</p>
                )}
                {!status.canUpload && (
                  <p>• التحقق من إعدادات السياسات والصلاحيات</p>
                )}
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-sm font-medium text-gray-900 mb-2">الخطوات المطلوبة:</p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>اذهب إلى Supabase Dashboard</li>
                  <li>انتقل إلى SQL Editor</li>
                  <li>انسخ محتوى ملف fix-storage-policies.sql</li>
                  <li>الصق الكود واضغط Run</li>
                  <li>عد إلى هذه الصفحة واضغط "إعادة فحص الحالة"</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {status.bucketExists && status.policiesExist && status.canUpload && status.canDownload && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>ممتاز!</strong> جميع الإعدادات صحيحة ويمكن رفع الصور الآن.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}


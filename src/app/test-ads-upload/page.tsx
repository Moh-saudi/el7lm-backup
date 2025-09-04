'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Upload, Image, Video } from 'lucide-react';
import { uploadAdFile, ensureAdsBucketExists } from '@/lib/supabase/ads-storage';

export default function TestAdsUploadPage() {
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'exists' | 'missing'>('checking');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadResult, setUploadResult] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // فحص حالة bucket
  const checkBucket = async () => {
    setBucketStatus('checking');
    try {
      const exists = await ensureAdsBucketExists();
      setBucketStatus(exists ? 'exists' : 'missing');
    } catch (error) {
      console.error('Error checking bucket:', error);
      setBucketStatus('missing');
    }
  };

  // اختيار ملف
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus('idle');
      setUploadResult('');
    }
  };

  // رفع ملف
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    setUploadResult('');

    try {
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'video';
      const adId = `test_${Date.now()}`;
      
      const result = await uploadAdFile(selectedFile, adId, fileType);
      
      if (result.error) {
        setUploadStatus('error');
        setUploadResult(result.error);
      } else {
        setUploadStatus('success');
        setUploadResult(`تم رفع الملف بنجاح! الرابط: ${result.url}`);
      }
    } catch (error) {
      setUploadStatus('error');
      setUploadResult(`خطأ: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">اختبار رفع الصور للإعلانات</h1>
          <p className="text-gray-600">صفحة اختبار لفحص عمل رفع الصور والفيديوهات في نظام الإعلانات</p>
        </div>

        {/* فحص حالة Bucket */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              حالة Bucket الإعلانات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge 
                className={
                  bucketStatus === 'exists' ? 'bg-green-100 text-green-700' :
                  bucketStatus === 'missing' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }
              >
                {bucketStatus === 'exists' ? 'موجود' :
                 bucketStatus === 'missing' ? 'غير موجود' : 'جاري الفحص...'}
              </Badge>
              <Button onClick={checkBucket} variant="outline" size="sm">
                فحص الحالة
              </Button>
            </div>
            
            {bucketStatus === 'missing' && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h3 className="font-semibold text-red-800 mb-2">يجب إنشاء Bucket الإعلانات</h3>
                <ol className="text-sm text-red-700 space-y-1">
                  <li>1. اذهب إلى Supabase Dashboard</li>
                  <li>2. انتقل إلى Storage</li>
                  <li>3. أنشئ bucket جديد باسم "ads"</li>
                  <li>4. اضبطه كـ public</li>
                  <li>5. شغل ملف السياسات SQL</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>

        {/* اختبار رفع الملفات */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              اختبار رفع الملفات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* اختيار الملف */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اختر ملف للرفع
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                aria-label="اختر ملف للرفع"
                title="اختر ملف للرفع"
              />
            </div>

            {/* معلومات الملف المختار */}
            {selectedFile && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {selectedFile.type.startsWith('image/') ? (
                    <Image className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Video className="h-4 w-4 text-blue-600" />
                  )}
                  <span className="font-medium text-blue-800">{selectedFile.name}</span>
                </div>
                <div className="text-sm text-blue-600">
                  النوع: {selectedFile.type} | الحجم: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}

            {/* زر الرفع */}
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploadStatus === 'uploading' || bucketStatus === 'missing'}
              className="w-full"
            >
              {uploadStatus === 'uploading' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  رفع الملف
                </>
              )}
            </Button>

            {/* نتيجة الرفع */}
            {uploadStatus === 'success' && (
              <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="text-green-800">
                  <div className="font-medium">تم الرفع بنجاح!</div>
                  <div className="text-sm mt-1 break-all">{uploadResult}</div>
                </div>
              </div>
            )}

            {uploadStatus === 'error' && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="text-red-800">
                  <div className="font-medium">فشل في الرفع</div>
                  <div className="text-sm mt-1">{uploadResult}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* تعليمات إضافية */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>تعليمات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• تأكد من إنشاء bucket الإعلانات في Supabase Storage</p>
              <p>• شغل ملف السياسات SQL لتمكين الرفع</p>
              <p>• الأنواع المدعومة: JPG, PNG, WebP, GIF, MP4, WebM, OGG, AVI, MOV</p>
              <p>• الحد الأقصى: 10MB للصور، 100MB للفيديوهات</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

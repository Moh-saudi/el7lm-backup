'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Image, 
  Video, 
  X, 
  FileImage, 
  FileVideo,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { uploadAdFile, deleteAdFile, AdUploadResponse, AdFileInfo } from '@/lib/supabase/ads-storage';

interface AdFileUploadProps {
  adId: string;
  fileType: 'image' | 'video';
  onFileUploaded: (url: string) => void;
  onFileDeleted?: (url: string) => void;
  currentFileUrl?: string;
  className?: string;
}

export default function AdFileUpload({
  adId,
  fileType,
  onFileUploaded,
  onFileDeleted,
  currentFileUrl,
  className = ''
}: AdFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // استخدام useCallback لمنع إعادة إنشاء الدالة في كل render
  const handleFileUploaded = useCallback((url: string) => {
    onFileUploaded(url);
  }, [onFileUploaded]);

  const resetUploadState = () => {
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress(0);
    setRetryCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('🚀 Starting file upload:', { 
      fileName: file.name, 
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`, 
      fileType: file.type,
      adId,
      expectedType: fileType 
    });

    // تحقق أساسي من نوع الملف
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    const allowedTypes = fileType === 'image' ? allowedImageTypes : allowedVideoTypes;
    
    if (!allowedTypes.includes(file.type)) {
      setUploadError(`نوع الملف غير مدعوم. الأنواع المدعومة: ${allowedTypes.join(', ')}`);
      return;
    }

    // تحقق من حجم الملف
    const maxSize = fileType === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(`حجم الملف كبير جداً. الحد الأقصى: ${fileType === 'image' ? '10MB' : '100MB'}`);
      return;
    }

    setIsUploading(true);
    resetUploadState();

    try {
      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('📤 Calling uploadAdFile with:', { adId, fileType, fileName: file.name });
      const result: AdUploadResponse = await uploadAdFile(file, adId, fileType);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📋 Upload result:', result);

      if (result.error) {
        console.error('❌ Upload failed:', result.error);
        setUploadError(result.error);
        setUploadSuccess(false);
        
        // إعادة تعيين النموذج بعد 8 ثواني في حالة الخطأ
        setTimeout(() => {
          resetUploadState();
        }, 8000);
      } else if (result.url) {
        console.log('✅ Upload successful! URL:', result.url);
        setUploadSuccess(true);
        // استخدام الدالة المحسنة
        handleFileUploaded(result.url);
        
        // إعادة تعيين النموذج بعد 3 ثواني
        setTimeout(() => {
          setUploadSuccess(false);
          setUploadProgress(0);
        }, 3000);
      } else {
        console.error('⚠️ Upload completed but no URL returned');
        setUploadError('فشل في الحصول على رابط الملف المرفوع');
      }

    } catch (error) {
      console.error('💥 Error uploading file:', error);
      
      // رسائل خطأ أكثر تفصيلاً
      let errorMessage = 'حدث خطأ غير متوقع أثناء رفع الملف';
      
      if (error instanceof Error) {
        if (error.message.includes('network')) {
          errorMessage = 'خطأ في الاتصال بالشبكة. تحقق من الاتصال بالإنترنت';
        } else if (error.message.includes('permission')) {
          errorMessage = 'ليس لديك صلاحية لرفع الملفات. تحقق من إعدادات الحساب';
        } else if (error.message.includes('storage')) {
          errorMessage = 'خطأ في التخزين. تحقق من إعدادات Supabase Storage';
        } else if (error.message.includes('row-level security policy')) {
          errorMessage = 'مشكلة في سياسات الأمان. يرجى تطبيق ملف fix-storage-policies.sql في Supabase';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'غير مصرح بالرفع. تحقق من إعدادات Supabase Storage';
        } else {
          errorMessage = `خطأ: ${error.message}`;
        }
      }
      
      setUploadError(errorMessage);
      setUploadSuccess(false);
      
      // إعادة تعيين النموذج بعد 10 ثواني في حالة الخطأ
      setTimeout(() => {
        resetUploadState();
      }, 10000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // معالج السحب والإسقاط
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // محاكاة اختيار الملف
      const event = {
        target: { files: [file] }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    }
  }, []);

  const handleDeleteFile = async () => {
    if (!currentFileUrl) return;

    try {
      // استخراج مسار الملف من الرابط
      const urlParts = currentFileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${fileType}s/${fileName}`;

      const result = await deleteAdFile(filePath);
      
      if (result.success) {
        onFileDeleted?.(currentFileUrl);
      } else {
        setUploadError(result.error || 'فشل في حذف الملف');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      setUploadError('حدث خطأ أثناء حذف الملف');
    }
  };

  const getFileTypeInfo = () => {
    if (fileType === 'image') {
      return {
        icon: <Image className="h-5 w-5" />,
        label: 'صورة',
        accept: 'image/*',
        maxSize: '10MB',
        allowedTypes: 'JPG, PNG, WebP, GIF'
      };
    } else {
      return {
        icon: <Video className="h-5 w-5" />,
        label: 'فيديو',
        accept: 'video/*',
        maxSize: '100MB',
        allowedTypes: 'MP4, WebM, OGG, AVI, MOV'
      };
    }
  };

  const fileInfo = getFileTypeInfo();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* عنوان القسم */}
      <div className="flex items-center gap-2">
        {fileInfo.icon}
        <Label className="text-base font-bold text-gray-700">
          رفع {fileInfo.label}
        </Label>
      </div>

      {/* معلومات الملفات المدعومة */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm text-blue-700">
          <AlertCircle className="h-4 w-4" />
          <span>الأنواع المدعومة: {fileInfo.allowedTypes}</span>
        </div>
        <div className="text-xs text-blue-600 mt-1">
          الحد الأقصى للحجم: {fileInfo.maxSize}
        </div>
      </div>

      {/* منطقة رفع الملف */}
      <Card 
        className={`border-2 border-dashed transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg' 
            : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-8 lg:p-12">
          <div className="text-center space-y-6">
            {/* أيقونة الرفع */}
            <div className="mx-auto w-20 h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-lg">
              {isUploading ? (
                <Loader2 className="h-10 w-10 lg:h-12 lg:w-12 text-blue-600 animate-spin" />
              ) : (
                <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-blue-500" />
              )}
            </div>

            {/* نص التوجيه */}
            <div>
              <p className={`text-xl lg:text-2xl font-semibold mb-2 ${
                isDragOver ? 'text-blue-700' : 'text-gray-900'
              }`}>
                {isUploading 
                  ? 'جاري رفع الملف...' 
                  : isDragOver 
                    ? `أفلت ${fileInfo.label} هنا` 
                    : `اسحب وأفلت ${fileInfo.label} هنا`
                }
              </p>
              <p className={`text-base lg:text-lg ${
                isDragOver ? 'text-blue-600' : 'text-gray-500'
              }`}>
                أو انقر لاختيار ملف من جهازك
              </p>
            </div>

            {/* شريط التقدم */}
            {isUploading && (
              <div className="w-full max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-3 lg:h-4 shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 lg:h-4 rounded-full transition-all duration-300 shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-blue-600 mt-2">{uploadProgress}%</p>
              </div>
            )}

            {/* رسائل الحالة */}
            {uploadError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm flex-1">{uploadError}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRetry}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    disabled={isUploading}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadError(null)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">تم رفع الملف بنجاح!</span>
              </div>
            )}

            {/* زر اختيار الملف */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 px-6 lg:px-8 py-3 lg:py-4 h-12 lg:h-14 text-base lg:text-lg font-semibold"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 lg:h-6 lg:w-6 mr-2 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                  اختيار {fileInfo.label}
                </>
              )}
            </Button>

            {/* إدخال الملف المخفي */}
            <Input
              ref={fileInputRef}
              type="file"
              accept={fileInfo.accept}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* عرض الملف الحالي */}
      {currentFileUrl && (
        <Card className="border border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {fileType === 'image' ? (
                  <FileImage className="h-5 w-5 text-green-600" />
                ) : (
                  <FileVideo className="h-5 w-5 text-green-600" />
                )}
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {fileType === 'image' ? 'صورة' : 'فيديو'} مرفوع
                  </p>
                  <p className="text-xs text-green-600">
                    {currentFileUrl.split('/').pop()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  مرفوع
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteFile}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

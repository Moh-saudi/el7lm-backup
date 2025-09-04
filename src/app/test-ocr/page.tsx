'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

interface OCRResult {
  success: boolean;
  text?: string;
  convertedText?: string;
  cleanedText?: string;
  amounts?: number[];
  allNumbers?: number[];
  error?: string;
  details?: string;
  confidence?: string;
  processingTimeMs?: number;
  languageUsed?: string;
}

export default function TestOCRPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      // إنشاء URL مؤقت لعرض الصورة
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
    setImageFile(null);
    setResult(null);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const runOCRTest = async () => {
    if (!imageUrl && !imageFile) {
      toast.error('الرجاء رفع صورة أو إدخال رابط صورة');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      let requestBody: any = {};

      if (imageFile) {
        // تحويل الملف إلى base64
        console.log('Converting file to base64...');
        const base64Data = await convertFileToBase64(imageFile);
        requestBody.imageData = base64Data;
        console.log('File converted to base64, size:', base64Data.length);
      } else if (imageUrl) {
        // استخدام URL مباشرة
        requestBody.imageUrl = imageUrl;
        console.log('Using image URL:', imageUrl);
      }

      console.log('Sending OCR request...');

      const response = await fetch('/api/ocr/verify-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OCR API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('OCR API Response:', data);
      setResult(data);

      if (data.success) {
        toast.success(`تم استخراج النص بنجاح! وجد ${data.amounts?.length || 0} رقم`);
      } else {
        toast.error(`فشل في معالجة الصورة: ${data.error}`);
      }
    } catch (error) {
      console.error('OCR Test Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      toast.error(`خطأ في معالجة الصورة: ${errorMessage}`);
      setResult({
        success: false,
        error: 'خطأ في الاتصال',
        details: errorMessage
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">اختبار تقنية OCR</h1>
        <p className="text-gray-600">اختبار استخراج النصوص والأرقام من الصور</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              رفع الصورة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">رفع ملف صورة:</Label>
              <Input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-1"
              />
            </div>

            <div className="text-center text-gray-500">أو</div>

            <div>
              <Label htmlFor="image-url">رابط الصورة:</Label>
              <Input
                id="image-url"
                type="url"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
              <div className="mt-2 space-x-2 flex">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl('https://via.placeholder.com/400x300/ffffff/000000?text=Receipt+123.45+SAR')}
                  className="text-xs"
                >
                  صورة إنجليزية
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setImageUrl('https://via.placeholder.com/400x300/ffffff/000000?text=إيصال+١٢٣.٤٥+ريال')}
                  className="text-xs"
                >
                  صورة عربية
                </Button>
              </div>
            </div>

            <Button 
              onClick={runOCRTest} 
              disabled={isProcessing || (!imageUrl && !imageFile)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  جاري المعالجة...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 ml-2" />
                  تشغيل اختبار OCR
                </>
              )}
            </Button>

            {/* Preview */}
            {(imageUrl || imageFile) && (
              <div className="mt-4">
                <Label>معاينة الصورة:</Label>
                <div className="mt-2 border rounded-lg p-2">
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-64 mx-auto object-contain"
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={() => console.error('Failed to load image')}
                  />
                </div>
                {imageFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>اسم الملف: {imageFile.name}</p>
                    <p>حجم الملف: {(imageFile.size / 1024).toFixed(1)} KB</p>
                    <p>نوع الملف: {imageFile.type}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>النتائج</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.success ? '✅ نجح الاستخراج' : '❌ فشل الاستخراج'}
                  </p>
                </div>

                {result.success && result.text && (
                  <div>
                    <Label className="font-semibold">النص المستخرج:</Label>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border text-sm whitespace-pre-wrap">
                      {result.text}
                    </div>
                    {result.convertedText && result.convertedText !== result.text && (
                      <div className="mt-2">
                        <Label className="font-semibold text-blue-600">النص بعد تحويل الأرقام العربية:</Label>
                        <div className="mt-1 p-3 bg-blue-50 rounded-lg border text-sm whitespace-pre-wrap">
                          {result.convertedText}
                        </div>
                      </div>
                    )}
                    {result.cleanedText && result.cleanedText !== result.convertedText && (
                      <div className="mt-2">
                        <Label className="font-semibold text-green-600">النص بعد التنظيف:</Label>
                        <div className="mt-1 p-3 bg-green-50 rounded-lg border text-sm whitespace-pre-wrap">
                          {result.cleanedText}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {result.success && result.amounts && result.amounts.length > 0 && (
                  <div>
                    <Label className="font-semibold">الأرقام النهائية (بعد إزالة المكررات):</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.amounts.map((amount, index) => (
                        <span 
                          key={index} 
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-mono font-bold"
                        >
                          {amount}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.success && result.allNumbers && result.allNumbers.length > 0 && result.allNumbers.length !== result.amounts?.length && (
                  <div>
                    <Label className="font-semibold text-gray-600">جميع الأرقام المستخرجة:</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {result.allNumbers.map((amount, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                        >
                          {amount}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(result.confidence || result.processingTimeMs || result.languageUsed) && (
                  <div>
                    <Label className="font-semibold">معلومات إضافية:</Label>
                    <div className="text-sm text-gray-600 space-y-1">
                      {result.languageUsed && <p>اللغة المستخدمة: {result.languageUsed === 'Arabic' ? 'العربية' : 'الإنجليزية'}</p>}
                      {result.confidence && <p>اتجاه النص: {result.confidence}</p>}
                      {result.processingTimeMs && <p>وقت المعالجة: {result.processingTimeMs} مللي ثانية</p>}
                    </div>
                  </div>
                )}

                {!result.success && (
                  <div>
                    <Label className="font-semibold">تفاصيل الخطأ:</Label>
                    <div className="mt-2 p-3 bg-red-50 rounded-lg border text-sm text-red-700">
                      <p><strong>الخطأ:</strong> {result.error}</p>
                      {result.details && <p><strong>التفاصيل:</strong> {result.details}</p>}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin ml-2" />
                    جاري معالجة الصورة...
                  </div>
                ) : (
                  'قم برفع صورة وتشغيل الاختبار لعرض النتائج'
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

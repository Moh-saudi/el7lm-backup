'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { motion } from 'framer-motion';
import { 
  VideoIcon, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  FileVideo,
  Upload,
  Youtube,
  Share2
} from 'lucide-react';
import type { Video } from '@/types/player';
import VideoManager from '@/components/video/VideoManager';
import { Button } from '@/components/ui/button';
import { actionLogService } from '@/lib/admin/action-logs';

export default function VideosPage(props: any) {
  const router = useRouter();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [user, loading, authError] = useAuthState(auth);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const MAX_VIDEOS = 10;

  // جلب الفيديوهات من Firebase
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) {
        console.log('المستخدم غير مسجل دخول، إعادة توجيه...');
        router.push('/auth/login');
        return;
      }

      try {
        console.log('جاري جلب الفيديوهات للمستخدم:', user.uid);
        setIsLoading(true);
        const playerDoc = await getDoc(doc(db, 'players', user.uid));
        
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          console.log('تم العثور على بيانات اللاعب:', data);
          // تأكد أن كل فيديو له desc نصي وليس undefined
          const safeVideos = (data.videos || []).map((v: any) => ({
            url: v.url,
            desc: v.desc ?? ''
          }));
          console.log('الفيديوهات المحملة:', safeVideos);
          setVideos(safeVideos);
        } else {
          console.log('لا توجد بيانات للاعب، إنشاء قائمة فارغة');
          setVideos([]);
        }
      } catch (error) {
        console.error('خطأ في جلب الفيديوهات:', error);
        setSaveMessage({ type: 'error', text: 'حدث خطأ أثناء جلب الفيديوهات' });
        setVideos([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && !loading) {
      fetchVideos();
    }
  }, [user, loading, router]);

  // حفظ الفيديوهات في Firebase
  const handleSaveVideos = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      
      // حفظ الفيديوهات في Firebase
      await updateDoc(doc(db, 'players', user.uid), {
        videos: videos,
        updated_at: new Date()
      });
      
      // التأكد من تسجيل رفع الفيديوهات الجديدة وإرسال إشعار للمستخدم
      const newVideos = videos
        .map((v, idx) => ({ v, idx }))
        .filter(({ v }) => v.url && !(v as any).status);

      for (const { v, idx } of newVideos) {
        const videoId = `${user.uid}_${idx}`;
        await actionLogService.ensureUploadLoggedAndNotified({
          videoId,
          playerId: user.uid,
          playerName: user.displayName || user.email || 'مستخدم',
          videoTitle: v.desc || v.url,
          notificationTitle: 'تم رفع الفيديو',
          notificationMessage: 'تم رفع الفيديو وهو الآن قيد المراجعة من فريقنا.'
        });
      }
      
      setHasUnsavedChanges(false);
      setSaveMessage({ type: 'success', text: 'تم حفظ التغييرات بنجاح' });
      
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('خطأ في حفظ الفيديوهات:', error);
      setSaveMessage({ type: 'error', text: 'حدث خطأ أثناء حفظ الفيديوهات' });
    } finally {
      setIsSaving(false);
    }
  };

  // تحديث الفيديوهات
  const handleUpdateVideos = (newVideos: Video[]) => {
    // تأكد أن كل فيديو له desc نصي وليس undefined
    const safeVideos = newVideos.map((v: any) => ({
      url: v.url,
      desc: v.desc ?? ''
    }));
    setVideos(safeVideos);
    setHasUnsavedChanges(true);
  };

  // التحقق من وجود تغييرات غير محفوظة عند مغادرة الصفحة
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading || isLoading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
    );
  }

  // محتوى الصفحة الرئيسي (عرض الفيديوهات)
  return (
    <div className="container p-4 mx-auto">
      {/* الكروت الإحصائية */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <FileVideo className="w-8 h-8 text-blue-500" />
          <div>
            <div className="text-sm text-gray-500">عدد الفيديوهات المرفوعة</div>
            <div className="text-2xl font-bold">{videos.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Upload className="w-8 h-8 text-green-500" />
          <div>
            <div className="text-sm text-gray-500">الحد الأقصى للرفع</div>
            <div className="text-2xl font-bold">{MAX_VIDEOS}</div>
          </div>
        </div>
      </div>

      {/* ملاحظات وتعليمات */}
      <div className="p-4 mb-6 border-l-4 border-yellow-400 rounded bg-yellow-50">
        <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
          <li>الحد الأقصى للفيديوهات: {MAX_VIDEOS}</li>
          <li>الصيغ المدعومة: MP4, AVI, MOV</li>
          <li>الجودة المطلوبة: 720p على الأقل</li>
          <li>يجب أن يكون الفيديو واضحاً ويظهر مهاراتك</li>
        </ul>
      </div>

      {/* تعليمات رفع الفيديو */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">كيفية رفع الفيديو</h3>
        
        {/* يوتيوب */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-red-600" />
            <h4 className="text-lg font-medium text-blue-600">رفع فيديو من يوتيوب</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>اذهب إلى فيديو يوتيوب الخاص بك</li>
            <li>اضغط على زر "مشاركة" أسفل الفيديو</li>
            <li>انسخ رابط الفيديو</li>
            <li>الصق الرابط في حقل "رابط الفيديو" أدناه</li>
            <li>أضف وصفاً للفيديو</li>
            <li>حدد نوع الفيديو (مهارات، مباراة، تدريب)</li>
            <li>اضغط على "حفظ الفيديو"</li>
          </ol>
        </div>

        {/* تيك توك */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-12 h-12 text-black" />
            <h4 className="text-lg font-medium text-blue-600">رفع فيديو من تيك توك</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>افتح تطبيق تيك توك</li>
            <li>اذهب إلى الفيديو المطلوب</li>
            <li>اضغط على زر "مشاركة"</li>
            <li>اختر "نسخ الرابط"</li>
            <li>الصق الرابط في حقل "رابط الفيديو" أدناه</li>
            <li>أضف الوصف والنوع واضغط "حفظ"</li>
          </ol>
        </div>

        {/* إضافة الفيديو في المنصة */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FileVideo className="w-12 h-12 text-blue-600" />
            <h4 className="text-lg font-medium text-blue-600">رفع فيديو مباشر</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>اضغط على "إضافة فيديو جديد"</li>
            <li>اختر ملف الفيديو من جهازك</li>
            <li>أضف وصفاً ونوع الفيديو</li>
            <li>اضغط على "رفع الفيديو"</li>
          </ol>
        </div>
      </div>

      {/* مدير الفيديوهات */}
      <VideoManager 
        videos={videos}
        onUpdate={handleUpdateVideos}
        maxVideos={MAX_VIDEOS}
      />

      {/* زر الحفظ */}
      <div className="flex justify-center mt-6">
        <Button 
          onClick={handleSaveVideos}
          disabled={isSaving}
          className="px-8 py-3 text-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </Button>
      </div>

      {/* رسائل الحفظ */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {saveMessage.text}
          </div>
        </div>
      )}

      {/* مساحة إضافية في الأسفل لتجنب إخفاء المحتوى تحت الفوتر */}
      <div className="h-32"></div>
    </div>
  );
} 

'use client';

import React from 'react';
import { VideoIcon, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Video } from '@/types/player';

interface VideoQuickStatsProps {
  videos: Video[];
  maxVideos?: number;
  showManageButton?: boolean;
}

const VideoQuickStats: React.FC<VideoQuickStatsProps> = ({
  videos = [],
  maxVideos = 10,
  showManageButton = true
}) => {
  const videoCount = videos.length;
  const hasDescription = videos.filter(v => v.desc && v.desc.trim()).length;
  const percentage = Math.round((videoCount / maxVideos) * 100);

  // تحديد لون الشريط بناءً على النسبة
  const getProgressColor = () => {
    if (percentage < 30) return 'bg-red-500';
    if (percentage < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // تحديد رسالة التحفيز
  const getMotivationMessage = () => {
    if (videoCount === 0) {
      return 'ابدأ بإضافة أول فيديو لك!';
    }
    if (videoCount < 3) {
      return 'أضف المزيد من الفيديوهات لتحسين ملفك الشخصي';
    }
    if (videoCount < 6) {
      return 'ملف شخصي جيد! يمكنك إضافة المزيد';
    }
    return 'ملف شخصي ممتاز مع فيديوهات متنوعة!';
  };

  const handleSendStats = async () => {
    // منع الإرسال المتكرر
    if (loading) {
      console.log('🛑 Stats sending blocked - already loading');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: videoId,
          stats: stats
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('تم إرسال الإحصائيات بنجاح!');
      } else {
        setError(result.error || 'فشل في إرسال الإحصائيات');
      }
    } catch (error: any) {
      setError('حدث خطأ في إرسال الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <VideoIcon className="w-5 h-5 text-blue-600" />
          <h4 className="font-semibold text-gray-800">حالة الفيديوهات</h4>
        </div>
        {showManageButton && (
          <Link
            href="/dashboard/player/videos"
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إدارة
          </Link>
        )}
      </div>

      {/* شريط التقدم */}
      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>الفيديوهات المضافة</span>
          <span>{videoCount}/{maxVideos}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{videoCount}</div>
          <div className="text-xs text-gray-600">إجمالي الفيديوهات</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{hasDescription}</div>
          <div className="text-xs text-gray-600">مع وصف</div>
        </div>
      </div>

      {/* رسالة التحفيز */}
      <div className="flex items-center gap-2 text-sm">
        {videoCount < 3 && (
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
        )}
        <span className="text-gray-700">{getMotivationMessage()}</span>
      </div>

      {/* نصائح سريعة */}
      {videoCount < maxVideos && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="text-xs text-blue-600 font-medium mb-1">نصيحة:</div>
          <div className="text-xs text-gray-600">
            {videoCount === 0 && 'ابدأ بفيديو يظهر مهاراتك الأساسية'}
            {videoCount === 1 && 'أضف فيديو للتكتيك أو الأداء في المباريات'}
            {videoCount === 2 && 'أضف فيديو للتدريبات واللياقة البدنية'}
            {videoCount >= 3 && 'نوّع الفيديوهات لتشمل جوانب مختلفة من أدائك'}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoQuickStats; 

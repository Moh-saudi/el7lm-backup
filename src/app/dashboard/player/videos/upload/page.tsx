'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { referralService } from '@/lib/referral/referral-service';
import { PlayerVideo, POINTS_CONVERSION } from '@/types/referral';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Video, 
  Upload, 
  Play, 
  Clock, 
  Eye,
  ThumbsUp,
  DollarSign,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileVideo,
  Camera,
  Mic,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface PlayerRewards {
  playerId: string;
  totalPoints: number;
  availablePoints: number;
  totalEarnings: number;
  referralCount: number;
  badges: any[];
  lastUpdated: any;
}

interface UploadedVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
  approvedAt?: Date;
  pointsEarned?: number;
  adminNotes?: string;
}

export default function VideoUploadPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [playerRewards, setPlayerRewards] = useState<PlayerRewards | null>(null);
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadPlayerData();
    }
  }, [user]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const rewards = await referralService.createOrUpdatePlayerRewards(user!.uid);
      setPlayerRewards(rewards);
      
      // هنا يمكن جلب فيديوهات اللاعب من قاعدة البيانات
      // setUploadedVideos(playerVideosData);
    } catch (error) {
      console.error('خطأ في تحميل بيانات اللاعب:', error);
      toast.error('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // التحقق من نوع الملف
      if (!file.type.startsWith('video/')) {
        toast.error('يرجى اختيار ملف فيديو صحيح');
        return;
      }

      // التحقق من حجم الملف (50MB كحد أقصى)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن يكون أقل من 50MB');
        return;
      }

      setSelectedFile(file);
      setVideoTitle(file.name.replace(/\.[^/.]+$/, '')); // إزالة امتداد الملف
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !videoTitle.trim()) {
      toast.error('يرجى اختيار ملف فيديو وإدخال عنوان');
      return;
    }

    setUploading(true);

    try {
      // هنا يمكن إضافة رفع الملف إلى Firebase Storage
      // const videoUrl = await uploadVideoToStorage(selectedFile);
      
      // إنشاء كائن الفيديو
      const newVideo: UploadedVideo = {
        id: Date.now().toString(),
        title: videoTitle,
        description: videoDescription,
        videoUrl: 'https://example.com/video.mp4', // سيتم استبداله بالرابط الحقيقي
        thumbnail: '/images/video-thumbnail.jpg',
        duration: 0, // سيتم حسابها من الفيديو
        status: 'pending',
        uploadedAt: new Date()
      };

      setUploadedVideos(prev => [newVideo, ...prev]);
      
      toast.success('تم رفع الفيديو بنجاح! سيتم مراجعته قريباً');
      setShowUploadModal(false);
      setSelectedFile(null);
      setVideoTitle('');
      setVideoDescription('');

    } catch (error) {
      console.error('خطأ في رفع الفيديو:', error);
      toast.error('حدث خطأ في رفع الفيديو');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'تمت الموافقة';
      case 'rejected':
        return 'مرفوض';
      case 'pending':
        return 'قيد المراجعة';
      default:
        return 'غير محدد';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">رفع الفيديوهات</h1>
        <div className="flex items-center gap-2">
          <Video className="w-6 h-6 text-blue-500" />
          <span className="text-lg font-semibold">كسب النقاط</span>
        </div>
      </div>

      {/* بطاقة النقاط */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">النقاط المتوفرة</p>
                <p className="text-3xl font-bold">{playerRewards?.availablePoints.toLocaleString()}</p>
                <p className="text-sm text-blue-100">
                  ≈ ${(playerRewards?.availablePoints || 0) / POINTS_CONVERSION.POINTS_PER_DOLLAR} 
                  ({((playerRewards?.availablePoints || 0) / POINTS_CONVERSION.POINTS_PER_DOLLAR * POINTS_CONVERSION.DOLLAR_TO_EGP).toFixed(2)} ج.م)
                </p>
              </div>
              <DollarSign className="w-12 h-12" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* معلومات رفع الفيديوهات */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              كيف تكسب النقاط من الفيديوهات؟
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">1. ارفع فيديو</h3>
                <p className="text-sm text-gray-600">
                  ارفع فيديو يظهر مهاراتك في كرة القدم
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">2. انتظر المراجعة</h3>
                <p className="text-sm text-gray-600">
                  سيقوم فريقنا بمراجعة الفيديو خلال 24 ساعة
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">3. احصل على النقاط</h3>
                <p className="text-sm text-gray-600">
                  1,000 نقطة لكل فيديو تمت الموافقة عليه
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* زر رفع فيديو جديد */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Button
                onClick={() => setShowUploadModal(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                <Upload className="w-5 h-5 mr-2" />
                رفع فيديو جديد
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                احصل على 1,000 نقطة لكل فيديو تمت الموافقة عليه
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* قائمة الفيديوهات المرفوعة */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              الفيديوهات المرفوعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            {uploadedVideos.length === 0 ? (
              <div className="text-center py-8">
                <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لم تقم برفع أي فيديوهات بعد</p>
                <Button
                  onClick={() => setShowUploadModal(true)}
                  variant="outline"
                  className="mt-4"
                >
                  رفع أول فيديو
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {uploadedVideos.map((video) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold">{video.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{video.uploadedAt.toLocaleDateString('ar-SA')}</span>
                        {video.duration > 0 && (
                          <span>{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={`${getStatusColor(video.status)} text-white`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(video.status)}
                          {getStatusText(video.status)}
                        </div>
                      </Badge>
                      
                      {video.status === 'approved' && video.pointsEarned && (
                        <div className="text-sm text-green-600 mt-1">
                          +{video.pointsEarned.toLocaleString()} نقطة
                        </div>
                      )}
                      
                      {video.status === 'rejected' && video.adminNotes && (
                        <div className="text-sm text-red-600 mt-1">
                          {video.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* مودال رفع الفيديو */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">رفع فيديو جديد</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">اختر ملف الفيديو</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'انقر لاختيار ملف فيديو'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      الحد الأقصى: 50MB
                    </p>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">عنوان الفيديو</label>
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="أدخل عنوان الفيديو"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">وصف الفيديو</label>
                <Textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="وصف مختصر للفيديو..."
                  rows={3}
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>نصائح للحصول على الموافقة:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1">
                  <li>• تأكد من جودة الفيديو والصوت</li>
                  <li>• اظهر مهاراتك بوضوح</li>
                  <li>• تجنب المحتوى المسيء</li>
                  <li>• استخدم عنوان ووصف واضحين</li>
                </ul>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !videoTitle.trim() || uploading}
                  className="flex-1"
                >
                  {uploading ? 'جاري الرفع...' : 'رفع الفيديو'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 

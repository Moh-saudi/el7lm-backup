'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import ReactPlayer from 'react-player';
import { Video, Trash2, MessageSquare, Eye, User, Clock, Star, Flag, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import SendMessageButton from '@/components/messaging/SendMessageButton';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc, getDoc, addDoc, query, where } from 'firebase/firestore';
import { actionLogService } from '@/lib/admin/action-logs';

interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadDate: any;
  userId: string;
  userEmail: string;
  userName: string;
  accountType: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  views: number;
  likes: number;
  comments: number;
}

export default function VideosAdminPage() {
  const { user, userData } = useAuth();
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const ReactPlayer = dynamic(() => import('react-player'), {
    ssr: false
  });

  // تحميل الفيديوهات
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const allVideos: VideoData[] = [];

        const collections = ['players', 'clubs', 'agents', 'parents', 'marketers'];
        
        for (const collectionName of collections) {
          try {
            const collectionRef = collection(db, collectionName);
            // ملاحظة: شرط "!= true" يستبعد المستندات التي لا تحتوي الحقل نهائياً.
            // لذلك نجلب كل المستندات ونُرشّح محلياً لاستبعاد المحذوف منها فقط.
            const snapshot = await getDocs(collectionRef);
            
            snapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData?.isDeleted === true) return; // استبعاد المحذوفين فقط
              const userVideos = userData.videos || [];
              
              userVideos.forEach((video: any, index: number) => {
                if (video && video.url) {
                  const videoData: VideoData = {
                    id: `${doc.id}_${index}`,
                    title: video.title || video.desc || `فيديو ${index + 1}`,
                    description: video.description || video.desc || '',
                    url: video.url,
                    thumbnailUrl: video.thumbnail || video.thumbnailUrl,
                    duration: video.duration || 0,
                    uploadDate: video.uploadDate || video.createdAt || video.updated_at || new Date(),
                    userId: doc.id,
                    userEmail: userData.email || userData.userEmail || '',
                    userName: userData.full_name || userData.name || userData.userName || 'مستخدم',
                    accountType: collectionName.slice(0, -1),
                    status: video.status || 'pending',
                    views: video.views || 0,
                    likes: video.likes || 0,
                    comments: video.comments || 0
                  };
                  allVideos.push(videoData);
                }
              });
            });
          } catch (error) {
            console.error(`خطأ في جلب البيانات من مجموعة ${collectionName}:`, error);
          }
        }

        allVideos.sort((a, b) => {
          const dateA = a.uploadDate?.toDate ? a.uploadDate.toDate() : new Date(a.uploadDate);
          const dateB = b.uploadDate?.toDate ? b.uploadDate.toDate() : new Date(b.uploadDate);
          return dateB.getTime() - dateA.getTime();
        });

        setVideos(allVideos);
        setLoading(false);
      } catch (error) {
        console.error('Error loading videos:', error);
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // تحديث حالة الفيديو
  const updateVideoStatus = async (videoId: string, status: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) {
        throw new Error('الفيديو غير موجود');
      }
      
      const [userIdFromId, videoIndex] = videoId.split('_');
      const userId = userIdFromId;
      
      let collectionName = 'players';
      switch (video.accountType) {
        case 'player': collectionName = 'players'; break;
        case 'club': collectionName = 'clubs'; break;
        case 'agent': collectionName = 'agents'; break;
        case 'parent': collectionName = 'parents'; break;
        case 'marketer': collectionName = 'marketers'; break;
      }
      
      const userRef = doc(db, collectionName, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('المستخدم غير موجود');
      }
      
      const userData = userDoc.data();
      const userVideos = userData.videos || [];
      
      const videoToUpdateIndex = userVideos.findIndex((v: any) => {
        const [userIdFromId, videoIndex] = videoId.split('_');
        return parseInt(videoIndex) === userVideos.indexOf(v);
      });
      
      if (videoToUpdateIndex !== -1) {
        userVideos[videoToUpdateIndex] = {
          ...userVideos[videoToUpdateIndex],
        status,
        reviewDate: new Date(),
        reviewedBy: 'admin'
        };
        
        await updateDoc(userRef, { videos: userVideos });
        
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === videoId 
              ? { ...v, status: status as 'pending' | 'approved' | 'rejected' | 'flagged', reviewDate: new Date(), reviewedBy: 'admin' } as VideoData
              : v
          )
        );

        // تسجيل تحديث حالة الفيديو
        try {
          await actionLogService.logVideoReview({
            videoId: video.id,
            playerId: video.userId,
            playerName: video.userName,
            videoTitle: video.title,
            oldStatus: video.status,
            newStatus: status,
            actionBy: 'admin',
            actionByType: 'admin',
            notes: `تم تحديث حالة الفيديو إلى: ${status}`,
            adminNotes: `تم تحديث حالة الفيديو إلى: ${status}`
          });
          // إرسال إشعار داخل التطبيق للمستخدم
          await addDoc(collection(db, 'notifications'), {
            userId: video.userId,
            title: 'تحديث حالة الفيديو',
            body: `تم تحديث حالة الفيديو "${video.title}" إلى ${status === 'approved' ? 'مقبول' : status === 'rejected' ? 'مرفوض' : status === 'flagged' ? 'مُعلَّم' : 'قيد المراجعة'}.`,
            type: 'video',
            senderName: 'الإدارة',
            senderId: 'admin',
            senderType: 'admin',
            link: `/dashboard/player/videos`,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
              videoId: video.id,
              event: 'status_change',
              newStatus: status,
              oldStatus: video.status
            }
          });
        } catch (logError) {
          console.error('خطأ في تسجيل تحديث حالة الفيديو:', logError);
        }

      toast.success(`تم تحديث حالة الفيديو بنجاح`);
      } else {
        throw new Error('الفيديو غير موجود في قاعدة البيانات');
      }
    } catch (error) {
      console.error('Error updating video status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الفيديو');
    }
  };

  // فتح نافذة تفاصيل الفيديو + جلب السجل
  const openVideoDetails = async (video: VideoData) => {
    setSelectedVideo(video);
    setIsDetailsOpen(true);
    setLogsLoading(true);
    try {
      const videoLogs = await actionLogService.getVideoLogs(video.id, 50);
      setLogs(videoLogs);
    } catch (e) {
      console.error('فشل في جلب سجل الفيديو', e);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  // دالة لاستخراج الصورة المصغرة من YouTube و Vimeo
  const getThumbnailUrl = (videoUrl: string, fallbackThumbnail?: string) => {
    if (fallbackThumbnail) return fallbackThumbnail;
    
    // YouTube
    if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
      let videoId = '';
      if (videoUrl.includes('youtube.com/watch')) {
        videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      }
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      }
    }
    
    // Vimeo
    if (videoUrl.includes('vimeo.com/')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0] || '';
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    }
    
    return null;
  };

  // دالة لاستخراج معرف الفيديو من YouTube و Vimeo
  const getVideoId = (videoUrl: string) => {
    // YouTube
    if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
      if (videoUrl.includes('youtube.com/watch')) {
        return videoUrl.split('v=')[1]?.split('&')[0] || '';
      } else if (videoUrl.includes('youtu.be/')) {
        return videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
      }
    }
    
    // Vimeo
    if (videoUrl.includes('vimeo.com/')) {
      return videoUrl.split('vimeo.com/')[1]?.split('?')[0] || '';
    }
    
    return null;
  };

  // دالة لتحديد نوع المنصة
  const getPlatformType = (videoUrl: string) => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      return 'youtube';
    } else if (videoUrl.includes('vimeo.com')) {
      return 'vimeo';
    }
    return 'other';
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'flagged': return <Flag className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // تصفية الفيديوهات
  const filteredVideos = videos.filter(video => {
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    const matchesAccountType = filterAccountType === 'all' || video.accountType === filterAccountType;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesAccountType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل الفيديوهات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">إدارة الفيديوهات</h1>
          <Button 
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Video className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي الفيديوهات</p>
                  <p className="text-2xl font-bold">{videos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">في انتظار المراجعة</p>
                  <p className="text-2xl font-bold">{videos.filter(v => v.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">مُوافق عليه</p>
                  <p className="text-2xl font-bold">{videos.filter(v => v.status === 'approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">مستخدمين نشطين</p>
                  <p className="text-2xl font-bold">{new Set(videos.map(v => v.userId)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <Input
                id="search"
                placeholder="البحث في العنوان أو اسم المستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">حالة الفيديو</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في انتظار المراجعة</SelectItem>
                  <SelectItem value="approved">مُوافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="flagged">مُعلَّم للمراجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="account-filter">نوع الحساب</Label>
              <Select value={filterAccountType} onValueChange={setFilterAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحسابات</SelectItem>
                  <SelectItem value="player">لاعب</SelectItem>
                  <SelectItem value="parent">ولي أمر</SelectItem>
                  <SelectItem value="club">نادي</SelectItem>
                  <SelectItem value="agent">وكيل</SelectItem>
                  <SelectItem value="marketer">مسوق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterAccountType('all');
                }}
                variant="outline"
                className="w-full"
              >
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(video.status)}>
                    {getStatusIcon(video.status)}
                    <span className="mr-1">
                      {video.status === 'pending' && 'في الانتظار'}
                      {video.status === 'approved' && 'مُوافق عليه'}
                      {video.status === 'rejected' && 'مرفوض'}
                      {video.status === 'flagged' && 'مُعلَّم'}
                    </span>
                  </Badge>
                </div>
              </div>
              
              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group" onClick={() => openVideoDetails(video)}>
                {(() => {
                  const thumbnailUrl = getThumbnailUrl(video.url, video.thumbnailUrl);
                  const platformType = getPlatformType(video.url);
                  
                  if (thumbnailUrl) {
                    return (
                      <div className="relative w-full h-40">
                        <img 
                          src={thumbnailUrl} 
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            // إذا فشل تحميل الصورة، استخدم الصورة الافتراضية
                            e.currentTarget.src = '/api/placeholder/400/160';
                          }}
                        />
                        {/* Video play overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-95 rounded-full p-3 shadow-lg">
                            <Video className="w-8 h-8 text-gray-700" />
                          </div>
                        </div>
                        {/* Platform badge */}
                        <div className="absolute top-2 right-2">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            platformType === 'youtube' ? 'bg-red-500 text-white' :
                            platformType === 'vimeo' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          } shadow-lg`}>
                            {platformType === 'youtube' ? 'YouTube' :
                             platformType === 'vimeo' ? 'Vimeo' :
                             'فيديو'}
                          </div>
                        </div>
                        {/* Video duration badge */}
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                            {video.duration}
                          </div>
                        )}
                        {/* Status indicator */}
                        <div className="absolute top-2 left-2">
                          <div className={`w-3 h-3 rounded-full ${
                            video.status === 'approved' ? 'bg-green-500' :
                            video.status === 'rejected' ? 'bg-red-500' :
                            video.status === 'flagged' ? 'bg-yellow-500' :
                            'bg-gray-500'
                          } shadow-lg`}></div>
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex flex-col items-center justify-center">
                        <Video className="w-16 h-16 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">لا توجد صورة مصغرة</span>
                        {platformType !== 'other' && (
                          <span className="text-xs text-gray-400 mt-1">
                            {platformType === 'youtube' ? 'YouTube' :
                             platformType === 'vimeo' ? 'Vimeo' : ''}
                          </span>
                        )}
                      </div>
                    );
                  }
                })()}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span className="truncate">{video.userName}</span>
                  <Badge variant="outline" className="mr-2 text-xs flex-shrink-0">
                    {video.accountType === 'player' ? 'لاعب' :
                     video.accountType === 'club' ? 'نادي' :
                     video.accountType === 'agent' ? 'وكيل' :
                     video.accountType === 'parent' ? 'ولي أمر' :
                     video.accountType === 'marketer' ? 'مسوق' :
                     video.accountType}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="truncate">{video.views}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="truncate">{video.likes}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => updateVideoStatus(video.id, 'approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={video.status === 'approved'}
                >
                  {video.status === 'approved' ? 'مُوافق عليه' : 'موافقة'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateVideoStatus(video.id, 'rejected')}
                  disabled={video.status === 'rejected'}
                >
                  {video.status === 'rejected' ? 'مرفوض' : 'رفض'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateVideoStatus(video.id, 'flagged')}
                  disabled={video.status === 'flagged'}
                >
                  {video.status === 'flagged' ? 'مُعلَّم' : 'تعليم'}
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                <Button
                  size="sm"
                  onClick={() => openVideoDetails(video)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  تحليل الأداء وإرسال إشعار
                </Button>
                
                <Button
                  size="sm"
                  onClick={() => openVideoDetails(video)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Clock className="w-4 h-4 mr-1" />
                  عرض سجل الفيديو
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {videos.length === 0 ? 'لا توجد فيديوهات في النظام' : 'لا توجد فيديوهات تطابق معايير البحث'}
            </h3>
            <p className="text-gray-600">
              {videos.length === 0 
                ? 'لم يتم رفع أي فيديوهات من المستخدمين بعد. ستظهر الفيديوهات هنا عند رفعها.'
                : 'جرب تغيير معايير البحث أو إعادة تعيين الفلاتر'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* نافذة تفاصيل الفيديو */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[95vh] flex flex-col p-0" dir="rtl">
          <DialogHeader className="p-6 border-b bg-white">
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-20 h-12 overflow-hidden rounded bg-gray-100 flex-shrink-0 flex items-center justify-center">
                  {selectedVideo?.thumbnailUrl ? (
                    <img src={selectedVideo.thumbnailUrl} alt={selectedVideo.title} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl font-semibold truncate">
                    {selectedVideo?.title || 'تفاصيل الفيديو'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    {selectedVideo?.userName}
                  </DialogDescription>
                </div>
              </div>
              {selectedVideo && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => updateVideoStatus(selectedVideo.id, 'approved')}
                    disabled={selectedVideo.status === 'approved'}
                  >
                    موافقة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => updateVideoStatus(selectedVideo.id, 'rejected')}
                    disabled={selectedVideo.status === 'rejected'}
                  >
                    رفض
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-50 hover:text-yellow-600"
                    onClick={() => updateVideoStatus(selectedVideo.id, 'flagged')}
                    disabled={selectedVideo.status === 'flagged'}
                  >
                    تعليم
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedVideo && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 flex-1 overflow-hidden">
              {/* Main Content: Video Player and Description */}
              <div className="lg:col-span-2 bg-gray-50 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-sm">
                    {selectedVideo.url ? (
                      <ReactPlayer
                        url={selectedVideo.url}
                        width="100%"
                        height="100%"
                        controls
                        light={selectedVideo.thumbnailUrl || true}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Video className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg border p-4 shadow-sm">
                    <h4 className="text-base font-semibold mb-2">الوصف</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedVideo.description || 'لا يوجد وصف متاح.'}</p>
                  </div>
                </div>
              </div>

              {/* Sidebar: Details, Logs, and Messages */}
              <div className="lg:col-span-1 bg-white border-r flex flex-col">
                <div className="p-6 border-b">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">الحالة الحالية</h4>
                      <Badge className={getStatusColor(selectedVideo.status)}>
                        {getStatusIcon(selectedVideo.status)}
                        <span className="mr-1">
                          {selectedVideo.status === 'pending' && 'في الانتظar'}
                          {selectedVideo.status === 'approved' && 'مُوافق عليه'}
                          {selectedVideo.status === 'rejected' && 'مرفوض'}
                          {selectedVideo.status === 'flagged' && 'مُعلَّم'}
                        </span>
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">الإحصاءات</h4>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-700"><Eye className="w-4 h-4 text-blue-600" /> {selectedVideo.views} مشاهدة</div>
                        <div className="flex items-center gap-2 text-gray-700"><Star className="w-4 h-4 text-amber-500" /> {selectedVideo.likes} إعجاب</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="logs" className="w-full flex-1 flex flex-col overflow-hidden">
                  <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
                    <TabsTrigger value="logs">السجل</TabsTrigger>
                    <TabsTrigger value="messages">الرسائل</TabsTrigger>
                  </TabsList>

                  <TabsContent value="logs" className="flex-1 overflow-y-auto p-4">
                    {logsLoading ? (
                      <div className="text-center py-10"><p>جاري تحميل السجل...</p></div>
                    ) : logs.length === 0 ? (
                      <div className="text-center py-10"><p>لا يوجد سجلات.</p></div>
                    ) : (
                      <div className="space-y-4">
                        {logs.map(log => (
                          <div key={log.id} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              {log.action === 'upload' && <Video className="w-4 h-4 text-green-600" />}
                              {log.action === 'status_change' && <Clock className="w-4 h-4 text-amber-600" />}
                              {log.action === 'notification_sent' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{log.action}</p>
                              <p className="text-xs text-gray-500 mt-1">{log.notes}</p>
                              <p className="text-xs text-gray-400 mt-1">{log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString('ar') : ''}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="messages" className="flex-1 overflow-y-auto p-4">
                    {user && userData && (
                      <div className="space-y-3">
                        <SendMessageButton
                          user={user}
                          userData={userData}
                          getUserDisplayName={() => (userData?.full_name || userData?.name || user?.email || 'أنا')}
                          targetUserId={selectedVideo.userId}
                          targetUserName={selectedVideo.userName}
                          targetUserType={selectedVideo.accountType}
                          buttonText="إرسال رسالة لرافع الفيديو"
                          buttonVariant="default"
                          className="w-full"
                        />
                        <div className="text-xs text-center text-gray-500">سيتم إرسال رسالة مباشرة للمستخدم.</div>
                        
                        {/* إرسال SMS/WhatsApp */}
                        <div className="border-t pt-4 mt-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">إرسال إشعار خارجي</h4>
                          </div>
                          
                          {/* نماذج الرسائل الجاهزة */}
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">اختر نموذج جاهز:</label>
                            <select 
                              className="w-full p-3 text-sm border-2 border-blue-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                              title="اختر نموذج رسالة جاهز"
                              onChange={(e) => {
                                const template = e.target.value;
                                if (template) {
                                  // تطبيق النموذج المختار
                                  const templates = {
                                    // نماذج تحليل الأداء التقني (قصيرة)
                                    'technical-excellent': `مرحباً ${selectedVideo.userName}، أداءك التقني ممتاز! تقييم: 9/10. استمر في التميز!`,
                                    
                                    'technical-good': `مرحباً ${selectedVideo.userName}، أداءك التقني جيد! تقييم: 7/10. استمر في التطوير!`,
                                    
                                    'technical-needs-improvement': `مرحباً ${selectedVideo.userName}، أداءك التقني يحتاج تحسين. تقييم: 5/10. لا تستسلم!`,
                                    
                                    // نماذج تحليل الأداء البدني (قصيرة)
                                    'physical-excellent': `مرحباً ${selectedVideo.userName}، لياقتك البدنية ممتازة! تقييم: 9/10. أداء متميز!`,
                                    
                                    'physical-good': `مرحباً ${selectedVideo.userName}، لياقتك البدنية جيدة! تقييم: 7/10. استمر في التطوير!`,
                                    
                                    'physical-needs-work': `مرحباً ${selectedVideo.userName}، لياقتك البدنية تحتاج عمل. تقييم: 4/10. التدريب سيحسن أداءك!`,
                                    
                                    // نماذج تحليل الأداء النفسي (قصيرة)
                                    'mental-excellent': `مرحباً ${selectedVideo.userName}، عقلية قوية ومتميزة! تقييم: 9/10. استمر في التميز!`,
                                    
                                    'mental-good': `مرحباً ${selectedVideo.userName}، عقلية إيجابية! تقييم: 7/10. استمر في التطوير!`,
                                    
                                    'mental-needs-support': `مرحباً ${selectedVideo.userName}، تحتاج دعم نفسي. تقييم: 4/10. الثقة تأتي مع التدريب!`,
                                    
                                    // نماذج تحليل شامل (قصيرة)
                                    'comprehensive-excellent': `مرحباً ${selectedVideo.userName}، أداء شامل ممتاز! تقييم: 9/10. أنت لاعب متميز!`,
                                    
                                    'comprehensive-good': `مرحباً ${selectedVideo.userName}، أداء شامل جيد! تقييم: 7/10. استمر في التطوير!`,
                                    
                                    'comprehensive-needs-work': `مرحباً ${selectedVideo.userName}، أداء شامل يحتاج عمل. تقييم: 5/10. لا تستسلم!`,
                                    
                                    // نماذج خاصة بالمراكز (قصيرة)
                                    'goalkeeper-analysis': `مرحباً ${selectedVideo.userName}، أداء ممتاز كحارس مرمى! تقييم: 8/10. استمر في التميز!`,
                                    
                                    'defender-analysis': `مرحباً ${selectedVideo.userName}، أداء ممتاز كمدافع! تقييم: 8/10. استمر في التميز!`,
                                    
                                    'midfielder-analysis': `مرحباً ${selectedVideo.userName}، أداء ممتاز كلاعب وسط! تقييم: 8/10. استمر في التميز!`,
                                    
                                    'forward-analysis': `مرحباً ${selectedVideo.userName}، أداء ممتاز كمهاجم! تقييم: 8/10. استمر في التميز!`,
                                    
                                    // نماذج التحفيز والتشجيع (قصيرة)
                                    'motivational': `مرحباً ${selectedVideo.userName}، أنت تمتلك موهبة حقيقية! استمر في التدريب والتميز!`,
                                    
                                    'encouragement': `مرحباً ${selectedVideo.userName}، نفتخر بك! تحسنك ملحوظ. استمر في التميز!`,
                                    
                                    'guidance': `مرحباً ${selectedVideo.userName}، خطة تطوير: تدريب يومي 30 دقيقة. أنت قادر على التحسين!`,
                                    
                                    'invitation': `مرحباً ${selectedVideo.userName}، نرى فيك موهبة! نود دعوتك للانضمام لفريقنا. هل أنت مستعد؟`,
                                    
                                    // نماذج عامة (قصيرة)
                                    'video-approved': `مرحباً ${selectedVideo.userName}، تم قبول الفيديو. شكراً لمساهمتك في منصة الحلم.`,
                                    'video-rejected': `مرحباً ${selectedVideo.userName}، لم يتم قبول الفيديو. يرجى مراجعة المحتوى وإعادة المحاولة.`,
                                    'video-flagged': `مرحباً ${selectedVideo.userName}، تم تعليم الفيديو للمراجعة. سيتم التواصل معك قريباً.`,
                                    'video-featured': `مرحباً ${selectedVideo.userName}، مبروك! تم اختيار الفيديو كفيديو مميز. شكراً لك!`,
                                    'general-notification': `مرحباً ${selectedVideo.userName}، تم مراجعة ملفك الشخصي. شكراً لانضمامك لمنصة الحلم.`
                                  };
                                  // تخزين النموذج المختار للاستخدام
                                  (window as any).selectedTemplate = templates[template as keyof typeof templates];
                                  // تحديث حقل النص
                                  const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
                                  if (textarea) {
                                    textarea.value = templates[template as keyof typeof templates];
                                  }
                                }
                              }}
                            >
                              <optgroup label="🏆 تحليل الأداء التقني">
                                <option value="technical-excellent">ممتاز تقنياً</option>
                                <option value="technical-good">جيد تقنياً</option>
                                <option value="technical-needs-improvement">يحتاج تحسين تقني</option>
                              </optgroup>
                              
                              <optgroup label="💪 تحليل الأداء البدني">
                                <option value="physical-excellent">ممتاز بدنياً</option>
                                <option value="physical-good">جيد بدنياً</option>
                                <option value="physical-needs-work">يحتاج عمل بدني</option>
                              </optgroup>
                              
                              <optgroup label="🧠 تحليل الأداء النفسي">
                                <option value="mental-excellent">ممتاز نفسياً</option>
                                <option value="mental-good">جيد نفسياً</option>
                                <option value="mental-needs-support">يحتاج دعم نفسي</option>
                              </optgroup>
                              
                              <optgroup label="🌟 تحليل شامل">
                                <option value="comprehensive-excellent">تحليل شامل ممتاز</option>
                                <option value="comprehensive-good">تحليل شامل جيد</option>
                                <option value="comprehensive-needs-work">تحليل شامل يحتاج عمل</option>
                              </optgroup>
                              
                              <optgroup label="⚽ تحليل حسب المركز">
                                <option value="goalkeeper-analysis">تحليل حارس مرمى</option>
                                <option value="defender-analysis">تحليل مدافع</option>
                                <option value="midfielder-analysis">تحليل لاعب وسط</option>
                                <option value="forward-analysis">تحليل مهاجم</option>
                              </optgroup>
                              
                              <optgroup label="🔥 التحفيز والتشجيع">
                                <option value="motivational">رسالة تحفيزية</option>
                                <option value="encouragement">رسالة تشجيعية</option>
                                <option value="guidance">توجيهات للتحسين</option>
                                <option value="invitation">دعوة للانضمام</option>
                              </optgroup>
                              
                              <optgroup label="📋 نماذج عامة">
                                <option value="video-approved">قبول الفيديو</option>
                                <option value="video-rejected">رفض الفيديو</option>
                                <option value="video-flagged">تعليم الفيديو</option>
                                <option value="video-featured">فيديو مميز</option>
                                <option value="general-notification">إشعار عام</option>
                              </optgroup>
                            </select>
                          </div>

                          {/* حقل تعديل الرسالة */}
                          <div className="mb-4">
                            <label className="text-sm font-medium text-gray-700 mb-2 block">محتوى الرسالة:</label>
                            <textarea
                              id="message-content"
                              className="w-full p-3 text-sm border-2 border-blue-200 rounded-lg bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                              rows={4}
                              placeholder="اكتب رسالتك هنا أو اختر نموذج جاهز..."
                              defaultValue={`مرحباً ${selectedVideo.userName}،\n\nتم مراجعة الفيديو "${selectedVideo.title}" من قِبل فريق الإدارة.\n\nشكراً لمساهمتك في منصة الحلم.`}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              يمكنك تعديل الرسالة حسب الحاجة
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button
                              onClick={async () => {
                                try {
                                  // جلب بيانات المستخدم
                                  const userRef = doc(db, `${selectedVideo.accountType}s`, selectedVideo.userId);
                                  const userDoc = await getDoc(userRef);
                                  const userData = userDoc.data();
                                  
                                  if (userData?.phone) {
                                    // استخدام النص من حقل التعديل
                                    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
                                    const message = textarea?.value || `مرحباً ${selectedVideo.userName}،\n\nتم مراجعة الفيديو "${selectedVideo.title}" من قِبل فريق الإدارة.\n\nشكراً لمساهمتك في منصة الحلم.`;
                                    
                                    await fetch('/api/notifications/sms/bulk', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        phoneNumbers: [userData.phone],
                                        message: message
                                      })
                                    });
                                    toast.success('تم إرسال SMS بنجاح');
                                  } else {
                                    toast.error('رقم الهاتف غير متوفر');
                                  }
                                } catch (error) {
                                  console.error('خطأ في إرسال SMS:', error);
                                  toast.error('فشل في إرسال SMS');
                                }
                              }}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">📱</span>
                                <span className="font-medium">إرسال SMS</span>
                              </div>
                            </Button>
                            
                            <Button
                              onClick={() => {
                                // جلب بيانات المستخدم
                                const userRef = doc(db, `${selectedVideo.accountType}s`, selectedVideo.userId);
                                getDoc(userRef).then(userDoc => {
                                  const userData = userDoc.data();
                                  if (userData?.phone) {
                                    // استخدام النص من حقل التعديل
                                    const textarea = document.getElementById('message-content') as HTMLTextAreaElement;
                                    const message = textarea?.value || `مرحباً ${selectedVideo.userName}،\n\nتم مراجعة الفيديو "${selectedVideo.title}" من قِبل فريق الإدارة.\n\nشكراً لمساهمتك في منصة الحلم.`;
                                    
                                    const whatsappUrl = `https://wa.me/${userData.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                    toast.success('تم فتح WhatsApp');
                                  } else {
                                    toast.error('رقم الهاتف غير متوفر');
                                  }
                                }).catch(error => {
                                  console.error('خطأ في جلب بيانات المستخدم:', error);
                                  toast.error('فشل في جلب بيانات المستخدم');
                                });
                              }}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">💬</span>
                                <span className="font-medium">إرسال WhatsApp</span>
                              </div>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

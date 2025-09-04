'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
   Plus, 
   Edit, 
   Trash2, 
   Eye, 
   EyeOff, 
   Image, 
   Video, 
   FileText,
   Calendar,
   Users,
   Target,
   BarChart3,
   Save,
   X,
   Clock,
   AlertCircle,
   TrendingUp,
   CheckCircle,
   Info,
   Gift,
   Zap,
   Settings,
   ExternalLink,
   Upload
 } from 'lucide-react';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdAnalytics from '@/components/ads/AdAnalytics';
import AdFileUpload from '@/components/ads/AdFileUpload';
import { ensureAdsBucketExists, getAdsStorageStats } from '@/lib/supabase/ads-storage';

interface Ad {
  id?: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  customUrl?: string;
  isActive: boolean;
  priority: number;
  targetAudience: 'all' | 'new_users' | 'returning_users';
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  clicks: number;
  // New popup-specific fields
  popupType: 'modal' | 'toast' | 'banner' | 'side-panel';
  displayDelay: number; // seconds
  maxDisplays: number;
  displayFrequency: 'once' | 'daily' | 'weekly' | 'always';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showCloseButton: boolean;
  autoClose?: number; // seconds
  showProgressBar: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  discount?: string;
  countdown?: string;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [bucketStatus, setBucketStatus] = useState<'checking' | 'exists' | 'missing'>('checking');
  const [storageStats, setStorageStats] = useState<{
    totalFiles: number;
    totalSize: number;
    imagesCount: number;
    videosCount: number;
  } | null>(null);
  
  const [formData, setFormData] = useState<Partial<Ad>>({
    title: '',
    description: '',
    type: 'text',
    mediaUrl: '',
    ctaText: '',
     ctaUrl: '',
     customUrl: '',
    isActive: true,
    priority: 1,
    targetAudience: 'new_users',
    startDate: '',
    endDate: '',
    // New popup fields
    popupType: 'modal',
    displayDelay: 3,
    maxDisplays: 1,
    displayFrequency: 'once',
    showCloseButton: true,
    autoClose: 0,
    showProgressBar: false,
    urgency: 'medium',
    discount: '',
    countdown: ''
  });

  const stats = [
    {
      title: "إجمالي الإعلانات",
      value: ads.length.toString(),
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "الإعلانات النشطة",
      value: ads.filter(ad => ad.isActive).length.toString(),
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "إجمالي المشاهدات",
      value: ads.reduce((sum, ad) => sum + ad.views, 0).toString(),
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "إجمالي النقرات",
      value: ads.reduce((sum, ad) => sum + ad.clicks, 0).toString(),
      icon: Target,
      color: "text-orange-600"
    }
  ];

  useEffect(() => {
    fetchAds();
    checkBucketStatus();
  }, []);

  const checkBucketStatus = async () => {
    try {
      const exists = await ensureAdsBucketExists();
      setBucketStatus(exists ? 'exists' : 'missing');
      
      if (exists) {
        const stats = await getAdsStorageStats();
        setStorageStats(stats);
      }
    } catch (error) {
      console.error('Error checking bucket status:', error);
      setBucketStatus('missing');
    }
  };

  const fetchAds = async () => {
    try {
      const q = query(collection(db, 'ads'), orderBy('priority', 'asc'));
      const snapshot = await getDocs(q);
      const adsData: Ad[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        views: doc.data().views || 0,
        clicks: doc.data().clicks || 0
      })) as Ad[];
      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

     const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     try {
       // Handle custom URL logic
       let finalCtaUrl = formData.ctaUrl;
       if (formData.ctaUrl === 'custom' && formData.customUrl) {
         // Validate custom URL
         if (!formData.customUrl.startsWith('http://') && !formData.customUrl.startsWith('https://')) {
           alert('يجب أن يبدأ الرابط المخصص بـ http:// أو https://');
           return;
         }
         finalCtaUrl = formData.customUrl;
       }
       
       const adData: Partial<Ad> = {
         ...formData,
         ctaUrl: finalCtaUrl,
         createdAt: editingAd ? editingAd.createdAt : new Date(),
         updatedAt: new Date(),
         views: editingAd?.views || 0,
         clicks: editingAd?.clicks || 0
       };

      if (editingAd?.id) {
        await updateDoc(doc(db, 'ads', editingAd.id), adData);
      } else {
        await addDoc(collection(db, 'ads'), adData);
      }

      setShowAddDialog(false);
      setEditingAd(null);
      resetForm();
      await fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
    }
  };

     const handleEdit = (ad: Ad) => {
     setEditingAd(ad);
     
     // Handle custom URL logic for editing
     let ctaUrl = ad.ctaUrl || '';
     let customUrl = '';
     
     // Check if the URL is one of our predefined options
     const predefinedUrls = [
       '/auth/register', '/auth/login', '/dashboard', '/pricing', 
       '/about', '/contact', '/features', '/testimonials', '/blog', '/support'
     ];
     
     if (ctaUrl && !predefinedUrls.includes(ctaUrl)) {
       customUrl = ctaUrl;
       ctaUrl = 'custom';
     }
     
     setFormData({
       title: ad.title,
       description: ad.description,
       type: ad.type,
       mediaUrl: ad.mediaUrl || '',
       ctaText: ad.ctaText || '',
       ctaUrl: ctaUrl,
       customUrl: customUrl,
      isActive: ad.isActive,
      priority: ad.priority,
      targetAudience: ad.targetAudience,
      startDate: ad.startDate || '',
      endDate: ad.endDate || '',
      // Popup fields
      popupType: ad.popupType || 'modal',
      displayDelay: ad.displayDelay || 3,
      maxDisplays: ad.maxDisplays || 1,
      displayFrequency: ad.displayFrequency || 'once',
      showCloseButton: ad.showCloseButton !== false,
      autoClose: ad.autoClose || 0,
      showProgressBar: ad.showProgressBar || false,
      urgency: ad.urgency || 'medium',
      discount: ad.discount || '',
      countdown: ad.countdown || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        await deleteDoc(doc(db, 'ads', id));
        await fetchAds();
      } catch (error) {
        console.error('Error deleting ad:', error);
      }
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id!), { 
        isActive: !ad.isActive,
        updatedAt: new Date()
      });
      await fetchAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
    }
  };

     const resetForm = () => {
     setFormData({
       title: '',
       description: '',
       type: 'text',
       mediaUrl: '',
       ctaText: '',
       ctaUrl: '',
       customUrl: '',
       isActive: true,
       priority: 1,
       targetAudience: 'new_users',
       startDate: '',
       endDate: '',
       // Reset popup fields
       popupType: 'modal',
       displayDelay: 3,
       maxDisplays: 1,
       displayFrequency: 'once',
       showCloseButton: true,
       autoClose: 0,
       showProgressBar: false,
       urgency: 'medium',
       discount: '',
       countdown: ''
     });
   };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'image': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'new_users': return 'bg-green-100 text-green-700';
      case 'returning_users': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <AccountTypeProtection allowedTypes={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6 lg:mb-8">
            {/* تنبيه حالة bucket الإعلانات */}
            {bucketStatus === 'missing' && (
              <div className="mb-4 lg:mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 lg:p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                      تنبيه: bucket الإعلانات غير موجود
                    </h3>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                      يجب إنشاء bucket باسم "ads" في Supabase Storage لتمكين رفع ملفات الإعلانات.
                      <br />
                      <strong>الخطوات:</strong>
                      <br />
                      1. اذهب إلى Supabase Dashboard
                      <br />
                      2. انتقل إلى Storage
                      <br />
                      3. أنشئ bucket جديد باسم "ads"
                      <br />
                      4. اضبط السياسات للوصول الآمن
                      <br />
                      <br />
                      <strong>ملاحظة مهمة:</strong> تأكد من تشغيل ملف <code className="bg-yellow-100 px-2 py-1 rounded text-xs">supabase-ads-policies-simple.sql</code> 
                      في SQL Editor لإنشاء السياسات البسيطة المطلوبة.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">إدارة الإعلانات</h1>
                <p className="text-gray-600 text-sm lg:text-base">إدارة الإعلانات المعروضة على صفحة الترحيب</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                <Button 
                  onClick={() => setShowAnalytics(true)}
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 px-4 lg:px-6 py-2 lg:py-3 h-10 lg:h-12 transition-all duration-200 shadow-sm hover:shadow-md text-sm lg:text-base font-medium"
                >
                  <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  التحليلات المتقدمة
                </Button>
                <Button 
                  onClick={() => {
                    setEditingAd(null);
                    resetForm();
                    setShowAddDialog(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-4 lg:px-8 py-2 lg:py-3 h-10 lg:h-12 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm lg:text-base font-semibold"
                >
                  <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  إضافة إعلان جديد
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                      <stat.icon className={`h-6 w-6 lg:h-7 lg:w-7 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Storage Stats Card */}
            {bucketStatus === 'exists' && storageStats && (
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1">ملفات التخزين</p>
                      <p className="text-2xl lg:text-3xl font-bold text-blue-900">{storageStats.totalFiles}</p>
                      <div className="text-xs text-blue-600 mt-1 space-y-0.5">
                        <div>الصور: {storageStats.imagesCount}</div>
                        <div>الفيديوهات: {storageStats.videosCount}</div>
                        <div>الحجم: {(storageStats.totalSize / (1024 * 1024)).toFixed(1)}MB</div>
                      </div>
                    </div>
                    <div className="p-3 lg:p-4 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 shadow-inner">
                      <Upload className="h-6 w-6 lg:h-7 lg:w-7 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ads Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 lg:py-16">
                <div className="w-16 h-16 lg:w-20 lg:h-20 mx-auto mb-4 lg:mb-6 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin shadow-lg"></div>
                <p className="text-gray-600 text-base lg:text-lg font-medium">جاري تحميل الإعلانات...</p>
                <p className="text-gray-500 text-sm mt-2">يرجى الانتظار قليلاً</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="col-span-full text-center py-12 lg:py-16">
                <div className="w-24 h-24 lg:w-32 lg:h-32 mx-auto mb-4 lg:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-12 w-12 lg:h-16 lg:w-16 text-gray-400" />
                </div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 lg:mb-3">لا توجد إعلانات</h3>
                <p className="text-gray-600 mb-4 lg:mb-6 text-sm lg:text-base">ابدأ بإضافة إعلان جديد لعرضه على العملاء</p>
                <Button 
                  onClick={() => {
                    setEditingAd(null);
                    resetForm();
                    setShowAddDialog(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-6 lg:px-12 py-3 lg:py-4 h-12 lg:h-14 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm lg:text-base font-semibold"
                >
                  <Plus className="h-5 w-5 lg:h-6 lg:w-6 mr-2" />
                  إضافة إعلان جديد
                </Button>
              </div>
            ) : (
              ads.map((ad) => (
                <Card key={ad.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden group">
                  <CardHeader className="pb-3 lg:pb-4 bg-gradient-to-r from-gray-50 to-gray-100">
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 lg:p-2 rounded-lg bg-white shadow-sm">
                          {getTypeIcon(ad.type)}
                        </div>
                        <Badge className={`${getTypeColor(ad.type)} shadow-sm text-xs lg:text-sm px-2 py-1`}>
                          {ad.type === 'video' ? 'فيديو' : ad.type === 'image' ? 'صورة' : 'نص'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getAudienceColor(ad.targetAudience)} shadow-sm text-xs lg:text-sm px-2 py-1`}>
                          {ad.targetAudience === 'new_users' ? 'مستخدمين جدد' : 
                           ad.targetAudience === 'returning_users' ? 'مستخدمين عائدين' : 'الجميع'}
                        </Badge>
                        <div className="bg-white p-1.5 lg:p-2 rounded-lg shadow-sm border border-gray-200">
                          <Switch
                            checked={ad.isActive}
                            onCheckedChange={() => toggleActive(ad)}
                            className={`${ad.isActive ? 'bg-green-600' : 'bg-gray-300'}`}
                          />
                          <Badge className={`mt-1 text-xs ${ad.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {ad.isActive ? 'نشط' : 'معطل'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 mb-2">{ad.title}</CardTitle>
                    <CardDescription className="line-clamp-2 text-gray-600 leading-relaxed text-sm lg:text-base">
                      {ad.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="p-4 lg:p-6">
                    {ad.mediaUrl && (
                      <div className="mb-3 lg:mb-4">
                        {ad.type === 'image' ? (
                          <div className="relative overflow-hidden rounded-lg lg:rounded-xl">
                            <img 
                              src={ad.mediaUrl} 
                              alt={ad.title}
                              className="w-full h-32 lg:h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                          </div>
                        ) : ad.type === 'video' ? (
                          <div className="w-full h-32 lg:h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg lg:rounded-xl flex items-center justify-center relative overflow-hidden">
                            <Video className="h-8 w-8 lg:h-12 lg:w-12 text-gray-400 relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-blue-100/50"></div>
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    <div className="space-y-2 lg:space-y-3 text-xs lg:text-sm">
                      <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                        <Calendar className="h-3 w-3 lg:h-4 lg:w-4 text-blue-600" />
                        <span className="text-blue-700 font-medium">الأولوية: {ad.priority}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                        <Users className="h-3 w-3 lg:h-4 lg:w-4 text-green-600" />
                        <span className="text-green-700 font-medium">المشاهدات: {ad.views}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-orange-50 p-2 rounded-lg">
                        <Target className="h-3 w-3 lg:h-4 lg:w-4 text-orange-600" />
                        <span className="text-orange-700 font-medium">النقرات: {ad.clicks}</span>
                      </div>
                      {ad.ctaUrl && (
                        <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-lg">
                          <ExternalLink className="h-3 w-3 lg:h-4 lg:w-4 text-indigo-600" />
                          <span className="text-indigo-700 font-medium text-xs">
                            وجهة: {ad.ctaUrl.startsWith('http') ? 'رابط خارجي' : ad.ctaUrl}
                          </span>
                        </div>
                      )}
                      
                      {/* Popup Info */}
                      <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-2 lg:p-3 rounded-lg border border-purple-100 mt-3 lg:mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="h-3 w-3 lg:h-4 lg:w-4 text-purple-600" />
                          <span className="text-xs lg:text-sm font-semibold text-purple-700">إعدادات النافذة المنبثقة</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 lg:gap-2 text-xs">
                          <div className="flex items-center gap-1 bg-white p-1 rounded">
                            <span className="text-purple-600 font-medium">النوع:</span>
                            <Badge variant="outline" className="text-xs px-1 lg:px-2 py-0 border-purple-200 text-purple-700">
                              {ad.popupType === 'modal' ? 'مركزي' : 
                               ad.popupType === 'toast' ? 'إشعار' : 
                               ad.popupType === 'banner' ? 'شريط' : 'جانبي'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 bg-white p-1 rounded">
                            <span className="text-purple-600 font-medium">الأهمية:</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs px-1 lg:px-2 py-0 ${
                                ad.urgency === 'critical' ? 'border-red-200 text-red-700' :
                                ad.urgency === 'high' ? 'border-orange-200 text-orange-700' :
                                ad.urgency === 'medium' ? 'border-blue-200 text-blue-700' :
                                'border-green-200 text-green-700'
                              }`}
                            >
                              {ad.urgency === 'critical' ? 'عاجل' :
                               ad.urgency === 'high' ? 'مهم' :
                               ad.urgency === 'medium' ? 'عادي' : 'منخفض'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 bg-white p-1 rounded">
                            <span className="text-purple-600 font-medium">التأخير:</span>
                            <span className="text-purple-700">{ad.displayDelay || 3}s</span>
                          </div>
                          <div className="flex items-center gap-1 bg-white p-1 rounded">
                            <span className="text-purple-600 font-medium">التكرار:</span>
                            <span className="text-purple-700">{ad.displayFrequency === 'once' ? 'مرة' :
                                   ad.displayFrequency === 'daily' ? 'يومي' :
                                   ad.displayFrequency === 'weekly' ? 'أسبوعي' : 'دائم'}</span>
                          </div>
                        </div>
                        
                        {/* Special Features */}
                        {(ad.discount || ad.countdown || ad.autoClose) && (
                          <div className="mt-2 lg:mt-3 pt-2 lg:pt-3 border-t border-purple-200">
                            <div className="flex flex-wrap gap-1 lg:gap-2">
                              {ad.discount && (
                                <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 lg:px-3 py-1 shadow-md">
                                  <Gift className="h-3 w-3 mr-1" />
                                  {ad.discount}
                                </Badge>
                              )}
                              {ad.countdown && (
                                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 lg:px-3 py-1 shadow-md">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {ad.countdown}
                                </Badge>
                              )}
                              {ad.autoClose && ad.autoClose > 0 && (
                                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 lg:px-3 py-1 shadow-md">
                                  <Settings className="h-3 w-3 mr-1" />
                                  إغلاق تلقائي
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3 mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-100">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setPreviewAd(ad)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 h-8 lg:h-10 px-2 lg:px-4 text-xs lg:text-sm"
                      >
                        <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        معاينة
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(ad)}
                        className="border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 transition-all duration-200 h-8 lg:h-10 px-2 lg:px-4 text-xs lg:text-sm"
                      >
                        <Edit className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        تعديل
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDelete(ad.id!)}
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-all duration-200 h-8 lg:h-10 px-2 lg:px-4 text-xs lg:text-sm"
                      >
                        <Trash2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          console.log('Dialog state changing to:', open);
          setShowAddDialog(open);
        }}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بإضافة إعلان جديد ليظهر على صفحة الترحيب للعملاء
              </DialogDescription>
            </DialogHeader>
            
                         <form onSubmit={handleSubmit} className="space-y-8">
               {/* Basic Information Section */}
               <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-blue-800">
                   <FileText className="h-5 w-5" />
                   المعلومات الأساسية
                 </h3>
                 
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="title" className="text-sm lg:text-base font-semibold text-gray-700">
                         عنوان الإعلان *
                       </Label>
                                             <Input
                         id="title"
                         value={formData.title}
                         onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                         placeholder="أدخل عنوان الإعلان الجذاب"
                         required
                         className="h-14 lg:h-16 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                       />
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="type" className="text-sm lg:text-base font-semibold text-gray-700">
                         نوع الإعلان *
                       </Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value) => setFormData(prev => ({...prev, type: value as any}))}
                      >
                                                 <SelectTrigger className="h-14 lg:h-16 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4">
                           <SelectValue placeholder="اختر نوع الإعلان" />
                         </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">📝 نص</SelectItem>
                          <SelectItem value="image">🖼️ صورة</SelectItem>
                          <SelectItem value="video">🎥 فيديو</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
               </div>

                             {/* Description Section */}
               <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100">
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-800">
                   <FileText className="h-5 w-5" />
                   وصف الإعلان
                 </h3>
                 
                                   <div className="space-y-2 lg:space-y-3">
                                         <Label htmlFor="description" className="text-sm lg:text-base font-semibold text-gray-700">
                       وصف الإعلان *
                     </Label>
                                         <Textarea
                       id="description"
                       value={formData.description}
                       onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                       placeholder="اكتب وصفاً مفصلاً ومقنعاً للإعلان..."
                       rows={4}
                       required
                       className="border-gray-300 focus:border-green-500 focus:ring-green-500 bg-white resize-none text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4 min-h-[120px] lg:min-h-[150px]"
                     />
                  </div>
               </div>

                                                           {/* Media Section */}
                {(formData.type === 'image' || formData.type === 'video') && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-800">
                      {formData.type === 'image' ? <Image className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                      الوسائط
                    </h3>
                    
                    <div className="space-y-6">
                      {/* مكون رفع الملفات */}
                      <AdFileUpload
                        adId={editingAd?.id || `temp_${Date.now()}`}
                        fileType={formData.type}
                        onFileUploaded={(url) => {
                          console.log('File uploaded successfully, updating formData with URL:', url);
                          setFormData(prev => {
                            console.log('Previous formData:', prev);
                            const newFormData = {...prev, mediaUrl: url};
                            console.log('New formData:', newFormData);
                            return newFormData;
                          });
                        }}
                        onFileDeleted={() => {
                          setFormData(prev => ({...prev, mediaUrl: ''}));
                        }}
                        currentFileUrl={formData.mediaUrl}
                      />
                      
                      {/* حقل الرابط اليدوي (اختياري) */}
                      <div className="space-y-2 lg:space-y-3">
                        <Label htmlFor="mediaUrl" className="text-sm lg:text-base font-semibold text-gray-700">
                          أو أدخل رابط {formData.type === 'image' ? 'الصورة' : 'الفيديو'} يدوياً
                        </Label>
                        <Input
                          id="mediaUrl"
                          value={formData.mediaUrl}
                          onChange={(e) => setFormData(prev => ({...prev, mediaUrl: e.target.value}))}
                          placeholder={`أدخل رابط ${formData.type === 'image' ? 'الصورة' : 'الفيديو'} (https://example.com/image.jpg)`}
                          className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                        />
                        <p className="text-xs lg:text-sm text-gray-600">
                          يمكنك رفع ملف من جهازك أعلاه أو إدخال رابط خارجي هنا
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                             {/* Call to Action Section */}
               <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-100">
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-orange-800">
                   <Target className="h-5 w-5" />
                   زر الدعوة للعمل
                 </h3>
                 
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="ctaText" className="text-sm lg:text-base font-semibold text-gray-700">
                         نص الزر
                       </Label>
                                             <Input
                         id="ctaText"
                         value={formData.ctaText}
                         onChange={(e) => setFormData(prev => ({...prev, ctaText: e.target.value}))}
                         placeholder="مثال: اشترك الآن، احصل على الخصم، تعرف على المزيد"
                         className="h-14 lg:h-16 border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                       />
                    </div>
                    
                                         <div className="space-y-2 lg:space-y-3">
                       <Label htmlFor="ctaUrl" className="text-sm lg:text-base font-semibold text-gray-700">
                         وجهة الزر
                       </Label>
                       <p className="text-xs lg:text-sm text-gray-600 -mt-1">
                         اختر وجهة الزر أو اختر "رابط مخصص" لإدخال رابط خارجي
                       </p>
                       <Select 
                         value={formData.ctaUrl} 
                         onValueChange={(value) => setFormData(prev => ({...prev, ctaUrl: value}))}
                       >
                         <SelectTrigger className="h-14 lg:h-16 border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4">
                           <SelectValue placeholder="اختر وجهة الزر" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="/auth/register">📝 التسجيل</SelectItem>
                           <SelectItem value="/auth/login">🔑 تسجيل الدخول</SelectItem>
                           <SelectItem value="/dashboard">🏠 لوحة التحكم</SelectItem>
                           <SelectItem value="/pricing">💰 الأسعار</SelectItem>
                           <SelectItem value="/about">ℹ️ من نحن</SelectItem>
                           <SelectItem value="/contact">📞 اتصل بنا</SelectItem>
                           <SelectItem value="/features">✨ المميزات</SelectItem>
                           <SelectItem value="/testimonials">💬 آراء العملاء</SelectItem>
                           <SelectItem value="/blog">📰 المدونة</SelectItem>
                           <SelectItem value="/support">🆘 الدعم الفني</SelectItem>
                           <SelectItem value="custom">🔗 رابط مخصص</SelectItem>
                         </SelectContent>
                       </Select>
                     </div>
                  </div>
                  
                                     {/* Custom URL Input - Only show when "custom" is selected */}
                   {formData.ctaUrl === 'custom' && (
                     <div className="space-y-2 lg:space-y-3 mt-4">
                       <Label htmlFor="customUrl" className="text-sm lg:text-base font-semibold text-gray-700">
                         الرابط المخصص
                       </Label>
                       <p className="text-xs lg:text-sm text-gray-600 -mt-1">
                         أدخل الرابط الكامل مع https:// أو http://
                       </p>
                      <Input
                        id="customUrl"
                        value={formData.customUrl || ''}
                        onChange={(e) => setFormData(prev => ({...prev, customUrl: e.target.value}))}
                        placeholder="https://example.com"
                        className="h-14 lg:h-16 border-gray-300 focus:border-orange-500 focus:ring-orange-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                      />
                    </div>
                  )}
               </div>

                             {/* Settings Section */}
               <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-100">
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-teal-800">
                   <Settings className="h-5 w-5" />
                   الإعدادات الأساسية
                 </h3>
                 
                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="priority" className="text-sm lg:text-base font-semibold text-gray-700">
                         الأولوية
                       </Label>
                                             <Input
                         id="priority"
                         type="number"
                         value={formData.priority}
                         onChange={(e) => setFormData(prev => ({...prev, priority: parseInt(e.target.value)}))}
                         min="1"
                         max="10"
                         className="h-14 lg:h-16 border-gray-300 focus:border-teal-500 focus:ring-teal-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                       />
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="targetAudience" className="text-sm lg:text-base font-semibold text-gray-700">
                         الجمهور المستهدف
                       </Label>
                      <Select 
                        value={formData.targetAudience} 
                        onValueChange={(value) => setFormData(prev => ({...prev, targetAudience: value as any}))}
                      >
                                                 <SelectTrigger className="h-14 lg:h-16 border-gray-300 focus:border-teal-500 focus:ring-teal-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4">
                           <SelectValue />
                         </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">👥 الجميع</SelectItem>
                          <SelectItem value="new_users">🆕 مستخدمين جدد</SelectItem>
                          <SelectItem value="returning_users">🔄 مستخدمين عائدين</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                                       <div className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="isActive"
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData(prev => ({...prev, isActive: checked}))}
                          className={`${formData.isActive ? 'bg-green-600' : 'bg-gray-300'}`}
                        />
                                                 <Label htmlFor="isActive" className="text-sm lg:text-base font-semibold text-gray-700">حالة الإعلان</Label>
                      </div>
                      <Badge className={`${formData.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} text-xs lg:text-sm`}>
                        {formData.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </div>
                 </div>
               </div>

                             {/* Schedule Section */}
               <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-indigo-800">
                   <Calendar className="h-5 w-5" />
                   جدولة الإعلان
                 </h3>
                 
                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="startDate" className="text-sm lg:text-base font-semibold text-gray-700">
                         تاريخ البداية
                       </Label>
                                             <Input
                         id="startDate"
                         type="date"
                         value={formData.startDate}
                         onChange={(e) => setFormData(prev => ({...prev, startDate: e.target.value}))}
                         className="h-14 lg:h-16 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                       />
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                                             <Label htmlFor="endDate" className="text-sm lg:text-base font-semibold text-gray-700">
                         تاريخ النهاية
                       </Label>
                                             <Input
                         id="endDate"
                         type="date"
                         value={formData.endDate}
                         onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                         className="h-14 lg:h-16 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                       />
                    </div>
                  </div>
               </div>

                             {/* Popup Settings Section */}
               <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-100">
                 <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-purple-800">
                   <Zap className="h-5 w-5" />
                   إعدادات النافذة المنبثقة
                 </h3>
                
                                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="popupType" className="text-sm lg:text-base font-semibold text-gray-700">
                        نوع النافذة المنبثقة
                      </Label>
                      <Select 
                        value={formData.popupType} 
                        onValueChange={(value) => setFormData(prev => ({...prev, popupType: value as any}))}
                      >
                        <SelectTrigger className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="modal">🎯 نافذة مركزية</SelectItem>
                          <SelectItem value="toast">🔔 إشعار صغير</SelectItem>
                          <SelectItem value="banner">📢 شريط علوي</SelectItem>
                          <SelectItem value="side-panel">📋 لوحة جانبية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="displayDelay" className="text-sm lg:text-base font-semibold text-gray-700">
                        تأخير العرض (ثواني)
                      </Label>
                      <Input
                        id="displayDelay"
                        type="number"
                        value={formData.displayDelay}
                        onChange={(e) => setFormData(prev => ({...prev, displayDelay: parseInt(e.target.value)}))}
                        min="0"
                        max="60"
                        className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                      />
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="urgency" className="text-sm lg:text-base font-semibold text-gray-700">
                        مستوى الأهمية
                      </Label>
                      <Select 
                        value={formData.urgency} 
                        onValueChange={(value) => setFormData(prev => ({...prev, urgency: value as any}))}
                      >
                        <SelectTrigger className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 منخفض</SelectItem>
                          <SelectItem value="medium">🟡 عادي</SelectItem>
                          <SelectItem value="high">🟠 مهم</SelectItem>
                          <SelectItem value="critical">🔴 عاجل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="displayFrequency" className="text-sm lg:text-base font-semibold text-gray-700">
                        تكرار العرض
                      </Label>
                      <Select 
                        value={formData.displayFrequency} 
                        onValueChange={(value) => setFormData(prev => ({...prev, displayFrequency: value as any}))}
                      >
                        <SelectTrigger className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">1️⃣ مرة</SelectItem>
                          <SelectItem value="daily">📅 يومياً</SelectItem>
                          <SelectItem value="weekly">📆 أسبوعياً</SelectItem>
                          <SelectItem value="always">♾️ دائماً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="maxDisplays" className="text-sm lg:text-base font-semibold text-gray-700">
                        الحد الأقصى للعرض
                      </Label>
                      <Input
                        id="maxDisplays"
                        type="number"
                        value={formData.maxDisplays}
                        onChange={(e) => setFormData(prev => ({...prev, maxDisplays: parseInt(e.target.value)}))}
                        min="1"
                        max="100"
                        className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                      />
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="autoClose" className="text-sm lg:text-base font-semibold text-gray-700">
                        إغلاق تلقائي (ثواني)
                      </Label>
                      <Input
                        id="autoClose"
                        type="number"
                        value={formData.autoClose}
                        onChange={(e) => setFormData(prev => ({...prev, autoClose: parseInt(e.target.value)}))}
                        min="0"
                        max="300"
                        placeholder="0 = لا إغلاق تلقائي"
                        className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                      />
                    </div>
                  </div>

                                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="discount" className="text-sm lg:text-base font-semibold text-gray-700">
                        نص الخصم/العرض
                      </Label>
                      <Input
                        id="discount"
                        value={formData.discount}
                        onChange={(e) => setFormData(prev => ({...prev, discount: e.target.value}))}
                        placeholder="مثال: خصم 50% لفترة محدودة"
                        className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                      />
                    </div>
                    
                    <div className="space-y-2 lg:space-y-3">
                      <Label htmlFor="countdown" className="text-sm lg:text-base font-semibold text-gray-700">
                        العد التنازلي
                      </Label>
                      <Input
                        id="countdown"
                        value={formData.countdown}
                        onChange={(e) => setFormData(prev => ({...prev, countdown: e.target.value}))}
                        placeholder="مثال: 2h 30m 15s"
                        className="h-14 lg:h-16 border-gray-300 focus:border-purple-500 focus:ring-purple-500 bg-white text-base lg:text-lg px-4 lg:px-6 py-3 lg:py-4"
                      />
                    </div>
                  </div>

                                                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="showCloseButton"
                          checked={formData.showCloseButton}
                          onCheckedChange={(checked) => setFormData(prev => ({...prev, showCloseButton: checked}))}
                          className={`${formData.showCloseButton ? 'bg-blue-600' : 'bg-gray-300'}`}
                        />
                                                 <Label htmlFor="showCloseButton" className="text-sm lg:text-base font-semibold text-gray-700">
                           إظهار زر الإغلاق
                         </Label>
                      </div>
                      <Badge className={`${formData.showCloseButton ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-700 border-gray-200'} text-xs lg:text-sm`}>
                        {formData.showCloseButton ? 'مفعل' : 'معطل'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <Switch
                          id="showProgressBar"
                          checked={formData.showProgressBar}
                          onCheckedChange={(checked) => setFormData(prev => ({...prev, showProgressBar: checked}))}
                          className={`${formData.showProgressBar ? 'bg-purple-600' : 'bg-gray-300'}`}
                        />
                                                 <Label htmlFor="showProgressBar" className="text-sm lg:text-base font-semibold text-gray-700">
                           إظهار شريط التقدم
                         </Label>
                      </div>
                      <Badge className={`${formData.showProgressBar ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-700 border-gray-200'} text-xs lg:text-sm`}>
                        {formData.showProgressBar ? 'مفعل' : 'معطل'}
                      </Badge>
                    </div>
                  </div>
              </div>

                             {/* Form Actions */}
               <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border border-gray-200">
                                   <div className="flex flex-col sm:flex-row justify-end gap-3 lg:gap-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 px-4 lg:px-8 py-2 lg:py-3 h-10 lg:h-12 text-sm lg:text-base font-medium"
                    >
                      <X className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      إلغاء
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 px-4 lg:px-10 py-2 lg:py-3 h-10 lg:h-12 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-sm lg:text-base font-semibold"
                    >
                      <Save className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                      {editingAd ? 'تحديث الإعلان' : 'إضافة الإعلان'}
                    </Button>
                  </div>
               </div>
            </form>
          </DialogContent>
        </Dialog>

                 {/* Preview Dialog */}
         <Dialog open={!!previewAd} onOpenChange={() => setPreviewAd(null)}>
           <DialogContent className="max-w-3xl">
             <DialogHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-t-xl">
               <DialogTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                 <Eye className="h-6 w-6" />
                 معاينة الإعلان
               </DialogTitle>
             </DialogHeader>
            
                         {previewAd && (
               <div className="space-y-6 p-6">
                 <div className="text-center bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl">
                   <h3 className="text-2xl font-bold mb-3 text-gray-900">{previewAd.title}</h3>
                   <p className="text-gray-600 text-lg leading-relaxed">{previewAd.description}</p>
                 </div>

                                 {previewAd.mediaUrl && (
                   <div className="text-center">
                     {previewAd.type === 'image' ? (
                       <div className="relative overflow-hidden rounded-xl shadow-lg">
                         <img 
                           src={previewAd.mediaUrl} 
                           alt={previewAd.title}
                           className="w-full max-h-80 object-cover mx-auto"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                       </div>
                     ) : previewAd.type === 'video' ? (
                       <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                         <div className="text-center">
                           <Video className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                           <span className="text-gray-600 text-lg font-medium">معاينة الفيديو</span>
                         </div>
                       </div>
                     ) : null}
                   </div>
                 )}

                                                    {previewAd.ctaText && previewAd.ctaUrl && (
                     <div className="text-center">
                       <Button 
                         className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 px-10 py-4 h-14 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg font-semibold"
                         onClick={() => {
                           const url = previewAd.ctaUrl?.startsWith('http') ? previewAd.ctaUrl : `${window.location.origin}${previewAd.ctaUrl}`;
                           window.open(url, '_blank');
                         }}
                       >
                         {previewAd.ctaText}
                       </Button>
                     </div>
                   )}

                                 <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl">
                   <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">معلومات الإعلان</h4>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-white p-3 rounded-lg shadow-sm">
                       <strong className="text-blue-600">النوع:</strong> 
                       <span className="text-gray-700 mr-2">{previewAd.type === 'video' ? 'فيديو' : previewAd.type === 'image' ? 'صورة' : 'نص'}</span>
                     </div>
                     <div className="bg-white p-3 rounded-lg shadow-sm">
                       <strong className="text-green-600">الجمهور:</strong> 
                       <span className="text-gray-700 mr-2">{previewAd.targetAudience === 'new_users' ? 'مستخدمين جدد' : 
                        previewAd.targetAudience === 'returning_users' ? 'مستخدمين عائدين' : 'الجميع'}</span>
                     </div>
                     <div className="bg-white p-3 rounded-lg shadow-sm">
                       <strong className="text-orange-600">الأولوية:</strong> 
                       <span className="text-gray-700 mr-2">{previewAd.priority}</span>
                     </div>
                     <div className="bg-white p-3 rounded-lg shadow-sm">
                       <strong className="text-purple-600">الحالة:</strong> 
                       <span className={`mr-2 ${previewAd.isActive ? 'text-green-600' : 'text-red-600'}`}>
                         {previewAd.isActive ? 'نشط' : 'غير نشط'}
                       </span>
                     </div>
                     {previewAd.ctaUrl && (
                       <div className="bg-white p-3 rounded-lg shadow-sm col-span-2">
                         <strong className="text-indigo-600">وجهة الزر:</strong> 
                         <span className="text-gray-700 mr-2 break-all">
                           {previewAd.ctaUrl.startsWith('http') ? previewAd.ctaUrl : `${window.location.origin}${previewAd.ctaUrl}`}
                         </span>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

                 {/* Analytics Dialog */}
         <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
           <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
             <DialogHeader className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-t-xl">
               <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-purple-900">
                 <BarChart3 className="h-7 w-7" />
                 التحليلات المتقدمة للإعلانات المنبثقة
               </DialogTitle>
               <DialogDescription className="text-purple-700 text-lg mt-2">
                 إحصائيات مفصلة عن أداء الإعلانات المنبثقة مع مقاييس متقدمة
               </DialogDescription>
             </DialogHeader>
             <div className="p-6">
               <AdAnalytics />
             </div>
           </DialogContent>
         </Dialog>
      </div>
    </AccountTypeProtection>
  );
}

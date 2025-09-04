'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Users, Award, MapPin, Phone, Mail, Globe, Linkedin, Twitter, Instagram, Calendar, ArrowLeft, User, FileText, Trophy, Star, Briefcase, Shield, Languages, Heart, Building2, Target, Zap, Clock, Flag, BookOpen, GraduationCap, Activity, Dumbbell } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { supabase } from '@/lib/supabase/config';
import { toast } from 'sonner';

interface TrainerData {
  // المعلومات الشخصية
  full_name: string;
  profile_photo: string;
  coverImage: string;
  date_of_birth: string;
  nationality: string;
  current_location: string;
  description: string;
  
  // المعلومات المهنية
  is_certified: boolean;
  license_number: string;
  license_expiry: string;
  years_of_experience: number;
  coaching_level: string;
  specialization: string;
  spoken_languages: string[];
  
  // الخبرات السابقة
  previous_clubs: string[];
  achievements: string;
  references: string;
  
  // معلومات الاتصال
  phone: string;
  email: string;
  social_media: {
    linkedin: string;
    twitter: string;
    instagram: string;
  };
  
  // المستندات
  id_copy: string;
  license_copy: string;
  cv: string;
  
  // إحصائيات (للعرض)
  stats: {
    players_trained: number;
    training_sessions: number;
    success_rate: number;
    years_experience: number;
  };
}

const initialTrainerData: TrainerData = {
  // المعلومات الشخصية
  full_name: '',
  profile_photo: '/images/user-avatar.svg',
  coverImage: '/images/hero-1.jpg',
  date_of_birth: '',
  nationality: '',
  current_location: '',
  description: '',
  
  // المعلومات المهنية
  is_certified: false,
  license_number: '',
  license_expiry: '',
  years_of_experience: 0,
  coaching_level: '',
  specialization: '',
  spoken_languages: [],
  
  // الخبرات السابقة
  previous_clubs: [],
  achievements: '',
  references: '',
  
  // معلومات الاتصال
  phone: '',
  email: '',
  social_media: {
    linkedin: '',
    twitter: '',
    instagram: ''
  },
  
  // المستندات
  id_copy: '',
  license_copy: '',
  cv: '',
  
  // إحصائيات
  stats: {
    players_trained: 0,
    training_sessions: 0,
    success_rate: 0,
    years_experience: 0
  }
};

const getSupabaseImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // قائمة الـ buckets للبحث فيها بالترتيب
  const bucketsToCheck = ['trainer', 'avatars', 'wallet', 'clubavatar'];
  
  // تحديد bucket بناءً على اسم الملف أولاً
  let preferredBucket = 'trainer'; // افتراضي للمدربين
  
  if (path.includes('wallet') || path.startsWith('wallet')) {
    preferredBucket = 'wallet';
  } else if (path.includes('avatar') || path.startsWith('avatar')) {
    preferredBucket = 'avatars';
  } else if (path.includes('clubavatar') || path.startsWith('clubavatar')) {
    preferredBucket = 'clubavatar';
  } else if (path.includes('trainer') || path.startsWith('trainer')) {
    preferredBucket = 'trainer';
  }
  
  // وضع الـ bucket المفضل في المقدمة
  const orderedBuckets = [preferredBucket, ...bucketsToCheck.filter(b => b !== preferredBucket)];
  
  // جرب كل bucket حتى نجد الملف
  for (const bucketName of orderedBuckets) {
    try {
      const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(path);
      if (publicUrl) {
        return publicUrl;
      }
    } catch (error) {
      continue;
    }
  }
  
  // إذا لم نجد في أي bucket، استخدم الافتراضي
  const { data: { publicUrl } } = supabase.storage.from(preferredBucket).getPublicUrl(path);
  return publicUrl || '';
};

export default function TrainerProfilePage() {
  const { userData, user } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [trainerData, setTrainerData] = useState<TrainerData>(initialTrainerData);
  const [uploading, setUploading] = useState(false);
  const [pendingImages, setPendingImages] = useState<{
    profile?: string;
    cover?: string;
  }>({});

  const fetchTrainerData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const trainerRef = doc(db, 'trainers', user.uid);
      const trainerDoc = await getDoc(trainerRef);
      
      let data = {};
      
      if (trainerDoc.exists()) {
        data = trainerDoc.data();
      } else {
        const basicData = {
          ...initialTrainerData,
          full_name: userData?.name || 'مدرب رياضي',
          email: userData?.email || '',
          phone: userData?.phone || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountType: 'trainer',
          isVerified: false,
          isPremium: false
        };
        
        await setDoc(trainerRef, basicData);
        data = basicData;
      }
      
      const mergedData = {
        ...initialTrainerData,
        ...data,
        full_name: (data as any).full_name || (data as any).name || userData?.name || 'مدرب رياضي',
        phone: (data as any).phone || userData?.phone || '',
        email: (data as any).email || userData?.email || '',
        profile_photo: getSupabaseImageUrl((data as any).profile_photo || initialTrainerData.profile_photo),
        coverImage: getSupabaseImageUrl((data as any).coverImage || initialTrainerData.coverImage),
                  social_media: {
            linkedin: (data as any).social_media?.linkedin || (data as any).linkedin || '',
                      twitter: (data as any).social_media?.twitter || (data as any).twitter || '',
            instagram: (data as any).social_media?.instagram || (data as any).instagram || ''
        }
      };
      setTrainerData(mergedData);
    } catch (error) {
      console.error('Error fetching trainer data:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المدرب');
    } finally {
      setLoading(false);
    }
  }, [user, userData]);

  useEffect(() => {
    if (user && userData) {
      fetchTrainerData();
    }
  }, [user, userData, fetchTrainerData]);

  const handleSaveChanges = async () => {
    if (!user?.uid || !trainerData) {
      toast.error('لم يتم العثور على بيانات المستخدم');
      return;
    }
    setUploading(true);
    try {
      const trainerRef = doc(db, 'trainers', user.uid);
      
      // دمج الصور المعلقة مع البيانات الحالية
      const dataToSave = {
        ...trainerData,
        ...(pendingImages.profile && { profile_photo: pendingImages.profile }),
        ...(pendingImages.cover && { coverImage: pendingImages.cover })
      };
      
      const trainerDoc = await getDoc(trainerRef);
      
      if (trainerDoc.exists()) {
        await updateDoc(trainerRef, dataToSave);
      } else {
        await setDoc(trainerRef, {
          ...initialTrainerData,
          ...dataToSave,
          createdAt: new Date(),
          updatedAt: new Date(),
          accountType: 'trainer',
          isVerified: false,
          isPremium: false
        });
      }
      
      toast.success('🎉 تم حفظ بيانات المدرب بنجاح! 🏋️‍♂️');
      await fetchTrainerData();
      setEditMode(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (file: File, type: 'profile' | 'document' | 'cover') => {
    if (!user?.uid) {
      console.error('❌ No user ID found');
      toast.error('لم يتم العثور على معرف المستخدم');
      return;
    }
    
    console.log('🔄 بدء رفع الصورة:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      uploadType: type,
      userId: user.uid
    });
    
    try {
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
        console.error(`❌ نوع ملف غير مدعوم: ${file.type}`);
        toast.error('يرجى اختيار ملف صورة أو PDF صالح');
        return;
      }
      
      // التحقق من حجم الملف (5MB حد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
        toast.error(`🚫 حجم الصورة كبير جداً (${fileSizeMB} ميجابايت)\n\nالحد الأقصى المسموح: 5 ميجابايت\n\nالرجاء ضغط الصورة باستخدام أي أداة ضغط صور (مثل tinypng.com) ثم حاول رفعها مجدداً.`, {
          duration: 9000,
          style: {
            maxWidth: '400px',
            fontSize: '15px',
            lineHeight: '1.6',
            direction: 'rtl',
            textAlign: 'right'
          }
        });
        return;
      }
      
      setUploading(true);
      toast.info('🔄 جاري رفع الملف...');
      
      // إنشاء اسم ملف فريد
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `trainer-${type}-${user.uid}-${timestamp}.${fileExt}`;
      
      // قائمة الـ buckets للمحاولة بالترتيب
      const bucketsToTry = ['trainer', 'avatars', 'wallet', 'clubavatar'];
      let uploadSuccessful = false;
      let finalPublicUrl = '';
      let usedBucket = '';
      
      // محاولة الرفع في كل bucket حتى النجاح
      for (const bucketName of bucketsToTry) {
        try {
          console.log(`📤 محاولة رفع إلى bucket: ${bucketName}`);
          
          const uploadResult = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: true,
              contentType: file.type
            });
          
          if (!uploadResult.error) {
            console.log(`✅ نجح الرفع في ${bucketName} bucket:`, uploadResult.data);
            
            // إنشاء الرابط العام
            const { data: { publicUrl } } = supabase.storage
              .from(bucketName)
              .getPublicUrl(fileName);
              
            finalPublicUrl = publicUrl;
            usedBucket = bucketName;
            uploadSuccessful = true;
            break; // توقف عند أول نجاح
            
          } else {
            console.warn(`⚠️ فشل في ${bucketName}:`, uploadResult.error.message);
          }
          
        } catch (bucketError: any) {
          console.warn(`💥 خطأ في bucket ${bucketName}:`, bucketError.message);
        }
      }
      
      if (!uploadSuccessful) {
        console.error('❌ فشل الرفع في جميع الـ buckets');
        toast.error('فشل في رفع الملف - تحقق من إعدادات Supabase');
        return;
      }
      
      console.log('🔗 رابط الملف العام:', finalPublicUrl);
      console.log('📂 تم الرفع في bucket:', usedBucket);

      // حفظ في الحالة المعلقة مع معلومات الـ bucket
      setPendingImages(prev => ({
        ...prev,
        [type === 'profile' ? 'profile' : 'cover']: finalPublicUrl
      }));
      
      // رسالة نجاح مخصصة حسب الـ bucket المستخدم
      const successMessage = usedBucket === 'trainer' 
        ? `🎯 تم رفع ${type === 'profile' ? 'الصورة الشخصية' : 'صورة الغلاف'} بنجاح في Trainer bucket الأساسي!`
        : `✅ تم رفع ${type === 'profile' ? 'الصورة الشخصية' : 'صورة الغلاف'} بنجاح في ${usedBucket}!`;
        
      toast.success(successMessage);
      
    } catch (error: any) {
      console.error('💥 خطأ غير متوقع:', error);
      toast.error(`خطأ غير متوقع: ${error.message || 'حدث خطأ أثناء رفع الملف'}`);
    } finally {
      setUploading(false);
      console.log('🏁 انتهت عملية الرفع');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-200 rounded-full border-t-cyan-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل بيانات المدرب...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-0 p-6 mx-4 my-6 overflow-auto rounded-lg shadow-inner md:p-10 bg-gray-50" dir="rtl">
      <div className="max-w-4xl px-4 py-10 mx-auto">
        {/* زر العودة */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للوحة التحكم
        </button>

        {/* صورة الغلاف */}
        <div className="relative h-48 mb-8 overflow-hidden rounded-2xl">
          <img
            src={pendingImages.cover || trainerData?.coverImage || '/images/hero-1.jpg'}
            alt="صورة الغلاف"
            className="object-cover w-full h-full"
          />
          {pendingImages.cover && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm">
              📝 معاينة - لم يتم الحفظ بعد
            </div>
          )}
          {editMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <label className="p-2 transition rounded-lg cursor-pointer bg-white/90 hover:bg-white">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                />
                {uploading ? '🔄 جاري الرفع...' : 'تغيير صورة الغلاف'}
              </label>
            </div>
          )}
        </div>

        {/* كرت بيانات المدرب */}
        <div className="flex flex-col items-center gap-8 p-8 mb-8 bg-white shadow-lg rounded-2xl md:flex-row">
          <div className="relative">
            <img
              src={pendingImages.profile || trainerData?.profile_photo || '/images/user-avatar.svg'}
              alt="صورة المدرب"
              className="object-cover w-32 h-32 border-4 border-cyan-500 rounded-full shadow"
            />
            {pendingImages.profile && (
              <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                📝 معاينة
              </div>
            )}
            {editMode && (
              <label className="absolute inset-0 flex items-center justify-center transition rounded-full cursor-pointer bg-black/50 hover:bg-black/60">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                />
                {uploading ? '🔄 جاري الرفع...' : 'تغيير الصورة'}
              </label>
            )}
          </div>
          <div className="flex-1 text-right">
            <h2 className="mb-2 text-3xl font-bold text-cyan-600">{trainerData?.full_name || 'المدرب الرياضي'}</h2>
            <p className="mb-2 text-gray-600">
              {trainerData?.is_certified ? '🏆 مدرب معتمد' : '📋 مدرب رياضي'}
              {trainerData?.coaching_level && ` - مستوى ${trainerData.coaching_level}`}
            </p>
            <p className="mb-2 text-gray-500">
              {trainerData?.description || 'متخصص في تدريب اللاعبين وتطوير قدراتهم الرياضية'}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-base text-gray-500">
              <span className="flex items-center gap-1"><Flag size={18} /> {trainerData?.nationality || 'غير محدد'}</span>
              <span className="flex items-center gap-1"><MapPin size={18} /> {trainerData?.current_location || 'غير محدد'}</span>
              <span className="flex items-center gap-1"><Clock size={18} /> {trainerData?.years_of_experience || 0} سنة خبرة</span>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2 text-white transition rounded-lg shadow bg-gradient-to-l from-cyan-400 to-cyan-600 hover:scale-105"
            onClick={() => editMode ? handleSaveChanges() : setEditMode(true)}
          >
            <Edit size={18} /> {editMode ? 'حفظ التغييرات' : 'تعديل البيانات'}
          </button>
        </div>

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-2 gap-6 mb-8 md:grid-cols-4">
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-xl">
            <Users size={28} />
            <div className="mt-2 text-2xl font-bold">{trainerData?.stats?.players_trained ?? 25}</div>
            <div className="mt-1 text-sm">اللاعبون المدربون</div>
          </div>
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-green-400 to-green-600 rounded-xl">
            <Activity size={28} />
            <div className="mt-2 text-2xl font-bold">{trainerData?.stats?.training_sessions ?? 150}</div>
            <div className="mt-1 text-sm">الجلسات التدريبية</div>
          </div>
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl">
            <Target size={28} />
            <div className="mt-2 text-2xl font-bold">{trainerData?.stats?.success_rate ?? 85}%</div>
            <div className="mt-1 text-sm">معدل النجاح</div>
          </div>
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl">
            <Trophy size={28} />
            <div className="mt-2 text-2xl font-bold">{trainerData?.stats?.years_experience ?? trainerData?.years_of_experience ?? 5}</div>
            <div className="mt-1 text-sm">سنوات الخبرة</div>
          </div>
        </div>

        {/* المعلومات المهنية */}
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-cyan-600">
              <Shield size={20} /> المعلومات المهنية
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">حالة الاعتماد</span>
                <span className={`font-bold ${trainerData?.is_certified ? 'text-green-600' : 'text-orange-600'}`}>
                  {trainerData?.is_certified ? 'مدرب معتمد ✓' : 'غير معتمد 📋'}
                </span>
              </div>
              {trainerData?.is_certified && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">رقم الرخصة</span>
                    <span className="font-bold">{trainerData?.license_number || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">انتهاء الرخصة</span>
                    <span className="font-bold">{trainerData?.license_expiry || 'غير محدد'}</span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">مستوى التدريب</span>
                <span className="font-bold">{trainerData?.coaching_level || 'غير محدد'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">التخصص</span>
                <span className="font-bold">{trainerData?.specialization || 'عام'}</span>
              </div>
              {trainerData?.spoken_languages && trainerData.spoken_languages.length > 0 && (
                <div>
                  <span className="text-gray-600 block mb-2">اللغات:</span>
                  <div className="flex flex-wrap gap-2">
                    {trainerData.spoken_languages.map((language, index) => (
                      <span key={index} className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* الخبرات السابقة */}
          <div className="p-6 bg-white shadow rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-cyan-600">
              <Briefcase size={20} /> الخبرات السابقة
            </h3>
            <div className="space-y-4">
              {trainerData?.previous_clubs && trainerData.previous_clubs.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">الأندية السابقة:</h4>
                  <div className="space-y-2">
                    {trainerData.previous_clubs.slice(0, 5).map((club, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        <span className="font-medium">{club}</span>
                      </div>
                    ))}
                    {trainerData.previous_clubs.length > 5 && (
                      <p className="text-sm text-gray-500">+ {trainerData.previous_clubs.length - 5} أندية أخرى</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Building2 size={48} className="mx-auto mb-2 opacity-50" />
                  <p>لا توجد خبرات مسجلة حالياً</p>
                  <p className="text-sm">أضف الخبرات في وضع التعديل</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* الإنجازات والمراجع */}
        {(trainerData?.achievements || trainerData?.references) && (
          <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
            {trainerData?.achievements && trainerData.achievements.trim() && (
              <div className="p-6 bg-white shadow rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-cyan-600">
                  <Star size={20} /> الإنجازات والجوائز
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{trainerData.achievements}</p>
                </div>
              </div>
            )}

            {trainerData?.references && trainerData.references.trim() && (
              <div className="p-6 bg-white shadow rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-cyan-600">
                  <Users size={20} /> المراجع
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{trainerData.references}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* معلومات التواصل */}
        <div className="p-6 bg-white shadow rounded-xl">
          <h3 className="mb-4 text-lg font-bold text-cyan-600">معلومات التواصل</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700">
                <Phone size={18} /> {trainerData?.phone || 'غير محدد'}
              </p>
              <p className="flex items-center gap-2 text-gray-700">
                <Mail size={18} /> {trainerData?.email || 'غير محدد'}
              </p>
            </div>
            <div className="space-y-3">
              {trainerData?.social_media?.linkedin && (
                <a href={trainerData.social_media.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <Linkedin size={18} /> LinkedIn
                </a>
              )}
              {trainerData?.social_media?.twitter && (
                <a href={trainerData.social_media.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                  <Twitter size={18} /> Twitter
                </a>
              )}
              {trainerData?.social_media?.instagram && (
                <a href={trainerData.social_media.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-pink-600">
                  <Instagram size={18} /> Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* نافذة التعديل */}
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative bg-white rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditMode(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
              >
                ×
              </button>
              <h2 className="mb-6 text-xl font-bold text-cyan-600">تعديل بيانات المدرب</h2>
              
              <div className="space-y-6">
                
                {/* قسم رفع الصورة */}
                <div className="p-6 bg-cyan-50 rounded-lg">
                  <h4 className="mb-4 font-bold text-cyan-800">الصور</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الشخصية</label>
                      <div className="flex items-center gap-3">
                        <img
                          src={pendingImages.profile || trainerData?.profile_photo || '/images/user-avatar.svg'}
                          alt="صورة المدرب"
                          className="w-12 h-12 object-cover rounded-full"
                        />
                        {pendingImages.profile && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                            !
                          </div>
                        )}
                        <label className="flex-1 cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                          />
                          <div className="p-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50">
                            {uploading ? 'جاري الرفع...' : 'تغيير الصورة الشخصية'}
                          </div>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">صورة الغلاف</label>
                      {pendingImages.cover && (
                        <div className="relative mb-2">
                          <img
                            src={pendingImages.cover}
                            alt="معاينة صورة الغلاف"
                            className="w-full h-20 object-cover rounded border"
                          />
                          <div className="absolute top-1 right-1 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                            معاينة
                          </div>
                        </div>
                      )}
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                        />
                        <div className="p-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50">
                          {uploading ? 'جاري الرفع...' : 'تغيير صورة الغلاف'}
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* المعلومات الشخصية */}
                <div className="p-6 bg-blue-50 rounded-lg">
                  <h4 className="mb-4 font-bold text-blue-800">المعلومات الشخصية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="الاسم الثلاثي كاملاً"
                        value={trainerData?.full_name}
                        onChange={(e) => setTrainerData({...trainerData, full_name: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الميلاد *</label>
                      <input
                        type="date"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        value={trainerData?.date_of_birth}
                        onChange={(e) => setTrainerData({...trainerData, date_of_birth: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الجنسية *</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        value={trainerData?.nationality}
                        onChange={(e) => setTrainerData({...trainerData, nationality: e.target.value})}
                      >
                        <option value="">اختر الجنسية</option>
                        <option value="السعودية">السعودية</option>
                        <option value="الإمارات">الإمارات</option>
                        <option value="قطر">قطر</option>
                        <option value="الكويت">الكويت</option>
                        <option value="البحرين">البحرين</option>
                        <option value="عمان">عمان</option>
                        <option value="الأردن">الأردن</option>
                        <option value="مصر">مصر</option>
                        <option value="المغرب">المغرب</option>
                        <option value="تونس">تونس</option>
                        <option value="الجزائر">الجزائر</option>
                        <option value="العراق">العراق</option>
                        <option value="سوريا">سوريا</option>
                        <option value="لبنان">لبنان</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الموقع الحالي *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="الدولة - المدينة"
                        value={trainerData?.current_location}
                        onChange={(e) => setTrainerData({...trainerData, current_location: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">النبذة الشخصية</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                        placeholder="اكتب نبذة مختصرة عن خبراتك وتخصصك..."
                        value={trainerData?.description}
                        onChange={(e) => setTrainerData({...trainerData, description: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* المعلومات المهنية */}
                <div className="p-6 bg-green-50 rounded-lg">
                  <h4 className="mb-4 font-bold text-green-800">المعلومات المهنية</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">هل لديك رخصة تدريب معتمدة؟ *</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        value={trainerData?.is_certified ? 'true' : 'false'}
                        onChange={(e) => setTrainerData({...trainerData, is_certified: e.target.value === 'true'})}
                      >
                        <option value="false">لا</option>
                        <option value="true">نعم</option>
                      </select>
                    </div>
                    {trainerData?.is_certified && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الرخصة</label>
                          <input
                            type="text"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            placeholder="رقم رخصة التدريب"
                            value={trainerData?.license_number}
                            onChange={(e) => setTrainerData({...trainerData, license_number: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ انتهاء الرخصة</label>
                          <input
                            type="date"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                            value={trainerData?.license_expiry}
                            onChange={(e) => setTrainerData({...trainerData, license_expiry: e.target.value})}
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">سنوات الخبرة *</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="عدد سنوات الخبرة"
                        value={trainerData?.years_of_experience}
                        onChange={(e) => setTrainerData({...trainerData, years_of_experience: parseInt(e.target.value) || 0})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">مستوى التدريب *</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        value={trainerData?.coaching_level}
                        onChange={(e) => setTrainerData({...trainerData, coaching_level: e.target.value})}
                      >
                        <option value="">اختر المستوى</option>
                        <option value="المستوى C">المستوى C</option>
                        <option value="المستوى B">المستوى B</option>
                        <option value="المستوى A">المستوى A</option>
                        <option value="مستوى PRO">مستوى PRO</option>
                        <option value="UEFA A">UEFA A</option>
                        <option value="UEFA B">UEFA B</option>
                        <option value="مستوى الأكاديمية">مستوى الأكاديمية</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">التخصص *</label>
                      <select
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        value={trainerData?.specialization}
                        onChange={(e) => setTrainerData({...trainerData, specialization: e.target.value})}
                      >
                        <option value="">اختر التخصص</option>
                        <option value="لياقة بدنية">لياقة بدنية</option>
                        <option value="حراس مرمى">حراس مرمى</option>
                        <option value="خط دفاع">خط دفاع</option>
                        <option value="خط وسط">خط وسط</option>
                        <option value="خط هجوم">خط هجوم</option>
                        <option value="تدريب شامل">تدريب شامل</option>
                        <option value="تأهيل الإصابات">تأهيل الإصابات</option>
                        <option value="الناشئين">الناشئين</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">اللغات المتحدثة *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="العربية, الإنجليزية, الفرنسية (افصل بفاصلة)"
                        value={trainerData?.spoken_languages?.join(', ')}
                        onChange={(e) => setTrainerData({...trainerData, spoken_languages: e.target.value.split(',').map(lang => lang.trim()).filter(lang => lang)})}
                      />
                    </div>
                  </div>
                </div>

                {/* الخبرات السابقة */}
                <div className="p-6 bg-yellow-50 rounded-lg">
                  <h4 className="mb-4 font-bold text-yellow-800">الخبرات السابقة</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الأندية السابقة</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="النادي الأهلي (2020-2022), نادي الهلال (2018-2020) (افصل بفاصلة)"
                        value={trainerData?.previous_clubs?.join(', ')}
                        onChange={(e) => setTrainerData({...trainerData, previous_clubs: e.target.value.split(',').map(club => club.trim()).filter(club => club)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الإنجازات والجوائز</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={4}
                        placeholder="اذكر أهم إنجازاتك وجوائزك في مجال التدريب..."
                        value={trainerData?.achievements}
                        onChange={(e) => setTrainerData({...trainerData, achievements: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المراجع</label>
                      <textarea
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        rows={3}
                        placeholder="أذكر أسماء وأرقام الأشخاص الذين يمكن الرجوع إليهم للتوصية..."
                        value={trainerData?.references}
                        onChange={(e) => setTrainerData({...trainerData, references: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* معلومات الاتصال */}
                <div className="p-6 bg-purple-50 rounded-lg">
                  <h4 className="mb-4 font-bold text-purple-800">معلومات الاتصال</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                      <input
                        type="tel"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="+966501234567"
                        value={trainerData?.phone}
                        onChange={(e) => setTrainerData({...trainerData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
                      <input
                        type="email"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="trainer@example.com"
                        value={trainerData?.email}
                        onChange={(e) => setTrainerData({...trainerData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                      <input
                        type="url"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="https://linkedin.com/in/trainer"
                        value={trainerData?.social_media?.linkedin}
                        onChange={(e) => setTrainerData({...trainerData, social_media: {...trainerData.social_media, linkedin: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
                      <input
                        type="url"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="https://twitter.com/trainer"
                        value={trainerData?.social_media?.twitter}
                        onChange={(e) => setTrainerData({...trainerData, social_media: {...trainerData.social_media, twitter: e.target.value}})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="url"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                        placeholder="https://instagram.com/trainer"
                        value={trainerData?.social_media?.instagram}
                        onChange={(e) => setTrainerData({...trainerData, social_media: {...trainerData.social_media, instagram: e.target.value}})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setPendingImages({});
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={uploading}
                  className="px-4 py-2 text-white rounded-lg bg-gradient-to-l from-cyan-400 to-cyan-600 hover:opacity-90 disabled:opacity-50"
                >
                  {uploading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 

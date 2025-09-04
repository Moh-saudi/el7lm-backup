'use client';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Edit, Users, FileText, Trophy, User, MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Calendar, ArrowLeft, School, Award, Building2, UserCircle2, Plus, Sun, Moon, LogOut } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/config';
import { db } from '@/lib/firebase/config';
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage';

interface ClubData {
  name: string;
  logo: string;
  coverImage: string;
  gallery: string[];
  phone: string;
  email: string;
  city: string;
  country: string;
  founded: string;
  type: string;
  description: string;
  manager: string;
  address: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  stats: {
    players: number;
    contracts: number;
    trophies: number;
    staff: number;
  };
  academies: {
    total: number;
    locations: string[];
  };
  schools: {
    men: number;
    women: number;
    locations: string[];
  };
  trophies: {
    name: string;
    year: string;
    category: string;
  }[];
  board: {
    chairman: {
      name: string;
      phone: string;
      email: string;
      image: string;
    };
    youthDirector: {
      name: string;
      phone: string;
      email: string;
      image: string;
    };
  };
}

const initialClubData: ClubData = {
  name: '',
  logo: '/images/club-avatar.png',
  coverImage: '/images/hero-1.jpg',
  gallery: [],
  phone: '',
  email: '',
  city: '',
  country: '',
  founded: '',
  type: '',
  description: '',
  manager: '',
  address: '',
  website: '',
  facebook: '',
  twitter: '',
  instagram: '',
  stats: {
    players: 0,
    contracts: 0,
    trophies: 0,
    staff: 0
  },
  academies: {
    total: 0,
    locations: []
  },
  schools: {
    men: 0,
    women: 0,
    locations: []
  },
  trophies: [],
  board: {
    chairman: {
      name: '',
      phone: '',
      email: '',
      image: '/images/club-avatar.png'
    },
    youthDirector: {
      name: '',
      phone: '',
      email: '',
      image: '/images/club-avatar.png'
    }
  }
};

const LOGO_WIDTH = 300, LOGO_HEIGHT = 300;
const COVER_WIDTH = 1200, COVER_HEIGHT = 400;

function validateImage(file: File, type: 'logo' | 'cover'): Promise<string | null> {
  return new Promise((resolve) => {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      resolve('الرجاء اختيار صورة بصيغة PNG أو JPG فقط.');
      return;
    }
    const img = new window.Image();
    img.onload = function () {
      if (type === 'logo' && (img.width !== LOGO_WIDTH || img.height !== LOGO_HEIGHT)) {
        resolve(`مقاس اللوجو يجب أن يكون ${LOGO_WIDTH}×${LOGO_HEIGHT} بكسل.`);
      } else if (type === 'cover' && (img.width !== COVER_WIDTH || img.height !== COVER_HEIGHT)) {
        resolve(`مقاس الغلاف يجب أن يكون ${COVER_WIDTH}×${COVER_HEIGHT} بكسل.`);
      } else {
        resolve(null);
      }
    };
    img.onerror = function () {
      resolve('تعذر قراءة الصورة.');
    };
    img.src = URL.createObjectURL(file);
  });
}

const getSupabaseImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const { data: { publicUrl } } = supabase.storage.from('clubavatar').getPublicUrl(path);
  return publicUrl || '';
};

const requiredFields = [
  { key: 'name', label: 'اسم النادي' },
  { key: 'city', label: 'المدينة' },
  { key: 'country', label: 'الدولة' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'logo', label: 'شعار النادي' },
  { key: 'coverImage', label: 'صورة الغلاف' }
];

export default function ClubProfilePage() {
  const { userData, user, signOut: authSignOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState<ClubData>(initialClubData);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [isViewingOtherClub, setIsViewingOtherClub] = useState(false);

  const fetchClubData = useCallback(async () => {
    // قراءة معرف النادي من URL parameters
    const clubId = searchParams?.get('id');
    const targetClubId = clubId || user?.uid;
    
    if (!targetClubId) {
      console.error('❌ لا يوجد معرف نادي متاح');
      return;
    }

    // تحديد ما إذا كنا نعرض نادي آخر أم نادي المستخدم الحالي
    const isOtherClub = clubId && clubId !== user?.uid;
    setIsViewingOtherClub(isOtherClub);

    console.log(`🔍 جلب بيانات النادي: ${targetClubId} (${isOtherClub ? 'نادي آخر' : 'نادي المستخدم'})`);

    try {
      const clubRef = doc(db, 'clubs', targetClubId);
      const clubDoc = await getDoc(clubRef);
      
      let data = {};
      
      if (clubDoc.exists()) {
        data = clubDoc.data() as any;
        console.log(`✅ تم العثور على بيانات النادي: ${(data as any).name || 'غير محدد'}`);
      } else {
        if (isOtherClub) {
          // إذا كنا نعرض نادي آخر ولا يوجد، نعرض رسالة خطأ
          console.error(`❌ النادي غير موجود: ${targetClubId}`);
          toast.error('النادي المطلوب غير موجود');
          router.back();
          return;
        } else {
          // إنشاء مستند أساسي إذا لم يكن موجوداً (فقط لنادي المستخدم الحالي)
          const basicData = {
            ...initialClubData,
            name: userData?.name || 'نادي جديد',
            email: userData?.email || '',
            phone: userData?.phone || '',
            createdAt: new Date(),
            updatedAt: new Date(),
            accountType: 'club',
            isVerified: false,
            isPremium: false
          };
          
          await setDoc(clubRef, basicData);
          data = basicData;
          console.log('✅ تم إنشاء بيانات نادي جديدة');
        }
      }
      
      const mergedData = {
        ...initialClubData,
        ...(data as any),
        name: ((data as any).name && (data as any).name.trim()) ? (data as any).name : (isOtherClub ? 'نادي غير محدد' : (userData?.name || 'نادي جديد')),
        phone: ((data as any).phone && (data as any).phone.trim()) ? (data as any).phone : (isOtherClub ? '' : (userData?.phone || '')),
        email: ((data as any).email && (data as any).email.trim()) ? (data as any).email : (isOtherClub ? '' : (userData?.email || '')),
        coverImage: getSupabaseImageUrl((data as any).coverImage || initialClubData.coverImage),
        logo: getSupabaseImageUrl((data as any).logo || initialClubData.logo),
        board: {
          chairman: {
            ...initialClubData.board.chairman,
            ...((data as any).board?.chairman || {}),
            image: getSupabaseImageUrl((data as any).board?.chairman?.image || initialClubData.board.chairman.image)
          },
          youthDirector: {
            ...initialClubData.board.youthDirector,
            ...((data as any).board?.youthDirector || {}),
            image: getSupabaseImageUrl((data as any).board?.youthDirector?.image || initialClubData.board.youthDirector.image)
          }
        }
      };
      setClubData(mergedData);
    } catch (error) {
      console.error('Error fetching club data:', error);
      toast.error('حدث خطأ أثناء جلب بيانات النادي');
    } finally {
      setLoading(false);
    }
  }, [user, userData, searchParams]);

  useEffect(() => {
    if (user && userData) {
      fetchClubData();
    }
  }, [user, userData, fetchClubData]);

  useEffect(() => {
    // تحقق من إعدادات النظام عند تحميل الصفحة
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Log coverImage after fetching data
  useEffect(() => {
    console.log('coverImage from DB:', clubData.coverImage);
  }, [clubData.coverImage]);

  const handleInputChange = (field: string, value: unknown, parentField?: string, subField?: string) => {
    setClubData(prev => {
      if (!prev) return prev;
      
      if (parentField && subField) {
        const parent = prev[parentField as keyof ClubData] as Record<string, unknown>;
        return {
          ...prev,
          [parentField]: {
            ...parent,
            [subField]: value
          }
        };
      } else if (parentField) {
        return {
          ...prev,
          [parentField]: value
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover' | 'gallery' | 'chairman' | 'youthDirector') => {
    if (isViewingOtherClub) {
      toast.error('لا يمكن تعديل بيانات نادي آخر');
      return;
    }
    
    if (!user?.uid) return;
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح');
        return;
      }
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
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${user.uid}/${type}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('clubavatar')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        toast.error('حدث خطأ أثناء رفع الصورة');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('clubavatar')
        .getPublicUrl(filePath);

      let updatedData = { ...clubData };
      
      if (type === 'gallery') {
        updatedData.gallery = [...(clubData.gallery || []), publicUrl];
      } else if (type === 'chairman') {
        updatedData.board.chairman.image = publicUrl;
      } else if (type === 'youthDirector') {
        updatedData.board.youthDirector.image = publicUrl;
      } else if (type === 'cover') {
        updatedData.coverImage = publicUrl;
      } else if (type === 'logo') {
        updatedData.logo = publicUrl;
      }
      
      setClubData(updatedData);
              toast.success('✅ تم رفع الصورة بنجاح');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (isViewingOtherClub) {
      toast.error('لا يمكن تعديل بيانات نادي آخر');
      return;
    }
    
    if (!user?.uid || !clubData) {
      toast.error('لم يتم العثور على بيانات المستخدم');
      return;
    }
    setUploading(true);
    try {
      // تحضير البيانات للتنظيف
      const rawData = {
        name: clubData.name || '',
        logo: clubData.logo || initialClubData.logo,
        coverImage: clubData.coverImage || initialClubData.coverImage,
        gallery: Array.isArray(clubData.gallery) ? clubData.gallery.filter(Boolean) : [],
        phone: clubData.phone || '',
        email: clubData.email || '',
        city: clubData.city || '',
        country: clubData.country || '',
        founded: clubData.founded || '',
        type: clubData.type || '',
        description: clubData.description || '',
        manager: clubData.manager || '',
        address: clubData.address || '',
        website: clubData.website || '',
        facebook: clubData.facebook || '',
        twitter: clubData.twitter || '',
        instagram: clubData.instagram || '',
        stats: {
          players: Number(clubData.stats?.players) || 0,
          contracts: Number(clubData.stats?.contracts) || 0,
          trophies: Number(clubData.stats?.trophies) || 0,
          staff: Number(clubData.stats?.staff) || 0
        },
        academies: {
          total: Number(clubData.academies?.total) || 0,
          locations: Array.isArray(clubData.academies?.locations) ? clubData.academies.locations.filter(Boolean) : []
        },
        schools: {
          men: Number(clubData.schools?.men) || 0,
          women: Number(clubData.schools?.women) || 0,
          locations: Array.isArray(clubData.schools?.locations) ? clubData.schools.locations.filter(Boolean) : []
        },
        trophies: Array.isArray(clubData.trophies) ? clubData.trophies.filter(Boolean) : [],
        board: {
          chairman: {
            name: clubData.board?.chairman?.name || '',
            phone: clubData.board?.chairman?.phone || '',
            email: clubData.board?.chairman?.email || '',
            image: clubData.board?.chairman?.image || initialClubData.board.chairman.image
          },
          youthDirector: {
            name: clubData.board?.youthDirector?.name || '',
            phone: clubData.board?.youthDirector?.phone || '',
            email: clubData.board?.youthDirector?.email || '',
            image: clubData.board?.youthDirector?.image || initialClubData.board.youthDirector.image
          }
        },
        updatedAt: new Date(),
        accountType: 'club',
        isVerified: false,
        isPremium: false
      };

      // استخدام دالة تنظيف البيانات العالمية من firestore-fix.js
      const dataToSave = (window as any).cleanFirestoreData ? 
        (window as any).cleanFirestoreData(rawData) : 
        rawData;

      console.log('Raw data:', rawData);
      console.log('Cleaned data to save:', dataToSave);

      const clubRef = doc(db, 'clubs', user.uid);
      
      // التحقق من وجود المستند أولاً
      const clubDoc = await getDoc(clubRef);
      
      if (clubDoc.exists()) {
        // المستند موجود - نحدثه
        await updateDoc(clubRef, dataToSave);
      } else {
        // المستند غير موجود - ننشئه
        await setDoc(clubRef, {
          ...dataToSave,
          createdAt: new Date(),
          accountType: 'club',
          isVerified: false,
          isPremium: false
        });
      }
      
      toast.success('🎉 تم حفظ بيانات النادي بنجاح! أنت رائع، استمر في تطوير ناديك! 🏆');
      await fetchClubData(); // إعادة جلب البيانات بعد الحفظ
      setEditMode(false);
      setMissingFields([]);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full border-4 border-blue-200 animate-spin border-t-blue-600"></div>
          <p className="text-gray-600">جاري تحميل بيانات النادي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header بسيط */}
      <div className="sticky top-0 z-50 border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
        <div className="px-4 py-4 mx-auto max-w-7xl">
          <div className="flex justify-between items-center">
            {/* زر العودة */}
            <button
              onClick={() => router.back()}
              className="flex gap-2 items-center px-4 py-2 text-gray-600 rounded-lg transition-all hover:text-gray-800 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">العودة للبحث</span>
            </button>

            {/* عنوان الصفحة */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">ملف النادي الشخصي</h1>
              {clubData && (
                <p className="text-sm text-gray-600">{clubData.name}</p>
              )}
            </div>

            {/* مساحة فارغة للتوازن */}
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <main className="overflow-auto flex-1 p-6 mx-4 my-6 min-h-0 bg-gray-50 rounded-lg shadow-inner md:p-10 dark:bg-gray-900">
          <div className="px-4 py-10 mx-auto max-w-4xl">
            {/* صورة الغلاف */}
            <div className="overflow-hidden relative mb-8 h-48 rounded-2xl">
              <img
                src={clubData?.coverImage || '/images/hero-1.jpg'}
                alt="صورة الغلاف"
                className="object-cover w-full h-full"
              />
              {editMode && !isViewingOtherClub && (
                <div className="flex absolute inset-0 justify-center items-center bg-black/50">
                  <label className="p-2 rounded-lg transition cursor-pointer bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                      aria-label="تغيير صورة الغلاف"
                      title="تغيير صورة الغلاف"
                    />
                    {uploading ? 'جاري الرفع...' : 'تغيير صورة الغلاف'}
                  </label>
                </div>
              )}
            </div>

            {/* رسالة عرض نادي آخر */}
            {isViewingOtherClub && (
              <div className="p-4 mb-6 text-blue-800 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300">
                <div className="flex gap-2 items-center">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">عرض نادي آخر - وضع القراءة فقط</span>
                </div>
                <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                  أنت تعرض بيانات نادي آخر. لا يمكنك تعديل هذه البيانات.
                </p>
              </div>
            )}

            {/* كرت بيانات النادي */}
            <div className="flex flex-col gap-8 items-center p-8 mb-8 bg-white rounded-2xl shadow-lg dark:bg-gray-800 md:flex-row">
              <div className="relative">
                <img
                  src={clubData?.logo || '/images/club-avatar.png'}
                  alt="شعار النادي"
                  className="object-cover w-32 h-32 rounded-full border-4 shadow border-primary dark:border-primary/80"
                />
                {editMode && !isViewingOtherClub && (
                  <label className="flex absolute inset-0 justify-center items-center rounded-full transition cursor-pointer bg-black/50 hover:bg-black/60">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                      aria-label="تغيير شعار النادي"
                      title="تغيير شعار النادي"
                    />
                    <Edit className="text-white" size={24} />
                  </label>
                )}
              </div>
              <div className="flex-1 text-right">
                <h2 className="mb-2 text-3xl font-bold text-primary dark:text-primary/90">{clubData?.name}</h2>
                <p className="mb-2 text-gray-600 dark:text-gray-300">{clubData?.description}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-base text-gray-500 dark:text-gray-400">
                  <span className="flex gap-1 items-center"><MapPin size={18} /> {clubData?.city}, {clubData?.country}</span>
                  <span className="flex gap-1 items-center"><Calendar size={18} /> تأسس {clubData?.founded}</span>
                  <span className="flex gap-1 items-center"><User size={18} /> نوع النادي: {clubData?.type}</span>
                </div>
              </div>
              {!isViewingOtherClub && (
                <button
                  className="flex gap-2 items-center px-5 py-2 text-white bg-gradient-to-l from-blue-400 to-blue-600 rounded-lg shadow transition hover:scale-105 dark:from-blue-500 dark:to-blue-700"
                  onClick={() => editMode ? handleSaveChanges() : setEditMode(true)}
                  disabled={uploading}
                >
                  <Edit size={18} /> {editMode ? 'حفظ التغييرات' : 'تعديل البيانات'}
                </button>
              )}
            </div>

            {/* كروت الإحصائيات */}
            <div className="grid grid-cols-2 gap-6 mb-8 md:grid-cols-4">
              <div className="flex flex-col items-center p-5 text-white bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow dark:from-blue-500 dark:to-blue-700">
                <Users size={28} />
                <div className="mt-2 text-2xl font-bold">{clubData?.stats?.players ?? 0}</div>
                <div className="mt-1 text-sm">اللاعبون</div>
              </div>
              <div className="flex flex-col items-center p-5 text-white bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow dark:from-green-500 dark:to-green-700">
                <FileText size={28} />
                <div className="mt-2 text-2xl font-bold">{clubData?.stats?.contracts ?? 0}</div>
                <div className="mt-1 text-sm">العقود النشطة</div>
              </div>
              <div className="flex flex-col items-center p-5 text-white bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow dark:from-yellow-500 dark:to-yellow-700">
                <Trophy size={28} />
                <div className="mt-2 text-2xl font-bold">{clubData?.stats?.trophies ?? 0}</div>
                <div className="mt-1 text-sm">البطولات</div>
              </div>
              <div className="flex flex-col items-center p-5 text-white bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow dark:from-purple-500 dark:to-purple-700">
                <User size={28} />
                <div className="mt-2 text-2xl font-bold">{clubData?.stats?.staff ?? 0}</div>
                <div className="mt-1 text-sm">المدربون/الإداريون</div>
              </div>
            </div>

            {/* معلومات الأكاديميات والمدارس */}
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
              <div className="p-6 bg-white rounded-xl shadow dark:bg-gray-800">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-primary dark:text-primary/90">
                  <School size={20} /> الأكاديميات والمدارس
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">عدد الأكاديميات</span>
                    <span className="font-bold dark:text-white">{clubData?.academies?.total ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">مدارس كرة القدم للرجال</span>
                    <span className="font-bold dark:text-white">{clubData?.schools?.men ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-300">مدارس كرة القدم للسيدات</span>
                    <span className="font-bold dark:text-white">{clubData?.schools?.women ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* البطولات */}
              <div className="p-6 bg-white rounded-xl shadow dark:bg-gray-800">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-primary dark:text-primary/90">
                  <Award size={20} /> البطولات
                </h3>
                <div className="space-y-3">
                  {clubData?.trophies?.map((trophy, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg dark:bg-gray-700">
                      <span className="font-medium dark:text-white">{trophy.name}</span>
                      <span className="text-gray-600 dark:text-gray-300">{trophy.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* معلومات مجلس الإدارة */}
            <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
              <div className="p-6 bg-white rounded-xl shadow dark:bg-gray-800">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-primary dark:text-primary/90">
                  <UserCircle2 size={20} /> رئيس مجلس الإدارة
                </h3>
                <div className="flex gap-4 items-center">
                  <img
                    src={clubData?.board?.chairman?.image || '/images/club-avatar.png'}
                    alt="صورة رئيس مجلس الإدارة"
                    className="object-cover w-20 h-20 rounded-full"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold dark:text-white">{clubData?.board?.chairman?.name}</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <p className="flex gap-2 items-center">
                        <Phone size={16} /> {clubData?.board?.chairman?.phone}
                      </p>
                      <p className="flex gap-2 items-center">
                        <Mail size={16} /> {clubData?.board?.chairman?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl shadow dark:bg-gray-800">
                <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-primary dark:text-primary/90">
                  <UserCircle2 size={20} /> رئيس قطاع الناشئين
                </h3>
                <div className="flex gap-4 items-center">
                  <img
                    src={clubData?.board?.youthDirector?.image || '/images/club-avatar.png'}
                    alt="صورة رئيس قطاع الناشئين"
                    className="object-cover w-20 h-20 rounded-full"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold dark:text-white">{clubData?.board?.youthDirector?.name}</h4>
                    <div className="space-y-1 text-gray-600 dark:text-gray-300">
                      <p className="flex gap-2 items-center">
                        <Phone size={16} /> {clubData?.board?.youthDirector?.phone}
                      </p>
                      <p className="flex gap-2 items-center">
                        <Mail size={16} /> {clubData?.board?.youthDirector?.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* معرض الصور */}
            <div className="p-6 mb-8 bg-white rounded-xl shadow dark:bg-gray-800">
              <h3 className="flex gap-2 items-center mb-4 text-lg font-bold text-primary dark:text-primary/90">
                <Building2 size={20} /> معرض الصور
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {clubData?.gallery?.map((image, index) => (
                  <div key={index} className="overflow-hidden relative rounded-lg aspect-square">
                    <img
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
                {editMode && (
                  <label className="flex justify-center items-center rounded-lg border-2 border-gray-300 border-dashed transition cursor-pointer dark:border-gray-600 aspect-square hover:border-primary dark:hover:border-primary/80">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'gallery')}
                      aria-label="إضافة صورة للمعرض"
                      title="إضافة صورة للمعرض"
                    />
                    <Plus size={24} className="text-gray-400 dark:text-gray-500" />
                  </label>
                )}
              </div>
            </div>

            {/* معلومات التواصل */}
            <div className="p-6 bg-white rounded-xl shadow dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-bold text-primary dark:text-primary/90">معلومات التواصل</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <p className="flex gap-2 items-center text-gray-700 dark:text-gray-300">
                    <Phone size={18} /> {clubData?.phone}
                  </p>
                  <p className="flex gap-2 items-center text-gray-700 dark:text-gray-300">
                    <Mail size={18} /> {clubData?.email}
                  </p>
                  <p className="flex gap-2 items-center text-gray-700 dark:text-gray-300">
                    <MapPin size={18} /> {clubData?.address}
                  </p>
                </div>
                <div className="space-y-3">
                  <a href={clubData?.website} target="_blank" rel="noopener noreferrer" className="flex gap-2 items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Globe size={18} /> الموقع الإلكتروني
                  </a>
                  <a href={clubData?.facebook} target="_blank" rel="noopener noreferrer" className="flex gap-2 items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Facebook size={18} /> Facebook
                  </a>
                  <a href={clubData?.twitter} target="_blank" rel="noopener noreferrer" className="flex gap-2 items-center text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    <Twitter size={18} /> Twitter
                  </a>
                  <a href={clubData?.instagram} target="_blank" rel="noopener noreferrer" className="flex gap-2 items-center text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400">
                    <Instagram size={18} /> Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* نافذة التعديل */}
        {editMode && (
          <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/40">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditMode(false)}
                className="absolute top-4 left-4 text-2xl font-bold text-gray-400 hover:text-red-500"
                aria-label="إغلاق"
                type="button"
              >
                ×
              </button>
              <h2 className="mb-6 text-xl font-bold text-primary dark:text-primary/90">تعديل بيانات النادي</h2>
              {missingFields.length > 0 && (
                <div className="mb-2 font-bold text-red-600 dark:text-red-400">يرجى استكمال الحقول التالية: {missingFields.join('، ')}</div>
              )}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* المعلومات الأساسية */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">المعلومات الأساسية</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">اسم النادي</label>
                    <input
                      type="text"
                      value={clubData?.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="اسم النادي"
                      aria-label="اسم النادي"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الوصف</label>
                    <textarea
                      value={clubData?.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      placeholder="وصف النادي"
                      aria-label="وصف النادي"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">نوع النادي</label>
                    <input
                      type="text"
                      value={clubData?.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="نوع النادي"
                      aria-label="نوع النادي"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">تاريخ التأسيس</label>
                    <input
                      type="text"
                      value={clubData?.founded}
                      onChange={(e) => handleInputChange('founded', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="تاريخ التأسيس"
                      aria-label="تاريخ التأسيس"
                    />
                  </div>
                </div>

                {/* معلومات الموقع */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات الموقع</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">المدينة</label>
                    <input
                      type="text"
                      value={clubData?.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="المدينة"
                      aria-label="المدينة"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الدولة</label>
                    <input
                      type="text"
                      value={clubData?.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="الدولة"
                      aria-label="الدولة"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">العنوان</label>
                    <input
                      type="text"
                      value={clubData?.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="العنوان"
                      aria-label="العنوان"
                    />
                  </div>
                </div>

                {/* معلومات التواصل */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات التواصل</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={clubData?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="رقم الهاتف"
                      aria-label="رقم الهاتف"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={clubData?.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="البريد الإلكتروني"
                      aria-label="البريد الإلكتروني"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الموقع الإلكتروني</label>
                    <input
                      type="url"
                      value={clubData?.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="الموقع الإلكتروني"
                      aria-label="الموقع الإلكتروني"
                    />
                  </div>
                </div>

                {/* روابط التواصل الاجتماعي */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">روابط التواصل الاجتماعي</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">Facebook</label>
                    <input
                      type="url"
                      value={clubData?.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="رابط Facebook"
                      aria-label="رابط Facebook"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">Twitter</label>
                    <input
                      type="url"
                      value={clubData?.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="رابط Twitter"
                      aria-label="رابط Twitter"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">Instagram</label>
                    <input
                      type="url"
                      value={clubData?.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="رابط Instagram"
                      aria-label="رابط Instagram"
                    />
                  </div>
                </div>

                {/* معلومات الأكاديميات والمدارس */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">الأكاديميات والمدارس</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">عدد الأكاديميات</label>
                    <input
                      type="number"
                      value={clubData?.academies?.total}
                      onChange={(e) => handleInputChange('total', parseInt(e.target.value), 'academies')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="عدد الأكاديميات"
                      aria-label="عدد الأكاديميات"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">مدارس كرة القدم للرجال</label>
                    <input
                      type="number"
                      value={clubData?.schools?.men}
                      onChange={(e) => handleInputChange('men', parseInt(e.target.value), 'schools')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="مدارس كرة القدم للرجال"
                      aria-label="مدارس كرة القدم للرجال"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">مدارس كرة القدم للسيدات</label>
                    <input
                      type="number"
                      value={clubData?.schools?.women}
                      onChange={(e) => handleInputChange('women', parseInt(e.target.value), 'schools')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="مدارس كرة القدم للسيدات"
                      aria-label="مدارس كرة القدم للسيدات"
                    />
                  </div>
                </div>

                {/* معلومات مجلس الإدارة */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات مجلس الإدارة</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">اسم رئيس مجلس الإدارة</label>
                    <input
                      type="text"
                      value={clubData?.board?.chairman?.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'board', 'chairman')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="اسم رئيس مجلس الإدارة"
                      aria-label="اسم رئيس مجلس الإدارة"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">هاتف رئيس مجلس الإدارة</label>
                    <input
                      type="tel"
                      value={clubData?.board?.chairman?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'board', 'chairman')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="هاتف رئيس مجلس الإدارة"
                      aria-label="هاتف رئيس مجلس الإدارة"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">بريد رئيس مجلس الإدارة</label>
                    <input
                      type="email"
                      value={clubData?.board?.chairman?.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'board', 'chairman')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="بريد رئيس مجلس الإدارة"
                      aria-label="بريد رئيس مجلس الإدارة"
                    />
                  </div>
                </div>

                {/* معلومات رئيس قطاع الناشئين */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات رئيس قطاع الناشئين</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الاسم</label>
                    <input
                      type="text"
                      value={clubData?.board?.youthDirector?.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'board', 'youthDirector')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="الاسم"
                      aria-label="الاسم"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={clubData?.board?.youthDirector?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'board', 'youthDirector')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="رقم الهاتف"
                      aria-label="رقم الهاتف"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={clubData?.board?.youthDirector?.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'board', 'youthDirector')}
                      className="px-4 py-2 w-full rounded-lg border focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="البريد الإلكتروني"
                      aria-label="البريد الإلكتروني"
                    />
                  </div>
                </div>

                {/* صور الغلاف واللوجو */}
                <div className="flex flex-col gap-4 mb-4">
                  <label className="font-bold dark:text-white">شعار النادي (PNG/JPG، {LOGO_WIDTH}×{LOGO_HEIGHT} بكسل):</label>
                  <input 
                    type="file" 
                    accept="image/png,image/jpeg" 
                    onChange={e => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'logo');
                    }} 
                    disabled={uploading} 
                    className="dark:text-gray-300"
                    aria-label="رفع شعار النادي"
                    title="رفع شعار النادي"
                  />
                  <label className="font-bold dark:text-white">صورة الغلاف (PNG/JPG، {COVER_WIDTH}×{COVER_HEIGHT} بكسل):</label>
                  <input 
                    type="file" 
                    accept="image/png,image/jpeg" 
                    onChange={e => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'cover');
                    }} 
                    disabled={uploading} 
                    className="dark:text-gray-300"
                    aria-label="رفع صورة الغلاف"
                    title="رفع صورة الغلاف"
                  />
                  {imageError && <div className="font-bold text-red-600 dark:text-red-400">{imageError}</div>}
                </div>

                {/* صورة رئيس مجلس الإدارة */}
                <div>
                  <label className="block mb-2 font-medium dark:text-gray-300">صورة رئيس مجلس الإدارة</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'chairman');
                    }}
                    className="dark:text-gray-300"
                    aria-label="رفع صورة رئيس مجلس الإدارة"
                    title="رفع صورة رئيس مجلس الإدارة"
                  />
                </div>

                {/* صورة رئيس قطاع الناشئين */}
                <div>
                  <label className="block mb-2 font-medium dark:text-gray-300">صورة رئيس قطاع الناشئين</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'youthDirector');
                    }}
                    className="dark:text-gray-300"
                    aria-label="رفع صورة رئيس قطاع الناشئين"
                    title="رفع صورة رئيس قطاع الناشئين"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={uploading}
                  className="px-4 py-2 text-white bg-gradient-to-l from-blue-400 to-blue-600 rounded-lg hover:opacity-90 disabled:opacity-50 dark:from-blue-500 dark:to-blue-700"
                >
                  {uploading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 

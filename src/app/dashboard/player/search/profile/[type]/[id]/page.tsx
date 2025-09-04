'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, setDoc, serverTimestamp } from 'firebase/firestore';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  Building,
  Briefcase,
  Eye,
  Mail,
  Phone,
  Globe,
  Award,
  Target,
  Trophy,
  CheckCircle,
  Loader2,
  Sparkles,
  User,
  Users,
  Calendar,
  Languages,
  Share2
} from 'lucide-react';

// أنواع البيانات
interface EntityProfile {
  id: string;
  name: string;
  type: 'club' | 'agent' | 'scout' | 'academy' | 'sponsor' | 'trainer';
  email: string;
  phone?: string;
  website?: string;
  profileImage?: string;
  coverImage?: string;
  location: {
    country: string;
    city: string;
    address?: string;
  };
  description: string;
  specialization?: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  connectionsCount: number;
  achievements?: string[];
  services?: string[];
  established?: string;
  languages?: string[];
  contactInfo: {
    email: string;
    phone: string;
    whatsapp?: string;
  };
  stats?: {
    successfulDeals: number;
    playersRepresented: number;
    activeContracts: number;
  };
  isFollowing?: boolean;
}

const ENTITY_TYPES = {
  club: { label: 'نادي', icon: Building, color: 'bg-blue-500' },
  agent: { label: 'وكيل لاعبين', icon: Briefcase, color: 'bg-purple-500' },
  scout: { label: 'سكاوت', icon: Eye, color: 'bg-green-500' },
  academy: { label: 'أكاديمية', icon: Trophy, color: 'bg-orange-500' },
  sponsor: { label: 'راعي', icon: Award, color: 'bg-red-500' },
  trainer: { label: 'مدرب', icon: User, color: 'bg-cyan-500' }
};

export default function EntityProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const params = useParams();
  
  const [entity, setEntity] = useState<EntityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const entityType = params.type as string;
  const entityId = params.id as string;

  // جلب بيانات الكيان
  useEffect(() => {
    const fetchEntity = async () => {
      if (!entityType || !entityId) return;

      try {
        setIsLoading(true);
        setError('');

        // تحديد المجموعة حسب النوع
        let collectionName = '';
        switch (entityType) {
          case 'club':
            collectionName = 'clubs';
            break;
          case 'agent':
            collectionName = 'agents';
            break;
          case 'academy':
            collectionName = 'academies';
            break;
          case 'trainer':
            collectionName = 'trainers';
            break;
          default:
            setError('نوع الكيان غير مدعوم');
            return;
        }

        const docRef = doc(db, collectionName, entityId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // منع عرض ملفات المشرف
          if (data.accountType === 'admin' || data.type === 'admin') {
            setError('غير مسموح بعرض هذا الملف');
            setIsLoading(false);
            return;
          }
          
          // تحويل البيانات إلى تنسيق EntityProfile
          const profile: EntityProfile = {
            id: docSnap.id,
            name: data.name || data.full_name || 'غير محدد',
            type: entityType as any,
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            profileImage: data.logo || data.profile_photo || '/images/default-avatar.png',
            coverImage: data.coverImage || '/images/hero-1.jpg',
            location: {
              country: data.country || data.nationality || '',
              city: data.city || data.current_location?.split(' - ')[1] || data.current_location || '',
              address: data.address || data.office_address || ''
            },
            description: data.description || 'لا يوجد وصف متاح',
            specialization: data.specialization || data.type || '',
            verified: data.is_fifa_licensed || data.is_certified || true,
            rating: 4.5,
            reviewsCount: data.reviewsCount ?? 0,
            followersCount: (Array.isArray(data.followers) ? data.followers.length : (data.followersCount ?? 0)),
            connectionsCount: data.stats?.contracts || data.stats?.completed_deals || 0,
            achievements: data.trophies?.map((t: any) => `${t.name} (${t.year})`) || 
                          (data.is_fifa_licensed ? ['وكيل معتمد FIFA'] : []) ||
                          (data.is_certified ? ['مدرب معتمد'] : []) ||
                          ['خبرة متميزة'],
            services: data.programs || ['خدمات متنوعة'],
            established: data.founded || data.established || 
                        (data.createdAt ? new Date(data.createdAt.seconds * 1000).getFullYear().toString() : ''),
            languages: data.spoken_languages || ['العربية'],
            contactInfo: {
              email: data.email || '',
              phone: data.phone || '',
              whatsapp: data.phone || ''
            },
            stats: {
              successfulDeals: data.stats?.completed_deals || data.stats?.contracts || 0,
              playersRepresented: data.stats?.active_players || data.stats?.players || data.stats?.students || 0,
              activeContracts: data.stats?.success_rate || data.stats?.training_sessions || 0
            },
            isFollowing: Array.isArray(data.followers) ? data.followers.includes(user?.uid) : false
          };

          setEntity(profile);
        } else {
          setError('لم يتم العثور على الملف المطلوب');
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات الكيان:', error);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntity();
  }, [entityType, entityId]);

  // متابعة الكيان
  const handleFollow = async () => {
    if (!user || !entity) return;
    setActionLoading('follow');
    const originalFollowing = entity.isFollowing ?? false;
    const nextFollowing = !originalFollowing;
    setEntity(prev => prev ? { ...prev, isFollowing: nextFollowing } : prev);

    try {
      const collectionName =
        entity.type === 'club' ? 'clubs' :
        entity.type === 'agent' ? 'agents' :
        entity.type === 'academy' ? 'academies' :
        entity.type === 'trainer' ? 'trainers' : 'entities';

      const ref = doc(db, collectionName, entity.id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        if (originalFollowing) {
          await updateDoc(ref, { followers: arrayRemove(user.uid) });
        } else {
          await updateDoc(ref, { followers: arrayUnion(user.uid) });
        }
      } else {
        await setDoc(ref, {
          id: entity.id,
          followers: nextFollowing ? [user.uid] : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('خطأ في المتابعة:', error);
      setEntity(prev => prev ? { ...prev, isFollowing: originalFollowing } : prev);
    } finally {
    setActionLoading(null);
    }
  };

  // إرسال رسالة
  const handleMessage = () => {
    if (!user || !entity) return;
    router.push(`/dashboard/messages?recipient=${entity.id}`);
  };

  // تنسيق الأرقام
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  // التحقق من تسجيل الدخول
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للخلف
          </Button>
        </Card>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">لم يتم العثور على الملف</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للخلف
          </Button>
        </Card>
      </div>
    );
  }

  const entityTypeInfo = ENTITY_TYPES[entity.type];
  const EntityIcon = entityTypeInfo.icon;

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
              <h1 className="text-xl font-bold text-gray-900">ملف {entityTypeInfo.label} الشخصي</h1>
              {entity && (
                <p className="text-sm text-gray-600">{entity.name}</p>
              )}
            </div>

            {/* مساحة فارغة للتوازن */}
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-4 py-8 mx-auto max-w-7xl">
        <main className="flex-1 min-h-0 p-6 mx-4 my-6 overflow-auto rounded-lg shadow-inner md:p-10 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl px-4 py-10 mx-auto">
            {/* بطاقة الملف الرئيسية */}
            <Card className="overflow-hidden mb-8">
              {/* صورة الغلاف */}
              <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 relative">
                {entity.coverImage && (
                  <img 
                    src={entity.coverImage} 
                    alt={entity.name}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-30"></div>
                
                {/* شارات الحالة */}
                <div className="absolute top-4 right-4 flex gap-2">
                  {entity.verified && (
                    <Badge className="bg-blue-500 text-white">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      محقق
                    </Badge>
                  )}
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Sparkles className="w-4 h-4 mr-1" />
                    مميز
                  </Badge>
                </div>
                
                {/* معلومات الملف الشخصي */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-end gap-4">
                    {/* صورة الملف الشخصي */}
                    <div className="relative">
                      <img 
                        src={entity.profileImage} 
                        alt={entity.name}
                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <EntityIcon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    {/* معلومات أساسية */}
                    <div className="flex-1 text-white">
                      <h1 className="text-3xl font-bold mb-2">{entity.name}</h1>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {entity.location.city}, {entity.location.country}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-300" />
                          {entity.rating} ({formatNumber(entity.reviewsCount)} تقييم)
                        </div>
                      </div>
                    </div>
                    
                    {/* أزرار الإجراءات */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleFollow}
                        disabled={actionLoading === 'follow'}
                        variant={entity.isFollowing ? "outline" : "default"}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        {actionLoading === 'follow' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : entity.isFollowing ? (
                          <>
                            <UserCheck className="w-4 h-4 mr-2" />
                            متابع
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            متابعة
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        onClick={handleMessage}
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        رسالة
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* إحصائيات سريعة */}
              <div className="p-6 bg-white">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(entity.followersCount)}</div>
                    <div className="text-sm text-gray-600">متابع</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(entity.connectionsCount)}</div>
                    <div className="text-sm text-gray-600">اتصال</div>
                  </div>
                  {entity.stats && (
                    <>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{entity.stats.successfulDeals}</div>
                        <div className="text-sm text-gray-600">صفقة ناجحة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{entity.stats.playersRepresented}</div>
                        <div className="text-sm text-gray-600">لاعب ممثل</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>

            {/* معلومات تفصيلية */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* العمود الأيسر - معلومات أساسية */}
              <div className="lg:col-span-2 space-y-6">
                {/* الوصف */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الوصف</h3>
                  <p className="text-gray-700 leading-relaxed">{entity.description}</p>
                </Card>

                {/* الإنجازات */}
                {entity.achievements && entity.achievements.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">الإنجازات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entity.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="text-gray-700">{achievement}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* الخدمات */}
                {entity.services && entity.services.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">الخدمات</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {entity.services.map((service, index) => (
                        <div key={index} className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                          <Target className="w-5 h-5 text-blue-500" />
                          <span className="text-gray-700">{service}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* العمود الأيمن - معلومات الاتصال */}
              <div className="space-y-6">
                {/* معلومات الاتصال */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">معلومات الاتصال</h3>
                  <div className="space-y-4">
                    {entity.contactInfo.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">البريد الإلكتروني</div>
                          <div className="font-medium">{entity.contactInfo.email}</div>
                        </div>
                      </div>
                    )}
                    
                    {entity.contactInfo.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">رقم الهاتف</div>
                          <div className="font-medium">{entity.contactInfo.phone}</div>
                        </div>
                      </div>
                    )}
                    
                    {entity.website && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Globe className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">الموقع الإلكتروني</div>
                          <a href={entity.website} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                            {entity.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* معلومات إضافية */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">معلومات إضافية</h3>
                  <div className="space-y-4">
                    {entity.specialization && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Target className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">التخصص</div>
                          <div className="font-medium">{entity.specialization}</div>
                        </div>
                      </div>
                    )}
                    
                    {entity.established && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">تاريخ التأسيس</div>
                          <div className="font-medium">{entity.established}</div>
                        </div>
                      </div>
                    )}
                    
                    {entity.languages && entity.languages.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Languages className="w-5 h-5 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">اللغات</div>
                          <div className="font-medium">{entity.languages.join(', ')}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* أزرار الإجراءات */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">الإجراءات</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={handleFollow}
                      disabled={actionLoading === 'follow'}
                      variant={entity.isFollowing ? "outline" : "default"}
                      className="w-full"
                    >
                      {actionLoading === 'follow' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : entity.isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-2" />
                          متابع
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          متابعة
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      onClick={handleMessage}
                      variant="outline"
                      className="w-full"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      إرسال رسالة
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="w-full"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      مشاركة
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

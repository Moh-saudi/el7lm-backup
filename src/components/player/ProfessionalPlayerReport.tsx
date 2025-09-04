import React, { useState } from 'react';
import { PlayerFormData } from '@/types/player';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import {
  User,
  Trophy,
  Star,
  Target,
  HeartPulse,
  GraduationCap,
  Building,
  Shield,
  Phone,
  Mail,
  MapPin,
  Flag,
  Calendar,
  Award,
  Users,
  ExternalLink,
  Eye,
  CheckCircle,
  XCircle,
  Info,
  ArrowRight,
  Crown,
  Zap,
  TrendingUp,
  Medal,
  Globe,
  Briefcase,
  Clock,
  Ruler,
  Weight,
  BookOpen,
  Languages,
  ImageIcon,
  Video,
  FileCheck,
  Plus
} from 'lucide-react';
import { getPlayerOrganization } from '@/utils/player-organization';

dayjs.locale('ar');

interface ProfessionalPlayerReportProps {
  player: PlayerFormData;
}

const ProfessionalPlayerReport: React.FC<ProfessionalPlayerReportProps> = ({ player }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const organization = getPlayerOrganization(player);

  // دالة حساب العمر
  const calculateAge = (birthDate: any) => {
    if (!birthDate) return null;
    try {
      let d: Date;
      if (typeof birthDate === 'object' && birthDate.toDate && typeof birthDate.toDate === 'function') {
        d = birthDate.toDate();
      } else if (birthDate instanceof Date) {
        d = birthDate;
      } else {
        d = new Date(birthDate);
      }
      
      if (isNaN(d.getTime())) return null;
      
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const monthDiff = today.getMonth() - d.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return null;
    }
  };

  const TABS = [
    { key: 'overview', label: 'نظرة عامة', icon: Eye },
    { key: 'personal', label: 'البيانات الشخصية', icon: User },
    { key: 'affiliation', label: 'التبعية', icon: Building },
    { key: 'education', label: 'التعليم', icon: GraduationCap },
    { key: 'medical', label: 'المعلومات الطبية', icon: HeartPulse },
    { key: 'sports', label: 'المعلومات الرياضية', icon: Trophy },
    { key: 'skills', label: 'المهارات', icon: Star },
    { key: 'objectives', label: 'الأهداف', icon: Target },
    { key: 'media', label: 'الوسائط', icon: ImageIcon },
    { key: 'contracts', label: 'العقود', icon: FileCheck },
  ];

  const MOTIVATIONAL_PHRASES = [
    "🏆 موهبة استثنائية تبحث عن فرصتها الذهبية",
    "⚡ لاعب محترف يمتلك مهارات فريدة",
    "🌟 نجم صاعد في عالم كرة القدم",
    "💎 موهبة خام تنتظر التلميع",
    "🚀 لاعب طموح يسعى للتميز",
    "🎯 هدف واضح وطموح لا حدود له",
    "🔥 شغف كرة القدم يتدفق في عروقه",
    "💪 إرادة قوية وعزيمة لا تلين"
  ];

  const getRandomPhrase = () => {
    return MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-6 py-12 mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* صورة اللاعب */}
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                {player?.profile_image ? (
                  <img 
                    src={typeof player.profile_image === 'string' 
                      ? player.profile_image 
                      : (player.profile_image as { url: string })?.url} 
                    alt={player.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>

            {/* معلومات اللاعب */}
            <div className="flex-1 text-center lg:text-right">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                {player?.full_name || 'لاعب محترف'}
              </h1>
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <span className="px-4 py-2 bg-white bg-opacity-20 rounded-full text-white font-semibold">
                  {player?.primary_position || 'لاعب'}
                </span>
                <span className="px-4 py-2 bg-green-500 rounded-full text-white font-semibold">
                  {(() => {
                    const age = calculateAge(player?.birth_date);
                    return age ? `${age} سنة` : 'عمر غير محدد';
                  })()}
                </span>
                <span className="px-4 py-2 bg-purple-500 rounded-full text-white font-semibold">
                  {player?.nationality || 'جنسية غير محدد'}
                </span>
              </div>
              <p className="text-xl text-blue-100 mb-6">
                {getRandomPhrase()}
              </p>
            </div>

            {/* صورة الحساب التابع له */}
            {(player as any)?.addedBy && (
              <div className="relative">
                <div className="text-center">
                  <div 
                    className="w-20 h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden border-3 border-white shadow-lg mx-auto mb-2 cursor-pointer hover:scale-105 transition-transform duration-500 ease-out"
                    onClick={() => {
                      const accountType = (player as any).addedBy.accountType;
                      const accountId = (player as any).addedBy.accountId;
                      if (accountId) {
                        window.open(`/dashboard/${accountType}/profile?id=${accountId}`, '_blank');
                      }
                    }}
                  >
                    {(player as any).addedBy.accountImage ? (
                      <img 
                        src={(player as any).addedBy.accountImage} 
                        alt={(player as any).addedBy.accountName || 'صورة الجهة'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // إذا فشل تحميل الصورة، اعرض الحرف الأول
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ${(player as any).addedBy.accountImage ? 'hidden' : ''}`}>
                      <span className="text-white font-bold text-lg">
                        {(player as any).addedBy.accountName ? 
                          (player as any).addedBy.accountName.charAt(0).toUpperCase() : 
                          'A'
                        }
                      </span>
                    </div>
                  </div>
                  <p className="text-white text-sm font-medium hover:text-blue-200 transition-colors">
                    {(player as any).addedBy.accountName || 'حساب رياضي'}
                  </p>
                  <p className="text-blue-200 text-xs">
                    {(() => {
                      const accountType = (player as any).addedBy.accountType;
                      switch(accountType) {
                        case 'club': return 'نادي رياضي';
                        case 'academy': return 'أكاديمية رياضية';
                        case 'trainer': return 'مدرب شخصي';
                        case 'agent': return 'وكيل رياضي';
                        default: return 'حساب رياضي';
                      }
                    })()}
                  </p>
                  <div className="mt-2">
                    <span className="text-xs text-blue-200 bg-blue-900 bg-opacity-30 px-2 py-1 rounded-full">
                      انقر لعرض الحساب
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-8 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Trophy className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المركز الأساسي</p>
                <p className="text-xl font-bold text-gray-900">{player?.primary_position || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">القدم المفضلة</p>
                <p className="text-xl font-bold text-gray-900">{player?.preferred_foot || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">سنوات الخبرة</p>
                <p className="text-xl font-bold text-gray-900">{player?.experience_years || 'غير محدد'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">المدينة</p>
                <p className="text-xl font-bold text-gray-900">{player?.city || 'غير محدد'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex flex-wrap gap-2 p-6">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">ملف اللاعب الاحترافي</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    ملف شامل يعرض قدرات ومهارات هذا اللاعب الموهوب، مع التركيز على نقاط القوة والفرص المتاحة للتطوير
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Crown className="w-6 h-6 text-blue-600" />
                      المهارات المميزة
                    </h3>
                    <div className="space-y-4">
                      {player?.technical_skills && Object.entries(player.technical_skills).slice(0, 3).map(([skill, value]) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">{skill}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full">
                              <div 
                                className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300" 
                                style={{ width: `${(Number(value) / 5) * 100}%` }} 
                              />
                            </div>
                            <span className="text-sm font-bold text-blue-600">{value}/5</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      الإنجازات المتوقعة
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">قابلية التطوير العالية</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">مهارات تقنية متقدمة</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-gray-700">إمكانية اللعب في مراكز متعددة</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">رسالة تحفيزية</h3>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    "هذا اللاعب يمثل نموذجاً مثالياً للاعب المحترف الذي يجمع بين الموهبة الطبيعية والتدريب المكثف. 
                    قدراته الاستثنائية ومهاراته المتقدمة تجعله مرشحاً قوياً للنجاح في أعلى المستويات الرياضية."
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'personal' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">البيانات الشخصية</h2>
                  <p className="text-lg text-gray-600">معلومات اللاعب الشخصية والجهة التابعة</p>
                </div>

                {/* معلومات الجهة التابعة في الأعلى */}
                {(player as any)?.addedBy && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Building className="w-6 h-6 text-purple-600" />
                      الجهة التابعة
                    </h3>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                         onClick={() => {
                           const accountType = (player as any).addedBy.accountType;
                           const accountId = (player as any).addedBy.accountId;
                           if (accountId) {
                             window.open(`/dashboard/${accountType}/profile?id=${accountId}`, '_blank');
                           }
                         }}>
                      <div className="flex items-center gap-6">
                        {/* صورة الجهة */}
                        <div className="relative">
                          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border-3 border-white overflow-hidden">
                            {(player as any).addedBy.accountImage ? (
                              <img 
                                src={(player as any).addedBy.accountImage} 
                                alt={(player as any).addedBy.accountName || 'صورة الجهة'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // إذا فشل تحميل الصورة، اعرض الحرف الأول
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 flex items-center justify-center text-white font-bold text-3xl ${(player as any).addedBy.accountImage ? 'hidden' : ''}`}>
                              {(player as any).addedBy.accountName ? 
                                (player as any).addedBy.accountName.charAt(0).toUpperCase() : 
                                'A'
                              }
                            </div>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                        
                        {/* معلومات الجهة */}
                        <div className="flex-1">
                          <h4 className="text-2xl font-bold text-gray-900 mb-2">
                            {(player as any).addedBy.accountName || 'حساب رياضي محترف'}
                          </h4>
                          <p className="text-gray-600 mb-3 text-lg">
                            {(() => {
                              const accountType = (player as any).addedBy.accountType;
                              switch(accountType) {
                                case 'club': return '🏆 نادي رياضي محترف';
                                case 'academy': return '🎓 أكاديمية رياضية متخصصة';
                                case 'trainer': return '👨‍💼 مدرب شخصي محترف';
                                case 'agent': return '🤝 وكيل رياضي معتمد';
                                default: return '⚽ حساب رياضي';
                              }
                            })()}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>📅 تم الإضافة: {dayjs((player as any).addedBy.dateAdded).format('DD/MM/YYYY')}</span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                              {(() => {
                                const accountType = (player as any).addedBy.accountType;
                                switch(accountType) {
                                  case 'club': return 'نادي';
                                  case 'academy': return 'أكاديمية';
                                  case 'trainer': return 'مدرب';
                                  case 'agent': return 'وكيل';
                                  default: return 'حساب';
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                        
                        {/* زر التوجيه */}
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                            <ExternalLink className="w-6 h-6" />
                          </div>
                          <span className="text-purple-600 font-semibold">عرض الحساب</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* البيانات الشخصية */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <User className="w-6 h-6 text-blue-600" />
                      المعلومات الأساسية
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">الاسم الكامل</span>
                        <span className="font-semibold text-gray-900">{player?.full_name || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">العمر</span>
                        <span className="font-semibold text-gray-900">
                          {(() => {
                            const age = calculateAge(player?.birth_date);
                            return age ? `${age} سنة` : 'غير محدد';
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">الجنسية</span>
                        <span className="font-semibold text-gray-900">{player?.nationality || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">المدينة</span>
                        <span className="font-semibold text-gray-900">{player?.city || 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Trophy className="w-6 h-6 text-green-600" />
                      المعلومات الرياضية
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">المركز الأساسي</span>
                        <span className="font-semibold text-gray-900">{player?.primary_position || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">القدم المفضلة</span>
                        <span className="font-semibold text-gray-900">{player?.preferred_foot || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">سنوات الخبرة</span>
                        <span className="font-semibold text-gray-900">{player?.experience_years || 'غير محدد'}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium text-gray-700">الطول</span>
                        <span className="font-semibold text-gray-900">{player?.height ? `${player.height} سم` : 'غير محدد'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* معلومات الاتصال المحجوبة */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    معلومات الاتصال (محجوبة)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Phone className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700">رقم الهاتف</h4>
                          <p className="text-sm text-gray-500">معلومات محجوبة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                        <span className="text-sm text-red-600 font-medium">محجوب</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Mail className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700">البريد الإلكتروني</h4>
                          <p className="text-sm text-gray-500">معلومات محجوبة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                        <span className="text-sm text-red-600 font-medium">محجوب</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">لماذا تم إخفاء معلومات الاتصال؟</p>
                        <p className="text-sm text-blue-600">لحماية خصوصية اللاعب، تم إخفاء معلومات الاتصال الحساسة</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'affiliation' && (
              <div className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">معلومات التبعية</h2>
                  <p className="text-lg text-gray-600">تفاصيل الحساب الذي ينتمي إليه هذا اللاعب</p>
                </div>

                {/* بطاقة الحساب المضيف المحسنة */}
                {(player as any)?.addedBy && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <Building className="w-6 h-6 text-purple-600" />
                        الجهة التابعة
                      </h3>
                      <p className="text-gray-600">الحساب الذي ينتمي إليه هذا اللاعب</p>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                         onClick={() => {
                           const accountType = (player as any).addedBy.accountType;
                           const accountId = (player as any).addedBy.accountId;
                           if (accountId) {
                             window.open(`/dashboard/${accountType}/profile?id=${accountId}`, '_blank');
                           }
                         }}>
                      <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* صورة الحساب المحسنة */}
                        <div className="relative">
                          <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-2xl border-4 border-white overflow-hidden">
                            {(player as any).addedBy.accountImage ? (
                              <img 
                                src={(player as any).addedBy.accountImage} 
                                alt={(player as any).addedBy.accountName || 'صورة الجهة'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // إذا فشل تحميل الصورة، اعرض الحرف الأول
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const fallback = target.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className={`absolute inset-0 flex items-center justify-center text-white font-bold text-4xl ${(player as any).addedBy.accountImage ? 'hidden' : ''}`}>
                              {(player as any).addedBy.accountName ? 
                                (player as any).addedBy.accountName.charAt(0).toUpperCase() : 
                                'A'
                              }
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-3 border-white flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                            <ExternalLink className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        {/* معلومات الحساب المحسنة */}
                        <div className="flex-1 text-center lg:text-right">
                          <h4 className="text-3xl font-bold text-gray-900 mb-3">
                            {(player as any).addedBy.accountName || 'حساب رياضي محترف'}
                          </h4>
                          <div className="mb-4">
                            <span className="inline-block px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold text-lg">
                              {(() => {
                                const accountType = (player as any).addedBy.accountType;
                                switch(accountType) {
                                  case 'club': return '🏆 نادي رياضي محترف';
                                  case 'academy': return '🎓 أكاديمية رياضية متخصصة';
                                  case 'trainer': return '👨‍💼 مدرب شخصي محترف';
                                  case 'agent': return '🤝 وكيل رياضي معتمد';
                                  default: return '⚽ حساب رياضي';
                                }
                              })()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-500">📅 تاريخ الإضافة:</span>
                              <span className="font-semibold text-gray-900 block">
                                {dayjs((player as any).addedBy.dateAdded).format('DD/MM/YYYY')}
                              </span>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <span className="text-gray-500">🏷️ نوع الحساب:</span>
                              <span className="font-semibold text-gray-900 block">
                                {(() => {
                                  const accountType = (player as any).addedBy.accountType;
                                  switch(accountType) {
                                    case 'club': return 'نادي رياضي';
                                    case 'academy': return 'أكاديمية';
                                    case 'trainer': return 'مدرب شخصي';
                                    case 'agent': return 'وكيل رياضي';
                                    default: return 'حساب رياضي';
                                  }
                                })()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* زر التوجيه المحسن */}
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white shadow-lg">
                            <ExternalLink className="w-6 h-6" />
                          </div>
                          <span className="text-purple-600 font-semibold text-center">عرض الحساب</span>
                          <p className="text-xs text-gray-500 text-center">انقر للانتقال</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* معلومات إضافية عن الجهة */}
                {(player as any)?.addedBy && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Info className="w-6 h-6 text-blue-600" />
                      معلومات إضافية
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Building className="w-5 h-5 text-blue-600" />
                          </div>
                          <h4 className="font-semibold text-gray-700">معرف الجهة</h4>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {(player as any).addedBy.accountId || 'غير محدد'}
                        </p>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                          <h4 className="font-semibold text-gray-700">حالة التبعية</h4>
                        </div>
                        <p className="text-2xl font-bold text-green-600">نشط</p>
                      </div>
                      
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-600" />
                          </div>
                          <h4 className="font-semibold text-gray-700">مدة التبعية</h4>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          {(() => {
                            const addedDate = dayjs((player as any).addedBy.dateAdded);
                            const now = dayjs();
                            const diffDays = now.diff(addedDate, 'day');
                            if (diffDays === 0) return 'اليوم';
                            if (diffDays === 1) return 'أمس';
                            if (diffDays < 7) return `${diffDays} أيام`;
                            if (diffDays < 30) return `${Math.floor(diffDays / 7)} أسابيع`;
                            return `${Math.floor(diffDays / 30)} أشهر`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* معلومات الاتصال المحجوبة */}
                <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-600" />
                    حماية الخصوصية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Phone className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700">رقم الهاتف</h4>
                          <p className="text-sm text-gray-500">معلومات محجوبة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                        <span className="text-sm text-red-600 font-medium">محجوب</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Mail className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-700">البريد الإلكتروني</h4>
                          <p className="text-sm text-gray-500">معلومات محجوبة</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                        <span className="text-sm text-red-600 font-medium">محجوب</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Info className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-800">لماذا تم إخفاء هذه المعلومات؟</p>
                        <p className="text-sm text-blue-600">لحماية خصوصية اللاعب، تم إخفاء معلومات الاتصال الحساسة</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* باقي التبويبات يمكن إضافتها هنا */}
            {activeTab !== 'overview' && activeTab !== 'personal' && activeTab !== 'affiliation' && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">قيد التطوير</h3>
                <p className="text-gray-600">سيتم إضافة هذا القسم قريباً</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPlayerReport; 

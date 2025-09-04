'use client';

import { PlayerFormData, Achievement } from '@/types/player';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import React, { useState } from 'react';
import { getPlayerOrganization } from '@/utils/player-organization';
import {
  User,
  FileText,
  GraduationCap,
  HeartPulse,
  Target,
  Star,
  Image as ImageIcon,
  FileCheck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Trophy,
  Users,
  Building,
  Globe,
  Flag,
  Weight,
  Ruler,
  Eye,
  Shield,
  BookOpen,
  Languages,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ExternalLink
} from 'lucide-react';

dayjs.locale('ar');

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

interface PlayerReportViewProps {
  player: PlayerFormData;
}

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

const OBJECTIVES_LABELS: Record<string, string> = {
  european_leagues: "الدوريات الأوروبية",
  arab_leagues: "الدوريات العربية",
  local_leagues: "الدوريات المحلية",
  professional: "الاحتراف",
  training: "التدريب",
  trials: "التجارب",
};

const PlayerReportView: React.FC<PlayerReportViewProps> = ({ player }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // تحويل بيانات المهارات لمخططات الرادار
  const technicalSkillsData = player?.technical_skills
    ? Object.entries(player.technical_skills).map(([key, value]) => ({
        skill: key === 'ball_control' ? 'التحكم بالكرة'
              : key === 'passing' ? 'التمرير'
              : key === 'shooting' ? 'التسديد'
              : key === 'dribbling' ? 'المراوغة'
              : key,
        value: Number(value)
      }))
    : [];

  // مكون البطاقة المحسن
  const InfoCard = ({ title, value, icon: Icon, color = 'blue', className = '' }: {
    title: string;
    value: string | number;
    icon: any;
    color?: string;
    className?: string;
  }) => (
    <div className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-700 text-sm">{title}</h3>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value || '--'}</p>
    </div>
  );

  // مكون البطاقة مع الوصف
  const DetailCard = ({ title, value, description, icon: Icon, color = 'blue' }: {
    title: string;
    value: string | number;
    description?: string;
    icon: any;
    color?: string;
  }) => (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-700">{title}</h3>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
      </div>
      <p className="text-xl font-bold text-gray-900">{value || '--'}</p>
    </div>
  );

  // نظرة عامة
  const renderOverview = () => (
    <div className="space-y-8">
      {/* معلومات أساسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          title="الاسم الكامل"
          value={player?.full_name || 'غير محدد'}
          icon={User}
          color="blue"
        />
        <InfoCard
          title="العمر"
          value={(() => {
            const age = calculateAge(player?.birth_date);
            return age ? `${age} سنة` : 'غير محدد';
          })()}
          icon={Calendar}
          color="green"
        />
        <InfoCard
          title="الجنسية"
          value={player?.nationality || 'غير محدد'}
          icon={Flag}
          color="purple"
        />
        <InfoCard
          title="المدينة"
          value={player?.city || 'غير محدد'}
          icon={MapPin}
          color="orange"
        />
      </div>

      {/* معلومات الاتصال المحجوبة */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          معلومات الاتصال (محجوبة)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm">رقم الهاتف</h4>
                <p className="text-xs text-gray-500">معلومات محجوبة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">محجوب</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm">واتساب</h4>
                <p className="text-xs text-gray-500">معلومات محجوبة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">محجوب</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm">البريد الإلكتروني</h4>
                <p className="text-xs text-gray-500">معلومات محجوبة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">محجوب</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">لماذا تم إخفاء هذه المعلومات؟</p>
              <p className="text-xs text-blue-600">لأن هذا اللاعب ينتمي لحساب آخر، تم إخفاء معلومات الاتصال لحماية الخصوصية</p>
            </div>
          </div>
        </div>
      </div>

      {/* معلومات رياضية سريعة */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-green-600" />
          المعلومات الرياضية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailCard
            title="المركز الأساسي"
            value={player?.primary_position || 'غير محدد'}
            icon={Target}
            color="blue"
          />
          <DetailCard
            title="القدم المفضلة"
            value={player?.preferred_foot || 'غير محدد'}
            icon={Target}
            color="purple"
          />
          <DetailCard
            title="سنوات الخبرة"
            value={player?.experience_years || 'غير محدد'}
            icon={Clock}
            color="orange"
          />
        </div>
      </div>

      {/* نبذة مختصرة */}
      {player?.brief && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            نبذة مختصرة
          </h3>
          <p className="text-gray-700 leading-relaxed">{player.brief}</p>
        </div>
      )}
    </div>
  );

  // البيانات الشخصية
  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard
          title="الاسم الكامل"
          value={player?.full_name || 'غير محدد'}
          icon={User}
          color="blue"
        />
        <DetailCard
          title="تاريخ الميلاد"
          value={player?.birth_date ? dayjs(player.birth_date).format('DD/MM/YYYY') : 'غير محدد'}
          icon={Calendar}
          color="green"
        />
        <DetailCard
          title="العمر"
          value={(() => {
            const age = calculateAge(player?.birth_date);
            return age ? `${age} سنة` : 'غير محدد';
          })()}
          icon={Calendar}
          color="orange"
        />
        <DetailCard
          title="الجنسية"
          value={player?.nationality || 'غير محدد'}
          icon={Flag}
          color="purple"
        />
        <DetailCard
          title="المدينة"
          value={player?.city || 'غير محدد'}
          icon={MapPin}
          color="yellow"
        />
        <DetailCard
          title="الدولة"
          value={player?.country || 'غير محدد'}
          icon={Globe}
          color="red"
        />
      </div>

      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          معلومات الاتصال (محجوبة)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm">رقم الهاتف</h4>
                <p className="text-xs text-gray-500">معلومات محجوبة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">محجوب</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Phone className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm">واتساب</h4>
                <p className="text-xs text-gray-500">معلومات محجوبة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">محجوب</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Mail className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 text-sm">البريد الإلكتروني</h4>
                <p className="text-xs text-gray-500">معلومات محجوبة</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
              <span className="text-xs text-red-600 font-medium">محجوب</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-blue-100 rounded">
              <Info className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">لماذا تم إخفاء هذه المعلومات؟</p>
              <p className="text-xs text-blue-600">لأن هذا اللاعب ينتمي لحساب آخر، تم إخفاء معلومات الاتصال لحماية الخصوصية</p>
            </div>
          </div>
        </div>
      </div>

      {player?.brief && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            نبذة مختصرة
          </h3>
          <p className="text-gray-700 leading-relaxed">{player.brief}</p>
        </div>
      )}
    </div>
  );

  // --- Affiliation ---
  const renderAffiliation = () => {
    const organization = getPlayerOrganization(player);
    
    return (
      <div className="space-y-6">
        {/* معلومات التبعية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">نوع التبعية</h3>
                <p className="text-sm text-gray-600">الجهة التي ينتمي إليها اللاعب</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{organization.emoji}</span>
              <span className="text-xl font-bold text-blue-900">{organization.typeArabic}</span>
            </div>
          </div>
          
          {organization.id && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">معرف الجهة</h3>
                  <p className="text-sm text-gray-600">الرقم التعريفي للحساب</p>
                </div>
              </div>
              <p className="text-xl font-bold text-green-900">{organization.id}</p>
            </div>
          )}
        </div>

        {/* معلومات الإضافة مع إمكانية التوجيه */}
        {(player as any)?.addedBy && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              معلومات الإضافة
            </h3>
            
            {/* بطاقة الحساب المضيف */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                 onClick={() => {
                   const accountType = (player as any).addedBy.accountType;
                   const accountId = (player as any).addedBy.accountId;
                   if (accountId) {
                     window.open(`/dashboard/${accountType}/profile?id=${accountId}`, '_blank');
                   }
                 }}>
              <div className="flex items-center gap-4">
                {/* صورة الحساب */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {(player as any).addedBy.accountName ? 
                      (player as any).addedBy.accountName.charAt(0).toUpperCase() : 
                      'A'
                    }
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* معلومات الحساب */}
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-lg">
                    {(player as any).addedBy.accountName || 'حساب غير محدد'}
                  </h4>
                  <p className="text-gray-600 mb-2">
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
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>تم الإضافة: {dayjs((player as any).addedBy.dateAdded).format('DD/MM/YYYY')}</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
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
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-purple-600 font-medium">عرض الحساب</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* الشخص المفوض بالتفاوض - مع إخفاء المعلومات الحساسة */}
        {player?.official_contact && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-orange-600" />
              الشخص المفوض بالتفاوض
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <User className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm">الاسم</h4>
                    <p className="text-xs text-gray-500">اسم الشخص المفوض</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">{player.official_contact.name || 'غير محدد'}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm">المنصب/الصفة</h4>
                    <p className="text-xs text-gray-500">المنصب أو الصفة القانونية</p>
                  </div>
                </div>
                <p className="text-lg font-bold text-gray-900">{player.official_contact.title || 'غير محدد'}</p>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Phone className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm">رقم الهاتف</h4>
                    <p className="text-xs text-gray-500">معلومات محجوبة</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                  <span className="text-xs text-red-600 font-medium">محجوب</span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Mail className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm">البريد الإلكتروني</h4>
                    <p className="text-xs text-gray-500">معلومات محجوبة</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                  <span className="text-xs text-red-600 font-medium">محجوب</span>
                </div>
              </div>
            </div>
            
            {/* تنبيه حول المعلومات المحجوبة */}
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-red-100 rounded">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">معلومات الاتصال محجوبة</p>
                  <p className="text-xs text-red-600">لحماية خصوصية اللاعب، تم إخفاء معلومات الاتصال الحساسة</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* معلومات الاتصال المحجوبة للاعب */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            معلومات الاتصال (محجوبة)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Phone className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm">رقم الهاتف</h4>
                  <p className="text-xs text-gray-500">معلومات محجوبة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">محجوب</span>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Mail className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 text-sm">البريد الإلكتروني</h4>
                  <p className="text-xs text-gray-500">معلومات محجوبة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-full h-8 bg-gray-200 rounded animate-pulse"></div>
                <span className="text-xs text-red-600 font-medium">محجوب</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">لماذا تم إخفاء هذه المعلومات؟</p>
                <p className="text-xs text-blue-600">لأن هذا اللاعب ينتمي لحساب آخر، تم إخفاء معلومات الاتصال لحماية الخصوصية</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // التعليم
  const renderEducation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard
          title="المستوى التعليمي"
          value={player?.education_level || 'غير محدد'}
          icon={GraduationCap}
          color="blue"
        />
        <DetailCard
          title="سنة التخرج"
          value={player?.graduation_year || 'غير محدد'}
          icon={Calendar}
          color="green"
        />
        <DetailCard
          title="التخصص"
          value={player?.degree || 'غير محدد'}
          icon={BookOpen}
          color="purple"
        />
      </div>

      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Languages className="w-5 h-5 text-yellow-600" />
          مستويات اللغات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DetailCard
            title="مستوى الإنجليزية"
            value={player?.english_level || 'غير محدد'}
            icon={Languages}
            color="blue"
          />
          <DetailCard
            title="مستوى العربية"
            value={player?.arabic_level || 'غير محدد'}
            icon={Languages}
            color="green"
          />
          <DetailCard
            title="مستوى الإسبانية"
            value={player?.spanish_level || 'غير محدد'}
            icon={Languages}
            color="orange"
          />
        </div>
      </div>
    </div>
  );

  // المعلومات الطبية
  const renderMedical = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard
          title="فصيلة الدم"
          value={player?.blood_type || 'غير محدد'}
          icon={HeartPulse}
          color="red"
        />
        <DetailCard
          title="الطول"
          value={player?.height ? `${player.height} سم` : 'غير محدد'}
          icon={Ruler}
          color="blue"
        />
        <DetailCard
          title="الوزن"
          value={player?.weight ? `${player.weight} كجم` : 'غير محدد'}
          icon={Weight}
          color="green"
        />
      </div>

      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-600" />
          الحالة الصحية
        </h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${player?.chronic_conditions ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {player?.chronic_conditions ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">أمراض مزمنة</h4>
              <p className="text-gray-600">{player?.chronic_conditions ? 'نعم' : 'لا'}</p>
            </div>
          </div>
          
          {player?.chronic_conditions && player?.chronic_details && (
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-2">تفاصيل الأمراض المزمنة</h4>
              <p className="text-gray-600">{player.chronic_details}</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-600" />
            الحساسية
          </h3>
          <p className="text-gray-700">{player?.allergies || 'لا توجد حساسية مسجلة'}</p>
        </div>
        
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Info className="w-5 h-5 text-pink-600" />
            ملاحظات طبية
          </h3>
          <p className="text-gray-700">{player?.medical_notes || 'لا توجد ملاحظات طبية'}</p>
        </div>
      </div>
    </div>
  );

  // المعلومات الرياضية
  const renderSports = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DetailCard
          title="المركز الأساسي"
          value={player?.primary_position || 'غير محدد'}
          icon={Target}
          color="blue"
        />
        <DetailCard
          title="المركز الثانوي"
          value={player?.secondary_position || 'غير محدد'}
          icon={Target}
          color="green"
        />
        <DetailCard
          title="القدم المفضلة"
          value={player?.preferred_foot || 'غير محدد'}
          icon={Target}
          color="purple"
        />
        <DetailCard
          title="سنوات الخبرة"
          value={player?.experience_years || 'غير محدد'}
          icon={Clock}
          color="orange"
        />
      </div>

      {player?.sports_notes && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-600" />
            ملاحظات رياضية
          </h3>
          <p className="text-gray-700">{player.sports_notes}</p>
        </div>
      )}

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-green-600" />
          الأندية السابقة
        </h3>
        <div className="space-y-2">
          {player?.club_history && player.club_history.length > 0 ? (
            player.club_history.map((club: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Trophy className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">
                  {typeof club === 'string' ? club : club.name}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">لا توجد أندية سابقة مسجلة</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // المهارات
  const renderSkills = () => (
    <div className="space-y-8">
      {/* المهارات الفنية */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600" />
          المهارات الفنية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(player?.technical_skills || {}).map(([skill, value]) => (
            <div key={skill} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">{skill}</span>
                <span className="text-sm font-bold text-blue-600">{value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(Number(value) / 5) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* المهارات البدنية */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-green-600" />
          المهارات البدنية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(player?.physical_skills || {}).map(([skill, value]) => (
            <div key={skill} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">{skill}</span>
                <span className="text-sm font-bold text-green-600">{value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(Number(value) / 5) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* المهارات الاجتماعية */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 text-yellow-600" />
          المهارات الاجتماعية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(player?.social_skills || {}).map(([skill, value]) => (
            <div key={skill} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700">{skill}</span>
                <span className="text-sm font-bold text-yellow-600">{value}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${(Number(value) / 5) * 100}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // الأهداف
  const renderObjectives = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(player?.objectives || {}).map(([objective, value]) => (
          <div key={objective} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className={`p-2 rounded-lg ${value ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {value ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <span className="font-semibold text-gray-700">{OBJECTIVES_LABELS[objective] || objective}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // الوسائط
  const renderMedia = () => (
    <div className="space-y-8">
      {/* الصور */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-purple-600" />
          الصور
        </h3>
        <div className="flex flex-wrap gap-4">
          {player?.profile_image && (
            <div className="relative">
              <img 
                src={typeof player.profile_image === 'string' 
                  ? player.profile_image 
                  : (player.profile_image as { url: string })?.url} 
                alt="الصورة الشخصية" 
                className="w-32 h-32 object-cover rounded-lg shadow-md border-2 border-purple-200" 
              />
              <div className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                رئيسية
              </div>
            </div>
          )}
          {player?.additional_images && player.additional_images.length > 0 && player.additional_images.map((img, idx) => (
            <img 
              key={idx} 
              src={typeof img === 'string' ? img : img.url} 
              alt={`صورة إضافية ${idx + 1}`} 
              className="w-24 h-24 object-cover rounded-lg shadow-md border border-gray-200" 
            />
          ))}
        </div>
      </div>

      {/* الفيديوهات */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          الفيديوهات
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {player?.videos && player.videos.length > 0 ? (
            player.videos.map((video, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <video 
                  src={video.url} 
                  controls 
                  className="w-full h-40 object-cover" 
                />
                <div className="p-3">
                  <p className="text-sm text-gray-600">فيديو {idx + 1}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex items-center justify-center p-8 text-gray-500">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>لا توجد فيديوهات</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // العقود
  const renderContracts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
          <div className={`p-2 rounded-lg ${player?.has_passport === 'yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {player?.has_passport === 'yes' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">جواز سفر</h4>
            <p className="text-gray-600">{player?.has_passport === 'yes' ? 'نعم' : 'لا'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
          <div className={`p-2 rounded-lg ${player?.currently_contracted === 'yes' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {player?.currently_contracted === 'yes' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">عقد حالياً</h4>
            <p className="text-gray-600">{player?.currently_contracted === 'yes' ? 'نعم' : 'لا'}</p>
          </div>
        </div>
      </div>

      {/* تاريخ العقود */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-blue-600" />
          تاريخ العقود
        </h3>
        <div className="space-y-2">
          {player?.contract_history && player.contract_history.length > 0 ? (
            player.contract_history.map((contract: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700">
                  {typeof contract === 'string' ? contract : `${contract.club} (${contract.from} - ${contract.to})`}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">لا يوجد عقود سابقة</span>
            </div>
          )}
        </div>
      </div>

      {/* تاريخ الوكلاء */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          تاريخ الوكلاء
        </h3>
        <div className="space-y-2">
          {player?.agent_history && player.agent_history.length > 0 ? (
            player.agent_history.map((agent: any, idx: number) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
                <Users className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-700">
                  {typeof agent === 'string' ? agent : `${agent.agent} (${agent.from} - ${agent.to})`}
                </span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm">
              <Info className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">لا يوجد وكلاء سابقون</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // تبديل المحتوى
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'personal':
        return renderPersonalInfo();
      case 'affiliation':
        return renderAffiliation();
      case 'education':
        return renderEducation();
      case 'medical':
        return renderMedical();
      case 'sports':
        return renderSports();
      case 'skills':
        return renderSkills();
      case 'objectives':
        return renderObjectives();
      case 'media':
        return renderMedia();
      case 'contracts':
        return renderContracts();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* شريط التبويبات المحسن */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
        <div className="flex flex-wrap gap-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
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

      {/* المحتوى */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PlayerReportView; 
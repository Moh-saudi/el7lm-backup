import React from 'react';
import {
  User,
  Calendar,
  MapPin,
  Flag,
  Target,
  Trophy,
  HeartPulse,
  Ruler,
  Weight,
  Award,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Users
} from 'lucide-react';

interface PlayerStatsCardsProps {
  player: any;
}

const PlayerStatsCards: React.FC<PlayerStatsCardsProps> = ({ player }) => {
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

  const statsCards = [
    {
      title: 'الاسم الكامل',
      value: player?.full_name || 'غير محدد',
      icon: User,
      color: 'blue',
      description: 'اسم اللاعب الكامل'
    },
    {
      title: 'العمر',
      value: (() => {
        const age = calculateAge(player?.birth_date);
        return age ? `${age} سنة` : 'غير محدد';
      })(),
      icon: Calendar,
      color: 'green',
      description: 'عمر اللاعب'
    },
    {
      title: 'الجنسية',
      value: player?.nationality || 'غير محدد',
      icon: Flag,
      color: 'purple',
      description: 'جنسية اللاعب'
    },
    {
      title: 'المدينة',
      value: player?.city || 'غير محدد',
      icon: MapPin,
      color: 'orange',
      description: 'مدينة اللاعب'
    },
    {
      title: 'المركز الأساسي',
      value: player?.primary_position || 'غير محدد',
      icon: Target,
      color: 'blue',
      description: 'المركز الأساسي للاعب'
    },
    {
      title: 'القدم المفضلة',
      value: player?.preferred_foot || 'غير محدد',
      icon: Target,
      color: 'green',
      description: 'القدم المفضلة للاعب'
    },
    {
      title: 'الطول',
      value: player?.height ? `${player.height} سم` : 'غير محدد',
      icon: Ruler,
      color: 'indigo',
      description: 'طول اللاعب'
    },
    {
      title: 'الوزن',
      value: player?.weight ? `${player.weight} كجم` : 'غير محدد',
      icon: Weight,
      color: 'pink',
      description: 'وزن اللاعب'
    },
    {
      title: 'سنوات الخبرة',
      value: player?.experience_years || 'غير محدد',
      icon: Clock,
      color: 'yellow',
      description: 'سنوات الخبرة'
    },
    {
      title: 'فصيلة الدم',
      value: player?.blood_type || 'غير محدد',
      icon: HeartPulse,
      color: 'red',
      description: 'فصيلة دم اللاعب'
    }
  ];

  const statusCards = [
    {
      title: 'جواز سفر',
      value: player?.has_passport === 'yes' ? 'نعم' : 'لا',
      icon: player?.has_passport === 'yes' ? CheckCircle : XCircle,
      color: player?.has_passport === 'yes' ? 'green' : 'red',
      description: 'هل يملك جواز سفر؟'
    },
    {
      title: 'عقد حالياً',
      value: player?.currently_contracted === 'yes' ? 'نعم' : 'لا',
      icon: player?.currently_contracted === 'yes' ? CheckCircle : XCircle,
      color: player?.currently_contracted === 'yes' ? 'green' : 'red',
      description: 'هل لديه عقد حالياً؟'
    }
  ];

  return (
    <div className="space-y-8">
      {/* البطاقات الأساسية */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          المعلومات الأساسية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 ease-out">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${card.color}-100 text-${card.color}-600`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm">{card.title}</h4>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* بطاقات الحالة */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Award className="w-5 h-5 text-green-600" />
          الحالة القانونية
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statusCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-500 ease-out">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg bg-${card.color}-100 text-${card.color}-600`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm">{card.title}</h4>
                    <p className="text-xs text-gray-500">{card.description}</p>
                  </div>
                </div>
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ملخص المهارات */}
      {player?.technical_skills && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-600" />
            ملخص المهارات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                المهارات الفنية
              </h4>
              <div className="space-y-3">
                {Object.entries(player.technical_skills).slice(0, 3).map(([skill, value]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{skill}</span>
                    <span className="font-bold text-blue-600">{value}/5</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-green-600" />
                المهارات البدنية
              </h4>
              <div className="space-y-3">
                {Object.entries(player.physical_skills || {}).slice(0, 3).map(([skill, value]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{skill}</span>
                    <span className="font-bold text-green-600">{value}/5</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-600" />
                المهارات الاجتماعية
              </h4>
              <div className="space-y-3">
                {Object.entries(player.social_skills || {}).slice(0, 3).map(([skill, value]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{skill}</span>
                    <span className="font-bold text-yellow-600">{value}/5</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerStatsCards; 

'use client';

import { PlayerFormData } from '@/types/player';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { User } from 'firebase/auth';

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

export default function PlayerProfile() {
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [player, setPlayer] = useState<PlayerFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        console.log(t('profile.loading.start'));
        const response = await fetch('/api/player/profile');

        if (!response.ok) {
          const errorData = await response.json();
          console.error(t('profile.errors.response'), errorData);
          throw new Error(errorData.error || t('profile.errors.fetchFailed'));
        }

        const data = await response.json();
        console.log(t('profile.loading.success'), data);

        if (!data) {
          throw new Error(t('profile.errors.noData'));
        }

        setPlayer(data);
      } catch (err) {
        console.error(t('profile.errors.fetch'), err);
        setError(err instanceof Error ? err.message : t('profile.errors.generic'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayerData();
  }, [t]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('profile.loading.data')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-2">{t('profile.errors.title')}</h2>
          <p>{error}</p>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {t('profile.errors.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <h2 className="text-2xl font-bold mb-2">{t('profile.noData.title')}</h2>
          <p>{t('profile.noData.message')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-16 left-8">
              <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                {player.profile_image_url ? (
                  <Image
                    src={player.profile_image_url}
                    alt={player.full_name || t('profile.image.alt')}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                    <span className="text-4xl text-gray-400">👤</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-8 px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('profile.sections.personal')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.fullName')}</p>
                    <p className="font-medium">{player.full_name || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.birthDate')}</p>
                    <p className="font-medium">
                      {player.birth_date ? new Date(player.birth_date).toLocaleDateString('ar-SA') : t('profile.notAvailable')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.age')}</p>
                    <p className="font-medium">
                      {(() => {
                        const age = calculateAge(player.birth_date);
                        return age ? `${age} ${t('profile.fields.years')}` : t('profile.notAvailable');
                      })()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.nationality')}</p>
                    <p className="font-medium">{player.nationality || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.city')}</p>
                    <p className="font-medium">{player.city || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.country')}</p>
                    <p className="font-medium">{player.country || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.currentStatus')}</p>
                    <p className="font-medium">{player.currently_contracted === 'yes' ? t('profile.status.contracted') : t('profile.status.notContracted')}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('profile.sections.contact')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.phone')}</p>
                    <p className="font-medium">{player.phone || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.whatsapp')}</p>
                    <p className="font-medium">{player.whatsapp || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.email')}</p>
                    <p className="font-medium">{player.email || t('profile.notAvailable')}</p>
                  </div>
                </div>
              </div>

              {/* Sports Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('profile.sections.sports')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.primaryPosition')}</p>
                    <p className="font-medium">{player.primary_position || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.secondaryPosition')}</p>
                    <p className="font-medium">{player.secondary_position || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.preferredFoot')}</p>
                    <p className="font-medium">{player.preferred_foot || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.experienceYears')}</p>
                    <p className="font-medium">{player.experience_years || t('profile.notAvailable')}</p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('profile.sections.medical')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.bloodType')}</p>
                    <p className="font-medium">{player.blood_type || t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.height')}</p>
                    <p className="font-medium">{player.height ? `${player.height} ${t('profile.units.cm')}` : t('profile.notAvailable')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{t('profile.fields.weight')}</p>
                    <p className="font-medium">{player.weight ? `${player.weight} ${t('profile.units.kg')}` : t('profile.notAvailable')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="mt-8 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('profile.sections.skills')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Technical Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">{t('profile.skills.technical')}</h3>
                  <div className="space-y-3">
                    {Object.entries(player.technical_skills || {}).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Physical Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">{t('profile.skills.physical')}</h3>
                  <div className="space-y-3">
                    {Object.entries(player.physical_skills || {}).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Social Skills */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">{t('profile.skills.social')}</h3>
                  <div className="space-y-3">
                    {Object.entries(player.social_skills || {}).map(([skill, value]) => (
                      <div key={skill}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill}</span>
                          <span className="text-sm text-gray-500">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { memo } from 'react';
import { Card } from "@/components/ui/card";
import { Eye, Heart, Mail, UserCheck } from 'lucide-react';
import Link from 'next/link';

interface StatItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subText: string;
  change: string;
  color: string;
  href?: string;
}

interface PlayerStatsProps {
  userData: Record<string, unknown>;
  loading: boolean;
}

// مكون بطاقة الإحصائية محسن
const StatsCard = memo(({ stat }: { stat: StatItem }) => {
  const CardContent = (
    <div className="relative p-6 transition-all duration-500 ease-out bg-white shadow-sm rounded-2xl hover:shadow-lg group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-xl ${stat.color} bg-opacity-20 flex items-center justify-center`}>
          <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
        </div>
        <span className="px-2 py-1 text-sm bg-gray-100 rounded-full">{stat.change}</span>
      </div>
      <div className="mt-4">
        <h3 className="text-sm text-gray-600">{stat.title}</h3>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold">{stat.value}</p>
          <span className="text-sm text-gray-500">{stat.subText}</span>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1 transition-opacity duration-500 ease-out opacity-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent group-hover:opacity-100"></div>
    </div>
  );

  if (stat.href) {
    return (
      <Link href={stat.href}>
        {CardContent}
      </Link>
    );
  }

  return CardContent;
});

StatsCard.displayName = 'StatsCard';

// البيانات الافتراضية للإحصائيات
const getPlayerStats = (userData: Record<string, unknown>): StatItem[] => [
  {
    icon: Eye,
    title: "المشاهدات",
    value: userData.views?.toString() || "1,234",
    subText: "مشاهدات الملف",
    change: "+12%",
    color: "bg-blue-500",
    href: "/dashboard/player/stats"
  },
  {
    icon: Mail,
    title: "الرسائل",
    value: userData.messages?.toString() || "48",
    subText: "رسالة جديدة",
    change: "+8%",
    color: "bg-violet-500",
    href: "/dashboard/messages"
  },
  {
    icon: Heart,
    title: "الإعجابات",
    value: userData.likes?.toString() || "2.1K",
    subText: "إعجاب",
    change: "+5%",
    color: "bg-pink-500"
  },
  {
    icon: UserCheck,
    title: "المتابعون",
    value: userData.followers?.toString() || "856",
    subText: "متابع",
    change: "+12%",
    color: "bg-green-500"
  }
];

const PlayerStats = memo(({ userData, loading }: PlayerStatsProps) => {
  const stats = getPlayerStats(userData);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="p-6 bg-gray-200 rounded-2xl h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شبكة الإحصائيات */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} stat={stat} />
        ))}
      </div>

      {/* بطاقة تحفيزية */}
      <Card className="p-6 border border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">عزز ملفك الشخصي</h3>
            <p className="text-gray-600">أضف فيديوهات عالية الجودة تظهر مهاراتك المميزة لجذب اهتمام الأندية والوكلاء</p>
          </div>
          <Link
            href="/dashboard/player/videos"
            className="px-4 py-2 text-white transition-colors duration-200 bg-green-600 rounded-lg hover:bg-green-700"
          >
            ابدأ الآن
          </Link>
        </div>
      </Card>
    </div>
  );
});

PlayerStats.displayName = 'PlayerStats';

export default PlayerStats; 

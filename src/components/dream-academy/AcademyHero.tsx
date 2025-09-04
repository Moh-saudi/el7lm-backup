'use client';

import React from 'react';
import { GraduationCap, Sparkles, HeartHandshake } from 'lucide-react';

export default function AcademyHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.3),_transparent_40%),_radial-gradient(circle_at_80%_30%,_rgba(255,255,255,0.2),_transparent_40%)]" />
      <div className="relative px-4 py-8 sm:px-6 md:px-10 md:py-16">
        <div className="flex items-start gap-3 sm:gap-4 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
              أكاديمية الحلم
            </h1>
            <p className="mt-2 text-white/90 text-sm sm:text-base md:text-lg">
              تعلّم اللغات والمهارات اللازمة للاحتراف الرياضي — محتوى مختار وخبراء متخصصون في كرة القدم
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
          <div className="rounded-xl bg-white/10 backdrop-blur p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <div>
              <div className="font-semibold">محتوى حديث ومتجدد</div>
              <div className="text-white/80">مقاطع مختارة بعناية لاحتياجات اللاعب</div>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-4 flex items-center gap-3">
            <HeartHandshake className="w-5 h-5" />
            <div>
              <div className="font-semibold">جلسات خاصة مدفوعة</div>
              <div className="text-white/80">مع مدرّبين ومتخصصين في كرة القدم</div>
            </div>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur p-4 flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <div>
              <div className="font-semibold">لغة الملعب</div>
              <div className="text-white/80">مصطلحات وتطبيقات عملية داخل وخارج الملعب</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



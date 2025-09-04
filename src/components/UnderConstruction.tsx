"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Rocket, Construction, ArrowLeft } from "lucide-react";

export default function UnderConstruction() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] bg-gradient-to-br from-blue-50 to-purple-100 rounded-xl shadow-lg p-8 mx-auto max-w-xl mt-12">
      <div className="flex flex-col items-center mb-6">
        <Rocket className="w-16 h-16 text-purple-500 animate-bounce mb-2" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">🚧 قريباً جداً!</h1>
        <p className="text-lg text-gray-600 mb-1">هذه الصفحة تحت التطوير حالياً</p>
        <p className="text-base text-blue-700 font-semibold mb-2">نحن نعمل بكل حماس لنقدم لك تجربة أفضل وأقوى!</p>
        <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
      </div>
      <div className="text-center text-gray-700 mb-6">
        <p>ترقبوا المميزات الجديدة قريباً جداً 🚀</p>
        <p>فريق <span className="font-bold text-purple-700">الحلم (el7lm)</span> يعمل لأجلكم بلا توقف!</p>
      </div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg shadow transition-all text-lg"
      >
        <ArrowLeft className="w-5 h-5" /> العودة للصفحة السابقة
      </button>
    </div>
  );
} 

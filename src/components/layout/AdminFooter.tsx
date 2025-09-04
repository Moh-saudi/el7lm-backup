'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function AdminFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-4 mt-auto shadow-lg" style={{ direction: 'rtl' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        {/* الشعار والاسم */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <img 
            src="/el7lm-logo.png" 
            alt="شعار الحلم" 
            className="h-10 w-10 drop-shadow-sm"
          />
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 dark:text-gray-200 text-lg">الحلم</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">© {year}</span>
          </div>
        </div>

        {/* روابط التنقل */}
        <div className="flex gap-6 text-sm">
          <Link 
            href="/about" 
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            من نحن
          </Link>
          <Link 
            href="/contact" 
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            اتصل بنا
          </Link>
          <Link 
            href="/privacy" 
            className="text-gray-500 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 transition-colors font-medium"
          >
            الخصوصية
          </Link>
        </div>

        {/* أيقونات السوشيال ميديا */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <a 
            href="https://www.facebook.com/profile.php?id=61577797509887" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="فيسبوك"
          >
            <img 
              src="/images/medialogo/facebook.svg" 
              alt="فيسبوك" 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.instagram.com/hagzzel7lm/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors p-2 rounded-full hover:bg-pink-50 dark:hover:bg-pink-900/20"
            title="إنستغرام"
          >
            <img 
              src="/images/medialogo/instagram.svg" 
              alt="إنستغرام" 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.linkedin.com/company/hagzz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="لينكد إن"
          >
            <img 
              src="/images/medialogo/linkedin.svg" 
              alt="لينكد إن" 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.tiktok.com/@hagzz25?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800"
            title="تيك توك"
          >
            <img 
              src="/images/medialogo/tiktok.svg" 
              alt="تيك توك" 
              width={22} 
              height={22} 
              className="drop-shadow-sm"
            />
          </a>
        </div>
      </div>
    </footer>
  );
} 

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [user] = useAuthState(auth);
  const [userProfileImage, setUserProfileImage] = useState('/default-avatar.png');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'players', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData?.profile_image) {
              if (typeof userData.profile_image === 'object' && userData.profile_image.url) {
                setUserProfileImage(userData.profile_image.url);
              } else if (typeof userData.profile_image === 'string') {
                setUserProfileImage(userData.profile_image);
              }
            } else {
              setUserProfileImage('/default-avatar.png');
            }
            let displayName = '';
            if (userData?.full_name && userData.full_name !== 'undefined undefined') {
              displayName = userData.full_name;
            } else if (userData?.firstName && userData?.lastName) {
              displayName = `${userData.firstName} ${userData.lastName}`.trim();
            } else if (userData?.name) {
              displayName = userData.name;
            }
            setUserName(displayName || 'اللاعب');
          }
        } catch (error) {
          setUserProfileImage('/default-avatar.png');
        }
      };
      fetchUserData();
    }
  }, [user]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-white to-gray-50 border-t border-gray-200 py-4 shadow-lg" style={{ direction: 'rtl' }}>
      <div className="flex items-center justify-between px-4 mx-auto max-w-7xl">
        {/* Logo and Company Info */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <Image 
                          src="/el7lm-logo.png" 
            alt="شعار الحلم" 
            width={48} 
            height={48} 
            className="h-12 w-auto drop-shadow-sm" 
            priority={true}
            loading="eager"
          />
          <div className="flex flex-col">
            <span className="font-bold text-gray-800 text-lg">الحلم</span>
            <span className="text-sm text-gray-600">
              © {currentYear}
            </span>
          </div>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-6 space-x-reverse">
          <Link 
            href="/about" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            من نحن
          </Link>
          <Link 
            href="/contact" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            اتصل بنا
          </Link>
          <Link 
            href="/privacy" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            الخصوصية
          </Link>
        </div>

        {/* Social Media Links */}
        <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
          <a 
            href="https://www.facebook.com/profile.php?id=61577797509887" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
            title="فيسبوك"
          >
            <img 
              src="/images/medialogo/facebook.svg" 
              alt="فيسبوك" 
              width={24} 
              height={24} 
              className="md:w-7 md:h-7 drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.instagram.com/hagzzel7lm?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors p-2 rounded-full hover:bg-pink-50"
            title="إنستغرام"
          >
            <img 
              src="/images/medialogo/instagram.svg" 
              alt="إنستغرام" 
              width={24} 
              height={24} 
              className="md:w-7 md:h-7 drop-shadow-sm"
            />
          </a>
          <a 
            href="https://www.linkedin.com/company/el7lm" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50"
            title="لينكد إن"
          >
            <img 
              src="/images/medialogo/linkedin.svg" 
              alt="لينكد إن" 
              width={24} 
              height={24} 
              className="md:w-7 md:h-7 drop-shadow-sm"
            />
          </a>
        </div>
      </div>
    </footer>
  );
} 

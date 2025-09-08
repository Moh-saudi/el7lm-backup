'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import Link from 'next/link';

export default function NotificationIcon() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const notificationsRef = collection(db, 'admin_notifications');
      const q = query(
        notificationsRef,
        where('isRead', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      setUnreadCount(snapshot.docs.length);
    } catch (error) {
      console.error('خطأ في جلب عدد الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // تحديث العدد كل 30 ثانية
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <Link href="/dashboard/admin/notifications" className="p-2 text-gray-600 hover:text-gray-900 transition-colors">
          🔔
        </Link>
      </div>
    );
  }

  return (
    <div className="relative">
      <Link 
        href="/dashboard/admin/notifications" 
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative block"
        title="الإشعارات"
      >
        <span className="text-lg sm:text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}

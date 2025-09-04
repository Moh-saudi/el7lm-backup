'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  Eye,
  Search,
  Users,
  Trophy,
  TrendingUp,
  X,
  Check,
  Star,
  Zap,
  Heart,
  Target,
  Rocket,
  Crown,
  Diamond
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import { toast } from 'sonner';

interface SmartNotification {
  id: string;
  userId: string;
  viewerId: string;
  viewerName: string;
  viewerType: string;
  type: 'profile_view' | 'search_result' | 'connection_request' | 'achievement' | 'trending';
  title: string;
  message: string;
  emoji: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  metadata?: {
    viewCount?: number;
    searchTerm?: string;
    achievementType?: string;
    trendingRank?: number;
  };
  createdAt: any;
  expiresAt?: any;
}

const getNotificationIcon = (type: string, emoji: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'profile_view': <Eye className="h-5 w-5 text-blue-600" />,
    'search_result': <Search className="h-5 w-5 text-green-600" />,
    'connection_request': <Users className="h-5 w-5 text-purple-600" />,
    'achievement': <Trophy className="h-5 w-5 text-yellow-600" />,
    'trending': <TrendingUp className="h-5 w-5 text-red-600" />
  };

  return iconMap[type] || <Bell className="h-5 w-5 text-gray-600" />;
};

const getPriorityColor = (priority: string) => {
  const colorMap: Record<string, string> = {
    'low': 'bg-gray-100 text-gray-800',
    'medium': 'bg-blue-100 text-blue-800',
    'high': 'bg-orange-100 text-orange-800',
    'urgent': 'bg-red-100 text-red-800'
  };
  return colorMap[priority] || 'bg-gray-100 text-gray-800';
};

const getTypeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    'profile_view': 'bg-blue-50 border-blue-200',
    'search_result': 'bg-green-50 border-green-200',
    'connection_request': 'bg-purple-50 border-purple-200',
    'achievement': 'bg-yellow-50 border-yellow-200',
    'trending': 'bg-red-50 border-red-200'
  };
  return colorMap[type] || 'bg-gray-50 border-gray-200';
};

const SmartNotifications: React.FC = () => {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب الإشعارات
  useEffect(() => {
    if (!user || !userData) return;

    // استخدام استعلام بسيط لتجنب مشكلة الـ Index
    const notificationsQuery = query(
      collection(db, 'smart_notifications'),
      where('userId', '==', user.uid),
      limit(20)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SmartNotification[];
      
      // ترتيب البيانات محلياً بدلاً من ترتيبها في الاستعلام
      const sortedNotifications = notificationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
      setLoading(false);
    }, (error) => {
      console.error('خطأ في جلب الإشعارات:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'smart_notifications', notificationId), {
        isRead: true
      });
      toast.success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
      toast.error('حدث خطأ في تحديث الإشعار');
    }
  };

  // تحديد جميع الإشعارات كمقروءة
  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'smart_notifications', notification.id), {
          isRead: true
        })
      );
      
      await Promise.all(updatePromises);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    } catch (error) {
      console.error('خطأ في تحديث جميع الإشعارات:', error);
      toast.error('حدث خطأ في تحديث الإشعارات');
    }
  };

  const formatNotificationTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return 'الآن';
    }
  };

  const getNotificationEmoji = (emoji: string) => {
    return emoji || '🔔';
  };

  if (!user || !userData) {
    return null;
  }

  return (
    <div className="relative">
      {/* زر الإشعارات */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
            <span className="font-semibold text-gray-900">الإشعارات الذكية</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
              >
                تحديد الكل كمقروء
              </Button>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              </div>
              <p className="text-sm font-medium">جاري تحميل الإشعارات...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-medium mb-1">لا توجد إشعارات جديدة</p>
              <p className="text-xs text-gray-400">ستظهر هنا عندما يهتم بك أحد</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-0">
                <Card className={`w-full border-0 shadow-none ${getTypeColor(notification.type)} ${!notification.isRead ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* أيقونة الإشعار */}
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <span className="text-lg">{getNotificationEmoji(notification.emoji)}</span>
                        </div>
                      </div>
                      
                      {/* محتوى الإشعار */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-semibold ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                              {notification.priority === 'urgent' ? 'مهم' : 
                               notification.priority === 'high' ? 'عالي' : 
                               notification.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                        
                        <p className={`text-xs ${!notification.isRead ? 'text-blue-700' : 'text-gray-600'} mb-2`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{notification.viewerName}</span>
                            {notification.viewerType !== 'system' && (
                              <>
                                <span>•</span>
                                <span>{notification.viewerType}</span>
                              </>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                            
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="h-6 w-6 p-0"
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </DropdownMenuItem>
            ))
          )}
          
          {notifications.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href={userData?.accountType === 'admin' ? '/dashboard/admin/notifications' : '/dashboard'}
                  className="text-center text-blue-600 hover:text-blue-700"
                >
                  عرض جميع الإشعارات
                </Link>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SmartNotifications; 

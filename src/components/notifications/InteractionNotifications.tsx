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
  MessageSquare,
  X,
  Check,
  Star,
  Zap,
  Heart,
  Target,
  Rocket,
  Crown,
  Diamond,
  TrendingUp,
  UserCheck,
  Building2,
  GraduationCap,
  Phone,
  Shield
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
import { InteractionNotification } from '@/lib/notifications/interaction-notifications';

const InteractionNotifications: React.FC = () => {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<InteractionNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // جلب الإشعارات
  useEffect(() => {
    console.log('🔍 بدء جلب الإشعارات:', { user: !!user, userData: !!userData, userId: user?.uid });
    
    if (!user || !userData) {
      console.log('⚠️ لا يمكن جلب الإشعارات - بيانات المستخدم غير متوفرة');
      return;
    }

    const notificationsQuery = query(
      collection(db, 'interaction_notifications'),
      where('userId', '==', user.uid),
      limit(20)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InteractionNotification[];
      
      console.log('📊 تم جلب الإشعارات:', { 
        count: notificationsData.length, 
        unread: notificationsData.filter(n => !n.isRead).length 
      });
      
      // ترتيب البيانات محلياً
      const sortedNotifications = notificationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
      
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.isRead).length);
      setLoading(false);
    }, (error) => {
      console.error('❌ خطأ في جلب الإشعارات:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  // تحديد الإشعار كمقروء
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'interaction_notifications', notificationId), {
        isRead: true
      });
      toast.success('تم تحديد الإشعار كمقروء');
    } catch (error) {
      console.error('خطأ في تحديث حالة الإشعار:', error);
      toast.error('حدث خطأ في تحديث الإشعار');
    }
  };

  // الحصول على أيقونة الإشعار
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'profile_view':
        return <Eye className="w-5 h-5 text-blue-600" />;
      case 'search_result':
        return <Search className="w-5 h-5 text-green-600" />;
      case 'connection_request':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'message_sent':
        return <MessageSquare className="w-5 h-5 text-orange-600" />;
      case 'follow':
        return <Heart className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // الحصول على لون الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // تنسيق الوقت
  const formatNotificationTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return 'الآن';
    }
  };

  // الحصول على أيقونة نوع الحساب
  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'club':
        return <Building2 className="w-4 h-4" />;
      case 'academy':
        return <GraduationCap className="w-4 h-4" />;
      case 'agent':
        return <Phone className="w-4 h-4" />;
      case 'trainer':
        return <UserCheck className="w-4 h-4" />;
      case 'player':
        return <Users className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('🔔 عرض مكون الإشعارات:', { 
    notificationsCount: notifications.length, 
    unreadCount, 
    isOpen 
  });

  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>الإشعارات التفاعلية</span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} جديد
              </Badge>
            )}
          </DropdownMenuLabel>
          
          <DropdownMenuSeparator />
          
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">لا توجد إشعارات جديدة</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="p-0">
                <Card className={`w-full border-l-4 ${getPriorityColor(notification.priority)} ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{notification.emoji}</span>
                          <h4 className="font-semibold text-sm truncate">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {getAccountTypeIcon(notification.viewerAccountType)}
                            <span>{notification.viewerName}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                            
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  markAsRead(notification.id!);
                                }}
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
                <Link href={`/dashboard/${userData?.accountType || 'player'}/notifications`} className="text-center text-blue-600 hover:text-blue-800">
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

export default InteractionNotifications; 

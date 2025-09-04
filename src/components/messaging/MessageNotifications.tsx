'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  MessageSquare, 
  X,
  Users,
  Building2,
  GraduationCap,
  UserCheck,
  Phone
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

interface MessageNotification {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  message: string;
  timestamp: any;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantTypes: Record<string, string>;
  unreadCount: Record<string, number>;
  lastMessage: string;
  lastMessageTime: any;
}

const USER_TYPES = {
  club: { name: 'نادي', icon: Building2, color: 'text-green-600' },
  academy: { name: 'أكاديمية', icon: GraduationCap, color: 'text-purple-600' },
  trainer: { name: 'مدرب', icon: UserCheck, color: 'text-blue-600' },
  agent: { name: 'وكيل', icon: Phone, color: 'text-orange-600' },
  player: { name: 'لاعب', icon: Users, color: 'text-gray-600' }
};

// Add getUserDisplayName function for consistent naming
const getUserDisplayName = (userData: any, userType: string) => {
  if (!userData) return 'مستخدم غير معروف';
  
  // Handle player names with special care
  if (userType === 'player') {
    const fullName = [
      userData.firstName,
      userData.middleName,
      userData.lastName
    ].filter(Boolean).join(' ');
    return fullName || userData.name || 'لاعب';
  }

  // For organizations, use organization name if available
  if (['club', 'academy', 'agent'].includes(userType) && userData.organizationName) {
    return userData.organizationName;
  }

  // For trainers, use full name if available
  if (userType === 'trainer') {
    const fullName = [
      userData.firstName,
      userData.lastName
    ].filter(Boolean).join(' ');
    return fullName || userData.name || 'مدرب';
  }

  // Fallback to name field or type-specific default
  return userData.name || USER_TYPES[userType as keyof typeof USER_TYPES]?.name || 'مستخدم';
};

const MessageNotifications: React.FC = () => {
  const { user, userData } = useAuth();
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [totalUnread, setTotalUnread] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // جلب المحادثات والرسائل غير المقروءة
  useEffect(() => {
    if (!user || !userData) return;

    // جلب المحادثات
    let conversationsQuery = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    );

    // إذا كان المستخدم أدمن، اجلب جميع المحادثات
    if (userData.accountType === 'admin') {
      conversationsQuery = query(
        collection(db, 'conversations')
      );
    } else {
      // للمستخدمين العاديين، اجلب محادثاتهم فقط
      conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
    }

    const conversationsUnsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      // ترتيب المحادثات محلياً
      const sortedConversations = conversationsData.sort((a, b) => {
        const timeA = a.lastMessageTime?.toDate?.() || new Date(0);
        const timeB = b.lastMessageTime?.toDate?.() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });
      
      setConversations(sortedConversations);
      
      // حساب العدد الإجمالي للرسائل غير المقروءة
      const totalUnreadCount = sortedConversations.reduce((total, conv) => {
        return total + (conv.unreadCount[user.uid] || 0);
      }, 0);
      
      setTotalUnread(totalUnreadCount);
    });

    // جلب الرسائل غير المقروءة
    const messagesQuery = query(
      collection(db, 'messages'),
      where('receiverId', '==', user.uid),
      where('isRead', '==', false),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MessageNotification[];
      
      setNotifications(messagesData);
    });

    return () => {
      conversationsUnsubscribe();
      messagesUnsubscribe();
    };
  }, [user, userData]);

  const formatNotificationTime = (timestamp: any) => {
    try {
      const date = timestamp?.toDate?.() || new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return 'الآن';
    }
  };

  const getMessagesPath = () => {
    return '/dashboard/messages';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 hover:bg-red-600 text-white"
            >
              {totalUnread > 99 ? '99+' : totalUnread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        <DropdownMenuLabel className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <span className="font-semibold text-gray-900">الرسائل الجديدة</span>
          {totalUnread > 0 && (
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
              {totalUnread} جديد
            </Badge>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {notifications.length > 0 ? (
          <>
            <div className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => {
                const Icon = USER_TYPES[notification.senderType as keyof typeof USER_TYPES]?.icon || MessageSquare;
                const displayName = getUserDisplayName(notification, notification.senderType);
                
                return (
                  <DropdownMenuItem key={notification.id} className="p-0">
                    <Link 
                      href={getMessagesPath()} 
                      className="flex items-start gap-3 w-full p-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full shadow-sm">
                        <Icon className="h-4 w-4 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold truncate text-gray-900">
                            {displayName}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatNotificationTime(notification.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mt-1 leading-relaxed">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs bg-white">
                            {USER_TYPES[notification.senderType as keyof typeof USER_TYPES]?.name}
                          </Badge>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="p-0">
              <Link 
                href={getMessagesPath()} 
                className="w-full px-3 py-2 text-center text-sm text-blue-600 hover:text-blue-700 font-medium bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all"
                onClick={() => setIsOpen(false)}
              >
                عرض جميع الرسائل
              </Link>
            </DropdownMenuItem>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium mb-1">لا توجد رسائل جديدة</p>
            <p className="text-xs text-gray-400">ستظهر هنا عندما تصل رسائل جديدة</p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageNotifications; 

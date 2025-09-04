import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, User, Clock, Check, CheckCheck } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot, orderBy, limit, writeBatch } from 'firebase/firestore';
import { UnifiedNotificationService } from '@/lib/notifications/unified-notification-service';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'file' | 'system';
  senderName: string;
  senderAvatar?: string;
  priority: 'low' | 'medium' | 'high';
}

interface MessageStats {
  total: number;
  unread: number;
  sent: number;
  received: number;
  urgent: number;
  today: number;
}

export default function EnhancedMessageButton() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({
    total: 0,
    unread: 0,
    sent: 0,
    received: 0,
    urgent: 0,
    today: 0
  });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // جلب الرسائل من Firebase
  useEffect(() => {
    if (!user?.uid) return;

    const messagesRef = collection(db, 'messages');
    
    // استخدام استعلام بدون ترتيب لتجنب مشاكل Firebase Indexing
    const q = query(
      messagesRef,
      where('receiverId', '==', user.uid),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      const newStats: MessageStats = {
        total: 0,
        unread: 0,
        sent: 0,
        received: 0,
        urgent: 0,
        today: 0
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      snapshot.forEach((doc) => {
        const data = doc.data();
        const message: Message = {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.read || false,
          type: data.type || 'text',
          senderName: data.senderName || 'مستخدم غير معروف',
          senderAvatar: data.senderAvatar,
          priority: data.priority || 'medium'
        };

        msgs.push(message);
        newStats.total++;
        
        if (!message.read) {
          newStats.unread++;
        }

        if (message.senderId === user.uid) {
          newStats.sent++;
        } else {
          newStats.received++;
        }

        if (message.priority === 'high') {
          newStats.urgent++;
        }

        if (message.timestamp >= today) {
          newStats.today++;
        }
      });

      // ترتيب البيانات يدوياً لتجنب مشاكل Firebase Indexing
      const sortedMsgs = msgs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      // إضافة بيانات تجريبية إذا لم تكن هناك رسائل
      if (sortedMsgs.length === 0 && user.accountType === 'trainer') {
        const demoMessages: Message[] = [
          {
            id: 'demo-msg-1',
            senderId: 'admin-1',
            receiverId: user.uid,
            content: 'مرحباً! يرجى مراجعة جدول التدريب الأسبوعي الجديد',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 دقيقة مضت
            read: false,
            type: 'text',
            senderName: 'مدير الأكاديمية',
            priority: 'high'
          },
          {
            id: 'demo-msg-2',
            senderId: user.uid,
            receiverId: 'player-1',
            content: 'تم إرسال البرنامج التدريبي الجديد للاعب محمد',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // ساعة مضت
            read: true,
            type: 'text',
            senderName: 'أنت',
            priority: 'medium'
          },
          {
            id: 'demo-msg-3',
            senderId: 'coach-1',
            receiverId: user.uid,
            content: 'ممتاز! البرنامج التدريبي يعمل بشكل جيد مع اللاعبين',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 ساعات مضت
            read: false,
            type: 'text',
            senderName: 'المدرب أحمد',
            priority: 'medium'
          }
        ];

        sortedMsgs.push(...demoMessages);
        newStats.total = 3;
        newStats.unread = 2;
        newStats.sent = 1;
        newStats.received = 2;
        newStats.urgent = 1;
        newStats.today = 2;
      }

      setMessages(sortedMsgs);
      setStats(newStats);
      setLoading(false);
    }, (error) => {
      console.error('خطأ في جلب الرسائل:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // تحديث حالة القراءة
  const markAsRead = async (messageId: string) => {
    try {
      await UnifiedNotificationService.markMessageAsRead(messageId);
    } catch (error) {
      console.error('خطأ في تحديث حالة القراءة:', error);
    }
  };

  // تحديث جميع الرسائل كمقروءة
  const markAllAsRead = async () => {
    try {
      await UnifiedNotificationService.markAllMessagesAsRead(user.uid);
    } catch (error) {
      console.error('خطأ في تحديث جميع الرسائل:', error);
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'file':
        return '📎';
      case 'system':
        return '⚙️';
      default:
        return '💬';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950';
      default:
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
    }
  };

  const getReadStatusIcon = (read: boolean, isSender: boolean) => {
    if (!isSender) return null;
    
    if (read) {
      return <CheckCheck className="w-3 h-3 text-blue-500" />;
    } else {
      return <Check className="w-3 h-3 text-gray-400" />;
    }
  };

  const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <MessageCircle className="w-6 h-6" />
        {stats.unread > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
          >
            {stats.unread > 99 ? '99+' : stats.unread}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[1000] max-h-[80vh] overflow-hidden">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">الرسائل</CardTitle>
                <div className="flex items-center gap-2">
                  {stats.unread > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      تحديد الكل كمقروء
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* إحصائيات سريعة */}
              <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                <span>إجمالي: {stats.total}</span>
                <span>غير مقروء: {stats.unread}</span>
                <span>مرسل: {stats.sent}</span>
                <span>مستلم: {stats.received}</span>
                <span>عاجل: {stats.urgent}</span>
                <span>اليوم: {stats.today}</span>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                    <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                    <p>لا توجد رسائل جديدة</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((message, index) => {
                      const isSender = message.senderId === user?.uid;
                      return (
                        <div key={message.id}>
                          <div
                            className={`p-4 border-l-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              !message.read && !isSender ? 'bg-orange-50 dark:bg-orange-950' : ''
                            } ${getPriorityColor(message.priority)}`}
                            onClick={() => {
                              if (!message.read && !isSender) {
                                markAsRead(message.id);
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={message.senderAvatar} />
                                <AvatarFallback>
                                  {message.senderName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                      {message.senderName}
                                    </h4>
                                    <span className="text-xs">
                                      {getMessageIcon(message.type)}
                                    </span>
                                    {getReadStatusIcon(message.read, isSender)}
                                  </div>
                                  {!message.read && !isSender && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  )}
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {truncateContent(message.content)}
                                </p>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(message.timestamp, { 
                                      addSuffix: true, 
                                      locale: ar 
                                    })}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {message.priority === 'high' && (
                                      <Badge variant="destructive" className="text-xs">
                                        عاجل
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="text-xs">
                                      {isSender ? 'مرسل' : 'مستلم'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < messages.length - 1 && <Separator />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

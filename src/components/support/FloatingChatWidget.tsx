'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { usePathname } from 'next/navigation';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  Headphones,
  User,
  Clock,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale/ar';

interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  message: string;
  timestamp: any;
  isRead: boolean;
  attachments?: string[];
}

interface SupportConversation {
  id: string;
  userId: string;
  userName: string;
  userType: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'general' | 'bug_report' | 'feature_request';
  lastMessage: string;
  lastMessageTime: any;
  unreadCount: number;
  assignedTo?: string;
  createdAt: any;
  updatedAt: any;
}

const FloatingChatWidget: React.FC = () => {
  const { user, userData } = useAuth();
  const pathname = usePathname();
  
  console.log('🔧 FloatingChatWidget - Component loaded', { 
    pathname, 
    user: !!user, 
    userData: !!userData,
    accountType: userData?.accountType 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [category, setCategory] = useState<string>('general');
  const [priority, setPriority] = useState<string>('medium');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // تحديد الصفحات التي يجب إخفاء الأيقونة منها
  const hiddenPages = [
    '/auth/login',
    '/auth/register', 
    '/admin/login',
    '/admin/login-advanced',
    '/admin/login-new',
    '/', // الصفحة الرئيسية (landing page)
    '/about',
    '/contact',
    '/privacy'
  ];

  // فحص إذا كان المسار الحالي يجب إخفاء الأيقونة منه
  const shouldHideWidget = () => {
    // إخفاء الأيقونة من الصفحات المحددة
    if (hiddenPages.includes(pathname)) return true;
    
    // إخفاء الأيقونة من جميع صفحات الأدمن (لأن لديهم صفحة دعم فني خاصة)
    if (pathname.startsWith('/dashboard/admin')) return true;
    
    // إخفاء الأيقونة إذا لم يكن المستخدم مُسجل
    if (!user) return true;
    
    // إخفاء الأيقونة إذا كان المستخدم من نوع admin
    if (userData?.accountType === 'admin') return true;
    
    // إظهار الأيقونة في جميع لوحات التحكم الأخرى (trainer, player, academy, club, agent, marketer)
    console.log('🔧 FloatingChatWidget - shouldHideWidget:', false, 'pathname:', pathname, 'user:', !!user, 'accountType:', userData?.accountType);
    return false;
  };

  // تحديد لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  useEffect(() => {
    if (user && userData) {
      console.log('🔄 تحميل المحادثات للمستخدم:', user.uid);
      loadExistingConversation();
    } else {
      console.log('❌ لا يمكن تحميل المحادثات: المستخدم أو البيانات غير متوفرة');
    }
  }, [user, userData]);

  useEffect(() => {
    if (conversation) {
      try {
        // Try the indexed query first
        const messagesQuery = query(
          collection(db, 'support_messages'),
          where('conversationId', '==', conversation.id),
          orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(
          messagesQuery, 
          (snapshot) => {
            const newMessages = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as SupportMessage[];
            
            setMessages(newMessages);
            
            // Count unread messages from support
            const unread = newMessages.filter(
              msg => !msg.isRead && msg.senderId !== user?.uid
            ).length;
            setUnreadCount(unread);
            
            // Update read status
            markMessagesAsRead(newMessages);
          },
          async (error) => {
            console.warn('Index error, using fallback query:', error);
            // If index error, use simple query and sort manually
            const simpleQuery = query(
              collection(db, 'support_messages'),
              where('conversationId', '==', conversation.id)
            );

            const unsubscribeSimple = onSnapshot(
              simpleQuery,
              (snapshot) => {
                const newMessages = snapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data()
                })) as SupportMessage[];

                // Sort messages by timestamp manually
                const sortedMessages = newMessages.sort((a, b) => {
                  const timeA = a.timestamp?.toDate?.() || new Date(0);
                  const timeB = b.timestamp?.toDate?.() || new Date(0);
                  return timeA.getTime() - timeB.getTime();
                });
                
                setMessages(sortedMessages);
                
                // Count unread messages
                const unread = sortedMessages.filter(
                  msg => !msg.isRead && msg.senderId !== user?.uid
                ).length;
                setUnreadCount(unread);
                
                // Update read status
                markMessagesAsRead(sortedMessages);
              },
              (fallbackError) => {
                console.error('Fallback query failed:', fallbackError);
                // Load messages manually as last resort
                loadMessagesManually();
              }
            );

            return () => unsubscribeSimple();
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up message listener:', error);
        // Load messages manually as last resort
        loadMessagesManually();
      }
    }
  }, [conversation, user]);

  // دالة بديلة لتحميل الرسائل يدوياً
  const loadMessagesManually = async () => {
    if (!conversation) return;
    
    try {
      const messagesRef = collection(db, 'support_messages');
      const q = query(
        messagesRef,
        where('conversationId', '==', conversation.id)
      );
      
      const snapshot = await getDocs(q);
      const allMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportMessage[];
      
      // ترتيب الرسائل حسب الوقت محلياً
      const sortedMessages = allMessages.sort((a, b) => {
        if (!a.timestamp || !b.timestamp) return 0;
        return a.timestamp.toDate().getTime() - b.timestamp.toDate().getTime();
      });
      
      setMessages(sortedMessages);
      
      // حساب الرسائل غير المقروءة
      const unread = sortedMessages.filter(
        msg => !msg.isRead && msg.senderId !== user?.uid
      ).length;
      setUnreadCount(unread);
      
      // تحديث حالة القراءة
      markMessagesAsRead(sortedMessages);
    } catch (error) {
      console.error('خطأ في تحميل الرسائل يدوياً:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadExistingConversation = async () => {
    if (!user) {
      console.log('❌ لا يمكن تحميل المحادثة: المستخدم غير متوفر');
      return;
    }

    console.log('🔄 بدء تحميل المحادثات الموجودة...');
    console.log('👤 User ID:', user.uid);

    try {
      // استعلام بسيط جداً بدون أي فلاتر معقدة
      const conversationsRef = collection(db, 'support_conversations');
      const q = query(
        conversationsRef,
        where('userId', '==', user.uid)
        // إزالة orderBy لتجنب خطأ الفهرس
      );

      console.log('📋 جاري استعلام المحادثات...');
      const snapshot = await getDocs(q);
      
      console.log('📊 عدد المحادثات الموجودة:', snapshot.size);
      
      if (!snapshot.empty) {
        // البحث عن محادثة نشطة وترتيب النتائج محلياً
        const allConversations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as SupportConversation[];
        
        console.log('📝 المحادثات المحملة:', allConversations);
        
        // ترتيب محلي حسب updatedAt
        const sortedConversations = allConversations.sort((a, b) => {
          if (!a.updatedAt || !b.updatedAt) return 0;
          return b.updatedAt.toDate().getTime() - a.updatedAt.toDate().getTime();
        });
        
        // البحث عن محادثة نشطة
        const activeConversation = sortedConversations.find(conv => 
          conv.status === 'open' || conv.status === 'in_progress'
        );
        
        if (activeConversation) {
          console.log('✅ تم العثور على محادثة نشطة:', activeConversation.id);
          setConversation(activeConversation);
        } else {
          console.log('ℹ️ لا توجد محادثات نشطة');
        }
      } else {
        console.log('ℹ️ لا توجد محادثات للمستخدم');
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل المحادثة:', error);
      // في حالة فشل الاستعلام، لا نعرض خطأ للمستخدم
      // سيتمكن من إنشاء محادثة جديدة
    }
  };

  const createNewConversation = async () => {
    if (!user || !userData) {
      console.error('❌ لا يمكن إنشاء محادثة: المستخدم أو بيانات المستخدم غير متوفرة');
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    console.log('🚀 بدء إنشاء محادثة جديدة...');
    console.log('👤 User:', user.uid);
    console.log('📊 UserData:', userData);

    setLoading(true);
    try {
      const newConversation = {
        userId: user.uid,
        userName: userData.name || userData.displayName || userData.full_name || 'مستخدم',
        userType: userData.accountType || 'player',
        status: 'open',
        priority: priority,
        category: category,
        lastMessage: '',
        lastMessageTime: serverTimestamp(),
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 إنشاء محادثة جديدة:', newConversation);

      const conversationRef = await addDoc(collection(db, 'support_conversations'), newConversation);
      
      console.log('✅ تم إنشاء المحادثة بنجاح:', conversationRef.id);

      setConversation({
        id: conversationRef.id,
        ...newConversation
      } as SupportConversation);

      // إرسال رسالة ترحيبية
      await sendWelcomeMessage(conversationRef.id);
      
      toast.success('تم إنشاء محادثة دعم فني جديدة');
    } catch (error) {
      console.error('❌ خطأ في إنشاء المحادثة:', error);
      toast.error('فشل في إنشاء محادثة الدعم');
    } finally {
      setLoading(false);
    }
  };

  const sendWelcomeMessage = async (conversationId: string) => {
    try {
      const welcomeMessage = {
        conversationId,
        senderId: 'system',
        senderName: 'نظام الدعم الفني',
        senderType: 'system',
        message: 'مرحباً بك في الدعم الفني لـ الحلم el7lm! 👋\n\nكيف يمكننا مساعدتك اليوم؟ فريق الدعم سيرد عليك في أقرب وقت ممكن.',
        timestamp: serverTimestamp(),
        isRead: true
      };

      await addDoc(collection(db, 'support_messages'), welcomeMessage);
      console.log('✅ تم إرسال رسالة الترحيب');
    } catch (error) {
      console.error('❌ خطأ في إرسال رسالة الترحيب:', error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !user || !userData) {
      console.error('❌ لا يمكن إرسال الرسالة: البيانات غير مكتملة');
      return;
    }

    // منع الإرسال المتكرر
    if (loading) {
      console.log('🛑 Chat message sending blocked - already loading');
      return;
    }

    // إنشاء محادثة جديدة إذا لم تكن موجودة
    if (!conversation) {
      console.log('🔄 لا توجد محادثة، إنشاء محادثة جديدة...');
      await createNewConversation();
      return;
    }

    setLoading(true);
    try {
      const newMessage = {
        conversationId: conversation.id,
        senderId: user.uid,
        senderName: userData.name || userData.displayName || userData.full_name || 'مستخدم',
        senderType: userData.accountType || 'player',
        message: message.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      };

      console.log('📤 إرسال رسالة جديدة:', newMessage);

      await addDoc(collection(db, 'support_messages'), newMessage);

      // تحديث المحادثة
      await updateDoc(doc(db, 'support_conversations', conversation.id), {
        lastMessage: message.trim(),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: conversation.status === 'resolved' ? 'open' : conversation.status
      });

      // إرسال إشعار للأدمن
      await sendAdminNotification(newMessage);

      setMessage('');
      toast.success('تم إرسال الرسالة');
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      toast.error('فشل في إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };

  // دالة إرسال إشعار للأدمن
  const sendAdminNotification = async (messageData: any) => {
    try {
      const notificationData = {
        userId: 'system', // إشعار للنظام
        title: 'رسالة دعم فني جديدة',
        body: `${messageData.senderName}: ${messageData.message.substring(0, 50)}${messageData.message.length > 50 ? '...' : ''}`,
        type: 'support',
        senderName: messageData.senderName,
        senderId: messageData.senderId,
        senderType: messageData.senderType,
        conversationId: messageData.conversationId,
        link: `/dashboard/admin/support?conversation=${messageData.conversationId}`,
        isRead: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        priority: conversation?.priority || 'medium',
        category: conversation?.category || 'general'
      };

      await addDoc(collection(db, 'notifications'), notificationData);
      console.log('✅ تم إرسال إشعار للأدمن');
    } catch (error) {
      console.error('❌ خطأ في إرسال إشعار الأدمن:', error);
    }
  };

  const markMessagesAsRead = async (msgs: SupportMessage[]) => {
    const unreadMessages = msgs.filter(msg => !msg.isRead && msg.senderId !== user?.uid);
    
    for (const msg of unreadMessages) {
      try {
        await updateDoc(doc(db, 'support_messages', msg.id), {
          isRead: true
        });
      } catch (error) {
        console.error('خطأ في تحديث حالة القراءة:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* أيقونة الدعم الفني - ثابتة في أسفل يسار الشاشة */}
      {!shouldHideWidget() && (
        <div className="fixed bottom-6 left-6 z-[9999]">
          <div className="relative">
            {/* تأثير النبض */}
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="relative w-16 h-16 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-2xl transition-all duration-500 ease-out hover:from-green-600 hover:to-emerald-700 hover:shadow-3xl hover:scale-[1.02] border-2 border-white"
              aria-label="فتح الدعم الفني"
            >
              <MessageCircle className="w-7 h-7" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="flex absolute -top-2 -right-2 justify-center items-center p-0 w-6 h-6 text-xs rounded-full animate-bounce"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* تلميح عند التمرير */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-500 whitespace-nowrap">
              الدعم الفني
            </div>
          </div>
        </div>
      )}

      {/* نافذة الدعم الفني */}
      {isOpen && !shouldHideWidget() && (
        <div className="fixed bottom-6 left-6 z-[9999] w-96 max-h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200">
          {/* رأس النافذة */}
          <div className="p-4 text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-lg">
            <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
                <Headphones className="w-5 h-5" />
                <h3 className="font-semibold">الدعم الفني</h3>
            </div>
              <div className="flex gap-2 items-center">
              <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('/support', '_blank')}
                  className="text-white hover:bg-white/20"
                  title="فتح صفحة الدعم الفني الكاملة"
              >
                  <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-white/20"
              >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                  variant="ghost"
                  size="sm"
                onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
              >
                  <X className="w-4 h-4" />
              </Button>
              </div>
            </div>
          </div>

          {/* محتوى النافذة */}
          {!isMinimized && (
            <div className="flex flex-col h-96">
              {/* منطقة الرسائل */}
              <div className="overflow-y-auto flex-1 p-4 bg-gray-50">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="w-8 h-8 rounded-full border-b-2 border-green-600 animate-spin"></div>
                    </div>
                ) : messages.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    <MessageCircle className="mx-auto mb-4 w-12 h-12 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold">مرحباً بك في الدعم الفني</h3>
                    <p className="text-sm">كيف يمكننا مساعدتك اليوم؟</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg, index) => (
                      <div
                        key={`${msg.id}-${index}`}
                        className={`flex items-start gap-2 ${
                          msg.senderId === user?.uid ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <div className="flex justify-center items-center w-8 h-8 bg-green-100 rounded-full">
                            <User className="w-4 h-4 text-green-600" />
                          </div>
                        </div>
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.senderId === user?.uid
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <div className="flex gap-1 items-center mt-1">
                            <span className="text-xs opacity-70">
                              {msg.timestamp?.toDate ? 
                                formatDistanceToNow(msg.timestamp.toDate(), { 
                                  addSuffix: true, 
                                  locale: ar 
                                }) : 
                                'الآن'
                              }
                              </span>
                            {msg.senderId === user?.uid && (
                              <CheckCircle className="w-3 h-3 opacity-70" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* منطقة إدخال الرسالة */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2 items-center">
                    <Input
                    type="text"
                    placeholder="اكتب رسالتك..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!message.trim() || loading}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                    <Send className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default FloatingChatWidget;

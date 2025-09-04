'use client';

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Headphones, 
  MessageSquare, 
  Clock, 
  User, 
  Send,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Search,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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

interface SupportMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: string;
  message: string;
  timestamp: any;
  isRead: boolean;
}

interface SupportStats {
  totalConversations: number;
  openConversations: number;
  inProgressConversations: number;
  resolvedToday: number;
  avgResponseTime: string;
}

const AdminSupportPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SupportStats>({
    totalConversations: 0,
    openConversations: 0,
    inProgressConversations: 0,
    resolvedToday: 0,
    avgResponseTime: '~15 دقيقة'
  });
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // تحديد ألوان الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  // تحديد ألوان الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'urgent': return 'text-red-600 bg-red-50';
      default: return 'text-yellow-600 bg-yellow-50';
    }
  };

  // تحديد أيقونة نوع المستخدم
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'club': return '🏆';
      case 'player': return '⚽';
      case 'agent': return '🤝';
      case 'academy': return '🎓';
      case 'trainer': return '💪';
      default: return '👤';
    }
  };

  useEffect(() => {
    if (user) {
      loadConversations();
      loadStats();
    }
  }, [user, filter]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  const loadConversations = () => {
    let conversationsQuery = query(
      collection(db, 'support_conversations'),
      orderBy('updatedAt', 'desc')
    );

    // تطبيق الفلاتر
    if (filter !== 'all') {
      conversationsQuery = query(
        collection(db, 'support_conversations'),
        where('status', '==', filter),
        orderBy('updatedAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const conversationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportConversation[];
      
      // فلترة حسب البحث
      const filteredConversations = searchTerm 
        ? conversationsList.filter(conv => 
            conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : conversationsList;
      
      setConversations(filteredConversations);
    });

    return unsubscribe;
  };

  const loadMessages = () => {
    if (!selectedConversation) return;

    const messagesQuery = query(
      collection(db, 'support_messages'),
      where('conversationId', '==', selectedConversation.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SupportMessage[];
      
      setMessages(messagesList);
    });

    return unsubscribe;
  };

  const loadStats = async () => {
    try {
      const allConversations = await getDocs(collection(db, 'support_conversations'));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let totalConversations = 0;
      let openConversations = 0;
      let inProgressConversations = 0;
      let resolvedToday = 0;

      allConversations.forEach(doc => {
        const conv = doc.data() as SupportConversation;
        totalConversations++;

        if (conv.status === 'open') openConversations++;
        if (conv.status === 'in_progress') inProgressConversations++;
        
        if (conv.status === 'resolved' && conv.updatedAt?.toDate() >= today) {
          resolvedToday++;
        }
      });

      setStats({
        totalConversations,
        openConversations,
        inProgressConversations,
        resolvedToday,
        avgResponseTime: '~15 دقيقة'
      });
    } catch (error) {
      console.error('خطأ في تحميل الإحصائيات:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setLoading(true);
    try {
      const message = {
        conversationId: selectedConversation.id,
        senderId: user.uid,
        senderName: 'فريق الدعم الفني',
        senderType: 'admin',
        message: newMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      };

      await addDoc(collection(db, 'support_messages'), message);

      // تحديث المحادثة
      await updateDoc(doc(db, 'support_conversations', selectedConversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: selectedConversation.status === 'open' ? 'in_progress' : selectedConversation.status
      });

      setNewMessage('');
      toast.success('تم إرسال الرد');
    } catch (error) {
      console.error('خطأ في إرسال الرد:', error);
      toast.error('فشل في إرسال الرد');
    } finally {
      setLoading(false);
    }
  };

  const updateConversationStatus = async (conversationId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'support_conversations', conversationId), {
        status,
        updatedAt: serverTimestamp()
      });
      
      toast.success('تم تحديث حالة المحادثة');
    } catch (error) {
      console.error('خطأ في تحديث الحالة:', error);
      toast.error('فشل في تحديث الحالة');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalConversations}</p>
                <p className="text-sm text-gray-600">إجمالي المحادثات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.openConversations}</p>
                <p className="text-sm text-gray-600">محادثات مفتوحة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.inProgressConversations}</p>
                <p className="text-sm text-gray-600">قيد المعالجة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.resolvedToday}</p>
                <p className="text-sm text-gray-600">محلولة اليوم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-lg font-bold">{stats.avgResponseTime}</p>
                <p className="text-sm text-gray-600">متوسط الرد</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* واجهة إدارة الدعم */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة المحادثات */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Headphones className="h-5 w-5" />
                طلبات الدعم الفني
              </CardTitle>
              
              {/* فلاتر البحث */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في المحادثات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                >
                  <option value="all">جميع المحادثات</option>
                  <option value="open">مفتوحة</option>
                  <option value="in_progress">قيد المعالجة</option>
                  <option value="resolved">محلولة</option>
                  <option value="closed">مغلقة</option>
                </select>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{getUserTypeIcon(conversation.userType)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{conversation.userName}</h4>
                            <Badge className={getPriorityColor(conversation.priority)}>
                              {conversation.priority === 'low' && 'منخفضة'}
                              {conversation.priority === 'medium' && 'متوسطة'}
                              {conversation.priority === 'high' && 'عالية'}
                              {conversation.priority === 'urgent' && 'عاجلة'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.lastMessage || 'لا توجد رسائل'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(conversation.status)}>
                              {conversation.status === 'open' && 'مفتوحة'}
                              {conversation.status === 'in_progress' && 'قيد المعالجة'}
                              {conversation.status === 'resolved' && 'محلولة'}
                              {conversation.status === 'closed' && 'مغلقة'}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {conversation.lastMessageTime && formatDistanceToNow(
                                conversation.lastMessageTime.toDate(), 
                                { addSuffix: true, locale: ar }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل المحادثة */}
        <div className="lg:col-span-2">
          {selectedConversation ? (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getUserTypeIcon(selectedConversation.userType)}</span>
                    <div>
                      <CardTitle className="text-lg">{selectedConversation.userName}</CardTitle>
                      <CardDescription>
                        {selectedConversation.category === 'technical' && 'مشكلة تقنية'}
                        {selectedConversation.category === 'billing' && 'مشكلة مالية'}
                        {selectedConversation.category === 'general' && 'استفسار عام'}
                        {selectedConversation.category === 'bug_report' && 'بلاغ عن خطأ'}
                        {selectedConversation.category === 'feature_request' && 'طلب ميزة جديدة'}
                      </CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedConversation.status}
                      onChange={(e) => updateConversationStatus(selectedConversation.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="open">مفتوحة</option>
                      <option value="in_progress">قيد المعالجة</option>
                      <option value="resolved">محلولة</option>
                      <option value="closed">مغلقة</option>
                    </select>
                  </div>
                </div>
              </CardHeader>

              {/* منطقة الرسائل */}
              <CardContent className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.senderType === 'admin'
                            ? 'bg-blue-600 text-white'
                            : message.senderType === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-white text-gray-800 border'
                        }`}
                      >
                        {message.senderType !== 'admin' && message.senderType !== 'system' && (
                          <div className="flex items-center gap-1 mb-1">
                            <User className="h-3 w-3" />
                            <span className="text-xs font-medium">{message.senderName}</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs opacity-60">
                            {message.timestamp && formatDistanceToNow(message.timestamp.toDate(), { 
                              addSuffix: true, 
                              locale: ar 
                            })}
                          </span>
                          {message.senderType === 'admin' && (
                            <CheckCircle className={`h-3 w-3 ${message.isRead ? 'text-green-400' : 'opacity-40'}`} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>

              {/* منطقة الرد */}
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="اكتب ردك هنا..."
                    className="flex-1"
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="font-medium">اختر محادثة لعرضها</h3>
                <p className="text-sm">اختر محادثة من القائمة لبدء الرد على العملاء</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportPage;

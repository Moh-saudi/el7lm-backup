'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  getDocs,
  getDoc,
  limit,
  addDoc,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getPlayerAvatarUrl, getUserAvatarFromSupabase } from '@/lib/supabase/image-utils';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Building2, 
  GraduationCap, 
  UserCheck, 
  Phone,
  Shield,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowLeft,
  Smile,
  Mail,
  MessageCircle,
  Smartphone,
  Share2,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  participantTypes: Record<string, string>;
  subject: string;
  lastMessage: string;
  lastMessageTime: any;
  lastSenderId: string;
  unreadCount: Record<string, number>;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;
  participantAvatars?: Record<string, string>;
}

interface Contact {
  id: string;
  name: string;
  type: 'club' | 'player' | 'agent' | 'academy' | 'trainer' | 'admin';
  avatar?: string | null;
  isOnline: boolean;
  organizationName?: string | null;
  isDependent?: boolean;
  parentAccountId?: string | null;
  parentAccountType?: string | null;
  phone?: string;
  email?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  senderType: string;
  receiverType: string;
  message: string;
  timestamp: any;
  isRead: boolean;
  messageType: 'text';
  senderAvatar?: string;
  deliveryStatus: 'sending' | 'sent';
}

interface SendMessageForm {
  message: string;
  sendVia: 'app' | 'sms' | 'whatsapp' | 'email' | 'all';
  priority: 'normal' | 'high' | 'urgent';
  includeAttachment: boolean;
  attachmentType: 'image' | 'document' | 'video';
}

const USER_TYPES = {
  club: { name: 'نادي', icon: Building2, color: 'text-green-600', bgColor: 'bg-green-50' },
  academy: { name: 'أكاديمية', icon: GraduationCap, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  trainer: { name: 'مدرب', icon: UserCheck, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  agent: { name: 'وكيل', icon: Phone, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  player: { name: 'لاعب', icon: Users, color: 'text-gray-600', bgColor: 'bg-gray-50' },
  admin: { name: 'مشرف', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' }
};

const SEND_OPTIONS = [
  { value: 'app', label: 'التطبيق', icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'sms', label: 'رسالة نصية', icon: Smartphone, color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'whatsapp', label: 'واتساب', icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'email', label: 'البريد الإلكتروني', icon: Mail, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'all', label: 'جميع الطرق', icon: Share2, color: 'text-orange-600', bgColor: 'bg-orange-50' }
];

const PRIORITY_OPTIONS = [
  { value: 'normal', label: 'عادي', color: 'text-gray-600', bgColor: 'bg-gray-50' },
  { value: 'high', label: 'مهم', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { value: 'urgent', label: 'عاجل', color: 'text-red-600', bgColor: 'bg-red-50' }
];

const EnhancedMessageCenter: React.FC = () => {
  const { user, userData } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [sendForm, setSendForm] = useState<SendMessageForm>({
    message: '',
    sendVia: 'app',
    priority: 'normal',
    includeAttachment: false,
    attachmentType: 'image'
  });
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasSetupConversationsRef = useRef<boolean>(false);
  const conversationsUnsubRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    setIsClient(true);
    
    if (conversationsUnsubRef.current) {
      conversationsUnsubRef.current();
      conversationsUnsubRef.current = null;
      hasSetupConversationsRef.current = false;
    }

    if (user && userData && !hasSetupConversationsRef.current) {
      setLoading(true);
      const conversationsQueryRef = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid)
      );
      const unsub = onSnapshot(
        conversationsQueryRef,
        (snapshot) => {
          const conversationsData: Conversation[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            conversationsData.push({
              id: doc.id,
              participants: data.participants || [],
              participantNames: data.participantNames || {},
              participantTypes: data.participantTypes || {},
              subject: data.subject || 'محادثة جديدة',
              lastMessage: data.lastMessage || '',
              lastMessageTime: data.lastMessageTime,
              lastSenderId: data.lastSenderId || '',
              unreadCount: data.unreadCount || {},
              isActive: data.isActive !== false,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              participantAvatars: data.participantAvatars || {}
            });
          });
          conversationsData.sort((a, b) => {
            const aDate = a.updatedAt?.toDate ? a.updatedAt.toDate() : (a.updatedAt ? new Date(a.updatedAt) : new Date(0));
            const bDate = b.updatedAt?.toDate ? b.updatedAt.toDate() : (b.updatedAt ? new Date(b.updatedAt) : new Date(0));
            return bDate.getTime() - aDate.getTime();
          });
          setConversations(conversationsData);
          setLoading(false);
        },
        (error) => {
          console.error('❌ خطأ في جلب المحادثات:', error);
          setError('حدث خطأ في جلب المحادثات');
          setLoading(false);
        }
      );
      conversationsUnsubRef.current = unsub;
      hasSetupConversationsRef.current = true;
      fetchContacts();
    } else if (!user) {
      setError('يرجى تسجيل الدخول');
      setLoading(false);
    }

    return () => {
      if (conversationsUnsubRef.current) {
        conversationsUnsubRef.current();
        conversationsUnsubRef.current = null;
        hasSetupConversationsRef.current = false;
      }
    };
  }, [user?.uid, !!userData]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchContacts = async () => {
    if (contactsLoading) return;
    setContactsLoading(true);
    
    try {
      const allContacts: Contact[] = [];
      const usersQueryRef = query(collection(db, 'users'), limit(100));
      const usersSnapshot = await getDocs(usersQueryRef);
      
      const processUser = async (userDocSnapshot: any): Promise<Contact | null> => {
        const data = userDocSnapshot.data();
        if (userDocSnapshot.id === user?.uid) return null;
        const accountType = data.accountType;
        if (!accountType || !['club', 'academy', 'agent', 'trainer', 'player'].includes(accountType)) return null;
        
        let contactName = 'مستخدم';
        let organizationName = null;
        let isDependent = false;
        let parentAccountId = null;
        let parentAccountType = null;
        
        try {
          const profileCollection = accountType === 'admin' ? 'users' : `${accountType}s`;
          const profileDocRef = doc(db, profileCollection, userDocSnapshot.id);
          const profileDocSnapshot = await getDoc(profileDocRef);
          if (profileDocSnapshot.exists()) {
            const profileData = profileDocSnapshot.data() as any;
            if (accountType === 'player') {
              contactName = profileData.full_name || profileData.name || profileData.displayName || 'لاعب';
              if (profileData.club_id || profileData.academy_id || profileData.trainer_id || profileData.agent_id) {
                isDependent = true;
                parentAccountId = profileData.club_id || profileData.academy_id || profileData.trainer_id || profileData.agent_id;
                if (profileData.club_id) parentAccountType = 'club';
                else if (profileData.academy_id) parentAccountType = 'academy';
                else if (profileData.trainer_id) parentAccountType = 'trainer';
                else if (profileData.agent_id) parentAccountType = 'agent';
              }
              organizationName = profileData.current_club || profileData.clubName || profileData.academyName || null;
            } else if (accountType === 'club') {
              contactName = profileData.name || profileData.club_name || profileData.displayName || 'نادي';
              organizationName = profileData.organizationName || profileData.clubName || null;
            } else if (accountType === 'academy') {
              contactName = profileData.name || profileData.academy_name || profileData.displayName || 'أكاديمية';
              organizationName = profileData.organizationName || profileData.academyName || null;
            } else if (accountType === 'agent') {
              contactName = profileData.name || profileData.agent_name || profileData.agency_name || profileData.displayName || 'وكيل';
              organizationName = profileData.organizationName || profileData.agencyName || null;
            } else if (accountType === 'trainer') {
              contactName = profileData.name || profileData.trainer_name || profileData.displayName || 'مدرب';
              organizationName = profileData.organizationName || profileData.specialization || null;
            }
          }
        } catch (e) {
          contactName = data.name || data.full_name || data.displayName || 'مستخدم';
          organizationName = data.organizationName || data.clubName || data.academyName || data.agencyName || null;
        }
        
        let avatarUrl: string | null = null;
        try {
          const userDataForAvatar = { ...data, uid: userDocSnapshot.id, accountType };
          avatarUrl = (await getUserAvatarFromSupabase(userDocSnapshot.id, accountType)) || getPlayerAvatarUrl(userDataForAvatar, user);
        } catch (e) {
          avatarUrl = null;
        }
        
        let displayName = contactName;
        if (isDependent && accountType === 'player') {
          const parentTypeNames: any = { club: 'نادي', academy: 'أكاديمية', trainer: 'مدرب', agent: 'وكيل' };
          displayName = `👤 ${contactName}${parentAccountType ? ` (تابع لـ ${parentTypeNames[parentAccountType] || parentAccountType})` : ''}`;
        }

        return {
          id: `${accountType}_${userDocSnapshot.id}`,
          name: displayName,
          type: accountType as any,
          avatar: avatarUrl,
          isOnline: data.isOnline || false,
          organizationName,
          isDependent,
          parentAccountId,
          parentAccountType,
          phone: data.phone || profileData?.phone || null,
          email: data.email || profileData?.email || null
        };
      };

      const tasks = usersSnapshot.docs.map((d) => processUser(d));
      const results = await Promise.allSettled(tasks);
      results.forEach((res) => {
        if (res.status === 'fulfilled' && res.value) {
          allContacts.push(res.value);
        }
      });

      setContacts(allContacts);
    } catch (error) {
      console.error('❌ خطأ في جلب جهات الاتصال:', error);
      toast.error('حدث خطأ في جلب جهات الاتصال');
    } finally {
      setContactsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !userData || !selectedConversation) {
      return;
    }

    try {
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: user.uid,
        receiverId: selectedConversation.participants.find(id => id !== user.uid) || '',
        senderName: user.displayName || user.email || userData.name || userData.displayName || userData.full_name || 'أنا',
        receiverName: selectedConversation.participantNames[selectedConversation.participants.find(id => id !== user.uid) || ''] || 'مستخدم',
        senderType: userData.accountType || 'player',
        receiverType: selectedConversation.participantTypes[selectedConversation.participants.find(id => id !== user.uid) || ''] || 'player',
        message: newMessage.trim(),
        timestamp: new Date(),
        isRead: false,
        messageType: 'text',
        senderAvatar: userData.avatar || null,
        deliveryStatus: 'sent'
      };

      await addDoc(collection(db, 'messages'), messageData);

      await updateDoc(doc(db, 'conversations', selectedConversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageTime: new Date(),
        updatedAt: new Date(),
        lastSenderId: user.uid
      });

      setNewMessage('');
      toast.success('تم إرسال الرسالة');
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة:', error);
      toast.error('فشل في إرسال الرسالة');
    }
  };

  const sendEnhancedMessage = async (contact: Contact) => {
    if (!sendForm.message.trim()) {
      toast.error('يرجى كتابة رسالة');
      return;
    }

    try {
      const { message, sendVia, priority } = sendForm;
      
      // إرسال عبر التطبيق
      if (sendVia === 'app' || sendVia === 'all') {
        await sendMessage();
      }

      // إرسال عبر SMS
      if ((sendVia === 'sms' || sendVia === 'all') && contact.phone) {
        try {
          const smsResponse = await fetch('/api/notifications/sms/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumbers: [contact.phone],
              message: message
            })
          });
          
          if (smsResponse.ok) {
            console.log('✅ SMS أُرسل بنجاح إلى:', contact.phone);
          } else {
            console.error('❌ فشل في إرسال SMS:', await smsResponse.text());
          }
        } catch (error) {
          console.error('❌ خطأ في إرسال SMS:', error);
        }
      }

      // إرسال عبر WhatsApp
      if ((sendVia === 'whatsapp' || sendVia === 'all') && contact.phone) {
        try {
          // استخدام WhatsApp Web API (فتح WhatsApp في المتصفح)
          const whatsappUrl = `https://wa.me/${contact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
          window.open(whatsappUrl, '_blank');
          console.log('✅ WhatsApp Web أُفتح بنجاح لـ:', contact.phone);
        } catch (error) {
          console.error('❌ خطأ في فتح WhatsApp:', error);
        }
      }

      // إرسال عبر البريد الإلكتروني
      if ((sendVia === 'email' || sendVia === 'all') && contact.email) {
        const emailUrl = `mailto:${contact.email}?subject=رسالة من ${userData?.name || 'مستخدم'}&body=${encodeURIComponent(message)}`;
        window.open(emailUrl, '_blank');
      }

      toast.success(`تم إرسال الرسالة عبر ${SEND_OPTIONS.find(opt => opt.value === sendVia)?.label}`);
      setShowSendMessage(false);
      setSendForm({
        message: '',
        sendVia: 'app',
        priority: 'normal',
        includeAttachment: false,
        attachmentType: 'image'
      });
    } catch (error) {
      console.error('❌ خطأ في إرسال الرسالة المحسنة:', error);
      toast.error('فشل في إرسال الرسالة');
    }
  };

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessage(text);
      toast.success('تم نسخ الرسالة');
      setTimeout(() => setCopiedMessage(null), 2000);
    } catch (error) {
      toast.error('فشل في نسخ الرسالة');
    }
  };

  const openConversation = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversation.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        })) as Message[];
        
        setMessages(messagesData);
        setTimeout(scrollToBottom, 100);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ خطأ في فتح المحادثة:', error);
    }
  };

  const closeConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
    setNewMessage('');
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل مركز الرسائل...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل مركز الرسائل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-center text-red-600">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
            <h3 className="text-lg font-semibold mb-2">خطأ في التحميل</h3>
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user || !userData) {
    return (
      <Card className="p-6">
        <CardContent>
          <div className="text-center text-gray-600">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">غير مسجل الدخول</h3>
            <p>يرجى تسجيل الدخول للوصول إلى مركز الرسائل</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true;
    
    const participantNames = Object.values(conversation.participantNames || {});
    const subject = conversation.subject || '';
    const lastMessage = conversation.lastMessage || '';
    
    const searchLower = searchTerm.toLowerCase();
    return participantNames.some(name => name.toLowerCase().includes(searchLower)) ||
           subject.toLowerCase().includes(searchLower) ||
           lastMessage.toLowerCase().includes(searchLower);
  });

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-gray-50 mb-8">
      {/* عمود المحادثات */}
      <div className="w-1/3 bg-white shadow-lg rounded-l-lg overflow-hidden border-r border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">المحادثات</h2>
                <p className="text-sm text-blue-100">
                  {conversations.length} محادثة | {contacts.length} جهات اتصال
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                className="text-white hover:bg-white/20 bg-transparent border-none p-2"
                onClick={() => setShowSendMessage(true)}
                title="إرسال رسالة محسنة"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <Button
                className="text-white hover:bg-white/20 bg-transparent border-none p-2"
                onClick={() => setShowNewChat(true)}
                title="محادثة جديدة"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <Input
              type="text"
              placeholder="البحث في المحادثات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* قائمة المحادثات */}
        <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
          {filteredConversations.length > 0 ? (
            <div className="p-2">
              {filteredConversations.map((conversation) => {
                const otherParticipantId = conversation.participants.find(id => id !== user.uid);
                const otherParticipantName = conversation.participantNames[otherParticipantId || ''] || 'مستخدم';
                const otherParticipantType = conversation.participantTypes[otherParticipantId || ''] || 'player';
                const unreadCount = conversation.unreadCount[user.uid] || 0;
                const UserIcon = USER_TYPES[otherParticipantType as keyof typeof USER_TYPES]?.icon || Users;

                return (
                  <div
                    key={conversation.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => openConversation(conversation)}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={conversation.participantAvatars?.[otherParticipantId || ''] || ''} 
                        alt={otherParticipantName}
                        className="transition-opacity duration-500 ease-out hover:scale-105"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        <UserIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">
                          {otherParticipantName}
                        </h4>
                        <div className="flex items-center gap-1">
                          {conversation.lastMessageTime && (
                            <span className="text-xs text-gray-500">
                              {(() => {
                                const now = new Date();
                                const messageTime = conversation.lastMessageTime.toDate ? conversation.lastMessageTime.toDate() : new Date(conversation.lastMessageTime);
                                const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
                                
                                if (diffInHours < 1) {
                                  return messageTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                                } else if (diffInHours < 24) {
                                  return messageTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
                                } else if (diffInHours < 48) {
                                  return 'أمس';
                                } else {
                                  return messageTime.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
                                }
                              })()}
                            </span>
                          )}
                          {unreadCount > 0 && (
                            <Badge className="h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center bg-red-500 text-white">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs border ${USER_TYPES[otherParticipantType as keyof typeof USER_TYPES]?.bgColor} ${USER_TYPES[otherParticipantType as keyof typeof USER_TYPES]?.color}`}>
                          {USER_TYPES[otherParticipantType as keyof typeof USER_TYPES]?.name}
                        </Badge>
                        {conversation.isActive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastSenderId === user?.uid && (
                            <span className="text-blue-600 mr-1">أنت:</span>
                          )}
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'لا توجد نتائج' : 'لا توجد محادثات'}
              </h3>
              <p className="text-sm">
                {searchTerm 
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'ابدأ محادثة جديدة مع جهات الاتصال'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* عمود الرسائل */}
      <div className="flex-1 flex flex-col bg-white shadow-lg rounded-r-lg overflow-hidden">
        {selectedConversation ? (
          <div className="flex flex-col h-full">
            {/* رأس المحادثة */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={closeConversation}
                    className="p-2 text-gray-600 hover:bg-gray-100 bg-transparent border-none"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={selectedConversation.participantAvatars?.[selectedConversation.participants.find(id => id !== user?.uid) || ''] || ''}
                      alt={selectedConversation.participantNames[selectedConversation.participants.find(id => id !== user?.uid) || ''] || 'مستخدم'}
                      className="transition-opacity duration-200 hover:scale-105"
                    />
                    <AvatarFallback>
                      <Users className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedConversation.participantNames[selectedConversation.participants.find(id => id !== user?.uid) || ''] || 'مستخدم'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs border ${USER_TYPES[selectedConversation.participantTypes[selectedConversation.participants.find(id => id !== user?.uid) || ''] as keyof typeof USER_TYPES]?.bgColor} ${USER_TYPES[selectedConversation.participantTypes[selectedConversation.participants.find(id => id !== user?.uid) || ''] as keyof typeof USER_TYPES]?.color}`}>
                        {USER_TYPES[selectedConversation.participantTypes[selectedConversation.participants.find(id => id !== user?.uid) || ''] as keyof typeof USER_TYPES]?.name}
                      </Badge>
                      {selectedConversation.isActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* منطقة الرسائل */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isCurrentUser = message.senderId === user?.uid;
                  const UserIcon = USER_TYPES[message.senderType as keyof typeof USER_TYPES]?.icon || Users;

                  return (
                    <div
                      key={`${message.id}-${index}`}
                      className={`flex items-start gap-2 mb-4 ${
                        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={message.senderAvatar}
                            className="transition-opacity duration-500 ease-out hover:scale-105"
                          />
                          <AvatarFallback>
                            <UserIcon className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div
                        className={`flex flex-col max-w-[70%] ${
                          isCurrentUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {message.senderName || 'مستخدم'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {message.timestamp.toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {message.deliveryStatus === 'sent' && isCurrentUser && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyMessage(message.message)}
                            className="p-1 h-auto"
                            title="نسخ الرسالة"
                          >
                            {copiedMessage === message.message ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-500" />
                            )}
                          </Button>
                        </div>
                        
                        <div
                          className={`rounded-lg p-3 ${
                            isCurrentUser
                              ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-base leading-relaxed">
                            {message.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* منطقة إدخال الرسالة */}
            <div className="p-4 border-t bg-white">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="اكتب رسالتك هنا..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="pr-10"
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">مرحباً بك في مركز الرسائل</h3>
              <p className="text-sm mb-4">اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>جاهز للتواصل</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* نافذة إرسال رسالة محسنة */}
      <Dialog open={showSendMessage} onOpenChange={setShowSendMessage}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              إرسال رسالة محسنة
            </DialogTitle>
            <DialogDescription>
              اختر طريقة الإرسال واكتب رسالتك
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* اختيار جهة الاتصال */}
            <div>
              <Label>جهة الاتصال</Label>
              <Select onValueChange={(value) => {
                const contact = contacts.find(c => c.id === value);
                setSelectedContact(contact || null);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر جهة الاتصال" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => {
                    const UserIcon = USER_TYPES[contact.type as keyof typeof USER_TYPES]?.icon || Users;
                    return (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center gap-2">
                          <UserIcon className="h-4 w-4" />
                          <span>{contact.name}</span>
                          <Badge className="text-xs">
                            {USER_TYPES[contact.type as keyof typeof USER_TYPES]?.name}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* طريقة الإرسال */}
            <div>
              <Label>طريقة الإرسال</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
                {SEND_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSendForm(prev => ({ ...prev, sendVia: option.value as any }))}
                      className={`p-3 rounded-lg border-2 transition-all duration-500 ease-out ${
                        sendForm.sendVia === option.value
                          ? `${option.bgColor} ${option.color} border-current`
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* أولوية الرسالة */}
            <div>
              <Label>أولوية الرسالة</Label>
              <div className="flex gap-2 mt-2">
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSendForm(prev => ({ ...prev, priority: option.value as any }))}
                    className={`px-4 py-2 rounded-lg border-2 transition-all duration-500 ease-out ${
                      sendForm.priority === option.value
                        ? `${option.bgColor} ${option.color} border-current`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* نص الرسالة */}
            <div>
              <Label>نص الرسالة</Label>
              <Textarea
                value={sendForm.message}
                onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="اكتب رسالتك هنا..."
                rows={4}
                className="mt-2"
              />
            </div>

            {/* معلومات جهة الاتصال */}
            {selectedContact && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">معلومات جهة الاتصال</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium mr-2">{selectedContact.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">النوع:</span>
                    <Badge className="mr-2">
                      {USER_TYPES[selectedContact.type as keyof typeof USER_TYPES]?.name}
                    </Badge>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="font-medium mr-2">{selectedContact.phone}</span>
                    </div>
                  )}
                  {selectedContact.email && (
                    <div>
                      <span className="text-gray-600">البريد الإلكتروني:</span>
                      <span className="font-medium mr-2">{selectedContact.email}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSendMessage(false)}
            >
              إلغاء
            </Button>
            <Button
              onClick={() => selectedContact && sendEnhancedMessage(selectedContact)}
              disabled={!selectedContact || !sendForm.message.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="h-4 w-4 mr-2" />
              إرسال الرسالة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedMessageCenter;

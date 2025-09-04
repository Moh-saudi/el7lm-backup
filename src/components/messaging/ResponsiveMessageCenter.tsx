'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Users, 
  Plus,
  X,
  Menu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useMediaQuery } from 'react-responsive';

const ResponsiveMessageCenter: React.FC = () => {
  const { user, userData } = useAuth();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Responsive breakpoints
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ minWidth: 769, maxWidth: 1024 });
  const isDesktop = useMediaQuery({ minWidth: 1025 });

  useEffect(() => {
    setIsClient(true);
    setLoading(false);
  }, []);

  // Auto-hide sidebar on mobile when conversation is selected
  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowSidebar(false);
    }
  }, [selectedConversation, isMobile]);

  // Auto-show sidebar on desktop
  useEffect(() => {
    if (isDesktop) {
      setShowSidebar(true);
    }
  }, [isDesktop]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    // TODO: Implement message sending
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
          <p className="text-gray-600">جاري تحميل المحادثات...</p>
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

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] bg-gray-50 rounded-lg overflow-hidden shadow-lg">
      {/* Sidebar - Conversations List */}
      <div className={`${showSidebar ? 'flex' : 'hidden'} ${isMobile ? 'absolute inset-0 z-40' : 'relative'} flex-col w-full ${isDesktop ? 'w-1/3' : isTablet ? 'w-2/5' : 'w-full'} bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">الرسائل</h2>
                <p className="text-sm text-blue-100">مركز التواصل</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="text-white hover:bg-white/20 bg-transparent border-none p-2"
                onClick={() => {/* TODO: Open new chat */}}
              >
                <Plus className="h-5 w-5" />
              </Button>
              {isMobile && (
                <Button
                  className="text-white hover:bg-white/20 bg-transparent border-none p-2"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="relative">
            <Input
              type="text"
              placeholder="البحث في المحادثات..."
              className="pl-10 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
            <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">لا توجد محادثات</h3>
            <p className="text-sm mb-4">ابدأ محادثة جديدة مع جهات الاتصال</p>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {/* TODO: Open new chat */}}
            >
              <Plus className="h-4 w-4 mr-2" />
              محادثة جديدة
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${!showSidebar ? 'flex' : 'hidden'} ${isMobile ? 'absolute inset-0 z-50' : 'relative'} flex-col flex-1 bg-white`}>
        <div className="flex flex-col h-full">
          {/* Chat Header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    onClick={() => setShowSidebar(true)}
                    className="p-2 text-gray-600 hover:bg-gray-100 bg-transparent border-none"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                )}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">مركز الرسائل</h3>
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs border border-gray-300 bg-white text-gray-700">
                      جاهز
                    </Badge>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              {isMobile && (
                <Button
                  onClick={() => setSelectedConversation(null)}
                  className="p-2 text-gray-600 hover:bg-gray-100 bg-transparent border-none"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <div className="text-center text-gray-500 py-8">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold mb-2">مرحباً بك في مركز الرسائل</h3>
              <p className="text-sm mb-4">اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>جاهز للتواصل</span>
              </div>
            </div>
          </div>

          {/* Message Input */}
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
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveMessageCenter;

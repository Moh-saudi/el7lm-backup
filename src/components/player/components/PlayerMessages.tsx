'use client';

import React, { memo } from 'react';
import { Card } from "@/components/ui/card";
import Image from 'next/image';
import Link from 'next/link';

interface Message {
  id: number;
  sender: string;
  type: string;
  content: string;
  time: string;
  avatar: string;
  unread: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface PlayerMessagesProps {
  userId?: string;
  loading: boolean;
}

// البيانات الافتراضية للرسائل
const getMockMessages = (): Message[] => [
  {
    id: 1,
    sender: "نادي الهلال",
    type: "club",
    content: "دعوة لتجربة أداء",
    time: "منذ ساعتين",
    avatar: "/club-avatar.png",
    unread: true,
    priority: "high"
  },
  {
    id: 2,
    sender: "وكيل معتمد",
    type: "agent",
    content: "عرض احتراف جديد",
    time: "منذ 3 ساعات",
    avatar: "/agent-avatar.png",
    unread: true,
    priority: "medium"
  },
  {
    id: 3,
    sender: "أكاديمية الشباب",
    type: "academy",
    content: "برنامج تدريبي متقدم",
    time: "منذ يوم",
    avatar: "/academy-avatar.png",
    unread: false,
    priority: "low"
  }
];

// مكون بطاقة الرسالة محسن
const MessageCard = memo(({ message }: { message: Message }) => (
  <div className="flex items-center p-4 space-x-4 space-x-reverse transition-all duration-500 ease-out bg-white rounded-lg hover:bg-gray-50 hover:shadow-md">
    <div className="relative">
      <Image
        src={message.avatar}
        alt={message.sender}
        width={48}
        height={48}
        className="w-12 h-12 border border-gray-200 rounded-full"
      />
      {message.priority === 'high' && (
        <span className="absolute w-3 h-3 bg-red-500 border-2 border-white rounded-full -top-1 -right-1"></span>
      )}
      {message.unread && (
        <span className="absolute w-2 h-2 bg-blue-500 border border-white rounded-full -bottom-1 -right-1"></span>
      )}
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <h4 className={`font-semibold ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
          {message.sender}
        </h4>
        <span className="text-sm text-gray-500">{message.time}</span>
      </div>
      <p className={`mt-1 text-sm ${message.unread ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
        {message.content}
      </p>
      <div className="flex items-center gap-2 mt-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          message.type === 'club' ? 'bg-blue-100 text-blue-800' :
          message.type === 'agent' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {message.type === 'club' ? 'نادي' : message.type === 'agent' ? 'وكيل' : 'أكاديمية'}
        </span>
        {message.priority === 'high' && (
          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
            عاجل
          </span>
        )}
      </div>
    </div>
  </div>
));

MessageCard.displayName = 'MessageCard';

const PlayerMessages = memo(({ userId, loading }: PlayerMessagesProps) => {
  const messages = getMockMessages();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">آخر الرسائل</h3>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
            {messages.filter(m => m.unread).length} جديد
          </span>
          <Link 
            href="/dashboard/messages" 
            className="text-blue-600 hover:underline transition-colors duration-200"
          >
            عرض الكل
          </Link>
        </div>
      </div>
      
      <div className="space-y-4">
        {messages.map((message) => (
          <MessageCard key={message.id} message={message} />
        ))}
      </div>

      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-3a2 2 0 00-2 2v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3a2 2 0 00-2-2H4" />
          </svg>
          <p>لا توجد رسائل جديدة</p>
        </div>
      )}
    </Card>
  );
});

PlayerMessages.displayName = 'PlayerMessages';

export default PlayerMessages; 

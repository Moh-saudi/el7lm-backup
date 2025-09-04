import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, addDoc, query, where, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

// جلب الرسائل
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // جلب رسائل محادثة معينة
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );
      
      const snapshot = await getDocs(messagesQuery);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ messages });
    } else if (userId) {
      // جلب محادثات المستخدم
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );
      
      const snapshot = await getDocs(conversationsQuery);
      const conversations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ conversations });
    } else {
      // جلب جميع الرسائل (للمشرفين)
      const messagesRef = collection(db, 'messages');
      const snapshot = await getDocs(messagesRef);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return NextResponse.json({ messages });
    }
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    
    // إذا كانت مشكلة أذونات، أرجع بيانات فارغة بدلاً من خطأ
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for messages - returning empty data');
      return NextResponse.json({ 
        messages: [],
        conversations: [],
        count: 0,
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// إرسال رسالة جديدة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      senderId, 
      receiverId, 
      message, 
      senderName, 
      receiverName,
      senderType, // 'club', 'player', 'agent', 'academy', 'trainer'
      receiverType,
      subject = 'رسالة جديدة'
    } = body;

    // التحقق من البيانات المطلوبة
    if (!senderId || !receiverId || !message) {
      return NextResponse.json({ 
        error: 'Missing required fields: senderId, receiverId, message' 
      }, { status: 400 });
    }

    // إنشاء معرف المحادثة
    const conversationId = [senderId, receiverId].sort().join('-');

    // البحث عن محادثة موجودة أو إنشاء جديدة
    const conversationsRef = collection(db, 'conversations');
    const existingConversationQuery = query(
      conversationsRef,
      where('id', '==', conversationId)
    );
    
    const existingConversation = await getDocs(existingConversationQuery);
    
    let conversationRef;
    if (existingConversation.empty) {
      // إنشاء محادثة جديدة
      conversationRef = await addDoc(conversationsRef, {
        id: conversationId,
        participants: [senderId, receiverId],
        participantNames: {
          [senderId]: senderName,
          [receiverId]: receiverName
        },
        participantTypes: {
          [senderId]: senderType,
          [receiverId]: receiverType
        },
        subject,
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        lastSenderId: senderId,
        unreadCount: {
          [senderId]: 0,
          [receiverId]: 1
        },
        createdAt: serverTimestamp(),
        isActive: true
      });
    } else {
      // تحديث المحادثة الموجودة
      const conversationDoc = existingConversation.docs[0];
      conversationRef = conversationDoc.ref;
      
      await updateDoc(conversationDoc.ref, {
        lastMessage: message,
        lastMessageTime: serverTimestamp(),
        lastSenderId: senderId,
        [`unreadCount.${receiverId}`]: (conversationDoc.data().unreadCount?.[receiverId] || 0) + 1,
        [`unreadCount.${senderId}`]: 0
      });
    }

    // إضافة الرسالة
    const messageData = {
      conversationId,
      senderId,
      receiverId,
      senderName,
      receiverName,
      senderType,
      receiverType,
      message,
      timestamp: serverTimestamp(),
      isRead: false,
      messageType: 'text', // يمكن توسيعه لاحقاً للصور والملفات
      createdAt: serverTimestamp()
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageData);

    return NextResponse.json({ 
      success: true, 
      messageId: messageRef.id,
      conversationId: conversationRef.id,
      message: 'تم إرسال الرسالة بنجاح'
    });

  } catch (error: any) {
    console.error('Error sending message:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for sending message - simulating success');
      return NextResponse.json({ 
        success: false, 
        messageId: 'temp-id',
        conversationId: 'temp-conversation',
        message: 'تعذر إرسال الرسالة - مشكلة في الأذونات',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// تحديث حالة قراءة الرسائل
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { messageId, conversationId, userId } = body;

    if (messageId) {
      // تحديث رسالة معينة
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        isRead: true,
        readAt: serverTimestamp()
      });
    } else if (conversationId && userId) {
      // تحديث جميع الرسائل في المحادثة
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        where('receiverId', '==', userId),
        where('isRead', '==', false)
      );
      
      const snapshot = await getDocs(messagesQuery);
      const updatePromises = snapshot.docs.map(docSnap => 
        updateDoc(docSnap.ref, {
          isRead: true,
          readAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);

      // تحديث عداد الرسائل غير المقروءة في المحادثة
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0
      });
    }

    return NextResponse.json({ success: true, message: 'تم تحديث حالة القراءة' });

  } catch (error: any) {
    console.error('Error updating read status:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for updating read status - simulating success');
      return NextResponse.json({ 
        success: false, 
        message: 'تعذر تحديث حالة القراءة - مشكلة في الأذونات',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update read status',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

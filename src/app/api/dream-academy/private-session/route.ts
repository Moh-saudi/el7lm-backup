import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { sendWhatsAppMessage } from '@/lib/whatsapp/whatsapp-service';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const { name, whatsapp, durationMinutes, notes, currency, amount, paymentMethod, categoryId, userId } = payload || {};
    if (!name || !whatsapp || !currency || !paymentMethod || !categoryId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const docRef = await addDoc(collection(db, 'private_sessions_requests'), {
      name,
      whatsapp,
      durationMinutes: durationMinutes || 45,
      notes: notes || '',
      currency,
      amount: amount || 0,
      paymentMethod,
      categoryId,
      userId: userId || null,
      paymentStatus: 'pending_review',
      createdAt: serverTimestamp(),
    });

    // Create in-app notification to the user (support message)
    const message = `تم استلام طلب جلستك الخاصة وسيتم التواصل معك خلال 24 ساعة. لخدمة العملاء: 01017799580 (مصر) / +97472053188 (قطر)`;
    await addDoc(collection(db, 'support_notifications'), {
      userId: userId || null,
      title: 'طلب جلسة خاصة',
      message,
      status: 'new',
      createdAt: serverTimestamp(),
    });

    // Send WhatsApp message to the customer's WhatsApp number (if service configured)
    try {
      await sendWhatsAppMessage(whatsapp, message);
    } catch (err) {
      console.warn('WhatsApp send failed (non-blocking):', err);
    }

    // Also send the same confirmation into the in-app Message Center
    try {
      if (userId) {
        const supportId = 'support';
        const supportName = 'الدعم الفني';
        const supportType = 'admin';

        // Try to find existing conversation between this user and support
        const convSnap = await getDocs(
          query(collection(db, 'conversations'), where('participants', 'array-contains', userId))
        );
        let conversationId: string | null = null;
        let existingUnread = 0;

        const existingConv = convSnap.docs.find(d => {
          const data: any = d.data();
          return Array.isArray(data.participants) && data.participants.includes(supportId);
        });

        if (existingConv) {
          conversationId = existingConv.id;
          const data: any = existingConv.data();
          existingUnread = (data?.unreadCount && data.unreadCount[userId]) || 0;
        } else {
          const newConvRef = await addDoc(collection(db, 'conversations'), {
            participants: [userId, supportId],
            participantNames: {
              [userId]: name || 'مستخدم',
              [supportId]: supportName
            },
            participantTypes: {
              [userId]: 'player',
              [supportId]: supportType
            },
            subject: 'الدعم الفني',
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            lastSenderId: '',
            unreadCount: { [userId]: 0, [supportId]: 0 },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            isActive: true
          });
          conversationId = newConvRef.id;
        }

        if (conversationId) {
          // Add message from support to user
          await addDoc(collection(db, 'messages'), {
            conversationId,
            senderId: supportId,
            receiverId: userId,
            senderName: supportName,
            receiverName: name || 'مستخدم',
            senderType: supportType,
            receiverType: 'player',
            message,
            timestamp: serverTimestamp(),
            isRead: false,
            messageType: 'text'
          });

          // Update conversation last message and unread counter for the user
          await updateDoc(doc(db, 'conversations', conversationId), {
            lastMessage: message,
            lastMessageTime: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastSenderId: supportId,
            [`unreadCount.${userId}`]: existingUnread + 1
          });
        }
      }
    } catch (err) {
      console.warn('Message Center send failed (non-blocking):', err);
    }

    return NextResponse.json({ id: docRef.id, status: 'ok' });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed' }, { status: 500 });
  }
}



import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const docRef = await addDoc(collection(db, 'careers_applications'), {
      ...data,
      createdAt: serverTimestamp()
    });
    // إضافة إشعار للإدارة بوجود طلب وظيفة جديد
    const title = `طلب وظيفة جديد - ${data?.role || 'غير محدد'}`;
    const message = `وصل طلب جديد عبر نموذج التقديم\n\nالاسم: ${data?.fullName || '-'}\nالدور: ${data?.role || '-'}\nالهاتف: ${data?.phone || '-'}\nالبريد: ${data?.email || '-'}`;
    await addDoc(collection(db, 'smart_notifications'), {
      title,
      message,
      priority: 'medium',
      type: 'job_application',
      isRead: false,
      createdAt: serverTimestamp(),
      metadata: {
        source: 'careers_form',
        sentVia: 'in_app',
        role: data?.role || null,
        applicant: {
          fullName: data?.fullName || null,
          phone: data?.phone || null,
          email: data?.email || null,
          linkedin: data?.linkedin || null,
          notes: data?.notes || null
        }
      }
    });
    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save application' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const q = query(collection(db, 'careers_applications'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
}



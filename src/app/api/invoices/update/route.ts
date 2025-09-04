import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, limit, updateDoc, doc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId: string | undefined = body?.paymentId;
    const status: string | undefined = body?.status;

    if (!paymentId || !status) {
      return NextResponse.json({ ok: false, error: 'paymentId and status are required' }, { status: 400 });
    }

    const q = query(collection(db, 'invoices'), where('payment_id', '==', paymentId), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) {
      return NextResponse.json({ ok: false, error: 'Invoice not found' }, { status: 404 });
    }

    const invDoc = snap.docs[0];
    await updateDoc(doc(db, 'invoices', invDoc.id), {
      status,
      updated_at: new Date()
    } as any);

    return NextResponse.json({ ok: true, invoice: { id: invDoc.id, ...(invDoc.data() as any), status } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}





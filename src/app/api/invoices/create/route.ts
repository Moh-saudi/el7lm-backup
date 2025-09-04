import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, query, where, addDoc, orderBy, limit } from 'firebase/firestore';

type PaymentDoc = {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  amount?: number;
  totalAmount?: number;
  currency?: string;
  status?: string;
  paymentMethod?: string;
  description?: string;
  packageType?: string;
  planType?: string;
  planName?: string;
  plan?: string;
  subscription_type?: string;
  createdAt?: any;
};

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000; // 4 digits
  return `INV-${y}${m}${d}-${rand}`;
}

function toDate(value: any): Date | null {
  try {
    if (!value) return null;
    if (typeof value === 'object' && typeof value.toDate === 'function') return value.toDate();
    if (value instanceof Date) return value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId: string | undefined = body?.paymentId;
    const fallback: Partial<PaymentDoc> | undefined = body?.payment;

    if (!paymentId && !fallback) {
      return NextResponse.json({ ok: false, error: 'paymentId or payment payload is required' }, { status: 400 });
    }

    let paymentData: PaymentDoc | null = null;

    // Try to find the payment by ID across known collections
    if (paymentId) {
      const collectionsToSearch = ['payments', 'subscriptionPayments', 'bulkPayments'];
      for (const col of collectionsToSearch) {
        const q = query(collection(db, col), where('__name__', '==', paymentId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const docSnap = snap.docs[0];
          paymentData = { id: docSnap.id, ...(docSnap.data() as any) };
          break;
        }
      }
    }

    if (!paymentData && fallback) {
      paymentData = { id: paymentId || 'unknown', ...(fallback as any) };
    }

    if (!paymentData) {
      return NextResponse.json({ ok: false, error: 'Payment not found' }, { status: 404 });
    }

    // Avoid duplicating invoice for the same payment
    try {
      const existingQ = query(collection(db, 'invoices'), where('payment_id', '==', paymentData.id), limit(1));
      const existingSnap = await getDocs(existingQ);
      if (!existingSnap.empty) {
        const doc = existingSnap.docs[0];
        return NextResponse.json({ ok: true, invoice: { id: doc.id, ...doc.data() } });
      }
    } catch {}

    const amount = paymentData.amount ?? paymentData.totalAmount ?? 0;
    const currency = paymentData.currency ?? 'USD';
    const createdAt = toDate(paymentData.createdAt) ?? new Date();
    const planName = paymentData.packageType || paymentData.planType || paymentData.planName || paymentData.plan || paymentData.subscription_type || paymentData.description || 'غير محدد';
    const userName = paymentData.userName || 'غير محدد';
    const userEmail = paymentData.userEmail || 'غير محدد';
    const status = paymentData.status === 'completed' ? 'paid' : paymentData.status === 'pending' ? 'pending' : 'pending';

    const invoicePayload = {
      invoice_number: generateInvoiceNumber(),
      payment_id: paymentData.id,
      user_id: paymentData.userId || null,
      user_name: userName,
      user_email: userEmail,
      plan_name: planName,
      amount,
      currency,
      status,
      created_at: createdAt,
      updated_at: new Date()
    };

    const ref = await addDoc(collection(db, 'invoices'), invoicePayload as any);

    return NextResponse.json({ ok: true, invoice: { id: ref.id, ...invoicePayload } });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}





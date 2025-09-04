import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore';

type CollectionName = 'payments' | 'subscriptionPayments' | 'bulkPayments' | 'invoices' | 'subscriptions';

async function getSample(name: CollectionName, orderField: string = 'createdAt') {
  try {
      const q = query(collection(db, name), orderBy(orderField, 'desc'), limit(5));
      const snap = await getDocs(q);
      const items = snap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          amount: data.amount ?? data.totalAmount ?? null,
          currency: data.currency ?? null,
          status: data.status ?? null,
          createdAt: (data.createdAt?.toDate?.() ? data.createdAt.toDate() : (data.createdAt || data.created_at || data.start_date || null)) ?? null,
          userId: data.userId ?? data.user_id ?? null,
          userName: data.userName ?? data.user_name ?? null,
          description: data.description ?? data.plan_name ?? data.packageType ?? null,
        };
      });
      return { ok: true, count: items.length, items };
  } catch (error: any) {
      return { ok: false, error: String(error), count: 0, items: [] };
  }
}

export async function GET() {
  try {
    const [payments, subscriptionPayments, bulkPayments, invoices, subscriptions] = await Promise.all([
      getSample('payments', 'createdAt'),
      getSample('subscriptionPayments', 'createdAt'),
      getSample('bulkPayments', 'createdAt'),
      getSample('invoices', 'created_at'),
      getSample('subscriptions', 'start_date'),
    ]);

    const hasData = [payments, subscriptionPayments, bulkPayments].some(r => r.ok && r.count > 0);

    return NextResponse.json({
      ok: true,
      hasData,
      collections: {
        payments,
        subscriptionPayments,
        bulkPayments,
        invoices,
        subscriptions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}





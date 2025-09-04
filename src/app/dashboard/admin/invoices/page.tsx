'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, RefreshCcw, Search } from 'lucide-react';

interface Invoice {
  id: string;
  invoice_number: string;
  payment_id?: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  plan_name?: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'cancelled' | string;
  created_at: any;
}

const formatDate = (dateLike: any) => {
  const date = (() => {
    if (!dateLike) return undefined as any;
    if (typeof dateLike === 'object' && typeof dateLike.toDate === 'function') return dateLike.toDate();
    if (dateLike instanceof Date) return dateLike;
    const d = new Date(dateLike);
    return isNaN(d.getTime()) ? undefined : d;
  })();
  if (!date) return 'غير محدد';
  return date.toLocaleDateString('ar-EG-u-ca-gregory', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getStatusBadge = (status: string) => {
  if (status === 'paid') return 'text-green-700 bg-green-100 border-green-200';
  if (status === 'pending') return 'text-yellow-700 bg-yellow-100 border-yellow-200';
  if (status === 'cancelled') return 'text-red-700 bg-red-100 border-red-200';
  return 'text-gray-700 bg-gray-100 border-gray-200';
};

export default function AdminInvoicesListPage() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'invoices'), orderBy('created_at', 'desc'));
      const snap = await getDocs(q);
      const rows: Invoice[] = [] as any;
      snap.forEach(doc => rows.push({ id: doc.id, ...(doc.data() as any) }));
      setInvoices(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = invoices.filter(i => {
    const hay = `${i.invoice_number || ''} ${i.user_name || ''} ${i.user_email || ''} ${i.plan_name || ''}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  return (
    <div className="container mx-auto px-6 py-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">الفواتير</h1>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          <RefreshCcw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      <Card className="p-4 mb-4">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث برقم الفاتورة أو اسم المستخدم أو الباقة"
            className="w-full pl-3 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            aria-label="بحث الفواتير"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-right">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right">المستخدم</th>
                <th className="px-4 py-3 text-right">الباقة</th>
                <th className="px-4 py-3 text-right">المبلغ</th>
                <th className="px-4 py-3 text-right">التاريخ</th>
                <th className="px-4 py-3 text-right">الحالة</th>
                <th className="px-4 py-3 text-right">عرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">لا توجد فواتير</td>
                </tr>
              ) : filtered.map(inv => (
                <tr key={inv.id}>
                  <td className="px-4 py-3 font-medium text-gray-900">{inv.invoice_number || `INV-${inv.id.slice(0,8)}`}</td>
                  <td className="px-4 py-3">
                    <div className="text-gray-900">{inv.user_name || '-'}</div>
                    <div className="text-xs text-gray-500">{inv.user_email || '-'}</div>
                  </td>
                  <td className="px-4 py-3">{inv.plan_name || '-'}</td>
                  <td className="px-4 py-3 font-medium">{(inv.amount || 0).toLocaleString()} {inv.currency || 'EGP'}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(inv.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(inv.status)}`}>
                      {inv.status === 'paid' ? 'مدفوع' : inv.status === 'pending' ? 'معلق' : inv.status === 'cancelled' ? 'ملغي' : inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/admin/invoices/${inv.id}`} className="text-purple-600 hover:underline">التفاصيل</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}





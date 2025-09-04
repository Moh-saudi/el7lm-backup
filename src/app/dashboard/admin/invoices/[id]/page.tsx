'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Download } from 'lucide-react';

const formatDateTime = (dateLike: any) => {
  const d = (() => {
    if (!dateLike) return undefined as any;
    if (typeof dateLike === 'object' && typeof dateLike.toDate === 'function') return dateLike.toDate();
    if (dateLike instanceof Date) return dateLike;
    const v = new Date(dateLike);
    return isNaN(v.getTime()) ? undefined : v;
  })();
  if (!d) return 'غير محدد';
  return d.toLocaleString('ar-EG-u-ca-gregory', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function InvoiceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'invoices', params.id));
        if (!snap.exists()) {
          router.push('/dashboard/admin/invoices');
          return;
        }
        setInvoice({ id: snap.id, ...snap.data() });
      } finally {
        setLoading(false);
      }
    };
    if (params?.id) load();
  }, [params, router]);

  const handlePrint = () => {
    if (!printRef.current) return;
    const printContents = printRef.current.innerHTML;
    const win = window.open('', '', 'height=700,width=900');
    if (!win) return;
    win.document.write('<html><head><title>Invoice</title>');
    win.document.write('<style>body{font-family:Cairo,Arial,sans-serif;padding:24px} .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px} .badge{padding:2px 8px;border-radius:9999px;border:1px solid #e5e7eb;font-size:12px} .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}</style>');
    win.document.write('</head><body dir="rtl">');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">جاري التحميل...</div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">لم يتم العثور على الفاتورة</div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8" dir="rtl">
      <Button variant="ghost" onClick={() => router.push('/dashboard/admin/invoices')}>
        <ArrowRight className="w-4 h-4 ml-2" /> العودة للقائمة
      </Button>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">فاتورة {invoice.invoice_number}</h1>
        <Button onClick={handlePrint}><Download className="w-4 h-4 ml-2" /> طباعة/تنزيل</Button>
      </div>

      <Card className="p-6">
        <div ref={printRef}>
          <div className="header">
            <div>
              <div className="text-xl font-bold">el7lm</div>
              <div className="text-sm text-gray-500">منصة إدارة الاشتراكات</div>
            </div>
            <div>
              <div>رقم الفاتورة: {invoice.invoice_number}</div>
              <div>التاريخ: {formatDateTime(invoice.created_at)}</div>
              <div>الحالة: <span className="badge">{invoice.status}</span></div>
            </div>
          </div>

          <div className="grid">
            <div>
              <div className="font-medium">العميل</div>
              <div>{invoice.user_name || '-'}</div>
              <div className="text-sm text-gray-500">{invoice.user_email || '-'}</div>
            </div>
            <div>
              <div className="font-medium">تفاصيل الاشتراك</div>
              <div>الباقة: {invoice.plan_name || '-'}</div>
              <div>طريقة الدفع: {invoice.payment_method || '-'}</div>
            </div>
          </div>

          <div className="mt-4">
            <table className="w-full text-[14px]">
              <thead>
                <tr>
                  <th className="text-right p-2">الوصف</th>
                  <th className="text-right p-2">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">{invoice.plan_name || 'اشتراك'}</td>
                  <td className="p-2">{(invoice.amount || 0).toLocaleString()} {invoice.currency || 'EGP'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
}



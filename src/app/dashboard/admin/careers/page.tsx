'use client';

import React, { useEffect, useState } from 'react';

export default function CareersAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/careers/applications');
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Failed');
        setItems(json.items || []);
      } catch (e: any) {
        setError(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
          <div className="p-6" dir="rtl">
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">طلبات التوظيف</h1>
        {loading && <p>جاري التحميل...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-3">الوظيفة/الوظائف</th>
                  <th className="py-2 px-3">الاسم</th>
                  <th className="py-2 px-3">البريد</th>
                  <th className="py-2 px-3">الهاتف</th>
                  <th className="py-2 px-3">الدولة</th>
                  <th className="py-2 px-3">المحافظة</th>
                  <th className="py-2 px-3">الخبرات</th>
                  <th className="py-2 px-3">لينكدإن</th>
                  <th className="py-2 px-3">فيسبوك</th>
                  <th className="py-2 px-3">تاريخ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3">
                      {Array.isArray(it.roles) ? (it.roles.join('، ') || '-') : (it.role || '-')}
                    </td>
                    <td className="py-2 px-3">{it.fullName}</td>
                    <td className="py-2 px-3">{it.email}</td>
                    <td className="py-2 px-3">{it.phone}</td>
                    <td className="py-2 px-3">{it.country || '-'}</td>
                    <td className="py-2 px-3">{it.governorate || '-'}</td>
                    <td className="py-2 px-3 max-w-md truncate" title={it.experience}>{it.experience}</td>
                    <td className="py-2 px-3">
                      {it.linkedin ? <a className="text-blue-600" href={it.linkedin} target="_blank">رابط</a> : '-'}
                    </td>
                    <td className="py-2 px-3">
                      {it.facebook ? <a className="text-blue-600" href={it.facebook} target="_blank">رابط</a> : '-'}
                    </td>
                    <td className="py-2 px-3">{it.createdAt?.seconds ? new Date(it.createdAt.seconds * 1000).toLocaleString('ar-EG') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}



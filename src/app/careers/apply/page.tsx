'use client';

import React, { useState, Suspense } from 'react';
import { CheckCircle2, ArrowRight, Phone, PartyPopper } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import PublicResponsiveLayoutWrapper from '@/components/layout/PublicResponsiveLayout';

function ApplyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleFromQuery = searchParams.get('role') || '';
// نستخدم API route لضمان إنشاء إشعار للإدارة

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    governorate: '',
    experience: '',
    linkedin: '',
    facebook: '',
    notes: ''
  });
  const availableRoles = [
    { key: 'sales', label: 'وظائف المبيعات' },
    { key: 'clubManagement', label: 'إدارة الأندية' },
    { key: 'academyManagement', label: 'إدارة الأكاديمية' },
    { key: 'scoutsManagement', label: 'إدارة الكشافين' },
    { key: 'tournamentsManagement', label: 'إدارة البطولات' },
    { key: 'trialsManagement', label: 'إدارة الاختبارات' },
    { key: 'customerRelations', label: 'علاقات العملاء' },
    { key: 'accountants', label: 'المحاسبين' },
    { key: 'performanceAnalysts', label: 'محللي الأداء' },
    { key: 'nextjsDevelopers', label: 'مبرمجين Next.js' },
    { key: 'callCenter', label: 'كول سنتر' },
    { key: 'videoPhotographer', label: 'مصور فيديو' },
    { key: 'directSales', label: 'مبيعات مباشرة' },
    { key: 'directCustomerCare', label: 'رعاية عملاء مباشرة' }
  ];
  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    const candidate = roleFromQuery.trim();
    return candidate && availableRoles.some(r => r.key === candidate) ? [candidate] : [];
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (selectedRoles.length === 0) {
      setLoading(false);
      setError('يجب اختيار وظيفة واحدة على الأقل');
      return;
    }
    try {
      const res = await fetch('/api/careers/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          roles: selectedRoles
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'فشل إرسال الطلب');
      }
      setSuccess('تم إرسال طلبك بنجاح');
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicResponsiveLayoutWrapper>
      <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">نموذج التقديم</h1>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
          >
            العودة
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {roleFromQuery && <p className="text-gray-600 mb-6">الدور المبدئي: {roleFromQuery}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 font-semibold">اختر الوظيفة/الوظائف</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableRoles.map((r) => (
                <label key={r.key} className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(r.key)}
                    onChange={(e) => {
                      setSelectedRoles(prev => e.target.checked ? [...prev, r.key] : prev.filter(k => k !== r.key));
                    }}
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">الاسم الكامل</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="اكتب اسمك الكامل" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">البريد الإلكتروني</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="name@example.com" />
            </div>
            <div>
              <label className="block text-sm mb-1">الهاتف</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="مثال: +2010xxxxxxx" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">الدولة</label>
              <input name="country" value={form.country} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="اكتب الدولة" />
            </div>
            <div>
              <label className="block text-sm mb-1">المحافظة</label>
              <input name="governorate" value={form.governorate} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" required placeholder="اكتب المحافظة / الولاية" />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">الخبرات (سنوات وخلاصة)</label>
            <textarea name="experience" value={form.experience} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" rows={4} required placeholder="سنوات الخبرة + نبذة مختصرة" />
          </div>
          <div>
            <label className="block text-sm mb-1">رابط لينكدإن (اختياري)</label>
            <input name="linkedin" value={form.linkedin} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="رابط لينكدإن" required />
          </div>
          <div>
            <label className="block text-sm mb-1">رابط فيسبوك</label>
            <input name="facebook" value={form.facebook} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" placeholder="رابط فيسبوك" required />
          </div>
          <div>
            <label className="block text-sm mb-1">ملاحظات إضافية</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="w-full border rounded-lg px-3 py-2" rows={3} placeholder="ملاحظات إضافية" required />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
        {success && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>تم إرسال طلبك بنجاح</span>
            </div>
            <div className="text-sm text-green-800">
              <p className="mb-2">سنتواصل معك قريباً. لأي استفسار عاجل يمكنك التواصل معنا على:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> مصر: +20 10 1779 9580</li>
                <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> قطر: +974 72 053 188</li>
              </ul>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <PartyPopper className="w-4 h-4" /> العودة للرئيسية
              </button>
            </div>
          </div>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50">
            {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
        </form>
      </div>
    </div>
    </PublicResponsiveLayoutWrapper>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <ApplyForm />
    </Suspense>
  );
}



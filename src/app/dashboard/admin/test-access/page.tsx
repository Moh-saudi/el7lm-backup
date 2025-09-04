'use client';

import React from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';

export default function AdminTestAccessPage() {
  const { user, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500" />
          <p className="text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        يجب تسجيل الدخول للوصول إلى صفحة اختبار الصلاحيات
      </div>
    );
  }

  const isAdmin = userData?.accountType === 'admin' || userData?.role === 'admin';

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">اختبار الصلاحيات</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">بيانات المستخدم</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-medium">البريد:</span> <span dir="ltr">{user.email || '—'}</span>
            </div>
            <div>
              <span className="font-medium">النوع:</span> {userData?.accountType || '—'}
            </div>
            <div>
              <span className="font-medium">الدور:</span> {userData?.role || '—'}
            </div>
            <div>
              <span className="font-medium">الحالة:</span> {userData?.isActive ? 'نشط' : 'معطل'}
            </div>
            <div>
              <span className="font-medium">الدولة:</span> {userData?.country || '—'}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">نتيجة الاختبار</h2>
          {isAdmin ? (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              لديك صلاحيات مدير (Admin) ويمكنك الوصول إلى جميع صفحات الإدارة
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
              ليس لديك صلاحيات مدير. اتصل بالمسؤول لمنحك صلاحيات مناسبة
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




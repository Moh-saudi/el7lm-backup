'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/firebase/auth-provider';
import { organizationReferralService } from '@/lib/organization/organization-referral-service';
import type { OrganizationReferral } from '@/types/organization-referral';
import { Copy, Link2, Users, Plus } from 'lucide-react';

type OrgType = 'club' | 'academy' | 'trainer' | 'agent';

interface OrgReferralSummaryCardProps {
  accountType: OrgType;
}

export default function OrgReferralSummaryCard({ accountType }: OrgReferralSummaryCardProps) {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<OrganizationReferral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      setLoading(true);
      setError('');
      try {
        const list = await organizationReferralService.getOrganizationReferrals(user.uid);
        setReferrals(list);
      } catch (e) {
        setError('تعذر تحميل أكواد الإحالة');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.uid]);

  const activeCount = referrals.filter(r => r.isActive).length;
  const primary = referrals[0];

  const copy = (text: string) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <Card className="p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold">إدارة الإحالات</h3>
        </div>
        <Link href={`/dashboard/${accountType}/referrals`} className="inline-flex">
          <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700 text-white">
            <Link2 className="w-4 h-4" />
            صفحة الإحالات
          </Button>
        </Link>
      </div>

      {loading && <p className="mt-3 text-xs text-gray-500">جاري التحميل...</p>}
      {error && <p className="mt-3 text-xs text-red-600" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg border">
            <div className="text-[11px] text-gray-500">إجمالي الأكواد</div>
            <div className="text-lg font-bold">{referrals.length}</div>
          </div>
          <div className="p-3 rounded-lg border">
            <div className="text-[11px] text-gray-500">الأكواد المفعّلة</div>
            <div className="text-lg font-bold">{activeCount}</div>
          </div>
          <Link href={`/dashboard/${accountType}/referrals`} className="p-3 rounded-lg border hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-gray-500">إنشاء/إدارة أكواد</div>
                <div className="text-sm font-semibold">انتقل لصفحة الإحالات</div>
              </div>
              <Plus className="w-4 h-4 text-purple-600" />
            </div>
          </Link>
        </div>
      )}

      {primary && (
        <div className="mt-3 p-3 rounded-lg bg-gray-50 border">
          <div className="text-[11px] text-gray-600 mb-1">أقرب كود</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-mono px-2 py-1 rounded bg-white border">{primary.referralCode}</span>
            <Button size="sm" variant="outline" onClick={() => copy(primary.referralCode)} className="gap-1 border-purple-200 text-purple-700 hover:bg-purple-50">
              <Copy className="w-4 h-4" />نسخ الكود
            </Button>
            <Button size="sm" variant="outline" onClick={() => copy(primary.inviteLink)} className="gap-1 border-purple-200 text-purple-700 hover:bg-purple-50">
              <Link2 className="w-4 h-4" />نسخ الرابط
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}



'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DreamAcademyCategory, DreamAcademyCategoryId } from '@/types/dream-academy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw } from 'lucide-react';
import { getCurrencyRates, getCurrencyInfo, convertCurrency as convertCurrencyLib, forceUpdateRates } from '@/lib/currency-rates';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';

const DEFAULT_CATEGORIES: DreamAcademyCategory[] = [
  { id: 'english', title: 'English (Football)', basePriceUSD: 15, allowedPaymentMethods: ['wallet', 'geidea'], isActive: true },
  { id: 'french', title: 'French (Football)', basePriceUSD: 15, allowedPaymentMethods: ['wallet', 'geidea'], isActive: true },
  { id: 'spanish', title: 'Spanish (Football)', basePriceUSD: 15, allowedPaymentMethods: ['wallet', 'geidea'], isActive: true },
  { id: 'portuguese', title: 'Portuguese (Football)', basePriceUSD: 15, allowedPaymentMethods: ['wallet', 'geidea'], isActive: true },
  { id: 'skills', title: 'Skills', basePriceUSD: 12, allowedPaymentMethods: ['wallet', 'geidea'], isActive: true },
  { id: 'life_coach', title: 'Life Coach', basePriceUSD: 20, allowedPaymentMethods: ['wallet', 'geidea'], isActive: true },
];

const SUPPORTED_CURRENCIES = ['USD', 'EGP', 'QAR', 'SAR', 'AED', 'EUR'];

export default function AdminDreamAcademySettingsPage() {
  const [categories, setCategories] = useState<DreamAcademyCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [currencyRates, setCurrencyRates] = useState<any>({});
  const [updatingRates, setUpdatingRates] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      // Load categories
      const snap = await getDocs(collection(db, 'dream_academy_categories'));
      if (!snap.empty) {
        const loaded: DreamAcademyCategory[] = snap.docs.map(d => d.data() as DreamAcademyCategory);
        setCategories(loaded);
      }
      const rates = await getCurrencyRates();
      setCurrencyRates(rates);
      setLoading(false);
    };
    init();
  }, []);

  const saveAll = async () => {
    await Promise.all(
      categories.map(cat => setDoc(doc(db, 'dream_academy_categories', cat.id), { ...cat, updatedAt: new Date() }))
    );
  };

  const refreshRates = async () => {
    setUpdatingRates(true);
    const rates = await forceUpdateRates();
    setCurrencyRates(rates);
    setUpdatingRates(false);
  };

  return (
    <AccountTypeProtection allowedTypes={["admin"]}>
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">إعدادات أكاديمية الحلم</h1>
        <div className="flex gap-2">
          <Button onClick={refreshRates} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />تحديث أسعار الصرف</Button>
          <Button onClick={saveAll}><Save className="w-4 h-4 mr-2" />حفظ</Button>
        </div>
      </div>

      {loading ? (
        <div>جارِ التحميل...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat, idx) => (
            <Card key={cat.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">{cat.title}</div>
                <Badge variant={cat.isActive ? 'default' : 'secondary'}>{cat.isActive ? 'مفعّل' : 'معطل'}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-sm">السعر الأساسي (USD)</label>
                  <Input type="number" value={cat.basePriceUSD}
                    onChange={(e) => setCategories(cs => cs.map((c, i) => i === idx ? { ...c, basePriceUSD: Number(e.target.value) } : c))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm">طرق الدفع المسموحة</label>
                  <div className="flex gap-4 mt-2">
                    {['wallet','geidea'].map(pm => (
                      <label key={pm} className="flex items-center gap-2">
                        <Checkbox checked={cat.allowedPaymentMethods.includes(pm as any)}
                          onCheckedChange={(checked) => setCategories(cs => cs.map((c,i) => i===idx ? {
                            ...c,
                            allowedPaymentMethods: checked
                              ? Array.from(new Set([...(c.allowedPaymentMethods||[]), pm as any]))
                              : (c.allowedPaymentMethods||[]).filter(x => x !== pm)
                          } : c))}
                        /> {pm === 'wallet' ? 'المحفظة' : 'Geidea'}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm mb-2">الأسعار المحوّلة (حسب أسعار الصرف الحالية):</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUPPORTED_CURRENCIES.map(cur => {
                    const price = currencyRates && cur in currencyRates
                      ? convertCurrencyLib(cat.basePriceUSD, 'USD', cur, currencyRates)
                      : cat.basePriceUSD;
                    const info = getCurrencyInfo(cur, currencyRates);
                    return (
                      <div key={cur} className="text-sm bg-gray-50 rounded px-2 py-1 flex items-center justify-between">
                        <span>{cur}</span>
                        <span>{Math.round(price)} {info?.symbol || ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </AccountTypeProtection>
  );
}



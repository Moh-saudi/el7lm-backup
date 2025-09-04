'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy, where, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DreamAcademyCategory, DreamAcademyCategoryId } from '@/types/dream-academy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const GROUPS = [
  { id: 'languages', title: 'اللغات' },
  { id: 'life_skills', title: 'المهارات الحياتية' },
  { id: 'living_skills', title: 'المهارات المعيشية' },
  { id: 'career', title: 'المسار المهني' },
  { id: 'other', title: 'أخرى' },
] as const;

export default function AdminDreamAcademyCategoriesPage() {
  const [items, setItems] = useState<DreamAcademyCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDocId, setEditDocId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<DreamAcademyCategory>>({
    id: 'tactics' as any,
    title: 'التكتيكات',
    titleAr: 'التكتيكات',
    titleEn: 'Tactics',
    group: 'career',
    color: '#6d28d9',
    basePriceUSD: 20,
    allowedPaymentMethods: ['wallet','geidea'],
    isActive: true,
  });

  const fetchAll = async () => {
    setLoading(true);
    const q = query(collection(db, 'dream_academy_categories'), orderBy('id','asc'));
    const snap = await getDocs(q);
    const rowsRaw = snap.docs.map(d => {
      const data = d.data() as any;
      return { ...(data || {}), id: (data && data.id) ? data.id : d.id, _docId: d.id } as any;
    }) as (DreamAcademyCategory & { _docId: string })[];
    // Deduplicate by logical id; prefer canonical where _docId === id
    const byId = new Map<string, any>();
    for (const r of rowsRaw) {
      const existing = byId.get((r as any).id);
      if (!existing) {
        byId.set((r as any).id, r);
      } else {
        const preferR = ((r as any)._docId === (r as any).id);
        const preferExisting = ((existing as any)._docId === (existing as any).id);
        if (preferR && !preferExisting) {
          byId.set((r as any).id, r);
        }
      }
    }
    const rows = Array.from(byId.values()) as DreamAcademyCategory[];
    setItems(rows);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    if (!draft.id || !draft.title) return;
    const payload: DreamAcademyCategory = {
      id: draft.id as DreamAcademyCategoryId,
      title: draft.title,
      titleAr: (draft as any).titleAr,
      titleEn: (draft as any).titleEn,
      group: (draft as any).group || 'other',
      color: draft.color || '#0ea5e9',
      basePriceUSD: Number(draft.basePriceUSD || 0),
      currency: (draft as any).currency || 'USD',
      allowedPaymentMethods: (draft.allowedPaymentMethods as any) || ['wallet','geidea'],
      isActive: draft.isActive ?? true,
      createdAt: (draft as any).createdAt || new Date(),
      updatedAt: new Date(),
    };
    if (editDocId) {
      // Update existing document by its Firestore doc id, and do NOT change logical id
      await updateDoc(doc(db, 'dream_academy_categories', editDocId), {
        title: payload.title,
        titleAr: payload.titleAr,
        titleEn: payload.titleEn,
        group: payload.group,
        color: payload.color,
        basePriceUSD: payload.basePriceUSD,
        currency: payload.currency,
        allowedPaymentMethods: payload.allowedPaymentMethods,
        isActive: payload.isActive,
        updatedAt: new Date(),
      } as any);
    } else {
      // Create new using logical id as document id (for consistency going forward)
      await setDoc(doc(db, 'dream_academy_categories', payload.id), payload as any, { merge: true });
    }
    setDraft({ id: 'tactics' as any, title: '', titleAr: '', titleEn: '', group: 'other', color: '#0ea5e9', basePriceUSD: 0, currency: 'USD', allowedPaymentMethods: ['wallet','geidea'], isActive: true });
    setEditDocId(null);
    await fetchAll();
  };

  const toggleActive = async (c: DreamAcademyCategory) => {
    const docId = (c as any)._docId || (c as any).id;
    await updateDoc(doc(db, 'dream_academy_categories', docId), { isActive: !c.isActive, updatedAt: new Date() });
    await fetchAll();
  };

  const remove = async (c: DreamAcademyCategory) => {
    // block deletion if there are sources using this category
    const qs = await getDocs(query(collection(db, 'dream_academy_sources'), where('categoryId','==', (c as any).id)));
    if (!qs.empty) {
      alert('لا يمكن حذف الفئة لأنها مرتبطة بفيديوهات. قم بتعديل الفئة أو نقل الفيديوهات أولاً.');
      return;
    }
    const docId = (c as any)._docId || (c as any).id;
    await deleteDoc(doc(db, 'dream_academy_categories', docId));
    await fetchAll();
  };

  const isEditing = !!editDocId;
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">إدارة فئات أكاديمية الحلم (ديناميكي)</h1>
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-sm">المعرف (id){isEditing ? ' — لا يمكن تعديله أثناء التعديل' : ''}</label>
            <Input placeholder="tactics" value={draft.id as any || ''} onChange={(e)=>setDraft(d=>({ ...d, id: e.target.value as any }))} disabled={isEditing} />
          </div>
          <div>
            <label className="text-sm">العنوان</label>
            <Input placeholder="التكتيكات" value={draft.title || ''} onChange={(e)=>setDraft(d=>({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">العنوان (AR)</label>
            <Input placeholder="العنوان بالعربية" value={(draft as any).titleAr || ''} onChange={(e)=>setDraft(d=>({ ...d, titleAr: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">Title (EN)</label>
            <Input placeholder="Title in English" value={(draft as any).titleEn || ''} onChange={(e)=>setDraft(d=>({ ...d, titleEn: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">المجموعة</label>
            <Select value={(draft as any).group || 'other'} onValueChange={(v)=>setDraft(d=>({ ...d, group: v as any }))}>
              <SelectTrigger><SelectValue placeholder="Group" /></SelectTrigger>
              <SelectContent>
                {GROUPS.map(g => (<SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">اللون</label>
            <div className="flex items-center gap-2">
              <Input type="color" value={draft.color || '#0ea5e9'} onChange={(e)=>setDraft(d=>({ ...d, color: e.target.value }))} className="w-12 h-10 p-1" />
              <Input placeholder="#0ea5e9" value={draft.color || ''} onChange={(e)=>setDraft(d=>({ ...d, color: e.target.value }))} className="flex-1" />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {['#0ea5e9','#22c55e','#ef4444','#a855f7','#f59e0b','#06b6d4','#10b981','#64748b'].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={()=>setDraft(d=>({ ...d, color: c }))}
                  className={`w-6 h-6 rounded-full border ${draft.color===c?'ring-2 ring-offset-1 ring-slate-400':''}`}
                  style={{ background: c }}
                  aria-label={`اختر اللون ${c}`}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm">السعر (USD)</label>
            <Input type="number" value={draft.basePriceUSD || 0} onChange={(e)=>setDraft(d=>({ ...d, basePriceUSD: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-sm">العملة</label>
            <Select value={(draft as any).currency || 'USD'} onValueChange={(v)=>setDraft(d=>({ ...d, currency: v }))}>
              <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
              <SelectContent>
                {['USD','EGP','QAR','SAR','AED','EUR'].map(c => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button className="bg-emerald-600 text-white" onClick={handleAdd}>{isEditing ? 'تحديث' : 'إضافة'}</Button>
            {isEditing && (
              <Button variant="outline" onClick={()=>{ setEditDocId(null); setDraft({ id: 'tactics' as any, title: '', titleAr: '', titleEn: '', group: 'other', color: '#0ea5e9', basePriceUSD: 0, currency: 'USD', allowedPaymentMethods: ['wallet','geidea'], isActive: true }); }}>إلغاء</Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div>جار التحميل...</div> : items.map((c)=> (
          <Card key={(c as any)._docId || (c as any).id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: c.color || '#0ea5e9' }} />
                <Badge variant={c.isActive ? 'default' : 'secondary'}>{c.isActive ? 'مفعلة' : 'معطلة'}</Badge>
                <span className="text-sm text-gray-600">{c.group || 'other'}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={()=>{ setDraft({
                  id: (c as any).id as any,
                  title: c.title,
                  titleAr: (c as any).titleAr,
                  titleEn: (c as any).titleEn,
                  group: c.group,
                  color: c.color,
                  basePriceUSD: c.basePriceUSD,
                  currency: (c as any).currency || 'USD',
                  allowedPaymentMethods: c.allowedPaymentMethods,
                  isActive: c.isActive,
                }); setEditDocId((c as any)._docId || (c as any).id); }}>تعديل</Button>
                <Button size="sm" variant={c.isActive ? 'outline':'default'} onClick={()=>toggleActive(c)}>{c.isActive ? 'تعطيل' : 'تفعيل'}</Button>
                <Button size="sm" variant="destructive" onClick={()=>remove(c)}>حذف</Button>
              </div>
            </div>
            <div className="font-semibold mb-1">{c.title} { (c as any).titleAr || (c as any).titleEn ? <span className="text-xs text-gray-500">(AR: {(c as any).titleAr || '-'} | EN: {(c as any).titleEn || '-'})</span> : null }</div>
            <div className="text-xs text-gray-600">id: {(c as any).id}</div>
            <div className="text-xs text-gray-600 mt-1">السعر الأساسي: {c.basePriceUSD} USD</div>
          </Card>
        ))}
      </div>
    </div>
  );
}



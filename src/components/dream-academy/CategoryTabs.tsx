'use client';

import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Languages, Home, Briefcase, Heart } from 'lucide-react';

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

const STATIC_GROUPS = [
  { id: 'languages', label: 'اللغات', icon: Languages },
  { id: 'life_skills', label: 'مهارات حياتية', icon: Heart },
  { id: 'living_skills', label: 'مهارات معيشية', icon: Home },
  { id: 'career', label: 'تطوير مهني', icon: Briefcase },
  { id: 'other', label: 'أخرى', icon: Briefcase },
];

export default function CategoryTabs({ selected, onSelect }: Props) {
  const [groups, setGroups] = useState<typeof STATIC_GROUPS>(STATIC_GROUPS);

  useEffect(() => {
    // إذا أردنا لاحقاً إظهار/إخفاء مجموعات حسب وجود فئات فعالة فقط
    // يمكننا هنا قراءة dream_academy_categories وتجميع المجموعات المستخدمة
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'dream_academy_categories')));
        const cats = snap.docs.map(d => d.data() as any).filter(c => c.isActive !== false);
        const used = new Set<string>(cats.map(c => c.group || 'other'));
        const ordered = STATIC_GROUPS.filter(g => used.has(g.id));
        setGroups(ordered.length > 0 ? ordered : STATIC_GROUPS);
      } catch {
        setGroups(STATIC_GROUPS);
      }
    })();
  }, []);
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-snap-x px-1 -mx-1">
      {groups.map(tab => {
        const Icon = tab.icon;
        const active = selected === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`px-4 py-2 rounded-xl border transition whitespace-nowrap scroll-snap-align-start ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
          >
            <span className="inline-flex items-center gap-2"><Icon className="w-4 h-4" /> {tab.label}</span>
          </button>
        );
      })}
      </div>
    </div>
  );
}



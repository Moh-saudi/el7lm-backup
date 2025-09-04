'use client';

import React from 'react';
import { Languages } from 'lucide-react';

type LangId = 'english' | 'french' | 'spanish' | 'portuguese';

interface Props {
  selected: LangId;
  onSelect: (id: LangId) => void;
}

const LANG_TABS: { id: LangId; label: string }[] = [
  { id: 'english', label: 'الإنجليزية' },
  { id: 'french', label: 'الفرنسية' },
  { id: 'spanish', label: 'الإسبانية' },
  { id: 'portuguese', label: 'البرتغالية' },
];

export default function LanguageTabs({ selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 -mx-1">
      <div className="shrink-0 px-3 py-2 rounded-xl bg-gray-100 text-gray-700 flex items-center gap-2">
        <Languages className="w-4 h-4" />
        <span className="text-sm">لغات كرة القدم</span>
      </div>
      {LANG_TABS.map(tab => {
        const active = selected === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={`px-4 py-2 rounded-xl border whitespace-nowrap ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}



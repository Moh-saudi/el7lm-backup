'use client';

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Languages, 
  GraduationCap, 
  Heart,
  Home,
  Briefcase,
  MessageSquare,
} from 'lucide-react';
import DreamAcademyVideosSection from '@/components/dream-academy/DreamAcademyVideosSection';
import type { DreamAcademyCategoryId } from '@/types/dream-academy';
import AcademyHero from '@/components/dream-academy/AcademyHero';
import CategoryTabs from '@/components/dream-academy/CategoryTabs';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { DreamAcademyCategory } from '@/types/dream-academy';

export default function DreamAcademyPage() {
  const [selectedGroup, setSelectedGroup] = useState<'languages'|'life_skills'|'living_skills'|'career'|'other'>('languages');
  const [allCategories, setAllCategories] = useState<DreamAcademyCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<DreamAcademyCategoryId>('english');

  const uniqueById = React.useCallback((cats: DreamAcademyCategory[]) => {
    const map = new Map<string, DreamAcademyCategory>();
    for (const c of cats) {
      if (!map.has(c.id as any)) {
        map.set(c.id as any, c);
      }
    }
    return Array.from(map.values());
  }, []);

  // Load dynamic categories once
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'dream_academy_categories'));
        const cats = snap.docs.map(d => d.data() as DreamAcademyCategory).filter(c => (c as any).isActive !== false);
        const deduped = uniqueById(cats);
        setAllCategories(deduped);
        // Initialize default selected category for current group
        const firstInGroup = deduped.find(c => (c.group || 'other') === selectedGroup);
        if (firstInGroup) setSelectedCategoryId(firstInGroup.id as DreamAcademyCategoryId);
      } catch {
        // ignore
      }
    })();
  }, []);

  // When group changes, pick first available category in that group
  useEffect(() => {
    const inGroup = uniqueById(allCategories.filter(c => (c.group || 'other') === selectedGroup));
    if (inGroup.length > 0) {
      setSelectedCategoryId(inGroup[0].id as DreamAcademyCategoryId);
    }
  }, [selectedGroup, allCategories]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero modern */}
        <div className="mb-8">
          <AcademyHero />
        </div>
        
        {/* Groups Tabs */}
        <div className="mb-4">
          <CategoryTabs selected={selectedGroup} onSelect={(g)=>setSelectedGroup(g as any)} />
        </div>
        {/* Category selection within group (dynamic) */}
        <div className="mb-6 overflow-x-auto no-scrollbar">
          <div className="flex gap-2">
            {uniqueById(allCategories.filter(c => (c.group || 'other') === selectedGroup)).map(c => {
              const active = selectedCategoryId === (c.id as any);
            return (
                <button key={c.id} onClick={()=>setSelectedCategoryId(c.id as any)} className={`px-4 py-2 rounded-xl border whitespace-nowrap ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200 hover:border-blue-300'}`}>
                  {(c as any).titleAr || c.title || (c as any).titleEn || c.id}
              </button>
            );
          })}
                </div>
              </div>

        {/* محتوى القسم الحقيقي أدناه */}

        {/* Videos Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">فيديوهات القسم</h2>
          <DreamAcademyVideosSection categoryId={selectedCategoryId} />
        </div>

        {/* Call to Action */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">ابدأ رحلة التعلم اليوم!</h2>
            <p className="text-lg mb-6 opacity-90">
              انضم إلى آلاف الطلاب الذين يطورون مهاراتهم مع أكاديمية الحلم
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <BookOpen className="w-5 h-5 mr-2" />
                استكشف جميع الدورات
              </Button>
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300">
                <MessageSquare className="w-5 h-5 mr-2" />
                تواصل معنا
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 

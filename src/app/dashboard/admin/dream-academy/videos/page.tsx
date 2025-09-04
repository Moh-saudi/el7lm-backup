'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, addDoc, query, where, orderBy, getDocs, deleteDoc, doc, updateDoc, limit as fslimit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DreamAcademySource, DreamAcademyCategoryId } from '@/types/dream-academy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, CheckCircle, XCircle, Search, Download, Play, ListPlus } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';
import ReactPlayer from 'react-player';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

function extractYouTubeIds(rawUrl: string): { videoId?: string; playlistId?: string } {
  try {
    const url = new URL(rawUrl);
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.split('/')[1];
      return { videoId };
    }
    if (url.hostname.includes('youtube.com')) {
      const v = url.searchParams.get('v') || undefined;
      const list = url.searchParams.get('list') || undefined;
      const isEmbed = url.pathname.startsWith('/embed/');
      const embedId = isEmbed ? url.pathname.split('/')[2] : undefined;
      return { videoId: v || embedId, playlistId: list };
    }
  } catch {}
  return {};
}

// سيتم استبدال هذه المصفوفة بتحميل ديناميكي من Firestore
const FALLBACK_CATEGORIES: { id: DreamAcademyCategoryId; title: string }[] = [
  { id: 'english', title: 'English (Football)' },
  { id: 'french', title: 'French (Football)' },
  { id: 'spanish', title: 'Spanish (Football)' },
  { id: 'portuguese', title: 'Portuguese (Football)' },
  { id: 'skills', title: 'Skills' },
  { id: 'life_coach', title: 'Life Coach' },
];

export default function AdminDreamAcademyVideosPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<DreamAcademySource[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiKeyPresent, setApiKeyPresent] = useState<boolean | null>(null);
  const [filterCategory, setFilterCategory] = useState<DreamAcademyCategoryId | 'all'>('all');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'playlist'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statsMap, setStatsMap] = useState<Record<string, { views: number; likes: number }>>({});

  const [dynamicCategories, setDynamicCategories] = useState<{ id: DreamAcademyCategoryId; title: string }[]>(FALLBACK_CATEGORIES);
  const [draft, setDraft] = useState<Partial<DreamAcademySource>>({
    provider: 'youtube',
    sourceType: 'video',
    url: '',
    categoryId: 'english',
    isActive: true,
  });

  const filteredSources = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sources
      .filter(s => (filterCategory === 'all' ? true : s.categoryId === filterCategory))
      .filter(s => (filterType === 'all' ? true : s.sourceType === filterType))
      .filter(s => (filterStatus === 'all' ? true : filterStatus === 'active' ? s.isActive : !s.isActive))
      .filter(s => (
        term
          ? (
              (s.title || s.resolvedTitle || '').toLowerCase().includes(term) ||
              (s.channelTitle || '').toLowerCase().includes(term) ||
              (s.url || '').toLowerCase().includes(term)
            )
          : true
      ))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [sources, filterCategory, filterType, filterStatus, searchTerm]);

  const allVisibleSelected = useMemo(() => {
    if (filteredSources.length === 0) return false;
    return filteredSources.every(s => selectedIds.includes(s.id!));
  }, [filteredSources, selectedIds]);

  const toggleSelectAllVisible = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(filteredSources.map(s => s.id));
      setSelectedIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const toAdd = filteredSources.map(s => s.id!).filter(Boolean);
      setSelectedIds(prev => Array.from(new Set([...prev, ...toAdd])));
    }
  };

  const toggleSelect = (id?: string) => {
    if (!id) return;
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const bulkSetActive = async (active: boolean) => {
    const ids = selectedIds.slice();
    for (const id of ids) {
      try { await updateDoc(doc(db, 'dream_academy_sources', id), { isActive: active }); } catch {}
    }
    setSelectedIds([]);
    await fetchSources();
  };

  const bulkChangeCategory = async (categoryId: DreamAcademyCategoryId) => {
    const ids = selectedIds.slice();
    for (const id of ids) {
      try { await updateDoc(doc(db, 'dream_academy_sources', id), { categoryId }); } catch {}
    }
    setSelectedIds([]);
    await fetchSources();
  };

  const bulkDelete = async () => {
    const ids = selectedIds.slice();
    for (const id of ids) {
      try { await deleteDoc(doc(db, 'dream_academy_sources', id)); } catch {}
    }
    setSelectedIds([]);
    await fetchSources();
  };

  const copyToClipboard = async (text?: string) => {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); alert('تم نسخ الرابط'); } catch {}
  };

  const fetchSources = async () => {
    setLoading(true);
    const q = query(collection(db, 'dream_academy_sources'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    const rows: DreamAcademySource[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    setSources(rows);
    setLoading(false);

    // Fetch platform stats (best-effort)
    const newStats: Record<string, { views: number; likes: number }> = {};
    await Promise.all(rows.map(async (s) => {
      if (!s.id) return;
      try {
        const res = await fetch(`/api/dream-academy/stats?sourceId=${s.id}`);
        const data = await res.json();
        newStats[s.id] = { views: data?.views || 0, likes: data?.likes || 0 };
      } catch {
        // ignore
      }
    }));
    setStatsMap(newStats);
  };

  // helper: check if a source exists by a unique field
  const existsBy = async (field: 'videoId' | 'playlistId' | 'url', value?: string | null) => {
    if (!value) return false;
    const qx = query(collection(db, 'dream_academy_sources'), where(field, '==', value), fslimit(1));
    const snapx = await getDocs(qx);
    return !snapx.empty;
  };

  useEffect(() => {
    fetchSources();
    // Check YouTube API key presence
    (async () => {
      try {
        const res = await fetch('/api/debug/youtube-key');
        const data = await res.json();
        setApiKeyPresent(Boolean(data?.present));
      } catch {
        setApiKeyPresent(null);
      }
    })();

    // تحميل الفئات الديناميكية
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'dream_academy_categories')));
        const cats = snap.docs.map(d => d.data() as any).filter(c => c.isActive !== false);
        const mapped = cats.map((c:any) => ({ id: c.id as DreamAcademyCategoryId, title: c.title as string }));
        if (mapped.length > 0) {
          const unique = Array.from(new Map(mapped.map((c:any) => [c.id, c])).values());
          setDynamicCategories(unique as any);
        }
      } catch {}
    })();
  }, []);

  // Remove undefined values (Firestore doesn't accept undefined)
  const stripUndefined = (obj: any) => Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  );

  const handleAdd = async () => {
    if (!draft.url || !draft.sourceType || !draft.categoryId) return;
    const ids = extractYouTubeIds(draft.url);
    // Prevent duplicates
    const existsBy = async (field: 'videoId' | 'playlistId' | 'url', value?: string | null) => {
      if (!value) return false;
      const qx = query(collection(db, 'dream_academy_sources'), where(field, '==', value), fslimit(1));
      const snapx = await getDocs(qx);
      return !snapx.empty;
    };
    if (ids.videoId && await existsBy('videoId', ids.videoId)) {
      alert('هذا الفيديو مضاف مسبقاً');
      return;
    }
    if (ids.playlistId && await existsBy('playlistId', ids.playlistId)) {
      alert('هذه القائمة مضافة مسبقاً');
      return;
    }
    if (!ids.videoId && !ids.playlistId && await existsBy('url', draft.url)) {
      alert('هذا الرابط مضاف مسبقاً');
      return;
    }
    const payload: DreamAcademySource = {
      provider: 'youtube',
      sourceType: draft.sourceType,
      url: draft.url,
      categoryId: draft.categoryId as DreamAcademyCategoryId,
      order: draft.order || 0,
      isActive: draft.isActive ?? true,
      title: draft.title || undefined,
      resolvedTitle: (draft as any).resolvedTitle,
      resolvedDescription: (draft as any).resolvedDescription,
      durationSec: (draft as any).durationSec,
      itemCount: (draft as any).itemCount,
      channelTitle: (draft as any).channelTitle,
      thumbnailUrl: (draft as any).thumbnailUrl,
      videoId: ids.videoId,
      playlistId: ids.playlistId,
      createdBy: user?.uid || 'system',
      createdAt: new Date(),
    };
    await addDoc(collection(db, 'dream_academy_sources'), stripUndefined(payload) as any);
    setDraft({ provider: 'youtube', sourceType: 'video', url: '', categoryId: 'english', isActive: true });
    await fetchSources();
  };

  // duplicate removed

  const handleImportChannelPlaylists = async () => {
    if (apiKeyPresent === false) {
      alert('الرجاء ضبط YOUTUBE_API_KEY في .env.local أو في app_settings/youtube قبل الاستيراد');
      return;
    }
    if (!draft.url || !draft.categoryId) return;
    try {
      let next: string | null = null;
      const allPlaylists: { playlistId: string; title?: string }[] = [];
      do {
        const res = await fetch('/api/youtube/channel-playlists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelUrlOrId: draft.url, pageToken: next })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'فشل في جلب قوائم تشغيل القناة');
        for (const pl of data.items || []) {
          allPlaylists.push({ playlistId: pl.playlistId, title: pl.title });
        }
        next = data.nextPageToken;
      } while (next);

      if (allPlaylists.length === 0) {
        alert('لا توجد قوائم تشغيل متاحة لهذه القناة');
        return;
      }

      let importedCount = 0;
      let skippedCount = 0;
      for (const [idx, pl] of allPlaylists.entries()) {
        let nextItems: string | null = null;
        let page = 0;
        do {
          const res = await fetch('/api/youtube/playlist-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ playlistUrlOrId: pl.playlistId, pageToken: nextItems })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error || 'فشل في جلب عناصر القائمة');

          const items = (data.items || []) as any[];
          for (let i = 0; i < items.length; i++) {
            const it = items[i];
            // skip duplicates by videoId
            const qx = query(collection(db, 'dream_academy_sources'), where('videoId', '==', it.videoId), fslimit(1));
            const snapx = await getDocs(qx);
            if (!snapx.empty) { skippedCount++; continue; }
            const payload: DreamAcademySource = {
              provider: 'youtube',
              sourceType: 'video',
              url: `https://www.youtube-nocookie.com/watch?v=${it.videoId}`,
              categoryId: draft.categoryId as DreamAcademyCategoryId,
              order: (idx * 100000) + (page * 1000) + it.order,
              isActive: true,
              title: it.title,
              resolvedTitle: it.title,
              resolvedDescription: it.description,
              durationSec: it.durationSec,
              channelTitle: it.channelTitle,
              thumbnailUrl: it.thumbnailUrl,
              videoId: it.videoId,
              playlistId: data.playlistId,
              createdBy: user?.uid || 'system',
              createdAt: new Date(),
            };
            await addDoc(collection(db, 'dream_academy_sources'), payload as any);
            importedCount++;
          }

          nextItems = data.nextPageToken;
          page++;
        } while (nextItems);
      }

      await fetchSources();
      alert(`تم الاستيراد: قوائم ${allPlaylists.length} - تمت إضافة ${importedCount} وتخطي ${skippedCount} (مكررة)`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'فشل استيراد قوائم تشغيل القناة');
    }
  };

  const handleImportPlaylist = async () => {
    if (apiKeyPresent === false) {
      alert('الرجاء ضبط YOUTUBE_API_KEY في .env.local أو في app_settings/youtube قبل استيراد القائمة');
      return;
    }
    if (!draft.url || draft.sourceType !== 'playlist' || !draft.categoryId) return;
    try {
      // Fetch first page
      let next: string | null = null;
      let page = 0;
      let addedCount = 0;
      let skippedCount = 0;
      do {
        const res = await fetch('/api/youtube/playlist-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playlistUrlOrId: draft.url, pageToken: next })
        });
        const data = await res.json();
        if (!res.ok) {
          console.error('YouTube API error:', data);
          throw new Error(data?.error || 'فشل في جلب عناصر القائمة');
        }

        const items = (data.items || []) as any[];
        for (let i = 0; i < items.length; i++) {
          const it = items[i];
          if (!it?.videoId) { skippedCount++; continue; }
          if (await existsBy('videoId', it.videoId)) { skippedCount++; continue; }
          const payload: DreamAcademySource = {
            provider: 'youtube',
            sourceType: 'video',
            url: `https://www.youtube-nocookie.com/watch?v=${it.videoId}`,
            categoryId: draft.categoryId as DreamAcademyCategoryId,
            order: (page * 1000) + it.order, // keep pages separated to preserve order
            isActive: true,
            title: it.title,
            resolvedTitle: it.title,
            resolvedDescription: it.description,
            durationSec: it.durationSec,
            channelTitle: it.channelTitle,
            thumbnailUrl: it.thumbnailUrl,
            videoId: it.videoId,
            playlistId: data.playlistId,
            createdBy: user?.uid || 'system',
            createdAt: new Date(),
          };
          await addDoc(collection(db, 'dream_academy_sources'), (Object.fromEntries(Object.entries(payload).filter(([,v]) => v !== undefined)) as any));
          addedCount++;
        }

        next = data.nextPageToken;
        page++;
      } while (next);

      await fetchSources();
      // تفريغ البحث لتظهر العناصر الجديدة
      setSearchTerm('');
      alert(`تم الاستيراد: تمت إضافة ${addedCount} وتخطي ${skippedCount}`);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'فشل استيراد قائمة التشغيل');
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    await deleteDoc(doc(db, 'dream_academy_sources', id));
    await fetchSources();
  };

  const toggleActive = async (s: DreamAcademySource) => {
    if (!s.id) return;
    await updateDoc(doc(db, 'dream_academy_sources', s.id), { isActive: !s.isActive });
    await fetchSources();
  };

  const updateOrder = async (s: DreamAcademySource, delta: number) => {
    if (!s.id) return;
    const newOrder = (s.order || 0) + delta;
    await updateDoc(doc(db, 'dream_academy_sources', s.id), { order: newOrder });
    await fetchSources();
  };

  const openPreview = (s: DreamAcademySource) => {
    let url: string | null = null;
    // Try to normalize playlistId from URL if missing
    const ensurePlaylistId = (raw?: string | null) => {
      try {
        if (!raw) return undefined;
        const u = new URL(raw);
        return u.searchParams.get('list') || undefined;
      } catch { return undefined; }
    };
    const playlistId = s.playlistId || ensurePlaylistId(s.url);
    if (s.sourceType === 'playlist' && playlistId) {
      url = `https://www.youtube-nocookie.com/embed?listType=playlist&list=${playlistId}`;
    } else if (s.videoId) {
      url = `https://www.youtube-nocookie.com/watch?v=${s.videoId}`;
    } else if (s.url) {
      url = s.url;
    }
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  const resolveMeta = async () => {
    if (!draft.url) return;
    const res = await fetch('/api/youtube/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: draft.url })
    });
    const data = await res.json();
    setDraft(d => ({
      ...d,
      videoId: data.videoId,
      playlistId: data.playlistId,
      title: d?.title || data.resolvedTitle,
      resolvedTitle: data.resolvedTitle,
      resolvedDescription: data.resolvedDescription,
      durationSec: data.durationSec,
      itemCount: data.itemCount,
      channelTitle: data.channelTitle,
      thumbnailUrl: data.thumbnailUrl,
      sourceType: data.playlistId ? 'playlist' : (d as any).sourceType
    }) as any);
  };

  // قائمة فئات فريدة لتجنّب مفاتيح مكررة داخل عناصر Select
  const uniqueCategories = useMemo(() => {
    return Array.from(new Map(dynamicCategories.map(c => [c.id, c])).values());
  }, [dynamicCategories]);

  return (
    <AccountTypeProtection allowedTypes={["admin"]}>
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">إدارة مصادر فيديو أكاديمية الحلم</h1>
      <Card className="p-4 mb-6">
        {apiKeyPresent === false && (
          <div className="mb-3 rounded-md bg-red-50 text-red-700 px-4 py-2 text-sm">
            لم يتم العثور على مفتاح YouTube API. يرجى إضافة <code className="font-mono">YOUTUBE_API_KEY</code> في <code className="font-mono">.env.local</code> ثم إعادة التشغيل، أو حفظه في Firestore داخل الوثيقة <code className="font-mono">app_settings/youtube</code> تحت الحقل <code className="font-mono">apiKey</code>.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="text-sm">الرابط (YouTube فيديو أو Playlist)</label>
            <Input
              placeholder="https://www.youtube-nocookie.com/watch?v=... أو https://www.youtube-nocookie.com/playlist?list=..."
              value={draft.url || ''}
              onChange={(e) => {
                const val = e.target.value;
                const isPlaylist = /(?:youtube\.com\/playlist\?|[?&]list=)/.test(val);
                setDraft((d) => ({ ...d, url: val, sourceType: isPlaylist ? ('playlist' as any) : d.sourceType }));
              }}
            />
          </div>
          <div>
            <label className="text-sm">النوع</label>
              <Select value={draft.sourceType} onValueChange={(v) => setDraft((d) => ({ ...d, sourceType: v as any }))}>
              <SelectTrigger><SelectValue placeholder="Video or Playlist" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="playlist">Playlist</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">الفئة</label>
            <Select value={draft.categoryId} onValueChange={(v) => setDraft((d) => ({ ...d, categoryId: v as DreamAcademyCategoryId }))}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                 {uniqueCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">العنوان (اختياري)</label>
            <Input placeholder="عنوان مختصر" value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm">الترتيب</label>
            <Input type="number" value={draft.order || 0} onChange={(e) => setDraft((d) => ({ ...d, order: Number(e.target.value) }))} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={resolveMeta}
              title="جلب التفاصيل"
              className="border-slate-300 text-slate-700 px-4 py-2 md:px-5 md:py-2.5 rounded-lg inline-flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> جلب التفاصيل
            </Button>
            <Button
              type="button"
              onClick={() => setDraft(d => ({ ...d, url: (d.url || '').replace(/^@+/, '') }))}
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-white hover:from-amber-500 hover:to-orange-600 px-4 py-2 md:px-5 md:py-2.5 rounded-lg inline-flex items-center gap-2"
            >
              تنظيف الرابط
            </Button>
            {draft.sourceType !== 'playlist' && (
              <Button
                type="button"
                onClick={handleAdd}
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 px-4 py-2 md:px-5 md:py-2.5 rounded-lg inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />إضافة
              </Button>
            )}
          </div>
          {draft.sourceType === 'playlist' && (
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <Button
                type="button"
                onClick={handleImportPlaylist}
                disabled={apiKeyPresent === false}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-600 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 md:px-5 md:py-2.5 rounded-lg inline-flex items-center justify-center gap-2"
              >
                <ListPlus className="w-4 h-4" /> استيراد كل فيديوهات القائمة
              </Button>
              <Button
                type="button"
                onClick={handleImportChannelPlaylists}
                disabled={apiKeyPresent === false}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2 md:px-5 md:py-2.5 rounded-lg inline-flex items-center justify-center gap-2"
              >
                <ListPlus className="w-4 h-4" /> استيراد كل قوائم تشغيل القناة
              </Button>
            </div>
          )}
        </div>
        {draft?.resolvedTitle || draft?.durationSec || draft?.itemCount ? (
          <div className="mt-3 text-sm text-gray-600">
            {draft?.resolvedTitle && <div>العنوان: <span className="font-medium">{draft.resolvedTitle}</span></div>}
            {typeof draft?.durationSec === 'number' && <div>المدة: {Math.round((draft.durationSec || 0) / 60)} دقيقة</div>}
            {typeof draft?.itemCount === 'number' && <div>عدد عناصر القائمة: {draft.itemCount}</div>}
            {draft?.channelTitle && <div>القناة: {draft.channelTitle}</div>}
          </div>
        ) : null}
      </Card>

      <Card className="p-4 mb-3">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="flex-1 flex items-center gap-2">
            <Search className="w-4 h-4" />
            <Input placeholder="بحث بعنوان أو رابط" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className={`${filterType==='all'?'bg-slate-700 text-white':'border-slate-300'} px-3 py-2 rounded-xl`} size="sm" onClick={() => setFilterType('all')}>الكل</Button>
            <Button className={`${filterType==='video'?'bg-blue-600 text-white':'border-blue-300'} px-3 py-2 rounded-xl`} variant={filterType==='video'?'default':'outline'} size="sm" onClick={() => setFilterType('video')}>فيديوهات</Button>
            <Button className={`${filterType==='playlist'?'bg-purple-600 text-white':'border-purple-300'} px-3 py-2 rounded-xl`} variant={filterType==='playlist'?'default':'outline'} size="sm" onClick={() => setFilterType('playlist')}>قوائم</Button>
            <Button className={`${filterStatus==='all'?'bg-slate-700 text-white':'border-slate-300'} px-3 py-2 rounded-xl`} size="sm" onClick={() => setFilterStatus('all')}>الكل</Button>
            <Button className={`${filterStatus==='active'?'bg-emerald-600 text-white':'border-emerald-300'} px-3 py-2 rounded-xl`} variant={filterStatus==='active'?'default':'outline'} size="sm" onClick={() => setFilterStatus('active')}>مفعلة</Button>
            <Button className={`${filterStatus==='inactive'?'bg-gray-600 text-white':'border-gray-300'} px-3 py-2 rounded-xl`} variant={filterStatus==='inactive'?'default':'outline'} size="sm" onClick={() => setFilterStatus('inactive')}>معطلة</Button>
          </div>
          <div>
            <Select value={filterCategory} onValueChange={(v) => setFilterCategory(v as any)}>
              <SelectTrigger className="w-64"><SelectValue placeholder="كل الفئات" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                {uniqueCategories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>إجمالي: {sources.length}</span>
          <span>• المعروضة: {filteredSources.length}</span>
          <span>• المحددة: {selectedIds.length}</span>
          <Button size="sm" variant="outline" onClick={toggleSelectAllVisible}>{allVisibleSelected ? 'إلغاء تحديد الظاهرة' : 'تحديد الظاهرة'}</Button>
          {selectedIds.length > 0 && (
            <>
              <Button size="sm" className="bg-emerald-600 text-white" onClick={() => bulkSetActive(true)}>تفعيل المحدد</Button>
              <Button size="sm" variant="outline" onClick={() => bulkSetActive(false)}>تعطيل المحدد</Button>
              <Select onValueChange={(v) => bulkChangeCategory(v as any)}>
                <SelectTrigger className="w-56"><SelectValue placeholder="نقل المحدد إلى فئة" /></SelectTrigger>
                <SelectContent>
                  {uniqueCategories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="destructive" onClick={bulkDelete}>حذف المحدد</Button>
            </>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div>جارِ التحميل...</div>
        ) : (
          filteredSources.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <input aria-label="تحديد" type="checkbox" checked={selectedIds.includes(s.id!)} onChange={() => toggleSelect(s.id)} />
                <span className={`px-2 py-0.5 text-xs rounded-full ${s.isActive?'bg-emerald-100 text-emerald-700':'bg-gray-200 text-gray-700'}`}>{s.isActive ? 'مفعل' : 'معطل'}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${s.sourceType==='playlist'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{s.sourceType === 'playlist' ? 'Playlist' : 'Video'}</span>
              </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateOrder(s, -1)}>-</Button>
                  <Button size="sm" variant="outline" onClick={() => updateOrder(s, 1)}>+</Button>
                </div>
              </div>
              <div className="aspect-video bg-gray-50 rounded mb-2 overflow-hidden flex items-center justify-center">
                {s.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.thumbnailUrl} alt={s.title || s.resolvedTitle || 'thumb'} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-gray-400">لا توجد صورة</div>
                )}
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>{dynamicCategories.find(c => c.id === s.categoryId)?.title || s.categoryId}</span>
                <span className="text-xs text-gray-500">{s.channelTitle}</span>
              </div>
              <div className="font-medium mb-2 line-clamp-2">{s.title || s.resolvedTitle || 'بدون عنوان'}</div>
              <a className="text-blue-600 text-sm break-all" href={s.url} target="_blank" rel="noreferrer">{s.url}</a>
              {s.durationSec || s.itemCount ? (
                <div className="mt-2 text-xs text-gray-600">
                  {s.durationSec ? <span>المدة ~ {Math.round((s.durationSec || 0) / 60)}د</span> : null}
                  {s.durationSec && s.itemCount ? ' · ' : ''}
                  {s.itemCount ? <span>عناصر القائمة: {s.itemCount}</span> : null}
                </div>
              ) : null}
              <div className="flex items-center gap-2 mt-4">
                <Button size="sm" onClick={() => openPreview(s)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                  <Play className="w-4 h-4" /> تشغيل
                </Button>
                <Button size="sm" variant={s.isActive ? 'outline' : 'default'} onClick={() => toggleActive(s)} className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl ${s.isActive?'':'bg-emerald-600 text-white'}`}>
                  {s.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  {s.isActive ? 'تعطيل' : 'تفعيل'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(s.url)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl">نسخ الرابط</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)} className="inline-flex items-center gap-1 px-3 py-2 rounded-xl">
                  <Trash2 className="w-4 h-4" /> حذف
                </Button>
              </div>
              <div className="mt-3 text-xs text-gray-600">
                <span className="inline-block mr-3">مشاهدات: <span className="font-semibold">{statsMap[s.id!]?.views ?? 0}</span></span>
                <span className="inline-block">إعجابات: <span className="font-semibold">{statsMap[s.id!]?.likes ?? 0}</span></span>
              </div>
            </Card>
          ))
        )}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>معاينة الفيديو</DialogTitle>
            <DialogDescription>معاينة تشغيل المصدر المحدد قبل الحفظ</DialogDescription>
          </DialogHeader>
          <div className="w-full">
            {previewUrl ? (
              <ReactPlayer
                url={previewUrl}
                width="100%"
                height="420px"
                controls
                config={{ youtube: { embedOptions: { host: 'https://www.youtube-nocookie.com' }, playerVars: { rel: 0, origin: 'https://www.youtube-nocookie.com', host: 'https://www.youtube-nocookie.com' } } }}
              />
            ) : (
              <div className="text-sm text-gray-500">لا يمكن تشغيل هذا الرابط</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </AccountTypeProtection>
  );
}



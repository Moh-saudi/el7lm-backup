'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReactPlayer from 'react-player';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DreamAcademyCategory, DreamAcademyCategoryId, DreamAcademySource } from '@/types/dream-academy';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { getCurrencyRates, getCurrencyInfo, convertCurrency as convertCurrencyLib } from '@/lib/currency-rates';
import { Play, Video as VideoIcon, Eye, Heart } from 'lucide-react';

interface Props {
  categoryId: DreamAcademyCategoryId;
}

export default function DreamAcademyVideosSection({ categoryId }: Props) {
  const [sources, setSources] = useState<DreamAcademySource[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
  const [category, setCategory] = useState<DreamAcademyCategory | null>(null);
  const [allCategories, setAllCategories] = useState<DreamAcademyCategory[]>([]);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // payment selection
  const [currencyRates, setCurrencyRates] = useState<any>({});
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'geidea'>('geidea');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState<number>(45);
  const [sessionCategory, setSessionCategory] = useState<DreamAcademyCategoryId>('english');
  const [stats, setStats] = useState<Record<string, { views: number; likes: number }>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      setVideoError(null);
      setIsVideoLoading(false);
      const qs = query(collection(db, 'dream_academy_sources'), where('categoryId', '==', categoryId), where('isActive', '==', true));
      const snap = await getDocs(qs);
      const rows: DreamAcademySource[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      rows.sort((a, b) => (a.order || 0) - (b.order || 0));
      setSources(rows);

      const catSnap = await getDocs(collection(db, 'dream_academy_categories'));
      const cats = catSnap.docs.map(d => d.data() as DreamAcademyCategory).filter(c => (c as any).isActive !== false);
      setAllCategories(cats);
      const matched = cats.find(c => c.id === categoryId) || null;
      setCategory(matched);
      if (matched && (matched as any).currency) {
        setSelectedCurrency((matched as any).currency as string);
      }
      if (matched && Array.isArray(matched.allowedPaymentMethods)) {
        const allowed = matched.allowedPaymentMethods as Array<'wallet'|'geidea'>;
        if (!allowed.includes(paymentMethod)) {
          setPaymentMethod(allowed[0] || 'geidea');
        }
      }

      const rates = await getCurrencyRates();
      setCurrencyRates(rates);

      // Load stats for sources
      const statsEntries: Record<string, { views: number; likes: number }> = {};
      await Promise.all(rows.map(async (s) => {
        if (!s.id) return;
        const res = await fetch(`/api/dream-academy/stats?sourceId=${s.id}`);
        const data = await res.json();
        statsEntries[s.id] = { views: data.views || 0, likes: data.likes || 0 };
      }));
      setStats(statsEntries);
    };
    load();
    setSessionCategory(categoryId);
  }, [categoryId]);

  const priceInSelected = useMemo(() => {
    if (!category || !currencyRates) return 0;
    const base = Number(category.basePriceUSD || 0);
    if (!base) return 0;
    return Math.round(convertCurrencyLib(base, 'USD', selectedCurrency, currencyRates));
  }, [category, selectedCurrency, currencyRates]);

  return (
    <div>
      {/* Top actions */}
      <div className="mb-4 flex items-center justify-between">
        <div></div>
        <Button
          onClick={() => setRequestModalOpen(true)}
          className="text-white px-5 py-3 text-base md:text-lg rounded-xl shadow-md bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-sky-300"
        >
          إضافة جلسة خاصة
        </Button>
      </div>

      {(activeVideoId || activePlaylistId) && (
        <div className="mb-6">
          {videoError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-700">
                  <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <span className="text-sm font-medium">{videoError}</span>
                </div>
                <button
                  onClick={() => {
                    setVideoError(null);
                    setIsVideoLoading(true);
                    // Force re-render of ReactPlayer
                    const currentVideoId = activeVideoId;
                    const currentPlaylistId = activePlaylistId;
                    setActiveVideoId(null);
                    setActivePlaylistId(null);
                    setTimeout(() => {
                      setActiveVideoId(currentVideoId);
                      setActivePlaylistId(currentPlaylistId);
                    }, 100);
                  }}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
              <div className="mt-2 text-sm text-red-600">
                يمكنك المحاولة مرة أخرى أو اختيار فيديو آخر. إذا استمرت المشكلة، يمكنك مشاهدة الفيديو مباشرة على YouTube.
              </div>
              {(activeVideoId || activePlaylistId) && (
                <div className="mt-3">
                  <a
                    href={activePlaylistId ? `https://www.youtube.com/playlist?list=${activePlaylistId}` : `https://www.youtube.com/watch?v=${activeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    مشاهدة على YouTube
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="relative youtube-player-container">
          <ReactPlayer
             url={activePlaylistId ? `https://www.youtube.com/embed?listType=playlist&list=${activePlaylistId}&rel=0&modestbranding=1&showinfo=0` : (activeVideoId ? `https://www.youtube.com/watch?v=${activeVideoId}&rel=0&modestbranding=1&showinfo=0` : undefined)}
            width="100%"
            height="420px"
            controls
              playing={false}
              light={false}
              config={{ 
                youtube: { 
                  embedOptions: { 
                     host: 'https://www.youtube.com' 
                  }, 
                  playerVars: { 
                    rel: 0,                    // منع ظهور الفيديوهات المقترحة
                    modestbranding: 1,         // إخفاء شعار YouTube
                    showinfo: 0,               // إخفاء معلومات الفيديو
                    origin: typeof window !== 'undefined' ? window.location.origin : '',
                    enablejsapi: 1,
                    iv_load_policy: 3,         // منع ظهور التعليقات
                    cc_load_policy: 0,         // منع الترجمة التلقائية
                    fs: 1,                     // السماح بالملء الشاشة
                    disablekb: 0,              // السماح بمفاتيح لوحة المفاتيح
                    autoplay: 0,               // منع التشغيل التلقائي
                    mute: 0,                   // عدم كتم الصوت
                    loop: 0,                   // عدم التكرار
                    playlist: '',              // منع قائمة التشغيل
                    controls: 1,               // إظهار عناصر التحكم
                    playsinline: 1,            // التشغيل داخل الصفحة
                    color: 'white',            // لون شريط التقدم
                    hl: 'ar',                  // اللغة العربية
                      cc_lang_pref: 'ar',        // تفضيل الترجمة العربية
                      end: 0,                    // منع إظهار نهاية الفيديو
                      start: 0,                  // بداية الفيديو من البداية
                      vq: 'hd720',               // جودة الفيديو
                      wmode: 'transparent',      // شفافية الخلفية
                      allowfullscreen: true,     // السماح بالملء الشاشة
                      allowscriptaccess: 'always' // السماح بالوصول للـ JavaScript
                  } 
                } 
              }}
              onError={(error) => {
                  // Suppress YouTube player deprecation warnings
                  if (error && typeof error === 'object' && error.toString().includes('-ms-high-contrast')) {
                    console.log('YouTube player compatibility warning (ignored):', error);
                    return;
                  }
                  
                console.warn('Video player error:', error);
                let errorMessage = 'حدث خطأ في تحميل الفيديو. يرجى المحاولة مرة أخرى أو التحقق من اتصال الإنترنت.';
                
                // تحسين رسائل الخطأ بناءً على نوع الخطأ
                if (error && typeof error === 'object') {
                  const errorStr = error.toString().toLowerCase();
                    const errorCode = error?.data || error?.code || error?.message || '';
                    
                                         // معالجة خطأ 150 (عادة مشكلة في إعدادات YouTube)
                     if (errorCode === 150 || errorStr.includes('150')) {
                       errorMessage = 'هذا الفيديو غير متاح للتشغيل المباشر. يرجى النقر على "مشاهدة على YouTube" للوصول إليه.';
                       // إظهار رسالة الخطأ فوراً لخطأ 150
                       setVideoError(errorMessage);
                       setIsVideoLoading(false);
                       console.log('YouTube error 150 (video not available for embedding):', error);
                       return; // لا نحاول إعادة المحاولة لخطأ 150
                                         } else if (errorStr.includes('postmessage') || errorStr.includes('origin') || errorStr.includes('target origin')) {
                       errorMessage = 'مشكلة في الاتصال مع YouTube. يرجى المحاولة مرة أخرى أو استخدام الرابط المباشر.';
                       // تجاهل أخطاء postMessage لأنها لا تؤثر على التشغيل
                       console.log('YouTube postMessage error (ignored):', error);
                       return;
                     } else if (errorStr.includes('connection_reset') || errorStr.includes('net::err_connection_reset')) {
                    errorMessage = 'فشل الاتصال بخوادم YouTube. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
                  } else if (errorStr.includes('network') || errorStr.includes('timeout')) {
                    errorMessage = 'انقطع الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.';
                  } else if (errorStr.includes('blocked') || errorStr.includes('cors')) {
                    errorMessage = 'تم حظر الاتصال بخوادم YouTube. يرجى المحاولة مرة أخرى أو استخدام الرابط المباشر.';
                    } else if (errorStr.includes('embed') || errorStr.includes('embedding')) {
                      errorMessage = 'هذا الفيديو لا يدعم التشغيل المباشر. يرجى النقر على "مشاهدة على YouTube".';
                    } else if (errorStr.includes('private') || errorStr.includes('unavailable')) {
                      errorMessage = 'هذا الفيديو غير متاح أو خاص. يرجى النقر على "مشاهدة على YouTube" للتحقق من إمكانية الوصول.';
                  }
                }
                
                setVideoError(errorMessage);
                setIsVideoLoading(false);
              }}
              onReady={() => {
                console.log('Video player ready');
                setVideoError(null);
                setIsVideoLoading(false);
              }}
              onBuffer={() => {
                setIsVideoLoading(true);
              }}
              onBufferEnd={() => {
                setIsVideoLoading(false);
              }}
              onStart={() => {
                setIsVideoLoading(false);
                setVideoError(null);
              }}
              fallback={
                <div className="w-full h-[420px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {isVideoLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <div className="text-gray-500 mb-2">جاري تحميل الفيديو...</div>
                      </>
                     ) : videoError ? (
                       <>
                         <div className="text-gray-500 mb-2">خطأ في تحميل الفيديو</div>
                         <div className="text-sm text-gray-400 mb-4">{videoError}</div>
                         {(activeVideoId || activePlaylistId) && (
                           <a
                             href={activePlaylistId ? `https://www.youtube.com/playlist?list=${activePlaylistId}` : `https://www.youtube.com/watch?v=${activeVideoId}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                           >
                             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                               <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                               <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                             </svg>
                             مشاهدة على YouTube
                           </a>
                         )}
                       </>
                    ) : (
                      <>
                        <div className="text-gray-500 mb-2">لا يمكن تحميل الفيديو</div>
                        <div className="text-sm text-gray-400 mb-4">يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى</div>
                        {(activeVideoId || activePlaylistId) && (
                          <a
                            href={activePlaylistId ? `https://www.youtube.com/playlist?list=${activePlaylistId}` : `https://www.youtube.com/watch?v=${activeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            مشاهدة على YouTube
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              }
            />
          </div>
          {/* Increment views for the active source (best-effort) */}
          {(() => {
            const activeSource = sources.find(s => (s.sourceType === 'playlist' ? s.playlistId === activePlaylistId : s.videoId === activeVideoId));
            if (activeSource?.id) {
              fetch('/api/dream-academy/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceId: activeSource.id, action: 'view' }) }).catch(() => {});
            }
            return null;
          })()}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {sources.map((s) => {
          const thumb = s.thumbnailUrl || (s.videoId ? `https://img.youtube.com/vi/${s.videoId}/hqdefault.jpg` : undefined);
          return (
            <Card key={s.id} className="p-2">
              <div
                role="button"
                tabIndex={0}
                className="text-left w-full outline-none"
                onClick={() => {
                  setVideoError(null);
                  setIsVideoLoading(true);
                  setRetryCount(0); // إعادة تعيين عداد المحاولات
                  if (s.sourceType === 'playlist' && s.playlistId) {
                    setActivePlaylistId(s.playlistId);
                    setActiveVideoId(null);
                  } else if (s.videoId) {
                    setActiveVideoId(s.videoId);
                    setActivePlaylistId(null);
                  }
                  
                  // Set a timeout to show error if video doesn't load within 10 seconds
                  setTimeout(() => {
                    if (isVideoLoading) {
                      setVideoError('استغرق تحميل الفيديو وقتاً طويلاً. قد تكون هناك مشكلة في الاتصال بالشبكة. يرجى المحاولة مرة أخرى أو استخدام الرابط المباشر.');
                      setIsVideoLoading(false);
                    }
                  }, 10000);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setVideoError(null);
                    setIsVideoLoading(true);
                    if (s.sourceType === 'playlist' && s.playlistId) {
                      setActivePlaylistId(s.playlistId);
                      setActiveVideoId(null);
                    } else if (s.videoId) {
                      setActiveVideoId(s.videoId);
                      setActivePlaylistId(null);
                    }
                    
                    // Set a timeout to show error if video doesn't load within 10 seconds
                    setTimeout(() => {
                      if (isVideoLoading) {
                        setVideoError('استغرق تحميل الفيديو وقتاً طويلاً. قد تكون هناك مشكلة في الاتصال بالشبكة. يرجى المحاولة مرة أخرى أو استخدام الرابط المباشر.');
                        setIsVideoLoading(false);
                      }
                    }, 10000);
                  }
                }}
              >
                <div className="aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt={s.title || s.resolvedTitle || 'video'} className="w-full h-full object-cover" />
                  ) : (
                    <VideoIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="mt-2 text-sm line-clamp-2">{s.title || s.resolvedTitle || s.url}</div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <span>{s.sourceType === 'playlist' ? 'Playlist' : 'Video'}</span>
                {s.id && (
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{stats[s.id]?.views ?? 0}</span>
                    <button
                      type="button"
                      className={`flex items-center gap-1 ${liked[s.id] ? 'text-red-600' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const newLiked = !liked[s.id];
                        setLiked(prev => ({ ...prev, [s.id!]: newLiked }));
                        fetch('/api/dream-academy/stats', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ sourceId: s.id, action: newLiked ? 'like' : 'unlike' })
                        }).then(() => {
                          setStats(prev => ({
                            ...prev,
                            [s.id!]: { views: prev[s.id!]?.views || 0, likes: (prev[s.id!]?.likes || 0) + (newLiked ? 1 : -1) }
                          }));
                        }).catch(() => {});
                      }}
                    >
                      <Heart className="w-3 h-3" />{stats[s.id]?.likes ?? 0}
                    </button>
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Request private session modal */}
      <Dialog open={requestModalOpen} onOpenChange={setRequestModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>طلب جلسة خاصة</DialogTitle>
            <DialogDescription>
              أدخل بياناتك وسيتم تجهيز طلب الجلسة بعملة وطريقة الدفع التي تختارها
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-sm">الاسم الكامل</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم" />
            </div>
            <div>
              <label className="text-sm">واتساب</label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="مثال: 2010xxxxxxx+" />
            </div>
            <div>
              <label className="text-sm">المدة (دقيقة)</label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3 items-end">
            <div>
              <label className="text-sm">نوع الجلسة</label>
              <Select value={sessionCategory} onValueChange={(v) => setSessionCategory(v as DreamAcademyCategoryId)}>
                <SelectTrigger><SelectValue placeholder="اختر النوع" /></SelectTrigger>
                <SelectContent>
                  {allCategories.map((c) => (
                     <SelectItem key={`session-${c.id}`} value={c.id as any}>
                      {(c as any).titleAr || c.title || (c as any).titleEn || c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">العملة</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger><SelectValue placeholder="Currency" /></SelectTrigger>
                <SelectContent>
                  {['USD','EGP','QAR','SAR','AED','EUR'].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm">طريقة الدفع</label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
                <SelectTrigger><SelectValue placeholder="Payment" /></SelectTrigger>
                <SelectContent>
                  {(category?.allowedPaymentMethods?.length ? category.allowedPaymentMethods : ['wallet','geidea']).map((m) => (
                    <SelectItem key={m} value={m}>{m === 'wallet' ? 'المحفظة' : 'Geidea'}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm">السعر</div>
              <div className="text-lg font-semibold">
                {(!category || Number(category.basePriceUSD || 0) === 0)
                  ? 'مجاني'
                  : (<>{priceInSelected} {getCurrencyInfo(selectedCurrency, currencyRates)?.symbol || selectedCurrency}</>)}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm">ملاحظات</label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="هدف الجلسة، المستوى، تفضيلات..." />
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              className="text-white px-5 py-2.5 rounded-xl shadow-md bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-sky-300"
              onClick={async () => {
                try {
                  const res = await fetch('/api/dream-academy/private-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      name: fullName,
                      whatsapp,
                      durationMinutes: duration,
                      notes,
                      currency: selectedCurrency,
                      amount: priceInSelected,
                      paymentMethod,
                      categoryId: sessionCategory,
                    }),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data?.error || 'حدث خطأ');
                  setRequestModalOpen(false);
                  // تم إرسال الطلب بنجاح
                } catch (e: any) {
                  console.error('فشل إرسال الطلب:', e);
                }
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              إتمام الطلب
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}



'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { 
  Heart, MessageCircle, Share2, Music, Play, Pause, Volume2, VolumeX,
  Search, Filter, ArrowUp, ArrowDown, User, MapPin, Calendar, CheckCircle,
  Copy, Bookmark, UserPlus, Star, MoreHorizontal, Maximize2, Minimize2
} from 'lucide-react';
import Comments from '@/components/video/Comments';
import PlayerImage from '@/components/ui/player-image';
import ReactPlayer from 'react-player';
import { safeNavigate, preventVideoTitleNavigation } from '@/lib/utils/url-validator';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import 'dayjs/locale/ar';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createSafeImageUrl } from '@/utils/image-utils';

interface Video {
  id: string;
  url: string;
  playerName: string;
  playerImage: string;
  playerPosition?: string;
  playerAge?: number;
  playerLocation?: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  music: string;
  playerId: string;
  createdAt: any;
  hashtags?: string[];
  duration?: number;
}

interface PlayerVideosPageProps {
  accountType: 'club' | 'academy' | 'trainer' | 'agent' | 'player';
}

function isDirectVideo(url: string) {
  return url.match(/\.(mp4|webm|ogg)$/i);
}

function getVideoThumbnail(url: string) {
  const youtubeMatch = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return `https://img.youtube.com/vi/${youtubeMatch[1]}/hqdefault.jpg`;
  }
  
  const vimeoMatch = url.match(/(?:vimeo\.com\/)(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://vumbnail.com/${vimeoMatch[1]}.jpg`;
  }
  
  const dailymotionMatch = url.match(/(?:dailymotion\.com\/video\/)([a-zA-Z0-9]+)/);
  if (dailymotionMatch && dailymotionMatch[1]) {
    return `https://www.dailymotion.com/thumbnail/video/${dailymotionMatch[1]}`;
  }
  
  return undefined;
}

const getPlayerImageUrl = (profileImage: any, fallback: string = '/images/default-avatar.png'): string => {
  return createSafeImageUrl(profileImage, fallback);
};

// دالة لحساب فئة العمر
const getAgeCategory = (birthDate: any): string => {
  if (!birthDate) return 'غير محدد';
  
  try {
    const birth = birthDate.toDate ? birthDate.toDate() : new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    if (age < 12) return 'أقل من 12 سنة';
    if (age < 15) return '12-14 سنة';
    if (age < 18) return '15-17 سنة';
    if (age < 21) return '18-20 سنة';
    if (age < 25) return '21-24 سنة';
    if (age < 30) return '25-29 سنة';
    if (age < 35) return '30-34 سنة';
    return '35 سنة وأكثر';
  } catch (error) {
    return 'غير محدد';
  }
};

export default function PlayerVideosPage({ accountType }: PlayerVideosPageProps) {
  console.log('🎬 PlayerVideosPage initialized with accountType:', accountType);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'popular' | 'following'>('all');
  
  // فلاتر متقدمة جديدة
  const [filterPosition, setFilterPosition] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [likedVideos, setLikedVideos] = useState<string[]>([]);
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [viewCounts, setViewCounts] = useState<{[id: string]: number}>({});
  const [progress, setProgress] = useState<{[id: string]: number}>({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const sentViewNotificationsRef = useRef<Set<string>>(new Set());
  const { user } = useAuth();
  const router = useRouter();

  // تحديد نوع المجموعة بناءً على نوع الحساب
  const getCollectionName = (accountType: string) => {
    const collectionMapping = {
      club: 'clubs',
      academy: 'academies', 
      trainer: 'trainers',
      agent: 'agents',
      player: 'players'
    };
    return collectionMapping[accountType as keyof typeof collectionMapping] || 'players';
  };

  useEffect(() => {
    console.log('🚀 PlayerVideosPage useEffect triggered:', { accountType, userUID: user?.uid });
    fetchVideos();
    loadUserPreferences();
  }, [accountType, user]);

  const loadUserPreferences = async () => {
    if (!user?.uid) {
      console.log('❌ loadUserPreferences: لا يوجد user');
      return;
    }
    
    console.log('🔍 loadUserPreferences: بدء جلب تفضيلات المستخدم');
    console.log('🎯 Account Type:', accountType);
    console.log('👤 User UID:', user.uid);
    
    try {
      const collectionName = getCollectionName(accountType);
      console.log(`🗃️ جلب البيانات من collection: ${collectionName}`);
      
      const userRef = doc(db, collectionName, user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log(`✅ تم العثور على بيانات المستخدم في ${collectionName}:`, data);
        
        setFollowing(data.following || []);
        setLikedVideos(data.likedVideos || []);
        setSavedVideos(data.savedVideos || []);
      } else {
        console.log(`❌ لم يتم العثور على المستخدم في ${collectionName}`);
        console.log('🔧 إنشاء مستند افتراضي...');
        
        // إنشاء مستند افتراضي
        const defaultUserData = {
          following: [],
          likedVideos: [],
          savedVideos: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(userRef, defaultUserData);
        console.log(`✅ تم إنشاء مستند ${accountType} الافتراضي`);
      }
    } catch (error) {
      console.error('❌ خطأ في loadUserPreferences:', error);
    }
  };

  // دالة آمنة لتحديث بيانات المستخدم
  const safeUpdateUserData = async (updateData: any) => {
    if (!user?.uid) {
      console.log('❌ safeUpdateUserData: لا يوجد user');
      return;
    }
    
    console.log('🔄 safeUpdateUserData:', { accountType, updateData });
    
    try {
      const collectionName = getCollectionName(accountType);
      const userRef = doc(db, collectionName, user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // المستند موجود، يمكن تحديثه
        await updateDoc(userRef, { ...updateData, updatedAt: new Date() });
        console.log(`✅ تم تحديث ${collectionName} بنجاح`);
      } else {
        // المستند غير موجود، أنشئه أولاً
        const defaultUserData = {
          following: [],
          likedVideos: [],
          savedVideos: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          ...updateData
        };
        await setDoc(userRef, defaultUserData);
        console.log(`✅ تم إنشاء مستند ${collectionName} مع البيانات الجديدة`);
      }
    } catch (error) {
      console.error(`❌ خطأ في تحديث ${accountType} data:`, error);
      throw error;
    }
  };

  const fetchVideos = async () => {
    console.log('📹 fetchVideos: بدء جلب الفيديوهات...');
    
    try {
      setLoading(true);
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      const allVideos: Video[] = [];
      
      console.log(`📊 تم جلب ${playersSnapshot.docs.length} لاعب`);
      
      for (const playerDoc of playersSnapshot.docs) {
        const playerData = playerDoc.data();
        if ((playerData as any)?.isDeleted) { continue; }
        const playerVideos = playerData.videos || [];
        
        if (playerVideos.length > 0) {
          console.log(`🎥 اللاعب ${playerData.full_name || playerData.name} لديه ${playerVideos.length} فيديو`);
        }
        
        const formattedVideos = playerVideos.map((video: any, index: number) => {
          let videoDate = video.createdAt || video.updated_at || new Date();
          if (videoDate && typeof videoDate.toDate === 'function') videoDate = videoDate.toDate();
          if (typeof videoDate === 'string') videoDate = new Date(videoDate);
          
          const playerImage = getPlayerImageUrl(
            playerData.profile_image || playerData.profile_image_url
          );
          
          // حساب العمر
          let playerAge: number | undefined;
          if (playerData.birth_date) {
            try {
              let birthDate: Date;
              if (typeof playerData.birth_date === 'object' && playerData.birth_date.toDate && typeof playerData.birth_date.toDate === 'function') {
                birthDate = playerData.birth_date.toDate();
              } else if (typeof playerData.birth_date === 'object' && playerData.birth_date.seconds) {
                birthDate = new Date(playerData.birth_date.seconds * 1000);
              } else if (playerData.birth_date instanceof Date) {
                birthDate = playerData.birth_date;
              } else {
                birthDate = new Date(playerData.birth_date);
              }
              
              if (!isNaN(birthDate.getTime())) {
                const age = new Date().getFullYear() - birthDate.getFullYear();
                playerAge = age > 0 && age < 100 ? age : undefined;
              }
            } catch (error) {
              console.warn('تحذير في حساب عمر اللاعب:', error);
              playerAge = undefined;
            }
          }
          
          return {
            id: `${playerDoc.id}_${index}`,
            url: video.url,
            playerName: playerData.full_name || playerData.name || 'لاعب',
            playerImage,
            playerPosition: playerData.primary_position || playerData.position || playerData.center || '',
            playerAge,
            playerLocation: `${playerData.city || ''} ${playerData.country || ''}`.trim(),
            description: video.description || video.desc || '',
            likes: video.likes || 0,
            comments: video.comments || 0,
            shares: video.shares || 0,
            views: video.views || 0,
            music: video.music || 'Original Sound',
            playerId: playerDoc.id,
            createdAt: videoDate,
            hashtags: video.hashtags || [],
            duration: video.duration || 0
          };
        });
        allVideos.push(...formattedVideos);
      }
      
      const sortedVideos = allVideos.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
      
      console.log(`✅ تم تحميل ${sortedVideos.length} فيديو إجمالي`);
      setVideos(sortedVideos);
      setLoading(false);
    } catch (error) {
      console.error('❌ خطأ في جلب الفيديوهات:', error);
      setLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    let filtered = videos;
    
    // فلترة حسب البحث
    if (searchQuery) {
      filtered = filtered.filter(v =>
        v.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.hashtags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // فلاتر متقدمة جديدة
    if (filterPosition) {
      filtered = filtered.filter(v => 
        v.playerPosition?.toLowerCase().includes(filterPosition.toLowerCase())
      );
    }
    
    if (filterAge) {
      filtered = filtered.filter(v => {
        // استخدام العمر المحسوب مسبقاً في الفيديو
        if (v.playerAge) {
          const ageCategory = getAgeCategory(v.playerAge);
          return ageCategory === filterAge;
        }
        return false;
      });
    }
    
    if (filterLocation) {
      filtered = filtered.filter(v => 
        v.playerLocation?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    if (filterDuration) {
      filtered = filtered.filter(v => {
        const duration = v.duration || 0;
        switch (filterDuration) {
          case 'short':
            return duration <= 30; // أقل من 30 ثانية
          case 'medium':
            return duration > 30 && duration <= 120; // 30 ثانية إلى دقيقتين
          case 'long':
            return duration > 120; // أكثر من دقيقتين
          default:
            return true;
        }
      });
    }
    
    // فلترة حسب النوع
    switch (filterType) {
      case 'recent':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'popular':
        return filtered.sort((a, b) => (b.likes + b.views) - (a.likes + a.views));
      case 'following':
        return filtered.filter(v => following.includes(v.playerId));
      default:
        return filtered;
    }
  }, [videos, searchQuery, filterType, following, filterPosition, filterAge, filterLocation, filterDuration]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const videoHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / videoHeight);
    
    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < filteredVideos.length) {
      setCurrentVideoIndex(newIndex);
      setSelectedVideoId(null);
      
      // تشغيل الفيديو الحالي وإيقاف الآخرين
      videoRefs.current.forEach((ref, idx) => {
        if (ref) {
          if (idx === newIndex) {
            ref.currentTime = 0;
            ref.play();
          } else {
            ref.pause();
          }
        }
      });
      
      // تتبع المشاهدات
      const video = filteredVideos[newIndex];
      if (video) {
        setViewCounts(prev => ({
          ...prev,
          [video.id]: (prev[video.id] || 0) + 1
        }));
      }
    }
  }, [currentVideoIndex, filteredVideos]);

  // إرسال إشعار مشاهدة مرة لكل فيديو في الجلسة
  useEffect(() => {
    const current = filteredVideos[currentVideoIndex];
    if (!current || !user) return;
    if (sentViewNotificationsRef.current.has(current.id)) return;
    (async () => {
      try {
        await fetch('/api/notifications/interaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'video_view',
            profileOwnerId: current.playerId,
            viewerId: user.uid,
            viewerName: user.displayName || user.email || 'مستخدم',
            viewerType: 'user',
            viewerAccountType: 'player',
            videoId: current.id
          })
        });
        sentViewNotificationsRef.current.add(current.id);
      } catch {}
    })();
  }, [currentVideoIndex, filteredVideos, user]);

  const handleLike = async (videoId: string) => {
    if (!user) return;
    
    try {
      const isLiked = likedVideos.includes(videoId);
      const newLikedVideos = isLiked 
        ? likedVideos.filter(id => id !== videoId)
        : [...likedVideos, videoId];
      
      setLikedVideos(newLikedVideos);
      
      // تحديث Firebase
      const [playerId, videoIndex] = videoId.split('_');
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum]) {
          videos[videoIndexNum].likes = isLiked 
            ? Math.max(0, (videos[videoIndexNum].likes || 0) - 1)
            : (videos[videoIndexNum].likes || 0) + 1;
          
          await updateDoc(playerRef, { videos });
          
          // تحديث State المحلي
          setVideos(prevVideos =>
            prevVideos.map(video =>
              video.id === videoId
                ? { ...video, likes: videos[videoIndexNum].likes }
                : video
            )
          );
        }
      }
      
      // حفظ تفضيلات المستخدم بطريقة آمنة
      await safeUpdateUserData({ likedVideos: newLikedVideos });
      
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDoubleTap = (videoId: string) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (now - lastTap < DOUBLE_TAP_DELAY) {
      handleLike(videoId);
    }
    setLastTap(now);
  };

  const handleShare = async (videoId: string) => {
    try {
      const video = filteredVideos.find(v => v.id === videoId);
      if (!video) return;
      
      const shareText = `شاهد فيديو ${video.playerName} - ${video.description}`;
      const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/videos/${videoId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        // يمكن إضافة toast notification هنا
      }
      
      // تحديث عدد المشاركات
      const [playerId, videoIndex] = videoId.split('_');
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum]) {
          videos[videoIndexNum].shares = (videos[videoIndexNum].shares || 0) + 1;
          await updateDoc(playerRef, { videos });
          
          setVideos(prevVideos =>
            prevVideos.map(video =>
              video.id === videoId
                ? { ...video, shares: videos[videoIndexNum].shares }
                : video
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  const handleSave = async (videoId: string) => {
    if (!user) return;
    
    try {
      const isSaved = savedVideos.includes(videoId);
      const newSavedVideos = isSaved 
        ? savedVideos.filter(id => id !== videoId)
        : [...savedVideos, videoId];
      
      setSavedVideos(newSavedVideos);
      
      // حفظ بطريقة آمنة
      await safeUpdateUserData({ savedVideos: newSavedVideos });
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleFollow = async (playerId: string) => {
    if (!user?.uid) return;
    
    try {
      const isFollowing = following.includes(playerId);
      const newFollowing = isFollowing
        ? following.filter(id => id !== playerId)
        : [...following, playerId];
      
      setFollowing(newFollowing);
      
      // تحديث بطريقة آمنة
      await safeUpdateUserData({ following: newFollowing });
    } catch (error) {
      console.error('Error following player:', error);
    }
  };

  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentVideoIndex];
    if (currentVideo) {
      if (playing) {
        currentVideo.pause();
      } else {
        currentVideo.play();
      }
      setPlaying(!playing);
    }
  };

  const toggleMute = () => {
    setMuted(!muted);
    videoRefs.current.forEach(ref => {
      if (ref) ref.muted = !muted;
    });
  };

  const navigateVideo = (direction: 'up' | 'down') => {
    if (!containerRef.current) return;
    
    const newIndex = direction === 'down' 
      ? Math.min(currentVideoIndex + 1, filteredVideos.length - 1)
      : Math.max(currentVideoIndex - 1, 0);
    
    if (newIndex !== currentVideoIndex) {
      containerRef.current.scrollTo({
        top: newIndex * (typeof window !== 'undefined' ? window.innerHeight : 1000),
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-screen bg-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-t-2 border-white rounded-full animate-spin border-opacity-60"></div>
          <p className="text-white text-lg">جاري تحميل الفيديوهات...</p>
          <div className="text-white/60 text-sm">
            {accountType === 'club' ? 'نادي' : 
             accountType === 'academy' ? 'أكاديمية' : 
             accountType === 'trainer' ? 'مدرب' : 
             accountType === 'agent' ? 'وكيل لاعبين' : 'لاعب'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/60 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-3 text-white rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg hover:bg-black/70 transition-all"
              title="البحث"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-3 text-white rounded-full backdrop-blur-md border shadow-lg transition-all ${
                (filterPosition || filterAge || filterLocation || filterDuration) 
                  ? 'bg-blue-500/80 border-blue-300 hover:bg-blue-600/80' 
                  : 'bg-black/60 border-white/20 hover:bg-black/70'
              }`}
              title="فلاتر متقدمة"
            >
              <Filter className="w-5 h-5" />
              {(filterPosition || filterAge || filterLocation || filterDuration) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </button>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-4 py-2 text-white bg-black/60 backdrop-blur-md rounded-full text-sm border border-white/20 outline-none shadow-lg hover:bg-black/70 transition-all"
              style={{ 
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)'
              }}
              aria-label="فلتر النوع"
            >
              <option value="all" style={{ background: '#000', color: '#fff' }}>الكل</option>
              <option value="recent" style={{ background: '#000', color: '#fff' }}>الأحدث</option>
              <option value="popular" style={{ background: '#000', color: '#fff' }}>الأكثر شعبية</option>
              <option value="following" style={{ background: '#000', color: '#fff' }}>المتابعين</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <button
              onClick={toggleMute}
              className={`p-3 text-white rounded-full backdrop-blur-md border border-white/20 shadow-lg transition-all ${
                muted ? 'bg-red-500/80 hover:bg-red-600/80' : 'bg-black/60 hover:bg-black/70'
              }`}
              aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
              title={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
            >
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-20 left-4 right-4 z-40"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث عن لاعب أو وصف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 text-white bg-black/70 backdrop-blur-md rounded-full border-2 border-white/30 outline-none placeholder-white/80 shadow-2xl text-lg focus:border-white/50 focus:bg-black/80 transition-all"
                style={{ 
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-20 left-4 right-4 z-40"
          >
            <div className="bg-black/80 backdrop-blur-md rounded-2xl border border-white/20 p-4 shadow-2xl">
              {/* Header with close button */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg">🔍 فلاتر متقدمة</h3>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                  title="إغلاق الفلاتر"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* فلتر المركز */}
                <select
                  value={filterPosition}
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="px-3 py-2 text-white bg-black/60 rounded-lg border border-white/20 text-sm outline-none"
                  aria-label="فلتر المركز"
                >
                  <option value="">⚽ كل المراكز</option>
                  <option value="حارس">🥅 حارس</option>
                  <option value="مدافع">🛡️ مدافع</option>
                  <option value="وسط">⚡ وسط</option>
                  <option value="مهاجم">⚔️ مهاجم</option>
                </select>

                {/* فلتر العمر */}
                <select
                  value={filterAge}
                  onChange={(e) => setFilterAge(e.target.value)}
                  className="px-3 py-2 text-white bg-black/60 rounded-lg border border-white/20 text-sm outline-none"
                  aria-label="فلتر العمر"
                >
                  <option value="">🎂 كل الأعمار</option>
                  <option value="أقل من 12 سنة">👶 أقل من 12 سنة</option>
                  <option value="12-14 سنة">🧒 12-14 سنة</option>
                  <option value="15-17 سنة">👦 15-17 سنة</option>
                  <option value="18-20 سنة">👨‍🎓 18-20 سنة</option>
                  <option value="21-24 سنة">👨‍💼 21-24 سنة</option>
                  <option value="25-29 سنة">👨‍💻 25-29 سنة</option>
                  <option value="30-34 سنة">👨‍🏫 30-34 سنة</option>
                  <option value="35 سنة وأكثر">👴 35 سنة وأكثر</option>
                </select>

                {/* فلتر الموقع */}
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 text-white bg-black/60 rounded-lg border border-white/20 text-sm outline-none"
                  aria-label="فلتر الموقع"
                >
                  <option value="">🌍 كل المواقع</option>
                  <option value="القاهرة">🏛️ القاهرة</option>
                  <option value="الإسكندرية">🌊 الإسكندرية</option>
                  <option value="الجيزة">🏔️ الجيزة</option>
                  <option value="المنوفية">🌾 المنوفية</option>
                  <option value="الشرقية">🌅 الشرقية</option>
                </select>

                {/* فلتر المدة */}
                <select
                  value={filterDuration}
                  onChange={(e) => setFilterDuration(e.target.value)}
                  className="px-3 py-2 text-white bg-black/60 rounded-lg border border-white/20 text-sm outline-none"
                  aria-label="فلتر المدة"
                >
                  <option value="">⏱️ كل المدد</option>
                  <option value="short">⚡ قصير (&lt; 30 ثانية)</option>
                  <option value="medium">📹 متوسط (30 ثانية - دقيقتين)</option>
                  <option value="long">🎬 طويل (&gt; دقيقتين)</option>
                </select>
              </div>
              
              {/* زر مسح الفلاتر */}
              <div className="mt-3 flex justify-center">
                <button
                  onClick={() => {
                    setFilterPosition('');
                    setFilterAge('');
                    setFilterLocation('');
                    setFilterDuration('');
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-500 ease-out text-sm font-medium"
                  title="مسح جميع الفلاتر"
                >
                  🗑️ مسح جميع الفلاتر
                </button>
              </div>
              
                             {/* إحصائيات الفلترة */}
               <div className="mt-3 p-3 bg-black/40 rounded-lg border border-white/10">
                 <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/80">
                   <div className="flex items-center gap-2">
                     <span className="font-semibold">📊 النتائج:</span>
                     <span className="bg-white/20 px-2 py-1 rounded-full">
                       {filteredVideos.length} فيديو من أصل {videos.length}
                     </span>
                   </div>
                   {(filterPosition || filterAge || filterLocation || filterDuration) && (
                     <div className="flex items-center gap-2">
                       <span className="font-semibold">🔍 الفلاتر المطبقة:</span>
                       <div className="flex flex-wrap gap-1">
                         {filterPosition && <span className="bg-blue-500/30 px-2 py-1 rounded-full text-xs border border-blue-400/30">⚽ المركز: {filterPosition}</span>}
                         {filterAge && <span className="bg-green-500/30 px-2 py-1 rounded-full text-xs border border-green-400/30">🎂 العمر: {filterAge}</span>}
                         {filterLocation && <span className="bg-yellow-500/30 px-2 py-1 rounded-full text-xs border border-yellow-400/30">🌍 الموقع: {filterLocation}</span>}
                         {filterDuration && <span className="bg-purple-500/30 px-2 py-1 rounded-full text-xs border border-purple-400/30">⏱️ المدة: {filterDuration}</span>}
                       </div>
                     </div>
                   )}
                 </div>
                 
                 {/* نسبة الفلترة */}
                 {videos.length > 0 && (
                   <div className="mt-2">
                     <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                       <span>نسبة الفلترة</span>
                       <span>{Math.round((filteredVideos.length / videos.length) * 100)}%</span>
                     </div>
                     <div className="w-full bg-white/10 rounded-full h-2">
                       <div 
                         className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                         style={{ width: `${(filteredVideos.length / videos.length) * 100}%` }}
                       ></div>
                     </div>
                   </div>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Video Container */}
      <div
        ref={containerRef}
        className="w-full h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filteredVideos.map((video, index) => (
          <div
            key={video.id}
            className="relative w-full h-screen flex items-center justify-center snap-start"
          >
            {/* Video Player */}
            <div 
              className="relative w-full h-full flex items-center justify-center"
              onDoubleClick={() => handleDoubleTap(video.id)}
              onTouchEnd={() => setShowControls(!showControls)}
            >
              {isDirectVideo(video.url) ? (
                <video
                  ref={el => { videoRefs.current[index] = el; }}
                  src={video.url}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={muted}
                  autoPlay={index === currentVideoIndex}
                  onTimeUpdate={(e) => {
                    const video = e.currentTarget;
                    const progressPercent = (video.currentTime / video.duration) * 100;
                    setProgress(prev => ({ ...prev, [filteredVideos[index].id]: progressPercent }));
                  }}
                />
              ) : (
                <div className="relative w-full h-full overflow-hidden">
                  <ReactPlayer
                    url={video.url}
                    width="100%"
                    height="100%"
                    playing={index === currentVideoIndex && playing}
                    muted={muted}
                    loop
                    controls={false}
                    light={index !== currentVideoIndex}
                    style={{ 
                      pointerEvents: 'none',
                      position: 'relative',
                      zIndex: 1
                    }}
                    config={{
                      youtube: {
                        playerVars: {
                          autoplay: index === currentVideoIndex ? 1 : 0,
                          controls: 0,
                          showinfo: 0,
                          modestbranding: 1,
                          rel: 0,
                          fs: 0,
                          playsinline: 1,
                          mute: muted ? 1 : 0,
                          loop: 1,
                          iv_load_policy: 3,
                          cc_load_policy: 0,
                          disablekb: 1,
                          enablejsapi: 1,
                          end: 99999,
                          start: 0,
                          widget_referrer: 'https://www.youtube-nocookie.com',
                          origin: 'https://www.youtube-nocookie.com',
                          autohide: 1,
                          wmode: 'transparent',
                          html5: 1,
                          playerapiid: `player_${video.id}`,
                          host: 'https://www.youtube-nocookie.com'
                        },
                        embedOptions: {
                          host: 'https://www.youtube-nocookie.com',
                        }
                      },
                      vimeo: {
                        playerOptions: {
                          autoplay: index === currentVideoIndex,
                          controls: false,
                          loop: true,
                          muted: muted,
                          playsinline: true,
                          background: true,
                          byline: false,
                          portrait: false,
                          title: false
                        }
                      },
                      dailymotion: {
                        params: {
                          autoplay: index === currentVideoIndex ? 1 : 0,
                          controls: 0,
                          mute: muted ? 1 : 0,
                          loop: 1,
                          'endscreen-enable': 0,
                          'sharing-enable': 0,
                          'ui-start-screen-info': 0
                        }
                      }
                    }}
                    onReady={(player) => {
                      console.debug('Player ready:', video.id);
                    }}
                    onStart={() => {
                      console.debug('Video started:', video.id);
                      setPlaying(true);
                    }}
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onError={(error) => {
                      console.debug('Player error for video (using fallback):', video.id, 'Error:', error);
                    }}
                    onEnded={() => {
                      if (index < filteredVideos.length - 1) {
                        containerRef.current?.scrollTo({
                          top: (index + 1) * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                          behavior: 'smooth'
                        });
                      }
                    }}
                  />
                  
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(transparent 85%, black 100%)',
                      zIndex: 2
                    }}
                  />
                </div>
              )}
              
              {/* Video Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                <div
                  className="h-full bg-white transition-all duration-500 ease-out"
                  style={{ width: `${progress[video.id] || 0}%` }}
                />
              </div>
              
              {/* Play/Pause Overlay */}
              <AnimatePresence>
                {showControls && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={togglePlayPause}
                    aria-label={playing ? 'إيقاف مؤقت' : 'تشغيل'}
                    title={playing ? 'إيقاف مؤقت' : 'تشغيل'}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="p-4 bg-black/50 rounded-full">
                      {playing ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Action Buttons */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center space-y-6 z-30">
              {/* Player Avatar */}
              <div className="relative">
                <button
                  onClick={() => safeNavigate(router, `/dashboard/shared/player-profile/${video.playerId}`)}
                  aria-label="فتح ملف اللاعب"
                  title="فتح ملف اللاعب"
                  className="group"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden group-hover:border-cyan-400 transition-colors">
                    <PlayerImage 
                      src={video.playerImage}
                      alt={video.playerName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>
                {!following.includes(video.playerId) && (
                  <button
                    onClick={() => handleFollow(video.playerId)}
                    aria-label="متابعة اللاعب"
                    title="متابعة اللاعب"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <UserPlus className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>

              {/* Like Button */}
              <button
                onClick={() => handleLike(video.id)}
                aria-label="إعجاب بالفيديو"
                title="إعجاب بالفيديو"
                className="flex flex-col items-center space-y-1"
              >
                <div className={`p-3 rounded-full ${likedVideos.includes(video.id) ? 'bg-red-500' : 'bg-black/30'} backdrop-blur-sm`}>
                  <Heart 
                    className={`w-6 h-6 ${likedVideos.includes(video.id) ? 'text-white fill-current' : 'text-white'}`} 
                  />
                </div>
                <span className="text-white text-xs font-medium">{video.likes ?? 0}</span>
              </button>

              {/* Comment Button */}
              <button
                onClick={() => setSelectedVideoId(video.id)}
                aria-label="عرض التعليقات"
                title="عرض التعليقات"
                className="flex flex-col items-center space-y-1"
              >
                <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{video.comments ?? 0}</span>
              </button>

              {/* Save Button */}
              <button
                onClick={() => handleSave(video.id)}
                aria-label="حفظ الفيديو"
                title="حفظ الفيديو"
                className="flex flex-col items-center space-y-1"
              >
                <div className={`p-3 rounded-full ${savedVideos.includes(video.id) ? 'bg-yellow-500' : 'bg-black/30'} backdrop-blur-sm`}>
                  <Bookmark 
                    className={`w-6 h-6 ${savedVideos.includes(video.id) ? 'text-white fill-current' : 'text-white'}`} 
                  />
                </div>
              </button>

              {/* Share Button */}
              <button
                onClick={() => handleShare(video.id)}
                aria-label="مشاركة الفيديو"
                title="مشاركة الفيديو"
                className="flex flex-col items-center space-y-1"
              >
                <div className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">{video.shares ?? 0}</span>
              </button>

              {/* More Options */}
              <button aria-label="خيارات إضافية" title="خيارات إضافية" className="p-3 rounded-full bg-black/30 backdrop-blur-sm">
                <MoreHorizontal className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Bottom Info Panel */}
            <div className="absolute bottom-0 left-0 right-20 p-4 z-20">
              <div className="space-y-3">
                {/* Player Info */}
                <div className="flex items-center space-x-3 space-x-reverse">
                  <button
                    onClick={() => safeNavigate(router, `/dashboard/shared/player-profile/${video.playerId}`)}
                    className="hover:text-cyan-300 transition-colors"
                  >
                    <h3 className="text-white font-bold text-lg">@{video.playerName}</h3>
                  </button>
                  <span className="text-white/70 text-sm">{video.playerPosition}</span>
                  {video.playerAge && (
                    <span className="text-white/70 text-sm">{video.playerAge} سنة</span>
                  )}
                </div>

                {/* Description */}
                {video.description && (
                  <p className="text-white text-sm leading-relaxed max-w-xs">
                    {video.description}
                  </p>
                )}

                {/* Hashtags */}
                {video.hashtags && video.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {video.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-white text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Music Info */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Music className="w-4 h-4 text-white" />
                  <span className="text-white text-sm truncate max-w-xs">
                    {video.music}
                  </span>
                </div>

                {/* Location & Time */}
                <div className="flex items-center space-x-4 space-x-reverse text-white/70 text-xs">
                  {video.playerLocation && (
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <MapPin className="w-3 h-3" />
                      <span>{video.playerLocation}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <Calendar className="w-3 h-3" />
                    <span>{dayjs(video.createdAt).locale('ar').fromNow()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows (Desktop) */}
            <div className="hidden md:flex absolute left-8 top-1/2 transform -translate-y-1/2 flex-col space-y-4 z-30">
              <button
                onClick={() => navigateVideo('up')}
                disabled={currentVideoIndex === 0}
                aria-label="الفيديو السابق"
                title="الفيديو السابق"
                className="p-3 rounded-full bg-black/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={() => navigateVideo('down')}
                disabled={currentVideoIndex === filteredVideos.length - 1}
                aria-label="الفيديو التالي"
                title="الفيديو التالي"
                className="p-3 rounded-full bg-black/30 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Inline */}
      {selectedVideoId && (
        <div className="pointer-events-none">
          <div className="absolute inset-0 z-40 flex items-end justify-center pointer-events-none">
            <div className="w-full h-full relative">
              <div className="absolute inset-0 pointer-events-auto">
                <Comments
                  videoId={selectedVideoId}
                  isOpen={true}
                  onClose={() => setSelectedVideoId(null)}
                  inline={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Videos State */}
      {filteredVideos.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h3 className="text-xl font-bold mb-2">لا توجد فيديوهات</h3>
            <p className="text-white/70">
              {videos.length === 0 
                ? "لا توجد فيديوهات متاحة حالياً" 
                : "جرب تغيير الفلتر أو البحث"
              }
            </p>
            {(filterPosition || filterAge || filterLocation || filterDuration || searchQuery) && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilterPosition('');
                    setFilterAge('');
                    setFilterLocation('');
                    setFilterDuration('');
                    setShowAdvancedFilters(false);
                  }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-500 ease-out text-sm"
                  title="مسح جميع الفلاتر"
                >
                  🔄 مسح جميع الفلاتر
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 

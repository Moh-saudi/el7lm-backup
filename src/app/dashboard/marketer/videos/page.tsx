'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Play, Eye, Calendar, User, Filter, Search, Download, Share2 } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  duration: number;
  views: number;
  playerId: string;
  playerName: string;
  playerImage?: string;
  category: string;
  tags: string[];
  createdAt: any;
  status: 'public' | 'private';
}

export default function MarketerVideosPage() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'public' | 'private'>('all');

  const categories = ['مباريات', 'تدريبات', 'مهارات', 'أهداف', 'تحليل', 'أخرى'];

  useEffect(() => {
    if (user?.uid) {
      fetchVideos();
    }
  }, [user]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // جلب فيديوهات اللاعبين التابعين للماركتر
      const videosQuery = query(
        collection(db, 'videos'),
        where('marketerId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      
      const videosSnapshot = await getDocs(videosQuery);
      const videosData = videosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Video[];

      setVideos(videosData);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || video.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date: any) => {
    if (!date) return 'غير محدد';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل الفيديوهات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          فيديوهات اللاعبين
        </h1>
        <p className="text-gray-600">
          إدارة وعرض فيديوهات اللاعبين التابعين لوكالتك
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="البحث في الفيديوهات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="اختر الفئة"
        >
          <option value="">جميع الفئات</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as 'all' | 'public' | 'private')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          aria-label="اختر الحالة"
        >
          <option value="all">جميع الحالات</option>
          <option value="public">عام</option>
          <option value="private">خاص</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <Play className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">إجمالي الفيديوهات</p>
              <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatViews(videos.reduce((total, video) => total + video.views, 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <User className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">اللاعبين النشطين</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(videos.map(v => v.playerId)).size}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">الفيديوهات الجديدة</p>
              <p className="text-2xl font-bold text-gray-900">
                {videos.filter(v => {
                  const date = v.createdAt?.toDate?.() || new Date(v.createdAt);
                  const now = new Date();
                  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا توجد فيديوهات
          </h3>
          <p className="text-gray-600">
            {searchTerm || filterCategory || filterStatus !== 'all' 
              ? 'لم يتم العثور على فيديوهات تطابق معايير البحث.'
              : 'لم يتم رفع أي فيديوهات حتى الآن.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              {/* Video Thumbnail */}
              <div className="relative">
                <img 
                  src={video.thumbnail || '/placeholder-video.jpg'} 
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                  <button className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all">
                    <Play className="w-6 h-6 text-gray-800 fill-current" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    video.status === 'public' 
                      ? 'text-green-600 bg-green-100' 
                      : 'text-yellow-600 bg-yellow-100'
                  }`}>
                    {video.status === 'public' ? 'عام' : 'خاص'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* Player Info */}
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-2">
                    {video.playerImage ? (
                      <img 
                        src={video.playerImage} 
                        alt={video.playerName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      video.playerName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{video.playerName}</span>
                </div>

                {/* Video Title */}
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {video.title}
                </h3>

                {/* Video Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {video.description}
                </p>

                {/* Video Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    {formatViews(video.views)} مشاهدة
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(video.createdAt)}
                  </div>
                </div>

                {/* Category and Tags */}
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full mb-2">
                    {video.category}
                  </span>
                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {video.tags.slice(0, 2).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          #{tag}
                        </span>
                      ))}
                      {video.tags.length > 2 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{video.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                    عرض الفيديو
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

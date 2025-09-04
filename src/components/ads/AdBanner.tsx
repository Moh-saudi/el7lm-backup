'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Play, ExternalLink, Eye, Target, Star, Clock, Users, TrendingUp, Sparkles } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';

interface Ad {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
  priority: number;
  targetAudience: 'all' | 'new_users' | 'returning_users';
  startDate?: string;
  endDate?: string;
  views: number;
  clicks: number;
}

interface AdBannerProps {
  className?: string;
  maxAds?: number;
}

export default function AdBanner({ className = '', maxAds = 3 }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [visibleAds, setVisibleAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredAd, setHoveredAd] = useState<string | null>(null);
  const { user, userData } = useAuth();

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 0) {
      // Filter ads based on target audience and date
      const now = new Date();
      const filteredAds = ads.filter(ad => {
        if (!ad.isActive) return false;
        
        // Check date range if specified
        if (ad.startDate && new Date(ad.startDate) > now) return false;
        if (ad.endDate && new Date(ad.endDate) < now) return false;
        
        // Check target audience
        if (ad.targetAudience === 'all') return true;
        if (ad.targetAudience === 'new_users' && !userData) return true;
        if (ad.targetAudience === 'returning_users' && userData) return true;
        
        return false;
      });

      // Sort by priority and take top ads
      const sortedAds = filteredAds
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxAds);

      setVisibleAds(sortedAds);
    }
  }, [ads, userData, maxAds]);

  const fetchAds = async () => {
    try {
      const q = query(
        collection(db, 'ads'),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(maxAds * 2) // Fetch more to account for filtering
      );
      const snapshot = await getDocs(q);
      const adsData: Ad[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        views: doc.data().views || 0,
        clicks: doc.data().clicks || 0
      })) as Ad[];
      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdView = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error updating ad view:', error);
    }
  };

  const handleAdClick = async (adId: string, url?: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), {
        clicks: increment(1)
      });
      
      if (url) {
        // Handle both local and external URLs
        const finalUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
        window.open(finalUrl, '_blank');
      }
    } catch (error) {
      console.error('Error updating ad click:', error);
    }
  };

  const dismissAd = (adId: string) => {
    setVisibleAds(prev => prev.filter(ad => ad.id !== adId));
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return 'from-red-500 to-pink-600';
    if (priority >= 5) return 'from-orange-500 to-red-600';
    if (priority >= 3) return 'from-yellow-500 to-orange-600';
    return 'from-green-500 to-teal-600';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'image': return '🖼️';
      case 'text': return '📝';
      default: return '📄';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'all': return '👥';
      case 'new_users': return '🆕';
      case 'returning_users': return '🔄';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (visibleAds.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {visibleAds.map((ad, index) => (
        <Card 
          key={ad.id} 
          className={`relative overflow-hidden group cursor-pointer transform transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
            hoveredAd === ad.id ? 'shadow-xl' : 'shadow-lg'
          }`}
          onMouseEnter={() => {
            setHoveredAd(ad.id);
            handleAdView(ad.id);
          }}
          onMouseLeave={() => setHoveredAd(null)}
          style={{
            background: `linear-gradient(135deg, 
              ${index % 3 === 0 ? 'from-blue-50 via-indigo-50 to-purple-50' : 
                index % 3 === 1 ? 'from-green-50 via-emerald-50 to-teal-50' : 
                'from-orange-50 via-amber-50 to-yellow-50'})`
          }}
        >
          {/* Priority Badge */}
          <div className={`absolute top-4 right-4 z-20 bg-gradient-to-r ${getPriorityColor(ad.priority)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform rotate-12`}>
            ⭐ أولوية {ad.priority}
          </div>

          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4 z-20 h-8 w-8 p-0 rounded-full bg-white/90 hover:bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"
            onClick={(e) => {
              e.stopPropagation();
              dismissAd(ad.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Animated Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg p-[2px]">
            <div className="bg-white rounded-[6px] h-full w-full"></div>
          </div>

          <CardContent className="relative z-10 p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Media Section */}
              {(ad.type === 'image' || ad.type === 'video') && ad.mediaUrl && (
                <div className="flex-shrink-0 w-full lg:w-64 h-48 lg:h-48 relative group">
                  {ad.type === 'image' ? (
                    <div className="relative overflow-hidden rounded-xl shadow-lg">
                      <img
                        src={ad.mediaUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  ) : (
                    <div className="relative overflow-hidden rounded-xl shadow-lg bg-gradient-to-br from-gray-900 to-gray-700">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-105 transition-transform duration-500 ease-out">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                    {getTypeIcon(ad.type)} {ad.type === 'video' ? 'فيديو' : ad.type === 'image' ? 'صورة' : 'إعلان'}
                  </div>
                </div>
              )}

              {/* Content Section */}
              <div className="flex-1 space-y-6">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent leading-tight">
                      {ad.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {getAudienceIcon(ad.targetAudience)} {ad.targetAudience === 'new_users' ? 'مستخدمين جدد' : 
                         ad.targetAudience === 'returning_users' ? 'مستخدمين عائدين' : 'للجميع'}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {ad.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span>{ad.views} مشاهدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span>{ad.clicks} نقرة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span>{ad.clicks > 0 && ad.views > 0 ? Math.round((ad.clicks / ad.views) * 100) : 0}% تحويل</span>
                  </div>
                </div>

                {/* CTA Button */}
                {ad.ctaText && ad.ctaUrl && (
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => handleAdClick(ad.id, ad.ctaUrl)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                    >
                      <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                      {ad.ctaText}
                      <ExternalLink className="h-5 w-5 mr-2" />
                    </Button>
                    
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>عرض محدود</span>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>مستهدف</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>عالي الجودة</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

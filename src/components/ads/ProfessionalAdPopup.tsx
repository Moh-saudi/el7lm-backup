'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  X, 
  Play, 
  ExternalLink, 
  Clock, 
  Users, 
  Target, 
  TrendingUp,
  Star,
  Gift,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Eye
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { motion, AnimatePresence } from 'framer-motion';

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
  // New fields for popup ads
  popupType: 'modal' | 'toast' | 'banner' | 'side-panel';
  displayDelay: number; // seconds
  maxDisplays: number;
  displayFrequency: 'once' | 'daily' | 'weekly' | 'always';
  backgroundColor?: string;
  textColor?: string;
  accentColor?: string;
  showCloseButton: boolean;
  autoClose?: number; // seconds
  showProgressBar: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  discount?: string;
  countdown?: string;
}

interface ProfessionalAdPopupProps {
  className?: string;
  maxAds?: number;
  enableAnalytics?: boolean;
  userPreferences?: {
    allowAds: boolean;
    preferredTypes: string[];
    maxDisplaysPerDay: number;
  };
}

export default function ProfessionalAdPopup({ 
  className = '', 
  maxAds = 1,
  enableAnalytics = true,
  userPreferences = {
    allowAds: true,
    preferredTypes: ['modal', 'toast', 'banner'],
    maxDisplaysPerDay: 3
  }
}: ProfessionalAdPopupProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const { user, userData } = useAuth();
  const progressInterval = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!userPreferences.allowAds) return;
    fetchAds();
  }, [userPreferences.allowAds]);

  useEffect(() => {
    if (ads.length > 0) {
      const eligibleAd = getEligibleAd();
      if (eligibleAd) {
        scheduleAdDisplay(eligibleAd);
      }
    }
  }, [ads, userData]);

  useEffect(() => {
    if (currentAd && showPopup) {
      // Start progress bar if auto-close is enabled
      if (currentAd.autoClose && currentAd.showProgressBar) {
        const duration = currentAd.autoClose * 1000;
        const interval = 100;
        const increment = (interval / duration) * 100;
        
        progressInterval.current = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(progressInterval.current);
              handleClose();
              return 100;
            }
            return prev + increment;
          });
        }, interval);
      }

      // Start countdown if specified
      if (currentAd.countdown) {
        const countdownTime = parseCountdownTime(currentAd.countdown);
        setTimeLeft(countdownTime);
        
        countdownInterval.current = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 0) {
              clearInterval(countdownInterval.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [currentAd, showPopup]);

  const fetchAds = async () => {
    try {
      const q = query(
        collection(db, 'ads'),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(maxAds * 3)
      );
      const snapshot = await getDocs(q);
      const adsData: Ad[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        views: doc.data().views || 0,
        clicks: doc.data().clicks || 0,
        popupType: doc.data().popupType || 'modal',
        displayDelay: doc.data().displayDelay || 3,
        maxDisplays: doc.data().maxDisplays || 1,
        displayFrequency: doc.data().displayFrequency || 'once',
        showCloseButton: doc.data().showCloseButton !== false,
        autoClose: doc.data().autoClose,
        showProgressBar: doc.data().showProgressBar || false,
        urgency: doc.data().urgency || 'medium',
        discount: doc.data().discount,
        countdown: doc.data().countdown
      })) as Ad[];
      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEligibleAd = (): Ad | null => {
    const now = new Date();
    const today = new Date().toDateString();
    
    // Check user's daily display limit
    const todayDisplays = parseInt(localStorage.getItem(`ad_displays_${today}`) || '0');
    if (todayDisplays >= userPreferences.maxDisplaysPerDay) return null;

    // Filter and sort ads
    const eligibleAds = ads.filter(ad => {
      if (!ad.isActive) return false;
      
      // Check date range
      if (ad.startDate && new Date(ad.startDate) > now) return false;
      if (ad.endDate && new Date(ad.endDate) < now) return false;
      
      // Check target audience
      if (ad.targetAudience === 'all') return true;
      if (ad.targetAudience === 'new_users' && !userData) return true;
      if (ad.targetAudience === 'returning_users' && userData) return true;
      
      // Check display frequency
      const lastDisplay = localStorage.getItem(`ad_last_display_${ad.id}`);
      if (ad.displayFrequency === 'once' && lastDisplay) return false;
      if (ad.displayFrequency === 'daily' && lastDisplay === today) return false;
      if (ad.displayFrequency === 'weekly') {
        const lastDisplayDate = new Date(lastDisplay || 0);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (lastDisplayDate > weekAgo) return false;
      }
      
      return true;
    });

    // Sort by priority and urgency
    return eligibleAds.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aUrgency = urgencyOrder[a.urgency || 'medium'];
      const bUrgency = urgencyOrder[b.urgency || 'medium'];
      
      if (aUrgency !== bUrgency) return bUrgency - aUrgency;
      return b.priority - a.priority;
    })[0] || null;
  };

  const scheduleAdDisplay = (ad: Ad) => {
    setTimeout(() => {
      setCurrentAd(ad);
      setShowPopup(true);
      setProgress(0);
      handleAdView(ad.id);
      updateDisplayCount();
    }, ad.displayDelay * 1000);
  };

  const handleAdView = async (adId: string) => {
    if (!enableAnalytics) return;
    try {
      await updateDoc(doc(db, 'ads', adId), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error updating ad view:', error);
    }
  };

  const handleAdClick = async (adId: string, url?: string) => {
    if (!enableAnalytics) return;
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

  const handleClose = () => {
    setShowPopup(false);
    setCurrentAd(null);
    setProgress(0);
    setTimeLeft(0);
    
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  };

  const updateDisplayCount = () => {
    const today = new Date().toDateString();
    const currentCount = parseInt(localStorage.getItem(`ad_displays_${today}`) || '0');
    localStorage.setItem(`ad_displays_${today}`, (currentCount + 1).toString());
    
    if (currentAd) {
      localStorage.setItem(`ad_last_display_${currentAd.id}`, today);
    }
  };

  const parseCountdownTime = (countdown: string): number => {
    // Parse countdown string like "2h 30m 15s" or "3600s"
    const hours = countdown.match(/(\d+)h/)?.[1] || '0';
    const minutes = countdown.match(/(\d+)m/)?.[1] || '0';
    const seconds = countdown.match(/(\d+)s/)?.[1] || '0';
    
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds);
  };

  const formatTimeLeft = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    if (m > 0) return `${m}:${s.toString().padStart(2, '0')}`;
    return `${s}s`;
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'high': return <TrendingUp className="h-5 w-5 text-orange-500" />;
      case 'medium': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  if (loading || !currentAd) return null;

  return (
    <AnimatePresence>
      {showPopup && currentAd && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={currentAd.showCloseButton ? handleClose : undefined}
          />

          {/* Modal Popup */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="relative max-w-md w-full mx-auto shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-white via-blue-50 to-purple-50">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent"></div>
              {/* Progress Bar */}
              {currentAd.showProgressBar && currentAd.autoClose && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              )}

              {/* Close Button */}
              {currentAd.showCloseButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-10 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white shadow-lg"
                  onClick={handleClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                      {getUrgencyIcon(currentAd.urgency || 'medium')}
                    </div>
                    <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      {currentAd.title}
                    </CardTitle>
                  </div>
                  
                  {/* Urgency Badge */}
                  <Badge className={`${getUrgencyColor(currentAd.urgency || 'medium')} shadow-lg backdrop-blur-sm`}>
                    {currentAd.urgency === 'critical' ? '🚨 عاجل' :
                     currentAd.urgency === 'high' ? '⚡ مهم' :
                     currentAd.urgency === 'medium' ? '📢 عادي' : '💡 منخفض'}
                  </Badge>
                </div>

                {/* Discount Badge */}
                {currentAd.discount && (
                  <div className="mt-3">
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
                      <Gift className="h-4 w-4 mr-2" />
                      {currentAd.discount}
                    </Badge>
                  </div>
                )}

                {/* Countdown */}
                {currentAd.countdown && timeLeft > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 bg-white/50 backdrop-blur-sm p-2 rounded-lg">
                    <Clock className="h-4 w-4 text-red-500" />
                    <span className="font-semibold">ينتهي خلال: {formatTimeLeft(timeLeft)}</span>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                {/* Media Content */}
                {(currentAd.type === 'image' || currentAd.type === 'video') && currentAd.mediaUrl && (
                  <div className="relative rounded-xl overflow-hidden shadow-lg group">
                    {currentAd.type === 'image' ? (
                      <div className="relative">
                        <img
                          src={currentAd.mediaUrl}
                          alt={currentAd.title}
                          className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform group-hover:scale-105 transition-transform duration-500 ease-out">
                          <Play className="h-16 w-16 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {currentAd.type === 'video' ? '🎥 فيديو' : currentAd.type === 'image' ? '🖼️ صورة' : '📝 إعلان'}
                    </div>
                  </div>
                )}

                {/* Description */}
                <p className="text-gray-700 leading-relaxed text-lg bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                  {currentAd.description}
                </p>

                {/* CTA Button */}
                {currentAd.ctaText && currentAd.ctaUrl && (
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleAdClick(currentAd.id, currentAd.ctaUrl)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
                      size="lg"
                    >
                      <Sparkles className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                      {currentAd.ctaText}
                      <ExternalLink className="h-5 w-5 mr-2" />
                    </Button>
                    
                    <div className="text-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 inline mr-1" />
                      <span>عرض محدود - لا تفوت الفرصة!</span>
                    </div>
                  </div>
                )}

                {/* Ad Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-200 bg-white/30 backdrop-blur-sm p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold">{currentAd.views} مشاهدة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">{currentAd.clicks} نقرة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="font-semibold">
                      {currentAd.clicks > 0 && currentAd.views > 0 ? Math.round((currentAd.clicks / currentAd.views) * 100) : 0}% تحويل
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

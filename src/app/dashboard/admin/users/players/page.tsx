'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query, 
  orderBy,
  where,
  limit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import {
  User,
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  FileText,
  MoreHorizontal,
  UserCheck,
  UserX,
  Award,
  TrendingUp,
  Activity,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import SimpleLoader from '@/components/shared/SimpleLoader';
import CreateLoginAccountButton from '@/components/ui/CreateLoginAccountButton';
import LoginAccountStatus from '@/components/ui/LoginAccountStatus';
import IndependentAccountCreator from '@/components/ui/IndependentAccountCreator';
import SecurityStatusBadge from '@/components/ui/SecurityStatusBadge';

interface PlayerData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: any;
  age?: number;
  nationality?: string;
  country?: string;
  city?: string;
  position?: string;
  preferredFoot?: string;
  height?: number;
  weight?: number;
  profileImageUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  registrationDate: any;
  lastLogin?: any;
  stats?: {
    profileViews: number;
    videoViews: number;
    matches: number;
    goals: number;
    assists: number;
  };
  mediaCount: {
    images: number;
    videos: number;
    documents: number;
  };
  bio?: string;
  achievements?: string[];
  marketValue?: number;
  currentClub?: string;
  contractEndDate?: any;
}

const POSITIONS = [
  'حارس مرمى',
  'مدافع أيمن',
  'مدافع أيسر', 
  'مدافع وسط',
  'لاعب وسط دفاعي',
  'لاعب وسط',
  'لاعب وسط مهاجم',
  'جناح أيمن',
  'جناح أيسر',
  'مهاجم'
];

export default function PlayersManagement() {
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<PlayerData | null>(null);
  const [totalStats, setTotalStats] = useState({
    total: 0,
    verified: 0,
    active: 0,
    withClubs: 0,
    avgAge: 0,
    totalValue: 0
  });

  useEffect(() => {
    fetchPlayers(true);
  }, [selectedPosition, selectedCountry, selectedStatus, selectedAge]);

  useEffect(() => {
    if (searchTerm) {
      const delayedSearch = setTimeout(() => {
        fetchPlayers(true);
      }, 500);
      return () => clearTimeout(delayedSearch);
    } else {
      fetchPlayers(true);
    }
  }, [searchTerm]);

  const fetchPlayers = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPlayers([]);
        setLastDoc(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      let q = query(
        collection(db, 'players'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const playersData = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            // حساب العمر
            let age = 0;
            if (data.dateOfBirth) {
              const birthDate = data.dateOfBirth.toDate();
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }

            // جلب إحصائيات الميديا
            const mediaCount = await getPlayerMediaCount(docSnap.id);

            // جلب الإحصائيات
            const stats = await getPlayerStats(docSnap.id);

            return {
              id: docSnap.id,
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              email: data.email,
              phone: data.phone,
              dateOfBirth: data.dateOfBirth,
              age,
              nationality: data.nationality,
              country: data.country,
              city: data.city,
              position: data.position,
              preferredFoot: data.preferredFoot,
              height: data.height,
              weight: data.weight,
              profileImageUrl: data.profile_image_url || data.profileImageUrl,
              isVerified: data.isVerified || false,
              isActive: data.isActive !== false,
              registrationDate: data.createdAt,
              lastLogin: data.lastLogin,
              stats,
              mediaCount,
              bio: data.bio,
              achievements: data.achievements || [],
              marketValue: data.marketValue || 0,
              currentClub: data.currentClub,
              contractEndDate: data.contractEndDate
            } as PlayerData;
          })
        );

        // تطبيق الفلاتر
        let filteredPlayers = playersData;
        
        if (searchTerm) {
          filteredPlayers = playersData.filter(player => {
            const playerName = `${player.firstName || ''} ${player.lastName || ''}`.trim();
            const playerEmail = player.email || '';
            const playerPhone = player.phone || '';
            const playerPosition = player.position || '';
            
            return playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   playerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   playerPhone.includes(searchTerm) ||
                   playerPosition.toLowerCase().includes(searchTerm.toLowerCase());
          });
        }

        if (selectedPosition !== 'all') {
          filteredPlayers = filteredPlayers.filter(player => player.position === selectedPosition);
        }

        if (selectedCountry !== 'all') {
          filteredPlayers = filteredPlayers.filter(player => player.country === selectedCountry);
        }

        if (selectedStatus !== 'all') {
          filteredPlayers = filteredPlayers.filter(player => {
            switch (selectedStatus) {
              case 'verified': return player.isVerified;
              case 'unverified': return !player.isVerified;
              case 'active': return player.isActive;
              case 'inactive': return !player.isActive;
              case 'with-club': return player.currentClub;
              case 'free-agent': return !player.currentClub;
              default: return true;
            }
          });
        }

        if (selectedAge !== 'all') {
          filteredPlayers = filteredPlayers.filter(player => {
            const age = player.age || 0;
            switch (selectedAge) {
              case 'youth': return age < 18;
              case 'young': return age >= 18 && age <= 25;
              case 'prime': return age >= 26 && age <= 30;
              case 'experienced': return age > 30;
              default: return true;
            }
          });
        }

        if (reset) {
          setPlayers(filteredPlayers);
        } else {
          setPlayers(prev => [...prev, ...filteredPlayers]);
        }

        setHasMore(snapshot.docs.length === 20);
        
        if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        }

        // حساب الإحصائيات
        const stats = {
          total: filteredPlayers.length,
          verified: filteredPlayers.filter(p => p.isVerified).length,
          active: filteredPlayers.filter(p => p.isActive).length,
          withClubs: filteredPlayers.filter(p => p.currentClub).length,
          avgAge: filteredPlayers.length > 0 ? 
            Math.round(filteredPlayers.reduce((sum, p) => sum + (p.age || 0), 0) / filteredPlayers.length) : 0,
          totalValue: filteredPlayers.reduce((sum, p) => sum + (p.marketValue || 0), 0)
        };
        setTotalStats(stats);
      }

    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const getPlayerMediaCount = async (playerId: string) => {
    const mediaCount = {
      images: 0,
      videos: 0,
      documents: 0
    };

    try {
      const buckets = ['playeravatar', 'player-images', 'videos'];
      
      for (const bucket of buckets) {
        try {
          const { data: files } = await supabase.storage
            .from(bucket)
            .list(playerId);
          
          if (files) {
            const images = files.filter(f => 
              f.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)
            );
            const videos = files.filter(f => 
              f.name.match(/\.(mp4|avi|mov|wmv|webm)$/i)
            );
            const docs = files.filter(f => 
              f.name.match(/\.(pdf|doc|docx|txt)$/i)
            );
            
            mediaCount.images += images.length;
            mediaCount.videos += videos.length;
            mediaCount.documents += docs.length;
          }
        } catch (error) {
          // تجاهل الأخطاء لبوكتات غير موجودة
        }
      }
    } catch (error) {
      console.error('Error getting media count:', error);
    }

    return mediaCount;
  };

  const getPlayerStats = async (playerId: string) => {
    // إحصائيات افتراضية حقيقية (أصفار) - لا توجد بيانات وهمية
    const defaultStats = {
      profileViews: 0,
      videoViews: 0,
      matches: 0,
      goals: 0,
      assists: 0
    };

    try {
      const statsDoc = await getDoc(doc(db, 'player_stats', playerId));
      if (statsDoc.exists()) {
        const data = statsDoc.data();
        return {
          profileViews: data.profileViews || 0,
          videoViews: data.videoViews || 0,
          matches: data.matches || 0,
          goals: data.goals || 0,
          assists: data.assists || 0
        };
      }
    } catch (error: any) {
      // معالجة صامتة للأخطاء - الإحصائيات ليست حرجة
      if (error.code === 'permission-denied') {
        // عدم طباعة أخطاء الصلاحيات لتجنب التكرار
        return defaultStats;
      } else if (error.code !== 'not-found') {
        // طباعة الأخطاء الأخرى فقط (غير not-found)
        console.warn(`📊 [STATS] Non-critical error loading stats for ${playerId}:`, error.code);
      }
    }
    
    // إرجاع إحصائيات حقيقية (أصفار) في جميع الحالات
    return defaultStats;
  };

  const togglePlayerVerification = async (playerId: string, isVerified: boolean) => {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        isVerified: !isVerified,
        verifiedAt: !isVerified ? new Date() : null,
        updatedAt: new Date()
      });
      
      setPlayers(prev => prev.map(player => 
        player.id === playerId 
          ? { ...player, isVerified: !isVerified }
          : player
      ));
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const togglePlayerStatus = async (playerId: string, isActive: boolean) => {
    try {
      await updateDoc(doc(db, 'players', playerId), {
        isActive: !isActive,
        updatedAt: new Date()
      });
      
      setPlayers(prev => prev.map(player => 
        player.id === playerId 
          ? { ...player, isActive: !isActive }
          : player
      ));
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const deletePlayer = async () => {
    if (!playerToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'players', playerToDelete.id));
      setPlayers(prev => prev.filter(p => p.id !== playerToDelete.id));
      setDeleteDialogOpen(false);
      setPlayerToDelete(null);
    } catch (error) {
      console.error('Error deleting player:', error);
    }
  };

  const exportPlayers = () => {
    const csvData = players.map(player => ({
      'الاسم الأول': player.firstName,
      'الاسم الأخير': player.lastName,
      'البريد الإلكتروني': player.email || '',
      'الهاتف': player.phone || '',
      'العمر': player.age || '',
      'الجنسية': player.nationality || '',
      'البلد': player.country || '',
      'المدينة': player.city || '',
      'المركز': player.position || '',
      'القدم المفضلة': player.preferredFoot || '',
      'الطول': player.height || '',
      'الوزن': player.weight || '',
      'موثق': player.isVerified ? 'نعم' : 'لا',
      'نشط': player.isActive ? 'نعم' : 'لا',
      'النادي الحالي': player.currentClub || '',
      'القيمة السوقية': player.marketValue || 0,
      'عدد الصور': player.mediaCount.images,
      'عدد الفيديوهات': player.mediaCount.videos,
      'مشاهدات الملف': player.stats?.profileViews || 0,
      'عدد المباريات': player.stats?.matches || 0,
      'عدد الأهداف': player.stats?.goals || 0,
      'عدد التمريرات الحاسمة': player.stats?.assists || 0,
      'تاريخ التسجيل': player.registrationDate?.toDate()?.toLocaleDateString('ar-SA') || ''
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `players_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <SimpleLoader size="large" color="blue" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">إدارة اللاعبين</h1>
          <p className="text-gray-500 mt-2">إدارة شاملة لجميع اللاعبين المسجلين في النظام</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => fetchPlayers(true)} variant="outline">
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button onClick={exportPlayers} variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي اللاعبين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.total.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لاعبين موثقين</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalStats.verified.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.total > 0 ? Math.round((totalStats.verified / totalStats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لاعبين نشطين</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalStats.active.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.total > 0 ? Math.round((totalStats.active / totalStats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مع أندية</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalStats.withClubs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.total > 0 ? Math.round((totalStats.withClubs / totalStats.total) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط العمر</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{totalStats.avgAge}</div>
            <p className="text-xs text-muted-foreground">سنة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي القيمة</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(totalStats.totalValue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>فلاتر البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">البحث</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="اسم، بريد، هاتف، مركز..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">المركز</label>
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المراكز</SelectItem>
                  {POSITIONS.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الحالة</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="verified">موثق</SelectItem>
                  <SelectItem value="unverified">غير موثق</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="with-club">مع نادي</SelectItem>
                  <SelectItem value="free-agent">لاعب حر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">الفئة العمرية</label>
              <Select value={selectedAge} onValueChange={setSelectedAge}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأعمار</SelectItem>
                  <SelectItem value="youth">ناشئين (أقل من 18)</SelectItem>
                  <SelectItem value="young">شباب (18-25)</SelectItem>
                  <SelectItem value="prime">الذروة (26-30)</SelectItem>
                  <SelectItem value="experienced">خبرة (أكبر من 30)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">البلد</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع البلدان</SelectItem>
                  <SelectItem value="SA">السعودية</SelectItem>
                  <SelectItem value="EG">مصر</SelectItem>
                  <SelectItem value="AE">الإمارات</SelectItem>
                  <SelectItem value="KW">الكويت</SelectItem>
                  <SelectItem value="QA">قطر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Players Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة اللاعبين</CardTitle>
          <CardDescription>
            عرض {players.length} لاعب من إجمالي {totalStats.total} لاعب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الملف الشخصي</TableHead>
                  <TableHead>المعلومات الأساسية</TableHead>
                  <TableHead>المركز</TableHead>
                  <TableHead>النادي/الحالة</TableHead>
                  <TableHead>الإحصائيات</TableHead>
                  <TableHead>الميديا</TableHead>
                  <TableHead>القيمة السوقية</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={player.profileImageUrl} />
                          <AvatarFallback>
                            {player.firstName[0]}{player.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {player.firstName} {player.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{player.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            {player.isVerified ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="w-3 h-3 ml-1" />
                                موثق
                              </Badge>
                            ) : (
                              <Badge variant="secondary">غير موثق</Badge>
                            )}
                            {!player.isActive && (
                              <Badge variant="destructive">غير نشط</Badge>
                            )}
                            <LoginAccountStatus 
                              playerEmail={player.email}
                              className="text-xs"
                              showLabel={false}
                            />
                            <SecurityStatusBadge 
                              userData={player}
                              userPhone={player.phone}
                              showDetails={true}
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {player.age ? `${player.age} سنة` : 'غير محدد'}
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {player.country || 'غير محدد'} {player.city && `- ${player.city}`}
                        </div>
                        {player.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {player.phone}
                          </div>
                        )}
                        {player.height && player.weight && (
                          <div className="text-sm text-gray-500">
                            {player.height}cm / {player.weight}kg
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {player.position || 'غير محدد'}
                        </Badge>
                        {player.preferredFoot && (
                          <div className="text-sm text-gray-500">
                            {player.preferredFoot}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {player.currentClub ? (
                          <div>
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              {player.currentClub}
                            </Badge>
                            {player.contractEndDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                العقد حتى: {player.contractEndDate.toDate().toLocaleDateString('ar-SA')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Badge variant="secondary">لاعب حر</Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>👁️ {player.stats?.profileViews || 0} مشاهدة</div>
                        <div>⚽ {player.stats?.matches || 0} مباراة</div>
                        <div>🥅 {player.stats?.goals || 0} هدف</div>
                        <div>🎯 {player.stats?.assists || 0} تمريرة</div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex gap-3 text-sm">
                        <div className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          {player.mediaCount.images}
                        </div>
                        <div className="flex items-center gap-1">
                          <Video className="w-3 h-3" />
                          {player.mediaCount.videos}
                        </div>
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {player.mediaCount.documents}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-medium">
                        {player.marketValue ? formatCurrency(player.marketValue) : 'غير محدد'}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreateLoginAccountButton
                          playerId={player.id}
                          playerData={{
                            full_name: `${player.firstName} ${player.lastName}`,
                            name: `${player.firstName} ${player.lastName}`,
                            email: player.email,
                            phone: player.phone,
                            club_id: player.clubId,
                            academy_id: player.academyId,
                            trainer_id: player.trainerId,
                            agent_id: player.agentId,
                            ...player
                          }}
                          source="players"
                          size="sm"
                          showIcon={false}
                          onSuccess={(password) => {
                            console.log(`تم إنشاء حساب للاعب ${player.firstName} ${player.lastName} بكلمة المرور: ${password}`);
                          }}
                        />
                        
                        <IndependentAccountCreator
                          playerId={player.id}
                          playerData={{
                            full_name: `${player.firstName} ${player.lastName}`,
                            name: `${player.firstName} ${player.lastName}`,
                            email: player.email,
                            phone: player.phone,
                            whatsapp: player.whatsapp,
                            club_id: player.clubId,
                            academy_id: player.academyId,
                            trainer_id: player.trainerId,
                            agent_id: player.agentId,
                            ...player
                          }}
                          source="players"
                          variant="outline"
                          size="sm"
                          className="text-purple-600 hover:bg-purple-50"
                        />
                        
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 ml-2" />
                            تعديل
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePlayerVerification(player.id, player.isVerified)}
                          >
                            {player.isVerified ? (
                              <>
                                <UserX className="w-4 h-4 ml-2" />
                                إلغاء التوثيق
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 ml-2" />
                                توثيق
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => togglePlayerStatus(player.id, player.isActive)}
                          >
                            {player.isActive ? (
                              <>
                                <XCircle className="w-4 h-4 ml-2" />
                                تعطيل
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 ml-2" />
                                تفعيل
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 ml-2" />
                            إرسال رسالة
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setPlayerToDelete(player);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button 
                onClick={() => fetchPlayers(false)} 
                disabled={loadingMore}
                variant="outline"
              >
                {loadingMore ? (
                  <>
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  'تحميل المزيد'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف اللاعب "{playerToDelete?.firstName} {playerToDelete?.lastName}"؟ 
              سيتم حذف جميع بياناته ووسائطه بشكل نهائي.
              هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={deletePlayer} variant="destructive">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 

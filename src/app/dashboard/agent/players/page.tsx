'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CreateLoginAccountButton from '@/components/ui/CreateLoginAccountButton';
import LoginAccountStatus from '@/components/ui/LoginAccountStatus';
import IndependentAccountCreator from '@/components/ui/IndependentAccountCreator';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Camera, 
  Video, 
  Image as ImageIcon, 
  ExternalLink, 
  Trash2, 
  User, 
  Filter,
  Eye,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Player } from '@/types/player';
import { toast } from 'react-toastify';
import { organizationReferralService } from '@/lib/organization/organization-referral-service';
import { PlayerJoinRequest } from '@/types/organization-referral';
import OrgReferralSummaryCard from '@/components/referrals/OrgReferralSummaryCard';

export default function AgentPlayersPage() {
  const { user, userData } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage, setPlayersPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [joinRequests, setJoinRequests] = useState<PlayerJoinRequest[]>([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);

  useEffect(() => {
    console.log('🔍 حالة المصادقة:', { user: user?.uid, loading: !user });
    if (user?.uid) {
      console.log('✅ الوكيل مصادق - جاري تحميل اللاعبين...');
      loadPlayers();
      loadJoinRequests();
    } else {
      console.log('⚠️ الوكيل غير مصادق أو لا يزال يتم التحميل');
    }
  }, [user]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      
      const baseQuery = query(
        collection(db, "players"),
        where("agent_id", "==", user?.uid)
      );

      const snapshot = await getDocs(baseQuery);
      
      const playersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((p: any) => !p.isDeleted) as Player[];
      
      // Manual sorting on the client-side
      playersData.sort((a, b) => {
          const aValue = a[sortBy as keyof Player] as any;
          const bValue = b[sortBy as keyof Player] as any;
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });
      
      setPlayers(playersData);
    } catch (error) {
      console.error("Error loading players:", error);
      toast.error("Failed to load players.");
    } finally {
      setLoading(false);
    }
  };

  const loadJoinRequests = async () => {
    try {
      const requests = await organizationReferralService.getOrganizationJoinRequests(user!.uid, 'pending');
      setJoinRequests(requests);
    } catch (error) {
      console.error('خطأ في تحميل طلبات الانضمام:', error);
    }
  };

  // Filter, search, sort and paginate players
  const filteredPlayers = players.filter(player => {
    const playerName = player.full_name || (player as Player & { name?: string }).name || '';
    const playerEmail = player.email || '';
    const playerPhone = player.phone || '';
    
    const matchesSearch = playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         playerPhone.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' || player.subscription_status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const isProfileComplete = (p: Player) => {
    const hasName = Boolean(p.full_name || (p as any).name);
    const hasPhone = Boolean(p.phone);
    const hasCountry = Boolean(p.country);
    const hasPosition = Boolean(p.primary_position || (p as any).position);
    const hasMedia = Boolean((p as any).videos?.length || (p as any).additional_images?.length);
    return hasName && hasPhone && hasCountry && hasPosition && hasMedia;
  };

  const getProfileCompletion = (p: Player) => {
    const checkpoints: boolean[] = [
      Boolean(p.full_name || (p as any).name),
      Boolean(p.phone),
      Boolean(p.country),
      Boolean(p.primary_position || (p as any).position),
      Boolean(p.height),
      Boolean(p.weight),
      Boolean((p as any).videos && (p as any).videos.length > 0),
      Boolean((p as any).additional_images && (p as any).additional_images.length > 0),
      Boolean((p as any).birth_date)
    ];
    const done = checkpoints.filter(Boolean).length;
    return Math.round((done / checkpoints.length) * 100);
  };

  // Sort players
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.full_name || a.name || '';
        bValue = b.full_name || b.name || '';
        break;
      case 'created_at':
        aValue = (a.createdAt || a.created_at) ? new Date((a.createdAt || a.created_at) instanceof Date ? (a.createdAt || a.created_at) : (a.createdAt || a.created_at)) : new Date(0);
        bValue = (b.createdAt || b.created_at) ? new Date((b.createdAt || b.created_at) instanceof Date ? (b.createdAt || b.created_at) : (b.createdAt || b.created_at)) : new Date(0);
        break;
      case 'updated_at':
        aValue = a.updated_at ? new Date(a.updated_at instanceof Date ? a.updated_at : a.updated_at) : new Date(0);
        bValue = b.updated_at ? new Date(b.updated_at instanceof Date ? b.updated_at : b.updated_at) : new Date(0);
        break;
      case 'subscription_status':
        aValue = a.subscription_status || 'inactive';
        bValue = b.subscription_status || 'inactive';
        break;
      default:
        aValue = a.full_name || a.name || '';
        bValue = b.full_name || b.name || '';
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPlayers = sortedPlayers.length;
  const totalPages = Math.ceil(totalPlayers / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const currentPlayers = sortedPlayers.slice(startIndex, endIndex);

  // Reset to first page when search/filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Get subscription status badge
  const getSubscriptionBadge = (status: string, endDate: any) => {
    const now = new Date();
    let end: Date;
    
    try {
      if (typeof endDate === 'object' && endDate.toDate && typeof endDate.toDate === 'function') {
        end = endDate.toDate();
      } else if (endDate instanceof Date) {
        end = endDate;
      } else if (endDate) {
        end = new Date(endDate);
      } else {
        end = new Date(0);
      }
    } catch (error) {
      end = new Date(0);
    }
    
    if (status === 'active' && end > now) {
      return <Badge className="text-green-800 bg-green-100 hover:bg-green-200"><CheckCircle className="mr-1 w-3 h-3" />نشط</Badge>;
    } else if (status === 'active' && end <= now) {
      return <Badge className="text-yellow-800 bg-yellow-100 hover:bg-yellow-200"><AlertCircle className="mr-1 w-3 h-3" />منتهي</Badge>;
    } else if (status === 'expired') {
      return <Badge className="text-red-800 bg-red-100 hover:bg-red-200"><XCircle className="mr-1 w-3 h-3" />منتهي</Badge>;
    } else {
      return <Badge className="text-gray-800 bg-gray-100 hover:bg-gray-200"><XCircle className="mr-1 w-3 h-3" />غير نشط</Badge>;
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate: any) => {
    if (!birthDate) return null;
    try {
      let d: Date;
      if (typeof birthDate === 'object' && birthDate.toDate && typeof birthDate.toDate === 'function') {
        d = birthDate.toDate();
      } else if (birthDate instanceof Date) {
        d = birthDate;
      } else {
        d = new Date(birthDate);
      }
      
      if (isNaN(d.getTime())) return null;
      
      const today = new Date();
      let age = today.getFullYear() - d.getFullYear();
      const monthDiff = today.getMonth() - d.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return null;
    }
  };

  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'غير محدد';
    try {
      let d: Date;
      if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
        d = date.toDate();
      } else if (date instanceof Date) {
        d = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        d = new Date(date);
      } else {
        return 'غير محدد';
      }
      
      if (isNaN(d.getTime())) {
        return 'غير محدد';
      }
      
      return d.toLocaleDateString('ar-SA');
    } catch (error) {
      return 'غير محدد';
    }
  };

  // Calculate time ago
  const getTimeAgo = (date: any) => {
    if (!date) return 'غير محدد';
    try {
      let d: Date;
      if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
        d = date.toDate();
      } else if (date instanceof Date) {
        d = date;
      } else {
        d = new Date(date);
      }
      
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);
      
      if (diffMonths > 0) {
        return `منذ ${diffMonths} شهر`;
      } else if (diffWeeks > 0) {
        return `منذ ${diffWeeks} أسبوع`;
      } else if (diffDays > 0) {
        return `منذ ${diffDays} يوم`;
      } else if (diffHours > 0) {
        return `منذ ${diffHours} ساعة`;
      } else {
        return 'منذ قليل';
      }
    } catch (error) {
      return 'غير محدد';
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const headers = [
      'الاسم الكامل',
      'تاريخ الميلاد',
      'العمر',
      'الجنسية',
      'المدينة',
      'الدولة',
      'الهاتف',
      'البريد الإلكتروني',
      'المركز الأساسي',
      'المركز الثانوي',
      'القدم المفضلة',
      'الطول',
      'الوزن',
      'سنوات الخبرة',
      'النادي الحالي',
      'حالة الاشتراك',
      'نوع الاشتراك',
      'تاريخ انتهاء الاشتراك',
      'عدد الفيديوهات',
      'عدد الصور',
      'تاريخ الإنشاء',
      'آخر تحديث'
    ];

    const data = sortedPlayers.map(player => [
      player.full_name || player.name || '',
      formatDate(player.birth_date),
      calculateAge(player.birth_date) || 'غير محدد',
      player.nationality || '',
      player.city || '',
      player.country || '',
      player.phone || '',
      player.email || '',
      player.primary_position || player.position || '',
      player.secondary_position || '',
      player.preferred_foot || '',
      player.height || '',
      player.weight || '',
      player.experience_years || '',
      player.current_club || '',
      player.subscription_status || '',
      player.subscription_type || '',
      formatDate(player.subscription_end),
      player.videos?.length || 0,
      player.additional_images?.length || 0,
      formatDate(player.createdAt || player.created_at),
      formatDate(player.updated_at)
    ]);

    // Create CSV content
    const csvContent = [headers, ...data]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    // Download CSV file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agent_players_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Delete player
  const handleDeletePlayer = async (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!playerToDelete) return;

    try {
      await deleteDoc(doc(db, 'players', playerToDelete.id));
      setPlayers(prev => prev.filter(p => p.id !== playerToDelete.id));
      setIsDeleteModalOpen(false);
      setPlayerToDelete(null);
      alert('تم حذف اللاعب بنجاح!');
    } catch (error) {
      console.error('خطأ في حذف اللاعب:', error);
      alert('حدث خطأ أثناء حذف اللاعب');
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-6 mx-4 my-6 bg-gray-50 rounded-lg shadow-inner md:p-10" dir="rtl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-600 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">جاري تحميل اللاعبين...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-6 mx-4 my-6 bg-gray-50 rounded-lg shadow-inner md:p-10" dir="rtl">
      <div className="space-y-6">
        {/* Referrals summary card */}
        <OrgReferralSummaryCard accountType="agent" />
        
        {joinRequests.length > 0 && (
          <Card className="p-4 mb-2 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">لديك {joinRequests.length} طلب انضمام جديد</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowJoinRequests(!showJoinRequests)}>
                {showJoinRequests ? 'إخفاء' : 'عرض'} الطلبات
              </Button>
            </div>
            {showJoinRequests && (
              <div className="mt-4 space-y-3">
                {joinRequests.map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-4 border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{request.playerName}</h4>
                      <Badge variant="outline">طلب جديد</Badge>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>📧 {request.playerEmail}</p>
                      {request.playerData?.position && (<p>⚽ المركز: {request.playerData.position}</p>)}
                      <p>📅 {new Date(request.requestedAt as any).toLocaleDateString('ar')}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={async () => {
                        try {
                          await organizationReferralService.approveJoinRequest(request.id, user!.uid, 'الوكيل');
                          toast.success('تم قبول اللاعب بنجاح');
                          loadJoinRequests();
                          loadPlayers();
                        } catch (error) {
                          toast.error('فشل في قبول اللاعب');
                        }
                      }}>✅ قبول</Button>
                      <Button size="sm" variant="outline" onClick={async () => {
                        try {
                          await organizationReferralService.rejectJoinRequest(request.id, user!.uid, 'الوكيل', 'تم الرفض');
                          toast.success('تم رفض الطلب');
                          loadJoinRequests();
                        } catch (error) {
                          toast.error('فشل في رفض الطلب');
                        }
                      }}>❌ رفض</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
        
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-600 mb-2">إدارة اللاعبين</h1>
            <p className="text-gray-600">إدارة قائمة اللاعبين المتعاقدين مع الوكيل ({players.length} لاعب)</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={players.length === 0}
            >
              <Download className="mr-2 w-4 h-4" />
              تصدير Excel
            </Button>
            
            <Link href="/dashboard/agent/players/add">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                <Plus className="mr-2 w-4 h-4" />
                إضافة لاعب جديد
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="البحث في الاسم، الإيميل، أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <Filter className="mr-2 w-4 h-4" />
                <SelectValue placeholder="حالة الاشتراك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="الترتيب حسب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">تاريخ الإضافة</SelectItem>
                <SelectItem value="updated_at">آخر تحديث</SelectItem>
                <SelectItem value="name">الاسم</SelectItem>
                <SelectItem value="subscription_status">حالة الاشتراك</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="ترتيب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">تنازلي</SelectItem>
                <SelectItem value="asc">تصاعدي</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results Summary */}
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            عرض {startIndex + 1}-{Math.min(endIndex, totalPlayers)} من {totalPlayers} نتيجة
            {players.some(p => (p as any)._debug_note) && (
              <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                🔍 وضع التشخيص - اللاعبين غير مربوطين بالوكيل
              </span>
            )}
          </span>
          <Select value={playersPerPage.toString()} onValueChange={(value) => setPlayersPerPage(parseInt(value))}>
            <SelectTrigger className="w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 لكل صفحة</SelectItem>
              <SelectItem value="10">10 لكل صفحة</SelectItem>
              <SelectItem value="25">25 لكل صفحة</SelectItem>
              <SelectItem value="50">50 لكل صفحة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Players Table - Joined via referral */}
        {currentPlayers.filter(p => (p as any).joinedViaReferral).length === 0 && currentPlayers.filter(p => !(p as any).joinedViaReferral).length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'لم يتم العثور على لاعبين يطابقون معايير البحث' 
                : 'لم يتم إضافة أي لاعبين للوكيل بعد'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <Link href="/dashboard/agent/players/add">
                <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Plus className="mr-2 w-4 h-4" />
                  إضافة لاعب جديد
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <>
          <Card className="overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-800">اللاعبون المنضمون عبر كود الإحالة ({currentPlayers.filter(p => (p as any).joinedViaReferral).length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">اللاعب</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">معلومات الاتصال</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">المركز والمقاسات</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الموقع</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الاشتراك</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الوسائط</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">التواريخ</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الانضمام عبر كود</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">العمليات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPlayers.filter(p => (p as any).joinedViaReferral).map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                      {/* Player Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12">
                            {player.profile_image_url || player.profile_image ? (
                              <img
                                src={player.profile_image_url || player.profile_image}
                                alt={`صورة اللاعب ${player.full_name || player.name || 'غير محدد'}`}
                                className="object-cover w-12 h-12 rounded-full border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/default-avatar.png";
                                }}
                              />
                            ) : (
                              <div className="flex justify-center items-center w-12 h-12 bg-gray-200 rounded-full border border-gray-300">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {player.full_name || player.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(() => {
                                const age = calculateAge(player.birth_date);
                                return age ? `${age} سنة` : 'العمر غير محدد';
                              })()}
                            </div>
                            <div className="text-xs text-gray-400">
                              #{player.id?.slice(0, 8)}
                            </div>
                            {player.joinedViaReferral && (
                              <div className="mt-1 space-y-1">
                                <div className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                  انضم عبر كود
                                  {player.referralCodeUsed && <span className="font-mono">({player.referralCodeUsed})</span>}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                  تاريخ الانضمام: {formatDate((player as any).organizationJoinedAt)}
                                  {(player as any).organizationApprovedBy?.userName && (
                                    <span className="ml-2">— بواسطة: {(player as any).organizationApprovedBy.userName}</span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex gap-1 items-center mb-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {player.phone || 'غير محدد'}
                          </div>
                          <div className="flex gap-1 items-center">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-xs">{player.email || 'غير محدد'}</span>
                          </div>
                          <div className="mt-2">{(() => { const pct = getProfileCompletion(player); return (
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-gray-500"><span>اكتمال الملف</span><span>{pct}%</span></div>
                              <div className="w-32 h-1.5 bg-gray-200 rounded">
                                <div className={`h-1.5 rounded ${pct>=80?'bg-emerald-500':pct>=50?'bg-amber-500':'bg-red-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ); })()}</div>
                        </div>
                      </td>

                      {/* Position & Measurements */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {player.primary_position || player.position || 'غير محدد'}
                          </div>
                          {player.secondary_position && (
                            <div className="text-xs text-gray-500">
                              ثانوي: {player.secondary_position}
                            </div>
                          )}
                          <div className="mt-1 text-xs text-gray-500">
                            {player.height && `${player.height} سم`}
                            {player.height && player.weight && ' • '}
                            {player.weight && `${player.weight} كج`}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex gap-1 items-center mb-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            {player.city || 'غير محدد'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.nationality || player.country || 'غير محدد'}
                          </div>
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {getSubscriptionBadge(player.subscription_status, player.subscription_end)}
                          <div className="mt-1 text-xs text-gray-500">
                            {player.subscription_type && (
                              <div>نوع: {player.subscription_type}</div>
                            )}
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(player.subscription_end)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Media */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Video className="mr-1 w-3 h-3" />
                            {player.videos?.length || 0}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <ImageIcon className="mr-1 w-3 h-3" />
                            {player.additional_images?.length || 0}
                          </Badge>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600">
                          <div className="flex gap-1 items-center mb-1">
                            <Plus className="w-3 h-3 text-green-600" />
                            <span className="font-medium">إضافة:</span>
                          </div>
                          <div className="mb-2">
                            {formatDate(player.createdAt || player.created_at)}
                            <div className="text-gray-400">{getTimeAgo(player.createdAt || player.created_at)}</div>
                          </div>
                          
                          <div className="flex gap-1 items-center mb-1">
                            <Edit className="w-3 h-3 text-blue-600" />
                            <span className="font-medium">تحديث:</span>
                          </div>
                          <div>
                            {formatDate(player.updated_at)}
                            <div className="text-gray-400">{getTimeAgo(player.updated_at)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Referral Info */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                        <div>الكود: {player.referralCodeUsed || '-'}</div>
                        <div>التاريخ: {formatDate((player as any).organizationJoinedAt)}</div>
                        {(player as any).organizationApprovedBy?.userName && (
                          <div>الموافق: {(player as any).organizationApprovedBy.userName}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/agent/players/add?edit=${player.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              title="تعديل البيانات"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          
                          <CreateLoginAccountButton
                            playerId={player.id}
                            playerData={{
                              full_name: player.full_name || player.name,
                              name: player.name || player.full_name,
                              email: player.email,
                              phone: player.phone,
                              agent_id: player.agent_id || user?.uid,
                              ...player
                            }}
                            source="players"
                            onSuccess={(password) => {
                              console.log(`تم إنشاء حساب للاعب ${player.full_name || player.name} بكلمة المرور: ${password}`);
                            }}
                          />
                          
                          <IndependentAccountCreator
                            playerId={player.id}
                            playerData={{
                              full_name: player.full_name || player.name,
                              name: player.name || player.full_name,
                              email: player.email,
                              phone: player.phone,
                              whatsapp: player.whatsapp,
                              agent_id: player.agent_id || user?.uid,
                              ...player
                            }}
                            source="players"
                            variant="outline"
                            size="sm"
                            className="text-purple-600 hover:bg-purple-50"
                          />
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlayer(player)}
                            className="text-red-600 hover:bg-red-50"
                            title="حذف اللاعب"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {/* Players added manually by organization */}
          <Card className="overflow-hidden mt-6">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-800">اللاعبون المضافون بواسطة المنظمة ({currentPlayers.filter(p => !(p as any).joinedViaReferral).length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">اللاعب</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">معلومات الاتصال</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">المركز والمقاسات</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الموقع</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الاشتراك</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">الوسائط</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">التواريخ</th>
                    <th className="px-6 py-4 text-xs font-medium tracking-wider text-right uppercase">العمليات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentPlayers.filter(p => !(p as any).joinedViaReferral).map((player) => (
                    <tr key={player.id} className="hover:bg-gray-50 transition-colors">
                      {/* Player Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-12 h-12">
                            {player.profile_image_url || player.profile_image ? (
                              <img
                                src={player.profile_image_url || player.profile_image}
                                alt={`صورة اللاعب ${player.full_name || player.name || 'غير محدد'}`}
                                className="object-cover w-12 h-12 rounded-full border border-gray-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/default-avatar.png";
                                }}
                              />
                            ) : (
                              <div className="flex justify-center items-center w-12 h-12 bg-gray-200 rounded-full border border-gray-300">
                                <User className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="mr-4">
                            <div className="text-sm font-medium text-gray-900">
                              {player.full_name || player.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {(() => {
                                const age = calculateAge(player.birth_date);
                                return age ? `${age} سنة` : 'العمر غير محدد';
                              })()}
                            </div>
                            <div className="text-xs text-gray-400">#{player.id?.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex gap-1 items-center mb-1"><Phone className="w-3 h-3 text-gray-400" />{player.phone || 'غير محدد'}</div>
                          <div className="flex gap-1 items-center"><Mail className="w-3 h-3 text-gray-400" /><span className="text-xs">{player.email || 'غير محدد'}</span></div>
                          <div className="mt-2">{(() => { const pct = getProfileCompletion(player); return (
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-gray-500"><span>اكتمال الملف</span><span>{pct}%</span></div>
                              <div className="w-32 h-1.5 bg-gray-200 rounded">
                                <div className={`h-1.5 rounded ${pct>=80?'bg-emerald-500':pct>=50?'bg-amber-500':'bg-red-500'}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ); })()}</div>
                        </div>
                      </td>

                      {/* Position & Measurements */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{player.primary_position || player.position || 'غير محدد'}</div>
                          {player.secondary_position && (<div className="text-xs text-gray-500">ثانوي: {player.secondary_position}</div>)}
                          <div className="mt-1 text-xs text-gray-500">{player.height && `${player.height} سم`}{player.height && player.weight && ' • '}{player.weight && `${player.weight} كج`}</div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex gap-1 items-center mb-1"><MapPin className="w-3 ه-3 text-gray-400" />{player.city || 'غير محدد'}</div>
                          <div className="text-xs text-gray-500">{player.nationality || player.country || 'غير محدد'}</div>
                        </div>
                      </td>

                      {/* Subscription */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{getSubscriptionBadge(player.subscription_status, player.subscription_end)}<div className="mt-1 text-xs text-gray-500">{player.subscription_type && (<div>نوع: {player.subscription_type}</div>)}<div className="flex items-center gap-1"><Calendar className="w-3 ه-3" />{formatDate(player.subscription_end)}</div></div></div>
                      </td>

                      {/* Media */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2"><Badge variant="outline" className="text-xs"><Video className="mr-1 w-3 h-3" />{player.videos?.length || 0}</Badge><Badge variant="outline" className="text-xs"><ImageIcon className="mr-1 w-3 h-3" />{player.additional_images?.length || 0}</Badge></div>
                      </td>

                      {/* Dates */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-gray-600"><div className="flex gap-1 items-center mb-1"><Plus className="w-3 h-3 text-green-600" /><span className="font-medium">إضافة:</span></div><div className="mb-2">{formatDate(player.createdAt || player.created_at)}<div className="text-gray-400">{getTimeAgo(player.createdAt || player.created_at)}</div></div><div className="flex gap-1 items-center mb-1"><Edit className="w-3 h-3 text-blue-600" /><span className="font-medium">تحديث:</span></div><div>{formatDate(player.updated_at)}<div className="text-gray-400">{getTimeAgo(player.updated_at)}</div></div></div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link href={`/dashboard/agent/players/add?edit=${player.id}`}><Button variant="outline" size="sm" className="text-green-600 hover:bg-green-50" title="تعديل البيانات"><Edit className="w-4 h-4" /></Button></Link>
                          <CreateLoginAccountButton playerId={player.id} playerData={{ full_name: player.full_name || player.name, name: player.name || player.full_name, email: player.email, phone: player.phone, agent_id: (player as any).agent_id || user?.uid, ...player }} source="players" onSuccess={(password) => { console.log(`تم إنشاء حساب للاعب ${player.full_name || player.name} بكلمة المرور: ${password}`); }} />
                          <IndependentAccountCreator playerId={player.id} playerData={{ full_name: player.full_name || player.name, name: player.name || player.full_name, email: player.email, phone: player.phone, whatsapp: (player as any).whatsapp, agent_id: (player as any).agent_id || user?.uid, ...player }} source="players" variant="outline" size="sm" className="text-purple-600 hover:bg-purple-50" />
                          <Button variant="outline" size="sm" onClick={() => handleDeletePlayer(player)} className="text-red-600 hover:bg-red-50" title="حذف اللاعب"><Trash2 className="w-4 ه-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
              <div className="text-sm text-gray-600">
                عرض {startIndex + 1}-{Math.min(endIndex, totalPlayers)} من {totalPlayers} نتيجة
              </div>
              
              <div className="flex gap-2 items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  الأولى
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber: number;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="p-0 w-8 h-8"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  الأخيرة
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">تأكيد الحذف</h3>
              <p className="text-gray-600 mb-6">
                هل أنت متأكد من حذف اللاعب "{playerToDelete?.full_name || playerToDelete?.name}"؟
                هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDeleteModalOpen(false);
                    setPlayerToDelete(null);
                  }}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  حذف
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 

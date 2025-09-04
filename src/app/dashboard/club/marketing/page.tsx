'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  BarChart3,
  Share2,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Linkedin
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Toaster, toast } from 'sonner';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import PlayerProfileForm from '@/components/club/PlayerProfileForm';

interface MarketingCampaign {
  id: string;
  playerId: string;
  playerName: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'scheduled';
  platforms: string[];
  metrics: {
    reach: number;
    engagement: number;
    conversions: number;
  };
  budget: string;
  type: 'social' | 'traditional' | 'digital';
  clubId: string;
}

export default function MarketingPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    status: '',
    type: '',
    platform: ''
  });
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [clubPlayers, setClubPlayers] = useState<any[]>([]);
  const clubId: string = (userData?.clubId as string) || (user?.uid as string) || "";

  useEffect(() => {
    const checkAuth = async () => {
      console.log('user:', user);
      console.log('userData:', userData);
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!userData) {
        // إذا لم تتوفر بيانات المستخدم خلال 2 ثانية، أخرج من التحميل
        setTimeout(() => {
          if (!userData) {
            setLoading(false);
          }
        }, 2000);
        return;
      }

      if (userData.accountType !== 'club') {
        router.push('/dashboard');
        return;
      }

      if (userData.clubId) {
        await fetchCampaigns();
      } else {
        // إذا لم تتوفر clubId خلال 2 ثانية، أخرج من التحميل
        setTimeout(() => {
          if (!userData.clubId) {
            setLoading(false);
          }
        }, 2000);
      }
    };

    checkAuth();
  }, [user, userData]);

  const fetchCampaigns = async () => {
    if (!userData?.clubId) {
      console.log('No clubId available');
      setCampaigns([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const campaignsRef = collection(db, 'marketing_campaigns');
      
      // إنشاء استعلام أساسي للحملات الخاصة بالنادي
      const baseQuery = query(campaignsRef, where('clubId', '==', userData.clubId));
      let finalQuery = baseQuery;

      // إضافة فلتر الحالة إذا تم تحديده
      if (selectedFilters.status) {
        finalQuery = query(finalQuery, where('status', '==', selectedFilters.status));
      }

      // إضافة فلتر النوع إذا تم تحديده
      if (selectedFilters.type) {
        finalQuery = query(finalQuery, where('type', '==', selectedFilters.type));
      }

      const querySnapshot = await getDocs(finalQuery);
      
      if (querySnapshot.size > 0) {
        const campaignsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MarketingCampaign[];
        setCampaigns(campaignsData);
      } else {
        // عرض بيانات تجريبية إذا لم يتم العثور على حملات
        setCampaigns([
          {
            id: '1',
            playerId: 'player1',
            playerName: 'أحمد محمد',
            title: 'حملة تسويقية للاعب أحمد محمد',
            startDate: '2024-03-01',
            endDate: '2024-04-01',
            status: 'active',
            platforms: ['Facebook', 'Instagram', 'Twitter'],
            metrics: {
              reach: 50000,
              engagement: 15,
              conversions: 1200
            },
            budget: '50,000 ريال',
            type: 'social',
            clubId: userData.clubId
          },
          {
            id: '2',
            playerId: 'player2',
            playerName: 'محمد علي',
            title: 'حملة تسويقية للاعب محمد علي',
            startDate: '2024-03-15',
            endDate: '2024-04-15',
            status: 'scheduled',
            platforms: ['Youtube', 'Linkedin'],
            metrics: {
              reach: 30000,
              engagement: 12,
              conversions: 800
            },
            budget: '30,000 ريال',
            type: 'digital',
            clubId: userData.clubId
          }
        ]);
        toast.info('تم عرض بيانات تجريبية');
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('حدث خطأ أثناء جلب الحملات التسويقية');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (filterType: 'status' | 'type', value: string) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
    if (userData?.clubId) {
      await fetchCampaigns();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'completed': return 'text-blue-600 bg-blue-50';
      case 'scheduled': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'scheduled': return 'مجدول';
      default: return status;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      default: return <Share2 className="w-4 h-4" />;
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Fetch club players
  useEffect(() => {
    if (!clubId) return;
    const fetchPlayers = async () => {
      const playersRef = collection(db, 'clubs', clubId, 'players');
      const snapshot = await getDocs(playersRef);
      setClubPlayers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPlayers();
  }, [clubId, showAddPlayer]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل الحملات التسويقية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50" dir="rtl">
      {/* Debug: Show userData */}
      <pre className="p-2 mb-4 text-xs bg-yellow-100 rounded">{JSON.stringify(userData, null, 2)}</pre>
      <Toaster position="top-center" richColors />
      
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للوحة التحكم
        </button>
        <h1 className="mb-2 text-3xl font-bold text-gray-900">تسويق اللاعبين</h1>
        <p className="text-gray-600">إدارة حملات تسويق اللاعبين</p>
        {(userData?.accountType === 'club') && (
          <Dialog open={showAddPlayer} onOpenChange={setShowAddPlayer}>
            <DialogTrigger asChild>
              <Button className="mt-4 text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="ml-2" /> إضافة لاعب
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-2xl">
              <PlayerProfileForm clubId={userData?.clubId || user?.uid || ''} onSuccess={() => setShowAddPlayer(false)} />
              <Button variant="outline" className="w-full mt-4" onClick={() => setShowAddPlayer(false)}>
                إغلاق
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 right-3 top-1/2" />
          <Input
            type="text"
            placeholder="ابحث عن حملة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10"
          />
        </div>
        <select
          value={selectedFilters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="completed">مكتمل</option>
          <option value="scheduled">مجدول</option>
        </select>
        <select
          value={selectedFilters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">جميع الأنواع</option>
          <option value="social">تواصل اجتماعي</option>
          <option value="traditional">تقليدي</option>
          <option value="digital">رقمي</option>
        </select>
        <Button onClick={() => router.push('/dashboard/club/marketing/new')}>
          <Plus className="w-5 h-5 ml-2" />
          حملة جديدة
        </Button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign) => (
          <Card key={campaign.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.title}</CardTitle>
                <Badge className={getStatusColor(campaign.status)}>
                  {getStatusText(campaign.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{campaign.playerName}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{campaign.startDate} - {campaign.endDate}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {campaign.platforms.map((platform) => (
                    <span
                      key={platform}
                      className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-full"
                    >
                      {getPlatformIcon(platform)}
                      {platform}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{campaign.metrics.reach}</p>
                    <p className="text-sm text-gray-600">الوصول</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{campaign.metrics.engagement}%</p>
                    <p className="text-sm text-gray-600">التفاعل</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{campaign.metrics.conversions}</p>
                    <p className="text-sm text-gray-600">التحويلات</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm font-medium text-gray-900">{campaign.budget}</span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Players Table */}
      {clubPlayers.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead>
              <tr>
                <th className="p-2 border-b">الصورة</th>
                <th className="p-2 border-b">الاسم</th>
                <th className="p-2 border-b">المركز</th>
                <th className="p-2 border-b">الهاتف</th>
                <th className="p-2 border-b">البريد</th>
                <th className="p-2 border-b">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {clubPlayers.map(player => (
                <tr key={player.id}>
                  <td className="p-2 border-b"><img src={player.profile_image?.url || '/default-avatar.png'} alt={player.full_name} className="object-cover w-10 h-10 rounded-full" /></td>
                  <td className="p-2 font-bold border-b">{player.full_name}</td>
                  <td className="p-2 border-b">{player.primary_position || player.position || player.center || player.secondary_position || '—'}</td>
                  <td className="p-2 border-b">{player.phone}</td>
                  <td className="p-2 border-b">{player.email}</td>
                  <td className="p-2 border-b">
                    {/* Edit/Delete actions can be added here */}
                    <Button size="sm" variant="outline">تعديل</Button>
                    <Button size="sm" variant="destructive" className="ml-2">حذف</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 

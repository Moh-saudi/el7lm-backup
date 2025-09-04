'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  MessageSquare,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Phone,
  Mail,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Negotiation {
  id: string;
  playerId: string;
  playerName: string;
  type: 'transfer' | 'contract' | 'sponsorship' | 'loan';
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  startDate: string;
  lastUpdate: string;
  parties: {
    name: string;
    type: 'club' | 'agent' | 'player' | 'sponsor';
    contact: {
      phone: string;
      email: string;
      address: string;
    };
  }[];
  details: {
    initialOffer: number;
    currentOffer: number;
    demands: string[];
    notes: string[];
  };
  timeline: {
    date: string;
    action: string;
    party: string;
    notes: string;
  }[];
  documents: {
    name: string;
    type: string;
    url: string;
    date: string;
  }[];
}

export default function NegotiationsPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  if (userData && userData.accountType === 'club' && !userData.clubId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-bold text-lg mb-2">لا يمكن تحميل المفاوضات: لم يتم العثور على معرف النادي.</p>
          <p className="text-gray-500">يرجى التأكد من بيانات الحساب أو التواصل مع الدعم الفني.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!userData) {
      setLoading(true);
      return;
    }

    if (userData.accountType !== 'club') {
      router.push('/dashboard');
      return;
    }

    fetchNegotiations();
  }, [user, userData]);

  const fetchNegotiations = async () => {
    try {
      if (!userData?.clubId) {
        console.error('No club ID found in user data');
        setLoading(false);
        return;
      }

      setLoading(true);
      const negotiationsRef = collection(db, 'negotiations');
      const q = query(negotiationsRef, where('clubId', '==', userData.clubId));
      const querySnapshot = await getDocs(q);
      
      const negotiationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Negotiation[];
      
      setNegotiations(negotiationsData);
    } catch (error) {
      console.error('Error fetching negotiations:', error);
      toast.error('حدث خطأ أثناء جلب بيانات المفاوضات');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transfer':
        return 'انتقال';
      case 'contract':
        return 'عقد';
      case 'sponsorship':
        return 'رعاية';
      case 'loan':
        return 'إعارة';
      default:
        return type;
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل المفاوضات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للوحة التحكم
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">خدمات التفاوض</h1>
        <p className="text-gray-600">إدارة وتتبع عمليات التفاوض مع اللاعبين والأندية</p>
      </div>

      {/* Search and New Negotiation */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن مفاوضة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12"
          />
        </div>
        <Button
          onClick={() => router.push('/dashboard/club/negotiations/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          مفاوضة جديدة
        </Button>
      </div>

      {/* Negotiations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {negotiations.map((negotiation) => (
          <motion.div
            key={negotiation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{negotiation.playerName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{getTypeLabel(negotiation.type)}</p>
                  </div>
                  <Badge className={getStatusColor(negotiation.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(negotiation.status)}
                      {negotiation.status === 'active' ? 'نشط' :
                       negotiation.status === 'completed' ? 'مكتمل' :
                       negotiation.status === 'cancelled' ? 'ملغي' : 'قيد الانتظار'}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Timeline Preview */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">آخر التحديثات</h4>
                    <div className="space-y-2">
                      {negotiation.timeline.slice(-2).map((event, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                          <div>
                            <p className="font-medium">{event.action}</p>
                            <p className="text-gray-600 text-xs">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Parties */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">الأطراف المعنية</h4>
                    <div className="space-y-2">
                      {negotiation.parties.map((party, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{party.name}</p>
                            <p className="text-gray-600 text-xs">{party.type}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Phone className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Mail className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">التفاصيل المالية</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">العرض الأولي</p>
                        <p className="text-lg font-semibold">{formatValue(negotiation.details.initialOffer)}</p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">العرض الحالي</p>
                        <p className="text-lg font-semibold">{formatValue(negotiation.details.currentOffer)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/negotiations/${negotiation.id}`)}>
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/negotiations/${negotiation.id}/edit`)}>
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4 ml-1" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 

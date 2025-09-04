'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FileText,
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

interface Contract {
  id: string;
  playerId: string;
  playerName: string;
  startDate: string;
  endDate: string;
  salary: number;
  status: 'active' | 'expired' | 'pending' | 'terminated';
  type: 'full' | 'loan' | 'youth';
  documents: string[];
  clauses: {
    releaseClause: number;
    buyoutClause: number;
    performanceBonus: boolean;
  };
}

export default function ContractsPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !userData || !userData.clubId) {
      setLoading(false);
      return;
    }

    fetchContracts();
  }, [user, userData]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const contractsRef = collection(db, 'contracts');
      const q = query(contractsRef, where('clubId', '==', userData?.clubId));
      const querySnapshot = await getDocs(q);
      
      const contractsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contract[];
      
      setContracts(contractsData);
    } catch (error) {
      console.error('Error fetching contracts:', error);
      toast.error('حدث خطأ أثناء جلب بيانات العقود');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'terminated':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'expired':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'terminated':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.playerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes(contract.status);
    const matchesType = selectedType.length === 0 || selectedType.includes(contract.type);
    return matchesSearch && matchesStatus && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل العقود...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة العقود</h1>
        <p className="text-gray-600">إدارة عقود اللاعبين والموظفين</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="ابحث عن لاعب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12"
          />
        </div>
        <Button
          onClick={() => router.push('/dashboard/club/contracts/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          عقد جديد
        </Button>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{contract.playerName}</CardTitle>
                  <Badge className={getStatusColor(contract.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(contract.status)}
                      {contract.status === 'active' ? 'نشط' :
                       contract.status === 'expired' ? 'منتهي' :
                       contract.status === 'pending' ? 'قيد الانتظار' : 'ملغي'}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span>من {contract.startDate} إلى {contract.endDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-5 h-5" />
                    <span>{contract.salary.toLocaleString()} ريال/شهرياً</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-5 h-5" />
                    <span>{contract.type === 'full' ? 'عقد كامل' :
                           contract.type === 'loan' ? 'إعارة' : 'عقد شباب'}</span>
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/contracts/${contract.id}`)}>
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/contracts/${contract.id}/edit`)}>
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

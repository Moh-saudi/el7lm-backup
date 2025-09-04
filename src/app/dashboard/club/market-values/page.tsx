'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  LineChart,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  Minus,
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

interface MarketValue {
  id: string;
  playerId: string;
  playerName: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  lastUpdate: string;
  history: {
    date: string;
    value: number;
  }[];
  predictions: {
    nextMonth: number;
    nextSeason: number;
  };
  factors: {
    performance: number;
    age: number;
    contract: number;
    market: number;
  };
}

export default function MarketValuesPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [marketValues, setMarketValues] = useState<MarketValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !userData || !userData.clubId) {
      setLoading(false);
      return;
    }

    fetchMarketValues();
  }, [user, userData]);

  const fetchMarketValues = async () => {
    try {
      setLoading(true);
      const marketValuesRef = collection(db, 'market_values');
      const q = query(marketValuesRef, where('clubId', '==', userData?.clubId));
      const querySnapshot = await getDocs(q);
      
      const marketValuesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketValue[];
      
      setMarketValues(marketValuesData);
    } catch (error) {
      console.error('Error fetching market values:', error);
      toast.error('حدث خطأ أثناء جلب بيانات القيم السوقية');
    } finally {
      setLoading(false);
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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
          <p className="text-gray-600">جاري تحميل القيم السوقية...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">حركة أسعار اللاعبين</h1>
        <p className="text-gray-600">تتبع وتحليل قيم اللاعبين في السوق</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي القيمة السوقية</p>
                <h3 className="text-2xl font-bold mt-1">$45.2M</h3>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التغير</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">+12.5%</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أعلى قيمة</p>
                <h3 className="text-2xl font-bold mt-1">$8.5M</h3>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التحديثات اليومية</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
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
          onClick={() => router.push('/dashboard/club/market-values/analysis')}
          className="flex items-center gap-2"
        >
          تحليل السوق
        </Button>
      </div>

      {/* Market Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketValues.map((value) => (
          <motion.div
            key={value.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{value.playerName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">آخر تحديث: {value.lastUpdate}</p>
                  </div>
                  <Badge className={value.changePercentage > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    <span className="flex items-center gap-1">
                      {getChangeIcon(value.changePercentage)}
                      {value.changePercentage}%
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Value */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">القيمة الحالية</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatValue(value.currentValue)}
                    </div>
                  </div>

                  {/* Value Factors */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">عوامل القيمة</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">الأداء</span>
                        <span className="text-sm font-semibold">{value.factors.performance}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">العمر</span>
                        <span className="text-sm font-semibold">{value.factors.age}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">العقد</span>
                        <span className="text-sm font-semibold">{value.factors.contract}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">السوق</span>
                        <span className="text-sm font-semibold">{value.factors.market}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Predictions */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">التوقعات</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">الشهر القادم</p>
                        <p className={`text-lg font-semibold ${getChangeColor(value.predictions.nextMonth - value.currentValue)}`}>
                          {formatValue(value.predictions.nextMonth)}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">الموسم القادم</p>
                        <p className={`text-lg font-semibold ${getChangeColor(value.predictions.nextSeason - value.currentValue)}`}>
                          {formatValue(value.predictions.nextSeason)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/market-values/${value.id}`)}>
                      عرض التفاصيل
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 ml-1" />
                      تحميل التقرير
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

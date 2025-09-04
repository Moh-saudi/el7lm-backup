'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Brain,
  TrendingUp,
  Target,
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

interface PlayerAnalysis {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  performance: {
    overall: number;
    physical: number;
    technical: number;
    tactical: number;
    mental: number;
  };
  predictions: {
    nextMatch: number;
    seasonEnd: number;
    potential: number;
  };
  insights: string[];
  recommendations: string[];
  riskFactors: {
    injury: number;
    fatigue: number;
    form: number;
  };
}

export default function AIAnalysisPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [analyses, setAnalyses] = useState<PlayerAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (userData?.accountType !== 'club') {
      router.push('/dashboard');
      return;
    }

    fetchAnalyses();
  }, [user, userData]);

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const analysesRef = collection(db, 'player_analyses');
      const q = query(analysesRef, where('clubId', '==', userData?.clubId));
      const querySnapshot = await getDocs(q);
      
      const analysesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerAnalysis[];
      
      setAnalyses(analysesData);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('حدث خطأ أثناء جلب بيانات التحليلات');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskLevel = (risk: number) => {
    if (risk >= 70) return 'عالية';
    if (risk >= 40) return 'متوسطة';
    return 'منخفضة';
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return 'text-red-600';
    if (risk >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل التحليلات...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليل الأداء بالذكاء الاصطناعي</h1>
        <p className="text-gray-600">تحليل متقدم لأداء اللاعبين باستخدام الذكاء الاصطناعي</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الأداء</p>
                <h3 className="text-2xl font-bold mt-1">78%</h3>
              </div>
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">دقة التوقعات</p>
                <h3 className="text-2xl font-bold mt-1">92%</h3>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التحليلات اليومية</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
              </div>
              <LineChart className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التوصيات</p>
                <h3 className="text-2xl font-bold mt-1">156</h3>
              </div>
              <Brain className="w-8 h-8 text-yellow-600" />
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
          onClick={() => router.push('/dashboard/club/ai-analysis/new')}
          className="flex items-center gap-2"
        >
          تحليل جديد
        </Button>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map((analysis) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{analysis.playerName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{analysis.date}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    تحليل حديث
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">مؤشرات الأداء</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">الأداء العام</p>
                        <p className={`text-lg font-semibold ${getPerformanceColor(analysis.performance.overall)}`}>
                          {analysis.performance.overall}%
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">الإمكانات</p>
                        <p className={`text-lg font-semibold ${getPerformanceColor(analysis.predictions.potential)}`}>
                          {analysis.predictions.potential}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">عوامل المخاطرة</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">الإصابات</span>
                        <span className={`text-sm font-semibold ${getRiskColor(analysis.riskFactors.injury)}`}>
                          {getRiskLevel(analysis.riskFactors.injury)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">التعب</span>
                        <span className={`text-sm font-semibold ${getRiskColor(analysis.riskFactors.fatigue)}`}>
                          {getRiskLevel(analysis.riskFactors.fatigue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">المستوى</span>
                        <span className={`text-sm font-semibold ${getRiskColor(analysis.riskFactors.form)}`}>
                          {getRiskLevel(analysis.riskFactors.form)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/ai-analysis/${analysis.id}`)}>
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

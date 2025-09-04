'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Star,
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
  Plus,
  Eye,
  Edit,
  Trash2,
  Award,
  Trophy,
  Medal,
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

interface PlayerEvaluation {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  evaluator: string;
  overall: {
    score: number;
    level: 'excellent' | 'good' | 'average' | 'poor';
    comments: string;
  };
  technical: {
    passing: number;
    shooting: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  tactical: {
    positioning: number;
    decisionMaking: number;
    teamwork: number;
    leadership: number;
  };
  physical: {
    speed: number;
    strength: number;
    stamina: number;
    agility: number;
  };
  mental: {
    concentration: number;
    confidence: number;
    discipline: number;
    motivation: number;
  };
  recommendations: string[];
  nextEvaluation: string;
}

export default function PlayerEvaluationPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [evaluations, setEvaluations] = useState<PlayerEvaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);

  useEffect(() => {
    if (!user || !userData || !userData.clubId) {
      setLoading(false);
      return;
    }

    fetchEvaluations();
  }, [user, userData]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const evaluationsRef = collection(db, 'player_evaluations');
      const q = query(evaluationsRef, where('clubId', '==', userData?.clubId));
      const querySnapshot = await getDocs(q);
      
      const evaluationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PlayerEvaluation[];
      
      setEvaluations(evaluationsData);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      toast.error('حدث خطأ أثناء جلب بيانات التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'ممتاز';
      case 'good':
        return 'جيد';
      case 'average':
        return 'متوسط';
      case 'poor':
        return 'ضعيف';
      default:
        return level;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'excellent':
        return <Trophy className="w-4 h-4" />;
      case 'good':
        return <Award className="w-4 h-4" />;
      case 'average':
        return <Medal className="w-4 h-4" />;
      case 'poor':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل التقييمات...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تقييم اللاعبين</h1>
        <p className="text-gray-600">تقييم شامل لأداء اللاعبين</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط التقييم</p>
                <h3 className="text-2xl font-bold mt-1">85%</h3>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">التقييمات المكتملة</p>
                <h3 className="text-2xl font-bold mt-1">24</h3>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">قيد التقييم</p>
                <h3 className="text-2xl font-bold mt-1">8</h3>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
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
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and New Evaluation */}
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
          onClick={() => router.push('/dashboard/club/player-evaluation/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          تقييم جديد
        </Button>
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluations.map((evaluation) => (
          <motion.div
            key={evaluation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <Card>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{evaluation.playerName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">بواسطة {evaluation.evaluator}</p>
                  </div>
                  <Badge className={getLevelColor(evaluation.overall.level)}>
                    <span className="flex items-center gap-1">
                      {getLevelIcon(evaluation.overall.level)}
                      {getLevelLabel(evaluation.overall.level)}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Overall Score */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">التقييم العام</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {evaluation.overall.score}%
                    </div>
                  </div>

                  {/* Technical Skills */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">المهارات الفنية</h4>
                    <div className="space-y-2">
                      {Object.entries(evaluation.technical).map(([skill, score]) => (
                        <div key={skill} className="flex items-center gap-2">
                          <span className="w-24 text-sm text-gray-600">{skill}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="w-8 text-sm text-gray-600">{score}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2">التوصيات</h4>
                    <div className="space-y-1">
                      {evaluation.recommendations.slice(0, 2).map((rec, index) => (
                        <p key={index} className="text-sm text-gray-600">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/player-evaluation/${evaluation.id}`)}>
                      <Eye className="w-4 h-4 ml-1" />
                      عرض
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/club/player-evaluation/${evaluation.id}/edit`)}>
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

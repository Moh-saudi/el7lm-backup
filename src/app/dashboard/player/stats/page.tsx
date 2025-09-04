"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from 'recharts';

export default function StatsPage() {
  const { user } = useAuth();
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [playerData, setPlayerData] = useState<any>(null);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPlayerData() {
      if (!user?.uid) return;
      try {
        // جلب بيانات اللاعب
        const playerDoc = await getDoc(doc(db, 'players', user.uid));
        if (playerDoc.exists()) {
          setPlayerData(playerDoc.data());
        }

        // جلب إحصائيات اللاعب
        const statsQuery = query(
          collection(db, 'player_stats'),
          where('player_id', '==', user.uid),
          orderBy('date', 'desc')
        );
        const statsSnapshot = await getDocs(statsQuery);
        const statsData = statsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlayerStats(statsData);

      } catch (error) {
        console.error('Error fetching player data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlayerData();
  }, [user]);

  // تحويل بيانات الإحصائيات إلى تنسيق مناسب للرسوم البيانية
  const statsData = playerStats.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('ar-SA'),
    speed: stat.speed,
    stamina: stat.stamina,
    shooting: stat.shooting,
    passing: stat.passing,
    dribbling: stat.dribbling,
    defending: stat.defending
  }));

  // حساب متوسط الإحصائيات
  const averageStats = playerStats.length > 0 ? {
    speed: playerStats.reduce((sum, stat) => sum + (stat.speed || 0), 0) / playerStats.length,
    stamina: playerStats.reduce((sum, stat) => sum + (stat.stamina || 0), 0) / playerStats.length,
    shooting: playerStats.reduce((sum, stat) => sum + (stat.shooting || 0), 0) / playerStats.length,
    passing: playerStats.reduce((sum, stat) => sum + (stat.passing || 0), 0) / playerStats.length,
    dribbling: playerStats.reduce((sum, stat) => sum + (stat.dribbling || 0), 0) / playerStats.length,
    defending: playerStats.reduce((sum, stat) => sum + (stat.defending || 0), 0) / playerStats.length
  } : null;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">إحصائيات اللاعب</h1>

        {/* معلومات اللاعب الأساسية */}
        <Card>
          <CardHeader>
            <CardTitle>المعلومات الأساسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500">المركز</h3>
                <p className="mt-1 text-lg font-semibold">{playerData?.position || 'غير محدد'}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500">عدد التسجيلات</h3>
                <p className="mt-1 text-lg font-semibold">{playerStats.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-500">آخر تحديث</h3>
                <p className="mt-1 text-lg font-semibold">
                  {playerStats.length > 0
                    ? new Date(playerStats[0].date).toLocaleDateString('ar-SA')
                    : 'لا يوجد'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* متوسط الإحصائيات */}
        {averageStats && (
          <Card>
            <CardHeader>
              <CardTitle>متوسط الإحصائيات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'السرعة', value: averageStats.speed },
                        { name: 'التحمل', value: averageStats.stamina },
                        { name: 'التسديد', value: averageStats.shooting },
                        { name: 'التمرير', value: averageStats.passing },
                        { name: 'المراوغة', value: averageStats.dribbling },
                        { name: 'الدفاع', value: averageStats.defending }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* تطور الإحصائيات */}
        <Card>
          <CardHeader>
            <CardTitle>تطور الإحصائيات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="speed" stroke="#0088FE" name="السرعة" />
                  <Line type="monotone" dataKey="stamina" stroke="#00C49F" name="التحمل" />
                  <Line type="monotone" dataKey="shooting" stroke="#FFBB28" name="التسديد" />
                  <Line type="monotone" dataKey="passing" stroke="#FF8042" name="التمرير" />
                  <Line type="monotone" dataKey="dribbling" stroke="#8884D8" name="المراوغة" />
                  <Line type="monotone" dataKey="defending" stroke="#82ca9d" name="الدفاع" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* التسجيلات الأخيرة */}
        <Card>
          <CardHeader>
            <CardTitle>التسجيلات الأخيرة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-3">التاريخ</th>
                    <th className="pb-3">السرعة</th>
                    <th className="pb-3">التحمل</th>
                    <th className="pb-3">التسديد</th>
                    <th className="pb-3">التمرير</th>
                    <th className="pb-3">المراوغة</th>
                    <th className="pb-3">الدفاع</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.slice(0, 10).map((stat, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{new Date(stat.date).toLocaleDateString('ar-SA')}</td>
                      <td className="py-2">{stat.speed || 0}</td>
                      <td className="py-2">{stat.stamina || 0}</td>
                      <td className="py-2">{stat.shooting || 0}</td>
                      <td className="py-2">{stat.passing || 0}</td>
                      <td className="py-2">{stat.dribbling || 0}</td>
                      <td className="py-2">{stat.defending || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

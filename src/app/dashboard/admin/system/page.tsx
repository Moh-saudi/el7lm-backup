'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { supabase } from '@/lib/supabase/config';
import {
  Database,
  HardDrive,
  Wifi,
  Users,
  Building2,
  GraduationCap,
  UserPlus,
  Briefcase,
  FileText,
  Image,
  Video,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Monitor,
  Server,
  Cloud,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import SimpleLoader from '@/components/shared/SimpleLoader';

interface DatabaseStats {
  users: number;
  players: number;
  clubs: number;
  academies: number;
  trainers: number;
  agents: number;
  payments: number;
  subscriptions: number;
  lastUpdate: Date;
}

interface StorageStats {
  bucketName: string;
  fileCount: number;
  totalSize: number;
  lastModified?: Date;
  status: 'active' | 'error' | 'empty';
}

interface SystemHealth {
  firebase: 'connected' | 'disconnected' | 'error';
  supabase: 'connected' | 'disconnected' | 'error';
  storage: 'active' | 'limited' | 'error';
  lastCheck: Date;
}

export default function SystemMonitoring() {
  const t = (key: string) => key;
  const locale = 'ar';
  const isRTL = true;
  const [loading, setLoading] = useState(true);
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  const [storageStats, setStorageStats] = useState<StorageStats[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkSystemHealth();
    fetchDatabaseStats();
    fetchStorageStats();
  }, []);

  const checkSystemHealth = async () => {
    const health: SystemHealth = {
      firebase: 'disconnected',
      supabase: 'disconnected',
      storage: 'error',
      lastCheck: new Date()
    };

    try {
      // فحص Firebase
      const testQuery = await getDocs(query(collection(db, 'users'), limit(1)));
      health.firebase = 'connected';
    } catch (error) {
      console.error('فشل في الاتصال بـ Firebase:', error);
      health.firebase = 'error';
    }

    try {
      // فحص Supabase
      const { data, error } = await supabase.storage.listBuckets();
      if (error) throw error;
      health.supabase = 'connected';
      health.storage = data.length > 0 ? 'active' : 'limited';
    } catch (error) {
      console.error('فشل في الاتصال بـ Supabase:', error);
      health.supabase = 'error';
      health.storage = 'error';
    }

    setSystemHealth(health);
  };

  const fetchDatabaseStats = async () => {
    try {
      const stats: DatabaseStats = {
        users: 0,
        players: 0,
        clubs: 0,
        academies: 0,
        trainers: 0,
        agents: 0,
        payments: 0,
        subscriptions: 0,
        lastUpdate: new Date()
      };

      const collections = [
        'users', 'players', 'clubs', 'academies', 
        'trainers', 'agents', 'payments', 'subscriptions'
      ];

      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          stats[collectionName as keyof DatabaseStats] = snapshot.size;
        } catch (error) {
          console.warn(`فشل في جلب ${collectionName}:`, error);
          stats[collectionName as keyof DatabaseStats] = 0;
        }
      }

      setDatabaseStats(stats);
    } catch (error) {
      console.error('خطأ في جلب إحصائيات قاعدة البيانات:', error);
    }
  };

  const fetchStorageStats = async () => {
    const stats: StorageStats[] = [];

    // إنشاء قائمة فريدة من buckets الفعلية المستخدمة في النظام
    const allBuckets = Array.from(new Set([
      // buckets الأساسية
      'profile-images',
      'avatars',
      // buckets منفصلة لكل نوع حساب
      'playertrainer',
      'playerclub',
      'playeragent', 
      'playeracademy',
      // buckets الشخصية للمستخدمين
      'clubavatar',
      'academyavatar',
      'traineravatar',
      'agentavatar',
      'playeravatar',
      // المحتوى المشترك
      'videos',
      'documents'
    ]));

    for (const bucketName of allBuckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list();

        if (error) {
          stats.push({
            bucketName,
            fileCount: 0,
            totalSize: 0,
            status: 'error'
          });
          continue;
        }

        let totalSize = 0;
        let lastModified: Date | undefined;

        if (files && files.length > 0) {
          // حساب الحجم التقديري (بما أن Supabase لا يعطي الحجم مباشرة)
          totalSize = files.length * 150000; // متوسط 150KB لكل ملف
          
          // البحث عن آخر تاريخ تعديل
          const sortedFiles = files
            .filter(file => file.updated_at)
            .sort((a, b) => new Date(b.updated_at!).getTime() - new Date(a.updated_at!).getTime());
          
          if (sortedFiles.length > 0) {
            lastModified = new Date(sortedFiles[0].updated_at!);
          }
        }

        stats.push({
          bucketName,
          fileCount: files ? files.length : 0,
          totalSize,
          lastModified,
          status: files && files.length > 0 ? 'active' : 'empty'
        });

      } catch (error) {
        console.warn(`فشل في جلب إحصائيات التخزين لـ ${bucketName}:`, error);
        stats.push({
          bucketName,
          fileCount: 0,
          totalSize: 0,
          status: 'error'
        });
      }
    }

    setStorageStats(stats);
    setLoading(false);
  };

  const refreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([
      checkSystemHealth(),
      fetchDatabaseStats(),
      fetchStorageStats()
    ]);
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'limited':
      case 'empty':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'disconnected':
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'limited':
      case 'empty':
        return 'bg-yellow-100 text-yellow-800';
      case 'disconnected':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'متصل';
      case 'disconnected':
        return 'غير متصل';
      case 'error':
        return 'خطأ';
      case 'active':
        return 'نشط';
      case 'limited':
        return 'محدود';
      case 'empty':
        return 'فارغ';
      default:
        return 'غير معروف';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalStorageUsed = () => {
    return storageStats.reduce((total, stat) => total + stat.totalSize, 0);
  };

  const getBucketDescription = (bucketName: string) => {
    const descriptions: Record<string, string> = {
      'profile-images': 'صور الملفات الشخصية',
      'avatars': 'صور أفاتار المستخدمين',
      'playertrainer': 'ملفات اللاعبين - المدربين',
      'playerclub': 'ملفات اللاعبين - الأندية',
      'playeragent': 'ملفات اللاعبين - الوكلاء',
      'playeracademy': 'ملفات اللاعبين - الأكاديميات',
      'clubavatar': 'أفاتار الأندية',
      'academyavatar': 'أفاتار الأكاديميات',
      'traineravatar': 'أفاتار المدربين',
      'agentavatar': 'أفاتار الوكلاء',
      'playeravatar': 'أفاتار اللاعبين',
      'videos': 'الفيديوهات',
      'documents': 'المستندات'
    };
    return descriptions[bucketName] || bucketName;
  };

  const exportSystemReport = () => {
    const report = {
      systemHealth,
      databaseStats,
      storageStats,
      totalStorageUsed: getTotalStorageUsed(),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_النظام_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <SimpleLoader size="large" color="blue" />
          <p className="mt-4 text-gray-600">{'actions.loading'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{'system.title'}</h1>
          <p className="text-gray-500 mt-2">{'system.subtitle'}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={refreshAll} 
            disabled={isRefreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'actions.loading' : 'actions.refresh'}
          </Button>
          <Button onClick={exportSystemReport} variant="outline">
            <Download className="w-4 h-4 ml-2" />
            {'actions.export'} التقرير
          </Button>
        </div>
      </div>

      {/* حالة النظام */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قاعدة بيانات Firebase</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse">
              {getStatusIcon(systemHealth?.firebase || 'disconnected')}
              <Badge className={getStatusColor(systemHealth?.firebase || 'disconnected')}>
                {getStatusText(systemHealth?.firebase || 'disconnected')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              آخر فحص: {systemHealth?.lastCheck.toLocaleTimeString('ar-SA')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تخزين Supabase</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 space-x-reverse">
              {getStatusIcon(systemHealth?.supabase || 'disconnected')}
              <Badge className={getStatusColor(systemHealth?.supabase || 'disconnected')}>
                {getStatusText(systemHealth?.supabase || 'disconnected')}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              البوكتات النشطة: {storageStats.filter(s => s.status === 'active').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مساحة التخزين</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{formatBytes(getTotalStorageUsed())}</div>
              <Progress value={Math.min((getTotalStorageUsed() / (1024 * 1024 * 1024)) * 100, 100)} />
              <p className="text-xs text-muted-foreground">
                مجموع الملفات: {storageStats.reduce((total, stat) => total + stat.fileCount, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إحصائيات قاعدة البيانات */}
      {databaseStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              إحصائيات قاعدة البيانات
            </CardTitle>
            <CardDescription>
              آخر تحديث: {databaseStats.lastUpdate.toLocaleString('ar-SA')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-gray-600">المستخدمين</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.users.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-gray-600">اللاعبين</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.players.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-gray-600">الأندية</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.clubs.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-600">الأكاديميات</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.academies.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">المدربين</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.trainers.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">الوكلاء</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.agents.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm text-gray-600">المدفوعات</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.payments.toLocaleString()}</div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-teal-500" />
                  <span className="text-sm text-gray-600">الاشتراكات</span>
                </div>
                <div className="text-2xl font-bold">{databaseStats.subscriptions.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* إحصائيات التخزين */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            تفاصيل التخزين
          </CardTitle>
          <CardDescription>
            مراقبة استخدام التخزين لكل bucket في Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>البوكت</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>عدد الملفات</TableHead>
                  <TableHead>الحجم التقديري</TableHead>
                  <TableHead>آخر تحديث</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageStats.map((stat) => (
                  <TableRow key={stat.bucketName}>
                    <TableCell className="font-medium">{stat.bucketName}</TableCell>
                    <TableCell className="text-sm text-gray-600">{getBucketDescription(stat.bucketName)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(stat.status)}
                        <Badge className={getStatusColor(stat.status)}>
                          {getStatusText(stat.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{stat.fileCount.toLocaleString()}</TableCell>
                    <TableCell>{formatBytes(stat.totalSize)}</TableCell>
                    <TableCell>
                      {stat.lastModified 
                        ? stat.lastModified.toLocaleDateString('ar-SA')
                        : 'غير متوفر'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 

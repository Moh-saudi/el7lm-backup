'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, where, orderBy, deleteDoc, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Search,
  Filter,
  GraduationCap,
  Star,
  MapPin,
  Building2,
  Clock,
  Download,
  RefreshCcw,
  UserPlus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminFooter from '@/components/layout/AdminFooter';
import { useAuth } from '@/lib/firebase/auth-provider';
import { CITIES_BY_COUNTRY, SUPPORTED_COUNTRIES } from '@/lib/cities-data';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { REQUIRED_INDEXES, getIndexCreationUrls } from '@/lib/firebase/indexes';

interface Academy {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  location?: {
    countryId: string;
    countryName: string;
    cityId: string;
    cityName: string;
  };
  subscription?: {
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    plan: string;
    expiresAt: Date;
  };
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating?: number;
  playersCount?: number;
  license?: {
    number: string;
    expiryDate: Date;
    isVerified: boolean;
  };
  specialties?: string[];
  facilities?: string[];
  verifiedAt?: Date;
  verifiedBy?: {
    id: string;
    name: string;
  };
  verificationDocuments?: {
    type: string;
    url: string;
    uploadedAt: Date;
  }[];
}

export default function AcademiesManagement() {
  const { user, userData } = useAuth();
  
  // States
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<{
    countryId: string;
    cityId: string;
  }>({ countryId: '', cityId: '' });
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    verified: 0,
    pending: 0,
    totalPlayers: 0,
    averageRating: 0
  });

  // Load academies
  useEffect(() => {
    loadAcademies();
  }, []);

  const loadAcademies = async () => {
    try {
      setLoading(true);
      
      let academiesData: Academy[] = [];
      
      try {
        // Try using the compound query first
        const academiesQuery = query(
          collection(db, 'users'),
          where('accountType', '==', 'academy'),
          orderBy('createdAt', 'desc')
        );
        const academiesSnapshot = await getDocs(academiesQuery);
        academiesData = await processAcademiesData(academiesSnapshot.docs);
      } catch (error: any) {
        if (error.code === 'failed-precondition') {
          // Show index creation message
          const urls = getIndexCreationUrls();
          toast.error(
            <div className="flex flex-col gap-2">
              <p>يجب إنشاء فهرس في Firestore للوصول إلى البيانات بشكل أفضل</p>
              <a 
                href={urls.users}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                انقر هنا لإنشاء الفهرس المطلوب
              </a>
            </div>,
            {
              duration: 10000,
              position: 'top-center'
            }
          );
          
          // Fallback to simple query
          const simpleQuery = query(
            collection(db, 'users'),
            where('accountType', '==', 'academy')
          );
          const simpleSnapshot = await getDocs(simpleQuery);
          academiesData = await processAcademiesData(simpleSnapshot.docs);
          
          // Sort in memory
          academiesData.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(0);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });
        } else {
          throw error;
        }
      }

      setAcademies(academiesData);
      updateStats(academiesData);

    } catch (error) {
      console.error('Error loading academies:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات الأكاديميات');
    } finally {
      setLoading(false);
    }
  };

  // Update processAcademiesData function
  const processAcademiesData = async (docs: any[]) => {
    return Promise.all(
      docs.map(async (doc) => {
        const basicData = doc.data();
        
        // Get players count from both collections
        const [usersSnapshot1, usersSnapshot2, playersSnapshot1, playersSnapshot2] = await Promise.all([
          // Check users collection
          getDocs(query(
            collection(db, 'users'),
            where('accountType', '==', 'player'),
            where('academyId', '==', doc.id)
          )),
          getDocs(query(
            collection(db, 'users'),
            where('accountType', '==', 'player'),
            where('academy_id', '==', doc.id)
          )),
          // Check players collection
          getDocs(query(
            collection(db, 'players'),
            where('academyId', '==', doc.id)
          )),
          getDocs(query(
            collection(db, 'players'),
            where('academy_id', '==', doc.id)
          ))
        ]);

        // Get unique players count
        const allPlayerIds = new Set([
          ...usersSnapshot1.docs.map(doc => doc.id),
          ...usersSnapshot2.docs.map(doc => doc.id),
          ...playersSnapshot1.docs.map(doc => doc.id),
          ...playersSnapshot2.docs.map(doc => doc.id)
        ]);
        const playersCount = allPlayerIds.size;

        // Get average rating
        const ratingsQuery = query(
          collection(db, 'ratings'),
          where('targetId', '==', doc.id),
          where('targetType', '==', 'academy')
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const ratings = ratingsSnapshot.docs.map(doc => doc.data().rating);
        const averageRating = ratings.length 
          ? +(ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : 0;

        // Get verification documents with error handling
        let verificationDocuments = [];
        try {
          // Try using compound query first
          const docsQuery = query(
            collection(db, 'verificationDocuments'),
            where('userId', '==', doc.id),
            orderBy('uploadedAt', 'desc')
          );
          const docsSnapshot = await getDocs(docsQuery);
          verificationDocuments = docsSnapshot.docs.map(doc => ({
            ...doc.data(),
            uploadedAt: doc.data().uploadedAt?.toDate()
          }));
        } catch (error: any) {
          if (error.code === 'failed-precondition') {
            // Show index creation message
            toast.error(
              <div className="flex flex-col gap-2">
                <p>يجب إنشاء فهرس في Firestore للوصول إلى مستندات التحقق بشكل أفضل</p>
                <a 
                  href="https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=Cltwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy92ZXJpZmljYXRpb25Eb2N1bWVudHMvaW5kZXhlcy9fEAEaCgoGdXNlcklkEAEaDgoKdXBsb2FkZWRBdBACGgwKCF9fbmFtZV9fEAI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  انقر هنا لإنشاء الفهرس المطلوب
                </a>
              </div>,
              {
                duration: 10000,
                position: 'top-center'
              }
            );

            // Fallback to simple query
            const simpleQuery = query(
              collection(db, 'verificationDocuments'),
              where('userId', '==', doc.id)
            );
            const simpleSnapshot = await getDocs(simpleQuery);
            verificationDocuments = simpleSnapshot.docs
              .map(doc => ({
                ...doc.data(),
                uploadedAt: doc.data().uploadedAt?.toDate()
              }))
              .sort((a, b) => {
                if (!a.uploadedAt || !b.uploadedAt) return 0;
                return b.uploadedAt.getTime() - a.uploadedAt.getTime();
              });
          } else {
            console.error('Error fetching verification documents:', error);
            verificationDocuments = []; // Use empty array on error
          }
        }

        // Get subscription info
        const subscriptionQuery = query(
          collection(db, 'subscriptions'),
          where('userId', '==', doc.id)
        );
        const subscriptionSnapshot = await getDocs(subscriptionQuery);
        const subscriptions = subscriptionSnapshot.docs
          .map(doc => ({
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate()
          }))
          .filter(sub => ['active', 'trial'].includes(sub.status))
          .sort((a, b) => b.createdAt - a.createdAt);
        
        const subscription = subscriptions[0];

        // Format dates - handle both Timestamp and Date objects
        const createdAt = basicData.createdAt?.toDate ? basicData.createdAt.toDate() : basicData.createdAt;
        const lastLogin = basicData.lastLogin?.toDate ? basicData.lastLogin.toDate() : basicData.lastLogin;
        const verifiedAt = basicData.verifiedAt?.toDate ? basicData.verifiedAt.toDate() : basicData.verifiedAt;
        const subscriptionData = subscription ? {
          status: subscription.status,
          plan: subscription.plan,
          expiresAt: subscription.expiresAt
        } : undefined;

        return {
          id: doc.id,
          ...basicData,
          createdAt,
          lastLogin,
          verifiedAt,
          playersCount,
          rating: averageRating,
          verificationDocuments,
          subscription: subscriptionData
        } as Academy;
      })
    );
  };

  // Update stats
  const updateStats = (academiesData: Academy[]) => {
    const totalPlayers = academiesData.reduce((sum, academy) => sum + (academy.playersCount || 0), 0);
    const totalRating = academiesData.reduce((sum, academy) => sum + (academy.rating || 0), 0);
    
    setStats({
      total: academiesData.length,
      active: academiesData.filter(a => a.isActive).length,
      verified: academiesData.filter(a => a.verificationStatus === 'verified').length,
      pending: academiesData.filter(a => a.verificationStatus === 'pending').length,
      totalPlayers,
      averageRating: academiesData.length ? +(totalRating / academiesData.length).toFixed(1) : 0
    });
  };

  // Filter academies
  const filteredAcademies = academies.filter(academy => {
    const academyName = academy.name || '';
    const academyEmail = academy.email || '';
    const academyPhone = academy.phone || '';
    
    const matchesSearch = 
      academyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      academyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      academyPhone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerification = verificationFilter === 'all' || 
      academy.verificationStatus === verificationFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && academy.isActive) ||
      (statusFilter === 'inactive' && !academy.isActive);

    const matchesSubscription = subscriptionFilter === 'all' ||
      academy.subscription?.status === subscriptionFilter;

    const matchesRegion = 
      (!regionFilter.countryId || academy.location?.countryId === regionFilter.countryId) &&
      (!regionFilter.cityId || academy.location?.cityId === regionFilter.cityId);

    return matchesSearch && 
           matchesVerification && 
           matchesStatus && 
           matchesSubscription && 
           matchesRegion;
  });

  // Update toggleAcademyStatus function
  const toggleAcademyStatus = async (academyId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', academyId), {
        isActive: !currentStatus,
        updatedAt: new Date()
      });
      
      // Update local state immediately
      setAcademies(prevAcademies => 
        prevAcademies.map(academy => 
          academy.id === academyId 
            ? { ...academy, isActive: !currentStatus }
            : academy
        )
      );
      
      toast.success('تم تحديث حالة الأكاديمية بنجاح');
    } catch (error) {
      console.error('Error updating academy status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الأكاديمية');
    }
  };

  // Get verification badge
  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-50 text-green-600">تم التحقق</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-600">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-600">مرفوض</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  // Update RegionFilter component
  const RegionFilter = () => {
    const selectedCountry = regionFilter.countryId;
    const cities = selectedCountry ? CITIES_BY_COUNTRY[selectedCountry] : [];
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>الدولة</Label>
          <Select 
            value={regionFilter.countryId || "all"} 
            onValueChange={(value) => setRegionFilter(prev => ({ 
              ...prev, 
              countryId: value === "all" ? "" : value, 
              cityId: "" 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع الدول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الدول</SelectItem>
              {SUPPORTED_COUNTRIES.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>المدينة</Label>
          <Select 
            value={regionFilter.cityId || "all"}
            onValueChange={(value) => setRegionFilter(prev => ({ 
              ...prev, 
              cityId: value === "all" ? "" : value 
            }))}
            disabled={!selectedCountry}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع المدن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {cities?.map(city => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Add delete function
  const handleDeleteAcademy = async () => {
    if (!selectedAcademy) return;

    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'users', selectedAcademy.id));
      
      // Update local state
      setAcademies(prevAcademies => 
        prevAcademies.filter(academy => academy.id !== selectedAcademy.id)
      );
      
      toast.success('تم حذف الأكاديمية بنجاح');
      setShowDeleteDialog(false);
      setSelectedAcademy(null);
    } catch (error) {
      console.error('Error deleting academy:', error);
      toast.error('حدث خطأ أثناء حذف الأكاديمية');
    }
  };

  // Add suspend function
  const handleSuspendAcademy = async () => {
    if (!selectedAcademy) return;

    try {
      const suspensionEndDate = new Date();
      suspensionEndDate.setDate(suspensionEndDate.getDate() + 30); // 30 days suspension

      await updateDoc(doc(db, 'users', selectedAcademy.id), {
        isActive: false,
        suspendedAt: new Date(),
        suspensionEndDate,
        suspensionReason: 'تم إيقاف الحساب مؤقتاً من قبل الإدارة',
        updatedAt: new Date()
      });

      // Update local state
      setAcademies(prevAcademies =>
        prevAcademies.map(academy =>
          academy.id === selectedAcademy.id
            ? {
                ...academy,
                isActive: false,
                suspendedAt: new Date(),
                suspensionEndDate,
                suspensionReason: 'تم إيقاف الحساب مؤقتاً من قبل الإدارة'
              }
            : academy
        )
      );

      toast.success('تم إيقاف الأكاديمية مؤقتاً');
      setShowSuspendDialog(false);
      setSelectedAcademy(null);
    } catch (error) {
      console.error('Error suspending academy:', error);
      toast.error('حدث خطأ أثناء إيقاف الأكاديمية');
    }
  };

  // Add Profile Dialog Component
  const ProfileDialog = () => {
    if (!selectedAcademy) return null;

    return (
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              {selectedAcademy.name}
            </DialogTitle>
            <DialogDescription>
              معلومات الأكاديمية وإحصائياتها
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Basic Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">المعلومات الأساسية</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{selectedAcademy.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{selectedAcademy.phone || 'غير محدد'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>
                      {selectedAcademy.location ? 
                        `${selectedAcademy.location.cityName}، ${selectedAcademy.location.countryName}` 
                        : 'غير محدد'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">حالة الحساب</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedAcademy.isActive ? 'success' : 'destructive'}>
                      {selectedAcademy.isActive ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                  {selectedAcademy.suspendedAt && (
                    <div className="text-sm text-red-600">
                      تم الإيقاف في: {new Date(selectedAcademy.suspendedAt).toLocaleDateString('ar-SA')}
                      <br />
                      ينتهي في: {new Date(selectedAcademy.suspensionEndDate).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>تاريخ التسجيل: {new Date(selectedAcademy.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">الإحصائيات</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>عدد اللاعبين:</span>
                    <Badge variant="outline">{selectedAcademy.playersCount || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>التقييم:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{selectedAcademy.rating || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">معلومات الاشتراك</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      selectedAcademy.subscription?.status === 'active' ? 'success' :
                      selectedAcademy.subscription?.status === 'trial' ? 'warning' :
                      'destructive'
                    }>
                      {selectedAcademy.subscription?.status === 'active' ? 'نشط' :
                       selectedAcademy.subscription?.status === 'trial' ? 'تجريبي' :
                       'منتهي'}
                    </Badge>
                  </div>
                  {selectedAcademy.subscription?.expiresAt && (
                    <div className="text-sm">
                      ينتهي في: {new Date(selectedAcademy.subscription.expiresAt).toLocaleDateString('ar-SA')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Add Delete Dialog
  const DeleteDialog = () => (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>هل أنت متأكد من حذف الأكاديمية؟</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم حذف جميع بيانات الأكاديمية بشكل نهائي. هذا الإجراء لا يمكن التراجع عنه.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAcademy}
            className="bg-red-500 hover:bg-red-600"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  // Add Suspend Dialog
  const SuspendDialog = () => (
    <AlertDialog open={showSuspendDialog} onOpenChange={setShowSuspendDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد إيقاف الأكاديمية مؤقتاً</AlertDialogTitle>
          <AlertDialogDescription>
            سيتم إيقاف الأكاديمية مؤقتاً لمدة 30 يوم. خلال هذه الفترة لن تتمكن الأكاديمية من استخدام النظام.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSuspendAcademy}
            className="bg-yellow-500 hover:bg-yellow-600"
          >
            إيقاف مؤقت
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  if (loading) {
    return (
      <div className="bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الأكاديميات...</p>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأكاديميات</h1>
            <p className="text-gray-600">إدارة حسابات الأكاديميات في النظام</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadAcademies}>
              <RefreshCcw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير البيانات
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة أكاديمية
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الأكاديميات</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <GraduationCap className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  {stats.active} نشط
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-600">
                  {stats.total - stats.active} غير نشط
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">حالة التحقق</p>
                  <p className="text-2xl font-bold">{stats.verified}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  {stats.verified} تم التحقق
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-600">
                  {stats.pending} قيد المراجعة
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي اللاعبين</p>
                  <p className="text-2xl font-bold">{stats.totalPlayers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-amber-50 text-amber-600">
                  متوسط التقييم: {stats.averageRating}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث بالاسم، البريد، الهاتف..."
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label>حالة التحقق</Label>
              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="verified">تم التحقق</SelectItem>
                  <SelectItem value="pending">قيد المراجعة</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>حالة الاشتراك</Label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الاشتراكات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الاشتراكات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="trial">تجريبي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-2">
              <Label>المنطقة</Label>
              <RegionFilter />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-gray-600">
              {filteredAcademies.length} من {academies.length} أكاديمية
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSearchTerm('');
                setVerificationFilter('all');
                setStatusFilter('all');
                setSubscriptionFilter('all');
                setRegionFilter({ countryId: '', cityId: '' });
              }}>
                <Filter className="w-4 h-4 ml-2" />
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </div>
        </div>

        {/* Academies Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الأكاديمية</TableHead>
                <TableHead>حالة التحقق</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>اللاعبين</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAcademies.map((academy) => (
                <TableRow key={academy.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{academy.name}</div>
                        <div className="text-sm text-gray-500">{academy.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getVerificationBadge(academy.verificationStatus)}
                      {academy.verifiedAt && (
                        <span className="text-xs text-gray-500">
                          {new Date(academy.verifiedAt).toLocaleDateString('ar-SA')}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {academy.location ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{academy.location.cityName}، {academy.location.countryName}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{academy.playersCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>{academy.rating || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Switch
                        checked={academy.isActive}
                        onCheckedChange={() => toggleAcademyStatus(academy.id, academy.isActive)}
                        aria-label="تفعيل/تعطيل الأكاديمية"
                      />
                      {academy.subscription && (
                        <Badge 
                          variant={
                            academy.subscription.status === 'active' ? 'success' :
                            academy.subscription.status === 'trial' ? 'warning' :
                            'destructive'
                          }
                          className="text-xs"
                        >
                          {academy.subscription.status === 'active' ? 'مشترك' :
                           academy.subscription.status === 'trial' ? 'تجريبي' :
                           'منتهي'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                        onClick={() => {
                          setSelectedAcademy(academy);
                          setShowProfileDialog(true);
                        }}
                      >
                        عرض
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-yellow-600"
                        onClick={() => {
                          setSelectedAcademy(academy);
                          setShowSuspendDialog(true);
                        }}
                      >
                        إيقاف مؤقت
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          setSelectedAcademy(academy);
                          setShowDeleteDialog(true);
                        }}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>

      <AdminFooter />
      
      {/* Add Dialogs */}
      <ProfileDialog />
      <DeleteDialog />
      <SuspendDialog />
    </div>
  );
} 

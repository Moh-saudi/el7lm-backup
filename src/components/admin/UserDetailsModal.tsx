'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Building2,
  Edit,
  Save,
  X,
  KeyRound,
  CheckCircle,
  XCircle,
  ExternalLink,
  UserCheck,
  GraduationCap,
  Briefcase,
  Loader2,
  Eye,
  Settings,
  Activity,
  CreditCard,
  Globe,
  Star,
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/firebase/auth-provider';
import { sanitizeForFirestore as deepSanitize, isEmptyObject } from '@/lib/firebase/sanitize';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'player' | 'club' | 'agent' | 'academy' | 'trainer' | 'admin';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  location?: {
    countryId: string;
    countryName: string;
    cityId: string;
    cityName: string;
  };
  // Player specific
  position?: string;
  dateOfBirth?: Date;
  nationality?: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  marketValue?: number;
  // Entity specific
  clubName?: string;
  clubType?: string;
  license?: {
    number: string;
    expiryDate: Date;
    isVerified: boolean;
  };
  description?: string;
  website?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  subscription?: {
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    plan: string;
    expiresAt: Date;
  };
  parentAccountId?: string;
  parentAccountType?: string;
  rating?: number;
}

interface SubscriptionData {
  status?: 'active' | 'expired' | 'cancelled' | 'trial';
  plan?: string;
  planName?: string;
  expiresAt?: any;
  startedAt?: any;
}

interface LastPaymentData {
  id: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  createdAt?: any;
  source?: 'payments' | 'bulkPayments';
}

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export default function UserDetailsModal({ userId, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) {
  const { userData } = useAuth();
  
  // Add detailed logging
  console.log('👤 UserDetailsModal - Component loaded:', {
    userId: userId,
    isOpen: isOpen,
    hasUserData: !!userData,
    timestamp: new Date().toISOString()
  });
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionData | null>(null);
  const [lastPayment, setLastPayment] = useState<LastPaymentData | null>(null);

  // Helper: deep sanitize payloads before Firestore writes
  const sanitizeUpdate = (obj: Record<string, any>) => {
    const cleaned = deepSanitize(obj) as Record<string, any> | undefined;
    if (!cleaned) return {};
    return cleaned;
  };

  useEffect(() => {
    if (userId && isOpen) {
      loadUserData();
    }
  }, [userId, isOpen]);

  const loadUserData = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Try to get user from main users collection first
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: userDoc.id,
          name: userData.name || userData.full_name || 'غير محدد',
          email: userData.email || '',
          phone: userData.phone || userData.phoneNumber || '',
          accountType: userData.accountType || 'player',
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLogin: userData.lastLogin?.toDate() || undefined,
          location: userData.location || undefined,
          position: userData.position || undefined,
          dateOfBirth: userData.dateOfBirth?.toDate() || undefined,
          nationality: userData.nationality || undefined,
          height: userData.height || undefined,
          weight: userData.weight || undefined,
          preferredFoot: userData.preferredFoot || undefined,
          marketValue: userData.marketValue || undefined,
          clubName: userData.clubName || undefined,
          clubType: userData.clubType || undefined,
          license: userData.license || undefined,
          description: userData.description || undefined,
          website: userData.website || undefined,
          verificationStatus: userData.verificationStatus || undefined,
          subscription: userData.subscription || undefined,
          parentAccountId: userData.parentAccountId || undefined,
          parentAccountType: userData.parentAccountType || undefined,
          rating: userData.rating || undefined
        });
        
        // Load subscription info
        if (userData.subscription) {
          setSubscriptionInfo(userData.subscription);
        }
        
        // Load last payment info
        await loadLastPaymentInfo(userId);
        
      } else {
        setError('لم يتم العثور على المستخدم');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('حدث خطأ في تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const loadLastPaymentInfo = async (userId: string) => {
    try {
      // Try to get last payment from payments collection
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      if (!paymentsSnapshot.empty) {
        const paymentDoc = paymentsSnapshot.docs[0];
        const paymentData = paymentDoc.data();
        
        setLastPayment({
          id: paymentDoc.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          paymentMethod: paymentData.paymentMethod,
          createdAt: paymentData.createdAt,
          source: 'payments'
        });
      } else {
        // Try bulk payments collection
        const bulkPaymentsQuery = query(
          collection(db, 'bulkPayments'),
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const bulkPaymentsSnapshot = await getDocs(bulkPaymentsQuery);
        
        if (!bulkPaymentsSnapshot.empty) {
          const bulkPaymentDoc = bulkPaymentsSnapshot.docs[0];
          const bulkPaymentData = bulkPaymentDoc.data();
          
          setLastPayment({
            id: bulkPaymentDoc.id,
            amount: bulkPaymentData.amount,
            currency: bulkPaymentData.currency,
            paymentMethod: bulkPaymentData.paymentMethod,
            createdAt: bulkPaymentData.createdAt,
            source: 'bulkPayments'
          });
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-3 py-1">
        <CheckCircle className="w-3 h-3 mr-1" />
        نشط
      </Badge>;
    } else {
      return <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 px-3 py-1">
        <XCircle className="w-3 h-3 mr-1" />
        معطل
      </Badge>;
    }
  };

  const getAccountTypeBadge = (accountType: string) => {
    const typeConfig = {
      player: { label: 'لاعب', color: 'from-blue-500 to-indigo-600', icon: User },
      club: { label: 'نادي', color: 'from-purple-500 to-violet-600', icon: Building2 },
      agent: { label: 'وكيل', color: 'from-orange-500 to-red-600', icon: Briefcase },
      academy: { label: 'أكاديمية', color: 'from-green-500 to-emerald-600', icon: GraduationCap },
      trainer: { label: 'مدرب', color: 'from-cyan-500 to-blue-600', icon: UserCheck },
      admin: { label: 'مدير', color: 'from-gray-700 to-slate-800', icon: Shield }
    };
    
    const config = typeConfig[accountType as keyof typeof typeConfig] || typeConfig.player;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`bg-gradient-to-r ${config.color} text-white border-0 px-3 py-1`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-3 py-1">
          <CheckCircle className="w-3 h-3 mr-1" />
          موثق
        </Badge>;
      case 'pending':
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0 px-3 py-1">
          <Loader2 className="w-3 h-3 mr-1 animate-spin mr-1" />
          قيد المراجعة
        </Badge>;
      case 'rejected':
        return <Badge className="bg-gradient-to-r from-red-500 to-pink-600 text-white border-0 px-3 py-1">
          <XCircle className="w-3 h-3 mr-1" />
          مرفوض
        </Badge>;
      default:
        return <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0 px-3 py-1">
          <XCircle className="w-3 h-3 mr-1" />
          غير موثق
        </Badge>;
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'غير محدد';
    const dateObj = date?.toDate?.() || new Date(date);
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(dateObj);
  };

  const openUserProfile = () => {
    if (!user) return;
    const profileUrl = `/dashboard/${user.accountType}/profile`;
    if (typeof window !== 'undefined') {
      window.open(profileUrl, '_blank');
    }
  };

  const handleClose = () => {
    setEditing(false);
    setUser(null);
    setEditForm({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50 border-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-t-lg -m-6 mb-6 p-6">
          <DialogTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold">تفاصيل المستخدم</span>
                {user && <div className="text-sm text-indigo-100">({user.name})</div>}
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                {getStatusBadge(user.isActive)}
                {getAccountTypeBadge(user.accountType)}
                {user.verificationStatus && getVerificationBadge(user.verificationStatus)}
              </div>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">نافذة تفاصيل المستخدم وإدارة حسابه</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل بيانات المستخدم...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">خطأ في التحميل</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={loadUserData}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-0 px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              إعادة المحاولة
            </Button>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
                    <Button
                onClick={() => setEditing(!editing)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  editing 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white border-0' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white border-0'
                }`}
                    >
                      {editing ? (
                        <>
                    <X className="w-4 h-4 mr-2" />
                    إلغاء التعديل
                        </>
                      ) : (
                        <>
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل البيانات
                        </>
                      )}
                    </Button>

              {editing && (
                <Button
                  onClick={() => {/* Save logic */}}
                  disabled={saving}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-0 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  حفظ التغييرات
                </Button>
              )}

              <Button
                onClick={openUserProfile}
                className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white border-0 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <Eye className="w-4 h-4 mr-2" />
                عرض الملف الشخصي
              </Button>

              <Button
                onClick={() => {/* Reset password logic */}}
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 px-6 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
              >
                <KeyRound className="w-4 h-4 mr-2" />
                إعادة تعيين كلمة المرور
              </Button>
                  </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-blue-200">
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <User className="w-5 h-5" />
                    المعلومات الأساسية
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">الاسم</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {editing ? (
                        <Input
                            value={editForm.name || user.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="border-0 bg-transparent p-0"
                        />
                      ) : (
                          <span className="text-gray-900 font-medium">{user.name}</span>
                      )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">البريد الإلكتروني</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {editing ? (
                        <Input
                            value={editForm.email || user.email}
                            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                            className="border-0 bg-transparent p-0"
                        />
                      ) : (
                          <span className="text-gray-900 font-medium">{user.email}</span>
                      )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">رقم الهاتف</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {editing ? (
                        <Input
                            value={editForm.phone || user.phone || ''}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="border-0 bg-transparent p-0"
                        />
                      ) : (
                          <span className="text-gray-900 font-medium">{user.phone || 'غير محدد'}</span>
                      )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-gray-700">نوع الحساب</Label>
                      <div className="mt-1">
                        {getAccountTypeBadge(user.accountType)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-100 border-b border-emerald-200">
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <Activity className="w-5 h-5" />
                    حالة الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                      <Label className="text-sm font-medium text-gray-700">الحالة</Label>
                      <div className="mt-1">
                        {getStatusBadge(user.isActive)}
                      </div>
                    </div>

                          <div>
                      <Label className="text-sm font-medium text-gray-700">تاريخ التسجيل</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>

                    {user.lastLogin && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">آخر دخول</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-900 font-medium">{formatDate(user.lastLogin)}</span>
                      </div>
                    </div>
                  )}

                    {user.verificationStatus && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">حالة التحقق</Label>
                        <div className="mt-1">
                          {getVerificationBadge(user.verificationStatus)}
                        </div>
                    </div>
                  )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            {(user.location || user.position || user.nationality) && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-100 border-b border-purple-200">
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                      <MapPin className="w-5 h-5" />
                    معلومات إضافية
                    </CardTitle>
                  </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {user.location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">الموقع</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-900 font-medium">
                            {user.location.cityName}, {user.location.countryName}
                          </span>
                        </div>
                      </div>
                    )}

                    {user.position && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">المركز</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-900 font-medium">{user.position}</span>
                        </div>
                      </div>
                    )}

                    {user.nationality && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">الجنسية</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-900 font-medium">{user.nationality}</span>
                        </div>
                      </div>
                    )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Subscription Information */}
            {subscriptionInfo && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-100 border-b border-amber-200">
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <CreditCard className="w-5 h-5" />
                    معلومات الاشتراك
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">الحالة</Label>
                      <div className="mt-1">
                        <Badge className={`px-3 py-1 rounded-full text-white border-0 ${
                          subscriptionInfo.status === 'active' 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                            : subscriptionInfo.status === 'expired'
                            ? 'bg-gradient-to-r from-red-500 to-pink-600'
                            : subscriptionInfo.status === 'trial'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-r from-gray-500 to-slate-600'
                        }`}>
                          {subscriptionInfo.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {subscriptionInfo.status === 'expired' && <XCircle className="w-3 h-3 mr-1" />}
                          {subscriptionInfo.status === 'trial' && <Zap className="w-3 h-3 mr-1" />}
                          {subscriptionInfo.status === 'active' ? 'نشط' :
                           subscriptionInfo.status === 'expired' ? 'منتهي' :
                           subscriptionInfo.status === 'trial' ? 'تجريبي' : 'ملغي'}
                        </Badge>
                      </div>
                  </div>
                  
                    {subscriptionInfo.plan && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">الخطة</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-900 font-medium">{subscriptionInfo.plan}</span>
                        </div>
                      </div>
                    )}

                    {subscriptionInfo.expiresAt && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">تاريخ الانتهاء</Label>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="text-gray-900 font-medium">{formatDate(subscriptionInfo.expiresAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Last Payment */}
            {lastPayment && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 border-b border-green-200">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Activity className="w-5 h-5" />
                    آخر دفعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                      <Label className="text-sm font-medium text-gray-700">المبلغ</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">
                          {lastPayment.amount} {lastPayment.currency}
                        </span>
                      </div>
                  </div>
                  
                  <div>
                      <Label className="text-sm font-medium text-gray-700">طريقة الدفع</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">{lastPayment.paymentMethod || 'غير محدد'}</span>
                      </div>
                  </div>
                  
                  <div>
                      <Label className="text-sm font-medium text-gray-700">تاريخ الدفع</Label>
                      <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-900 font-medium">{formatDate(lastPayment.createdAt)}</span>
                      </div>
                  </div>

                    <div>
                      <Label className="text-sm font-medium text-gray-700">المصدر</Label>
                      <div className="mt-1">
                        <Badge className={`px-3 py-1 rounded-full text-white border-0 ${
                          lastPayment.source === 'payments' 
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                            : 'bg-gradient-to-r from-purple-500 to-violet-600'
                        }`}>
                          {lastPayment.source === 'payments' ? 'مدفوعات عادية' : 'مدفوعات مجمعة'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
} 

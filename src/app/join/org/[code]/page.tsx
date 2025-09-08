'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { organizationReferralService } from '@/lib/organization/organization-referral-service';
import { OrganizationReferral } from '@/types/organization-referral';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Users, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

interface JoinOrgPageProps {
  params: { code: string };
}

export default function JoinOrgPage({ params }: JoinOrgPageProps) {
  const { code } = params;
  const router = useRouter();
  const { user, userData } = useAuth();
  
  const [referral, setReferral] = useState<OrganizationReferral | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReferralData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const loadReferralData = async () => {
    try {
      setLoading(true);
      const referralData = await organizationReferralService.findReferralByCode(code);
      
      if (!referralData) {
        setError('كود الانضمام غير صحيح أو منتهي الصلاحية');
      } else {
        setReferral(referralData);
      }
    } catch (err) {
      console.error('خطأ في تحميل بيانات الإحالة:', err);
      setError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    if (!user || !userData || !referral) {
      toast.error('يجب تسجيل الدخول أولاً');
      router.push('/auth/login');
      return;
    }

    if ((userData as any).accountType !== 'player') {
      toast.error('هذه الخدمة متاحة للاعبين فقط');
      return;
    }

    setJoining(true);

    try {
      await organizationReferralService.createJoinRequest(
        user.uid,
        userData,
        code
      );

      toast.success('تم إرسال طلب الانضمام بنجاح! سيتم إشعارك عند الموافقة عليه.');
      router.push('/dashboard/player');
      
    } catch (err: any) {
      console.error('خطأ في إرسال طلب الانضمام:', err);
      toast.error(err?.message || 'فشل في إرسال طلب الانضمام');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">خطأ في كود الانضمام</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/')}>العودة للرئيسية</Button>
        </Card>
      </div>
    );
  }

  const getOrgTypeLabel = (type: string) => {
    switch (type) {
      case 'club': return 'نادي';
      case 'academy': return 'أكاديمية';
      case 'trainer': return 'مدرب';
      case 'agent': return 'وكيل';
      default: return 'منظمة';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">دعوة للانضمام</h1>
            <p className="text-gray-600">تم العثور على دعوة صحيحة للانضمام</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-900">{referral.organizationName}</h2>
                <Badge variant="outline">{getOrgTypeLabel(referral.organizationType)}</Badge>
              </div>
              
              <p className="text-blue-800 mb-4">{referral.description}</p>
              
              <div className="flex items-center gap-4 text-sm text-blue-700">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{referral.currentUsage} لاعب انضم</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>تم الإنشاء: {new Date(referral.createdAt as any).toLocaleDateString('ar')}</span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 mb-2">ملاحظة مهمة:</h3>
              <p className="text-yellow-700 text-sm">
                عند الضغط على "طلب الانضمام"، سيتم إرسال طلبك إلى {referral.organizationName}. سيتم إشعارك عندما يتم قبول أو رفض طلبك.
              </p>
            </div>

            {!user ? (
              <div className="space-y-4">
                <p className="text-center text-gray-600">يجب تسجيل الدخول أولاً للانضمام</p>
                <div className="flex gap-4">
                  <Button className="flex-1" onClick={() => router.push('/auth/login')}>
                    تسجيل الدخول
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => router.push('/auth/register')}>
                    إنشاء حساب جديد
                  </Button>
                </div>
              </div>
            ) : (userData as any)?.accountType !== 'player' ? (
              <div className="text-center">
                <p className="text-red-600 mb-4">هذه الدعوة متاحة للاعبين فقط</p>
                <Button variant="outline" onClick={() => router.push('/dashboard')}>
                  العودة للوحة التحكم
                </Button>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={handleJoinRequest} disabled={joining}>
                {joining ? 'جاري الإرسال...' : 'طلب الانضمام'}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}



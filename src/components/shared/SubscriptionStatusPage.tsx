'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  Printer
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_date: any;
  package_name?: string;
  transaction_id?: string;
  customer_name?: string;
  customer_email?: string;
}

interface SubscriptionStatusPageProps {
  accountType: string;
}

const SubscriptionStatusPage: React.FC<SubscriptionStatusPageProps> = ({ accountType }) => {
  const { user, userData } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(
      query(
        collection(db, 'bulk_payments'),
        where('customer_id', '==', user.uid),
        orderBy('payment_date', 'desc'),
        limit(10)
      ),
      (snapshot) => {
        const paymentData: PaymentRecord[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          paymentData.push({
            id: doc.id,
            amount: data.amount || 0,
            currency: data.currency || 'EGP',
            status: data.status || 'pending',
            payment_date: data.payment_date,
            package_name: data.package_name,
            transaction_id: data.transaction_id,
            customer_name: data.customer_name,
            customer_email: data.customer_email,
          });
        });
        setPayments(paymentData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching payments:', error);
        setError('حدث خطأ في جلب بيانات المدفوعات');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'مكتمل' };
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'في الانتظار' };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'فشل' };
      case 'cancelled':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'ملغي' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: status };
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'غير محدد';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'غير محدد';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الاشتراك...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* عنوان الصفحة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">حالة الاشتراك</h1>
          <p className="text-gray-600">عرض تفاصيل اشتراك {accountType === 'trainer' ? 'المدرب' : accountType}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 ml-2" />
            تصدير البيانات
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 ml-2" />
            طباعة التقرير
          </Button>
        </div>
      </div>

      {/* ملخص الاشتراك */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            ملخص الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
              <div className="text-sm text-gray-600">إجمالي المدفوعات</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {payments.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">المدفوعات المكتملة</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {payments.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">المدفوعات المعلقة</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* قائمة المدفوعات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            سجل المدفوعات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">لا توجد مدفوعات مسجلة</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const statusInfo = getStatusInfo(payment.status);
                const StatusIcon = statusInfo.icon;
                
                return (
                  <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {payment.package_name || 'باقة غير محددة'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {payment.customer_name || userData?.name || 'غير محدد'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(payment.payment_date)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {payment.amount} {payment.currency}
                        </div>
                        <Badge className={`mt-1 ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusInfo.text}
                        </Badge>
                      </div>
                    </div>
                    {payment.transaction_id && (
                      <div className="mt-2 text-xs text-gray-500">
                        رقم المعاملة: {payment.transaction_id}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionStatusPage;

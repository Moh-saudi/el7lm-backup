'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { addPaymentNotification, addSmartCelebrationNotification } from '@/lib/firebase/notifications';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { 
  CheckCircle, XCircle, Clock, AlertTriangle, 
  Search, Filter, RefreshCw, Eye, Check, X,
  FileImage, ExternalLink, Download
} from 'lucide-react';

interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  accountType: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  receiptUrl?: string;
  transactionId?: string;
  description?: string;
  players?: Array<{ id: string; name: string; }>;
}

export default function PaymentApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRequest[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // فلاتر
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // إحصائيات
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  // جلب المدفوعات
  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // استعلام Firebase
      const paymentsRef = collection(db, 'bulkPayments');
      const q = query(
        paymentsRef,
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const fetchedPayments: PaymentRequest[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        fetchedPayments.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName || 'غير محدد',
          userEmail: data.userEmail || 'غير محدد',
          accountType: data.accountType,
          paymentMethod: data.paymentMethod,
          amount: data.amount,
          currency: data.currency,
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          receiptUrl: data.receiptUrl,
          transactionId: data.transactionId,
          description: data.description,
          players: data.players
        });
      });
      
      setPayments(fetchedPayments);
      updateStats(fetchedPayments);
      applyFilters(fetchedPayments, statusFilter, searchTerm, dateRange);
      
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث الإحصائيات
  const updateStats = (paymentsList: PaymentRequest[]) => {
    const newStats = {
      total: paymentsList.length,
      pending: paymentsList.filter(p => p.status === 'pending').length,
      approved: paymentsList.filter(p => p.status === 'approved').length,
      rejected: paymentsList.filter(p => p.status === 'rejected').length,
      totalAmount: paymentsList.reduce((sum, p) => sum + p.amount, 0)
    };
    setStats(newStats);
  };

  // تطبيق الفلاتر
  const applyFilters = (
    paymentsList: PaymentRequest[],
    status: string,
    search: string,
    dates: { start: string; end: string }
  ) => {
    let filtered = [...paymentsList];
    
    // فلتر الحالة
    if (status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    
    // فلتر البحث
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.userName.toLowerCase().includes(searchLower) ||
        p.userEmail.toLowerCase().includes(searchLower) ||
        p.transactionId?.toLowerCase().includes(searchLower) ||
        p.players?.some(player => player.name.toLowerCase().includes(searchLower))
      );
    }
    
    // فلتر التاريخ
    if (dates.start) {
      filtered = filtered.filter(p => 
        p.createdAt >= new Date(dates.start)
      );
    }
    if (dates.end) {
      filtered = filtered.filter(p => 
        p.createdAt <= new Date(dates.end)
      );
    }
    
    setFilteredPayments(filtered);
  };

  // تحميل البيانات عند فتح الصفحة
  useEffect(() => {
    if (user?.uid) {
      fetchPayments();
    }
  }, [user?.uid]);

  // وظائف الموافقة/الرفض
  const handleApprove = async (payment: PaymentRequest) => {
    try {
      setActionLoading(payment.id);
      
      // تحديث حالة الدفع
      const paymentRef = doc(db, 'bulkPayments', payment.id);
      await updateDoc(paymentRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: user?.uid,
        updatedAt: serverTimestamp()
      });

      // تحديث حالة الاشتراك للاعبين
      if (payment.players && payment.players.length > 0) {
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 3); // اشتراك 3 شهور

        for (const player of payment.players) {
          try {
            const playerRef = doc(db, 'players', player.id);
            await updateDoc(playerRef, {
              subscription_status: 'active',
              subscription_end: endDate.toISOString(),
              last_payment_id: payment.id,
              last_payment_amount: payment.amount,
              last_payment_date: new Date().toISOString(),
              updated_at: serverTimestamp()
            });
          } catch (error) {
            console.error(`Error updating player ${player.id}:`, error);
          }
        }
      }

      // إضافة إشعار للمستخدم
      await addPaymentNotification({
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        status: 'approved',
        paymentId: payment.id,
        paymentMethod: payment.paymentMethod
      });

      // إشعار احتفالي ذكي في الهيدر
      await addSmartCelebrationNotification({
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        packageName: payment.description,
        playersCount: payment.players?.length
      });

      // تحديث القائمة محلياً
      const updatedPayments = payments.map(p => 
        p.id === payment.id 
          ? { ...p, status: 'approved' } 
          : p
      );
      setPayments(updatedPayments);
      updateStats(updatedPayments);
      applyFilters(updatedPayments, statusFilter, searchTerm, dateRange);

      // تم قبول الدفع بنجاح
      
    } catch (error) {
      console.error('Error approving payment:', error);
      console.error('حدث خطأ أثناء قبول الدفع:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (payment: PaymentRequest) => {
    try {
      setActionLoading(payment.id);
      
      // تحديث حالة الدفع
      const paymentRef = doc(db, 'bulkPayments', payment.id);
      await updateDoc(paymentRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: user?.uid,
        updatedAt: serverTimestamp()
      });

      // إضافة إشعار للمستخدم
      await addPaymentNotification({
        userId: payment.userId,
        amount: payment.amount,
        currency: payment.currency,
        status: 'rejected',
        paymentId: payment.id,
        paymentMethod: payment.paymentMethod
      });

      // تحديث القائمة محلياً
      const updatedPayments = payments.map(p => 
        p.id === payment.id 
          ? { ...p, status: 'rejected' } 
          : p
      );
      setPayments(updatedPayments);
      updateStats(updatedPayments);
      applyFilters(updatedPayments, statusFilter, searchTerm, dateRange);

      // تم رفض الدفع بنجاح
      
    } catch (error) {
      console.error('Error rejecting payment:', error);
      console.error('حدث خطأ أثناء رفض الدفع:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = (payment: PaymentRequest) => {
    // TODO: إضافة مودال لعرض التفاصيل الكاملة
    console.log('تفاصيل الدفع:', payment);
  };

  // تحديث الفلاتر
  useEffect(() => {
    applyFilters(payments, statusFilter, searchTerm, dateRange);
  }, [statusFilter, searchTerm, dateRange]);

  return (
          <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">إدارة طلبات الدفع</h1>
          <button
            onClick={() => fetchPayments()}
            className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            تحديث
          </button>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600">قيد الانتظار</p>
                <p className="text-xl font-bold text-purple-700">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600">تمت الموافقة</p>
                <p className="text-xl font-bold text-green-700">{stats.approved}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600">مرفوض</p>
                <p className="text-xl font-bold text-red-700">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600">إجمالي الطلبات</p>
                <p className="text-xl font-bold text-blue-700">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <span className="text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm text-emerald-600">إجمالي المبالغ</p>
                <p className="text-xl font-bold text-emerald-700">
                  {stats.totalAmount.toLocaleString()} ج.م
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* أدوات الفلترة */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* البحث */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="بحث باسم المستخدم، الإيميل، رقم العملية..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* فلتر الحالة */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="فلتر حسب الحالة"
              aria-label="فلتر حسب الحالة"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="approved">تمت الموافقة</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>

          {/* فلتر التاريخ */}
          <div>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="تاريخ البداية"
              aria-label="تاريخ البداية"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              title="تاريخ النهاية"
              aria-label="تاريخ النهاية"
            />
          </div>
        </div>
      </div>

      {/* قائمة الطلبات */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المستخدم
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التفاصيل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                      <span>جاري التحميل...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    لا توجد طلبات دفع تطابق الفلاتر المحددة
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{payment.userName}</div>
                        <div className="text-sm text-gray-500">{payment.userEmail}</div>
                        <div className="text-xs text-gray-400">{payment.accountType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {payment.paymentMethod === 'geidea' ? '💳 بطاقة بنكية' :
                           payment.paymentMethod === 'vodafone_cash' ? '📱 فودافون كاش' :
                           payment.paymentMethod === 'instapay' ? '⚡ انستا باي' :
                           payment.paymentMethod === 'bank_transfer' ? '🏦 تحويل بنكي' :
                           '💰 طريقة أخرى'}
                        </div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-500">
                            رقم العملية: {payment.transactionId}
                          </div>
                        )}
                        {payment.players && (
                          <div className="text-xs text-gray-500">
                            عدد اللاعبين: {payment.players.length}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'approved' ? 'bg-green-100 text-green-800' :
                        payment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'approved' ? 'تمت الموافقة' :
                         payment.status === 'rejected' ? 'مرفوض' :
                         'قيد الانتظار'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {payment.createdAt.toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-2">
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                            title="عرض الإيصال"
                          >
                            <FileImage className="w-5 h-5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleApprove(payment)}
                          disabled={actionLoading === payment.id || payment.status !== 'pending'}
                          className={`text-green-600 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                            actionLoading === payment.id ? 'animate-pulse' : ''
                          }`}
                          title="موافقة"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleReject(payment)}
                          disabled={actionLoading === payment.id || payment.status !== 'pending'}
                          className={`text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed ${
                            actionLoading === payment.id ? 'animate-pulse' : ''
                          }`}
                          title="رفض"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleViewDetails(payment)}
                          disabled={actionLoading === payment.id}
                          className="text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

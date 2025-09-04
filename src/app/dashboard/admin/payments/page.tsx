'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { toast } from 'sonner';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    totalAmount: 0
  });

  // نماذج الرسائل الجاهزة
  const messageTemplates = {
    paymentSuccess: 'تم استلام دفعتك بنجاح. شكراً لك!',
    paymentPending: 'دفعتك قيد المعالجة. سنوافيك بالنتيجة قريباً.',
    paymentFailed: 'عذراً، فشلت عملية الدفع. يرجى المحاولة مرة أخرى.',
    welcome: 'مرحباً بك في منصتنا! نتمنى لك تجربة ممتعة.',
    reminder: 'تذكير: لديك دفعة معلقة تنتظر الإتمام.',
    support: 'هل تحتاج مساعدة؟ فريق الدعم جاهز لمساعدتك.',
    custom: 'رسالة مخصصة'
  };

  const selectTemplate = (template) => {
    if (template === 'custom') {
      setMessageText('');
    } else {
      setMessageText(messageTemplates[template]);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      const collectionNames = [
        'payments', 'payment', 'transactions', 'orders', 
        'wallet', 'instapay', 'fawry', 'vodafone_cash', 
        'orange_money', 'etisalat_wallet', 'paymob', 
        'paypal_transactions', 'stripe_payments',
        'bulkPayments', 'bulk_payments', 'payment_action_logs', 'payment_results'
      ];
      
      let allPayments = [];
      
      for (const collectionName of collectionNames) {
        try {
          const collectionRef = collection(db, collectionName);
          const q = query(collectionRef, orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            
            console.log(`Collection: ${collectionName}, Data:`, data);
            
            // البحث عن معرف اللاعب
            let playerId = null;
            const playerIdFields = [
              'playerId', 'userId', 'customerId', 'user_id', 'player_id', 'customer_id',
              'player', 'user', 'customer', 'accountId', 'account_id'
            ];
            
            for (const field of playerIdFields) {
              if (data[field] && data[field].toString().trim() !== '') {
                playerId = data[field].toString().trim();
                console.log(`Found playerId in field: ${field} = ${playerId}`);
                break;
              }
            }
            
            // البحث عن بيانات اللاعب - التصحيح الصحيح!
            let playerName = 'غير محدد';
            let playerPhone = 'غير محدد';
            
            // البحث المباشر في البيانات أولاً - هذا مهم جداً!
            const directNameFields = [
              'playerName', 'customerName', 'userName', 'name', 'fullName',
              'firstName', 'lastName', 'recipientName', 'buyerName', 'clientName',
              'accountName', 'holderName', 'customer_name', 'user_name', 'full_name',
              'first_name', 'last_name', 'recipient_name', 'buyer_name', 'client_name',
              'customer_full_name', 'user_full_name', 'account_name', 'player_name'
            ];
            
            for (const field of directNameFields) {
              if (data[field] && data[field].toString().trim() !== '') {
                playerName = data[field].toString().trim();
                console.log(`Found name directly in data: ${field} = ${playerName}`);
                break;
              }
            }
            
            // إذا لم نجد الاسم، نبحث في الإيميل ونستخرج الاسم منه
            if (playerName === 'غير محدد' && data.email) {
              const email = data.email.toString().trim();
              console.log(`Found email: ${email}`);
              
              // استخراج الاسم من الإيميل (قبل علامة @)
              if (email.includes('@')) {
                const nameFromEmail = email.split('@')[0];
                // تنظيف الاسم من الأرقام والرموز
                const cleanName = nameFromEmail.replace(/[0-9_\-\.]/g, ' ').trim();
                if (cleanName && cleanName.length > 2) {
                  playerName = cleanName;
                  console.log(`Extracted name from email: ${playerName}`);
                } else {
                  playerName = nameFromEmail;
                  console.log(`Using email prefix as name: ${playerName}`);
                }
              }
            }
            
            // البحث عن رقم الهاتف - التصحيح الصحيح للحقول!
            const directPhoneFields = [
              'phone', 'whatsapp', 'mobile', 'telephone', 'contact', 
              'phoneNumber', 'mobileNumber', 'contactNumber',
              'customer_phone', 'user_phone', 'phone_number', 'mobile_number',
              'customerMobile', 'userMobile', 'customerTel', 'userTel',
              'customer_phone_number', 'user_phone_number', 'contact_phone',
              'player_phone', 'customer_phone_number', 'user_phone_number'
            ];
            
            for (const field of directPhoneFields) {
              if (data[field] && data[field].toString().trim() !== '') {
                playerPhone = data[field].toString().trim();
                console.log(`Found phone directly in data: ${field} = ${playerPhone}`);
                break;
              }
            }
            
            // البحث في حقول أخرى محتملة للهاتف
            if (playerPhone === 'غير محدد') {
              const additionalPhoneFields = [
                'customerPhone', 'userPhone', 'recipientPhone', 'buyerPhone',
                'clientPhone', 'accountPhone', 'holderPhone', 'customer_phone',
                'user_phone', 'recipient_phone', 'buyer_phone', 'client_phone',
                'account_phone', 'holder_phone'
              ];
              
              for (const field of additionalPhoneFields) {
                if (data[field] && data[field].toString().trim() !== '') {
                  playerPhone = data[field].toString().trim();
                  console.log(`Found phone in additional field: ${field} = ${playerPhone}`);
                  break;
                }
              }
            }
            
            // إذا لم نجد رقم الهاتف، نبحث في الإيميل ونستخرج الرقم منه
            if (playerPhone === 'غير محدد' && data.email) {
              const email = data.email.toString().trim();
              // استخراج الأرقام من الإيميل
              const phoneMatch = email.match(/\d+/);
              if (phoneMatch) {
                playerPhone = phoneMatch[0];
                console.log(`Extracted phone from email: ${playerPhone}`);
              }
            }
            
            // إذا لم نجد البيانات مباشرة، نبحث في جدول players
            if (playerId && (playerName === 'غير محدد' || playerPhone === 'غير محدد')) {
              try {
                console.log(`Searching for player with ID: ${playerId}`);
                const playerDoc = await getDocs(query(collection(db, 'players'), 
                  where('uid', '==', playerId)
                ));
                
                if (!playerDoc.empty) {
                  const playerData = playerDoc.docs[0].data();
                  console.log('Player data found:', playerData);
                  
                  // البحث عن الاسم - حسب هيكل البيانات الفعلي من جدول players
                  const nameFields = [
                    'full_name', 'fullName', 'firstName', 'lastName', 'name', 'displayName',
                    'playerName', 'userName', 'customerName'
                  ];
                  
                  if (playerName === 'غير محدد') {
                    for (const field of nameFields) {
                      if (playerData[field] && playerData[field].toString().trim() !== '') {
                        playerName = playerData[field].toString().trim();
                        console.log(`Found name in player data: ${field} = ${playerName}`);
                        break;
                      }
                    }
                  }
                  
                  // البحث عن رقم الهاتف - حسب هيكل البيانات الفعلي من جدول players
                  const phoneFields = [
                    'phone', 'whatsapp', 'mobile', 'phoneNumber', 'mobileNumber',
                    'phone_number', 'mobile_number', 'contact'
                  ];
                  
                  if (playerPhone === 'غير محدد') {
                    for (const field of phoneFields) {
                      if (playerData[field] && playerData[field].toString().trim() !== '') {
                        playerPhone = playerData[field].toString().trim();
                        console.log(`Found phone in player data: ${field} = ${playerPhone}`);
                        break;
                      }
                    }
                  }
                  
                  console.log(`Final result from players - Name: ${playerName}, Phone: ${playerPhone}`);
                } else {
                  console.log(`No player found with ID: ${playerId}`);
                  
                  // محاولة البحث في جدول users إذا لم يتم العثور في players
                  try {
                    const userDoc = await getDocs(query(collection(db, 'users'), 
                      where('uid', '==', playerId)
                    ));
                    
                    if (!userDoc.empty) {
                      const userData = userDoc.docs[0].data();
                      console.log('User data found:', userData);
                      
                      // البحث عن الاسم في جدول users
                      if (playerName === 'غير محدد') {
                        for (const field of nameFields) {
                          if (userData[field] && userData[field].toString().trim() !== '') {
                            playerName = userData[field].toString().trim();
                            console.log(`Found name in user data: ${field} = ${playerName}`);
                            break;
                          }
                        }
                      }
                      
                      // البحث عن رقم الهاتف في جدول users
                      if (playerPhone === 'غير محدد') {
                        for (const field of phoneFields) {
                          if (userData[field] && userData[field].toString().trim() !== '') {
                            playerPhone = userData[field].toString().trim();
                            console.log(`Found phone in user data: ${field} = ${playerPhone}`);
                            break;
                          }
                        }
                      }
                      
                      console.log(`Final result from users - Name: ${playerName}, Phone: ${playerPhone}`);
                    }
                  } catch (userError) {
                    console.log(`Error searching users table:`, userError);
                  }
                }
              } catch (error) {
                console.error(`Error fetching player data for ID ${playerId}:`, error);
              }
            } else if (!playerId) {
              console.log('No playerId found in payment data');
            }
            
            console.log(`Final payment data - Name: ${playerName}, Phone: ${playerPhone}, Collection: ${collectionName}`);
            
            allPayments.push({ 
              id: doc.id, 
              collection: collectionName,
              playerName: playerName,
              playerPhone: playerPhone,
              amount: data.amount || data.total || data.value || data.price || data.cost || data.fee || 0,
              currency: data.currency || data.currencyCode || data.currencySymbol || 'EGP',
              status: data.status || data.paymentStatus || data.transactionStatus || 'pending',
              paymentMethod: data.paymentMethod || data.method || data.gateway || data.paymentType || collectionName,
              createdAt: data.createdAt || data.timestamp || data.date || data.paymentDate || data.transactionDate || new Date(),
              receiptImage: data.receiptImage || data.receiptUrl || data.image || data.photo || data.picture || null,
              receiptUrl: data.receiptUrl || data.receiptImage || data.image || data.photo || data.picture || null
            });
          }
        } catch (error) {
          console.log(`Collection ${collectionName} not accessible:`, error);
        }
      }

      // حساب الإحصائيات
      const totalAmount = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const completed = allPayments.filter(p => p.status === 'completed' || p.status === 'success' || p.status === 'paid').length;
      const pending = allPayments.filter(p => p.status === 'pending' || p.status === 'processing' || p.status === 'waiting').length;
      const cancelled = allPayments.filter(p => p.status === 'cancelled' || p.status === 'failed' || p.status === 'rejected').length;

      setStats({
        total: allPayments.length,
        completed,
        pending,
        cancelled,
        totalAmount
      });

      setPayments(allPayments);
      console.log(`تم جلب ${allPayments.length} دفعة`);
      console.log('مثال على البيانات المجلوبة:', allPayments.slice(0, 3));
      toast.success(`تم جلب ${allPayments.length} دفعة بنجاح`);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('خطأ في جلب بيانات المدفوعات');
    } finally {
      setLoading(false);
    }
  };

  // وظائف الأزرار
  const handleDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsDialog(true);
  };

  const handleReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptDialog(true);
  };

  const handleMessage = (payment) => {
    setSelectedPayment(payment);
    setShowMessageDialog(true);
  };

  const sendMessage = async () => {
    if (!messageText.trim()) {
      toast.error('يرجى كتابة رسالة');
      return;
    }
    
    try {
      // هنا يمكن إضافة منطق إرسال الرسالة
      toast.success('تم إرسال الرسالة بنجاح');
      setShowMessageDialog(false);
      setMessageText('');
    } catch (error) {
      toast.error('فشل في إرسال الرسالة');
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-700 font-semibold">جاري تحميل بيانات المدفوعات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">💰 إدارة المدفوعات</h1>
          <p className="text-lg text-gray-600">مراقبة وإدارة جميع عمليات الدفع</p>
        </div>

        {/* الإحصائيات السريعة */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm opacity-90">إجمالي</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm opacity-90">مكتملة</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm opacity-90">قيد الانتظار</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.cancelled}</p>
              <p className="text-sm opacity-90">ملغية</p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()}</p>
              <p className="text-sm opacity-90">إجمالي المبالغ</p>
            </div>
          </div>
        </div>

        {/* عرض البيانات */}
        {payments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {payment.playerName}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    payment.status === 'completed' || payment.status === 'success' || payment.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : payment.status === 'pending' || payment.status === 'processing' || payment.status === 'waiting'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">المبلغ:</span>
                    <span className="font-bold text-lg text-green-600">
                      {payment.amount?.toLocaleString()} {payment.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">طريقة الدفع:</span>
                    <span className="font-medium text-blue-600">{payment.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">رقم الهاتف:</span>
                    <span className="font-medium text-purple-600">{payment.playerPhone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">المصدر:</span>
                    <span className="font-medium text-orange-600">{payment.collection}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">التاريخ:</span>
                    <span className="font-medium text-sm text-gray-700">
                      {payment.createdAt?.toDate ? 
                        payment.createdAt.toDate().toLocaleDateString('ar-EG') :
                        new Date(payment.createdAt).toLocaleDateString('ar-EG')
                      }
                    </span>
                  </div>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => handleDetails(payment)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    التفاصيل
                  </button>
                  <button 
                    onClick={() => handleReceipt(payment)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    معاينة الإيصال
                  </button>
                  <button 
                    onClick={() => handleMessage(payment)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    إرسال رسالة
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-600 text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد مدفوعات</h3>
            <p className="text-gray-500">لم يتم العثور على مدفوعات في النظام</p>
          </div>
        )}

        {/* موديول التفاصيل */}
        {showDetailsDialog && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">تفاصيل الدفعة</h2>
                <button 
                  onClick={() => setShowDetailsDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">اسم العميل:</label>
                    <p className="text-gray-900">{selectedPayment.playerName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">رقم الهاتف:</label>
                    <p className="text-gray-900">{selectedPayment.playerPhone}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">المبلغ:</label>
                    <p className="text-gray-900 font-semibold">
                      {selectedPayment.amount?.toLocaleString()} {selectedPayment.currency}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">الحالة:</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedPayment.status === 'completed' || selectedPayment.status === 'success' || selectedPayment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : selectedPayment.status === 'pending' || selectedPayment.status === 'processing' || selectedPayment.status === 'waiting'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">طريقة الدفع:</label>
                    <p className="text-gray-900">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">المصدر:</label>
                    <p className="text-gray-900">{selectedPayment.collection}</p>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700">التاريخ:</label>
                  <p className="text-gray-900">
                    {selectedPayment.createdAt?.toDate ? 
                      selectedPayment.createdAt.toDate().toLocaleString('ar-EG') :
                      new Date(selectedPayment.createdAt).toLocaleString('ar-EG')
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* موديول معاينة الإيصال */}
        {showReceiptDialog && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">معاينة الإيصال</h2>
                <button 
                  onClick={() => setShowReceiptDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">اسم العميل:</label>
                    <p className="text-gray-900">{selectedPayment.playerName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">المبلغ:</label>
                    <p className="text-gray-900 font-semibold">
                      {selectedPayment.amount?.toLocaleString()} {selectedPayment.currency}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700 mb-2 block">صورة الإيصال:</label>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    {(selectedPayment.receiptImage || selectedPayment.receiptUrl) ? (
                      <img 
                        src={selectedPayment.receiptImage || selectedPayment.receiptUrl} 
                        alt="صورة الإيصال"
                        className="max-w-full h-auto rounded-lg shadow-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <span className="text-4xl">📄</span>
                        <p className="mt-2">لا توجد صورة إيصال متوفرة</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* موديول إرسال الرسالة مع نماذج الرسائل */}
        {showMessageDialog && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">إرسال رسالة للعميل</h2>
                <button 
                  onClick={() => setShowMessageDialog(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">اسم العميل:</label>
                    <p className="text-gray-900">{selectedPayment.playerName}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">رقم الهاتف:</label>
                    <p className="text-gray-900">{selectedPayment.playerPhone}</p>
                  </div>
                </div>
                
                {/* نماذج الرسائل الجاهزة */}
                <div>
                  <label className="font-medium text-gray-700 mb-2 block">نماذج الرسائل الجاهزة:</label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button 
                      onClick={() => selectTemplate('paymentSuccess')}
                      className="text-right p-2 text-sm bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      ✅ نجح الدفع
                    </button>
                    <button 
                      onClick={() => selectTemplate('paymentPending')}
                      className="text-right p-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
                    >
                      ⏳ قيد المعالجة
                    </button>
                    <button 
                      onClick={() => selectTemplate('paymentFailed')}
                      className="text-right p-2 text-sm bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      ❌ فشل الدفع
                    </button>
                    <button 
                      onClick={() => selectTemplate('welcome')}
                      className="text-right p-2 text-sm bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      👋 رسالة ترحيب
                    </button>
                    <button 
                      onClick={() => selectTemplate('reminder')}
                      className="text-right p-2 text-sm bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      🔔 تذكير
                    </button>
                    <button 
                      onClick={() => selectTemplate('support')}
                      className="text-right p-2 text-sm bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      🆘 مساعدة
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="font-medium text-gray-700 mb-2 block">نص الرسالة:</label>
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="اكتب رسالتك هنا أو اختر نموذج جاهز..."
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    عدد الأحرف: {messageText.length}/160
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={() => setShowMessageDialog(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={sendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    إرسال الرسالة
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

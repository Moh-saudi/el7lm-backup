'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Calendar, CheckCircle, RefreshCcw, Plus, Eye, MessageSquare, FileText, Sparkles, Phone } from 'lucide-react';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  transactionId?: string;
  description: string;
  packageType?: string;
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  receiptUrl?: string;
  senderName?: string;
  senderAccount?: string;
  playerCount?: number;
  players?: Array<{id: string, name: string}>;
}

interface PaymentDetailsDialogProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onPreviewReceipt: (payment: Payment) => void;
  onVerifyReceipt: (payment: Payment) => void;
  onSendMessage: (payment: Payment) => void;
  onShowLogs: (payment: Payment) => void;
  onUpdateStatus: (paymentId: string, status: 'completed' | 'failed' | 'refunded') => void;
  verificationResults?: any;
  verifyingPaymentId?: string | null;
  actionLoading?: string | null;
  formatCurrency: (amount: number, currency: string) => string;
  formatDateTime: (date: any) => string;
  getStatusStyles: (status: string) => any;
}

export default function PaymentDetailsDialog({
  payment,
  isOpen,
  onClose,
  onPreviewReceipt,
  onVerifyReceipt,
  onSendMessage,
  onShowLogs,
  onUpdateStatus,
  verificationResults,
  verifyingPaymentId,
  actionLoading,
  formatCurrency,
  formatDateTime,
  getStatusStyles
}: PaymentDetailsDialogProps) {
  if (!payment) return null;

  const statusStyles = getStatusStyles(payment.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Enhanced Header */}
        <DialogHeader className="pb-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 -mt-6 px-6 pt-6">
          <DialogTitle className="flex items-center gap-4 text-2xl font-bold">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${statusStyles.bgColor}`}>
              <CreditCard className={`w-7 h-7 ${statusStyles.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="text-blue-900">تفاصيل المدفوعة</div>
              <div className="text-sm font-normal text-blue-700 mt-1">
                {payment.userName} • المعاملة #{payment.id.slice(-8)}
              </div>
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusStyles.badgeClass}`}>
                {statusStyles.badgeText}
              </span>
              <div className="text-xs text-gray-600 mt-2">
                {formatDateTime(payment.createdAt)}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Amount Showcase */}
              <div className={`rounded-xl p-8 text-center ${statusStyles.bgColor} ${statusStyles.borderColor}`}>
                <div className="text-4xl font-bold text-gray-900 mb-3">
                  {formatCurrency(payment.amount, payment.currency)}
                </div>
                <div className="text-lg text-gray-700 mb-2">{payment.paymentMethod}</div>
                <div className="text-sm text-gray-600">{payment.packageType || payment.description}</div>
              </div>

              {/* Customer Information */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-blue-600 text-lg">👤</span>
                  </div>
                  معلومات العميل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-xs mb-2 uppercase tracking-wide">الاسم الكامل</div>
                      <div className="font-semibold text-gray-900 text-lg">{payment.userName}</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-xs mb-2 uppercase tracking-wide">البريد الإلكتروني</div>
                      <div className="font-medium text-gray-900 break-all">{payment.userEmail}</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-600 text-xs mb-2 uppercase tracking-wide">معرف المستخدم</div>
                      <div className="px-3 py-2 font-mono text-sm bg-white border rounded-lg">
                        {payment.userId}
                      </div>
                    </div>
                    {payment.transactionId && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-xs mb-2 uppercase tracking-wide">رقم المعاملة</div>
                        <div className="px-3 py-2 font-mono text-sm bg-white border rounded-lg">
                          {payment.transactionId}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet Information */}
              {(payment.senderName || payment.senderAccount) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-lg">💳</span>
                    </div>
                    معلومات المحفظة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {payment.senderName && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-xs mb-2 uppercase tracking-wide">اسم المرسل</div>
                        <div className="font-semibold text-gray-900">{payment.senderName}</div>
                      </div>
                    )}
                    {payment.senderAccount && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-gray-600 text-xs mb-2 uppercase tracking-wide">حساب المرسل</div>
                        <div className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                          {payment.senderAccount}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Players List */}
              {payment.players && payment.players.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-green-600 text-lg">⚽</span>
                    </div>
                    اللاعبون المشتركون ({payment.players.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto">
                    {payment.players.map((player, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="font-medium text-gray-900">{player.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-1">{player.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Actions & Tools */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">⚡</span>
                  </div>
                  إجراءات سريعة
                </h3>
                <div className="space-y-3">
                  {payment.receiptUrl && (
                    <button
                      onClick={() => {
                        onPreviewReceipt(payment);
                        onClose();
                      }}
                      className="w-full p-3 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      معاينة الإيصال
                    </button>
                  )}
                  
                  {payment.receiptUrl && payment.status === 'pending' && (
                    <button
                      onClick={() => {
                        onVerifyReceipt(payment);
                        onClose();
                      }}
                      disabled={verifyingPaymentId === payment.id}
                      className="w-full p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {verifyingPaymentId === payment.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      تحقق تلقائي
                    </button>
                  )}

                  <button
                    onClick={() => {
                      onSendMessage(payment);
                      onClose();
                    }}
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    إرسال رسالة
                  </button>

                  <button
                    onClick={() => {
                      onShowLogs(payment);
                      onClose();
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    سجل العمليات
                  </button>
                </div>
              </div>

              {/* Receipt Preview */}
              {payment.receiptUrl && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">🧾</span>
                    </div>
                    الإيصال المرفق
                  </h3>
                  <div className="text-center">
                    <img 
                      src={payment.receiptUrl} 
                      alt="إيصال الدفع" 
                      className="max-w-full max-h-48 mx-auto border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => window.open(payment.receiptUrl, '_blank')}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                        e.currentTarget.alt = 'فشل في تحميل الصورة';
                      }}
                    />
                    <div className="mt-2 text-xs text-gray-500">انقر للتكبير</div>
                  </div>
                </div>
              )}

              {/* OCR Results */}
              {verificationResults?.[payment.id]?.allData && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-600" />
                    </div>
                    نتائج التحقق
                  </h3>
                  <div className="space-y-3">
                    <div className={`p-3 rounded-lg ${
                      verificationResults[payment.id].status === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="text-xs text-gray-600 mb-1">حالة التحقق</div>
                      <div className={`font-medium ${
                        verificationResults[payment.id].status === 'success' 
                          ? 'text-green-700' 
                          : 'text-red-700'
                      }`}>
                        {verificationResults[payment.id].status === 'success' ? '✅ نجح التحقق' : '❌ فشل التحقق'}
                      </div>
                    </div>
                    
                    {verificationResults[payment.id].allData.amounts && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-2">الأرقام المستخرجة</div>
                        <div className="flex flex-wrap gap-1">
                          {verificationResults[payment.id].allData.amounts.map((amount: number, index: number) => (
                            <span key={index} className={`px-2 py-1 text-xs rounded-full font-mono ${
                              amount === payment.amount 
                                ? 'bg-green-100 text-green-800 border border-green-300 font-bold' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {amount}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">اللغة المستخدمة</div>
                      <div className="font-medium text-gray-900">
                        {verificationResults[payment.id].allData.languageUsed === 'Arabic' ? '🇸🇦 العربية' : '🇺🇸 الإنجليزية'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-yellow-600" />
                  </div>
                  الجدول الزمني
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">تم إنشاء الدفعة</div>
                      <div className="text-sm text-gray-600">{formatDateTime(payment.createdAt)}</div>
                    </div>
                  </div>

                  {payment.completedAt && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">تم إكمال الدفعة</div>
                        <div className="text-sm text-gray-600">{formatDateTime(payment.completedAt)}</div>
                      </div>
                    </div>
                  )}

                  {payment.refundedAt && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <RefreshCcw className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">تم استرداد الدفعة</div>
                        <div className="text-sm text-gray-600">{formatDateTime(payment.refundedAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4">
          <div className="flex gap-3 justify-end">
            {payment.status === 'pending' && (
              <>
                <button
                  onClick={() => onUpdateStatus(payment.id, 'completed')}
                  disabled={actionLoading === payment.id}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {actionLoading === payment.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  تأكيد الدفعة
                </button>
                <button
                  onClick={() => onUpdateStatus(payment.id, 'failed')}
                  disabled={actionLoading === payment.id}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {actionLoading === payment.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <RefreshCcw className="w-4 h-4" />
                  )}
                  رفض الدفعة
                </button>
              </>
            )}
            {payment.status === 'completed' && (
              <button
                onClick={() => onUpdateStatus(payment.id, 'refunded')}
                disabled={actionLoading === payment.id}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {actionLoading === payment.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <RefreshCcw className="w-4 h-4" />
                )}
                استرداد الدفعة
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

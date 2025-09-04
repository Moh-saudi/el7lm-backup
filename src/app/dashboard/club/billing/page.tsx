'use client';
import { FileText, CheckCircle, XCircle, Clock, Eye, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const bills = [
  {
    id: 'INV-001',
    amount: '500 ريال',
    status: 'مدفوعة',
    issued: '2024-05-01',
    due: '2024-05-10',
  },
  {
    id: 'INV-002',
    amount: '700 ريال',
    status: 'قيد الانتظار',
    issued: '2024-06-01',
    due: '2024-06-10',
  },
  {
    id: 'INV-003',
    amount: '300 ريال',
    status: 'متأخرة',
    issued: '2024-04-01',
    due: '2024-04-10',
  },
];

const statusColor = (status: string) => {
  switch (status) {
    case 'مدفوعة': return 'bg-green-100 text-green-700';
    case 'قيد الانتظار': return 'bg-yellow-100 text-yellow-700';
    case 'متأخرة': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'مدفوعة': return <CheckCircle className="text-green-500" size={20} />;
    case 'قيد الانتظار': return <Clock className="text-yellow-500" size={20} />;
    case 'متأخرة': return <XCircle className="text-red-500" size={20} />;
    default: return <FileText size={20} />;
  }
};

export default function BillingPage() {
  const router = useRouter();
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-5 h-5" />
        العودة للوحة التحكم
      </button>
      <h1 className="text-2xl font-bold mb-8 text-primary">الفواتير والاشتراكات</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <table className="w-full text-right">
          <thead>
            <tr className="text-gray-600 border-b">
              <th className="py-2">رقم الفاتورة</th>
              <th className="py-2">المبلغ</th>
              <th className="py-2">الحالة</th>
              <th className="py-2">تاريخ الإصدار</th>
              <th className="py-2">تاريخ الاستحقاق</th>
              <th className="py-2">الإجراء</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill.id} className="border-b hover:bg-gray-50 transition">
                <td className="py-3 font-bold">{bill.id}</td>
                <td className="py-3">{bill.amount}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium ${statusColor(bill.status)}`}>
                    {statusIcon(bill.status)}
                    {bill.status}
                  </span>
                </td>
                <td className="py-3">{bill.issued}</td>
                <td className="py-3">{bill.due}</td>
                <td className="py-3">
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-gradient-to-l from-blue-400 to-blue-600 text-white hover:scale-105 transition">
                    <Eye size={16} /> تفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Download, Eye } from 'lucide-react';

export default function AcademyBilling() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-orange-700">الاشتراكات والفواتير</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            تفاصيل الاشتراك
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">صفحة إدارة الاشتراكات والفواتير للأكاديميات</p>
        </CardContent>
      </Card>
    </div>
  );
} 

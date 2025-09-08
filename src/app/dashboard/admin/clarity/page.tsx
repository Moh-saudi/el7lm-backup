'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useRouter } from 'next/navigation';
import ClarityDashboard from '@/components/analytics/ClarityDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

export default function ClarityAdminPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      if (userData?.accountType !== 'admin') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, userData, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (userData?.accountType !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Shield className="w-5 h-5 mr-2" />
              غير مصرح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                ليس لديك صلاحية للوصول إلى هذه الصفحة. هذه الصفحة مخصصة للمشرفين فقط.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <ClarityDashboard />
    </div>
  );
}

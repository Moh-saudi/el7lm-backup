'use client';

import BulkPaymentPage from '@/components/shared/BulkPaymentPage';
import { useAuth } from '@/lib/firebase/auth-provider';

export default function SharedBulkPaymentPage() {
  const { userData } = useAuth();
  const accountType = userData?.accountType || 'player';
  
  return <BulkPaymentPage accountType={accountType as any} />;
}

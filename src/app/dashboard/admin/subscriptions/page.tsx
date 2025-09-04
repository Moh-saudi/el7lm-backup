import { redirect } from 'next/navigation';

export default function SubscriptionsIndex() {
	// إعادة توجيه إلى صفحة عرض الاشتراكات الافتراضية
	redirect('/dashboard/admin/subscriptions/view');
}





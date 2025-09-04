import { redirect } from 'next/navigation';

export default function AdminReportsIndex() {
	// Redirect to the main financial reports page
	redirect('/dashboard/admin/reports/financial');
}




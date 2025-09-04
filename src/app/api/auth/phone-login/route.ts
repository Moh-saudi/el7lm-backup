import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, initializeFirebaseAdmin } from '@/lib/firebase/admin';
import { getAuth } from 'firebase-admin/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

function normalizePhone(phone: string): string {
	const trimmed = (phone || '').toString().trim();
	if (!trimmed) return '';
	// Ensure starts with + and remove spaces
	if (trimmed.startsWith('+')) return trimmed.replace(/\s+/g, '');
	if (trimmed.startsWith('00')) return `+${trimmed.slice(2)}`.replace(/\s+/g, '');
	return `+${trimmed}`.replace(/\s+/g, '');
}

export async function POST(request: NextRequest) {
	try {
		const { phoneNumber } = await request.json();
		if (!phoneNumber) {
			return NextResponse.json({ success: false, error: 'رقم الهاتف مطلوب' }, { status: 400 });
		}

		const normalized = normalizePhone(phoneNumber);
		if (!normalized) {
			return NextResponse.json({ success: false, error: 'رقم الهاتف غير صالح' }, { status: 400 });
		}

		// Find user by phone in Firestore (client SDK to leverage existing config)
		const candidates = [normalized, normalized.replace(/^\+/, ''), normalized.replace(/^\+?966/, '0')];
		let userId: string | null = null;
		for (const candidate of candidates) {
			const q = query(collection(db, 'users'), where('phone', '==', candidate));
			const snap = await getDocs(q);
			if (!snap.empty) {
				userId = snap.docs[0].id;
				break;
			}
		}

		if (!userId) {
			return NextResponse.json({ success: false, error: 'لم يتم العثور على مستخدم بهذا الرقم' }, { status: 404 });
		}

		// Initialize Admin and create custom token
		initializeFirebaseAdmin();
		const adminAuth = getAuth();
		const customToken = await adminAuth.createCustomToken(userId);

		return NextResponse.json({ success: true, token: customToken, uid: userId });
	} catch (error: any) {
		console.error('❌ Phone login error:', error);
		return NextResponse.json({ success: false, error: 'خطأ في الخادم' }, { status: 500 });
	}
}




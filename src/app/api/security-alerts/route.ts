import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getClientIpFromHeaders } from '@/lib/security/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const clientIp = getClientIpFromHeaders(request.headers);

        await addDoc(collection(db, 'securityAlerts'), {
            ...body,
            _meta: {
                clientIp,
                userAgent: request.headers.get('user-agent') || null,
                createdAt: serverTimestamp(),
                path: '/api/security-alerts'
            },
            priority: body?.priority || 'normal',
            requiresImmediate: !!body?.requiresImmediate
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error?.message || 'Unknown error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Security alerts endpoint is live' });
}



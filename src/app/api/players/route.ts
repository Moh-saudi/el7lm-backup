import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limitCount = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const accountType = searchParams.get('accountType') || '';
    const userId = searchParams.get('userId') || '';

    // بناء الاستعلام
    let q = query(collection(db, 'players'), orderBy('createdAt', 'desc'), limit(limitCount));

    // إضافة فلتر البحث إذا كان موجوداً
    if (search) {
      q = query(q, where('name', '>=', search), where('name', '<=', search + '\uf8ff'));
    }

    // إضافة فلتر نوع الحساب
    if (accountType) {
      q = query(q, where('accountType', '==', accountType));
    }

    // إضافة فلتر المستخدم إذا كان موجوداً
    if (userId) {
      q = query(q, where('created_by', '==', userId));
    }

    const snapshot = await getDocs(q);
    const players = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      success: true,
      data: players,
      total: players.length,
      page,
      limit: limitCount
    });

  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // هنا يمكن إضافة منطق إنشاء لاعب جديد
    // سيتم تنفيذ هذا في المستقبل
    
    return NextResponse.json({
      success: true,
      message: 'Player creation endpoint - to be implemented'
    });

  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
} 

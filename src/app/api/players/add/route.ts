import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // إعداد بيانات اللاعب
    const playerData = {
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      accountType: 'player',
      createdAt: new Date(),
      updatedAt: new Date(),
      isVerified: false,
      isPremium: false,
      // بيانات إضافية
      position: body.position || '',
      age: body.age || 0,
      height: body.height || '',
      weight: body.weight || '',
      nationality: body.nationality || '',
      city: body.city || '',
      country: body.country || '',
      // معلومات الاتصال
      emergency_contact: {
        name: body.emergency_contact?.name || '',
        phone: body.emergency_contact?.phone || '',
        relationship: body.emergency_contact?.relationship || ''
      },
      // معلومات الأكاديمية/النادي
      academy_id: body.academy_id || '',
      club_id: body.club_id || '',
      trainer_id: body.trainer_id || '',
      agent_id: body.agent_id || '',
      // معلومات إضافية
      bio: body.bio || '',
      achievements: body.achievements || [],
      skills: body.skills || [],
      // الصور
      profile_image: body.profile_image || '',
      gallery: body.gallery || []
    };

    // إضافة اللاعب إلى Firestore
    const docRef = await addDoc(collection(db, 'players'), playerData);

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...playerData
      },
      message: 'Player created successfully'
    });

  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create player' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // إرجاع معلومات عن API
    return NextResponse.json({
      success: true,
      message: 'Players Add API',
      endpoints: {
        POST: 'Create a new player',
        GET: 'Get API information'
      },
      required_fields: {
        name: 'Player name (required)',
        email: 'Player email (required)',
        phone: 'Player phone (optional)',
        position: 'Player position (optional)',
        age: 'Player age (optional)',
        nationality: 'Player nationality (optional)'
      }
    });

  } catch (error) {
    console.error('Error in players/add API:', error);
    return NextResponse.json(
      { success: false, error: 'API error' },
      { status: 500 }
    );
  }
} 

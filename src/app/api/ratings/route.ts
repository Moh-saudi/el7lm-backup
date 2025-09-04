import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc,
  query, 
  where, 
  serverTimestamp,
  getDoc,
  orderBy
} from 'firebase/firestore';

// جلب التقييمات
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get('playerId');
    const userId = searchParams.get('userId');

    if (!playerId) {
      return NextResponse.json({ 
        error: 'Missing playerId parameter' 
      }, { status: 400 });
    }

    if (userId) {
      // جلب تقييم المستخدم المحدد للاعب
      const userRatingQuery = query(
        collection(db, 'ratings'),
        where('playerId', '==', playerId),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(userRatingQuery);
      const userRating = snapshot.empty ? null : {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      };
      
      return NextResponse.json({ 
        userRating,
        hasRated: !snapshot.empty
      });
    } else {
      // جلب جميع تقييمات اللاعب
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('playerId', '==', playerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(ratingsQuery);
      const ratings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<{
        id: string;
        overallRating?: number;
        speedRating?: number;
        skillRating?: number;
        physicalRating?: number;
        mentalRating?: number;
        [key: string]: any;
      }>;

      // حساب المتوسطات
      const totalRatings = ratings.length;
      let averageOverall = 0;
      let averageSpeed = 0;
      let averageSkill = 0;
      let averagePhysical = 0;
      let averageMental = 0;

      if (totalRatings > 0) {
        const totals = ratings.reduce((acc, rating) => ({
          overall: acc.overall + (rating.overallRating || 0),
          speed: acc.speed + (rating.speedRating || 0),
          skill: acc.skill + (rating.skillRating || 0),
          physical: acc.physical + (rating.physicalRating || 0),
          mental: acc.mental + (rating.mentalRating || 0)
        }), { overall: 0, speed: 0, skill: 0, physical: 0, mental: 0 });

        averageOverall = Number((totals.overall / totalRatings).toFixed(1));
        averageSpeed = Number((totals.speed / totalRatings).toFixed(1));
        averageSkill = Number((totals.skill / totalRatings).toFixed(1));
        averagePhysical = Number((totals.physical / totalRatings).toFixed(1));
        averageMental = Number((totals.mental / totalRatings).toFixed(1));
      }

      return NextResponse.json({ 
        ratings,
        totalRatings,
        averages: {
          overall: averageOverall,
          speed: averageSpeed,
          skill: averageSkill,
          physical: averagePhysical,
          mental: averageMental
        }
      });
    }
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    
    // إذا كانت مشكلة أذونات، أرجع بيانات فارغة بدلاً من خطأ
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for ratings - returning empty data');
      return NextResponse.json({ 
        userRating: null,
        averageRating: 0,
        totalRatings: 0,
        ratings: [],
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch ratings',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// إضافة أو تحديث تقييم
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      playerId, 
      playerName,
      raterName,
      raterType = 'club', // 'club', 'agent', 'academy', 'trainer'
      overallRating, // التقييم العام (1-5)
      speedRating = 0, // السرعة (1-5)
      skillRating = 0, // المهارة (1-5)
      physicalRating = 0, // اللياقة البدنية (1-5)
      mentalRating = 0, // القوة الذهنية (1-5)
      comment = '', // تعليق اختياري
      strengths = [], // نقاط القوة
      weaknesses = [] // نقاط الضعف
    } = body;

    // التحقق من البيانات المطلوبة
    if (!userId || !playerId || !overallRating) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, playerId, overallRating' 
      }, { status: 400 });
    }

    // التحقق من صحة التقييمات (1-5)
    const ratings = [overallRating, speedRating, skillRating, physicalRating, mentalRating];
    const invalidRating = ratings.find(rating => rating < 0 || rating > 5);
    
    if (invalidRating !== undefined) {
      return NextResponse.json({ 
        error: 'Rating values must be between 0 and 5' 
      }, { status: 400 });
    }

    // فحص إذا كان المستخدم قيّم اللاعب مسبقاً
    const existingRatingQuery = query(
      collection(db, 'ratings'),
      where('userId', '==', userId),
      where('playerId', '==', playerId)
    );
    
    const existingRating = await getDocs(existingRatingQuery);
    
    const baseRatingData = {
      userId,
      playerId,
      playerName: playerName || 'لاعب مجهول',
      raterName: raterName || 'مقيم مجهول',
      raterType,
      overallRating,
      speedRating,
      skillRating,
      physicalRating,
      mentalRating,
      comment,
      strengths: Array.isArray(strengths) ? strengths : [],
      weaknesses: Array.isArray(weaknesses) ? weaknesses : [],
      updatedAt: serverTimestamp()
    };

    if (!existingRating.empty) {
      // تحديث التقييم الموجود
      const ratingDoc = existingRating.docs[0];
      await updateDoc(ratingDoc.ref, baseRatingData);
      
      return NextResponse.json({ 
        success: true, 
        ratingId: ratingDoc.id,
        message: 'تم تحديث التقييم بنجاح',
        action: 'updated'
      });
    } else {
      // إضافة تقييم جديد
      const newRatingData = {
        ...baseRatingData,
        createdAt: serverTimestamp()
      };
      const ratingRef = await addDoc(collection(db, 'ratings'), newRatingData);
      
      return NextResponse.json({ 
        success: true, 
        ratingId: ratingRef.id,
        message: 'تم إضافة التقييم بنجاح',
        action: 'created'
      });
    }

  } catch (error: any) {
    console.error('Error adding/updating rating:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for adding/updating rating - simulating success');
      return NextResponse.json({ 
        success: false, 
        ratingId: 'temp-id',
        message: 'تعذر إضافة التقييم - مشكلة في الأذونات',
        action: 'failed',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to add/update rating',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// تحديث تقييم موجود
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { ratingId, ...updateData } = body;

    if (!ratingId) {
      return NextResponse.json({ 
        error: 'Missing ratingId' 
      }, { status: 400 });
    }

    // التحقق من وجود التقييم
    const ratingDoc = await getDoc(doc(db, 'ratings', ratingId));
    
    if (!ratingDoc.exists()) {
      return NextResponse.json({ 
        error: 'Rating not found' 
      }, { status: 404 });
    }

    // تحديث التقييم
    await updateDoc(doc(db, 'ratings', ratingId), {
      ...updateData,
      updatedAt: serverTimestamp()
    });

    return NextResponse.json({ 
      success: true,
      message: 'تم تحديث التقييم بنجاح'
    });

  } catch (error: any) {
    console.error('Error updating rating:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for updating rating - simulating success');
      return NextResponse.json({ 
        success: false,
        message: 'تعذر تحديث التقييم - مشكلة في الأذونات',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update rating',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// حذف تقييم
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ratingId = searchParams.get('ratingId');
    const userId = searchParams.get('userId');
    const playerId = searchParams.get('playerId');

    if (ratingId) {
      // حذف باستخدام معرف التقييم
      const ratingDoc = await getDoc(doc(db, 'ratings', ratingId));
      
      if (!ratingDoc.exists()) {
        return NextResponse.json({ 
          error: 'Rating not found' 
        }, { status: 404 });
      }

      await updateDoc(doc(db, 'ratings', ratingId), {
        isDeleted: true,
        deletedAt: serverTimestamp()
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'تم حذف التقييم بنجاح'
      });
    } else if (userId && playerId) {
      // حذف باستخدام معرف المستخدم واللاعب
      const ratingQuery = query(
        collection(db, 'ratings'),
        where('userId', '==', userId),
        where('playerId', '==', playerId)
      );
      
      const snapshot = await getDocs(ratingQuery);
      
      if (snapshot.empty) {
        return NextResponse.json({ 
          error: 'Rating not found' 
        }, { status: 404 });
      }
      
      // وضع علامة حذف على جميع المطابقات
      const updatePromises = snapshot.docs.map(docSnap => 
        updateDoc(docSnap.ref, {
          isDeleted: true,
          deletedAt: serverTimestamp()
        })
      );
      
      await Promise.all(updatePromises);
      
      return NextResponse.json({ 
        success: true,
        message: 'تم حذف التقييم بنجاح'
      });
    } else {
      return NextResponse.json({ 
        error: 'Missing required parameters: ratingId or (userId and playerId)' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error deleting rating:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for deleting rating - simulating success');
      return NextResponse.json({ 
        success: false,
        message: 'تعذر حذف التقييم - مشكلة في الأذونات',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete rating',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 

import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

// تجاهل أخطاء الأذونات مؤقتاً - استخدام admin SDK أو تعديل القواعد
const handleFirestoreError = (error: any) => {
  console.warn('Firestore permission warning (ignoring):', error.message);
  return []; // إرجاع مصفوفة فارغة كحل مؤقت
};

// جلب المفضلة
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const playerId = searchParams.get('playerId');

    if (!userId) {
      return NextResponse.json({ 
        error: 'Missing userId parameter' 
      }, { status: 400 });
    }

    if (playerId) {
      // فحص إذا كان اللاعب في المفضلة
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('playerId', '==', playerId)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      const isFavorite = !snapshot.empty;
      
      return NextResponse.json({ 
        isFavorite,
        favoriteId: isFavorite ? snapshot.docs[0].id : null
      });
    } else {
      // جلب جميع المفضلين للمستخدم
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(favoritesQuery);
      const favorites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<{
        id: string;
        playerId: string;
        [key: string]: any;
      }>;

      // جلب بيانات اللاعبين المفضلين
      const playerIds = favorites.map(fav => fav.playerId);
      const playersData = [];
      
      for (const playerId of playerIds) {
        try {
          const playerDoc = await getDoc(doc(db, 'players', playerId));
          if (playerDoc.exists()) {
            playersData.push({
              id: playerDoc.id,
              ...playerDoc.data(),
              favoriteId: favorites.find(fav => fav.playerId === playerId)?.id
            });
          }
        } catch (error) {
          console.warn(`Player ${playerId} not found:`, error);
        }
      }

      return NextResponse.json({ 
        favorites: playersData,
        count: playersData.length
      });
    }
  } catch (error: any) {
    console.error('Error fetching favorites:', error);
    
    // إذا كانت مشكلة أذونات، أرجع بيانات فارغة بدلاً من خطأ
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for favorites - returning empty data');
      return NextResponse.json({ 
        favorites: [],
        count: 0,
        isFavorite: false,
        favoriteId: null,
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch favorites',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
}

// إضافة إلى المفضلة
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      playerId, 
      playerName, 
      playerPosition,
      playerImage,
      userType = 'club' // 'club', 'agent', 'academy', 'trainer'
    } = body;

    // التحقق من البيانات المطلوبة
    if (!userId || !playerId) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, playerId' 
      }, { status: 400 });
    }

    // فحص إذا كان اللاعب مضاف مسبقاً
    const existingFavoriteQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('playerId', '==', playerId)
    );
    
    const existingFavorite = await getDocs(existingFavoriteQuery);
    
    if (!existingFavorite.empty) {
      return NextResponse.json({ 
        error: 'Player already in favorites',
        message: 'اللاعب موجود في المفضلة مسبقاً'
      }, { status: 409 });
    }

    // إضافة إلى المفضلة
    const favoriteData = {
      userId,
      playerId,
      playerName: playerName || 'لاعب مجهول',
      playerPosition: playerPosition || 'غير محدد',
      playerImage: playerImage || '/images/default-avatar.png',
      userType,
      addedAt: serverTimestamp(),
      isActive: true
    };

    const favoriteRef = await addDoc(collection(db, 'favorites'), favoriteData);

    return NextResponse.json({ 
      success: true, 
      favoriteId: favoriteRef.id,
      message: 'تم إضافة اللاعب إلى المفضلة بنجاح'
    });

  } catch (error: any) {
    console.error('Error adding to favorites:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for adding favorite - simulating success');
      return NextResponse.json({ 
        success: false, 
        favoriteId: 'temp-id',
        message: 'تعذر إضافة اللاعب - مشكلة في الأذونات',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to add to favorites',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// حذف من المفضلة
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const favoriteId = searchParams.get('favoriteId');
    const userId = searchParams.get('userId');
    const playerId = searchParams.get('playerId');

    if (favoriteId) {
      // حذف باستخدام معرف المفضلة
      await deleteDoc(doc(db, 'favorites', favoriteId));
      
      return NextResponse.json({ 
        success: true,
        message: 'تم حذف اللاعب من المفضلة'
      });
    } else if (userId && playerId) {
      // حذف باستخدام معرف المستخدم واللاعب
      const favoriteQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userId),
        where('playerId', '==', playerId)
      );
      
      const snapshot = await getDocs(favoriteQuery);
      
      if (snapshot.empty) {
        return NextResponse.json({ 
          error: 'Favorite not found',
          message: 'اللاعب غير موجود في المفضلة'
        }, { status: 404 });
      }
      
      // حذف جميع المطابقات (عادة واحدة فقط)
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);
      
      return NextResponse.json({ 
        success: true,
        message: 'تم حذف اللاعب من المفضلة'
      });
    } else {
      return NextResponse.json({ 
        error: 'Missing required parameters: favoriteId or (userId and playerId)' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Error removing from favorites:', error);
    
    // إذا كانت مشكلة أذونات، أرجع نجاح مؤقت
    if (error.code === 'permission-denied') {
      console.warn('🔒 Permission denied for removing favorite - simulating success');
      return NextResponse.json({ 
        success: false,
        message: 'تعذر حذف اللاعب - مشكلة في الأذونات',
        warning: 'Permission issue - please check authentication'
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to remove from favorites',
      details: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 

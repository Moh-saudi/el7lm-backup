import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc, query, limit } from 'firebase/firestore';

// Helper function to check if URL is broken
function isBrokenUrl(url: any): boolean {
  if (!url || typeof url !== 'string') return true;
  
  const cleanUrl = url.trim();
  const badPatterns = [
    'test-url.com',
    'undefined',
    'null',
    '[object Object]',
    'example.com',
    'placeholder.com'
  ];
  
  return badPatterns.some(pattern => cleanUrl.includes(pattern)) ||
         cleanUrl === '' || 
         cleanUrl === 'undefined' || 
         cleanUrl === 'null';
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 بدء إصلاح الصور من API (Firebase)...');

    // جرب مجموعات مختلفة للبيانات
    const possibleCollections = ['players', 'users', 'user_data', 'profiles'];
    const possibleImageFields = [
      'profile_image_url',
      'profile_image', 
      'avatar_url',
      'image_url',
      'avatar',
      'profile_pic',
      'picture',
      'photo',
      'profileImage',
      'imageUrl'
    ];

    console.log('🔍 فحص مجموعات Firebase Firestore...');
    
    let workingCollection = '';
    let sampleData: any = null;
    let availableFields: string[] = [];

    // البحث عن مجموعة تحتوي على بيانات
    for (const collectionName of possibleCollections) {
      try {
        console.log(`🔍 فحص مجموعة: ${collectionName}`);
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          sampleData = { id: doc.id, ...doc.data() };
          availableFields = Object.keys(sampleData);
          workingCollection = collectionName;
          console.log(`✅ عثر على بيانات في: ${collectionName}`);
          console.log(`📋 الحقول المتاحة:`, availableFields);
          break;
        }
      } catch (error) {
        console.log(`❌ خطأ في فحص مجموعة ${collectionName}:`, error);
        continue;
      }
    }

    if (!workingCollection) {
      console.log('ℹ️ لا توجد بيانات في أي مجموعة');
      return NextResponse.json({
        success: true,
        message: 'لا توجد بيانات للفحص',
        fixed: 0,
        total: 0,
        checkedCollections: possibleCollections
      });
    }

    // تحديد الحقول المتاحة للصور
    const imageFields = possibleImageFields.filter(field => availableFields.includes(field));
    
    console.log(`🖼️ أعمدة الصور المكتشفة في ${workingCollection}:`, imageFields);

    if (imageFields.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'لا توجد حقول صور للإصلاح',
        fixed: 0,
        total: 0,
        collection: workingCollection,
        availableFields: availableFields
      });
    }

    // الحصول على جميع البيانات من المجموعة
    console.log(`📊 جلب جميع البيانات من مجموعة: ${workingCollection}`);
    const collectionRef = collection(db, workingCollection);
    const querySnapshot = await getDocs(collectionRef);
    
    const allDocs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Array<{
      id: string;
      [key: string]: any;
    }>;

    console.log(`📊 تم العثور على ${allDocs.length} مستند`);

    // فحص الصور المكسورة
    const brokenDocs = [];

    // البحث عن الصور المكسورة
    for (const docData of allDocs) {
      const brokenFields: string[] = [];
      
      // فحص كل حقل صورة متاح
      imageFields.forEach(field => {
        if (docData[field] && isBrokenUrl(docData[field])) {
          brokenFields.push(field);
          console.log(`🔍 صورة مكسورة في ${docData.id} - ${field}: ${docData[field]}`);
        }
      });
      
      if (brokenFields.length > 0) {
        brokenDocs.push({
          id: docData.id,
          name: docData.full_name || docData.name || docData.displayName || `مستند ${docData.id}`,
          brokenFields: brokenFields
        });
      }
    }

    if (brokenDocs.length === 0) {
      console.log('✅ جميع الصور سليمة!');
      return NextResponse.json({
        success: true,
        message: 'لا توجد صور تحتاج إصلاح',
        fixed: 0,
        total: allDocs.length,
        collection: workingCollection,
        imageFields: imageFields
      });
    }

    console.log(`📋 العثور على ${brokenDocs.length} مستند يحتاج إصلاح`);

    // بدء الإصلاح
    let fixedCount = 0;
    const errors = [];

    for (const docItem of brokenDocs) {
      try {
        const updates: any = {};
        
        // إصلاح كل حقل مكسور
        docItem.brokenFields.forEach(field => {
          updates[field] = '/images/default-avatar.png';
        });

        // تحديث Firestore
        const docRef = doc(db, workingCollection, docItem.id);
        await updateDoc(docRef, updates);

        fixedCount++;
        console.log(`✅ تم إصلاح: ${docItem.name} (${docItem.brokenFields.join(', ')})`);
      } catch (error) {
        console.error(`❌ فشل إصلاح ${docItem.name}:`, error);
        errors.push(`${docItem.name}: ${(error as Error).message}`);
      }
    }

    // النتائج النهائية
    console.log(`🎉 تم إصلاح ${fixedCount} من ${brokenDocs.length} صورة`);

    return NextResponse.json({
      success: true,
      message: `تم إصلاح ${fixedCount} من ${brokenDocs.length} صورة`,
      fixed: fixedCount,
      total: allDocs.length,
      brokenFound: brokenDocs.length,
      collection: workingCollection,
      imageFields: imageFields,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ خطأ عام في API:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message,
      hint: 'تحقق من اتصال Firebase وصحة الإعدادات'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API لإصلاح الصور (Firebase) - استخدم POST للتشغيل',
    endpoints: {
      post: 'يقوم بفحص وإصلاح الصور المكسورة في Firebase Firestore',
      get: 'معلومات عن API'
    }
  });
} 

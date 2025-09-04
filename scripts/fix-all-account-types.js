// ============================================
// سكريبت إصلاح جميع مشاكل أنواع الحسابات
// ============================================

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, getDocs, doc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4",
  authDomain: "hagzzgo-87884.firebaseapp.com",
  projectId: "hagzzgo-87884",
  storageBucket: "hagzzgo-87884.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixAllAccountTypes() {
  console.log('🔧 بدء إصلاح جميع مشاكل أنواع الحسابات...\n');
  
  try {
    // 1. فحص جميع المستخدمين في مجموعة users
    console.log('1️⃣ فحص جميع المستخدمين...');
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    if (usersSnapshot.empty) {
      console.log('❌ لا توجد مستخدمين في مجموعة users');
      return;
    }
    
    console.log(`✅ تم العثور على ${usersSnapshot.docs.length} مستخدم`);
    
    const problems = [];
    const fixed = [];
    
    // 2. فحص كل مستخدم
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      console.log(`\n🔍 فحص المستخدم: ${userId}`);
      console.log(`   - البريد الإلكتروني: ${userData.email}`);
      console.log(`   - الاسم: ${userData.name || userData.displayName}`);
      console.log(`   - نوع الحساب: ${userData.accountType}`);
      
      // فحص وجود المستخدم في مجموعات أخرى
      const collections = ['players', 'clubs', 'academies', 'agents', 'trainers'];
      const foundInCollections = [];
      
      for (const collectionName of collections) {
        try {
          const docRef = doc(db, collectionName, userId);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            foundInCollections.push({
              collection: collectionName,
              accountType: data.accountType,
              hasData: true
            });
          }
        } catch (error) {
          console.log(`⚠️ خطأ في فحص مجموعة ${collectionName}:`, error.message);
        }
      }
      
      console.log(`   - موجود في ${foundInCollections.length} مجموعة أخرى`);
      
      // تحليل المشاكل
      const currentAccountType = userData.accountType;
      const hasMultipleTypes = foundInCollections.length > 1;
      const hasConflictingTypes = foundInCollections.some(item => 
        item.accountType && item.accountType !== currentAccountType
      );
      
      if (hasMultipleTypes || hasConflictingTypes) {
        console.log(`⚠️ مشكلة: المستخدم موجود في مجموعات متعددة أو أنواع متضاربة`);
        problems.push({
          userId,
          email: userData.email,
          name: userData.name || userData.displayName,
          currentType: currentAccountType,
          foundIn: foundInCollections,
          issue: hasMultipleTypes ? 'multiple_collections' : 'conflicting_types'
        });
      } else {
        console.log(`✅ المستخدم سليم`);
      }
    }
    
    // 3. عرض المشاكل
    console.log('\n📊 ملخص المشاكل:');
    console.log(`   - إجمالي المستخدمين: ${usersSnapshot.docs.length}`);
    console.log(`   - المستخدمين المصابين: ${problems.length}`);
    console.log(`   - المستخدمين السليمين: ${usersSnapshot.docs.length - problems.length}`);
    
    if (problems.length > 0) {
      console.log('\n🔍 تفاصيل المشاكل:');
      problems.forEach((problem, index) => {
        console.log(`\n   ${index + 1}. ${problem.name} (${problem.email})`);
        console.log(`      - المعرف: ${problem.userId}`);
        console.log(`      - النوع الحالي: ${problem.currentType}`);
        console.log(`      - المشكلة: ${problem.issue === 'multiple_collections' ? 'موجود في مجموعات متعددة' : 'أنواع متضاربة'}`);
        console.log(`      - موجود في: ${problem.foundIn.map(item => `${item.collection}(${item.accountType || 'غير محدد'})`).join(', ')}`);
      });
      
      // 4. إصلاح المشاكل
      console.log('\n🔧 بدء إصلاح المشاكل...');
      
      for (const problem of problems) {
        console.log(`\n🔧 إصلاح المستخدم: ${problem.name}`);
        
        try {
          // تحديد النوع الصحيح
          let correctType = problem.currentType;
          
          // إذا كان لديه مدفوعات، فهو لاعب
          const bulkPaymentsRef = collection(db, 'bulkPayments');
          const bulkPaymentsQuery = query(
            bulkPaymentsRef, 
            where('userId', '==', problem.userId),
            where('status', '==', 'completed')
          );
          const bulkPaymentsSnapshot = await getDocs(bulkPaymentsQuery);
          
          if (!bulkPaymentsSnapshot.empty) {
            correctType = 'player';
            console.log(`   ✅ تم تحديد النوع: لاعب (لديه مدفوعات)`);
          } else {
            // استخدام النوع الأكثر شيوعاً في المجموعات
            const typeCounts = {};
            problem.foundIn.forEach(item => {
              if (item.accountType) {
                typeCounts[item.accountType] = (typeCounts[item.accountType] || 0) + 1;
              }
            });
            
            const mostCommonType = Object.keys(typeCounts).reduce((a, b) => 
              typeCounts[a] > typeCounts[b] ? a : b
            );
            
            if (mostCommonType) {
              correctType = mostCommonType;
              console.log(`   ✅ تم تحديد النوع: ${mostCommonType} (الأكثر شيوعاً)`);
            }
          }
          
          // حذف المستخدم من المجموعات الخاطئة
          const correctCollection = correctType === 'player' ? 'players' :
                                  correctType === 'club' ? 'clubs' :
                                  correctType === 'academy' ? 'academies' :
                                  correctType === 'agent' ? 'agents' :
                                  correctType === 'trainer' ? 'trainers' : 'users';
          
          console.log(`   🎯 النوع الصحيح: ${correctType} (مجموعة: ${correctCollection})`);
          
          // حذف من المجموعات الخاطئة
          for (const item of problem.foundIn) {
            if (item.collection !== correctCollection) {
              try {
                await deleteDoc(doc(db, item.collection, problem.userId));
                console.log(`   ✅ تم حذف المستخدم من مجموعة ${item.collection}`);
              } catch (error) {
                console.log(`   ⚠️ خطأ في حذف من ${item.collection}:`, error.message);
              }
            }
          }
          
          // تحديث نوع الحساب في مجموعة users
          await updateDoc(doc(db, 'users', problem.userId), {
            accountType: correctType,
            updatedAt: new Date()
          });
          
          console.log(`   ✅ تم تحديث نوع الحساب إلى ${correctType}`);
          
          fixed.push({
            userId: problem.userId,
            name: problem.name,
            email: problem.email,
            oldType: problem.currentType,
            newType: correctType
          });
          
        } catch (error) {
          console.error(`   ❌ خطأ في إصلاح المستخدم ${problem.name}:`, error);
        }
      }
      
      // 5. عرض النتائج
      console.log('\n📊 نتائج الإصلاح:');
      console.log(`   - تم إصلاح ${fixed.length} من ${problems.length} مستخدم`);
      
      if (fixed.length > 0) {
        console.log('\n✅ المستخدمين الذين تم إصلاحهم:');
        fixed.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} (${item.email})`);
          console.log(`      - من: ${item.oldType} إلى: ${item.newType}`);
        });
      }
      
    } else {
      console.log('✅ لا توجد مشاكل في أنواع الحسابات');
    }
    
    // 6. فحص نهائي
    console.log('\n6️⃣ فحص نهائي...');
    const finalCheck = await getDocs(usersRef);
    let finalProblems = 0;
    
    for (const userDoc of finalCheck.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const collections = ['players', 'clubs', 'academies', 'agents', 'trainers'];
      let foundCount = 0;
      
      for (const collectionName of collections) {
        try {
          const docRef = doc(db, collectionName, userId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) foundCount++;
        } catch (error) {
          // تجاهل الأخطاء
        }
      }
      
      if (foundCount > 1) {
        finalProblems++;
      }
    }
    
    console.log(`📊 الفحص النهائي:`);
    console.log(`   - إجمالي المستخدمين: ${finalCheck.docs.length}`);
    console.log(`   - المستخدمين المصابين: ${finalProblems}`);
    console.log(`   - المستخدمين السليمين: ${finalCheck.docs.length - finalProblems}`);
    
    if (finalProblems === 0) {
      console.log('\n🎉 تم إصلاح جميع مشاكل أنواع الحسابات بنجاح!');
    } else {
      console.log(`\n⚠️ لا يزال هناك ${finalProblems} مستخدم يحتاج إصلاح`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح أنواع الحسابات:', error);
  }
}

// تشغيل الإصلاح
fixAllAccountTypes().then(() => {
  console.log('\n✅ انتهى إصلاح جميع أنواع الحسابات');
  process.exit(0);
}).catch(error => {
  console.error('❌ خطأ في تشغيل السكريبت:', error);
  process.exit(1);
}); 

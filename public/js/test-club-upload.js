// اختبار رفع صور النادي وتشخيص مشاكل Supabase
console.log('🏢 تحميل أدوات تشخيص رفع صور النادي...');

// دالة اختبار الاتصال بـ Supabase
async function testSupabaseConnection() {
    console.log('🔗 اختبار الاتصال بـ Supabase...');
    
    try {
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase غير متاح');
        }

        // اختبار الوصول للبوكت
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        if (bucketsError) {
            console.error('❌ خطأ في جلب البوكتات:', bucketsError);
            return false;
        }

        console.log('✅ البوكتات المتاحة:', buckets);
        
        // التحقق من وجود بوكت clubavatar
        const clubavatarBucket = buckets.find(bucket => bucket.name === 'clubavatar');
        if (!clubavatarBucket) {
            console.error('❌ بوكت clubavatar غير موجود');
            return false;
        }

        console.log('✅ بوكت clubavatar موجود:', clubavatarBucket);
        return true;

    } catch (error) {
        console.error('❌ خطأ في الاتصال بـ Supabase:', error);
        return false;
    }
}

// دالة اختبار السياسات
async function testBucketPolicies() {
    console.log('🔒 اختبار سياسات البوكت...');
    
    try {
        // محاولة قراءة ملف موجود
        const { data: files, error: listError } = await supabase.storage
            .from('clubavatar')
            .list('', { limit: 1 });

        if (listError) {
            console.error('❌ خطأ في قراءة الملفات:', listError);
            return false;
        }

        console.log('✅ يمكن قراءة الملفات:', files);

        // اختبار رفع ملف تجريبي
        const testFile = new Blob(['test'], { type: 'text/plain' });
        const testFileName = `test_${Date.now()}.txt`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('clubavatar')
            .upload(`test/${testFileName}`, testFile);

        if (uploadError) {
            console.error('❌ خطأ في رفع الملف:', uploadError);
            return false;
        }

        console.log('✅ تم رفع الملف التجريبي:', uploadData);

        // حذف الملف التجريبي
        await supabase.storage
            .from('clubavatar')
            .remove([`test/${testFileName}`]);

        console.log('✅ تم حذف الملف التجريبي');
        return true;

    } catch (error) {
        console.error('❌ خطأ في اختبار السياسات:', error);
        return false;
    }
}

// دالة اختبار رفع صورة
async function testImageUpload() {
    console.log('🖼️ اختبار رفع صورة...');
    
    try {
        // إنشاء صورة تجريبية (1x1 pixel)
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(0, 0, 1, 1);
        
        // تحويل إلى blob
        const testImageBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });

        const testFileName = `test_image_${Date.now()}.png`;
        const testPath = `test/${testFileName}`;

        // رفع الصورة
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('clubavatar')
            .upload(testPath, testImageBlob, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ خطأ في رفع الصورة:', uploadError);
            return false;
        }

        console.log('✅ تم رفع الصورة:', uploadData);

        // الحصول على الرابط العام
        const { data: { publicUrl } } = supabase.storage
            .from('clubavatar')
            .getPublicUrl(testPath);

        console.log('✅ الرابط العام:', publicUrl);

        // حذف الصورة التجريبية
        await supabase.storage
            .from('clubavatar')
            .remove([testPath]);

        console.log('✅ تم حذف الصورة التجريبية');
        return true;

    } catch (error) {
        console.error('❌ خطأ في اختبار رفع الصورة:', error);
        return false;
    }
}

// دالة اختبار مسار رفع النادي الكامل
async function testClubUploadFlow() {
    console.log('🏟️ اختبار مسار رفع النادي الكامل...');
    
    try {
        // الحصول على معرف المستخدم
        const user = firebase.auth().currentUser;
        if (!user) {
            throw new Error('المستخدم غير مسجل دخول');
        }

        console.log('👤 معرف المستخدم:', user.uid);

        // إنشاء صورة تجريبية للوجو
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#0066CC';
        ctx.fillRect(0, 0, 100, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LOGO', 50, 55);
        
        const logoBlob = await new Promise(resolve => {
            canvas.toBlob(resolve, 'image/png');
        });

        const timestamp = Date.now();
        const fileName = `${timestamp}.png`;
        const filePath = `${user.uid}/logo/${fileName}`;

        console.log('📁 مسار الملف:', filePath);

        // رفع اللوجو
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('clubavatar')
            .upload(filePath, logoBlob, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error('❌ خطأ في رفع اللوجو:', uploadError);
            return false;
        }

        console.log('✅ تم رفع اللوجو:', uploadData);

        // الحصول على الرابط العام
        const { data: { publicUrl } } = supabase.storage
            .from('clubavatar')
            .getPublicUrl(filePath);

        console.log('✅ رابط اللوجو:', publicUrl);

        // تحديث بيانات النادي في Firebase
        const clubRef = firebase.firestore().collection('clubs').doc(user.uid);
        await clubRef.update({
            logo: filePath // حفظ المسار وليس الرابط الكامل
        });

        console.log('✅ تم تحديث بيانات النادي في Firebase');

        // حذف الملف التجريبي
        await supabase.storage
            .from('clubavatar')
            .remove([filePath]);

        console.log('✅ تم حذف الملف التجريبي');
        return true;

    } catch (error) {
        console.error('❌ خطأ في اختبار مسار النادي:', error);
        return false;
    }
}

// دالة التشخيص الشامل
async function fullClubUploadDiagnosis() {
    console.log('🔍 بدء التشخيص الشامل لرفع صور النادي...\n');

    const results = [];

    // 1. اختبار الاتصال بـ Supabase
    console.log('1️⃣ اختبار الاتصال بـ Supabase...');
    const supabaseConnected = await testSupabaseConnection();
    results.push(`Supabase: ${supabaseConnected ? '✅' : '❌'}`);

    if (!supabaseConnected) {
        console.log('\n❌ فشل الاتصال بـ Supabase - توقف التشخيص');
        return results;
    }

    // 2. اختبار السياسات
    console.log('\n2️⃣ اختبار سياسات البوكت...');
    const policiesOk = await testBucketPolicies();
    results.push(`السياسات: ${policiesOk ? '✅' : '❌'}`);

    // 3. اختبار رفع الصور
    console.log('\n3️⃣ اختبار رفع الصور...');
    const imageUploadOk = await testImageUpload();
    results.push(`رفع الصور: ${imageUploadOk ? '✅' : '❌'}`);

    // 4. اختبار مسار النادي الكامل
    console.log('\n4️⃣ اختبار مسار النادي الكامل...');
    const clubFlowOk = await testClubUploadFlow();
    results.push(`مسار النادي: ${clubFlowOk ? '✅' : '❌'}`);

    // النتيجة النهائية
    console.log('\n📊 ملخص النتائج:');
    console.log('===================');
    results.forEach(result => console.log(result));
    
    const allOk = results.every(result => result.includes('✅'));
    console.log(`\n🎯 التقييم النهائي: ${allOk ? '✅ جميع الاختبارات نجحت' : '❌ توجد مشاكل'}`);
    
    if (!allOk) {
        console.log('\n💡 الحلول المقترحة:');
        if (!supabaseConnected) {
            console.log('- تحقق من إعدادات Supabase');
        }
        if (!policiesOk) {
            console.log('- أضف سياسات الأمان للبوكت');
            console.log('- تأكد من أن البوكت public');
        }
        if (!imageUploadOk) {
            console.log('- تحقق من أذونات الرفع');
        }
        if (!clubFlowOk) {
            console.log('- تحقق من إعدادات Firebase');
        }
    }

    return results;
}

// دالة لإنشاء سياسات Supabase الصحيحة
function generateSupabasePolicies() {
    console.log('📝 سياسات Supabase المطلوبة لبوكت clubavatar:');
    console.log('=====================================');
    
    const policies = [
        {
            name: 'Enable read access for all users',
            operation: 'SELECT',
            sql: `
-- السياسة: السماح بقراءة الملفات للجميع
CREATE POLICY "Enable read access for all users" ON storage.objects FOR SELECT USING (bucket_id = 'clubavatar');
            `
        },
        {
            name: 'Enable insert for authenticated users only',
            operation: 'INSERT', 
            sql: `
-- السياسة: السماح برفع الملفات للمستخدمين المصادقين فقط
CREATE POLICY "Enable insert for authenticated users only" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'clubavatar' AND auth.role() = 'authenticated');
            `
        },
        {
            name: 'Enable update for users based on user_id',
            operation: 'UPDATE',
            sql: `
-- السياسة: السماح بتحديث الملفات لصاحب الملف فقط
CREATE POLICY "Enable update for users based on user_id" ON storage.objects FOR UPDATE USING (bucket_id = 'clubavatar' AND auth.uid()::text = (storage.foldername(name))[1]);
            `
        },
        {
            name: 'Enable delete for users based on user_id',
            operation: 'DELETE',
            sql: `
-- السياسة: السماح بحذف الملفات لصاحب الملف فقط  
CREATE POLICY "Enable delete for users based on user_id" ON storage.objects FOR DELETE USING (bucket_id = 'clubavatar' AND auth.uid()::text = (storage.foldername(name))[1]);
            `
        }
    ];

    policies.forEach((policy, index) => {
        console.log(`\n${index + 1}. ${policy.name} (${policy.operation}):`);
        console.log(policy.sql);
    });

    console.log('\n📋 خطوات التطبيق:');
    console.log('1. اذهب إلى Supabase Dashboard');
    console.log('2. اختر Storage > Policies');
    console.log('3. احذف السياسات الحالية الخاطئة');
    console.log('4. أضف السياسات الجديدة واحدة تلو الأخرى');
    console.log('5. تأكد من أن البوكت "public"');
}

// تسجيل الدوال في النطاق العام
window.testSupabaseConnection = testSupabaseConnection;
window.testBucketPolicies = testBucketPolicies;
window.testImageUpload = testImageUpload;
window.testClubUploadFlow = testClubUploadFlow;
window.fullClubUploadDiagnosis = fullClubUploadDiagnosis;
window.generateSupabasePolicies = generateSupabasePolicies;

console.log('✅ تم تحميل أدوات تشخيص رفع صور النادي');
console.log('📞 الأوامر المتاحة:');
console.log('  - testSupabaseConnection() - اختبار الاتصال');
console.log('  - testBucketPolicies() - اختبار السياسات');
console.log('  - testImageUpload() - اختبار رفع الصور');
console.log('  - testClubUploadFlow() - اختبار مسار النادي');
console.log('  - fullClubUploadDiagnosis() - تشخيص شامل');
console.log('  - generateSupabasePolicies() - عرض السياسات المطلوبة');

// تشغيل التشخيص تلقائياً
console.log('\n🚀 بدء التشخيص التلقائي...');
// fullClubUploadDiagnosis(); 

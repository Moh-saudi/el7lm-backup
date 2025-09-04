// Test script for Supabase buckets and upload functionality
console.log('🔍 Starting comprehensive Supabase buckets test...');

// Import Supabase client (this would be available in the browser)
// const { supabase } = window.supabaseClient || {};

// Test configuration
const EXPECTED_BUCKETS = {
  CLUBS: 'playerclub',
  TRAINERS: 'playertrainer', 
  AGENTS: 'playeragent',
  ACADEMIES: 'playeracademy',
  FALLBACK: ['avatars', 'wallet', 'clubavatar', 'videos', 'documents']
};

// Test functions
async function testSupabaseBuckets() {
  console.log('📋 Testing Supabase Storage Buckets...');
  
  try {
    // This should be run in browser console where supabase is available
    console.log(`
🔧 MANUAL TESTING INSTRUCTIONS:
==================================

1. اذهب إلى صفحة تعديل اللاعب: 
   http://localhost:3000/dashboard/club/players/add?edit=hChYVnu04cXe3KK8JJQu

2. افتح Developer Tools (F12) واذهب إلى Console

3. نفذ هذا الكود لفحص البوكتات:

// فحص البوكتات المتاحة
const { data: buckets, error } = await supabase.storage.listBuckets();
console.log('📦 Available buckets:', buckets);
if (error) console.error('❌ Error listing buckets:', error);

// فحص كل بوكت مطلوب
const requiredBuckets = ['playerclub', 'playertrainer', 'playeragent', 'playeracademy'];
for (const bucket of requiredBuckets) {
  try {
    const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1 });
    if (error) {
      console.error(\`❌ Bucket '\${bucket}' not accessible:, error.message\`);
    } else {
      console.log(\`✅ Bucket '\${bucket}' is accessible\`);
    }
  } catch (e) {
    console.error(\`💥 Bucket '\${bucket}' test failed:\`, e.message);
  }
}

4. اختبار رفع ملف تجريبي:

// إنشاء ملف تجريبي
const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
const testPath = \`test-\${Date.now()}.txt\`;

// محاولة الرفع إلى بوكت الأندية
try {
  const { data, error } = await supabase.storage
    .from('playerclub')
    .upload(testPath, testFile, { upsert: true });
    
  if (error) {
    console.error('❌ Upload failed:', error.message);
  } else {
    console.log('✅ Upload successful:', data);
    
    // الحصول على الرابط العام
    const { data: { publicUrl } } = supabase.storage
      .from('playerclub')
      .getPublicUrl(testPath);
    console.log('🔗 Public URL:', publicUrl);
  }
} catch (e) {
  console.error('💥 Upload test failed:', e.message);
}

5. فحص الكونسول لمعرفة المشاكل المحددة

==================================

🚨 COMMON ISSUES TO CHECK:
==================================

1. البوكتات غير موجودة في Supabase Dashboard
2. عدم وجود صلاحيات (RLS Policies) صحيحة
3. مشاكل في أسماء البوكتات (case-sensitive)
4. مشاكل في إعدادات CORS
5. انتهاء صلاحية API Key

==================================

💡 SOLUTIONS:
==================================

إذا كانت البوكتات غير موجودة:
1. اذهب إلى Supabase Dashboard
2. Storage -> Buckets 
3. أنشئ البوكتات المطلوبة:
   - playerclub
   - playertrainer
   - playeragent
   - playeracademy

إذا كانت الصلاحيات مشكلة:
1. في Storage -> Policies
2. أنشئ policies للسماح بالرفع والقراءة

==================================
    `);
    
  } catch (error) {
    console.error('❌ Test setup failed:', error);
  }
}

// دالة لاختبار دوال الرفع المحددة
async function testClubUploadFunctions() {
  console.log('🏟️ Testing Club Upload Functions...');
  
  console.log(`
🔧 CLUB UPLOAD FUNCTIONS TEST:
==================================

في console المتصفح، اختبر هذه الدوال:

// اختبار رفع صورة البروفايل
const profileImageFile = new File(['fake image'], 'profile.jpg', { type: 'image/jpeg' });
try {
  const result = await window.clubUpload.profileImage(profileImageFile, 'test-user-id');
  console.log('✅ Profile image upload:', result);
} catch (error) {
  console.error('❌ Profile image upload failed:', error);
}

// اختبار رفع صورة إضافية  
const additionalImageFile = new File(['fake image'], 'additional.jpg', { type: 'image/jpeg' });
try {
  const result = await window.clubUpload.additionalImage(additionalImageFile, 'test-user-id');
  console.log('✅ Additional image upload:', result);
} catch (error) {
  console.error('❌ Additional image upload failed:', error);
}

// اختبار رفع مستند/فيديو
const videoFile = new File(['fake video'], 'video.mp4', { type: 'video/mp4' });
try {
  const result = await window.clubUpload.document(videoFile, 'test-user-id', 'video');
  console.log('✅ Document/Video upload:', result);
} catch (error) {
  console.error('❌ Document/Video upload failed:', error);
}

==================================
  `);
}

// دالة لفحص الأخطاء الشائعة
async function checkCommonIssues() {
  console.log('🔍 Checking Common Issues...');
  
  console.log(`
🚨 COMMON ISSUES CHECKLIST:
==================================

1. ✅ هل تم إنشاء البوكتات في Supabase Dashboard؟
   - playerclub
   - playertrainer  
   - playeragent
   - playeracademy

2. ✅ هل تم إعداد Storage Policies بشكل صحيح؟
   - Policy للقراءة العامة
   - Policy للرفع للمستخدمين المسجلين

3. ✅ هل API Key صحيح وغير منتهي الصلاحية؟

4. ✅ هل URL الخاص بـ Supabase صحيح؟

5. ✅ هل تم تعديل CORS settings إذا لزم الأمر؟

6. ✅ هل البوكتات لها الصلاحيات المناسبة؟

==================================

💡 QUICK FIX COMMANDS:
==================================

لإنشاء البوكتات من SQL Editor في Supabase:

-- إنشاء البوكتات
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('playerclub', 'playerclub', true),
  ('playertrainer', 'playertrainer', true),
  ('playeragent', 'playeragent', true),
  ('playeracademy', 'playeracademy', true);

-- إعداد policies للقراءة العامة
CREATE POLICY "Allow public read access" ON storage.objects FOR SELECT USING (true);

-- إعداد policies للرفع للمستخدمين المسجلين
CREATE POLICY "Allow authenticated uploads" ON storage.objects FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

==================================
  `);
}

// تنفيذ الاختبارات
testSupabaseBuckets();
testClubUploadFunctions();
checkCommonIssues();

console.log('🎯 Supabase buckets test completed. Check the instructions above!'); 

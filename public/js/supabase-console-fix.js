// 🚀 إصلاح سريع لصور Supabase - للتشغيل في Console
// انسخ والصق في Developer Console

(async function supabaseFix() {
    console.log('🚀 بدء إصلاح صور Supabase...');
    
    try {
        // إعدادات Supabase
        const SUPABASE_URL = 'https://ekyerljzfokqimbabzxm.supabase.co';
        const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY';
        
        // تحميل Supabase
        console.log('📱 تحميل Supabase Client...');
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        
        console.log('✅ تم تحميل Supabase');
        
        // فحص البيانات
        console.log('🔍 فحص جدول اللاعبين...');
        const { data: players, error } = await supabase
            .from('players')
            .select('id, full_name, profile_image_url, profile_image, avatar_url');
        
        if (error) {
            throw new Error(`خطأ في قاعدة البيانات: ${error.message}`);
        }
        
        console.log(`📊 تم فحص ${players.length} لاعب`);
        
        // البحث عن الصور المكسورة
        const brokenPlayers = [];
        
        function isBrokenUrl(url) {
            if (!url || typeof url !== 'string') return true;
            
            const cleanUrl = url.trim();
            const badPatterns = [
                'test-url.com',
                'undefined',
                'null',
                '[object Object]',
                'example.com'
            ];
            
            // فحص الأنماط السيئة
            if (badPatterns.some(pattern => cleanUrl.includes(pattern))) {
                return true;
            }
            
            // فحص روابط Supabase المكسورة
            if (cleanUrl.includes('supabase.co')) {
                if (cleanUrl.includes('/undefined/') || 
                    cleanUrl.includes('/null/') ||
                    cleanUrl.includes('profile.undefined') ||
                    cleanUrl.includes('profile.null')) {
                    return true;
                }
            }
            
            return cleanUrl === '' || cleanUrl === 'undefined' || cleanUrl === 'null';
        }
        
        // فحص كل لاعب
        players.forEach(player => {
            const brokenFields = [];
            
            if (isBrokenUrl(player.profile_image_url)) {
                brokenFields.push('profile_image_url');
            }
            
            if (isBrokenUrl(player.profile_image)) {
                brokenFields.push('profile_image');
            }
            
            if (isBrokenUrl(player.avatar_url)) {
                brokenFields.push('avatar_url');
            }
            
            if (brokenFields.length > 0) {
                brokenPlayers.push({
                    id: player.id,
                    name: player.full_name || 'لاعب مجهول',
                    brokenFields: brokenFields
                });
                
                console.log(`⚠️ ${player.full_name || player.id}: ${brokenFields.join(', ')}`);
            }
        });
        
        if (brokenPlayers.length === 0) {
            console.log('🎉 جميع الصور سليمة! لا حاجة للإصلاح');
            return { success: true, message: 'لا توجد مشاكل' };
        }
        
        console.log(`📋 تم العثور على ${brokenPlayers.length} لاعب يحتاج إصلاح`);
        
        // بدء عملية الإصلاح
        console.log('🛠️ بدء الإصلاح...');
        
        let fixedCount = 0;
        
        for (const player of brokenPlayers) {
            const updates = {};
            
            // إصلاح كل حقل مكسور
            player.brokenFields.forEach(field => {
                updates[field] = '/images/default-avatar.png';
            });
            
            // تحديث قاعدة البيانات
            const { error: updateError } = await supabase
                .from('players')
                .update(updates)
                .eq('id', player.id);
            
            if (updateError) {
                console.error(`❌ فشل إصلاح ${player.name}:`, updateError.message);
            } else {
                fixedCount++;
                console.log(`✅ تم إصلاح: ${player.name}`);
            }
        }
        
        // النتائج النهائية
        console.log('\n🎉 تم إنهاء عملية الإصلاح!');
        console.log(`📊 النتائج:`);
        console.log(`   🔍 اللاعبين المفحوصين: ${players.length}`);
        console.log(`   ⚠️ مشاكل وُجدت: ${brokenPlayers.length}`);
        console.log(`   ✅ تم إصلاحها: ${fixedCount}`);
        
        if (fixedCount > 0) {
            console.log('\n💡 خطوات ما بعد الإصلاح:');
            console.log('1. أعد تشغيل خادم Next.js');
            console.log('2. امسح cache المتصفح (Ctrl+Shift+R)');
            console.log('3. تحقق من اختفاء أخطاء الصور');
            
            console.log('\n🔄 سيتم إعادة تحميل الصفحة خلال 5 ثواني...');
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
        
        return {
            success: true,
            totalPlayers: players.length,
            brokenFound: brokenPlayers.length,
            fixed: fixedCount
        };
        
    } catch (error) {
        console.error('❌ خطأ في عملية الإصلاح:', error);
        console.log('\n🔧 حلول ممكنة:');
        console.log('1. تأكد من اتصال الإنترنت');
        console.log('2. تحقق من صحة مفاتيح Supabase');
        console.log('3. تأكد من وجود جدول "players" في قاعدة البيانات');
        
        return {
            success: false,
            error: error.message
        };
    }
})();

// رسالة ترحيبية
console.log('🔧 أداة إصلاح صور Supabase محملة ومستعدة!');
console.log('💡 ستعمل الأداة تلقائياً، أو يمكنك إعادة تشغيلها بنسخ الكود مرة أخرى'); 

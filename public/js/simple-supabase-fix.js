// 🚀 إصلاح بسيط لصور Supabase - بدون CDN
// انسخ والصق هذا الكود في Developer Console

console.log('🚀 بدء الإصلاح البسيط لصور Supabase...');

// حل بديل لا يعتمد على تحميل مكتبات خارجية
(async function simpleSupabaseFix() {
    try {
        console.log('🔍 محاولة الإصلاح عبر API...');
        
        // إنشاء payload للبيانات المكسورة
        const brokenPatterns = [
            'test-url.com',
            'undefined',
            'null',
            '[object Object]',
            'example.com',
            'placeholder.com'
        ];
        
        // تحضير البيانات
        const fixData = {
            action: 'bulk_fix_images',
            patterns: brokenPatterns,
            replacement: '/images/default-avatar.png',
            table: 'players',
            fields: ['profile_image_url', 'profile_image', 'avatar_url']
        };
        
        console.log('📡 إرسال طلب الإصلاح...');
        
        // محاولة استخدام fetch مع endpoint مخصص
        try {
            const response = await fetch('/api/fix-supabase-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(fixData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('📊 نتائج الإصلاح:', result);
                
                if (result.success) {
                    console.log(`✅ تم إصلاح ${result.fixed || 0} صورة!`);
                    
                    if (result.fixed > 0) {
                        console.log('🎉 الإصلاح مكتمل!');
                        console.log('💡 خطوات ما بعد الإصلاح:');
                        console.log('   1. أعد تشغيل الخادم: npm run dev');
                        console.log('   2. امسح cache المتصفح: Ctrl+Shift+R');
                        console.log('   3. تحقق من اختفاء أخطاء الصور');
                        
                        setTimeout(() => {
                            console.log('🔄 إعادة تحميل الصفحة...');
                            window.location.reload();
                        }, 3000);
                    } else {
                        console.log('ℹ️ لا توجد صور تحتاج إصلاح');
                    }
                } else {
                    console.error('❌ فشل الإصلاح:', result.error);
                }
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (fetchError) {
            console.log('⚠️ API غير متوفر، محاولة حل بديل...');
            
            // حل بديل: إصلاح مباشر
            await directImageFix();
        }
        
    } catch (error) {
        console.error('❌ خطأ عام:', error);
        console.log('\n🔧 حلول بديلة:');
        console.log('1. تأكد من تشغيل الخادم بشكل صحيح');
        console.log('2. جرب إعادة تحميل الصفحة والمحاولة مرة أخرى');
        console.log('3. تحقق من اتصال الإنترنت');
    }
})();

// دالة الإصلاح المباشر (fallback)
async function directImageFix() {
    console.log('🔧 تشغيل الإصلاح المباشر...');
    
    try {
        // محاولة إنشاء SQL query مباشر للإصلاح
        const updateQueries = [
            {
                field: 'profile_image_url',
                pattern: 'test-url.com',
                replacement: '/images/default-avatar.png'
            },
            {
                field: 'profile_image_url', 
                pattern: 'undefined',
                replacement: '/images/default-avatar.png'
            },
            {
                field: 'profile_image_url',
                pattern: 'null',
                replacement: '/images/default-avatar.png'
            },
            {
                field: 'profile_image',
                pattern: 'test-url.com',
                replacement: '/images/default-avatar.png'
            },
            {
                field: 'profile_image',
                pattern: 'undefined', 
                replacement: '/images/default-avatar.png'
            },
            {
                field: 'profile_image',
                pattern: 'null',
                replacement: '/images/default-avatar.png'
            }
        ];
        
        console.log('📝 SQL queries للإصلاح:');
        
        updateQueries.forEach((query, index) => {
            const sql = `UPDATE players SET ${query.field} = '${query.replacement}' WHERE ${query.field} LIKE '%${query.pattern}%';`;
            console.log(`${index + 1}. ${sql}`);
        });
        
        console.log('\n💡 لتطبيق هذه التحديثات:');
        console.log('1. اذهب إلى Supabase Dashboard');
        console.log('2. فتح SQL Editor');
        console.log('3. انسخ والصق الـ SQL queries أعلاه');
        console.log('4. شغل كل query على حدة');
        console.log('5. أعد تشغيل التطبيق');
        
        // محاولة تشغيل تحديث محلي إذا توفر client
        if (window.supabase) {
            console.log('🔧 محاولة إصلاح محلي...');
            
            const { data: players, error } = await window.supabase
                .from('players')
                .select('id, full_name, profile_image_url, profile_image, avatar_url');
            
            if (!error && players) {
                console.log(`📊 تم العثور على ${players.length} لاعب`);
                
                let fixedCount = 0;
                
                for (const player of players) {
                    const updates = {};
                    let needsUpdate = false;
                    
                    const isBroken = (url) => {
                        if (!url || typeof url !== 'string') return true;
                        return url.includes('test-url.com') || 
                               url.includes('undefined') || 
                               url.includes('null') ||
                               url.includes('[object Object]');
                    };
                    
                    if (isBroken(player.profile_image_url)) {
                        updates.profile_image_url = '/images/default-avatar.png';
                        needsUpdate = true;
                    }
                    
                    if (isBroken(player.profile_image)) {
                        updates.profile_image = '/images/default-avatar.png';
                        needsUpdate = true;
                    }
                    
                    if (isBroken(player.avatar_url)) {
                        updates.avatar_url = '/images/default-avatar.png';
                        needsUpdate = true;
                    }
                    
                    if (needsUpdate) {
                        const { error: updateError } = await window.supabase
                            .from('players')
                            .update(updates)
                            .eq('id', player.id);
                        
                        if (!updateError) {
                            fixedCount++;
                            console.log(`✅ تم إصلاح: ${player.full_name || player.id}`);
                        } else {
                            console.error(`❌ فشل إصلاح ${player.full_name}:`, updateError);
                        }
                    }
                }
                
                console.log(`\n🎉 تم إصلاح ${fixedCount} صورة محلياً!`);
                
                if (fixedCount > 0) {
                    console.log('💡 أعد تشغيل الخادم لرؤية النتائج');
                    setTimeout(() => window.location.reload(), 3000);
                }
            }
        }
        
    } catch (directError) {
        console.error('❌ خطأ في الإصلاح المباشر:', directError);
    }
}

// إضافة helper functions
window.fixSupabaseImages = async function() {
    console.log('🚀 تشغيل إصلاح صور Supabase...');
    await simpleSupabaseFix();
};

window.checkSupabaseImages = async function() {
    console.log('🔍 فحص صور Supabase...');
    
    if (window.supabase) {
        try {
            const { data: players, error } = await window.supabase
                .from('players')
                .select('id, full_name, profile_image_url, profile_image, avatar_url');
            
            if (!error && players) {
                console.log(`📊 فحص ${players.length} لاعب...`);
                
                let brokenCount = 0;
                const brokenPlayers = [];
                
                players.forEach(player => {
                    const issues = [];
                    
                    const isBroken = (url) => {
                        if (!url || typeof url !== 'string') return true;
                        return url.includes('test-url.com') || 
                               url.includes('undefined') || 
                               url.includes('null') ||
                               url.includes('[object Object]');
                    };
                    
                    if (isBroken(player.profile_image_url)) issues.push('profile_image_url');
                    if (isBroken(player.profile_image)) issues.push('profile_image');
                    if (isBroken(player.avatar_url)) issues.push('avatar_url');
                    
                    if (issues.length > 0) {
                        brokenCount++;
                        brokenPlayers.push({
                            name: player.full_name || player.id,
                            issues: issues
                        });
                        console.log(`⚠️ ${player.full_name || player.id}: ${issues.join(', ')}`);
                    }
                });
                
                if (brokenCount === 0) {
                    console.log('✅ جميع الصور سليمة!');
                } else {
                    console.log(`📋 العثور على ${brokenCount} صورة مكسورة`);
                    console.log('💡 استخدم window.fixSupabaseImages() للإصلاح');
                }
                
                return { total: players.length, broken: brokenCount, details: brokenPlayers };
            }
        } catch (error) {
            console.error('❌ خطأ في الفحص:', error);
        }
    } else {
        console.log('❌ Supabase client غير متوفر');
    }
};

console.log('\n✅ تم تحميل أدوات إصلاح Supabase!');
console.log('🎯 الأوامر المتاحة:');
console.log('   - window.checkSupabaseImages() : فحص الصور');
console.log('   - window.fixSupabaseImages() : إصلاح الصور');

// تشغيل الإصلاح تلقائياً
console.log('\n🚀 تشغيل الإصلاح التلقائي...');
setTimeout(() => {
    window.fixSupabaseImages();
}, 1000); 

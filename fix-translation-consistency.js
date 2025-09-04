const fs = require('fs');
const path = require('path');

// الملفات التي تحتاج إلى إصلاح
const filesToFix = [
  'src/components/shared/LanguageSwitcher.tsx',
  'src/components/layout/ModernUnifiedHeader.tsx',
  'src/components/layout/DashboardHeader.tsx',
  'src/components/layout/DashboardFontWrapper.tsx',
  'src/components/layout/UnifiedSidebar.tsx',
  'src/components/layout/AdminFooter.tsx',
  'src/components/shared/HeaderWithTranslation.tsx',
  'src/components/shared/FontProvider.tsx'
];

// التغييرات المطلوبة
const replacements = [
  // تغيير language إلى locale
  { from: 'language', to: 'locale' },
  { from: 'setLanguage', to: 'updateTranslation' },
  { from: 'direction', to: 'isRTL' },
  { from: 'tWithVars', to: 't' },
  { from: 'useTranslations', to: 'useTranslation' }
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // تطبيق التغييرات
    replacements.forEach(({ from, to }) => {
      const regex = new RegExp(`\\b${from}\\b`, 'g');
      if (content.match(regex)) {
        content = content.replace(regex, to);
        hasChanges = true;
        console.log(`✅ تم تغيير ${from} إلى ${to} في ${filePath}`);
      }
    });

    // إصلاحات خاصة
    if (content.includes('language === \'ar\'')) {
      content = content.replace(/language === 'ar'/g, 'locale === \'ar\'');
      hasChanges = true;
    }

    if (content.includes('language === \'en\'')) {
      content = content.replace(/language === 'en'/g, 'locale === \'en\'');
      hasChanges = true;
    }

    if (content.includes('direction === \'rtl\'')) {
      content = content.replace(/direction === 'rtl'/g, 'isRTL');
      hasChanges = true;
    }

    if (content.includes('direction === \'ltr\'')) {
      content = content.replace(/direction === 'ltr'/g, '!isRTL');
      hasChanges = true;
    }

    // حفظ الملف إذا تم تغييره
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ تم إصلاح ${filePath}`);
    } else {
      console.log(`⏭️  لا توجد تغييرات مطلوبة في ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في إصلاح ${filePath}:`, error.message);
  }
}

// تشغيل الإصلاحات
console.log('🔄 بدء إصلاح تناسق الترجمة...\n');

filesToFix.forEach(fixFile);

console.log('\n✅ تم الانتهاء من إصلاح تناسق الترجمة!');

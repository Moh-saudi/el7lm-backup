const fs = require('fs');
const path = require('path');

// الملفات التي تحتاج إلى إصلاح
const filesToFix = [
  'src/app/page.tsx',
  'src/app/providers.tsx',
  'src/app/auth/login/page.tsx',
  'src/app/auth/register/page.tsx',
  'src/app/auth/forgot-password/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/dashboard/messages/page.tsx',
  'src/app/dashboard/parent/page.tsx',
  'src/app/dashboard/marketer/page.tsx',
  'src/app/dashboard/marketer/profile/page.tsx',
  'src/app/dashboard/marketer/payment/page.tsx',
  'src/app/dashboard/marketer/subscription/page.tsx',
  'src/app/dashboard/trainer/page.tsx',
  'src/app/dashboard/trainer/messages/page.tsx',
  'src/app/dashboard/agent/page.tsx',
  'src/app/dashboard/agent/messages/page.tsx',
  'src/app/dashboard/academy/page.tsx',
  'src/app/dashboard/academy/messages/page.tsx',
  'src/app/dashboard/club/page.tsx',
  'src/app/dashboard/club/messages/page.tsx',
  'src/app/dashboard/admin/messages/page.tsx',
  'src/app/dashboard/player/messages/page.tsx',
  'src/app/dashboard/player/videos/page.tsx',
  'src/app/dashboard/player/stats/page.tsx',
  'src/app/dashboard/player/search/page.tsx',
  'src/app/dashboard/player/reports/page.tsx',
  'src/app/dashboard/test-all-accounts/page.tsx',
  'src/components/shared/TranslatedCards.tsx',
  'src/components/shared/TranslatedComponent.tsx',
  'src/components/shared/TranslationWrapper.tsx',
  'src/components/shared/LanguageSwitcher.tsx',
  'src/components/shared/HeaderWithTranslation.tsx',
  'src/components/shared/FontProvider.tsx',
  'src/components/layout/UnifiedSidebar.tsx',
  'src/components/layout/PlayerSidebar.tsx',
  'src/components/layout/PlayerModernSidebar.tsx',
  'src/components/layout/ResponsiveLayout.tsx',
  'src/components/layout/PublicResponsiveLayout.tsx',
  'src/components/layout/ModernUnifiedHeader.tsx',
  'src/components/layout/DashboardHeader.tsx',
  'src/components/layout/DashboardFontWrapper.tsx',
  'src/components/layout/AdminFooter.tsx',
  'src/components/layout/Footer.jsx',
  'src/components/layout/Header.jsx',
  'src/components/layout/Sidebar.jsx',
  'src/components/layout/AcademySidebar.jsx',
  'src/components/layout/AcademyFooter.jsx',
  'src/components/layout/ClubFooter.jsx',
  'src/components/layout/AgentFooter.jsx',
  'src/components/layout/TrainerFooter.jsx',
  'src/components/messaging/ResponsiveMessageCenter.tsx',
  'src/components/messaging/WorkingMessageCenter.tsx',
  'src/components/FontShowcase.tsx'
];

function fixTranslationImports(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ الملف غير موجود: ${filePath}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // إصلاح استيرادات الترجمة
    const oldImports = [
      "from '@/lib/translations/simple-context'",
      "from '@/lib/translations/context'",
      "from '@/lib/translations/admin'",
      "from '@/lib/translations'"
    ];

    oldImports.forEach(oldImport => {
      if (content.includes(oldImport)) {
        content = content.replace(oldImport, "from '@/lib/i18n'");
        modified = true;
        console.log(`✅ تم إصلاح: ${filePath} - ${oldImport}`);
      }
    });

    // إزالة استيرادات TranslationProvider
    if (content.includes('TranslationProvider')) {
      content = content.replace(/import.*TranslationProvider.*from.*['"]@\/lib\/translations\/simple-context['"];?\n?/g, '');
      content = content.replace(/<TranslationProvider>/g, '');
      content = content.replace(/<\/TranslationProvider>/g, '');
      modified = true;
      console.log(`✅ تم إزالة TranslationProvider من: ${filePath}`);
    }

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ تم حفظ: ${filePath}`);
    } else {
      console.log(`ℹ️ لا يحتاج إلى إصلاح: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ خطأ في إصلاح ${filePath}:`, error.message);
  }
}

// تشغيل الإصلاح
console.log('🚀 بدء إصلاح استيرادات الترجمة...\n');

filesToFix.forEach(filePath => {
  fixTranslationImports(filePath);
});

console.log('\n✅ تم الانتهاء من إصلاح استيرادات الترجمة!');

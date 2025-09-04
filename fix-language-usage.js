const fs = require('fs');

// قراءة الملف
const filePath = 'src/components/FontShowcase.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// استبدال جميع استخدامات language بـ locale
content = content.replace(/language === 'ar'/g, "locale === 'ar'");
content = content.replace(/language === 'en'/g, "locale === 'en'");

// كتابة الملف المحدث
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ تم إصلاح جميع استخدامات language في FontShowcase.tsx');




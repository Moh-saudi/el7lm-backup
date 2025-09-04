/** @type {import('jest').Config} */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // مسار ملف Next.js الخاص بك
  dir: './',
});

// إعدادات Jest المخصصة
const customJestConfig = {
  // بيئة الاختبار
  testEnvironment: 'jsdom',
  
  // إعداد الملفات قبل تشغيل الاختبارات
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // أنماط الملفات للاختبار
  testMatch: [
    '**/__tests__/**/*.(ts|tsx|js)',
    '**/*.(test|spec).(ts|tsx|js)'
  ],
  
  // الملفات المستبعدة
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/out/',
    '<rootDir>/dist/'
  ],
  
  // تجاهل تحويل node_modules عدا المكتبات التي تحتاج تحويل
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$|@radix-ui|lucide-react|@supabase))'
  ],
  
  // تعيين المسارات والـ Mock للملفات
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // إعدادات التغطية (مُعطلة مؤقتاً لتبسيط أول تشغيل)
  collectCoverage: false,
  collectCoverageFrom: [],
  
  // متغيرات البيئة للاختبار
  testEnvironmentOptions: {
    url: 'http://localhost:3000',
  },
  
  // إعدادات إضافية
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  
  // Timeout للاختبارات البطيئة
  testTimeout: 10000,
  
  // إعدادات المراقبة
  // watchPlugins معتمدة على حزم خارجية غير متوافقة حالياً، لذا تُزال لتبسيط الإعداد
  
  // تعيين متغيرات البيئة للاختبار
  setupFiles: ['<rootDir>/jest.env.js'],
};

// دمج الإعدادات مع Next.js
module.exports = createJestConfig(customJestConfig); 

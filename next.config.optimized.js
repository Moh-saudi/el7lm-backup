/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    // إعدادات إضافية للتوافق مع Coolify
    trailingSlash: false,
    generateEtags: false,
    images: {
        domains: [
            'firebasestorage.googleapis.com',
            'localhost',
            'lh3.googleusercontent.com',
            'ekyerljzfokqimbabzxm.supabase.co'
        ],
        // تحسين معالجة الصور
        unoptimized: false,
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'firebasestorage.googleapis.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ekyerljzfokqimbabzxm.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            }
        ],
    },
    // تحسين الأداء العام
    compress: true,
    poweredByHeader: false,
    // إضافة إعدادات إضافية للاستقرار
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
        // تحسين معالجة Firebase
        serverComponentsExternalPackages: ['firebase-admin'],
    },
    // تحسين webpack
    webpack: (config, { isServer, dev }) => {
        // تحسين معالجة الصور
        config.module.rules.push({
            test: /\.(png|jpe?g|gif|svg)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        fallback: 'file-loader',
                    },
                },
            ],
        });
        
        // معالجة Firebase Admin في production
        if (isServer && !dev) {
            config.externals = config.externals || [];
            config.externals.push({
                'firebase-admin': 'commonjs firebase-admin',
            });
        }
        
        return config;
    },
    // إعدادات إضافية للبيئة
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
    // تحسين معالجة الأخطاء
    onDemandEntries: {
        // فترة الاحتفاظ بالصفحات في الذاكرة
        maxInactiveAge: 25 * 1000,
        // عدد الصفحات المحتفظ بها
        pagesBufferLength: 2,
    },
}

module.exports = nextConfig; 

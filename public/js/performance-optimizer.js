/**
 * 🚀 أداة تحسين الأداء - El7lm
 * الخطوة القادمة بعد حل مشكلة Image Loader
 */

console.log('🚀 تحميل أداة تحسين الأداء...');

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            loadTime: 0,
            renderTime: 0,
            imageCount: 0,
            jsSize: 0,
            cssSize: 0,
            errors: [],
            warnings: []
        };
        
        this.init();
    }

    init() {
        this.measureLoadTime();
        this.analyzeBundle();
        this.checkImages();
        this.monitorErrors();
        console.log('✅ أداة تحسين الأداء جاهزة!');
    }

    // قياس وقت التحميل
    measureLoadTime() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
            console.log(`⏱️ وقت التحميل: ${(this.metrics.loadTime / 1000).toFixed(2)}s`);
        }
        
        // قياس وقت الرسم الأول
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
            console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
        });
    }

    // تحليل حجم الـ Bundle
    analyzeBundle() {
        const scripts = document.querySelectorAll('script[src]');
        const styles = document.querySelectorAll('link[rel="stylesheet"]');
        
        console.log('📦 تحليل Bundle:');
        console.log(`   JavaScript Files: ${scripts.length}`);
        console.log(`   CSS Files: ${styles.length}`);
        
        // تحليل أحجام الملفات (تقديري)
        scripts.forEach((script, index) => {
            if (script.src.includes('_next')) {
                console.log(`   📄 Script ${index + 1}: ${script.src}`);
            }
        });
    }

    // فحص الصور
    checkImages() {
        const images = document.querySelectorAll('img');
        let loadedImages = 0;
        let errorImages = 0;
        
        this.metrics.imageCount = images.length;
        
        images.forEach(img => {
            if (img.complete) {
                if (img.naturalWidth === 0) {
                    errorImages++;
                } else {
                    loadedImages++;
                }
            }
        });
        
        console.log('🖼️ إحصائيات الصور:');
        console.log(`   إجمالي: ${images.length}`);
        console.log(`   محملة: ${loadedImages}`);
        console.log(`   مكسورة: ${errorImages}`);
        
        if (errorImages > 0) {
            this.metrics.warnings.push(`${errorImages} صور مكسورة`);
        }
    }

    // مراقبة الأخطاء
    monitorErrors() {
        const originalError = window.onerror;
        window.onerror = (message, source, lineno, colno, error) => {
            this.metrics.errors.push({
                message,
                source,
                line: lineno,
                column: colno,
                timestamp: new Date().toISOString()
            });
            console.error('🚨 خطأ JavaScript:', message);
            
            if (originalError) {
                originalError(message, source, lineno, colno, error);
            }
        };
    }

    // تحليل Core Web Vitals
    analyzeCoreWebVitals() {
        return new Promise((resolve) => {
            const vitals = {
                LCP: null, // Largest Contentful Paint
                FID: null, // First Input Delay  
                CLS: null  // Cumulative Layout Shift
            };

            // قياس LCP
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                vitals.LCP = entries[entries.length - 1].startTime;
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // قياس FID
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                vitals.FID = entries[0].processingStart - entries[0].startTime;
            }).observe({ entryTypes: ['first-input'] });

            // قياس CLS
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                vitals.CLS = entries.reduce((sum, entry) => sum + entry.value, 0);
            }).observe({ entryTypes: ['layout-shift'] });

            setTimeout(() => {
                console.log('📊 Core Web Vitals:');
                console.log(`   LCP: ${vitals.LCP ? (vitals.LCP / 1000).toFixed(2) + 's' : 'غير متوفر'}`);
                console.log(`   FID: ${vitals.FID ? vitals.FID.toFixed(2) + 'ms' : 'غير متوفر'}`);
                console.log(`   CLS: ${vitals.CLS ? vitals.CLS.toFixed(3) : 'غير متوفر'}`);
                resolve(vitals);
            }, 3000);
        });
    }

    // اقتراحات التحسين
    getSuggestions() {
        const suggestions = [];
        
        // فحص وقت التحميل
        if (this.metrics.loadTime > 5000) {
            suggestions.push({
                type: 'critical',
                title: 'وقت تحميل بطيء',
                description: `وقت التحميل ${(this.metrics.loadTime / 1000).toFixed(1)}s يتجاوز الحد المقبول (5s)`,
                solution: 'استخدم code splitting وضغط الصور'
            });
        }
        
        // فحص الصور
        if (this.metrics.warnings.length > 0) {
            suggestions.push({
                type: 'warning',
                title: 'مشاكل في الصور',
                description: this.metrics.warnings.join(', '),
                solution: 'استخدم SafeImageAdvanced أو ImageWrapper'
            });
        }
        
        // فحص الأخطاء
        if (this.metrics.errors.length > 0) {
            suggestions.push({
                type: 'error',
                title: 'أخطاء JavaScript',
                description: `${this.metrics.errors.length} أخطاء مكتشفة`,
                solution: 'مراجعة console وإصلاح الأخطاء'
            });
        }
        
        return suggestions;
    }

    // تطبيق تحسينات فورية
    applyQuickFixes() {
        console.log('🔧 تطبيق تحسينات فورية...');
        
        // ضغط الصور
        this.compressImages();
        
        // تأجيل تحميل الصور
        this.lazyLoadImages();
        
        // تحسين الخطوط
        this.optimizeFonts();
        
        console.log('✅ تم تطبيق التحسينات الفورية');
    }

    // ضغط الصور
    compressImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && !img.src.includes('webp')) {
                // محاولة تحويل إلى WebP إذا متوفر
                const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/, '.webp');
                
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = webpSrc;
                    console.log(`🔄 تم تحويل إلى WebP: ${img.alt || 'صورة'}`);
                };
                testImg.onerror = () => {
                    // WebP غير متوفر، استخدم ضغط أقل
                    if (img.loading !== 'lazy') {
                        img.loading = 'lazy';
                    }
                };
                testImg.src = webpSrc;
            }
        });
    }

    // تحميل كسول للصور
    lazyLoadImages() {
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            img.loading = 'lazy';
            img.decoding = 'async';
        });
        console.log(`🔄 تم تفعيل lazy loading لـ ${images.length} صورة`);
    }

    // تحسين الخطوط
    optimizeFonts() {
        const fonts = document.querySelectorAll('link[href*="fonts"]');
        fonts.forEach(font => {
            if (!font.getAttribute('rel').includes('preload')) {
                font.rel = 'preload';
                font.as = 'style';
            }
        });
    }

    // تقرير شامل
    generateReport() {
        const suggestions = this.getSuggestions();
        
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            suggestions: suggestions,
            score: this.calculateScore(),
            nextSteps: this.getNextSteps()
        };
        
        console.log('📋 تقرير الأداء:');
        console.table(this.metrics);
        
        if (suggestions.length > 0) {
            console.log('\n💡 اقتراحات التحسين:');
            suggestions.forEach((suggestion, index) => {
                console.log(`${index + 1}. [${suggestion.type}] ${suggestion.title}`);
                console.log(`   ${suggestion.description}`);
                console.log(`   💡 الحل: ${suggestion.solution}\n`);
            });
        }
        
        return report;
    }

    // حساب نقاط الأداء
    calculateScore() {
        let score = 100;
        
        // خصم نقاط بناءً على وقت التحميل
        if (this.metrics.loadTime > 3000) score -= 20;
        if (this.metrics.loadTime > 5000) score -= 30;
        if (this.metrics.loadTime > 10000) score -= 50;
        
        // خصم نقاط للأخطاء
        score -= this.metrics.errors.length * 10;
        score -= this.metrics.warnings.length * 5;
        
        return Math.max(0, score);
    }

    // الخطوات التالية الموصى بها
    getNextSteps() {
        const score = this.calculateScore();
        
        if (score >= 90) {
            return [
                'ممتاز! الأداء جيد جداً',
                'ركز على إضافة ميزات جديدة',
                'راقب الأداء بانتظام'
            ];
        } else if (score >= 70) {
            return [
                'جيد! هناك مجال للتحسين',
                'اعمل على تحسين وقت التحميل',
                'راجع الأخطاء الموجودة'
            ];
        } else {
            return [
                'يحتاج تحسين عاجل!',
                'ابدأ بإصلاح الأخطاء',
                'قلل حجم الـ Bundle',
                'حسن الصور والموارد'
            ];
        }
    }
}

// تشغيل تلقائي عند التحميل
window.performanceOptimizer = new PerformanceOptimizer();

// إضافة وظائف عامة
window.analyzePerformance = () => {
    return window.performanceOptimizer.generateReport();
};

window.quickOptimize = () => {
    window.performanceOptimizer.applyQuickFixes();
};

window.getCoreWebVitals = () => {
    return window.performanceOptimizer.analyzeCoreWebVitals();
};

// تشغيل فحص شامل بعد 3 ثوان
setTimeout(() => {
    console.log('\n🔍 تشغيل فحص الأداء التلقائي...');
    window.analyzePerformance();
    window.getCoreWebVitals();
}, 3000);

console.log('✅ أداة تحسين الأداء جاهزة!');
console.log('💡 الأوامر المتاحة:');
console.log('   - window.analyzePerformance() - تقرير شامل');
console.log('   - window.quickOptimize() - تحسينات فورية');
console.log('   - window.getCoreWebVitals() - مقاييس Core Web Vitals'); 

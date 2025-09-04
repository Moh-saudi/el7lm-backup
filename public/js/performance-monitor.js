// أداة مراقبة الأداء - Dashboard Performance Monitor
// تستخدم فقط في بيئة التطوير لتتبع أداء التنقل

(function() {
  'use strict';

  // التحقق من بيئة التطوير
  if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
    return; // لا تعمل في الإنتاج
  }

  // متغيرات تتبع الأداء
  let navigationStartTime = 0;
  let lastPageLoadTime = 0;
  let routeChanges = [];
  let performanceData = {
    dashboardLoads: 0,
    averageLoadTime: 0,
    slowestLoad: 0,
    fastestLoad: Infinity,
    routeHistory: []
  };

  // بدء مراقبة الأداء
  function startPerformanceMonitoring() {
    console.log('🚀 Dashboard Performance Monitor Active');
    
    // مراقبة تغيير الصفحات
    monitorRouteChanges();
    
    // مراقبة تحميل المكونات
    monitorComponentLoading();
    
    // إضافة أوامر تشخيص للكونسول
    addDebugCommands();
  }

  // مراقبة تغيير المسارات
  function monitorRouteChanges() {
    navigationStartTime = performance.now();
    
    // مراقبة pushState و replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      logRouteChange('pushState', args[2]);
      return originalPushState.apply(this, args);
    };
    
    history.replaceState = function(...args) {
      logRouteChange('replaceState', args[2]);
      return originalReplaceState.apply(this, args);
    };
    
    // مراقبة popstate
    window.addEventListener('popstate', function(event) {
      logRouteChange('popstate', window.location.pathname);
    });
  }

  // تسجيل تغيير المسار
  function logRouteChange(type, url) {
    const now = performance.now();
    const loadTime = now - navigationStartTime;
    
    if (lastPageLoadTime > 0) {
      const routeChange = {
        type,
        url,
        timestamp: new Date().toISOString(),
        loadTime: Math.round(loadTime),
        fromUrl: window.location.pathname
      };
      
      routeChanges.push(routeChange);
      updatePerformanceData(loadTime);
      
      console.log(`🔄 Route Change [${type}]:`, {
        from: routeChange.fromUrl,
        to: url,
        loadTime: `${routeChange.loadTime}ms`,
        performance: getPerformanceRating(loadTime)
      });
    }
    
    navigationStartTime = now;
    lastPageLoadTime = now;
  }

  // تحديث بيانات الأداء
  function updatePerformanceData(loadTime) {
    performanceData.dashboardLoads++;
    performanceData.routeHistory.push({
      url: window.location.pathname,
      loadTime,
      timestamp: Date.now()
    });
    
    // حساب المتوسط
    const total = performanceData.routeHistory.reduce((sum, route) => sum + route.loadTime, 0);
    performanceData.averageLoadTime = Math.round(total / performanceData.routeHistory.length);
    
    // تحديث الأسرع والأبطأ
    performanceData.slowestLoad = Math.max(performanceData.slowestLoad, loadTime);
    performanceData.fastestLoad = Math.min(performanceData.fastestLoad, loadTime);
    
    // الاحتفاظ بآخر 50 سجل فقط
    if (performanceData.routeHistory.length > 50) {
      performanceData.routeHistory = performanceData.routeHistory.slice(-50);
    }
  }

  // مراقبة تحميل المكونات
  function monitorComponentLoading() {
    // مراقبة React Suspense
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // تحديد مكونات Suspense Loading
              const loadingElements = node.querySelectorAll('[class*="animate-pulse"], [class*="loading"]');
              if (loadingElements.length > 0) {
                console.log('⏳ Component loading detected:', loadingElements.length, 'elements');
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // تقييم الأداء
  function getPerformanceRating(loadTime) {
    if (loadTime < 100) return '🚀 ممتاز';
    if (loadTime < 300) return '✅ جيد';
    if (loadTime < 600) return '⚠️ مقبول';
    return '❌ بطيء';
  }

  // إضافة أوامر التشخيص
  function addDebugCommands() {
    window.dashboardPerformance = {
      // عرض إحصائيات الأداء
      getStats: function() {
        console.table({
          'إجمالي التنقلات': performanceData.dashboardLoads,
          'متوسط وقت التحميل': `${performanceData.averageLoadTime}ms`,
          'أسرع تحميل': `${performanceData.fastestLoad === Infinity ? 0 : Math.round(performanceData.fastestLoad)}ms`,
          'أبطأ تحميل': `${Math.round(performanceData.slowestLoad)}ms`,
          'التقييم العام': getPerformanceRating(performanceData.averageLoadTime)
        });
        return performanceData;
      },
      
      // عرض تاريخ التنقل
      getRouteHistory: function(limit = 10) {
        const recent = performanceData.routeHistory.slice(-limit);
        console.log('📊 Route History (Recent', limit, 'navigations):');
        recent.forEach((route, index) => {
          console.log(`${recent.length - index}. ${route.url} - ${route.loadTime}ms - ${getPerformanceRating(route.loadTime)}`);
        });
        return recent;
      },
      
      // قياس وقت محدد
      measureNavigation: function() {
        const startTime = performance.now();
        console.log('⏱️ Navigation timer started...');
        return function(description = 'Navigation') {
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);
          console.log(`⏱️ ${description} completed in ${duration}ms - ${getPerformanceRating(duration)}`);
          return duration;
        };
      },
      
      // تصدير البيانات
      exportData: function() {
        const data = {
          ...performanceData,
          exportTime: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        console.log('📤 Performance data exported:', data);
        return data;
      },
      
      // مسح البيانات
      clearData: function() {
        routeChanges = [];
        performanceData = {
          dashboardLoads: 0,
          averageLoadTime: 0,
          slowestLoad: 0,
          fastestLoad: Infinity,
          routeHistory: []
        };
        console.log('🧹 Performance data cleared');
      },
      
      // تحليل الأداء المتقدم
      analyzePerformance: function() {
        const stats = this.getStats();
        const routes = performanceData.routeHistory;
        
        // تحليل أبطأ الصفحات
        const routeStats = {};
        routes.forEach(route => {
          if (!routeStats[route.url]) {
            routeStats[route.url] = {
              count: 0,
              totalTime: 0,
              avgTime: 0
            };
          }
          routeStats[route.url].count++;
          routeStats[route.url].totalTime += route.loadTime;
          routeStats[route.url].avgTime = Math.round(routeStats[route.url].totalTime / routeStats[route.url].count);
        });
        
        const sortedRoutes = Object.entries(routeStats)
          .sort(([,a], [,b]) => b.avgTime - a.avgTime)
          .slice(0, 5);
        
        console.log('🐌 أبطأ الصفحات:');
        sortedRoutes.forEach(([url, stats], index) => {
          console.log(`${index + 1}. ${url} - ${stats.avgTime}ms (${stats.count} visits)`);
        });
        
        return { stats, routeStats: sortedRoutes };
      }
    };
    
    // تلميحات للاستخدام
    console.log(`
🎯 أوامر مراقبة الأداء المتاحة:
• dashboardPerformance.getStats() - عرض إحصائيات الأداء
• dashboardPerformance.getRouteHistory() - تاريخ التنقل
• dashboardPerformance.measureNavigation() - قياس التنقل اليدوي
• dashboardPerformance.analyzePerformance() - تحليل متقدم
• dashboardPerformance.exportData() - تصدير البيانات
• dashboardPerformance.clearData() - مسح البيانات
    `);
  }

  // تشغيل المراقب عند تحميل الصفحة
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startPerformanceMonitoring);
  } else {
    startPerformanceMonitoring();
  }

  // مراقبة Web Vitals إذا كانت متاحة
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log('📊 Navigation Timing:', {
              'DNS Lookup': `${Math.round(entry.domainLookupEnd - entry.domainLookupStart)}ms`,
              'TCP Connection': `${Math.round(entry.connectEnd - entry.connectStart)}ms`,
              'First Byte': `${Math.round(entry.responseStart - entry.requestStart)}ms`,
              'DOM Loading': `${Math.round(entry.domComplete - entry.responseEnd)}ms`,
              'Total Load Time': `${Math.round(entry.loadEventEnd - entry.fetchStart)}ms`
            });
          }
        }
      });
      observer.observe({ entryTypes: ['navigation'] });
    } catch (e) {
      console.log('⚠️ PerformanceObserver not fully supported');
    }
  }

})(); 

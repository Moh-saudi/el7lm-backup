'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLayout } from './ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';

// ===== مكون عرض نوع الجهاز =====
export const DeviceIndicator: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useLayout();
  const [isClient, setIsClient] = useState(false);

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getDeviceInfo = () => {
    if (isMobile) {
      return {
        icon: Smartphone,
        label: 'موبايل',
        color: 'bg-blue-500',
        textColor: 'text-blue-600'
      };
    } else if (isTablet) {
      return {
        icon: Tablet,
        label: 'تابلت',
        color: 'bg-green-500',
        textColor: 'text-green-600'
      };
    } else {
      return {
        icon: Monitor,
        label: 'ديسكتوب',
        color: 'bg-purple-500',
        textColor: 'text-purple-600'
      };
    }
  };

  const deviceInfo = getDeviceInfo();
  const IconComponent = deviceInfo.icon;

  // لا تعرض المؤشر حتى يتم تحميل المكون على العميل
  if (!isClient) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-4 left-4 z-50"
    >
      <Badge 
        variant="secondary" 
        className={`${deviceInfo.color} text-white border-0 shadow-lg`}
      >
        <IconComponent className="w-3 h-3 mr-1" />
        {deviceInfo.label}
      </Badge>
    </motion.div>
  );
};

// ===== مكون زر تبديل السايدبار =====
export const SidebarToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { toggleSidebar, isSidebarOpen, isMobile } = useLayout();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={className}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
      >
        {isMobile ? (
          isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />
        ) : (
          isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        )}
      </Button>
    </motion.div>
  );
};

// ===== مكون معلومات التخطيط =====
export const LayoutInfo: React.FC = () => {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    isSidebarOpen, 
    isSidebarCollapsed 
  } = useLayout();
  const [isClient, setIsClient] = useState(false);
  const [screenWidth, setScreenWidth] = useState('غير متاح');

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
    setScreenWidth(`${window.innerWidth}px`);
  }, []);

  // لا تعرض المكون حتى يتم تحميله على العميل
  if (!isClient) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">معلومات التخطيط</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">نوع الجهاز:</span>
            <Badge variant="outline">جاري التحميل...</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">السايدبار:</span>
            <Badge variant="outline">جاري التحميل...</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">عرض الشاشة:</span>
            <span className="font-mono text-gray-800">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-3">معلومات التخطيط</h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">نوع الجهاز:</span>
          <Badge variant="outline">
            {isMobile ? 'موبايل' : isTablet ? 'تابلت' : 'ديسكتوب'}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">السايدبار:</span>
          <Badge variant="outline">
            {isMobile ? (isSidebarOpen ? 'مفتوح' : 'مخفي') : (isSidebarCollapsed ? 'مطوي' : 'مفتوح')}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-600">عرض الشاشة:</span>
          <span className="font-mono text-gray-800">{screenWidth}</span>
        </div>
      </div>
    </div>
  );
};

// ===== مكون اختبار التجاوب =====
export const ResponsiveTest: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useLayout();
  const [isClient, setIsClient] = useState(false);

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
  }, []);

  const testCases = [
    {
      condition: isMobile,
      title: 'اختبار الموبايل',
      description: 'يجب أن يعمل بشكل مثالي على الشاشات الصغيرة',
      features: [
        'السايدبار مخفي افتراضياً',
        'زر القائمة في الهيدر',
        'تخطيط عمودي واحد',
        'أزرار كبيرة للمس'
      ]
    },
    {
      condition: isTablet,
      title: 'اختبار التابلت',
      description: 'يجب أن يعمل بشكل مثالي على الشاشات المتوسطة',
      features: [
        'السايدبار مطوي مع الأيقونات',
        'تخطيط عمودين',
        'مساحة محسنة للتفاعل',
        'عرض محسن للمحتوى'
      ]
    },
    {
      condition: isDesktop,
      title: 'اختبار الديسكتوب',
      description: 'يجب أن يعمل بشكل مثالي على الشاشات الكبيرة',
      features: [
        'السايدبار مفتوح بالكامل',
        'تخطيط ثلاثة أعمدة',
        'عرض جميع المعلومات',
        'تجربة مستخدم كاملة'
      ]
    }
  ];

  const activeTest = testCases.find(test => test.condition);

  // لا تعرض المكون حتى يتم تحميله على العميل
  if (!isClient) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          جاري التحميل...
        </h3>
        <p className="text-blue-700 mb-4">
          جاري تحميل معلومات الاختبار...
        </p>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span className="text-sm text-blue-600">جاري التحميل...</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-blue-900 mb-4">
        {activeTest?.title}
      </h3>
      <p className="text-blue-700 mb-4">
        {activeTest?.description}
      </p>
      <div className="space-y-2">
        {activeTest?.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-blue-800">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ===== مكون تحكم في التخطيط =====
export const LayoutControls: React.FC = () => {
  const { 
    toggleSidebar, 
    isSidebarOpen, 
    isSidebarCollapsed,
    isMobile 
  } = useLayout();
  const [isClient, setIsClient] = useState(false);

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
  }, []);

  // لا تعرض الأزرار حتى يتم تحميل المكون على العميل
  if (!isClient) {
    return null;
  }

  const handleFullscreen = () => {
    if (typeof document !== 'undefined') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleSidebar}
        className="flex items-center gap-2"
      >
        {isMobile ? (
          <>
            {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            {isSidebarOpen ? 'إغلاق' : 'فتح'}
          </>
        ) : (
          <>
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {isSidebarCollapsed ? 'توسيع' : 'طي'}
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFullscreen}
        className="flex items-center gap-2"
      >
        {typeof document !== 'undefined' && document.fullscreenElement ? (
          <>
            <Minimize2 className="w-4 h-4" />
            خروج
          </>
        ) : (
          <>
            <Maximize2 className="w-4 h-4" />
            ملء الشاشة
          </>
        )}
      </Button>
    </div>
  );
};

// ===== مكون عرض الإحصائيات =====
export const LayoutStats: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useLayout();
  const [isClient, setIsClient] = useState(false);
  const [screenStats, setScreenStats] = useState({
    width: 'غير متاح',
    height: 'غير متاح',
    ratio: 'غير متاح'
  });

  // التأكد من أن المكون يعمل على العميل فقط
  useEffect(() => {
    setIsClient(true);
    setScreenStats({
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
      ratio: `${(window.innerWidth / window.innerHeight * 100).toFixed(1)}%`
    });
  }, []);

  const stats = [
    {
      label: 'نوع الجهاز',
      value: isMobile ? 'موبايل' : isTablet ? 'تابلت' : 'ديسكتوب',
      color: isMobile ? 'text-blue-600' : isTablet ? 'text-green-600' : 'text-purple-600'
    },
    {
      label: 'عرض الشاشة',
      value: screenStats.width,
      color: 'text-gray-600'
    },
    {
      label: 'ارتفاع الشاشة',
      value: screenStats.height,
      color: 'text-gray-600'
    },
    {
      label: 'نسبة العرض',
      value: screenStats.ratio,
      color: 'text-gray-600'
    }
  ];

  // لا تعرض المكون حتى يتم تحميله على العميل
  if (!isClient) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">جاري التحميل...</div>
            <div className="font-semibold text-gray-400">...</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
          <div className={`font-semibold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
};

// ===== مكون اختبار الأداء =====
export const PerformanceTest: React.FC = () => {
  const [fps, setFps] = React.useState(0);
  const [memory, setMemory] = React.useState(0);

  React.useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();

    const measurePerformance = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        setFps(Math.round((frameCount * 1000) / (currentTime - lastTime)));
        frameCount = 0;
        lastTime = currentTime;
      }

      // قياس استخدام الذاكرة (إذا كان متاحاً)
      if ('memory' in performance) {
        const memoryInfo = (performance as any).memory;
        setMemory(Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024));
      }

      requestAnimationFrame(measurePerformance);
    };

    requestAnimationFrame(measurePerformance);
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">أداء التطبيق</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{fps}</div>
          <div className="text-xs text-gray-500">FPS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{memory}</div>
          <div className="text-xs text-gray-500">MB</div>
        </div>
      </div>
    </div>
  );
};

// ===== مكون اختبار شامل =====
export const ComprehensiveTest: React.FC = () => {
  return (
    <div className="space-y-6">
      <LayoutInfo />
      <ResponsiveTest />
      <LayoutStats />
      <PerformanceTest />
    </div>
  );
};

export default {
  DeviceIndicator,
  SidebarToggle,
  LayoutInfo,
  ResponsiveTest,
  LayoutControls,
  LayoutStats,
  PerformanceTest,
  ComprehensiveTest
};

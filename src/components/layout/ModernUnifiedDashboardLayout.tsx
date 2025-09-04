'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/auth-provider';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import ModernUnifiedHeader from '@/components/layout/ModernUnifiedHeader';
import ModernEnhancedSidebar from '@/components/layout/ModernEnhancedSidebar';
import Footer from '@/components/layout/Footer';
import FloatingChatWidget from '@/components/support/FloatingChatWidget';
import EnhancedNotifications from '@/components/ui/EnhancedNotifications';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModernUnifiedDashboardLayoutProps {
  children: React.ReactNode;
  accountType: string;
  title?: string;
  logo?: string;
  showFooter?: boolean;
  showFloatingChat?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const ModernUnifiedDashboardLayout: React.FC<ModernUnifiedDashboardLayoutProps> = ({
  children,
  accountType,
  title = "El7lm Platform",
  logo,
  showFooter = true,
  showFloatingChat = true,
  showSearch = true,
  searchPlaceholder = "ابحث عن أي شيء..."
}) => {
  const { user, userData, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);

  // صفحات مخفية (تحتاج layout مخصص) - فقط للاعبين
  const isPlayerProfilePage = pathname.includes('/player/profile');
  const isPlayerReportsPage = pathname.includes('/player/reports');
  const isEntityProfilePage = pathname.includes('/search/profile/');
  
  // إظهار القائمة الجانبية في صفحة ملف اللاعب أيضاً. نخفيها فقط لملفات الكيانات العامة.
  const shouldShowSidebar = !isEntityProfilePage;

  // نافذة ترحيب بأكاديمية الحلم (مرة لكل مستخدم) - لا تظهر داخل صفحة الأكاديمية
  useEffect(() => {
    try {
      if (!user) return;
      if (pathname.includes('/dashboard/dream-academy')) return;
      const key = `dream_academy_welcome_v1_${user.uid}`;
      const seen = typeof window !== 'undefined' ? localStorage.getItem(key) : '1';
      if (!seen) setShowWelcome(true);
    } catch {}
  }, [user, pathname]);

  const markWelcomeSeen = () => {
    try {
      if (!user) return;
      const key = `dream_academy_welcome_v1_${user.uid}`;
      localStorage.setItem(key, '1');
    } catch {}
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-slate-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="p-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg">
            <p className="text-slate-600 mb-4">يرجى تسجيل الدخول للوصول إلى لوحة التحكم</p>
            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>
      </div>
    );
  }

  const effectiveAccountType = (userData?.accountType as string) || accountType;

  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" style={{ direction: 'rtl' }}>
        
        {/* الإشعارات المحسنة */}
        <EnhancedNotifications />
        
        {/* الهيدر الحديث - يظهر باستثناء صفحات ملفات الكيانات العامة */}
        {!isEntityProfilePage && (
          <ModernUnifiedHeader
            showSearch={showSearch}
            searchPlaceholder={searchPlaceholder}
            title={title}
            variant="gaming"
          />
        )}
        
        {/* المحتوى الرئيسي */}
        <div className="flex flex-1 min-h-0" style={{ direction: 'rtl' }}>
          
          {/* القائمة الجانبية الحديثة */}
          {shouldShowSidebar && (
            <ModernEnhancedSidebar
              accountType={effectiveAccountType}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
              userData={userData}
            />
          )}
          
          {/* المحتوى الرئيسي */}
          <main 
            className={`flex-1 min-h-0 overflow-auto transition-all duration-300 ease-in-out ${
              shouldShowSidebar ? (collapsed ? 'mr-20' : 'mr-[280px]') : ''
            }`}
            style={{ direction: 'rtl' }}
          >
            {/* مساحة للهيدر */}
            <div className={!isEntityProfilePage ? 'pt-20' : ''}>
              {/* مساحة للفوتر */}
              <div className={showFooter ? 'pb-20' : 'pb-4'}>
                <div className="w-full min-h-full">
                  {/* Container للمحتوى */}
                  <div className="min-h-full p-6">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* نافذة ترحيبية عصرية بأكاديمية الحلم */}
        <Dialog open={showWelcome} onOpenChange={(open)=>{ setShowWelcome(open); if (!open && dontShowAgain) markWelcomeSeen(); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>مرحباً بك في أكاديمية الحلم</DialogTitle>
              <DialogDescription>
                تعلّم اللغات المتخصصة في كرة القدم، طوّر مهاراتك الحياتية، واستفد من جلسات لايف كوتش خاصة مدفوعة. محتوى مُختار بعناية مع قوائم تشغيل يوتيوب ومزايا تفاعلية داخل منصتنا.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2 text-sm text-gray-600 leading-7">
              <ul className="list-disc pr-6 space-y-1">
                <li>فئات ديناميكية تُدار من لوحة الإدارة</li>
                <li>إحصائيات مشاهدات وإعجابات خاصة بالمنصة</li>
                <li>جلسات خاصة مدفوعة بعملات متعددة وطرق دفع متنوعة</li>
              </ul>
            </div>
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={dontShowAgain} onChange={(e)=>setDontShowAgain(e.target.checked)} />
                لا تُظهر هذه الرسالة مرة أخرى
              </label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={()=>{ if (dontShowAgain) markWelcomeSeen(); setShowWelcome(false); }}>لاحقاً</Button>
                <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white" onClick={()=>{ if (dontShowAgain) markWelcomeSeen(); router.push('/dashboard/dream-academy'); }}>الدخول الآن</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* الفوتر - يظهر باستثناء صفحات ملفات الكيانات العامة */}
        {showFooter && !isEntityProfilePage && <Footer />}
        
        {/* أيقونة الدعم الفني العائم */}
        {showFloatingChat && <FloatingChatWidget />}
      </div>
    </SidebarProvider>
  );
};

export default ModernUnifiedDashboardLayout; 

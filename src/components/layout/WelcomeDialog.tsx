'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WelcomeDialogProps {
  user: any;
  pathname: string;
  onClose: () => void;
}

const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ user, pathname, onClose }) => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      if (!user) return;
      if (pathname.includes('/dashboard/dream-academy')) return;
      const key = `dream_academy_welcome_v1_${user.uid}`;
      const seen = typeof window !== 'undefined' ? localStorage.getItem(key) : '1';
      if (!seen) {
        setShowWelcome(true);
      }
    } catch {}
  }, [user, pathname]);

  const markWelcomeSeen = () => {
    try {
      if (!user) return;
      const key = `dream_academy_welcome_v1_${user.uid}`;
      localStorage.setItem(key, '1');
    } catch {}
  };

  return (
    <Dialog open={showWelcome} onOpenChange={(open) => {
      setShowWelcome(open);
      if (!open && dontShowAgain) markWelcomeSeen();
      if (!open) onClose();
    }}>
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
            <input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} />
            لا تُظهر هذه الرسالة مرة أخرى
          </label>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { if (dontShowAgain) markWelcomeSeen(); setShowWelcome(false); }}>لاحقاً</Button>
            <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white" onClick={() => { if (dontShowAgain) markWelcomeSeen(); router.push('/dashboard/dream-academy'); }}>الدخول الآن</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeDialog;

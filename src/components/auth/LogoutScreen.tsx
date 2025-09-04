'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  LogOut, 
  LogIn, 
  UserPlus, 
  Home, 
  Phone, 
  Mail, 
  MessageCircle, 
  Shield,
  Heart,
  Star
} from 'lucide-react';

interface LogoutScreenProps {
  onClose?: () => void;
}

export default function LogoutScreen({ onClose }: LogoutScreenProps) {
  const router = useRouter();
  const [showScreen, setShowScreen] = useState(true);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // عداد تنازلي لمدة 5 ثواني
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRedirectToHome();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleRedirectToHome = () => {
    setShowScreen(false);
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleLogin = () => {
    setShowScreen(false);
    setTimeout(() => {
      router.push('/auth/login');
    }, 500);
  };

  const handleRegister = () => {
    setShowScreen(false);
    setTimeout(() => {
      router.push('/auth/register');
    }, 500);
  };

  const handleHome = () => {
    setShowScreen(false);
    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  if (!showScreen) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/95 backdrop-blur-sm border-white/30 shadow-2xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <LogOut className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">تم تسجيل الخروج بنجاح</h1>
              <p className="text-blue-100 text-sm">شكراً لك على استخدام منصة الحلم</p>
            </div>

            {/* Content */}
            <div className="p-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-center mb-6"
              >
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  يرجى تسجيل الدخول للوصول إلى لوحة التحكم
                </h2>
                <p className="text-gray-600 text-sm">
                  سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال {countdown} ثانية
                </p>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-3 mb-6"
              >
                <Button
                  onClick={handleLogin}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 ease-out transform hover:scale-[1.02]"
                >
                  <LogIn className="w-5 h-5 ml-2" />
                  تسجيل الدخول
                </Button>

                <Button
                  onClick={handleRegister}
                  variant="outline"
                  className="w-full border-2 border-purple-500 text-purple-600 hover:bg-purple-50 font-semibold py-3 rounded-xl transition-all duration-500 ease-out transform hover:scale-[1.02]"
                >
                  <UserPlus className="w-5 h-5 ml-2" />
                  إنشاء حساب جديد
                </Button>

                <Button
                  onClick={handleHome}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50 font-medium py-3 rounded-xl transition-all duration-300"
                >
                  <Home className="w-5 h-5 ml-2" />
                  الصفحة الرئيسية
                </Button>
              </motion.div>

              {/* Support Information */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="border-t border-gray-200 pt-4"
              >
                <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">
                  الدعم الفني والمساعدة
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>+966 50 123 4567</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>support@el7lm.com</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>واتساب: +966 50 123 4567</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>آمن 100%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>جودة عالية</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>دعم 24/7</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 text-center">
              <p className="text-xs text-gray-500">
                © 2024 منصة الحلم. جميع الحقوق محفوظة.
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

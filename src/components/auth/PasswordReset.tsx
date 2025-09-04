'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

interface PasswordResetProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  className?: string;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonAction?: () => void;
}

export default function PasswordReset({
  onSuccess,
  onError,
  onCancel,
  className = '',
  title = 'نسيت كلمة المرور؟',
  subtitle = 'أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور',
  showBackButton = true,
  backButtonText = 'العودة إلى تسجيل الدخول',
  backButtonAction
}: PasswordResetProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
      const successMessage = 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني';
      setMessage(successMessage);
      onSuccess?.();
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = '';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'البريد الإلكتروني غير مسجل في النظام';
          break;
        case 'auth/invalid-email':
          errorMessage = 'البريد الإلكتروني غير صحيح';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'تم إرسال طلبات كثيرة، يرجى المحاولة لاحقاً';
          break;
        default:
          errorMessage = 'حدث خطأ أثناء إرسال رابط إعادة التعيين';
      }
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setMessage('');
    setError('');
    setEmail('');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl p-8 ${className}`} dir="rtl">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-sm text-gray-600">
          {subtitle}
        </p>
      </div>

      {/* Success Message */}
      {isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 ml-2" />
            <p className="text-sm text-green-800">{message}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 ml-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Form */}
      {!isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              البريد الإلكتروني
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="أدخل بريدك الإلكتروني"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin ml-2" />
                جاري الإرسال...
              </div>
            ) : (
              'إرسال رابط إعادة التعيين'
            )}
          </button>
        </form>
      )}

      {/* Success Actions */}
      {isSuccess && (
        <div className="space-y-3">
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            إرسال لبريد إلكتروني آخر
          </button>
        </div>
      )}

      {/* Navigation */}
      {showBackButton && (
        <div className="mt-6 text-center">
          <button
            onClick={backButtonAction || onCancel}
            className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 transition-colors mx-auto"
          >
            <ArrowLeft className="h-4 w-4 ml-1" />
            {backButtonText}
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">تعليمات:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• تحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها</li>
          <li>• الرابط صالح لمدة ساعة واحدة فقط</li>
          <li>• لا تشارك الرابط مع أي شخص آخر</li>
          <li>• إذا لم تتلق الرسالة، تحقق من صحة البريد الإلكتروني</li>
        </ul>
      </div>
    </div>
  );
} 

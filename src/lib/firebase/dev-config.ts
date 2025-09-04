// Dev configuration for Firebase
// معالجة أخطاء Firebase في وضع التطوير

export const suppressFirebaseErrors = () => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    // إخفاء أخطاء Firebase المعروفة في وضع التطوير
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args.join(' ');
      
      // قائمة الأخطاء المعروفة التي يمكن تجاهلها في التطوير
      const ignoredErrors = [
        'Missing or insufficient permissions',
        'FirebaseError: Missing or insufficient permissions',
        'Error logging security event',
        'PERMISSION_DENIED',
        'Failed to load resource: the server responded with a status of 400'
      ];
      
      const shouldIgnore = ignoredErrors.some(error => message.includes(error));
      
      if (!shouldIgnore) {
        originalError.apply(console, args);
      }
    };
    
    console.warn = (...args) => {
      const message = args.join(' ');
      
      const ignoredWarnings = [
        'Geidea configuration incomplete',
        'Firebase environment variables are missing'
      ];
      
      const shouldIgnore = ignoredWarnings.some(warning => message.includes(warning));
      
      if (!shouldIgnore) {
        originalWarn.apply(console, args);
      }
    };
  }
};

// معلومات تشخيصية
export const logFirebaseStatus = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Firebase Dev Mode Active');
    console.log('📱 Environment:', process.env.NODE_ENV);
    console.log('🔥 Firebase Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
    // التحقق من متغيرات Geidea
    const geideaVars = {
      merchantId: process.env.NEXT_PUBLIC_GEIDEA_MERCHANT_ID,
      environment: process.env.NEXT_PUBLIC_GEIDEA_ENVIRONMENT,
      hasPublicKey: !!process.env.GEIDEA_MERCHANT_PUBLIC_KEY,
      hasApiPassword: !!process.env.GEIDEA_API_PASSWORD
    };
    
    console.log('💳 Geidea Status:', geideaVars);
  }
}; 

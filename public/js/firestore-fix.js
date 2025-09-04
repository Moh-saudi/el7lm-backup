// El7lm - Firestore Error Fix
// حل مشاكل أخطاء 400 Bad Request في Firestore

(function() {
  'use strict';
  
  // منع التحميل المضاعف
  if (typeof window.FirestoreFix !== 'undefined' || window.firestoreFixLoaded) {
    console.log('⚠️ FirestoreFix محمل بالفعل - تجاهل التحميل المضاعف');
    return;
  }

  // تعليم الصفحة أن FirestoreFix قيد التحميل
  window.firestoreFixLoaded = true;

  console.log('🔧 تحميل أداة إصلاح Firestore...');

class FirestoreFix {
  constructor() {
    this.alertShown = false;
    this.init();
  }

  init() {
    this.interceptFirestoreErrors();
    this.setupRetryMechanism();
    this.setupDataValidation();
    console.log('✅ أداة إصلاح Firestore جاهزة');
  }

  interceptFirestoreErrors() {
    // إتاحة تنظيف البيانات عالمياً
    window.cleanFirestoreData = (data) => {
      if (!data || typeof data !== 'object') return data;
      
      const cleaned = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // تنظيف المصفوفات من القيم الفارغة
            const cleanArray = value.filter(item => item !== undefined && item !== null && item !== '');
            if (cleanArray.length > 0) {
              cleaned[key] = cleanArray;
            }
          } else if (typeof value === 'object') {
            // تنظيف الكائنات المتداخلة
            const cleanObject = this.cleanObject(value);
            if (Object.keys(cleanObject).length > 0) {
              cleaned[key] = cleanObject;
            }
          } else if (typeof value === 'string' && value.trim() !== '') {
            // تنظيف النصوص
            cleaned[key] = value.trim();
          } else if (typeof value !== 'string') {
            // قيم أخرى (أرقام، منطق، etc)
            cleaned[key] = value;
          }
        }
      }
      return cleaned;
    };

    // اعتراض أخطاء الشبكة مع معالجة محسنة
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // التعامل مع أخطاء Firestore
        if (response.status === 400 && args[0].includes('firestore.googleapis.com')) {
          console.warn('🚨 Firestore 400 Error detected');
          console.log('🔧 Request details:', {
            url: args[0],
            status: response.status,
            headers: response.headers
          });
          
          // لا نعيد المحاولة تلقائياً لتجنب التكرار
          return response;
        }
        
        return response;
      } catch (error) {
        if (error.message.includes('firestore')) {
          console.error('❌ Firestore connection error:', error.message);
          // إرسال تحذير للمطور
          this.showFirestoreAlert();
        }
        throw error;
      }
    };
  }

  setupRetryMechanism() {
    // إضافة آلية إعادة المحاولة للعمليات المهمة
    window.firestoreRetry = async (operation, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await operation();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          
          console.warn(`محاولة ${i + 1} فشلت، إعادة المحاولة...`);
          await this.sleep(1000 * (i + 1)); // تأخير متدرج
        }
      }
    };
  }

  setupDataValidation() {
    // التحقق من صحة البيانات قبل الإرسال
    window.validateFirestoreData = (data) => {
      const cleanData = {};
      
      for (const [key, value] of Object.entries(data)) {
        // تنظيف القيم undefined والـ functions
        if (value !== undefined && typeof value !== 'function') {
          if (value === null) {
            cleanData[key] = null;
          } else if (Array.isArray(value)) {
            cleanData[key] = value.filter(item => item !== undefined);
          } else if (typeof value === 'object') {
            cleanData[key] = this.cleanObject(value);
          } else {
            cleanData[key] = value;
          }
        }
      }
      
      return cleanData;
    };
  }

  cleanObject(obj) {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && typeof value !== 'function') {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // أدوات التشخيص
  diagnoseFirestore() {
    console.log('🔍 تشخيص حالة Firestore...');
    
    // فحص الاتصال
    if (typeof window.firebase === 'undefined') {
      console.log('❌ Firebase غير محمل');
      return false;
    }
    
    // فحص Auth
    const authStatus = localStorage.getItem('firebase:authUser:AIzaSyDCQQxUbeQQrlty5HnF65-7TK0TB2zB7R4:[DEFAULT]');
    if (!authStatus || authStatus === 'null') {
      console.log('❌ لا يوجد مستخدم مسجل دخول');
      return false;
    }
    
    console.log('✅ Firestore يبدو أنه يعمل بشكل طبيعي');
    return true;
  }

  // إصلاح سريع للمشاكل الشائعة
  quickFix() {
    console.log('🔧 تطبيق إصلاحات سريعة...');
    
    // مسح البيانات المؤقتة
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('firestore') || name.includes('firebase')) {
            caches.delete(name);
          }
        });
      });
    }
    
    // إعادة تهيئة اتصال Firestore
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    console.log('✅ سيتم إعادة تحميل الصفحة خلال ثانيتين...');
  }

  // عرض تحذير Firestore
  showFirestoreAlert() {
    if (!this.alertShown) {
      console.log('🚨 مشكلة في الاتصال مع Firestore');
      console.log('💡 الحلول المقترحة:');
      console.log('   1. تحقق من الاتصال بالإنترنت');
      console.log('   2. استخدم cleanFirestoreData() لتنظيف البيانات');
      console.log('   3. استخدم firestoreRetry() لإعادة المحاولة');
      console.log('   4. اتصل بالدعم الفني إذا استمرت المشكلة');
      this.alertShown = true;
    }
  }

  // دالة معالجة البيانات المحسنة
  processClubData(clubData) {
    console.log('🔧 معالجة بيانات النادي...');
    
    const processedData = {
      name: clubData.name ? clubData.name.trim() : '',
      logo: clubData.logo || '',
      coverImage: clubData.coverImage || '',
      phone: clubData.phone ? clubData.phone.trim() : '',
      email: clubData.email ? clubData.email.trim() : '',
      address: clubData.address ? clubData.address.trim() : '',
      description: clubData.description ? clubData.description.trim() : '',
      website: clubData.website ? clubData.website.trim() : '',
      gallery: Array.isArray(clubData.gallery) ? clubData.gallery.filter(Boolean) : [],
      updatedAt: new Date().toISOString()
    };

    // إزالة الحقول الفارغة
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === '' || processedData[key] === null || processedData[key] === undefined) {
        delete processedData[key];
      }
    });

    console.log('✅ تم تنظيف البيانات:', processedData);
    return processedData;
  }
}

// تشغيل أداة الإصلاح
const firestoreFix = new FirestoreFix();

// تسجيل في الـ global scope لمنع التحميل المضاعف
window.FirestoreFix = FirestoreFix;

// إتاحة الأدوات للمطورين
window.firestoreFix = firestoreFix;
window.diagnoseFirestore = () => firestoreFix.diagnoseFirestore();
window.fixFirestore = () => firestoreFix.quickFix();
window.processClubData = (data) => firestoreFix.processClubData(data);

console.log('💡 الأوامر المتاحة:');
console.log('   - diagnoseFirestore() - تشخيص المشاكل');
console.log('   - fixFirestore() - إصلاح سريع');
console.log('   - firestoreRetry(operation) - إعادة محاولة العمليات');
console.log('   - cleanFirestoreData(data) - تنظيف البيانات');
console.log('   - processClubData(data) - معالجة بيانات النادي');

// إضافة نصيحة للاستخدام
setTimeout(() => {
  console.log('');
  console.log('🏆 نصيحة: استخدم cleanFirestoreData() قبل حفظ البيانات:');
  console.log('   const cleanedData = cleanFirestoreData(yourData);');
  console.log('   // ثم احفظ cleanedData');
}, 3000);

})(); // إنهاء IIFE 

# 🔧 حل مشكلة "Missing or insufficient permissions" في Firestore

## 🚨 المشكلة
```
FirebaseError: Missing or insufficient permissions.
```

## 🔍 السبب
قواعد Firestore لا تسمح بالوصول للمستخدمين غير المصادق عليهم.

## ✅ الحلول

### الحل الأول: نشر قواعد Firestore (مطلوب)

#### 1. تثبيت Firebase CLI
```bash
npm install -g firebase-tools
```

#### 2. تسجيل الدخول إلى Firebase
```bash
firebase login
```

#### 3. تهيئة المشروع
```bash
firebase init
```
- اختر Firestore
- اختر مشروعك: `hagzzgo-87884`
- استخدم القيم الافتراضية

#### 4. نشر القواعد
```bash
firebase deploy --only firestore:rules
```

### الحل الثاني: استخدام قواعد مؤقتة (للاختبار)

تم تحديث `firestore.rules` ليكون:
```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // للاختبار فقط
    }
  }
}
```

**⚠️ تحذير:** هذه القواعد تسمح بالوصول للجميع. استخدمها للاختبار فقط.

### الحل الثالث: قواعد آمنة للإنتاج

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // قاعدة أساسية
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // قواعد المستخدمين
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 اختبار الحل

### 1. فحص النظام
```bash
node scripts/quick-test.js
```

### 2. اختبار التسجيل
- انتقل إلى: `http://localhost:3000/auth/register`
- جرب تسجيل مستخدم جديد

### 3. اختبار الدخول
- انتقل إلى: `http://localhost:3000/auth/login`
- جرب الدخول بمستخدم موجود

### 4. اختبار API
```bash
curl -X POST http://localhost:3000/api/auth/check-user-exists \
  -H "Content-Type: application/json" \
  -d '{"phone": "201017799580"}'
```

## 🔍 تشخيص المشاكل

### 1. فحص Firebase Admin SDK
```bash
node scripts/debug-env.js
```

### 2. فحص قواعد Firestore
- انتقل إلى Firebase Console
- اذهب إلى Firestore > Rules
- تأكد من أن القواعد منشورة

### 3. فحص المشروع
- تأكد من أن المشروع `hagzzgo-87884` مفعل
- تأكد من أن Firestore مفعل
- تأكد من أن Authentication مفعل

## 📞 إذا استمرت المشكلة

### 1. تحقق من Console
افتح Developer Tools > Console وراجع الأخطاء.

### 2. تحقق من Network
افتح Developer Tools > Network وراجع طلبات Firebase.

### 3. تحقق من Firebase Console
- اذهب إلى Firebase Console
- تحقق من Authentication > Users
- تحقق من Firestore > Data

## 🎯 النتيجة المتوقعة

بعد تطبيق الحلول:
- ✅ التسجيل يعمل بدون أخطاء
- ✅ الدخول يعمل بدون أخطاء
- ✅ التحقق من وجود المستخدم يعمل
- ✅ إرسال OTP يعمل
- ✅ التحقق من OTP يعمل

## 🔒 ملاحظات الأمان

1. **للاختبار:** استخدم القواعد المؤقتة
2. **للإنتاج:** استخدم القواعد الآمنة
3. **دائماً:** تحقق من صلاحيات المستخدم
4. **أبداً:** لا تترك قواعد مفتوحة في الإنتاج

---

**💡 نصيحة:** ابدأ بالحل الأول (نشر قواعد Firestore) فهو الحل الصحيح والآمن. 

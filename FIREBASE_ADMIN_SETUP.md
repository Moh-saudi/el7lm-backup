# دليل إعداد Firebase Admin SDK - Firebase Admin SDK Setup Guide

## 🚀 الخطوات السريعة

### 1. الحصول على Service Account Key

1. **اذهب إلى Firebase Console**
   - https://console.firebase.google.com/
   - اختر مشروعك

2. **اذهب إلى Project Settings**
   - انقر على ⚙️ (الإعدادات) بجانب "Project Overview"
   - اختر "Project settings"

3. **اختر Service Accounts**
   - انقر على تبويب "Service accounts"
   - اختر "Firebase Admin SDK"

4. **انقر على "Generate new private key"**
   - سيتم تحميل ملف JSON
   - احفظ الملف في مكان آمن

### 2. استخراج المتغيرات البيئية

من الملف JSON المحمل، احصل على:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com"
}
```

### 3. تحديث ملف .env.local

```bash
# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
```

### 4. اختبار الإعداد

```bash
# تشغيل سكريبت التشخيص
node scripts/debug-firebase-admin.js
```

## 🔧 استكشاف الأخطاء

### مشكلة: "Missing or insufficient permissions"

#### الحلول:

1. **تأكد من نشر Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **تحقق من Service Account Permissions**
   - اذهب إلى Google Cloud Console
   - اختر مشروعك
   - اذهب إلى IAM & Admin > IAM
   - تأكد من أن Service Account له صلاحيات:
     - `Firebase Admin`
     - `Cloud Datastore User`
     - `Firebase Authentication Admin`

3. **تحقق من متغيرات البيئة**
   ```bash
   # تشغيل سكريبت التشخيص
   node scripts/debug-firebase-admin.js
   ```

4. **تأكد من تنسيق Private Key**
   - يجب أن يحتوي على `\n` للأسطر الجديدة
   - مثال:
   ```
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   ```

### مشكلة: "Project ID not found"

#### الحلول:

1. **تحقق من Project ID**
   - تأكد من أن `FIREBASE_PROJECT_ID` صحيح
   - يمكنك العثور عليه في Firebase Console > Project Settings

2. **تحقق من Service Account**
   - تأكد من أن Service Account ينتمي لنفس المشروع

### مشكلة: "Invalid private key"

#### الحلول:

1. **تأكد من تنسيق Private Key**
   - يجب أن يبدأ بـ `-----BEGIN PRIVATE KEY-----`
   - يجب أن ينتهي بـ `-----END PRIVATE KEY-----`
   - يجب أن يحتوي على `\n` للأسطر الجديدة

2. **تحقق من الاقتباسات**
   ```bash
   # صحيح
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
   
   # خاطئ
   FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n
   ```

## 📋 قائمة التحقق

- [ ] تم تحميل Service Account Key
- [ ] تم استخراج Project ID
- [ ] تم استخراج Private Key
- [ ] تم استخراج Client Email
- [ ] تم تحديث ملف .env.local
- [ ] تم نشر Firestore Rules
- [ ] تم اختبار الإعداد بنجاح

## 🔒 الأمان

### ⚠️ تحذيرات مهمة:

1. **لا تشارك Private Key**
   - احتفظ به في ملف .env.local فقط
   - لا تضعه في Git
   - لا تشاركه مع أي شخص

2. **استخدم .env.local**
   - هذا الملف لا يتم رفعه إلى Git
   - آمن لتخزين المفاتيح الخاصة

3. **في الإنتاج**
   - استخدم متغيرات بيئية آمنة
   - لا تستخدم ملفات JSON في الإنتاج

## 🆘 الحصول على المساعدة

إذا استمرت المشكلة:

1. **تحقق من سجلات Firebase**
   - اذهب إلى Firebase Console > Functions > Logs

2. **تحقق من سجلات التطبيق**
   - راقب console.log في المتصفح
   - راقب سجلات الخادم

3. **اختبر الاتصال**
   ```bash
   node scripts/debug-firebase-admin.js
   ```

4. **تحقق من Firestore Rules**
   - تأكد من أنها تسمح بالقراءة للمستخدمين المصادق عليهم 

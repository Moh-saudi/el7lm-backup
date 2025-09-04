# دليل النشر على Coolify

## إعدادات النشر المطلوبة

### 1. إعدادات Coolify الأساسية

#### Build Command:
```bash
npm install && npm run build
```

#### Start Command:
```bash
npm start
```

#### Port:
```
3000
```

### 2. متغيرات البيئة المطلوبة (Environment Variables)

يجب إضافة هذه المتغيرات في إعدادات Coolify:

#### Firebase Configuration:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### Firebase Admin SDK:
```
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Private_Key_Here\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=your_client_id
FIREBASE_ADMIN_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_ADMIN_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project.iam.gserviceaccount.com
```

#### Other Environment Variables:
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

### 3. خطوات النشر

1. **إضافة مصدر Git:**
   - اختر **Sources** من القائمة الجانبية
   - اضغط **Add Source**
   - اختر **Public Repository**
   - أدخل: `https://github.com/Moh-saudi/el7lm25.git`
   - اختر الفرع: `main`

2. **إنشاء تطبيق جديد:**
   - اختر **Projects** من القائمة الجانبية
   - اضغط **+ Add Resource**
   - اختر **Applications** → **Git Based** → **Public Repository**
   - اختر المصدر الذي أضفته
   - اختر السيرفر (localhost)

3. **إعدادات البناء:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Port:** `3000`

4. **إضافة متغيرات البيئة:**
   - في قسم **Environment Variables**
   - أضف جميع المتغيرات المذكورة أعلاه

5. **بدء النشر:**
   - اضغط **Deploy**
   - انتظر حتى اكتمال عملية البناء

### 4. استكشاف الأخطاء

#### إذا فشل البناء:
1. تحقق من متغيرات البيئة
2. تأكد من صحة مفاتيح Firebase
3. تحقق من سجلات البناء للحصول على تفاصيل الخطأ

#### إذا فشل التشغيل:
1. تحقق من أن المنفذ 3000 متاح
2. تأكد من صحة متغيرات Firebase Admin SDK
3. تحقق من سجلات التطبيق

### 5. ملفات مهمة للنشر

- `Dockerfile` - ملف Docker مخصص
- `.dockerignore` - ملفات مستبعدة من Docker
- `next.config.js` - إعدادات Next.js مع `output: 'standalone'`
- `package.json` - تبعيات المشروع

### 6. روابط مفيدة

- [Coolify Documentation](https://coolify.io/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)

---

## ملاحظات مهمة

1. **أمان:** لا تشارك مفاتيح Firebase في الكود العام
2. **الأداء:** استخدم `output: 'standalone'` لتحسين الأداء
3. **التحديثات:** كل تحديث في GitHub سيؤدي إلى نشر تلقائي
4. **النسخ الاحتياطية:** احتفظ بنسخة من متغيرات البيئة 

# إعداد متغيرات البيئة (Environment Variables)

## نظرة عامة

هذا المشروع يحتاج إلى عدة متغيرات بيئة للعمل بشكل صحيح. يرجى اتباع الخطوات التالية لإعدادها.

## الخطوة 1: نسخ ملف المثال

```bash
cp .env.example .env.local
```

## الخطوة 2: إعداد Firebase

### الحصول على بيانات Firebase:

1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك أو أنشئ مشروعاً جديداً
3. اذهب إلى **Project Settings** > **General**
4. انزل إلى قسم **Your apps** واضغط على **Web app**
5. انسخ بيانات التكوين

### تحديث `.env.local`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## الخطوة 3: إعداد Firebase Admin (اختياري)

للوصول إلى Firestore من الخادم:

1. اذهب إلى **Project Settings** > **Service accounts**
2. اضغط على **Generate new private key**
3. احفظ الملف وانسخ البيانات

```env
# Firebase Admin (Server-side only)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

## الخطوة 4: إعداد Supabase (اختياري)

للوصول إلى Supabase:

1. اذهب إلى [Supabase Dashboard](https://supabase.com/dashboard)
2. اختر مشروعك
3. اذهب إلى **Settings** > **API**
4. انسخ البيانات

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## الخطوة 5: إعداد Geidea (اختياري)

للدفع الإلكتروني:

```env
# Geidea Payment Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your-merchant-public-key
GEIDEA_API_PASSWORD=your-api-password
GEIDEA_WEBHOOK_SECRET=your-webhook-secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net
```

## الخطوة 6: إعداد Beon Chat (اختياري)

للرسائل والإشعارات:

```env
# Beon Chat API Configuration
BEON_API_KEY=your-beon-api-key
BEON_BASE_URL=https://beon.chat/api
```

## الخطوة 7: إعداد Google AI (اختياري)

للذكاء الاصطناعي:

```env
# Google AI Configuration
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

## الخطوة 8: إعداد Email (اختياري)

للرسائل الإلكترونية:

```env
# Email Configuration
EMAILJS_PUBLIC_KEY=your-emailjs-public-key
EMAILJS_SERVICE_ID=your-emailjs-service-id
EMAILJS_TEMPLATE_ID=your-emailjs-template-id
```

## الخطوة 9: إعدادات أخرى

```env
# Other Configuration
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

# Feature Flags
DISABLE_PAYMENT_FEATURES=false
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=true
```

## ملاحظات مهمة

### الأمان:
- **لا تشارك أبداً** ملف `.env.local` في Git
- **لا تشارك أبداً** المفاتيح الحقيقية
- استخدم `.env.example` للمشاركة مع المطورين

### التطوير:
- في وضع التطوير، يمكنك استخدام قيم وهمية
- النظام سيعمل مع تحذيرات إذا كانت المتغيرات ناقصة
- في الإنتاج، استخدم القيم الحقيقية دائماً

### البناء:
- في SonarCloud/Vercel، أضف المتغيرات في إعدادات البيئة
- لا تحتاج لإضافة ملف `.env.local` في المستودع

## استكشاف الأخطاء

### خطأ "Firebase configuration is missing":
1. تأكد من وجود ملف `.env.local`
2. تأكد من صحة أسماء المتغيرات
3. تأكد من عدم وجود مسافات إضافية

### خطأ "Invalid API key":
1. تأكد من نسخ المفتاح بشكل صحيح
2. تأكد من أن المفتاح صالح
3. تحقق من إعدادات Firebase

### خطأ "Project not found":
1. تأكد من صحة Project ID
2. تأكد من أن المشروع نشط
3. تحقق من الصلاحيات

## الدعم

إذا واجهت مشاكل في الإعداد:
1. تحقق من التوثيق الرسمي لكل خدمة
2. تأكد من صحة البيانات المنسوخة
3. تحقق من إعدادات الشبكة والجدار الناري

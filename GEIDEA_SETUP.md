# إعداد جيديا (Geidea) للدفع الإلكتروني

## المشكلة الحالية
تظهر رسالة تحذير: `⚠️ Geidea configuration incomplete - some features may not work`

## الحل

### 1. الحصول على بيانات جيديا
1. اذهب إلى [لوحة تحكم جيديا](https://merchant.geidea.net/)
2. سجل دخولك أو أنشئ حساب جديد
3. احصل على البيانات التالية:
   - **Merchant Public Key** (مفتاح التاجر العام)
   - **API Password** (كلمة مرور API)
   - **Webhook Secret** (سرية الويبهوك)

### 2. إعداد ملف .env.local
أضف البيانات التالية إلى ملف `.env.local` في مجلد المشروع:

```env
# Geidea Payment Gateway Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_public_key_here
GEIDEA_API_PASSWORD=your_api_password_here
GEIDEA_WEBHOOK_SECRET=your_webhook_secret_here
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. استبدال القيم
استبدل `your_*` بالقيم الحقيقية من لوحة تحكم جيديا:

```env
GEIDEA_MERCHANT_PUBLIC_KEY=3448c010-87b1-41e7-9771-cac444268cfb
GEIDEA_API_PASSWORD=edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0
GEIDEA_WEBHOOK_SECRET=your_webhook_secret_here
```

### 4. إعداد الويبهوك (اختياري)
إذا كنت تريد استقبال إشعارات الدفع:

1. في لوحة تحكم جيديا، أضف عنوان الويبهوك:
   ```
   https://your-domain.com/api/geidea/webhook
   ```

2. استبدل `your-domain.com` باسم النطاق الفعلي للتطبيق

### 5. اختبار الإعداد
1. أعد تشغيل خادم التطوير:
   ```bash
   npm run dev
   ```

2. اذهب إلى صفحة الدفع
3. جرب عملية دفع تجريبية
4. تأكد من عدم ظهور رسالة التحذير

## ملاحظات مهمة

### للتطوير المحلي
- استخدم `http://localhost:3000` كـ `NEXT_PUBLIC_BASE_URL`
- يمكن استخدام webhook.site للتطوير المحلي

### للإنتاج
- استخدم `https://your-domain.com` كـ `NEXT_PUBLIC_BASE_URL`
- تأكد من أن النطاق يدعم HTTPS
- أضف النطاق إلى قائمة النطاقات المسموحة في لوحة تحكم جيديا

### الأخطاء الشائعة
1. **مفاتيح غير صحيحة**: تأكد من نسخ المفاتيح بشكل صحيح
2. **نطاق غير مسموح**: أضف نطاقك إلى قائمة النطاقات المسموحة
3. **HTTPS مطلوب**: في الإنتاج، يجب استخدام HTTPS

## التحقق من الإعداد

### فحص التكوين
يمكنك فحص إعدادات جيديا عبر:
```
GET /api/geidea/config
```

### اختبار إنشاء جلسة
```
POST /api/geidea/create-session
{
  "amount": 100,
  "currency": "EGP",
  "orderId": "TEST_ORDER_123",
  "customerEmail": "test@example.com"
}
```

## الدعم
إذا واجهت مشاكل:
1. تحقق من صحة المفاتيح
2. تأكد من إعداد النطاق في لوحة تحكم جيديا
3. راجع سجلات الأخطاء في وحدة تحكم المتصفح
4. اتصل بدعم جيديا إذا لزم الأمر 

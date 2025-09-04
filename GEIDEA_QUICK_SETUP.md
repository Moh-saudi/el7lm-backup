# 🚀 إعداد Geidea السريع للإنتاج

## 🎯 الوضع الحالي
- ✅ Firebase: تم الإعداد بنجاح
- ❌ Geidea: يحتاج بيانات الإنتاج الحقيقية

## 📋 البيانات المطلوبة من Geidea

### 1. اذهب إلى لوحة تحكم Geidea
**الرابط**: https://merchant.geidea.net/

### 2. احصل على البيانات التالية:
```env
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_public_key
GEIDEA_API_PASSWORD=your_real_api_password  
GEIDEA_WEBHOOK_SECRET=your_real_webhook_secret
```

### 3. تحديث ملف .env.local

استبدل هذه الأسطر في ملف `.env.local`:

```env
# Geidea Payment Gateway Configuration - PRODUCTION
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_public_key
GEIDEA_API_PASSWORD=your_real_api_password
GEIDEA_WEBHOOK_SECRET=your_real_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 🔧 خطوات سريعة

### الخطوة 1: الحصول على البيانات
1. سجل دخول إلى https://merchant.geidea.net/
2. اذهب إلى "Settings" أو "API Keys"
3. انسخ البيانات المطلوبة

### الخطوة 2: تحديث الملف
افتح ملف `.env.local` واستبدل القيم الوهمية بالبيانات الحقيقية

### الخطوة 3: التحقق
```bash
node scripts/verify-geidea-config.js
```

### الخطوة 4: إعداد Webhook
في لوحة تحكم Geidea، أضف:
```
http://localhost:3000/api/geidea/webhook
```

## 🎯 النتيجة المتوقعة

بعد الإعداد:
- ✅ ستعمل المدفوعات في وضع الإنتاج
- ✅ ستتمكن من معالجة المدفوعات الحقيقية
- ✅ ستستقبل إشعارات الدفع

## 🚨 ملاحظات مهمة

- **لا تشارك بيانات Geidea مع أي شخص**
- **احتفظ بالبيانات آمنة**
- **في الإنتاج، استخدم HTTPS**

---

**هل تحتاج مساعدة في الحصول على بيانات Geidea أو تحديث الملف؟** 

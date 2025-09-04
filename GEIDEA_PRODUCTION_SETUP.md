# 🔥 إعداد Geidea في وضع الإنتاج

## 🎯 الهدف
إعداد Geidea Payment Gateway في وضع الإنتاج للتجربة النهائية

## 📋 المتطلبات

### 1. حساب تاجر في Geidea
- اذهب إلى: https://merchant.geidea.net/
- سجل حساب جديد أو استخدم حساب موجود
- احصل على بيانات الإنتاج (Production Credentials)

### 2. البيانات المطلوبة من لوحة تحكم Geidea

```env
# Geidea Production Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_public_key
GEIDEA_API_PASSWORD=your_real_api_password
GEIDEA_WEBHOOK_SECRET=your_real_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
```

## 🔧 خطوات الإعداد

### الخطوة 1: الحصول على بيانات الإنتاج
1. **سجل دخول إلى لوحة تحكم Geidea**
2. **اذهب إلى إعدادات الحساب**
3. **احصل على البيانات التالية:**
   - Merchant Public Key
   - API Password
   - Webhook Secret

### الخطوة 2: تحديث ملف .env.local

استبدل القيم الوهمية بالبيانات الحقيقية:

```env
# Geidea Payment Gateway Configuration - PRODUCTION
GEIDEA_MERCHANT_PUBLIC_KEY=your_real_merchant_public_key
GEIDEA_API_PASSWORD=your_real_api_password
GEIDEA_WEBHOOK_SECRET=your_real_webhook_secret
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### الخطوة 3: إعداد Webhook
في لوحة تحكم Geidea، أضف Webhook URL:
```
http://localhost:3000/api/geidea/webhook
```

### الخطوة 4: اختبار الإعداد
```bash
# تحقق من إعدادات Geidea
node scripts/verify-geidea-config.js
```

## 🚨 ملاحظات مهمة للإنتاج

### 1. الأمان
- **لا تشارك بيانات Geidea مع أي شخص**
- **احتفظ بالبيانات آمنة**
- **لا تضع البيانات في Git**

### 2. Webhook URLs
- **التطوير**: `http://localhost:3000/api/geidea/webhook`
- **الإنتاج**: `https://your-domain.com/api/geidea/webhook`

### 3. HTTPS
- **في الإنتاج، استخدم HTTPS فقط**
- **تأكد من أن شهادة SSL صحيحة**

## 🔍 التحقق من الإعداد

### اختبار التكوين
```bash
node scripts/verify-geidea-config.js
```

### اختبار إنشاء جلسة دفع
```bash
curl -X POST http://localhost:3000/api/geidea/create-session \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "EGP"}'
```

## 📞 الحصول على بيانات Geidea

### إذا لم يكن لديك حساب:
1. اذهب إلى: https://merchant.geidea.net/
2. انقر على "Sign Up"
3. املأ البيانات المطلوبة
4. احصل على بيانات الإنتاج

### إذا كان لديك حساب:
1. سجل دخول إلى لوحة التحكم
2. اذهب إلى "Settings" أو "API Keys"
3. انسخ البيانات المطلوبة

## 🎯 النتيجة المتوقعة

بعد الإعداد الصحيح:
- ✅ ستعمل المدفوعات في وضع الإنتاج
- ✅ ستستقبل إشعارات الدفع عبر Webhook
- ✅ ستتمكن من معالجة المدفوعات الحقيقية

---

**هل تحتاج مساعدة في الحصول على بيانات Geidea أو تحديث ملف .env.local؟** 

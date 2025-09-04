# دليل تصحيح مشاكل WhatsApp OTP

## المشاكل المحتملة والحلول

### 1. مشكلة التكوين الأساسي

#### المشكلة:
```
❌ تكوين WhatsApp Business API غير مكتمل
❌ تكوين Green API غير مكتمل
❌ لا يوجد تكوين صحيح للواتساب
```

#### الحل:
1. **إضافة متغيرات البيئة المطلوبة** في ملف `.env.local`:

```bash
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_id

# Green API (بديل)
GREEN_API_TOKEN=your_green_api_token
GREEN_API_INSTANCE=your_green_api_instance

# BeOn WhatsApp (بديل آخر)
BEON_WHATSAPP_TOKEN=your_beon_whatsapp_token
```

2. **الحصول على بيانات الاعتماد:**

#### WhatsApp Business API:
- اذهب إلى [Meta for Developers](https://developers.facebook.com/)
- أنشئ تطبيق جديد
- أضف WhatsApp Business API
- احصل على Access Token و Phone Number ID

#### Green API:
- اذهب إلى [Green API](https://green-api.com/)
- أنشئ حساب جديد
- احصل على Instance ID و API Token

#### BeOn WhatsApp:
- استخدم نفس token المستخدم في SMS
- أو احصل على token خاص بالواتساب من BeOn

### 2. مشكلة إرسال الرسائل

#### المشكلة:
```
❌ فشل في إرسال OTP عبر WhatsApp Business API
❌ فشل في إرسال OTP عبر Green API
```

#### الحلول:

1. **فحص رقم الهاتف:**
   - تأكد من أن الرقم يحتوي على رمز الدولة
   - مثال: `+966501234567` (السعودية)
   - مثال: `+201234567890` (مصر)

2. **فحص الرسالة:**
   - تأكد من أن الرسالة لا تحتوي على رموز غير مدعومة
   - استخدم النص العربي فقط
   - تجنب الرموز الخاصة

3. **فحص الحساب:**
   - تأكد من أن حساب WhatsApp Business مفعل
   - تأكد من أن الحساب متصل بالإنترنت
   - تأكد من عدم حظر الحساب

### 3. مشكلة الترخيص والموافقة

#### المشكلة:
```
❌ حساب غير مرخص
❌ لم يتم الموافقة على الرسائل
```

#### الحل:
1. **لـ WhatsApp Business API:**
   - احصل على موافقة Meta على رسائل OTP
   - أضف قالب رسالة OTP معتمد
   - انتظر مراجعة Meta (قد تستغرق أيام)

2. **لـ Green API:**
   - تأكد من أن الحساب مفعل
   - تأكد من عدم حظر الحساب
   - جرب إعادة تسجيل الدخول

### 4. مشكلة الشبكة والاتصال

#### المشكلة:
```
❌ خطأ في الاتصال بالخادم
❌ timeout في الطلب
```

#### الحل:
1. **فحص الاتصال بالإنترنت**
2. **فحص إعدادات Firewall**
3. **فحص إعدادات Proxy**
4. **جرب استخدام VPN**

### 5. مشكلة التكرار والحدود

#### المشكلة:
```
❌ تم تجاوز الحد الأقصى للطلبات
❌ يرجى الانتظار قبل إرسال طلب جديد
```

#### الحل:
1. **انتظار 5 ثوانٍ بين الطلبات**
2. **انتظار دقيقة واحدة بعد 3 طلبات**
3. **استخدام أرقام هواتف مختلفة للاختبار**

## خطوات الاختبار

### 1. فحص التكوين
```bash
# انتقل إلى صفحة الاختبار
http://localhost:3000/test-whatsapp-complete

# اضغط على "فحص التكوين"
```

### 2. اختبار BeOn WhatsApp (الأسهل)
```bash
# اضغط على "اختبار BeOn WhatsApp"
# استخدم نفس token المستخدم في SMS
```

### 3. اختبار Green API
```bash
# اضغط على "اختبار Green API"
# تأكد من إعداد الحساب بشكل صحيح
```

### 4. اختبار WhatsApp Business API
```bash
# اضغط على "اختبار WhatsApp Business"
# تأكد من الحصول على موافقة Meta
```

## التوصيات

### 1. البدء بـ BeOn WhatsApp
- الأسهل في الإعداد
- يستخدم نفس token المستخدم في SMS
- لا يحتاج موافقات إضافية

### 2. استخدام Green API كبديل
- سهل الإعداد نسبياً
- لا يحتاج موافقات معقدة
- يدعم الرسائل المباشرة

### 3. WhatsApp Business API للمشاريع الكبيرة
- يحتاج موافقات Meta
- أكثر استقراراً
- يدعم قوالب الرسائل

## روابط مفيدة

- [Meta for Developers](https://developers.facebook.com/)
- [Green API Documentation](https://green-api.com/docs/)
- [BeOn Chat API](https://beon.chat/)
- [WhatsApp Business API Guide](https://developers.facebook.com/docs/whatsapp)

## دعم فني

إذا استمرت المشاكل، يرجى:
1. فحص console المتصفح للأخطاء
2. فحص terminal الخادم للرسائل
3. مشاركة رسائل الخطأ مع فريق الدعم 

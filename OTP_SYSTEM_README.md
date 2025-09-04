# نظام OTP الموحد - El7lm

## نظرة عامة

تم تطوير نظام OTP موحد يدعم كلاً من SMS و WhatsApp حسب الدولة، مما يوفر تجربة تحقق مثالية للمستخدمين في جميع أنحاء العالم.

## الميزات الرئيسية

### 🌍 تحديد تلقائي حسب الدولة
- **الدول العربية**: تستخدم SMS عبر BeOn
- **الدول الأخرى**: تستخدم WhatsApp Business API
- **التبديل التلقائي**: إمكانية التبديل بين الطريقتين عند الحاجة

### 📱 دعم متعدد للخدمات
- **SMS**: عبر BeOn للدول العربية
- **WhatsApp Business API**: للدول الأخرى
- **WhatsApp Green API**: كبديل للـ Business API

### 🔒 أمان متقدم
- OTP من 6 أرقام
- صلاحية 5 دقائق
- حد أقصى 3 محاولات
- تحقق من صحة رقم الهاتف

## الملفات المضافة

### الخدمات
```
src/lib/whatsapp/whatsapp-service.ts          # خدمة WhatsApp
src/lib/utils/otp-service-selector.ts         # محدد نوع OTP حسب الدولة
```

### صفحات الاختبار
```
src/app/test-beon-new-api/page.tsx            # اختبار API الجديد لـ BeOn
```

### المكونات
```
src/components/shared/WhatsAppOTPVerification.tsx    # مكون WhatsApp OTP
src/components/shared/UnifiedOTPVerification.tsx     # مكون OTP موحد
```

### API Routes
```
src/app/api/whatsapp/send-otp/route.ts        # API إرسال WhatsApp OTP
```

### صفحات الاختبار
```
src/app/test-unified-otp/page.tsx             # صفحة اختبار النظام الموحد
```

## التكوين

### متغيرات البيئة المطلوبة

```bash
# BeOn SMS Configuration
BEON_SMS_TOKEN=vSCuMzZwLjDxzR882YphwEgW
BEON_SMS_TOKEN_REGULAR=SPb4sgedfe
BEON_SMS_TOKEN_TEMPLATE=SPb4sbemr5bwb7sjzCqTcL
BEON_SMS_TOKEN_BULK=nzQ7ytW8q6yfQdJRFM57yRfR
BEON_SENDER_NAME=El7lm
BEON_TEMPLATE_ID=133

# WhatsApp Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_ID=your_whatsapp_phone_id
GREEN_API_TOKEN=your_green_api_token
GREEN_API_INSTANCE=your_green_api_instance
```

### إعداد WhatsApp Business API

1. إنشاء حساب في [Meta for Developers](https://developers.facebook.com/)
2. إنشاء تطبيق WhatsApp Business
3. الحصول على Access Token و Phone ID
4. إضافة المتغيرات إلى `.env.local`

### إعداد WhatsApp Green API (اختياري)

1. التسجيل في [Green API](https://green-api.com/)
2. الحصول على Token و Instance ID
3. إضافة المتغيرات إلى `.env.local`

## الاستخدام

### استخدام المكون الموحد

```tsx
import UnifiedOTPVerification from '@/components/shared/UnifiedOTPVerification';

function MyComponent() {
  const [showOTP, setShowOTP] = useState(false);

  return (
    <UnifiedOTPVerification
      phoneNumber="+966501234567"
      name="أحمد محمد"
      isOpen={showOTP}
      onVerificationSuccess={(phone) => {
        console.log('تم التحقق من:', phone);
        setShowOTP(false);
      }}
      onVerificationFailed={(error) => {
        console.error('فشل التحقق:', error);
        setShowOTP(false);
      }}
      onClose={() => setShowOTP(false)}
    />
  );
}
```

### استخدام مكون منفصل

```tsx
// للـ SMS فقط
import SMSOTPVerification from '@/components/shared/SMSOTPVerification';

// للـ WhatsApp فقط
import WhatsAppOTPVerification from '@/components/shared/WhatsAppOTPVerification';
```

### تحديد نوع OTP برمجياً

```tsx
import { getOTPMethod, getCountryName } from '@/lib/utils/otp-service-selector';

const phoneNumber = "+966501234567";
const otpConfig = getOTPMethod(phoneNumber);
const countryName = getCountryName("+966");

console.log(otpConfig.method); // "sms"
console.log(countryName); // "السعودية"
```

## الدول المدعومة

### الدول العربية (SMS)
- السعودية (+966)
- الإمارات (+971)
- البحرين (+973)
- قطر (+974)
- الكويت (+965)
- عمان (+968)
- اليمن (+967)
- مصر (+20)
- المغرب (+212)
- الجزائر (+213)
- تونس (+216)
- ليبيا (+218)
- السودان (+249)
- الصومال (+252)
- جيبوتي (+253)
- لبنان (+961)
- الأردن (+962)
- سوريا (+963)
- العراق (+964)
- فلسطين (+970)
- إسرائيل (+972)
- إيران (+98)
- تركيا (+90)
- الهند (+91)
- باكستان (+92)
- بنغلاديش (+880)
- سريلانكا (+94)
- ميانمار (+95)
- جزر المالديف (+960)
- أفغانستان (+93)
- طاجيكستان (+992)
- تركمانستان (+993)
- أذربيجان (+994)
- جورجيا (+995)
- قيرغيزستان (+996)
- أوزبكستان (+998)
- بوتان (+975)
- منغوليا (+976)
- نيبال (+977)

### الدول الأخرى (WhatsApp)
- الولايات المتحدة وكندا (+1)
- المملكة المتحدة (+44)
- فرنسا (+33)
- ألمانيا (+49)
- إيطاليا (+39)
- إسبانيا (+34)
- هولندا (+31)
- بلجيكا (+32)
- سويسرا (+41)
- النمسا (+43)
- السويد (+46)
- النرويج (+47)
- الدنمارك (+45)
- فنلندا (+358)
- بولندا (+48)
- جمهورية التشيك (+420)
- سلوفاكيا (+421)
- المجر (+36)
- رومانيا (+40)
- أوكرانيا (+380)
- روسيا (+7)
- اليابان (+81)
- كوريا الجنوبية (+82)
- الصين (+86)
- هونغ كونغ (+852)
- ماكاو (+853)
- تايوان (+886)
- سنغافورة (+65)
- ماليزيا (+60)
- تايلاند (+66)
- فيتنام (+84)
- إندونيسيا (+62)
- الفلبين (+63)
- أستراليا (+61)
- نيوزيلندا (+64)
- بيرو (+51)
- المكسيك (+52)
- الأرجنتين (+54)
- البرازيل (+55)
- تشيلي (+56)
- كولومبيا (+57)
- فنزويلا (+58)
- الإكوادور (+593)
- باراغواي (+595)
- أوروغواي (+598)
- بوليفيا (+591)
- غيانا (+592)
- غيانا الفرنسية (+594)
- مارتينيك (+596)
- سورينام (+597)
- بليز (+501)
- غواتيمالا (+502)
- السلفادور (+503)
- هندوراس (+504)
- نيكاراغوا (+505)
- كوستاريكا (+506)
- بنما (+507)
- هايتي (+509)
- كوبا (+53)

## الاختبار

### صفحة الاختبار الموحدة
```
http://localhost:3000/test-unified-otp
```

### اختبار SMS
```
http://localhost:3000/test-sms-otp
```

### اختبار WhatsApp
```
http://localhost:3000/test-whatsapp-otp
```

## التطوير المستقبلي

### الميزات المخططة
- [ ] دعم المزيد من مزودي SMS
- [ ] دعم Telegram OTP
- [ ] دعم Email OTP كبديل
- [ ] تحسين واجهة المستخدم
- [ ] إضافة إحصائيات الاستخدام
- [ ] دعم اللغات المتعددة

### التحسينات التقنية
- [ ] تخزين مؤقت للـ OTP
- [ ] تحسين الأداء
- [ ] إضافة المزيد من الاختبارات
- [ ] تحسين معالجة الأخطاء

## API الجديد لـ BeOn

### تفاصيل API
- **Base URL**: `https://beon.chat/api/send/message/otp`
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Token**: `vSCuMzZwLjDxzR882YphwEgW`

### مثال cURL
```bash
curl -X POST "https://beon.chat/api/send/message/otp" \
     -H "Content-Type: multipart/form-data" \
     -H "beon-token: vSCuMzZwLjDxzR882YphwEgW" \
     -F "phoneNumber=+201122652572" \
     -F "name=gouda" \
     -F "type=sms" \
     -F "otp_length=4" \
     -F "lang=ar"
```

### الاستجابة المتوقعة
```json
{
    "status": 200,
    "message": "otp send",
    "data": "6278"
}
```

### المعاملات المدعومة
- `phoneNumber`: رقم الهاتف مع رمز الدولة
- `name`: اسم المستخدم
- `type`: نوع الرسالة (sms)
- `otp_length`: طول رمز التحقق (4 أو 6)
- `lang`: اللغة (ar أو en)

### صفحة الاختبار
```
http://localhost:3000/test-beon-new-api
```

## جميع خدمات BeOn

### 1. إرسال OTP (API الجديد)
```bash
curl -X POST "https://beon.chat/api/send/message/otp" \
     -H "Content-Type: multipart/form-data" \
     -H "beon-token: vSCuMzZwLjDxzR882YphwEgW" \
     -F "phoneNumber=+201122652572" \
     -F "name=gouda" \
     -F "type=sms" \
     -F "otp_length=4" \
     -F "lang=ar"
```

### 2. إرسال SMS عادي
```bash
curl -X POST "https://beon.chat/api/send/message/sms" \
     -H "Content-Type: application/json" \
     -H "beon-token: SPb4sgedfe" \
     -d '{
       "name": "BeOn Sales",
       "phoneNumber": "+201022337332",
       "message": "test beon"
     }'
```

### 3. إرسال SMS Template
```bash
curl -X POST "https://beon.chat/api/send/message/sms/template" \
     -H "Content-Type: application/json" \
     -H "beon-token: SPb4sbemr5bwb7sjzCqTcL" \
     -d '{
       "template_id": 133,
       "phoneNumber": "+20112",
       "name": "ahmed",
       "vars": ["1", "2"]
     }'
```

### 4. إرسال Bulk SMS
```bash
curl -X POST "https://beon.chat/api/send/message/sms/bulk" \
     -H "Content-Type: application/json" \
     -H "beon-token: nzQ7ytW8q6yfQdJRFM57yRfR" \
     -d '{
       "phoneNumbers": ["+201122652572"],
       "message": "hello from beon sms api"
     }'
```

### صفحة الاختبار الشاملة
```
http://localhost:3000/test-beon-complete
```

## الدعم

للمساعدة والدعم التقني:
- 📧 Email: info@el7lm.com
- 📱 WhatsApp: +201017799580
- 🌐 Website: https://el7lm.com

---

**تم التطوير بواسطة فريق El7lm** 🏆 

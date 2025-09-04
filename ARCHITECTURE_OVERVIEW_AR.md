# نظرة عامة على معمارية النظام

## التقنيات الأساسية
- Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- Firebase Auth/Admin/Firestore، Supabase (SSR/Storage)
- Geidea Payments (جلسات + Webhooks)، SMS BeOn، WhatsApp API
- Vercel (Build/Dev/Cron)، Docker/Compose

## مكونات عليا
- واجهة المستخدم: صفحات Dashboard متعددة الأدوار + مكونات مشتركة
- API Routes: مصادقة، مدفوعات، OTP (SMS/WhatsApp)، إشعارات، رفع وسائط
- خدمات: `src/lib/*` (Firebase/Supabase/Geidea/OTP/Notifications)

## التدفقات الحرجة (ملخص)
1) تسجيل/OTP: واجهة → `/api/sms|whatsapp/send-otp` → تخزين OTP → `/api/sms/verify-otp` → نجاح.
2) الدفع: واجهة → `/api/geidea/create-session|apple-pay-session` → Redirect/Direct Pay → Webhook → تحديث الاشتراك.
3) إدارة المستخدم: `/api/auth/*` للوصول والتحقق.

## الأمان والامتثال (حالي)
- رؤوس أمان + CSP، Rate limiting للمسارات الحساسة، Webhook توقيع + Idempotency.
- مراقبة: مسارات `/api/logs`, `/api/security-alerts` + تكامل Sentry (يتطلب مفاتيح).

## قابلية التوسع
- يمكن نقل Rate limit إلى Redis، إضافة Queue للمهام، وفصل واجهات القراءة/الكتابة إذا لزم.

## SLA/SLO (مقترح)
- توفر 99.9%، زمن استجابة صفحات حرجة < 300ms P50 / < 800ms P95، MTTR < 30 دقيقة.
- مراقبة عبر Sentry/لوحات قياس، تنبيهات فورية.

آخر تحديث: سيتم إدراجه لاحقاً



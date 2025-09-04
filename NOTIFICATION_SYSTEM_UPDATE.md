# تحديث نظام الإشعارات والهيدر الموحد

## نظرة عامة

تم تحديث نظام الإشعارات والهيدر لتوحيد التجربة عبر جميع لوحات التحكم وتحسين دقة البيانات المعروضة.

## المكونات الجديدة

### 1. مكون الإشعارات الموحد (`UnifiedNotificationsButton.tsx`)

**المميزات:**
- يجمع جميع أنواع الإشعارات (تفاعلية، ذكية، رسائل، نظامية)
- إحصائيات دقيقة في الوقت الفعلي
- تصنيف حسب الأولوية (منخفضة، متوسطة، عالية)
- إمكانية تحديد الكل كمقروء
- تصميم متجاوب مع الوضع المظلم

**الأنواع المدعومة:**
- `interactive`: إشعارات تفاعلية
- `smart`: إشعارات ذكية
- `message`: رسائل
- `system`: إشعارات نظامية

### 2. مكون الرسائل المحسن (`EnhancedMessageButton.tsx`)

**المميزات:**
- عرض الرسائل المرسلة والمستلمة
- إحصائيات مفصلة (إجمالي، غير مقروء، مرسل، مستلم، عاجل، اليوم)
- مؤشرات حالة القراءة
- دعم أنواع مختلفة من الرسائل (نص، صورة، ملف، نظام)
- صور المستخدمين مع أسماءهم

### 3. الهيدر الموحد (`UnifiedHeader.tsx`)

**المميزات:**
- تصميم موحد لجميع لوحات التحكم
- دعم جميع أنواع الحسابات
- عرض نوع الحساب والصلاحيات
- قائمة منسدلة للمستخدم مع خيارات متقدمة
- إمكانية تخصيص الإجراءات حسب نوع الحساب

### 4. خدمة الإشعارات الموحدة (`unified-notification-service.ts`)

**الوظائف الرئيسية:**
- إنشاء وإدارة الإشعارات والرسائل
- تحديث حالات القراءة
- جلب الإحصائيات
- دعم العمليات المجمعة (Batch Operations)

## كيفية الاستخدام

### استخدام الهيدر الموحد

```tsx
import UnifiedHeader from '@/components/layout/UnifiedHeader';

// للوحة تحكم المدير
<UnifiedHeader
  title="لوحة تحكم المدير"
  logo="/images/admin-avatar.svg"
  showNotifications={true}
  showMessages={true}
  showProfile={true}
  customActions={<AdminActions />}
/>

// للوحة تحكم اللاعب
<UnifiedHeader
  title="لوحة تحكم اللاعب"
  logo="/images/player-avatar.png"
  showNotifications={true}
  showMessages={true}
  showProfile={true}
  customActions={<PlayerActions />}
/>
```

### استخدام خدمة الإشعارات

```tsx
import { UnifiedNotificationService } from '@/lib/notifications/unified-notification-service';

// إنشاء إشعار جديد
await UnifiedNotificationService.createNotification({
  userId: 'user-id',
  type: 'interactive',
  title: 'عنوان الإشعار',
  message: 'محتوى الإشعار',
  priority: 'medium',
  accountType: 'player'
});

// إنشاء رسالة جديدة
await UnifiedNotificationService.createMessage({
  senderId: 'sender-id',
  receiverId: 'receiver-id',
  content: 'محتوى الرسالة',
  type: 'text',
  priority: 'medium',
  senderName: 'اسم المرسل'
});
```

## التحديثات في قاعدة البيانات

### مجموعة `notifications`
```typescript
{
  userId: string;
  type: 'interactive' | 'smart' | 'message' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  accountType: string;
  read: boolean;
  timestamp: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
}
```

### مجموعة `messages`
```typescript
{
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  priority: 'low' | 'medium' | 'high';
  senderName: string;
  senderAvatar?: string;
  read: boolean;
  timestamp: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  metadata?: Record<string, any>;
}
```

## المميزات الجديدة

### 1. إحصائيات دقيقة
- عدد الإشعارات غير المقروءة
- تصنيف حسب النوع والأولوية
- إحصائيات الرسائل (مرسل/مستلم)
- عدد الرسائل العاجلة واليومية

### 2. تجربة مستخدم محسنة
- تصميم موحد عبر جميع لوحات التحكم
- دعم الوضع المظلم
- واجهة متجاوبة
- مؤشرات بصرية للأولوية والحالة

### 3. أداء محسن
- استخدام العمليات المجمعة
- تحديثات في الوقت الفعلي
- تحسين استعلامات قاعدة البيانات

## الترحيل من النظام القديم

### 1. تحديث الهيدر الحالي
```tsx
// قبل
import NotificationsButton from '@/components/shared/NotificationsButton';

// بعد
import UnifiedNotificationsButton from '@/components/shared/UnifiedNotificationsButton';
import EnhancedMessageButton from '@/components/shared/EnhancedMessageButton';
```

### 2. استخدام الخدمة الموحدة
```tsx
// قبل
const notificationRef = doc(db, 'notifications', notificationId);
await updateDoc(notificationRef, { read: true });

// بعد
await UnifiedNotificationService.markNotificationAsRead(notificationId);
```

## الأمان والتحسينات

### 1. التحقق من الصلاحيات
- التحقق من نوع الحساب قبل عرض الإشعارات
- تقييد الوصول حسب الصلاحيات

### 2. تحسين الأداء
- استخدام الفهرسة المناسبة في Firestore
- تقييد عدد النتائج المعروضة
- استخدام العمليات المجمعة

### 3. معالجة الأخطاء
- معالجة شاملة للأخطاء
- رسائل خطأ واضحة للمستخدم
- تسجيل الأخطاء للتتبع

## الدعم والمساعدة

للاستفسارات أو المشاكل، يرجى التواصل مع فريق التطوير أو مراجعة الوثائق التقنية.


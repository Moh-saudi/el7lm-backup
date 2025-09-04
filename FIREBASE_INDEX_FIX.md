# 🔧 إصلاح أخطاء Firebase Index

## 🚨 **المشكلة الحالية**:
```
FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=...
```

## ✅ **الحل السريع**:

### **1. إنشاء الفهارس المطلوبة يدوياً**:

#### **الروابط المباشرة لإنشاء الفهارس**:

1. **فهرس الإشعارات**:
```
https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=ClNwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9ub3RpZmljYXRpb25zL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg0KCXRpbWVzdGFtcBACGgwKCF9fbmFtZV9fEAI
```

2. **فهرس الرسائل**:
```
https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9tZXNzYWdlcy9pbmRleGVzL18QARoOCgpyZWNlaXZlcklkEAEaDQoJdGltZXN0YW1wEAIaDAoIX19uYW1lX18QAg
```

### **2. إنشاء الفهارس يدوياً في Firebase Console**:

#### **الخطوات**:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك: `hagzzgo-87884`
3. اذهب إلى **Firestore Database**
4. اختر تبويب **Indexes**
5. اضغط **Create Index**

#### **الفهارس المطلوبة**:

**1. فهرس الإشعارات (notifications)**:
```
Collection ID: notifications
Fields:
- userId (Ascending)
- timestamp (Descending)
- __name__ (Ascending)
```

**2. فهرس الرسائل (messages)**:
```
Collection ID: messages
Fields:
- receiverId (Ascending)
- timestamp (Descending)
- __name__ (Ascending)
```

**3. فهرس المحادثات (conversations)**:
```
Collection ID: conversations
Fields:
- participants (Array contains)
- updatedAt (Descending)
- __name__ (Ascending)
```

**4. فهرس رسائل الدعم (support_messages)**:
```
Collection ID: support_messages
Fields:
- conversationId (Ascending)
- timestamp (Ascending)
- __name__ (Ascending)
```

**5. فهرس محادثات الدعم (support_conversations)**:
```
Collection ID: support_conversations
Fields:
- userId (Ascending)
- updatedAt (Descending)
- __name__ (Ascending)
```

**6. فهرس الإعلانات (ads)**:
```
Collection ID: ads
Fields:
- isActive (Ascending)
- priority (Descending)
- __name__ (Ascending)
```

**7. فهرس المستخدمين (users)**:
```
Collection ID: users
Fields:
- accountType (Ascending)
- createdAt (Descending)
- __name__ (Ascending)
```

**8. فهرس مستندات التحقق (verificationDocuments)**:
```
Collection ID: verificationDocuments
Fields:
- userId (Ascending)
- uploadedAt (Descending)
- __name__ (Ascending)
```

## 🚀 **الحل التلقائي**:

### **1. استخدام Firebase CLI**:

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init firestore

# نشر الفهارس
firebase deploy --only firestore:indexes
```

### **2. إنشاء ملف `firestore.indexes.json`**:

```json
{
  "indexes": [
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "__name__",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "receiverId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        },
        {
          "fieldPath": "__name__",
          "order": "ASCENDING"
        }
      ]
    }
  ]
}
```

## ⏱️ **وقت إنشاء الفهارس**:
- **الفهارس البسيطة**: 1-2 دقيقة
- **الفهارس المركبة**: 2-5 دقائق
- **المجموعات الكبيرة**: 5-15 دقيقة

## 🔄 **بعد إنشاء الفهارس**:
1. **انتظر حتى تنتهي عملية البناء**
2. **أعد تشغيل التطبيق**
3. **تأكد من عدم ظهور أخطاء Firebase**

## 🛠️ **إصلاح مؤقت في الكود**:

### **إضافة معالجة الأخطاء في الاستعلامات**:

```typescript
// في ملف الاستعلامات
try {
  const query = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );
  const snapshot = await getDocs(query);
  // معالجة البيانات
} catch (error: any) {
  if (error.code === 'failed-precondition') {
    console.warn('Index not ready, using fallback query');
    // استخدام استعلام بديل بدون ترتيب
    const fallbackQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(fallbackQuery);
    // ترتيب البيانات يدوياً
    const sortedData = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } else {
    console.error('Query error:', error);
  }
}
```

## 📞 **الدعم**:

إذا واجهت أي مشاكل:
1. تأكد من أن لديك صلاحيات إنشاء الفهارس
2. تحقق من أن المشروع صحيح
3. انتظر وقت كافي لبناء الفهارس
4. راجع [وثائق Firebase](https://firebase.google.com/docs/firestore/query-data/indexing)

## 🎯 **النتيجة المتوقعة**:
- ✅ **إزالة أخطاء Firebase Index**
- ✅ **تحسين أداء الاستعلامات**
- ✅ **تفعيل جميع الميزات**

---

**هل تريد المساعدة في إنشاء الفهارس؟** 🚀

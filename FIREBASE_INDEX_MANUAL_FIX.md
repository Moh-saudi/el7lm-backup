# 🔧 إصلاح Firebase Index يدوياً

## 🚨 المشكلة الحالية
```
Error fetching ads: FirebaseError: The query requires an index. You can create it here: 
https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=...
```

## ✅ الحل السريع

### **الطريقة الأولى - الرابط المباشر**:
انقر على الرابط التالي لإنشاء الفهرس المطلوب مباشرة:

🔗 **[إنشاء فهرس الإعلانات](https://console.firebase.google.com/v1/r/project/hagzzgo-87884/firestore/indexes?create_composite=Cklwcm9qZWN0cy9oYWd6emdvLTg3ODg0L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9hZHMvaW5kZXhlcy9fEAEaDAoIaXNBY3RpdmUQARoMCghwcmlvcml0eRACGgwKCF9fbmFtZV9fEAI)**

### **الطريقة الثانية - يدوياً من Firebase Console**:

#### **الخطوات**:
1. **اذهب إلى Firebase Console**:
   ```
   https://console.firebase.google.com
   ```

2. **اختر مشروعك**:
   - `hagzzgo-87884`

3. **اذهب إلى Firestore Database**:
   - اختر تبويب **Indexes**

4. **اضغط Create Index**

5. **أدخل البيانات التالية**:
   ```
   Collection ID: ads
   Fields:
   - isActive (Ascending)
   - priority (Descending)
   - __name__ (Ascending)
   ```

6. **اضغط Create**

## ⏱️ وقت الانتظار
- **الفهارس البسيطة**: 1-2 دقيقة
- **الفهارس المركبة**: 2-5 دقائق

## 🔍 التحقق من الإصلاح
1. انتظر حتى ينتهي بناء الفهرس
2. أعد تشغيل التطبيق
3. تحقق من عدم ظهور أخطاء Firebase Index في Console

## 📞 إذا استمرت المشكلة
- تأكد من أن المشروع صحيح: `hagzzgo-87884`
- تحقق من صلاحيات إنشاء الفهارس
- انتظر وقت إضافي لبناء الفهارس

---

**ملاحظة**: هذا الحل سيصلح مشكلة الإعلانات فقط. إذا كانت هناك مشاكل أخرى مع فهارس أخرى، سيتم حلها تلقائياً عند إنشاء هذا الفهرس.

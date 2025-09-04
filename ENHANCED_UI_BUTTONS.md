# أزرار الواجهة المحسنة لتتبع إجراءات الموظفين

## الأزرار الجديدة المطلوبة

### 1. **أزرار تتبع الإجراءات**

#### أ) **زر عرض سجل الإجراءات:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => showCustomerActions(customer)}
  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
>
  <History className="w-4 h-4 mr-1" />
  سجل الإجراءات
</Button>
```

#### ب) **زر تسجيل مكالمة:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => logCall(customer, 'answered', 'تم الاتصال بالعميل')}
  className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
>
  <Phone className="w-4 h-4 mr-1" />
  تسجيل مكالمة
</Button>
```

#### ج) **زر تسجيل رسالة:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => logMessage(customer, 'whatsapp', 'رسالة مرسلة')}
  className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
>
  <MessageSquare className="w-4 h-4 mr-1" />
  تسجيل رسالة
</Button>
```

#### د) **زر إضافة متابعة:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    setSelectedCustomerForFollowUp(customer);
    setShowFollowUpModal(true);
  }}
  className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
>
  <Calendar className="w-4 h-4 mr-1" />
  إضافة متابعة
</Button>
```

### 2. **أزرار AI والذكاء الاصطناعي**

#### أ) **زر توليد رد آلي:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={async () => {
    const aiResponse = await generateAIResponse('أريد معرفة المزيد عن الخدمات', customer);
    await logChatAction(customer, aiResponse, true);
  }}
  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
>
  <Bot className="w-4 h-4 mr-1" />
  رد آلي
</Button>
```

#### ب) **زر تقييم الأداء:**
```typescript
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    const score = calculateLeadScore(customer);
    alert(`نقاط العميل ${customer.name}: ${score}/100`);
  }}
  className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
>
  <BarChart3 className="w-4 h-4 mr-1" />
  تقييم الأداء
</Button>
```

### 3. **أزرار إدارة البيانات**

#### أ) **زر إزالة التكرارات:**
```typescript
<Button
  variant="outline"
  onClick={removeDuplicates}
  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
>
  <Trash2 className="w-4 h-4 mr-2" />
  إزالة التكرارات
</Button>
```

#### ب) **زر حذف جميع البيانات:**
```typescript
<Button
  variant="outline"
  onClick={deleteAllData}
  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
>
  <Database className="w-4 h-4 mr-2" />
  حذف جميع البيانات
</Button>
```

#### ج) **زر تحميل البيانات:**
```typescript
<Button
  variant="outline"
  onClick={() => loadCustomersFromFirebase()}
  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
>
  <RefreshCw className="w-4 h-4 mr-2" />
  تحديث البيانات
</Button>
```

## تنظيم الأزرار في الواجهة

### 1. **شريط الأدوات العلوي:**
```typescript
<div className="flex justify-between items-center mb-6">
  <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
  
  <div className="flex gap-2">
    <Button onClick={() => loadCustomersFromFirebase()} className="bg-blue-600 hover:bg-blue-700">
      <RefreshCw className="w-4 h-4 mr-2" />
      تحديث البيانات
    </Button>
    
    <Button onClick={removeDuplicates} className="bg-orange-600 hover:bg-orange-700">
      <Trash2 className="w-4 h-4 mr-2" />
      إزالة التكرارات
    </Button>
    
    <Button onClick={deleteAllData} className="bg-red-600 hover:bg-red-700">
      <Database className="w-4 h-4 mr-2" />
      حذف جميع البيانات
    </Button>
  </div>
</div>
```

### 2. **أزرار في جدول العملاء:**
```typescript
{customers.map(customer => (
  <tr key={customer.id}>
    <td>{customer.name}</td>
    <td>{customer.phone}</td>
    <td>{customer.type}</td>
    <td>
      <div className="flex gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => showCustomerActions(customer)}
          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
        >
          <History className="w-3 h-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => logCall(customer, 'answered')}
          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
        >
          <Phone className="w-3 h-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => logMessage(customer, 'whatsapp', 'رسالة')}
          className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"
        >
          <MessageSquare className="w-3 h-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectedCustomerForFollowUp(customer);
            setShowFollowUpModal(true);
          }}
          className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
        >
          <Calendar className="w-3 h-3" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const aiResponse = await generateAIResponse('مرحباً', customer);
            await logChatAction(customer, aiResponse, true);
          }}
          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
        >
          <Bot className="w-3 h-3" />
        </Button>
      </div>
    </td>
  </tr>
))}
```

### 3. **أزرار في تفاصيل العميل:**
```typescript
{selectedCustomer && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4">
      <h2 className="text-2xl font-bold mb-4">تفاصيل العميل: {selectedCustomer.name}</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <strong>الاسم:</strong> {selectedCustomer.name}
        </div>
        <div>
          <strong>الهاتف:</strong> {selectedCustomer.phone}
        </div>
        <div>
          <strong>النوع:</strong> {selectedCustomer.type}
        </div>
        <div>
          <strong>نقاط العميل:</strong> {calculateLeadScore(selectedCustomer)}/100
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => showCustomerActions(selectedCustomer)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <History className="w-4 h-4 mr-2" />
          سجل الإجراءات
        </Button>
        
        <Button
          onClick={() => logCall(selectedCustomer, 'answered')}
          className="bg-green-600 hover:bg-green-700"
        >
          <Phone className="w-4 h-4 mr-2" />
          تسجيل مكالمة
        </Button>
        
        <Button
          onClick={() => logMessage(selectedCustomer, 'whatsapp', 'رسالة')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          تسجيل رسالة
        </Button>
        
        <Button
          onClick={() => {
            setSelectedCustomerForFollowUp(selectedCustomer);
            setShowFollowUpModal(true);
          }}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          إضافة متابعة
        </Button>
        
        <Button
          onClick={async () => {
            const aiResponse = await generateAIResponse('مرحباً', selectedCustomer);
            await logChatAction(selectedCustomer, aiResponse, true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Bot className="w-4 h-4 mr-2" />
          رد آلي
        </Button>
      </div>
      
      <Button
        onClick={() => setSelectedCustomer(null)}
        className="mt-4 bg-gray-600 hover:bg-gray-700"
      >
        إغلاق
      </Button>
    </div>
  </div>
)}
```

## ألوان الأزرار المخصصة

### 1. **نظام الألوان:**
- **أزرق**: عرض البيانات والسجلات
- **أخضر**: المكالمات والاتصالات
- **بنفسجي**: الرسائل والمراسلات
- **برتقالي**: المتابعات والمواعيد
- **نيلي**: الذكاء الاصطناعي
- **أصفر**: التقييمات والإحصائيات
- **أحمر**: الحذف والعمليات الخطرة

### 2. **تطبيق الألوان:**
```typescript
// أزرار البيانات
className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"

// أزرار المكالمات
className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"

// أزرار الرسائل
className="bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200"

// أزرار المتابعات
className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"

// أزرار AI
className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"

// أزرار التقييم
className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"

// أزرار الحذف
className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
```

## تحسينات إضافية

### 1. **أيقونات معبرة:**
- `History`: لسجل الإجراءات
- `Phone`: للمكالمات
- `MessageSquare`: للرسائل
- `Calendar`: للمتابعات
- `Bot`: للذكاء الاصطناعي
- `BarChart3`: للتقييمات
- `RefreshCw`: للتحديث
- `Trash2`: للحذف
- `Database`: لقاعدة البيانات

### 2. **أحجام الأزرار:**
- `size="sm"`: للأزرار الصغيرة في الجدول
- `size="default"`: للأزرار العادية
- `size="lg"`: للأزرار الكبيرة

### 3. **أنواع الأزرار:**
- `variant="outline"`: للأزرار الثانوية
- `variant="default"`: للأزرار الأساسية
- `variant="destructive"`: لأزرار الحذف

هذا التنظيم يوفر واجهة واضحة ومنظمة لتتبع إجراءات الموظفين مع دعم كامل للذكاء الاصطناعي.








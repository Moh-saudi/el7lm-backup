# نظام تتبع إجراءات الموظفين في إدارة العملاء

## نظرة عامة على النظام الحالي

### 1. تتبع الإجراءات الأساسية

النظام الحالي يتتبع الإجراءات التالية للموظفين:

#### أ) حقول التتبع في قاعدة البيانات:
```typescript
interface Customer {
  // ... الحقول الأساسية ...
  lastAction?: string;           // آخر إجراء تم تنفيذه
  lastActionDate?: Date;         // تاريخ آخر إجراء
  lastActionBy?: string;         // اسم الموظف الذي نفذ الإجراء
  callHistory?: CallRecord[];    // سجل المكالمات
  messageHistory?: MessageRecord[]; // سجل الرسائل
  followUpHistory?: FollowUpRecord[]; // سجل المتابعات
}
```

#### ب) أنواع الإجراءات المسجلة:
- **المكالمات**: `logCall()` - تسجيل حالة المكالمة (تم الرد، مفقودة، مشغول، إلخ)
- **الرسائل**: `logMessage()` - تسجيل الرسائل المرسلة (واتساب، SMS، بريد إلكتروني)
- **المتابعات**: `addFollowUp()` - تسجيل متابعات العملاء

### 2. عرض البيانات في الجدول

يتم عرض إجراءات الموظفين في عمود "آخر إجراء" في جدول العملاء:

```typescript
// في جدول العملاء
{customer.lastAction ? (
  <div className="text-sm">
    <div className="font-medium">{customer.lastAction}</div>
    <div className="text-gray-500">
      {customer.lastActionDate ? new Date(customer.lastActionDate).toLocaleDateString('ar-EG') : ''}
    </div>
    {customer.lastActionBy && (
      <div className="text-xs text-blue-600">بواسطة: {customer.lastActionBy}</div>
    )}
  </div>
) : (
  <span className="text-gray-400">لا توجد إجراءات</span>
)}
```

## نظام الشات بوت الحالي

### 1. FloatingChatWidget
النظام يحتوي على مكون `FloatingChatWidget` الذي يوفر:
- واجهة محادثة دائمة
- إرسال واستقبال الرسائل
- تخزين المحادثات في Firebase
- تتبع حالة المحادثات

### 2. تكامل الشات بوت مع تتبع الإجراءات

#### أ) تسجيل رسائل الشات بوت:
```typescript
const logMessage = async (customer: Customer, type: MessageRecord['type'], content: string) => {
  const messageRecord: MessageRecord = {
    id: Date.now().toString(),
    date: new Date(),
    type, // 'whatsapp' | 'sms' | 'email' | 'chat'
    direction: 'sent',
    content,
    status: 'sent',
    by: 'admin' // يمكن تغييرها لاسم المستخدم الحالي
  };
  
  // تحديث سجل الرسائل في Firebase
  await updateDoc(customerRef, {
    messageHistory: updatedMessageHistory,
    lastAction: `رسالة ${type === 'whatsapp' ? 'واتساب' : type === 'sms' ? 'SMS' : 'بريد إلكتروني'}`,
    lastActionDate: new Date(),
    lastActionBy: 'admin',
    updatedAt: new Date()
  });
};
```

## تحسينات مقترحة للنظام

### 1. تحسين تتبع الموظفين

#### أ) إضافة معلومات أكثر تفصيلاً:
```typescript
interface EmployeeAction {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  action: string;
  actionType: 'call' | 'message' | 'follow_up' | 'chat' | 'visit';
  customerId: string;
  customerName: string;
  timestamp: Date;
  duration?: number; // للمكالمات
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  accuracy?: number; // دقة الإجابة (0-100)
  satisfaction?: number; // رضا العميل (1-5)
  tags?: string[];
}
```

#### ب) إضافة نظام تقييم الأداء:
```typescript
interface PerformanceMetrics {
  employeeId: string;
  period: 'daily' | 'weekly' | 'monthly';
  totalActions: number;
  successfulActions: number;
  averageAccuracy: number;
  averageSatisfaction: number;
  responseTime: number; // متوسط وقت الاستجابة
  resolutionRate: number; // معدل حل المشاكل
}
```

### 2. تحسين واجهة عرض البيانات

#### أ) إضافة صفحة تفاصيل العميل المحسنة:
```typescript
// عرض سجل كامل للإجراءات
const CustomerActionHistory = ({ customer }: { customer: Customer }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">سجل الإجراءات</h3>
      
      {/* المكالمات */}
      {customer.callHistory && customer.callHistory.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">المكالمات</h4>
          {customer.callHistory.map(call => (
            <div key={call.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">{call.status}</span>
                <span className="text-sm text-gray-600 ml-2">بواسطة: {call.by}</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(call.date).toLocaleDateString('ar-EG')}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* الرسائل */}
      {customer.messageHistory && customer.messageHistory.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 mb-2">الرسائل</h4>
          {customer.messageHistory.map(message => (
            <div key={message.id} className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">{message.type}</span>
                <span className="text-sm text-gray-600 ml-2">بواسطة: {message.by}</span>
              </div>
              <div className="text-sm text-gray-500">
                {new Date(message.date).toLocaleDateString('ar-EG')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

#### ب) إضافة لوحة تحكم للموظفين:
```typescript
const EmployeeDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* إحصائيات سريعة */}
      <Card>
        <CardHeader>
          <CardTitle>إجمالي الإجراءات اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{todayActions}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>معدل الدقة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{accuracyRate}%</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>متوسط رضا العملاء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{satisfactionRate}/5</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>وقت الاستجابة المتوسط</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{avgResponseTime} دقيقة</div>
        </CardContent>
      </Card>
    </div>
  );
};
```

### 3. تحسين نظام الشات بوت

#### أ) إضافة مكتبات الذكاء الاصطناعي:
```bash
npm install @google/generative-ai openai langchain
```

#### ب) تكامل مع نماذج الذكاء الاصطناعي:
```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

const generateResponse = async (message: string, customerContext: Customer) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const prompt = `
    أنت مساعد خدمة عملاء في أكاديمية كرة القدم.
    معلومات العميل: ${customerContext.name}, ${customerContext.type}, ${customerContext.country}
    رسالة العميل: ${message}
    
    أجب بطريقة مهنية ومفيدة باللغة العربية.
  `;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
```

#### ج) تحسين تتبع المحادثات:
```typescript
interface EnhancedChatMessage {
  id: string;
  message: string;
  isBot: boolean;
  timestamp: Date;
  customerId: string;
  employeeId?: string;
  accuracy?: number;
  satisfaction?: number;
  tags?: string[];
  context?: {
    customerType: string;
    previousMessages: string[];
    customerMood?: string;
  };
}
```

## كيفية استخدام النظام

### 1. تسجيل إجراء جديد:
```typescript
// تسجيل مكالمة
await logCall(customer, 'answered', 'تم الاتصال بالعميل وشرح الخدمات');

// تسجيل رسالة
await logMessage(customer, 'whatsapp', 'مرحباً! كيف يمكنني مساعدتك؟');

// إضافة متابعة
await addFollowUp(customer);
```

### 2. عرض سجل الإجراءات:
```typescript
// في جدول العملاء
{customers.map(customer => (
  <tr key={customer.id}>
    <td>{customer.name}</td>
    <td>{customer.phone}</td>
    <td>
      {customer.lastAction && (
        <div>
          <div>{customer.lastAction}</div>
          <div className="text-sm text-gray-500">
            {new Date(customer.lastActionDate).toLocaleDateString('ar-EG')}
          </div>
          <div className="text-xs text-blue-600">
            بواسطة: {customer.lastActionBy}
          </div>
        </div>
      )}
    </td>
  </tr>
))}
```

### 3. تصفية وترتيب البيانات:
```typescript
// ترتيب حسب آخر إجراء
const sortedCustomers = customers.sort((a, b) => {
  const aDate = a.lastActionDate || new Date(0);
  const bDate = b.lastActionDate || new Date(0);
  return bDate.getTime() - aDate.getTime();
});

// تصفية حسب الموظف
const filteredByEmployee = customers.filter(customer => 
  customer.lastActionBy === selectedEmployee
);
```

## الخلاصة

النظام الحالي يوفر أساساً جيداً لتتبع إجراءات الموظفين، ولكن يمكن تحسينه من خلال:

1. **إضافة معلومات أكثر تفصيلاً** عن كل إجراء
2. **تحسين واجهة العرض** لتسهيل مراجعة البيانات
3. **تكامل أفضل مع الشات بوت** لتتبع المحادثات
4. **إضافة نظام تقييم الأداء** للموظفين
5. **استخدام الذكاء الاصطناعي** لتحسين الردود

هذه التحسينات ستساعد في:
- تتبع أفضل لأداء الموظفين
- تحسين خدمة العملاء
- زيادة كفاءة العمل
- تحليل البيانات لاتخاذ قرارات أفضل








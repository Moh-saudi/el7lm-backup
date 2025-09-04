# تنفيذ المكتبات المجانية وتحسين نظام تتبع إجراءات الموظفين

## المكتبات المجانية المثبتة

### 1. **Axios** - للاتصال بـ APIs
```bash
npm install axios
```
**الاستخدام:**
- الاتصال بخدمات AI المجانية
- إرسال طلبات HTTP
- معالجة الردود

### 2. **Node-fetch** - للطلبات البديلة
```bash
npm install node-fetch@2
```
**الاستخدام:**
- طلبات HTTP بديلة
- دعم أفضل للمتصفحات القديمة

## خدمات AI المجانية المستخدمة

### 1. **Hugging Face Inference API**
```typescript
// مثال على استخدام Hugging Face
const generateAIResponse = async (message: string, customerContext: Customer): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      {
        inputs: `أنت مساعد خدمة عملاء في أكاديمية كرة القدم. العميل: ${customerContext.name}, النوع: ${customerContext.type}. رسالة العميل: ${message}. أجب بطريقة مهنية ومفيدة باللغة العربية.`,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || 'hf_demo'}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text;
    }
    
    return 'شكراً لك على رسالتك. سنقوم بالرد عليك قريباً.';
  } catch (error) {
    console.error('خطأ في توليد رد AI:', error);
    return 'مرحباً! كيف يمكنني مساعدتك اليوم؟';
  }
};
```

### 2. **خدمات AI مجانية أخرى يمكن استخدامها:**

#### أ) **OpenAI API (مجاني محدود)**
```typescript
const generateOpenAIResponse = async (message: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'أنت مساعد خدمة عملاء في أكاديمية كرة القدم. أجب باللغة العربية بطريقة مهنية ومفيدة.'
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 150
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('خطأ في OpenAI:', error);
    return 'مرحباً! كيف يمكنني مساعدتك؟';
  }
};
```

#### ب) **Cohere API (مجاني محدود)**
```typescript
const generateCohereResponse = async (message: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command',
        prompt: `أنت مساعد خدمة عملاء في أكاديمية كرة القدم. أجب باللغة العربية: ${message}`,
        max_tokens: 100,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.generations[0].text;
  } catch (error) {
    console.error('خطأ في Cohere:', error);
    return 'مرحباً! كيف يمكنني مساعدتك؟';
  }
};
```

## تحسينات نظام تتبع إجراءات الموظفين

### 1. **هياكل البيانات المحسنة**

#### أ) **Customer Interface المحسن:**
```typescript
interface Customer {
  // الحقول الأساسية
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'registered' | 'potential' | 'vip';
  group: string;
  date: string;
  status: 'active' | 'inactive' | 'pending';
  
  // حقول تتبع الإجراءات المحسنة
  createdAt?: Date;
  updatedAt?: Date;
  lastAction?: string;
  lastActionDate?: Date;
  lastActionBy?: string;
  callHistory?: CallRecord[];
  messageHistory?: MessageRecord[];
  followUpHistory?: FollowUpRecord[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  nextFollowUp?: Date;
  tags?: string[];
  assignedTo?: string;
  leadScore?: number;
  
  // حقول جديدة لتتبع الأداء
  totalInteractions?: number;
  lastInteractionDate?: Date;
  satisfactionScore?: number;
  responseTime?: number; // بالدقائق
}
```

#### ب) **CallRecord المحسن:**
```typescript
interface CallRecord {
  id: string;
  date: Date;
  duration?: number;
  status: 'answered' | 'missed' | 'busy' | 'no-answer' | 'wrong-number';
  notes?: string;
  by: string;
  outcome?: 'positive' | 'negative' | 'neutral' | 'follow-up-needed';
  accuracy?: number; // دقة الإجابة (0-100)
  satisfaction?: number; // رضا العميل (1-5)
}
```

#### ج) **MessageRecord المحسن:**
```typescript
interface MessageRecord {
  id: string;
  date: Date;
  type: 'whatsapp' | 'sms' | 'email' | 'chat';
  direction: 'sent' | 'received';
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  by: string;
  response?: string;
  accuracy?: number;
  satisfaction?: number;
  isBot?: boolean; // جديد: لتتبع الردود الآلية
}
```

### 2. **الدوال المحسنة لتتبع الإجراءات**

#### أ) **دالة تسجيل مكالمة محسنة:**
```typescript
const logCall = async (customer: Customer, status: CallRecord['status'], notes?: string) => {
  const callRecord: CallRecord = {
    id: Date.now().toString(),
    date: new Date(),
    status,
    notes,
    by: userData?.displayName || userData?.email || 'admin',
    outcome: status === 'answered' ? 'positive' : 'follow-up-needed'
  };

  try {
    const customerRef = doc(db, 'customers', customer.id);
    const updatedCallHistory = [...(customer.callHistory || []), callRecord];
    
    await updateDoc(customerRef, {
      callHistory: updatedCallHistory,
      lastAction: `مكالمة - ${status === 'answered' ? 'تم الرد' : status === 'missed' ? 'مفقودة' : status === 'busy' ? 'مشغول' : 'لا يرد'}`,
      lastActionDate: new Date(),
      lastActionBy: userData?.displayName || userData?.email || 'admin',
      updatedAt: new Date(),
      totalInteractions: (customer.totalInteractions || 0) + 1,
      lastInteractionDate: new Date()
    });

    await loadCustomersFromFirebase();
    alert('تم تسجيل المكالمة بنجاح');
  } catch (error) {
    console.error('خطأ في تسجيل المكالمة:', error);
    alert('خطأ في تسجيل المكالمة');
  }
};
```

#### ب) **دالة تسجيل رسالة محسنة:**
```typescript
const logMessage = async (customer: Customer, type: MessageRecord['type'], content: string) => {
  const messageRecord: MessageRecord = {
    id: Date.now().toString(),
    date: new Date(),
    type,
    direction: 'sent',
    content,
    status: 'sent',
    by: userData?.displayName || userData?.email || 'admin'
  };

  try {
    const customerRef = doc(db, 'customers', customer.id);
    const updatedMessageHistory = [...(customer.messageHistory || []), messageRecord];
    
    await updateDoc(customerRef, {
      messageHistory: updatedMessageHistory,
      lastAction: `رسالة ${type === 'whatsapp' ? 'واتساب' : type === 'sms' ? 'SMS' : 'بريد إلكتروني'}`,
      lastActionDate: new Date(),
      lastActionBy: userData?.displayName || userData?.email || 'admin',
      updatedAt: new Date(),
      totalInteractions: (customer.totalInteractions || 0) + 1,
      lastInteractionDate: new Date()
    });

    await loadCustomersFromFirebase();
    alert('تم تسجيل الرسالة بنجاح');
  } catch (error) {
    console.error('خطأ في تسجيل الرسالة:', error);
    alert('خطأ في تسجيل الرسالة');
  }
};
```

#### ج) **دالة تسجيل إجراء شات بوت:**
```typescript
const logChatAction = async (customer: Customer, message: string, isBot: boolean = false) => {
  const chatRecord: MessageRecord = {
    id: Date.now().toString(),
    date: new Date(),
    type: 'chat',
    direction: isBot ? 'sent' : 'received',
    content: message,
    status: 'sent',
    by: isBot ? 'ChatBot' : (userData?.displayName || userData?.email || 'admin'),
    isBot
  };

  try {
    const customerRef = doc(db, 'customers', customer.id);
    const updatedMessageHistory = [...(customer.messageHistory || []), chatRecord];
    
    await updateDoc(customerRef, {
      messageHistory: updatedMessageHistory,
      lastAction: isBot ? 'رد شات بوت' : 'رسالة شات',
      lastActionDate: new Date(),
      lastActionBy: isBot ? 'ChatBot' : (userData?.displayName || userData?.email || 'admin'),
      updatedAt: new Date(),
      totalInteractions: (customer.totalInteractions || 0) + 1,
      lastInteractionDate: new Date()
    });

    await loadCustomersFromFirebase();
  } catch (error) {
    console.error('خطأ في تسجيل إجراء الشات:', error);
  }
};
```

### 3. **دالة عرض تفاصيل إجراءات العميل**

```typescript
const showCustomerActions = (customer: Customer) => {
  const actions = [];
  
  // جمع المكالمات
  if (customer.callHistory && customer.callHistory.length > 0) {
    actions.push(...customer.callHistory.map(call => ({
      type: 'call',
      title: `مكالمة - ${call.status}`,
      date: call.date,
      by: call.by,
      details: call.notes || '',
      accuracy: call.accuracy,
      satisfaction: call.satisfaction
    })));
  }
  
  // جمع الرسائل
  if (customer.messageHistory && customer.messageHistory.length > 0) {
    actions.push(...customer.messageHistory.map(msg => ({
      type: 'message',
      title: `رسالة ${msg.type}`,
      date: msg.date,
      by: msg.by,
      details: msg.content,
      accuracy: msg.accuracy,
      satisfaction: msg.satisfaction,
      isBot: msg.isBot
    })));
  }
  
  // جمع المتابعات
  if (customer.followUpHistory && customer.followUpHistory.length > 0) {
    actions.push(...customer.followUpHistory.map(follow => ({
      type: 'followup',
      title: `متابعة - ${follow.type}`,
      date: follow.date,
      by: follow.by,
      details: follow.notes,
      priority: follow.priority
    })));
  }
  
  // ترتيب الإجراءات حسب التاريخ
  actions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // تنسيق التفاصيل
  const actionDetails = actions.map(action => {
    let details = `${action.title}\nالتاريخ: ${new Date(action.date).toLocaleDateString('ar-EG')}\nبواسطة: ${action.by}\nالتفاصيل: ${action.details}`;
    
    if (action.accuracy !== undefined) {
      details += `\nالدقة: ${action.accuracy}%`;
    }
    
    if (action.satisfaction !== undefined) {
      details += `\nالرضا: ${action.satisfaction}/5`;
    }
    
    if (action.isBot) {
      details += '\n(رد آلي)';
    }
    
    if (action.priority) {
      details += `\nالأولوية: ${action.priority}`;
    }
    
    return details;
  }).join('\n\n');
  
  alert(`سجل إجراءات ${customer.name}:\n\n${actionDetails}`);
};
```

### 4. **دالة حساب نقاط العميل المحسنة**

```typescript
const calculateLeadScore = (customer: Customer): number => {
  let score = 0;
  
  // نقاط حسب النوع
  switch (customer.type) {
    case 'vip': score += 50; break;
    case 'registered': score += 30; break;
    case 'potential': score += 10; break;
  }

  // نقاط حسب المكالمات
  if (customer.callHistory) {
    score += customer.callHistory.length * 5;
    customer.callHistory.forEach(call => {
      if (call.status === 'answered') score += 10;
      if (call.outcome === 'positive') score += 15;
      if (call.satisfaction && call.satisfaction >= 4) score += 10;
    });
  }

  // نقاط حسب الرسائل
  if (customer.messageHistory) {
    score += customer.messageHistory.length * 3;
    customer.messageHistory.forEach(msg => {
      if (msg.status === 'read') score += 5;
      if (msg.satisfaction && msg.satisfaction >= 4) score += 8;
    });
  }

  // نقاط حسب المتابعات
  if (customer.followUpHistory) {
    score += customer.followUpHistory.length * 2;
    customer.followUpHistory.forEach(follow => {
      if (follow.completed) score += 5;
      if (follow.priority === 'high') score += 10;
      if (follow.priority === 'urgent') score += 20;
    });
  }

  // نقاط حسب الأولوية
  switch (customer.priority) {
    case 'urgent': score += 30; break;
    case 'high': score += 20; break;
    case 'medium': score += 10; break;
  }

  // نقاط حسب رضا العميل
  if (customer.satisfactionScore) {
    score += customer.satisfactionScore * 5;
  }

  return Math.min(score, 100); // الحد الأقصى 100 نقطة
};
```

## كيفية استخدام النظام المحسن

### 1. **تسجيل إجراء جديد:**
```typescript
// تسجيل مكالمة
await logCall(customer, 'answered', 'تم الاتصال بالعميل وشرح الخدمات');

// تسجيل رسالة
await logMessage(customer, 'whatsapp', 'مرحباً! كيف يمكنني مساعدتك؟');

// تسجيل رد شات بوت
await logChatAction(customer, 'مرحباً! كيف يمكنني مساعدتك؟', true);

// إضافة متابعة
await addFollowUp(customer);
```

### 2. **عرض سجل الإجراءات:**
```typescript
// عرض تفاصيل إجراءات العميل
showCustomerActions(customer);
```

### 3. **استخدام AI للردود:**
```typescript
// توليد رد آلي
const aiResponse = await generateAIResponse('أريد معرفة المزيد عن البرامج التدريبية', customer);
await logChatAction(customer, aiResponse, true);
```

## المميزات الجديدة

### 1. **تتبع شامل للإجراءات:**
- تسجيل جميع المكالمات والرسائل والمتابعات
- تتبع الموظف المسؤول عن كل إجراء
- تسجيل الدقة ورضا العميل
- تمييز الردود الآلية

### 2. **نظام نقاط متقدم:**
- حساب نقاط العميل بناءً على عدة معايير
- تتبع الأداء والتفاعل
- تحديد الأولويات

### 3. **تكامل AI مجاني:**
- استخدام خدمات AI مجانية للردود
- تحسين خدمة العملاء
- تقليل العبء على الموظفين

### 4. **واجهة محسنة:**
- عرض إحصائيات سريعة
- تصفية وترتيب متقدم
- عرض تفاصيل الإجراءات

## الخطوات التالية

1. **إضافة المزيد من خدمات AI المجانية**
2. **تحسين خوارزمية حساب النقاط**
3. **إضافة تقارير وإحصائيات مفصلة**
4. **تحسين واجهة عرض الإجراءات**
5. **إضافة نظام تنبيهات للمتابعات**

هذا النظام يوفر تتبعاً شاملاً لإجراءات الموظفين مع دعم AI مجاني لتحسين خدمة العملاء.








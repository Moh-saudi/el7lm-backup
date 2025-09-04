export interface MessageTemplate {
  id: string;
  category: 'success' | 'error' | 'info';
  title: string;
  template: string;
  variables: string[];
  description: string;
}

export interface MessageContext {
  userName: string;
  amount: number;
  currency: string;
  packageType?: string;
  packagePrice?: number;
  receiptNumber?: string;
  extractedAmount?: number;
  phoneNumber?: string;
  platformName?: string;
}

export const messageTemplates: MessageTemplate[] = [
  // Success Templates
  {
    id: 'payment_verified_success',
    category: 'success',
    title: 'تأكيد الدفع بنجاح',
    template: `✅ تم تفعيل اشتراكك {userName}! المبلغ {amount}{currency} - منصة الحلم`,
    variables: ['userName', 'amount', 'currency'],
    description: 'رسالة تأكيد نجاح التحقق وتفعيل الباقة'
  },
  {
    id: 'payment_received',
    category: 'success', 
    title: 'استلام الإيصال',
    template: `📨 تم استلام إيصالك {userName}، سيراجع خلال 24 ساعة - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة تأكيد استلام الإيصال'
  },

  // Error Templates
  {
    id: 'amount_mismatch',
    category: 'error',
    title: 'عدم تطابق المبلغ',
    template: `⚠️ {userName} المبلغ غير مطابق. المطلوب {amount}{currency} - منصة الحلم`,
    variables: ['userName', 'amount', 'currency'],
    description: 'رسالة عند عدم تطابق المبلغ'
  },
  {
    id: 'receipt_error',
    category: 'error',
    title: 'خطأ في الإيصال',
    template: `❌ {userName} لم نتمكن من قراءة الإيصال. أرسل صورة واضحة - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة عند فشل قراءة الإيصال'
  },
  {
    id: 'payment_not_received',
    category: 'error',
    title: 'عدم وصول الدفعة',
    template: `⚠️ {userName} لم تصل الدفعة بعد. سيراجع خلال 24 ساعة - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة عند عدم وصول الدفعة للمنصة'
  },
  {
    id: 'amount_exceeds_package',
    category: 'error',
    title: 'المبلغ أكبر من قيمة الباقة',
    template: `💰 {userName} المبلغ زائد عن الباقة. سيضاف للرصيد - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة عند زيادة المبلغ عن قيمة الباقة'
  },
  {
    id: 'package_not_available',
    category: 'error',
    title: 'الباقة غير متوفرة',
    template: `📦 {userName} الباقة غير متوفرة. تواصل معنا للبدائل - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة عند عدم توفر الباقة'
  },

  // Info Templates
  {
    id: 'under_review',
    category: 'info',
    title: 'تحت المراجعة',
    template: `🔍 {userName} إيصالك تحت المراجعة اليدوية خلال 48 ساعة - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة إعلام بالمراجعة اليدوية'
  },
  {
    id: 'receipt_number_extracted',
    category: 'info',
    title: 'رقم الإيصال مستخرج',
    template: `📋 {userName} رقم إيصالك {receiptNumber} تحت المراجعة - منصة الحلم`,
    variables: ['userName', 'receiptNumber'],
    description: 'رسالة مع رقم الإيصال المستخرج'
  },
  {
    id: 'payment_confirmed',
    category: 'success',
    title: 'تأكيد الدفع',
    template: `✅ {userName} تم تأكيد دفعتك {amount}{currency} - منصة الحلم`,
    variables: ['userName', 'amount', 'currency'],
    description: 'رسالة قصيرة لتأكيد الدفع'
  },
  {
    id: 'receipt_unclear',
    category: 'error',
    title: 'إيصال غير واضح',
    template: `❌ {userName} الإيصال غير واضح، أرسل صورة أفضل - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة قصيرة عند عدم وضوح الإيصال'
  },
  {
    id: 'contact_support',
    category: 'info',
    title: 'تواصل مع الدعم',
    template: `📞 {userName} تواصل معنا لمراجعة دفعتك - منصة الحلم`,
    variables: ['userName'],
    description: 'رسالة قصيرة لطلب التواصل'
  }
];

export class MessageTemplateService {
  static getTemplate(templateId: string): MessageTemplate | undefined {
    return messageTemplates.find(t => t.id === templateId);
  }

  static getTemplatesByCategory(category: 'success' | 'error' | 'info'): MessageTemplate[] {
    return messageTemplates.filter(t => t.category === category);
  }

  static formatMessage(templateId: string, context: MessageContext): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id "${templateId}" not found`);
    }

    let message = template.template;
    
    // Replace variables with context values
    const contextWithDefaults = {
      platformName: 'منصة الحلم',
      ...context,
      // Calculate difference if needed
      difference: context.extractedAmount && context.amount 
        ? Math.abs(context.extractedAmount - context.amount)
        : 0
    };

    // Replace all variables
    template.variables.forEach(variable => {
      const value = contextWithDefaults[variable as keyof typeof contextWithDefaults];
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      message = message.replace(regex, String(value || ''));
    });

    return message;
  }

  static extractReceiptNumber(ocrText: string): string | null {
    // Try to extract receipt number from OCR text
    const patterns = [
      /رقم.*?(\d{6,})/i,
      /ref.*?(\d{6,})/i,
      /reference.*?(\d{6,})/i,
      /receipt.*?(\d{6,})/i,
      /إيصال.*?(\d{6,})/i,
      /مرجع.*?(\d{6,})/i,
    ];

    for (const pattern of patterns) {
      const match = ocrText.match(pattern);
      if (match) {
        return match[1];
      }
    }

    // Fallback: look for any 6+ digit number
    const numberMatch = ocrText.match(/\d{6,}/);
    return numberMatch ? numberMatch[0] : null;
  }
}

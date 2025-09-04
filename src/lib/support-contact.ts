// معلومات التواصل مع الدعم الفني
export const SUPPORT_CONTACT = {
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'info@el7lm.com',
  whatsapp: {
    qatar: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_QATAR || '+97472053188',
    egypt: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_EGYPT || '+201017799580'
  },
  website: 'https://el7lm.com',
  contactForm: '/contact'
};

// دالة للحصول على رسالة خطأ موحدة للحسابات المعطلة
export const getInvalidAccountMessage = (accountType: string | undefined) => {
  return `مشكلة تقنية في حسابك

نوع الحساب: ${accountType || 'غير محدد'}

الحلول المقترحة:
• تواصل مع الدعم الفني عبر البريد الإلكتروني: ${SUPPORT_CONTACT.email}
• أو عبر الواتساب: ${SUPPORT_CONTACT.whatsapp.qatar} أو ${SUPPORT_CONTACT.whatsapp.egypt}
• أو عبر نموذج الدعم في الموقع: ${SUPPORT_CONTACT.contactForm}

سيقوم فريق الدعم بحل المشكلة في أقرب وقت ممكن.`;
};

// دالة للحصول على معلومات التواصل المنسقة
export const getContactInfo = () => {
  return {
    email: SUPPORT_CONTACT.email,
    whatsappQatar: SUPPORT_CONTACT.whatsapp.qatar,
    whatsappEgypt: SUPPORT_CONTACT.whatsapp.egypt,
    contactForm: SUPPORT_CONTACT.contactForm
  };
};

// دالة لإنشاء رابط واتساب
export const getWhatsAppLink = (phone: string, message: string = '') => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone.replace('+', '')}?text=${encodedMessage}`;
};

// دالة لإنشاء رابط بريد إلكتروني
export const getEmailLink = (subject: string = '', body: string = '') => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${SUPPORT_CONTACT.email}?subject=${encodedSubject}&body=${encodedBody}`;
}; 

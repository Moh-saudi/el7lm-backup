// Geidea Payment Gateway Client
// Helper functions for interacting with Geidea API

export interface GeideaSessionData {
  amount: number;
  currency?: string;
  orderId: string;
  customerEmail: string;
  customerName?: string;
}

export interface GeideaSessionResponse {
  success: boolean;
  sessionId?: string;
  orderId?: string;
  redirectUrl?: string;
  message?: string;
  error?: string;
  details?: string;
}

/**
 * إنشاء جلسة دفع جديدة مع Geidea
 */
export async function createGeideaSession(data: GeideaSessionData): Promise<GeideaSessionResponse> {
  try {
    const response = await fetch('/api/geidea/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: data.amount,
        currency: data.currency || 'EGP',
        orderId: data.orderId,
        customerEmail: data.customerEmail,
        customerName: data.customerName || 'Customer'
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Geidea session creation failed:', result);
      return {
        success: false,
        error: result.error || 'Failed to create payment session',
        details: result.details || 'Unknown error'
      };
    }

    return {
      success: true,
      sessionId: result.sessionId,
      orderId: result.orderId,
      redirectUrl: result.redirectUrl,
      message: result.message
    };

  } catch (error) {
    console.error('Error creating Geidea session:', error);
    return {
      success: false,
      error: 'Network error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * توجيه المستخدم لصفحة الدفع
 */
export function redirectToGeideaPayment(redirectUrl: string): void {
  if (typeof window !== 'undefined' && redirectUrl) {
    window.location.href = redirectUrl;
  }
}

/**
 * إنشاء معرف طلب فريد
 */
export function generateOrderId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `order_${timestamp}_${random}`;
}

/**
 * تنسيق المبلغ للعرض
 */
export function formatAmount(amount: number, currency: string = 'EGP'): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * التحقق من صحة المبلغ
 */
export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 100000; // حد أقصى 100,000
}

/**
 * إنشاء بيانات اختبار للدفع
 */
export function createTestPaymentData(): GeideaSessionData {
  return {
    amount: 100,
    currency: 'EGP',
    orderId: generateOrderId(),
    customerEmail: 'test@example.com',
    customerName: 'Test Customer'
  };
} 

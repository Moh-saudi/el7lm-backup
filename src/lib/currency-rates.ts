// نظام أسعار العملات - Currency Rates System
// ==============================================

// أسعار العملات الثابتة (كحل مؤقت)
const FIXED_RATES = {
  USD: 1,
  EGP: 31.5,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  KWD: 0.31,
  QAR: 3.64,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  LBP: 15000,
  SDG: 600,
  YER: 250,
  IQD: 1310,
  SYP: 13000,
  TND: 3.12,
  DZD: 134,
  MAD: 10.1,
  LYD: 4.8
};

// معلومات العملات
const CURRENCY_INFO = {
  USD: { symbol: '$', name: 'دولار أمريكي' },
  EGP: { symbol: 'ج.م', name: 'جنيه مصري' },
  EUR: { symbol: '€', name: 'يورو' },
  GBP: { symbol: '£', name: 'جنيه إسترليني' },
  SAR: { symbol: 'ر.س', name: 'ريال سعودي' },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي' },
  KWD: { symbol: 'د.ك', name: 'دينار كويتي' },
  QAR: { symbol: 'ر.ق', name: 'ريال قطري' },
  BHD: { symbol: 'د.ب', name: 'دينار بحريني' },
  OMR: { symbol: 'ر.ع', name: 'ريال عماني' },
  JOD: { symbol: 'د.أ', name: 'دينار أردني' },
  LBP: { symbol: 'ل.ل', name: 'ليرة لبنانية' },
  SDG: { symbol: 'ج.س', name: 'جنيه سوداني' },
  YER: { symbol: 'ر.ي', name: 'ريال يمني' },
  IQD: { symbol: 'د.ع', name: 'دينار عراقي' },
  SYP: { symbol: 'ل.س', name: 'ليرة سورية' },
  TND: { symbol: 'د.ت', name: 'دينار تونسي' },
  DZD: { symbol: 'د.ج', name: 'دينار جزائري' },
  MAD: { symbol: 'د.م', name: 'درهم مغربي' },
  LYD: { symbol: 'د.ل', name: 'دينار ليبي' }
};

// Cache للأسعار
let ratesCache: typeof FIXED_RATES | null = null;
let lastUpdate = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ساعة

// دالة الحصول على أسعار العملات
export const getCurrencyRates = async (): Promise<typeof FIXED_RATES> => {
  try {
    // التحقق من Cache
    if (ratesCache && (Date.now() - lastUpdate) < CACHE_DURATION) {
      return ratesCache;
    }

    // محاولة الحصول على الأسعار من API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    
    if (response.ok) {
      const data = await response.json();
      ratesCache = data.rates;
      lastUpdate = Date.now();
      return ratesCache;
    }
  } catch (error) {
    console.warn('فشل في الحصول على أسعار العملات من API، استخدام الأسعار الثابتة');
  }

  // استخدام الأسعار الثابتة كحل احتياطي
  ratesCache = FIXED_RATES;
  lastUpdate = Date.now();
  return FIXED_RATES;
};

// دالة تحويل العملة
export const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string, rates: typeof FIXED_RATES): number => {
  if (fromCurrency === toCurrency) return amount;
  
  const fromRate = rates[fromCurrency as keyof typeof FIXED_RATES] || 1;
  const toRate = rates[toCurrency as keyof typeof FIXED_RATES] || 1;
  
  // تحويل إلى USD أولاً ثم إلى العملة المطلوبة
  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
};

// دالة الحصول على معلومات العملة
export const getCurrencyInfo = (currency: string, rates: typeof FIXED_RATES) => {
  return CURRENCY_INFO[currency as keyof typeof CURRENCY_INFO];
};

// دالة الحصول على عمر الأسعار
export const getRatesAge = (): number => {
  return Date.now() - lastUpdate;
};

// دالة إجبار تحديث الأسعار
export const forceUpdateRates = async (): Promise<typeof FIXED_RATES> => {
  ratesCache = null;
  lastUpdate = 0;
  return await getCurrencyRates();
};

// دالة تنسيق المبلغ
export const formatAmount = (amount: number, currency: string, rates: typeof FIXED_RATES): string => {
  const currencyInfo = getCurrencyInfo(currency, rates);
  const symbol = currencyInfo?.symbol || currency;
  
  return `${symbol} ${amount.toFixed(2)}`;
};

// دالة التحقق من صحة العملة
export const isValidCurrency = (currency: string): boolean => {
  return currency in FIXED_RATES;
};

// دالة الحصول على قائمة العملات المدعومة
export const getSupportedCurrencies = (): string[] => {
  return Object.keys(FIXED_RATES);
};

// تصدير الأسعار الثابتة للاستخدام المباشر
export { FIXED_RATES, CURRENCY_INFO }; 

// نظام تحويل العملات التلقائي - محدث بتاريخ ديسمبر 2024
// جميع الأسعار محسوبة مقابل الجنيه المصري (EGP)

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: Currency;
  convertedAmount: number;
  convertedCurrency: Currency;
  exchangeRate: number;
  formattedOriginal: string;
  formattedConverted: string;
}

// أسعار الصرف الحالية - ديسمبر 2024 (Fallback)
let EXCHANGE_RATES_TO_EGP: Record<string, number> = {
  // العملات العربية والخليجية
  'SAR': 13.47,   // الريال السعودي
  'QAR': 13.88,   // الريال القطري  
  'AED': 13.76,   // الدرهم الإماراتي
  'KWD': 165.02,  // الدينار الكويتي
  'BHD': 134.39,  // الدينار البحريني
  'OMR': 131.30,  // الريال العماني
  'JOD': 71.27,   // الدينار الأردني
  'LBP': 0.0006,  // الليرة اللبنانية
  'MAD': 5.53,    // الدرهم المغربي
  'TND': 17.21,   // الدينار التونسي
  'DZD': 0.39,    // الدينار الجزائري
  'LYD': 9.30,    // الدينار الليبي
  'SYP': 0.004,   // الليرة السورية
  'IQD': 0.039,   // الدينار العراقي
  'YER': 0.21,    // الريال اليمني
  'SOS': 0.088,   // الشلن الصومالي
  'SDG': 0.084,   // الجنيه السوداني
  
  // العملات الدولية الرئيسية
  'USD': 50.53,   // الدولار الأمريكي
  'EUR': 58.25,   // اليورو
  'GBP': 68.06,   // الجنيه البريطاني
  'CHF': 61.82,   // الفرنك السويسري
  'CAD': 36.92,   // الدولار الكندي
  'AUD': 32.94,   // الدولار الأسترالي
  'NZD': 30.55,   // الدولار النيوزيلندي
  'JPY': 0.35,    // الين الياباني
  'CNY': 7.03,    // اليوان الصيني
  'KRW': 0.037,   // الوون الكوري الجنوبي
  'INR': 0.58,    // الروبية الهندية
  'PKR': 0.18,    // الروبية الباكستانية
  'BDT': 0.41,    // التاكا البنغلاديشية
  'LKR': 0.17,    // الروبية السريلانكية
  'THB': 1.55,    // الباht التايلاندي
  'SGD': 39.36,   // الدولار السنغافوري
  'MYR': 11.89,   // الرينغت الماليزي  
  'IDR': 0.003,   // الروبية الإندونيسية
  'PHP': 0.89,    // البيزو الفلبيني
  'VND': 0.002,   // الدونغ الفيتنامي
  'RUB': 0.64,    // الروبل الروسي
  'TRY': 1.28,    // الليرة التركية
  'PLN': 13.62,   // الزلوتي البولندي
  'CZK': 2.35,    // الكرونة التشيكية
  'HUF': 0.14,    // الفورنت المجري
  'SEK': 5.26,    // الكرونة السويدية
  'NOK': 5.07,    // الكرونة النرويجية
  'DKK': 7.80,    // الكرونة الدنماركية
  'ZAR': 2.82,    // الراند الجنوب أفريقي
  'NGN': 0.033,   // النايرا النيجيرية
  'GHS': 4.91,    // السيدي الغاني
  'KES': 0.39,    // الشلن الكيني
  'UGX': 0.014,   // الشلن الأوغندي
  'TZS': 0.019,   // الشلن التنزاني
  'ETB': 0.37,    // البر الإثيوبي
  'BRL': 9.20,    // الريال البرازيلي
  'ARS': 0.044,   // البيزو الأرجنتيني
  'COP': 0.012,   // البيزو الكولومبي
  'CLP': 0.054,   // البيزو التشيلي
  'PEN': 14.02,   // السول البيروفي
  'MXN': 2.66,    // البيزو المكسيكي
  'EGP': 1.0,     // الجنيه المصري (المرجع)
};

// نظام Cache للأسعار
interface CacheData {
  rates: Record<string, number>;
  lastUpdated: number;
  expiresIn: number; // بالميلي ثانية
}

let ratesCache: CacheData | null = null;
const CACHE_DURATION = 3600000; // ساعة واحدة بالميلي ثانية

/**
 * جلب أسعار الصرف المحدثة من API خارجي
 */
async function fetchLatestRates(): Promise<Record<string, number> | null> {
  try {
    console.log('🔄 جاري تحديث أسعار الصرف...');
    
    // استخدام ExchangeRate-API (مجاني 1500 طلب شهرياً)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/EGP', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.rates) {
      throw new Error('Invalid API response format');
    }

    // تحويل الأسعار من EGP إلى العملات الأخرى إلى العكس (العملات إلى EGP)
    const convertedRates: Record<string, number> = {};
    
    Object.entries(data.rates as Record<string, number>).forEach(([currency, rate]) => {
      if (typeof rate === 'number' && rate > 0) {
        // إذا كان 1 EGP = 0.02 USD، فإن 1 USD = 50 EGP
        convertedRates[currency] = 1 / rate;
      }
    });

    // إضافة EGP كمرجع
    convertedRates['EGP'] = 1.0;

    console.log(`✅ تم تحديث ${Object.keys(convertedRates).length} عملة بنجاح`);
    console.log('📊 بعض الأسعار المحدثة:', {
      USD: convertedRates.USD?.toFixed(2),
      EUR: convertedRates.EUR?.toFixed(2), 
      SAR: convertedRates.SAR?.toFixed(2),
      QAR: convertedRates.QAR?.toFixed(2)
    });

    return convertedRates;

  } catch (error) {
    console.error('❌ فشل في تحديث أسعار الصرف:', error);
    return null;
  }
}

/**
 * الحصول على أسعار الصرف (مع Cache)
 */
async function getRates(): Promise<Record<string, number>> {
  const now = Date.now();
  
  // التحقق من صحة Cache
  if (ratesCache && 
      ratesCache.lastUpdated && 
      (now - ratesCache.lastUpdated) < CACHE_DURATION) {
    console.log('💾 استخدام أسعار الصرف من Cache');
    return ratesCache.rates;
  }

  // محاولة تحديث الأسعار
  const newRates = await fetchLatestRates();
  
  if (newRates) {
    // تحديث Cache
    ratesCache = {
      rates: { ...EXCHANGE_RATES_TO_EGP, ...newRates },
      lastUpdated: now,
      expiresIn: CACHE_DURATION
    };
    
    // تحديث الأسعار الافتراضية أيضاً
    EXCHANGE_RATES_TO_EGP = { ...EXCHANGE_RATES_TO_EGP, ...newRates };
    
    return ratesCache.rates;
  }

  // في حالة فشل التحديث، استخدم الأسعار الافتراضية
  console.log('⚠️ استخدام أسعار الصرف الافتراضية');
  return EXCHANGE_RATES_TO_EGP;
}

/**
 * إجبار تحديث أسعار الصرف
 */
export async function forceUpdateRates(): Promise<boolean> {
  ratesCache = null; // مسح Cache
  const newRates = await getRates();
  return newRates !== EXCHANGE_RATES_TO_EGP;
}

/**
 * الحصول على آخر تحديث للأسعار
 */
export function getLastUpdateTime(): Date | null {
  return ratesCache?.lastUpdated ? new Date(ratesCache.lastUpdated) : null;
}

export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rateToEGP: number; // كم جنيه مصري يساوي وحدة واحدة من هذه العملة
}

export const CURRENCY_RATES: Record<string, CurrencyRate> = {
  'SAR': {
    code: 'SAR',
    name: 'ريال سعودي',
    symbol: 'ر.س',
    rateToEGP: 13.47
  },
  'QAR': {
    code: 'QAR',
    name: 'ريال قطري',
    symbol: 'ر.ق',
    rateToEGP: 13.88
  },
  'AED': {
    code: 'AED',
    name: 'درهم إماراتي',
    symbol: 'د.إ',
    rateToEGP: 13.76
  },
  'KWD': {
    code: 'KWD',
    name: 'دينار كويتي',
    symbol: 'د.ك',
    rateToEGP: 165.02
  },
  'BHD': {
    code: 'BHD',
    name: 'دينار بحريني',
    symbol: 'د.ب',
    rateToEGP: 134.39
  },
  'OMR': {
    code: 'OMR',
    name: 'ريال عماني',
    symbol: 'ر.ع',
    rateToEGP: 131.30
  },
  'JOD': {
    code: 'JOD',
    name: 'دينار أردني',
    symbol: 'د.أ',
    rateToEGP: 71.27
  },
  'LBP': {
    code: 'LBP',
    name: 'ليرة لبنانية',
    symbol: 'ل.ل',
    rateToEGP: 0.0006
  },
  'MAD': {
    code: 'MAD',
    name: 'درهم مغربي',
    symbol: 'د.م',
    rateToEGP: 5.53
  },
  'TND': {
    code: 'TND',
    name: 'دينار تونسي',
    symbol: 'د.ت',
    rateToEGP: 17.21
  },
  'DZD': {
    code: 'DZD',
    name: 'دينار جزائري',
    symbol: 'د.ج',
    rateToEGP: 0.39
  },
  'LYD': {
    code: 'LYD',
    name: 'دينار ليبي',
    symbol: 'د.ل',
    rateToEGP: 9.30
  },
  'SYP': {
    code: 'SYP',
    name: 'ليرة سورية',
    symbol: 'ل.س',
    rateToEGP: 0.004
  },
  'IQD': {
    code: 'IQD',
    name: 'دينار عراقي',
    symbol: 'د.ع',
    rateToEGP: 0.039
  },
  'YER': {
    code: 'YER',
    name: 'ريال يمني',
    symbol: 'ر.ي',
    rateToEGP: 0.21
  },
  'SDG': {
    code: 'SDG',
    name: 'جنيه سوداني',
    symbol: 'ج.س',
    rateToEGP: 0.084
  },
  'USD': {
    code: 'USD',
    name: 'دولار أمريكي',
    symbol: '$',
    rateToEGP: 50.53
  },
  'EUR': {
    code: 'EUR',
    name: 'يورو',
    symbol: '€',
    rateToEGP: 58.25
  },
  'EGP': {
    code: 'EGP',
    name: 'جنيه مصري',
    symbol: 'ج.م',
    rateToEGP: 1.0
  }
};

/**
 * تحويل مبلغ من أي عملة إلى الجنيه المصري (مع تحديث تلقائي للأسعار)
 */
export async function convertToEGP(amount: number, fromCurrencyCode: string): Promise<ConversionResult> {
  // الحصول على أحدث أسعار الصرف
  const currentRates = await getRates();
  
  // إذا كانت العملة غير مدعومة، استخدم USD كافتراضي
  const fromCurrency = CURRENCY_RATES[fromCurrencyCode] || CURRENCY_RATES['USD'];
  const toCurrency = CURRENCY_RATES['EGP'];
  
  // استخدام السعر المحدث إذا توفر، وإلا استخدم السعر الافتراضي
  const exchangeRate = currentRates[fromCurrencyCode] || fromCurrency.rateToEGP;
  
  // تحويل المبلغ
  const convertedAmount = Math.round(amount * exchangeRate);
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: convertedAmount,
    convertedCurrency: toCurrency,
    exchangeRate: exchangeRate,
    formattedOriginal: `${amount} ${fromCurrency.symbol}`,
    formattedConverted: `${convertedAmount} ${toCurrency.symbol}`
  };
}

/**
 * تحويل مبلغ من أي عملة إلى الجنيه المصري (نسخة متزامنة للاستخدام الفوري)
 */
export function convertToEGPSync(amount: number, fromCurrencyCode: string): ConversionResult {
  // إذا كانت العملة غير مدعومة، استخدم USD كافتراضي
  const fromCurrency = CURRENCY_RATES[fromCurrencyCode] || CURRENCY_RATES['USD'];
  const toCurrency = CURRENCY_RATES['EGP'];
  
  // استخدام السعر من Cache أو الافتراضي
  const cachedRates = ratesCache?.rates || EXCHANGE_RATES_TO_EGP;
  const exchangeRate = cachedRates[fromCurrencyCode] || fromCurrency.rateToEGP;
  
  // تحويل المبلغ
  const convertedAmount = Math.round(amount * exchangeRate);
  
  return {
    originalAmount: amount,
    originalCurrency: fromCurrency,
    convertedAmount: convertedAmount,
    convertedCurrency: toCurrency,
    exchangeRate: exchangeRate,
    formattedOriginal: `${amount} ${fromCurrency.symbol}`,
    formattedConverted: `${convertedAmount} ${toCurrency.symbol}`
  };
}

/**
 * الحصول على معلومات العملة حسب كود الدولة أو اسم الدولة
 */
export function getCurrencyByCountry(countryCode: string): CurrencyRate {
  // خريطة كود الدولة إلى العملة
  const currencyMapByCode: Record<string, string> = {
    'SA': 'SAR',
    'QA': 'QAR', 
    'AE': 'AED',
    'KW': 'KWD',
    'BH': 'BHD',
    'OM': 'OMR',
    'EG': 'EGP',
    'US': 'USD',
    'JO': 'JOD',
    'LB': 'LBP',
    'MA': 'MAD',
    'TN': 'TND',
    'DZ': 'DZD',
    'LY': 'LYD',
    'SY': 'SYP',
    'IQ': 'IQD',
    'YE': 'YER',
    'SD': 'SDG'
  };
  
  // خريطة اسم الدولة إلى العملة (للتوافق مع البيانات المحفوظة بالعربية)
  const currencyMapByName: Record<string, string> = {
    'السعودية': 'SAR',
    'قطر': 'QAR',
    'الإمارات': 'AED', 
    'الكويت': 'KWD',
    'البحرين': 'BHD',
    'عمان': 'OMR',
    'مصر': 'EGP',
    'الأردن': 'JOD',
    'لبنان': 'LBP',
    'المغرب': 'MAD',
    'تونس': 'TND',
    'الجزائر': 'DZD',
    'ليبيا': 'LYD',
    'سوريا': 'SYP',
    'العراق': 'IQD',
    'اليمن': 'YER',
    'السودان': 'SDG',
    'فلسطين': 'JOD' // تستخدم الدينار الأردني أو الشيكل
  };
  
  // أولاً، جرب كود الدولة
  const upperCountryCode = countryCode?.toUpperCase();
  let currencyCode = currencyMapByCode[upperCountryCode];
  
  // إذا لم يوجد، جرب اسم الدولة بالعربية
  if (!currencyCode) {
    const trimmedCountry = countryCode?.trim();
    currencyCode = currencyMapByName[trimmedCountry];
  }
  
  // إذا لم يوجد، استخدم الافتراضي
  if (!currencyCode) {
    currencyCode = 'USD'; // افتراضي للدول غير المدعومة
  }
  
  return CURRENCY_RATES[currencyCode];
}

/**
 * تحويل مبلغ من الجنيه المصري إلى عملة أخرى
 */
export function convertFromEGP(amountInEGP: number, toCurrencyCode: string): ConversionResult {
  const fromCurrency = CURRENCY_RATES['EGP'];
  const toCurrency = CURRENCY_RATES[toCurrencyCode] || CURRENCY_RATES['USD'];
  
  // استخدام السعر من Cache أو الافتراضي
  const cachedRates = ratesCache?.rates || EXCHANGE_RATES_TO_EGP;
  const exchangeRate = cachedRates[toCurrencyCode] || toCurrency.rateToEGP;
  
  // تحويل المبلغ من EGP إلى العملة المطلوبة
  const convertedAmount = Math.round(amountInEGP / exchangeRate);
  
  return {
    originalAmount: amountInEGP,
    originalCurrency: fromCurrency,
    convertedAmount: convertedAmount,
    convertedCurrency: toCurrency,
    exchangeRate: 1 / exchangeRate,
    formattedOriginal: `${amountInEGP} ${fromCurrency.symbol}`,
    formattedConverted: `${convertedAmount} ${toCurrency.symbol}`
  };
}

/**
 * تنسيق عرض التحويل للمستخدم
 */
export function formatConversionDisplay(conversion: ConversionResult): string {
  if (conversion.originalCurrency.code === 'EGP') {
    return `${conversion.originalAmount} ${conversion.originalCurrency.symbol}`;
  }
  
  return `${conversion.formattedOriginal} (${conversion.formattedConverted})`;
} 

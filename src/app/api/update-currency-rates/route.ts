import { NextRequest, NextResponse } from 'next/server';

// نظام تحديث أسعار العملات المبسط
interface CurrencyInfo {
  rate: number;
  symbol: string;
  name: string;
  lastUpdated: string;
}

// أسعار العملات الافتراضية (محدثة بتاريخ اليوم)
const DEFAULT_CURRENCY_RATES: Record<string, CurrencyInfo> = {
  USD: { rate: 1, symbol: '$', name: 'دولار أمريكي', lastUpdated: new Date().toISOString() },
  EUR: { rate: 0.85, symbol: '€', name: 'يورو', lastUpdated: new Date().toISOString() },
  GBP: { rate: 0.73, symbol: '£', name: 'جنيه استرليني', lastUpdated: new Date().toISOString() },
  SAR: { rate: 3.75, symbol: 'ر.س', name: 'ريال سعودي', lastUpdated: new Date().toISOString() },
  AED: { rate: 3.67, symbol: 'د.إ', name: 'درهم إماراتي', lastUpdated: new Date().toISOString() },
  KWD: { rate: 0.30, symbol: 'د.ك', name: 'دينار كويتي', lastUpdated: new Date().toISOString() },
  QAR: { rate: 3.64, symbol: 'ر.ق', name: 'ريال قطري', lastUpdated: new Date().toISOString() },
  BHD: { rate: 0.38, symbol: 'د.ب', name: 'دينار بحريني', lastUpdated: new Date().toISOString() },
  OMR: { rate: 0.38, symbol: 'ر.ع', name: 'ريال عماني', lastUpdated: new Date().toISOString() },
  JOD: { rate: 0.71, symbol: 'د.أ', name: 'دينار أردني', lastUpdated: new Date().toISOString() },
  LBP: { rate: 15000, symbol: 'ل.ل', name: 'ليرة لبنانية', lastUpdated: new Date().toISOString() },
  TRY: { rate: 27, symbol: '₺', name: 'ليرة تركية', lastUpdated: new Date().toISOString() },
  MAD: { rate: 10, symbol: 'د.م', name: 'درهم مغربي', lastUpdated: new Date().toISOString() },
  DZD: { rate: 135, symbol: 'د.ج', name: 'دينار جزائري', lastUpdated: new Date().toISOString() },
  TND: { rate: 3.1, symbol: 'د.ت', name: 'دينار تونسي', lastUpdated: new Date().toISOString() },
  EGP: { rate: 49, symbol: 'ج.م', name: 'جنيه مصري', lastUpdated: new Date().toISOString() }
};

// دالة جلب الأسعار الحية (مبسطة)
async function fetchLiveRates(): Promise<Record<string, CurrencyInfo> | null> {
  try {
    console.log('🔄 محاولة جلب أسعار حية من ExchangeRate-API...');
    
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'el7lm-Platform/1.0'
      },
      signal: AbortSignal.timeout(10000) // timeout بعد 10 ثواني
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.result !== 'success') {
      throw new Error('API returned error');
    }

    console.log(`✅ تم جلب ${Object.keys(data.rates).length} عملة من API`);

    // تحويل للتنسيق المطلوب
    const liveRates: Record<string, CurrencyInfo> = {};
    const lastUpdated = data.time_last_update_utc;
    
    Object.entries(DEFAULT_CURRENCY_RATES).forEach(([code, info]) => {
      const rate = data.rates[code];
      if (rate) {
        liveRates[code] = {
          rate: Number(rate.toFixed(4)),
          symbol: info.symbol,
          name: info.name,
          lastUpdated: lastUpdated
        };
      }
    });

    return liveRates;

  } catch (error) {
    console.warn('⚠️ فشل في جلب أسعار حية:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [Currency API] طلب تحديث أسعار العملات');

    // محاولة جلب أسعار حية
    const liveRates = await fetchLiveRates();
    
    // استخدام الأسعار الحية أو الافتراضية
    const rates = liveRates || DEFAULT_CURRENCY_RATES;
    const isLive = liveRates !== null;

    // إحصائيات الاستجابة
    const stats = {
      totalCurrencies: Object.keys(rates).length,
      lastUpdated: Object.values(rates)[0]?.lastUpdated,
      supportedCurrencies: Object.keys(rates),
      updateSource: isLive ? 'ExchangeRate-API (Live)' : 'Default Rates',
      nextUpdate: isLive ? 'خلال 24 ساعة' : 'عند التحديث اليدوي',
      isLive: isLive
    };

    console.log(`✅ [Currency API] تم إرجاع الأسعار (${isLive ? 'حية' : 'افتراضية'})`);

    return NextResponse.json({
      success: true,
      message: `تم جلب أسعار العملات ${isLive ? 'الحية' : 'الافتراضية'} بنجاح`,
      data: {
        rates,
        stats
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Currency API] خطأ عام:', error);
    
    // في حالة الخطأ، إرجاع الأسعار الافتراضية
    return NextResponse.json({
      success: true, // true لأننا نقدم أسعار افتراضية
      message: 'تم استخدام أسعار افتراضية بسبب خطأ في الشبكة',
      data: {
        rates: DEFAULT_CURRENCY_RATES,
        stats: {
          totalCurrencies: Object.keys(DEFAULT_CURRENCY_RATES).length,
          lastUpdated: new Date().toISOString(),
          supportedCurrencies: Object.keys(DEFAULT_CURRENCY_RATES),
          updateSource: 'Default Rates (Fallback)',
          nextUpdate: 'عند التحديث اليدوي',
          isLive: false
        }
      },
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  // نفس منطق GET للتحديث اليدوي
  return GET(request);
} 

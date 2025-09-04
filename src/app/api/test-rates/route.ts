import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 تم استدعاء API test-rates');
    
    // اختبار بسيط للاستدعاء
    const testData = {
      success: true,
      message: 'النظام يعمل بشكل صحيح',
      timestamp: new Date().toISOString(),
      testRates: {
        USD: { rate: 1, symbol: '$', name: 'دولار أمريكي' },
        EGP: { rate: 49, symbol: 'ج.م', name: 'جنيه مصري' },
        SAR: { rate: 3.75, symbol: 'ر.س', name: 'ريال سعودي' },
        AED: { rate: 3.67, symbol: 'د.إ', name: 'درهم إماراتي' }
      }
    };

    return NextResponse.json(testData);
  } catch (error) {
    console.error('❌ خطأ في API test-rates:', error);
    
    return NextResponse.json({
      success: false,
      message: 'خطأ في الخادم',
      error: error instanceof Error ? error.message : 'خطأ غير معروف',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request); // نفس منطق GET
} 

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // قراءة متغيرات البيئة من الخادم
    const config = {
      merchantPublicKey: process.env.GEIDEA_MERCHANT_PUBLIC_KEY,
      apiPassword: process.env.GEIDEA_API_PASSWORD,
      webhookSecret: process.env.GEIDEA_WEBHOOK_SECRET,
      baseUrl: process.env.GEIDEA_BASE_URL || 'https://api.merchant.geidea.net',
      isTestMode: false
    };

    // التحقق من صحة التكوين
    const requiredFields = ['merchantPublicKey', 'apiPassword', 'webhookSecret'];
    const missingFields = requiredFields.filter(field => {
      const value = config[field as keyof typeof config];
      return !value || 
             value === 'your_merchant_public_key_here' ||
             value === 'your_api_password_here' ||
             value === 'your_real_webhook_secret_here' ||
             value === 'your_webhook_secret_here';
    });

    const isValid = missingFields.length === 0;

    return NextResponse.json({
      success: true,
      config: {
        ...config,
        apiPassword: config.apiPassword ? '***SET***' : 'MISSING',
        webhookSecret: config.webhookSecret ? '***SET***' : 'MISSING'
      },
      isValid,
      missingFields,
      isTestMode: false,
      message: isValid ? 'Geidea configuration is valid' : 'Geidea configuration has missing fields'
    });

  } catch (error) {
    console.error('Error checking Geidea config:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 

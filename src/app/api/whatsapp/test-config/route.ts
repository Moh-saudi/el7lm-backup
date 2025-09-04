import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // فحص متغيرات البيئة للواتساب
    const config = {
      whatsappBusiness: {
        accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? '✅ Set' : '❌ Missing',
        phoneId: process.env.WHATSAPP_PHONE_ID ? '✅ Set' : '❌ Missing',
        isValid: !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_ID)
      },
      greenApi: {
        token: process.env.GREEN_API_TOKEN ? '✅ Set' : '❌ Missing',
        instance: process.env.GREEN_API_INSTANCE ? '✅ Set' : '❌ Missing',
        isValid: !!(process.env.GREEN_API_TOKEN && process.env.GREEN_API_INSTANCE)
      },
      beOnWhatsApp: {
        token: process.env.BEON_WHATSAPP_TOKEN ? '✅ Set' : '❌ Missing',
        isValid: !!process.env.BEON_WHATSAPP_TOKEN
      }
    };

    // تحديد الخدمة المتاحة
    let availableService = 'none';
    if (config.whatsappBusiness.isValid) {
      availableService = 'whatsapp_business';
    } else if (config.greenApi.isValid) {
      availableService = 'green_api';
    } else if (config.beOnWhatsApp.isValid) {
      availableService = 'beon_whatsapp';
    }

    return NextResponse.json({
      success: true,
      config,
      availableService,
      recommendations: getRecommendations(config)
    });

  } catch (error: any) {
    console.error('❌ WhatsApp config test error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'خطأ في فحص التكوين',
        details: error.message
      },
      { status: 500 }
    );
  }
}

function getRecommendations(config: any) {
  const recommendations = [];

  if (!config.whatsappBusiness.isValid) {
    recommendations.push({
      type: 'error',
      message: 'WhatsApp Business API غير مكون. أضف WHATSAPP_ACCESS_TOKEN و WHATSAPP_PHONE_ID إلى .env.local'
    });
  }

  if (!config.greenApi.isValid) {
    recommendations.push({
      type: 'error', 
      message: 'Green API غير مكون. أضف GREEN_API_TOKEN و GREEN_API_INSTANCE إلى .env.local'
    });
  }

  if (!config.beOnWhatsApp.isValid) {
    recommendations.push({
      type: 'warning',
      message: 'BeOn WhatsApp غير مكون. أضف BEON_WHATSAPP_TOKEN إلى .env.local للاستخدام كبديل'
    });
  }

  if (config.whatsappBusiness.isValid) {
    recommendations.push({
      type: 'success',
      message: 'WhatsApp Business API جاهز للاستخدام'
    });
  } else if (config.greenApi.isValid) {
    recommendations.push({
      type: 'success', 
      message: 'Green API جاهز للاستخدام'
    });
  } else if (config.beOnWhatsApp.isValid) {
    recommendations.push({
      type: 'info',
      message: 'BeOn WhatsApp متاح كبديل'
    });
  } else {
    recommendations.push({
      type: 'error',
      message: 'لا توجد خدمة واتساب مكونة. يرجى إعداد واحدة على الأقل'
    });
  }

  return recommendations;
} 

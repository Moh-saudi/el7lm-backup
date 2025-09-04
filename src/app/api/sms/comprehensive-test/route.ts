import { NextRequest, NextResponse } from 'next/server';
import { storeOTP, getOTP, getOTPBySource, getOTPStatus, clearOTP } from '../otp-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, otp, source = 'whatsapp' } = body;

    console.log('🧪 Comprehensive OTP Test:', { action, phone, otp, source });

    switch (action) {
      case 'store':
        return await testStorage(phone, otp, source);
      case 'retrieve':
        return await testRetrieval(phone);
      case 'clear':
        return await testClear(phone);
      case 'status':
        return await testStatus();
      case 'full-test':
        return await fullTest(phone, otp, source);
      default:
        return NextResponse.json(
          { success: false, error: 'Action not supported. Use: store, retrieve, clear, status, full-test' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Comprehensive test error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}

async function testStorage(phone: string, otp: string, source: 'whatsapp' | 'sms') {
  console.log('💾 Testing storage for:', { phone, otp, source });
  
  // مسح أي OTP موجود مسبقاً
  clearOTP(phone);
  
  // تخزين OTP جديد
  storeOTP(phone, otp, source);
  
  // فحص التخزين الفوري
  const storedOTP = getOTPBySource(phone, source);
  const generalOTP = getOTP(phone);
  
  return NextResponse.json({
    success: true,
    action: 'store',
    phone,
    otp,
    source,
    stored: !!storedOTP,
    generalFound: !!generalOTP,
    storedOTP: storedOTP ? {
      otp: storedOTP.otp,
      source: storedOTP.source,
      timestamp: storedOTP.timestamp
    } : null,
    generalOTP: generalOTP ? {
      otp: generalOTP.otp,
      source: generalOTP.source,
      timestamp: generalOTP.timestamp
    } : null
  });
}

async function testRetrieval(phone: string) {
  console.log('🔍 Testing retrieval for:', phone);
  
  const whatsappOTP = getOTPBySource(phone, 'whatsapp');
  const smsOTP = getOTPBySource(phone, 'sms');
  const generalOTP = getOTP(phone);
  
  return NextResponse.json({
    success: true,
    action: 'retrieve',
    phone,
    whatsappOTP: whatsappOTP ? {
      otp: whatsappOTP.otp,
      source: whatsappOTP.source,
      timestamp: whatsappOTP.timestamp,
      attempts: whatsappOTP.attempts,
      expired: whatsappOTP.expired
    } : null,
    smsOTP: smsOTP ? {
      otp: smsOTP.otp,
      source: smsOTP.source,
      timestamp: smsOTP.timestamp,
      attempts: smsOTP.attempts,
      expired: smsOTP.expired
    } : null,
    generalOTP: generalOTP ? {
      otp: generalOTP.otp,
      source: generalOTP.source,
      timestamp: generalOTP.timestamp,
      attempts: generalOTP.attempts,
      expired: generalOTP.expired
    } : null
  });
}

async function testClear(phone: string) {
  console.log('🗑️ Testing clear for:', phone);
  
  const beforeClear = {
    whatsapp: getOTPBySource(phone, 'whatsapp'),
    sms: getOTPBySource(phone, 'sms'),
    general: getOTP(phone)
  };
  
  clearOTP(phone);
  
  const afterClear = {
    whatsapp: getOTPBySource(phone, 'whatsapp'),
    sms: getOTPBySource(phone, 'sms'),
    general: getOTP(phone)
  };
  
  return NextResponse.json({
    success: true,
    action: 'clear',
    phone,
    beforeClear: {
      whatsapp: !!beforeClear.whatsapp,
      sms: !!beforeClear.sms,
      general: !!beforeClear.general
    },
    afterClear: {
      whatsapp: !!afterClear.whatsapp,
      sms: !!afterClear.sms,
      general: !!afterClear.general
    }
  });
}

async function testStatus() {
  console.log('📊 Testing storage status');
  getOTPStatus();
  
  return NextResponse.json({
    success: true,
    action: 'status',
    message: 'Check server console for detailed storage status'
  });
}

async function fullTest(phone: string, otp: string, source: 'whatsapp' | 'sms') {
  console.log('🧪 Running full test for:', { phone, otp, source });
  
  // 1. مسح التخزين
  clearOTP(phone);
  
  // 2. تخزين OTP
  storeOTP(phone, otp, source);
  
  // 3. فحص التخزين
  const storedOTP = getOTPBySource(phone, source);
  const generalOTP = getOTP(phone);
  
  // 4. محاكاة التحقق
  const verificationResult = storedOTP && storedOTP.otp === otp;
  
  // 5. مسح OTP
  clearOTP(phone);
  
  const afterClear = getOTP(phone);
  
  return NextResponse.json({
    success: true,
    action: 'full-test',
    phone,
    otp,
    source,
    storageSuccess: !!storedOTP,
    retrievalSuccess: !!generalOTP,
    verificationSuccess: verificationResult,
    clearSuccess: !afterClear,
    details: {
      storedOTP: storedOTP ? {
        otp: storedOTP.otp,
        source: storedOTP.source,
        timestamp: storedOTP.timestamp
      } : null,
      generalOTP: generalOTP ? {
        otp: generalOTP.otp,
        source: generalOTP.source,
        timestamp: generalOTP.timestamp
      } : null,
      afterClear: !!afterClear
    }
  });
} 

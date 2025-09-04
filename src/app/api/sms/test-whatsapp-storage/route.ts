import { NextRequest, NextResponse } from 'next/server';
import { storeOTP, getOTP, getOTPStatus } from '../otp-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    console.log('🧪 Test WhatsApp storage for:', { phone, otp });

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: 'Phone and OTP are required' },
        { status: 400 }
      );
    }

    // تخزين OTP WhatsApp
    storeOTP(phone, otp, 'whatsapp');
    console.log('💾 Test OTP stored for WhatsApp');

    // فحص التخزين
    getOTPStatus();

    // محاولة استرجاع OTP
    const retrievedOTP = getOTP(phone);
    const whatsappOTP = getOTPBySource(phone, 'whatsapp');

    return NextResponse.json({
      success: true,
      message: 'Test OTP stored successfully',
      phone,
      otp,
      retrievedOTP: retrievedOTP ? {
        otp: retrievedOTP.otp,
        source: retrievedOTP.source,
        timestamp: retrievedOTP.timestamp
      } : null,
      whatsappOTP: whatsappOTP ? {
        otp: whatsappOTP.otp,
        source: whatsappOTP.source,
        timestamp: whatsappOTP.timestamp
      } : null
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    );
  }
} 

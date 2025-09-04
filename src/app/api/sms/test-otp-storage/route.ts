import { NextRequest, NextResponse } from 'next/server';
import { storeOTP, getOTP, getOTPStatus, clearOTP } from '../otp-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phoneNumber, otp } = body;

    console.log('🧪 Test OTP Storage:', { action, phoneNumber, otp });

    switch (action) {
      case 'store':
        if (!phoneNumber || !otp) {
          return NextResponse.json(
            { success: false, error: 'phoneNumber and otp are required for store action' },
            { status: 400 }
          );
        }
        storeOTP(phoneNumber, otp);
        return NextResponse.json({
          success: true,
          message: 'OTP stored successfully',
          phoneNumber,
          otp
        });

      case 'get':
        if (!phoneNumber) {
          return NextResponse.json(
            { success: false, error: 'phoneNumber is required for get action' },
            { status: 400 }
          );
        }
        const storedOTP = getOTP(phoneNumber);
        return NextResponse.json({
          success: true,
          found: !!storedOTP,
          otp: storedOTP?.otp || null,
          timestamp: storedOTP?.timestamp || null,
          phoneNumber
        });

      case 'status':
        getOTPStatus();
        return NextResponse.json({
          success: true,
          message: 'OTP storage status logged to console'
        });

      case 'clear':
        if (!phoneNumber) {
          return NextResponse.json(
            { success: false, error: 'phoneNumber is required for clear action' },
            { status: 400 }
          );
        }
        clearOTP(phoneNumber);
        return NextResponse.json({
          success: true,
          message: 'OTP cleared successfully',
          phoneNumber
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: store, get, status, or clear' },
          { status: 400 }
        );
    }

  } catch (error: any) {
    console.error('❌ Test OTP Storage error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test failed',
        details: error.message
      },
      { status: 500 }
    );
  }
} 

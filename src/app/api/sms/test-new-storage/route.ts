import { NextRequest, NextResponse } from 'next/server';
import { storeOTP, getOTP, getOTPBySource, getOTPStatus, clearOTP } from '../otp-storage';

export async function POST(request: NextRequest) {
  try {
    const { action, phone, otp, source } = await request.json();
    
    console.log('🧪 Test action:', action, 'Phone:', phone, 'OTP:', otp, 'Source:', source);
    
    switch (action) {
      case 'store':
        storeOTP(phone, otp, source);
        getOTPStatus();
        return NextResponse.json({ 
          success: true, 
          message: 'OTP stored successfully',
          action: 'store',
          phone,
          otp,
          source
        });
        
      case 'get':
        const result = getOTP(phone);
        getOTPStatus();
        return NextResponse.json({ 
          success: true, 
          message: 'OTP retrieved',
          action: 'get',
          phone,
          found: !!result,
          result: result ? {
            otp: result.otp,
            source: result.source,
            attempts: result.attempts,
            expired: result.expired,
            age: Date.now() - result.timestamp
          } : null
        });
        
      case 'getBySource':
        const resultBySource = getOTPBySource(phone, source);
        getOTPStatus();
        return NextResponse.json({ 
          success: true, 
          message: 'OTP retrieved by source',
          action: 'getBySource',
          phone,
          source,
          found: !!resultBySource,
          result: resultBySource ? {
            otp: resultBySource.otp,
            source: resultBySource.source,
            attempts: resultBySource.attempts,
            expired: resultBySource.expired,
            age: Date.now() - resultBySource.timestamp
          } : null
        });
        
      case 'clear':
        clearOTP(phone, source);
        getOTPStatus();
        return NextResponse.json({ 
          success: true, 
          message: 'OTP cleared',
          action: 'clear',
          phone,
          source
        });
        
      case 'status':
        getOTPStatus();
        return NextResponse.json({ 
          success: true, 
          message: 'Storage status logged',
          action: 'status'
        });
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Error in test storage:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error' 
    }, { status: 500 });
  }
} 

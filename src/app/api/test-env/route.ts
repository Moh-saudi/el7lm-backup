import { NextResponse } from 'next/server';

export async function GET() {
  console.log('=== Environment Variables Test ===');
  
  const envVars = {
    BEON_WHATSAPP_TOKEN: {
      exists: !!process.env.BEON_WHATSAPP_TOKEN,
      length: process.env.BEON_WHATSAPP_TOKEN?.length,
      value: process.env.BEON_WHATSAPP_TOKEN ? 
        `${process.env.BEON_WHATSAPP_TOKEN.substring(0, 10)}...` : 
        'NOT_SET'
    },
    BEON_SMS_TOKEN: {
      exists: !!process.env.BEON_SMS_TOKEN,
      length: process.env.BEON_SMS_TOKEN?.length,
      value: process.env.BEON_SMS_TOKEN ? 
        `${process.env.BEON_SMS_TOKEN.substring(0, 10)}...` : 
        'NOT_SET'
    },
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('BEON'))
  };

  console.log('Environment variables:', JSON.stringify(envVars, null, 2));

  return NextResponse.json({
    success: true,
    message: 'Environment variables check',
    data: envVars
  });
} 

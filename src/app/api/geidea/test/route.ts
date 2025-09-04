import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Test endpoint received:', body);

    const {
      amount,
      currency,
      merchantReferenceId,
      callbackUrl,
      language = 'ar',
      cardOnFile = false,
      returnUrl,
      customerEmail,
      customerName,
      customerPhone
    } = body;

    // التحقق من البيانات المطلوبة
    if (!amount || !currency || !merchantReferenceId || !callbackUrl) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: 'amount, currency, merchantReferenceId, callbackUrl are required',
          received: { amount, currency, merchantReferenceId, callbackUrl }
        },
        { status: 400 }
      );
    }

    // التحقق من صحة المبلغ
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { 
          error: 'Invalid amount',
          details: 'Amount must be a positive number',
          received: amount
        },
        { status: 400 }
      );
    }

    // محاكاة استجابة Geidea الناجحة
    const mockSessionId = `test_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Test endpoint returning success:', {
      sessionId: mockSessionId,
      amount: numericAmount.toFixed(2),
      currency
    });

    return NextResponse.json({
      sessionId: mockSessionId,
      success: true,
      currency,
      amount: numericAmount.toFixed(2),
      isTest: true
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 

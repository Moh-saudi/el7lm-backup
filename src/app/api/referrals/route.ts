import { NextRequest, NextResponse } from 'next/server';
import { referralService } from '@/lib/referral/referral-service';
import { POINTS_CONVERSION } from '@/types/referral';

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Referral API] POST request received');
    
    const body = await request.json();
    const { action, playerId, referralCode, points, reason } = body;

    console.log('📥 [Referral API] Request body:', { action, playerId, referralCode });

    switch (action) {
      case 'create_referral':
        if (!playerId) {
          return NextResponse.json(
            { error: 'Missing playerId' },
            { status: 400 }
          );
        }

        const code = referralService.generateReferralCode();
        const referralId = await referralService.createReferral(playerId, code);
        
        console.log('✅ [Referral API] Referral created:', referralId);
        
        return NextResponse.json({
          success: true,
          referralId,
          referralCode: code,
          referralLink: referralService.createReferralLink(code),
          shareMessages: referralService.createShareMessages(code, 'لاعب')
        });

      case 'complete_referral':
        if (!referralCode || !playerId) {
          return NextResponse.json(
            { error: 'Missing referralCode or playerId' },
            { status: 400 }
          );
        }

        await referralService.completeReferral(referralCode, playerId);
        
        console.log('✅ [Referral API] Referral completed');
        
        return NextResponse.json({
          success: true,
          message: 'Referral completed successfully',
          rewards: {
            referrerPoints: POINTS_CONVERSION.REFERRAL_POINTS,
            referredPoints: POINTS_CONVERSION.REFERRED_BONUS_POINTS
          }
        });

      case 'add_points':
        if (!playerId || !points || !reason) {
          return NextResponse.json(
            { error: 'Missing playerId, points, or reason' },
            { status: 400 }
          );
        }

        await referralService.addPointsToPlayer(playerId, points, reason);
        
        console.log('✅ [Referral API] Points added:', { playerId, points, reason });
        
        return NextResponse.json({
          success: true,
          message: 'Points added successfully',
          pointsAdded: points,
          earningsInDollars: points / POINTS_CONVERSION.POINTS_PER_DOLLAR,
          earningsInEGP: (points / POINTS_CONVERSION.POINTS_PER_DOLLAR) * POINTS_CONVERSION.DOLLAR_TO_EGP
        });

      case 'get_stats':
        if (!playerId) {
          return NextResponse.json(
            { error: 'Missing playerId' },
            { status: 400 }
          );
        }

        const stats = await referralService.getPlayerReferralStats(playerId);
        const topReferrers = await referralService.getTopReferrers(10);
        
        console.log('✅ [Referral API] Stats retrieved');
        
        return NextResponse.json({
          success: true,
          stats: {
            ...stats,
            topReferrers
          }
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ [Referral API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 [Referral API] GET request received');
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const playerId = searchParams.get('playerId');

    if (action === 'get_top_referrers') {
      const limit = parseInt(searchParams.get('limit') || '10');
      const topReferrers = await referralService.getTopReferrers(limit);
      
      console.log('✅ [Referral API] Top referrers retrieved');
      
      return NextResponse.json({
        success: true,
        topReferrers
      });
    }

    if (action === 'get_player_stats' && playerId) {
      const stats = await referralService.getPlayerReferralStats(playerId);
      
      console.log('✅ [Referral API] Player stats retrieved');
      
      return NextResponse.json({
        success: true,
        stats
      });
    }

    return NextResponse.json(
      { error: 'Invalid action or missing parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ [Referral API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 

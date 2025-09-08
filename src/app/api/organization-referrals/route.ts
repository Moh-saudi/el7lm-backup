import { NextRequest, NextResponse } from 'next/server';
import { organizationReferralService } from '@/lib/organization/organization-referral-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create_referral': {
        const referral = await organizationReferralService.createOrganizationReferral(
          data.organizationId,
          data.organizationType,
          data.organizationName,
          data.options
        );
        return NextResponse.json({ success: true, referral });
      }

      case 'create_join_request': {
        const joinRequest = await organizationReferralService.createJoinRequest(
          data.playerId,
          data.playerData,
          data.referralCode
        );
        return NextResponse.json({ success: true, joinRequest });
      }

      case 'approve_request': {
        await organizationReferralService.approveJoinRequest(
          data.requestId,
          data.approvedBy,
          data.approverName,
          data.notes
        );
        return NextResponse.json({ success: true, message: 'تم قبول الطلب بنجاح' });
      }

      case 'reject_request': {
        await organizationReferralService.rejectJoinRequest(
          data.requestId,
          data.rejectedBy,
          data.rejectorName,
          data.reason
        );
        return NextResponse.json({ success: true, message: 'تم رفض الطلب' });
      }

      case 'update_referral': {
        const updated = await organizationReferralService.updateOrganizationReferral(
          data.referralId,
          data.organizationId,
          data.updates
        );
        return NextResponse.json({ success: true, referral: updated });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Organization Referral API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const organizationId = searchParams.get('organizationId');
    const referralCode = searchParams.get('referralCode');

    switch (action) {
      case 'get_referrals': {
        if (!organizationId) {
          return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }
        const referrals = await organizationReferralService.getOrganizationReferrals(organizationId);
        return NextResponse.json({ success: true, referrals });
      }

      case 'get_join_requests': {
        if (!organizationId) {
          return NextResponse.json({ error: 'Missing organizationId' }, { status: 400 });
        }
        const status = searchParams.get('status') || undefined;
        const requests = await organizationReferralService.getOrganizationJoinRequests(organizationId, status || undefined);
        return NextResponse.json({ success: true, requests });
      }

      case 'find_referral': {
        if (!referralCode) {
          return NextResponse.json({ error: 'Missing referralCode' }, { status: 400 });
        }
        const referral = await organizationReferralService.findReferralByCode(referralCode);
        return NextResponse.json({ success: true, referral });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Organization Referral GET API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error' 
      },
      { status: 500 }
    );
  }
}



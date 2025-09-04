import { NextRequest, NextResponse } from 'next/server';
import { smartNotificationService } from '@/lib/notifications/smart-notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      type, 
      profileOwnerId, 
      viewerId, 
      viewerName, 
      viewerType,
      searchTerm,
      rank,
      achievementType,
      achievementValue
    } = body;

    console.log('📢 Smart Notification Request:', { type, profileOwnerId, viewerId });

    let notificationId: string;

    switch (type) {
      case 'profile_view':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType) {
          return NextResponse.json(
            { error: 'Missing required fields for profile view notification' },
            { status: 400 }
          );
        }
        notificationId = await smartNotificationService.sendProfileViewNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType
        );
        break;

      case 'search_result':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !searchTerm || !rank) {
          return NextResponse.json(
            { error: 'Missing required fields for search result notification' },
            { status: 400 }
          );
        }
        notificationId = await smartNotificationService.sendSearchResultNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          searchTerm,
          rank
        );
        break;

      case 'connection_request':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType) {
          return NextResponse.json(
            { error: 'Missing required fields for connection request notification' },
            { status: 400 }
          );
        }
        notificationId = await smartNotificationService.sendConnectionRequestNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType
        );
        break;

      case 'achievement':
        if (!profileOwnerId || !achievementType) {
          return NextResponse.json(
            { error: 'Missing required fields for achievement notification' },
            { status: 400 }
          );
        }
        notificationId = await smartNotificationService.sendAchievementNotification(
          profileOwnerId,
          achievementType,
          achievementValue
        );
        break;

      case 'trending':
        if (!profileOwnerId || !rank) {
          return NextResponse.json(
            { error: 'Missing required fields for trending notification' },
            { status: 400 }
          );
        }
        notificationId = await smartNotificationService.sendTrendingNotification(
          profileOwnerId,
          rank,
          body.category || 'general'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    console.log('✅ Smart notification sent successfully:', notificationId);

    return NextResponse.json({
      success: true,
      notificationId,
      message: 'Smart notification sent successfully'
    });

  } catch (error) {
    console.error('❌ Error sending smart notification:', error);
    return NextResponse.json(
      { error: 'Failed to send smart notification', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // هنا يمكن إضافة منطق لجلب الإشعارات حسب المعايير
    // حالياً نرجع رسالة نجاح للاختبار
    return NextResponse.json({
      success: true,
      message: 'Smart notifications service is working',
      userId,
      type,
      unreadOnly
    });

  } catch (error) {
    console.error('❌ Error getting smart notifications:', error);
    return NextResponse.json(
      { error: 'Failed to get smart notifications', details: error.message },
      { status: 500 }
    );
  }
} 

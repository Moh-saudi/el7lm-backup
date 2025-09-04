import { NextRequest, NextResponse } from 'next/server';
import { interactionNotificationService } from '@/lib/notifications/interaction-notifications';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    console.group('📢 [API] استلام طلب إشعار جديد');
    console.log('🕐 وقت الطلب:', new Date().toISOString());
    
    const body = await request.json();
    console.log('📦 بيانات الطلب الكاملة:', body);
    
    const { 
      type, 
      profileOwnerId, 
      viewerId, 
      viewerName, 
      viewerType,
      viewerAccountType,
      searchTerm,
      rank,
      profileType,
      messagePreview
    } = body;

    console.log('🔍 الحقول المستخرجة:', { 
      type, 
      profileOwnerId, 
      viewerId, 
      viewerName,
      viewerType,
      viewerAccountType,
      profileType
    });

    // تحقق من صحة البيانات
    console.log('✅ فحص صحة البيانات:', {
      hasProfileOwnerId: !!profileOwnerId,
      hasViewerId: !!viewerId,
      hasViewerName: !!viewerName,
      hasViewerType: !!viewerType,
      hasViewerAccountType: !!viewerAccountType,
      isValidType: type === 'profile_view'
    });

    let notificationId: string;

    switch (type) {
      case 'profile_view':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType) {
          console.error('❌ حقول مطلوبة مفقودة:', {
            profileOwnerId: !!profileOwnerId,
            viewerId: !!viewerId,
            viewerName: !!viewerName,
            viewerType: !!viewerType,
            viewerAccountType: !!viewerAccountType
          });
          console.groupEnd();
          return NextResponse.json(
            { error: 'Missing required fields for profile view notification' },
            { status: 400 }
          );
        }
        
        console.log('🚀 استدعاء خدمة الإشعارات...');
        notificationId = await interactionNotificationService.sendProfileViewNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          profileType || 'player'
        );
        console.log('✅ تم إنشاء الإشعار بمعرف:', notificationId);
        
        // إرسال SMS إشعار لصاحب الملف
        try {
          console.log('📱 بدء إرسال SMS إشعار...');
          
          // الحصول على رقم هاتف صاحب الملف
          const profileOwnerDoc = await getDoc(doc(db, 'users', profileOwnerId));
          if (profileOwnerDoc.exists()) {
            const profileOwnerData = profileOwnerDoc.data();
            const phoneNumber = profileOwnerData.phone;
            
            if (phoneNumber) {
              console.log('📱 إرسال SMS إلى:', phoneNumber);
              
              // إنشاء رسائل SMS مختلفة حسب نوع الحساب
              const getSMSMessagesByType = (accountType: string) => {
                const baseMessages = {
                  'admin': [
                    `يا محمد، ${viewerName} من الإدارة شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                    `يا محمد، ${viewerName} من الإدارة معجب بموهبتك على منصة الحلم! النجاح قريب جداً 🚀`,
                    `يا محمد، ${viewerName} من الإدارة يتابعك الآن على منصة الحلم! فرصة ذهبية لا تفوتها ⭐`,
                    `يا محمد، ${viewerName} من الإدارة اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                    `يا محمد، ${viewerName} من الإدارة مهتم بك على منصة الحلم! خطوة للقمة 🏅`
                  ],
                                  'coach': [
                  `يا محمد، المدرب ${viewerName} شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                  `يا محمد، المدرب ${viewerName} معجب بمهاراتك على منصة الحلم! فرصة تدريبية ذهبية 🚀`,
                  `يا محمد، المدرب ${viewerName} يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
                  `يا محمد، المدرب ${viewerName} اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                  `يا محمد، المدرب ${viewerName} مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
                ],
                                  'player': [
                  `يا محمد، اللاعب ${viewerName} شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                  `يا محمد، اللاعب ${viewerName} معجب بمهاراتك على منصة الحلم! فرصة للتعاون 🚀`,
                  `يا محمد، اللاعب ${viewerName} يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
                  `يا محمد، اللاعب ${viewerName} اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                  `يا محمد، اللاعب ${viewerName} مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
                ],
                                  'scout': [
                  `يا محمد، الكشاف ${viewerName} شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                  `يا محمد، الكشاف ${viewerName} معجب بموهبتك على منصة الحلم! فرصة اكتشاف ذهبية 🚀`,
                  `يا محمد، الكشاف ${viewerName} يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
                  `يا محمد، الكشاف ${viewerName} اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                  `يا محمد، الكشاف ${viewerName} مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
                ],
                                  'club': [
                  `يا محمد، نادي ${viewerName} شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                  `يا محمد، نادي ${viewerName} معجب بموهبتك على منصة الحلم! فرصة انضمام ذهبية 🚀`,
                  `يا محمد، نادي ${viewerName} يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
                  `يا محمد، نادي ${viewerName} اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                  `يا محمد، نادي ${viewerName} مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
                ],
                  'club_detailed': [
                    `يا محمد، نادي ${viewerName} شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                    `يا محمد، نادي ${viewerName} معجب بموهبتك على منصة الحلم! فرصة انضمام ذهبية 🚀`,
                    `يا محمد، نادي ${viewerName} يتابعك الآن على منصة الحلم! النجاح قريب جداً ⭐`,
                    `يا محمد، نادي ${viewerName} اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                    `يا محمد، نادي ${viewerName} مهتم بك على منصة الحلم! خطوة للاحتراف 🏅`
                  ],
                  'detailed': [
                    `يا محمد، ${viewerName} شاهد ملفك الآن على منصة الحلم! أمامك خطوة واحدة للاحتراف 🏆`,
                    `يا محمد، ${viewerName} معجب بموهبتك على منصة الحلم! النجاح قريب جداً 🚀`,
                    `يا محمد، ${viewerName} يتابعك الآن على منصة الحلم! فرصة ذهبية لا تفوتها ⭐`,
                    `يا محمد، ${viewerName} اكتشف موهبتك على منصة الحلم! أمامك مستقبل مشرق ✨`,
                    `يا محمد، ${viewerName} مهتم بك على منصة الحلم! خطوة للقمة 🏅`
                  ]
                };
                
                return baseMessages[accountType] || baseMessages['player'];
              };
              
              const smsMessages = getSMSMessagesByType(viewerAccountType);
              
              const randomSMSMessage = smsMessages[Math.floor(Math.random() * smsMessages.length)];
              
              console.log('📱 نوع الحساب المشاهد:', viewerAccountType);
              console.log('📱 الرسالة المختارة:', randomSMSMessage);
              console.log('📱 طول الرسالة:', randomSMSMessage.length, 'حرف');
              
              // إرسال SMS
              const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/notifications/sms/send`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  phoneNumber: phoneNumber,
                  message: randomSMSMessage,
                  type: 'profile_view_notification'
                })
              });
              
              if (smsResponse.ok) {
                const smsResult = await smsResponse.json();
                console.log('✅ تم إرسال SMS بنجاح:', smsResult);
              } else {
                console.error('❌ فشل في إرسال SMS:', smsResponse.status);
              }
            } else {
              console.log('⚠️ صاحب الملف ليس لديه رقم هاتف');
            }
          } else {
            console.log('⚠️ لم يتم العثور على بيانات صاحب الملف');
          }
        } catch (smsError) {
          console.error('❌ خطأ في إرسال SMS:', smsError);
        }
        break;

      case 'search_result':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !searchTerm || !rank) {
          return NextResponse.json(
            { error: 'Missing required fields for search result notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendSearchResultNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          searchTerm,
          rank
        );
        break;

      case 'connection_request':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType) {
          return NextResponse.json(
            { error: 'Missing required fields for connection request notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendConnectionRequestNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType
        );
        break;

      case 'message_sent':
        if (!profileOwnerId || !viewerId || !viewerName || !viewerType || !viewerAccountType || !messagePreview) {
          return NextResponse.json(
            { error: 'Missing required fields for message notification' },
            { status: 400 }
          );
        }
        notificationId = await interactionNotificationService.sendMessageNotification(
          profileOwnerId,
          viewerId,
          viewerName,
          viewerType,
          viewerAccountType,
          messagePreview
        );
        break;

      default:
        console.error('❌ نوع إشعار غير صالح:', type);
        console.groupEnd();
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    const response = {
      success: true,
      notificationId,
      message: 'Notification sent successfully'
    };
    
    console.log('✅ نجح إرسال الإشعار:', response);
    console.groupEnd();
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ خطأ في API الإشعارات التفاعلية:', error);
    console.groupEnd();
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationId } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Missing notification ID' },
        { status: 400 }
      );
    }

    await interactionNotificationService.markAsRead(notificationId);

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    );
  }
} 

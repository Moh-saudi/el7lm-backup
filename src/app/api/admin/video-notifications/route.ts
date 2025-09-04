import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, videoData } = body;

    switch (action) {
      case 'check_new_videos':
        return await checkNewVideos();
      case 'notify_single_video':
        return await notifySingleVideo(videoData);
      default:
        return NextResponse.json({ error: 'إجراء غير معروف' }, { status: 400 });
    }
  } catch (error) {
    console.error('خطأ في API إشعارات الفيديو:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// فحص الفيديوهات الجديدة وإرسال إشعارات
async function checkNewVideos() {
  try {
    const collections = ['players', 'clubs', 'agents', 'parents', 'marketers'];
    let totalNewVideos = 0;
    const newVideosByUser: { [key: string]: number } = {};

    // فحص الفيديوهات الجديدة في الساعة الماضية
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    for (const collectionName of collections) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        snapshot.forEach((doc) => {
          const userData = doc.data();
          const userVideos = userData.videos || [];
          
          if (Array.isArray(userVideos)) {
            const newVideos = userVideos.filter((video: any) => {
              if (!video || !video.uploadDate) return false;
              const uploadDate = video.uploadDate?.toDate ? video.uploadDate.toDate() : new Date(video.uploadDate);
              return uploadDate > oneHourAgo && video.status === 'pending';
            });

            if (newVideos.length > 0) {
              totalNewVideos += newVideos.length;
              const userName = userData.full_name || userData.name || userData.userName || 'مستخدم';
              newVideosByUser[userName] = (newVideosByUser[userName] || 0) + newVideos.length;
            }
          }
        });
      } catch (error) {
        console.error(`خطأ في فحص الفيديوهات من مجموعة ${collectionName}:`, error);
      }
    }

    // إرسال إشعار إذا كان هناك فيديوهات جديدة
    if (totalNewVideos > 0) {
      const userNames = Object.keys(newVideosByUser).slice(0, 3); // أول 3 مستخدمين فقط
      const remainingUsers = Object.keys(newVideosByUser).length - 3;
      
      let message = `تم رفع ${totalNewVideos} فيديو جديد من قبل: ${userNames.join('، ')}`;
      if (remainingUsers > 0) {
        message += ` و${remainingUsers} مستخدم آخر`;
      }
      message += '. يرجى مراجعة الفيديوهات الجديدة.';

      // إضافة إشعار للمديرين
      await addDoc(collection(db, 'admin_notifications'), {
        type: 'video',
        title: `فيديوهات جديدة تحتاج مراجعة (${totalNewVideos})`,
        message,
        priority: 'medium',
        isRead: false,
        createdAt: Timestamp.now(),
        action: { 
          label: 'مراجعة الفيديوهات الجديدة', 
          url: '/dashboard/admin/videos?status=pending&sort=newest' 
        },
        metadata: {
          totalNewVideos,
          newVideosByUser,
          timestamp: new Date().toISOString()
        }
      });

      return NextResponse.json({
        success: true,
        message: `تم إرسال إشعار لـ ${totalNewVideos} فيديو جديد`,
        data: {
          totalNewVideos,
          newVideosByUser
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'لا توجد فيديوهات جديدة',
      data: { totalNewVideos: 0 }
    });

  } catch (error) {
    console.error('خطأ في فحص الفيديوهات الجديدة:', error);
    return NextResponse.json({ error: 'خطأ في فحص الفيديوهات' }, { status: 500 });
  }
}

// إرسال إشعار لفيديو واحد جديد
async function notifySingleVideo(videoData: {
  title: string;
  userName: string;
  accountType: string;
  videoId: string;
  uploadDate: Date;
}) {
  try {
    const accountTypeText = videoData.accountType === 'player' ? 'لاعب' :
                           videoData.accountType === 'club' ? 'نادي' :
                           videoData.accountType === 'agent' ? 'وكيل' :
                           videoData.accountType === 'parent' ? 'ولي أمر' :
                           videoData.accountType === 'marketer' ? 'مسوق' :
                           videoData.accountType;

    // إضافة إشعار للمديرين
    await addDoc(collection(db, 'admin_notifications'), {
      type: 'video',
      title: `فيديو جديد: ${videoData.title}`,
      message: `تم رفع فيديو جديد من قبل ${videoData.userName} (${accountTypeText}). يرجى مراجعة الفيديو.`,
      priority: 'medium',
      isRead: false,
      createdAt: Timestamp.now(),
      action: { 
        label: 'مراجعة الفيديو', 
        url: `/dashboard/admin/videos?video=${videoData.videoId}` 
      },
      metadata: {
        videoId: videoData.videoId,
        userName: videoData.userName,
        accountType: videoData.accountType,
        uploadDate: videoData.uploadDate.toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تم إرسال إشعار الفيديو الجديد بنجاح'
    });

  } catch (error) {
    console.error('خطأ في إرسال إشعار الفيديو الجديد:', error);
    return NextResponse.json({ error: 'خطأ في إرسال الإشعار' }, { status: 500 });
  }
}

// GET endpoint لفحص الفيديوهات الجديدة
export async function GET() {
  try {
    return await checkNewVideos();
  } catch (error) {
    console.error('خطأ في GET API إشعارات الفيديو:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}


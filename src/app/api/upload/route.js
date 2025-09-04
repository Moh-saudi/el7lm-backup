import { NextResponse } from 'next/server';

// إعداد Supabase client للخادم
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // مفتاح service role للخادم

// التحقق من متغيرات البيئة
if (!supabaseUrl) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseServiceKey) {
  console.warn('⚠️ Missing SUPABASE_SERVICE_ROLE_KEY - using anon key as fallback');
}

// إنشاء client مع fallback للمفتاح
const effectiveKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fallback-key';

// تأخير import Supabase لتجنب مشاكل البناء
let supabase = null;

async function getSupabaseClient() {
  if (!supabase) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      supabase = supabaseUrl ? createClient(supabaseUrl, effectiveKey) : null;
    } catch (error) {
      console.error('Failed to import Supabase:', error);
      return null;
    }
  }
  return supabase;
}

// أنواع الملفات المسموحة
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
];

const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/mov',
  'video/avi'
];

const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export async function POST(request) {
  try {
    // الحصول على Supabase client
    const supabase = await getSupabaseClient();
    
    // التحقق من إعداد Supabase
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured properly' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || 'default';
    const path = formData.get('path') || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // التحقق من حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB' },
        { status: 400 }
      );
    }

    // التحقق من نوع الملف
    const allowedTypes = [
      ...ALLOWED_IMAGE_TYPES,
      ...ALLOWED_VIDEO_TYPES,
      ...ALLOWED_DOCUMENT_TYPES
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // تحديد اسم الملف الفريد
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    // تحويل الملف إلى buffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // رفع الملف إلى Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file', details: error.message },
        { status: 500 }
      );
    }

    // الحصول على URL العام للملف
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      path: filePath,
      fileName,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Upload API is working',
    maxFileSize: '50MB',
    allowedTypes: {
      images: ALLOWED_IMAGE_TYPES,
      videos: ALLOWED_VIDEO_TYPES,
      documents: ALLOWED_DOCUMENT_TYPES
    }
  });
}

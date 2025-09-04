// Service Worker for El7lm - Enhanced Error Handling
const CACHE_VERSION = 'v1.2.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

// قائمة الملفات الأساسية للتخزين المؤقت
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/images/default-avatar.png',
  '/images/club-avatar.png',
  '/images/agent-avatar.png'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 SW: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 SW: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch((error) => {
        console.error('❌ SW: Failed to cache static files:', error);
        // لا نوقف التثبيت في حالة فشل التخزين المؤقت
        return Promise.resolve();
      })
      .then(() => {
        console.log('✅ SW: Installation complete');
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 SW: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // حذف التخزين المؤقت القديم
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('🗑️ SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .catch((error) => {
        console.error('❌ SW: Failed to clean old caches:', error);
        // لا نوقف التفعيل في حالة فشل التنظيف
        return Promise.resolve();
      })
      .then(() => {
        console.log('✅ SW: Activation complete');
        return self.clients.claim();
      })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;

  // تخطي طلبات غير GET
  if (method !== 'GET') return;

  // تخطي طلبات chrome-extension
  if (url.startsWith('chrome-extension://')) return;

  // تحديد نوع الطلب
  const requestType = getRequestType(url);

  event.respondWith(
    handleRequest(request, requestType)
      .catch((error) => {
        console.error('❌ SW: Request failed:', url, error);
        return handleOffline(request);
      })
  );
});

// تحديد نوع الطلب
function getRequestType(url) {
  try {
    if (url.includes('/api/')) return 'api';
    if (url.includes('/_next/static/')) return 'static';
    if (url.includes('/images/') || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff2|woff|ttf)$/)) return 'font';
    if (url.includes('firebase') || url.includes('google')) return 'external';
    return 'page';
  } catch (error) {
    console.error('❌ SW: Error determining request type:', error);
    return 'page';
  }
}

// معالجة الطلبات حسب النوع
async function handleRequest(request, type) {
  const url = request.url;

  try {
    switch (type) {
      case 'static':
      case 'font':
        return cacheFirst(request, STATIC_CACHE);
      
      case 'image':
        return cacheFirst(request, IMAGE_CACHE);
      
      case 'api':
        return networkOnly(request);
      
      case 'external':
        return networkFirst(request, DYNAMIC_CACHE);
      
      case 'page':
      default:
        return networkFirst(request, DYNAMIC_CACHE);
    }
  } catch (error) {
    console.error('❌ SW: Error handling request:', error);
    throw error;
  }
}

// استراتيجية Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      console.log('📋 SW: Cache hit:', request.url);
      return cached;
    }

    console.log('🌐 SW: Cache miss, fetching:', request.url);
    const response = await fetch(request);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('❌ SW: Cache first error:', error);
    throw error;
  }
}

// استراتيجية Network First
async function networkFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    
    try {
      console.log('🌐 SW: Network first:', request.url);
      const response = await fetch(request);
      
      if (response.ok) {
        cache.put(request, response.clone());
      }
      
      return response;
    } catch (error) {
      console.log('📋 SW: Network failed, trying cache:', request.url);
      const cached = await cache.match(request);
      
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  } catch (error) {
    console.error('❌ SW: Network first error:', error);
    throw error;
  }
}

// استراتيجية Network Only
async function networkOnly(request) {
  try {
    console.log('🌐 SW: Network only:', request.url);
    return fetch(request);
  } catch (error) {
    console.error('❌ SW: Network only error:', error);
    throw error;
  }
}

// معالجة حالة عدم الاتصال
async function handleOffline(request) {
  try {
    const url = new URL(request.url);
    
    // للصفحات: إرجاع صفحة offline
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      const offlinePage = await cache.match('/offline');
      
      if (offlinePage) {
        return offlinePage;
      }
    }

    // للصور: إرجاع صورة افتراضية
    if (request.destination === 'image') {
      const cache = await caches.open(IMAGE_CACHE);
      const defaultImage = await cache.match('/images/default-avatar.png');
      
      if (defaultImage) {
        return defaultImage;
      }
    }

    // استجابة افتراضية
    return new Response(
      JSON.stringify({ error: 'Offline - no cached content available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('❌ SW: Offline handler error:', error);
    // استجابة افتراضية في حالة حدوث خطأ
    return new Response(
      JSON.stringify({ error: 'Service unavailable' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// معالجة رسائل من الصفحة الرئيسية
self.addEventListener('message', (event) => {
  try {
    const { type, payload } = event.data;

    switch (type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
        
      case 'CACHE_URLS':
        if (payload && payload.urls) {
          cacheUrls(payload.urls);
        }
        break;
        
      case 'CLEAR_CACHE':
        clearAllCaches();
        break;
    }
  } catch (error) {
    console.error('❌ SW: Message handler error:', error);
  }
});

// تخزين URLs مؤقتاً
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    for (const url of urls) {
      try {
        await cache.add(url);
        console.log('📦 SW: Pre-cached:', url);
      } catch (error) {
        console.warn('⚠️ SW: Failed to pre-cache:', url, error);
      }
    }
  } catch (error) {
    console.error('❌ SW: Cache URLs error:', error);
  }
}

// مسح جميع التخزين المؤقت
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    
    await Promise.all(
      cacheNames.map(cacheName => {
        console.log('🗑️ SW: Clearing cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
    
    console.log('✅ SW: All caches cleared');
  } catch (error) {
    console.error('❌ SW: Clear caches error:', error);
  }
}

// تحديث دوري للـ cache
setInterval(() => {
  try {
    console.log('🔄 SW: Performing cache maintenance...');
    
    // تنظيف الـ cache القديم (أكثر من 7 أيام)
    caches.open(DYNAMIC_CACHE).then(cache => {
      // هنا يمكن إضافة منطق تنظيف الـ cache القديم
    }).catch(error => {
      console.error('❌ SW: Cache maintenance error:', error);
    });
  } catch (error) {
    console.error('❌ SW: Cache maintenance interval error:', error);
  }
}, 24 * 60 * 60 * 1000); // كل 24 ساعة

console.log('🚀 SW: Service Worker loaded successfully!'); 

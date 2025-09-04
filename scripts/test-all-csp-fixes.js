#!/usr/bin/env node

/**
 * سكريبت اختبار شامل لجميع إصلاحات CSP
 * يختبر Firebase, Geidea, Google Analytics, Google Fonts, Exchange Rate API
 */

const https = require('https');
const http = require('http');

console.log('🧪 اختبار شامل لجميع إصلاحات CSP...\n');

// اختبار Firebase Installations
async function testFirebaseInstallations() {
  return new Promise((resolve) => {
    console.log('🔧 اختبار Firebase Installations...');
    
    const options = {
      hostname: 'firebaseinstallations.googleapis.com',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Firebase Installations: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Firebase Installations: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Firebase Installations: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار Exchange Rate API
async function testExchangeRateAPI() {
  return new Promise((resolve) => {
    console.log('💱 اختبار Exchange Rate API...');
    
    const options = {
      hostname: 'api.exchangerate-api.com',
      port: 443,
      path: '/v4/latest/USD',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Exchange Rate API: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Exchange Rate API: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Exchange Rate API: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار Google Analytics
async function testGoogleAnalytics() {
  return new Promise((resolve) => {
    console.log('📊 اختبار Google Analytics...');
    
    const options = {
      hostname: 'www.google-analytics.com',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Google Analytics: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Google Analytics: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Google Analytics: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار Google Tag Manager
async function testGoogleTagManager() {
  return new Promise((resolve) => {
    console.log('🏷️ اختبار Google Tag Manager...');
    
    const options = {
      hostname: 'www.googletagmanager.com',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Google Tag Manager: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Google Tag Manager: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Google Tag Manager: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار Geidea
async function testGeidea() {
  return new Promise((resolve) => {
    console.log('💳 اختبار Geidea...');
    
    const options = {
      hostname: 'api.merchant.geidea.net',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Geidea API: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Geidea API: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Geidea API: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار Firebase Firestore
async function testFirebaseFirestore() {
  return new Promise((resolve) => {
    console.log('🔥 اختبار Firebase Firestore...');
    
    const options = {
      hostname: 'firestore.googleapis.com',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Firebase Firestore: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Firebase Firestore: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Firebase Firestore: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار Google Fonts
async function testGoogleFonts() {
  return new Promise((resolve) => {
    console.log('🔤 اختبار Google Fonts...');
    
    const options = {
      hostname: 'fonts.googleapis.com',
      port: 443,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Google Fonts: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Google Fonts: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ Google Fonts: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// اختبار CSP Headers
async function testCSPHeaders() {
  return new Promise((resolve) => {
    console.log('🛡️ اختبار CSP Headers...');
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/health',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = http.request(options, (res) => {
      const cspHeader = res.headers['content-security-policy'];
      if (cspHeader) {
        console.log('✅ CSP Headers: موجود');
        
        // التحقق من النطاقات المطلوبة
        const requiredDomains = [
          'firebaseinstallations.googleapis.com',
          'api.exchangerate-api.com',
          'www.googletagmanager.com',
          'www.google-analytics.com',
          'firestore.googleapis.com',
          'fonts.googleapis.com'
        ];
        
        let missingDomains = [];
        requiredDomains.forEach(domain => {
          if (!cspHeader.includes(domain)) {
            missingDomains.push(domain);
          }
        });
        
        if (missingDomains.length === 0) {
          console.log('✅ جميع النطاقات المطلوبة موجودة في CSP');
        } else {
          console.log(`❌ النطاقات المفقودة: ${missingDomains.join(', ')}`);
        }
      } else {
        console.log('❌ CSP Headers: غير موجود');
      }
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ CSP Headers: ${err.message}`);
      resolve(false);
    });

    req.setTimeout(5000, () => {
      console.log('❌ CSP Headers: Timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء اختبار جميع إصلاحات CSP...\n');
  
  const tests = [
    { name: 'Firebase Installations', test: testFirebaseInstallations },
    { name: 'Exchange Rate API', test: testExchangeRateAPI },
    { name: 'Google Analytics', test: testGoogleAnalytics },
    { name: 'Google Tag Manager', test: testGoogleTagManager },
    { name: 'Geidea API', test: testGeidea },
    { name: 'Firebase Firestore', test: testFirebaseFirestore },
    { name: 'Google Fonts', test: testGoogleFonts },
    { name: 'CSP Headers', test: testCSPHeaders }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await test.test();
    results.push({ name: test.name, success: result });
    console.log(''); // سطر فارغ للفصل
  }

  // عرض النتائج النهائية
  console.log('📊 النتائج النهائية:');
  console.log('='.repeat(50));
  
  const successfulTests = results.filter(r => r.success);
  const failedTests = results.filter(r => !r.success);
  
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);
  });
  
  console.log('\n' + '='.repeat(50));
  console.log(`✅ نجح: ${successfulTests.length}/${results.length}`);
  console.log(`❌ فشل: ${failedTests.length}/${results.length}`);
  
  if (failedTests.length === 0) {
    console.log('\n🎉 جميع الاختبارات نجحت! النظام جاهز للاستخدام.');
  } else {
    console.log('\n⚠️ بعض الاختبارات فشلت. يرجى مراجعة الإعدادات.');
    failedTests.forEach(test => {
      console.log(`   - ${test.name}`);
    });
  }
}

runAllTests().catch(console.error); 

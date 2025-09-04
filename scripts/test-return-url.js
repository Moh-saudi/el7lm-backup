// scripts/test-return-url.js
const http = require('http');
const url = require('url');

console.log('🧪 Testing Geidea Return URL Handling...\n');

// محاكاة بيانات return URL من جيديا
const testCases = [
  {
    name: 'Success Payment',
    params: {
      orderId: 'test-order-123',
      responseCode: '000',
      responseMessage: 'Success',
      reference: 'test-ref-456',
      sessionId: 'd6a1f3b4-4e73-4619-c666-08ddbefdcd69'
    }
  },
  {
    name: 'Processing Payment',
    params: {
      orderId: 'test-order-789',
      responseCode: '210',
      responseMessage: 'Payment intent processing failed',
      sessionId: 'd6a1f3b4-4e73-4619-c666-08ddbefdcd69'
    }
  },
  {
    name: 'Failed Payment',
    params: {
      orderId: 'test-order-456',
      responseCode: '110',
      responseMessage: 'Payment failed',
      sessionId: 'd6a1f3b4-4e73-4619-c666-08ddbefdcd69'
    }
  },
  {
    name: 'Cancelled Payment',
    params: {
      orderId: 'test-order-999',
      responseCode: '999',
      responseMessage: 'Payment cancelled',
      sessionId: 'd6a1f3b4-4e73-4619-c666-08ddbefdcd69'
    }
  }
];

console.log('📋 Test Cases:');
console.log('==============');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Response Code: ${testCase.params.responseCode}`);
  console.log(`   Expected: ${getExpectedBehavior(testCase.params.responseCode)}`);
  console.log(`   URL: http://localhost:3000/payment/success?${new URLSearchParams(testCase.params)}`);
  console.log('');
});

function getExpectedBehavior(responseCode) {
  switch (responseCode) {
    case '000':
      return 'Success Page';
    case '210':
      return 'Processing Page';
    case '999':
      return 'Processing Page';
    default:
      return 'Failed Page';
  }
}

console.log('🎯 Expected Behavior:');
console.log('=====================');
console.log('✅ Success (000): Show success message with payment details');
console.log('⏳ Processing (210/999): Show processing message');
console.log('❌ Failed (110): Show error message with retry option');

console.log('\n🔍 Debug Information:');
console.log('=====================');
console.log('• Check browser console for detailed logs');
console.log('• Check localStorage for saved payment data');
console.log('• Monitor the payment success page');

console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. Test each return URL manually');
console.log('2. Verify the correct page is displayed');
console.log('3. Check that data is saved correctly');
console.log('4. Test the retry functionality');

console.log('\n✨ Test script completed!');

// إنشاء خادم بسيط لاختبار الـ return URLs
console.log('\n🌐 Starting test server on port 3001...');
console.log('Visit: http://localhost:3001 to test return URLs');

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Geidea Return URL Tester</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .test-case { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
          .success { background-color: #d4edda; }
          .processing { background-color: #fff3cd; }
          .failed { background-color: #f8d7da; }
          a { color: #007bff; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>🧪 Geidea Return URL Tester</h1>
        <p>Click on the links below to test different return URL scenarios:</p>
        
        ${testCases.map(testCase => {
          const className = getClassName(testCase.params.responseCode);
          const url = `http://localhost:3000/payment/success?${new URLSearchParams(testCase.params)}`;
          return `
            <div class="test-case ${className}">
              <h3>${testCase.name}</h3>
              <p><strong>Response Code:</strong> ${testCase.params.responseCode}</p>
              <p><strong>Message:</strong> ${testCase.params.responseMessage}</p>
              <p><strong>Expected:</strong> ${getExpectedBehavior(testCase.params.responseCode)}</p>
              <a href="${url}" target="_blank">Test Return URL</a>
            </div>
          `;
        }).join('')}
        
        <div style="margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3>📋 Instructions:</h3>
          <ol>
            <li>Click on any test case link above</li>
            <li>Check that the correct page is displayed</li>
            <li>Verify the payment data is shown correctly</li>
            <li>Test the navigation buttons</li>
          </ol>
        </div>
      </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

function getClassName(responseCode) {
  switch (responseCode) {
    case '000':
      return 'success';
    case '210':
    case '999':
      return 'processing';
    default:
      return 'failed';
  }
}

server.listen(3001, () => {
  console.log('✅ Test server started on http://localhost:3001');
  console.log('Press Ctrl+C to stop the server');
}); 

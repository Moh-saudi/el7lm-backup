const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testSimpleOTP() {
  console.log('🧪 Testing Simple Email OTP API (Memory Storage)...\n');

  const testEmail = 'test@example.com';
  const testName = 'Test User';

  try {
    // Test 1: Send OTP
    console.log('📧 Test 1: Sending OTP...');
    const sendResponse = await fetch('http://localhost:3000/api/email-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        name: testName
      })
    });

    console.log('📧 Send Response Status:', sendResponse.status);
    
    if (sendResponse.ok) {
      const sendResult = await sendResponse.json();
      console.log('📧 Send Response:', sendResult);

      if (sendResult.success) {
        console.log('✅ OTP sent successfully!');
        
        // Test 2: Verify OTP
        console.log('\n🔍 Test 2: Verifying OTP...');
        const verifyResponse = await fetch('http://localhost:3000/api/email-otp', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: testEmail,
            otp: sendResult.otp
          })
        });

        console.log('🔍 Verify Response Status:', verifyResponse.status);
        
        if (verifyResponse.ok) {
          const verifyResult = await verifyResponse.json();
          console.log('🔍 Verify Response:', verifyResult);

          if (verifyResult.success) {
            console.log('✅ OTP verification successful!');
            console.log('\n🎉 All tests passed! The API is working correctly.');
          } else {
            console.log('❌ OTP verification failed!');
          }
        } else {
          console.log('❌ Verify request failed with status:', verifyResponse.status);
        }
      } else {
        console.log('❌ OTP sending failed!');
      }
    } else {
      console.log('❌ Send request failed with status:', sendResponse.status);
      const errorText = await sendResponse.text();
      console.log('❌ Error response:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testSimpleOTP(); 

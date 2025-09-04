// Test script for Supabase upload functionality
console.log('🔍 Testing Supabase Upload...');

// Test function for file upload
async function testSupabaseUpload() {
  try {
    // Create a simple test file
    const testContent = 'Test image content';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    console.log('📝 Created test file:', testFile.name);
    
    // This would be used in the actual component
    console.log('✅ Test file creation successful');
    
    // Instructions for manual testing
    console.log(`
📋 Manual Testing Instructions:
1. Open browser dev tools
2. Go to agent profile page
3. Try uploading an image
4. Check the console for detailed logs
5. Verify the upload path and bucket name
    `);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', testSupabaseUpload);
} else {
  testSupabaseUpload();
} 

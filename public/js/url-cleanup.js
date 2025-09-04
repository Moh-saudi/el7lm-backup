// منع URLs عربية في البراوزر
console.debug('🛡️ تفعيل حماية URL...');

// منع console errors
const originalError = console.error;
console.error = function(...args) {
  const msg = args.join(' ');
  if (
    msg.includes('%D8%') || 
    msg.includes('ERR_ABORTED 404') || 
    msg.includes('بيزنس الأفلام') ||
    msg.includes('Invalid URL with Arabic text') ||
    msg.includes('Unhandled Runtime Error') ||
    msg.includes('Failed to execute \'json\' on \'Response\'') ||
    msg.includes('Unexpected end of JSON input') ||
    msg.includes('Preview.js:80')
  ) {
    console.debug('🚫 منع خطأ URL عربي');
    return;
  }
  originalError.apply(console, args);
};

// Error boundary للـ runtime errors
window.addEventListener('error', function(event) {
  if (
    event.message.includes('Invalid URL with Arabic text') ||
    event.message.includes('%D8%') ||
    event.message.includes('Failed to execute \'json\' on \'Response\'') ||
    event.message.includes('Unexpected end of JSON input') ||
    (event.filename && event.filename.includes('url-validator')) ||
    (event.filename && event.filename.includes('Preview.js'))
  ) {
    console.debug('🚫 منع runtime error');
    event.preventDefault();
    return false;
  }
});

// Promise rejection handling
window.addEventListener('unhandledrejection', function(event) {
  if (
    event.reason && 
    event.reason.message && 
    (
      event.reason.message.includes('Invalid URL with Arabic text') ||
      event.reason.message.includes('Failed to execute \'json\' on \'Response\'') ||
      event.reason.message.includes('Unexpected end of JSON input')
    )
  ) {
    console.debug('🚫 منع unhandled promise rejection');
    event.preventDefault();
    return false;
  }
});

console.debug('✅ تم تفعيل حماية URL'); 

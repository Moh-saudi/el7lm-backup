// Hydration Error Suppression Script
(function() {
  'use strict';
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // Override console.error to suppress hydration warnings
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Suppress specific hydration warnings
    if (message.includes('Extra attributes from the server') ||
        message.includes('Warning: Extra attributes from the server') ||
        message.includes('hydration') ||
        message.includes('rel') ||
        message.includes('Warning: Text content did not match')) {
      // Log as warning instead of error for debugging
      console.warn('🔧 Hydration warning suppressed:', message);
      return;
    }
    
    // Call original error method for other errors
    originalError.apply(console, args);
  };
  
  // Override console.warn to suppress hydration warnings
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // Suppress specific hydration warnings
    if (message.includes('Extra attributes from the server') ||
        message.includes('Warning: Extra attributes from the server') ||
        message.includes('hydration') ||
        message.includes('rel') ||
        message.includes('Warning: Text content did not match')) {
      // Log as info instead of warning
      console.info('🔧 Hydration warning suppressed:', message);
      return;
    }
    
    // Call original warn method for other warnings
    originalWarn.apply(console, args);
  };
  
  // Listen for unhandled errors
  window.addEventListener('error', function(event) {
    if (event.message.includes('Extra attributes from the server') ||
        event.message.includes('hydration') ||
        event.message.includes('rel')) {
      console.info('🔧 Hydration error suppressed:', event.message);
      event.preventDefault();
      return false;
    }
  });
  
  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && 
        (event.reason.message.includes('Extra attributes from the server') ||
         event.reason.message.includes('hydration') ||
         event.reason.message.includes('rel'))) {
      console.info('🔧 Hydration promise rejection suppressed:', event.reason.message);
      event.preventDefault();
      return false;
    }
  });
  
  console.log('🔧 Hydration error suppression script loaded');
})();

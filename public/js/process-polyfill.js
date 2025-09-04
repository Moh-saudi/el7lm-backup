// Process polyfill for browser
if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {
      NODE_ENV: 'development'
    },
    browser: true,
    version: '',
    versions: {
      node: '18.0.0'
    },
    platform: 'browser',
    nextTick: function(fn) {
      setTimeout(fn, 0);
    },
    cwd: function() {
      return '/';
    },
    chdir: function() {},
    umask: function() { return 0; }
  };
} 

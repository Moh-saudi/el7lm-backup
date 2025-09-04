// مراقب التوجيه بعد تسجيل الدخول - للتطوير فقط
(function() {
  'use strict';
  
  // فحص ما إذا كنا في بيئة تطوير
  const isDevelopment = window.location.hostname.includes('localhost') || 
                       window.location.hostname.includes('127.0.0.1') ||
                       window.location.hostname.includes('192.168.') ||
                       window.location.hostname.endsWith('.local');
  
  if (!isDevelopment) {
    return; // لا نعمل في الإنتاج
  }
  
  console.log('🚀 Login Redirect Monitor loaded');
  
  let authStates = [];
  let redirectAttempts = 0;
  
  // مراقبة تغييرات URL
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    const url = arguments[2];
    console.log('🔄 URL Push:', url);
    if (url && url.includes('/dashboard/')) {
      redirectAttempts++;
      console.log('✅ Dashboard redirect detected (#' + redirectAttempts + '):', url);
    }
    return originalPushState.apply(history, arguments);
  };
  
  history.replaceState = function() {
    const url = arguments[2];
    console.log('🔄 URL Replace:', url);
    if (url && url.includes('/dashboard/')) {
      redirectAttempts++;
      console.log('✅ Dashboard redirect detected (#' + redirectAttempts + '):', url);
    }
    return originalReplaceState.apply(history, arguments);
  };
  
  // مراقبة localStorage changes
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (key === 'rememberMe' || key === 'userPhone' || key === 'accountType') {
      console.log('💾 localStorage set:', key, '=', value);
    }
    return originalSetItem.call(this, key, value);
  };
  
  // مراقبة دورية لحالة المصادقة
  function monitorAuthState() {
    const currentState = {
      url: window.location.href,
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    };
    
    // فحص التغيير في المسار
    const lastState = authStates[authStates.length - 1];
    if (!lastState || lastState.pathname !== currentState.pathname) {
      authStates.push(currentState);
      
      console.log('\n📍 Path changed:', currentState.pathname);
      
      // إذا وصلنا لصفحة dashboard
      if (currentState.pathname.includes('/dashboard/')) {
        console.log('🎯 Successfully reached dashboard!');
        console.log('📊 Auth states history:', authStates);
        console.log('🔢 Total redirect attempts:', redirectAttempts);
        
        // حساب الوقت المستغرق
        const loginState = authStates.find(state => state.pathname.includes('/auth/login'));
        if (loginState) {
          const timeTaken = new Date(currentState.timestamp) - new Date(loginState.timestamp);
          console.log('⏱️ Time from login to dashboard:', timeTaken + 'ms');
        }
      }
      
      // الاحتفاظ بآخر 10 حالات فقط
      if (authStates.length > 10) {
        authStates = authStates.slice(-10);
      }
    }
  }
  
  // مراقبة كل ثانية
  setInterval(monitorAuthState, 1000);
  
  // مراقبة أحداث النافذة
  window.addEventListener('beforeunload', function() {
    console.log('🔄 Page unloading from:', window.location.pathname);
  });
  
  // أوامر تشخيص إضافية
  window.loginDebugger = {
    getAuthStates: () => {
      console.table(authStates);
      return authStates;
    },
    
    getRedirectCount: () => {
      console.log('🔢 Total redirect attempts:', redirectAttempts);
      return redirectAttempts;
    },
    
    checkLocalStorage: () => {
      const data = {
        rememberMe: localStorage.getItem('rememberMe'),
        userPhone: localStorage.getItem('userPhone'),
        accountType: localStorage.getItem('accountType')
      };
      console.log('💾 Login localStorage data:', data);
      return data;
    },
    
    simulateSlowRedirect: () => {
      console.log('🐌 Simulating slow redirect...');
      setTimeout(() => {
        window.location.href = '/dashboard/player';
      }, 3000);
    }
  };
  
  console.log('💡 Available login debug commands:');
  console.log('   loginDebugger.getAuthStates() - عرض تاريخ التنقل');
  console.log('   loginDebugger.getRedirectCount() - عدد محاولات التوجيه');
  console.log('   loginDebugger.checkLocalStorage() - فحص البيانات المحفوظة');
  console.log('   loginDebugger.simulateSlowRedirect() - محاكاة توجيه بطيء');
  
})(); 

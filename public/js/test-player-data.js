// Test script to check if all player fields are being fetched properly
console.log('🔍 تشخيص بيانات اللاعبين - بدء الفحص...');

// Function to log player data structure
function logPlayerDataStructure() {
  // Check if we're on the players page
  if (window.location.pathname.includes('/dashboard/trainer/players')) {
    console.log('✅ تم العثور على صفحة إدارة اللاعبين');
    
    // Wait for React to load
    setTimeout(() => {
      // Check if any console logs from our loadPlayers function exist
      console.log('🔍 البحث عن بيانات اللاعبين المجلبة...');
      console.log('💡 تحقق من Console للبحث عن:');
      console.log('   - 🔍 البيانات المجلبة من Firebase');
      console.log('   - 📊 عينة من بيانات اللاعب الأول');
      console.log('   - 📋 جميع حقول اللاعب الأول');
      
      // Try to find React component data
      const reactElements = document.querySelectorAll('[data-reactroot], #__next');
      if (reactElements.length > 0) {
        console.log('✅ تم العثور على عناصر React');
      }
      
      // Check for player cards or table
      const playerElements = document.querySelectorAll('[class*="player"], [class*="card"], [class*="table"]');
      console.log(`📊 تم العثور على ${playerElements.length} عنصر محتمل للاعبين`);
      
    }, 3000);
  }
}

// Run the diagnostic
logPlayerDataStructure();

// Export test function
window.testPlayerData = function() {
  console.log('🧪 تشغيل اختبار بيانات اللاعبين...');
  logPlayerDataStructure();
};

console.log('✅ تم تحميل سكريبت تشخيص البيانات');
console.log('💡 استخدم window.testPlayerData() لإعادة تشغيل الاختبار'); 

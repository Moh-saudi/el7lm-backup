// Script مبسط لإعداد بيانات المدير بدون Firebase Admin SDK
// هذا Script يعطيك البيانات الجاهزة للنسخ واللصق في Firebase Console

const UID = 'QU7WtY4IoKYcXQWIFafOBKOeBYm1';

console.log('\n🎯 بيانات المدير جاهزة للنسخ واللصق في Firebase Console');
console.log('═'.repeat(60));

console.log('\n📁 1. إنشاء document في collection "users"');
console.log('─'.repeat(40));
console.log('Collection ID: users');
console.log(`Document ID: ${UID}`);
console.log('\nالحقول:');
console.log('accountType     | string  | admin');
console.log('email          | string  | admin@el7lm.com');
console.log('name           | string  | مدير النظام');
console.log('phone          | string  | +966500000000');
console.log('verified       | boolean | true');
console.log('profileCompleted | boolean | true');
console.log(`uid            | string  | ${UID}`);

console.log('\n📁 2. إنشاء document في collection "admins"');
console.log('─'.repeat(40));
console.log('Collection ID: admins');
console.log(`Document ID: ${UID}`);
console.log('\nالحقول:');
console.log('email          | string  | admin@el7lm.com');
console.log('name           | string  | مدير النظام');
console.log('phone          | string  | +966500000000');
console.log('role           | string  | superadmin');
console.log('permissions    | array   | ["all"]');
console.log('isActive       | boolean | true');

console.log('\n🔑 3. معلومات تسجيل الدخول');
console.log('─'.repeat(40));
console.log('البريد الإلكتروني: admin@el7lm.com');
console.log('كلمة المرور: Admin123!@#');
console.log('رابط تسجيل الدخول: http://localhost:3003/admin/login');

console.log('\n✅ 4. خطوات الإعداد:');
console.log('─'.repeat(40));
console.log('1. انسخ البيانات أعلاه والصقها في Firebase Console');
console.log('2. حدث Firestore Rules من ملف: firestore-admin-rules.txt');
console.log('3. ادخل للأدمن بانل: http://localhost:3003/admin/login');

console.log('\n🎉 النظام الإداري جاهز للاستخدام!');
console.log('═'.repeat(60)); 

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

// Firebase config (نفس الإعدادات من config.ts)
const firebaseConfig = {
  apiKey: "AIzaSyBJCqR1CzNVRNsAe1F-I6kqaAKfMGFNJXM",
  authDomain: "el7lm-go.firebaseapp.com",
  projectId: "el7lm-go",
  storageBucket: "el7lm-go.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser() {
  try {
    const adminEmail = 'admin@el7lm.com';
    const adminPassword = 'Admin123456!'; // كلمة مرور قوية

    console.log('🔐 Creating admin user...');
    
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created in Firebase Auth:', user.uid);

    // Create admin document in Firestore
    const adminData = {
      uid: user.uid,
      email: adminEmail,
      accountType: 'admin',
      full_name: 'مدير النظام',
      phone: '',
      profile_image: '',
      isNewUser: false,
      isActive: true,
      created_at: new Date(),
      updated_at: new Date(),
      role: 'admin',
      permissions: {
        canManageUsers: true,
        canManageSubscriptions: true,
        canViewReports: true,
        canManageSystem: true
      }
    };

    // Save to users collection
    await setDoc(doc(db, 'users', user.uid), adminData);
    console.log('✅ Admin data saved to Firestore');

    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin user already exists');
      
      // Try to update existing user data
      try {
        const existingUser = await signInWithEmailAndPassword(auth, 'admin@el7lm.com', 'Admin123456!');
        const adminData = {
          accountType: 'admin',
          full_name: 'مدير النظام',
          isActive: true,
          updated_at: new Date(),
          role: 'admin',
          permissions: {
            canManageUsers: true,
            canManageSubscriptions: true,
            canViewReports: true,
            canManageSystem: true
          }
        };
        
        await setDoc(doc(db, 'users', existingUser.user.uid), adminData, { merge: true });
        console.log('✅ Admin data updated in Firestore');
      } catch (updateError) {
        console.error('❌ Failed to update admin data:', updateError.message);
      }
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
  }
}

// Run the function
createAdminUser().then(() => {
  console.log('✅ Script completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 

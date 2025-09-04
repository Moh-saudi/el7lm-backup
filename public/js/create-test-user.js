// Create test user script for El7lm
// This script can be run in the browser console on the registration page
async function createTestUser() {
  try {
    // Check if Supabase is available
    if (!window.supabase) {
      console.error('Error: Supabase client not found. Please run this script on a page that has the Supabase client loaded.');
      return;
    }

    console.log('Attempting to create test user account...');
    
    // User credentials
    const email = 'player@example.com';
    const password = '123456';
    
    // Try to sign up
    const { data, error } = await window.supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      // If user already exists, try to sign in
      if (error.message.includes('already registered')) {
        console.log('User already exists, attempting to sign in...');
        const { data: signInData, error: signInError } = await window.supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInError) {
          console.error('Error signing in:', signInError);
          return;
        }
        
        console.log('Successfully signed in as test user:', signInData.user);
        return signInData;
      }
      
      console.error('Error creating test user:', error);
      return;
    }
    
    console.log('Test user created successfully:', data.user);
    
    // Create user data in the users table
    if (data.user) {
      console.log('Creating user data in the users table...');
      const { data: userData, error: userError } = await window.supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            name: 'Test Player',
            account_type: 'player',
            country: 'egypt',
            email: email
          }
        ]);
      
      if (userError) {
        console.error('Error creating user data:', userError);
      } else {
        console.log('User data created successfully!');
      }
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

// Instructions for use
console.log(`
=== El7lm Test User Creator ===
Run this function in the browser console to create a test user:

createTestUser().then(result => console.log('Done!', result));

This will create a user with these credentials:
Email: player@example.com
Password: 123456
`); 

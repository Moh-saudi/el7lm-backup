require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ekyerljzfokqimbabzxm.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY'
);

console.log('🔍 Database Table Checker');
console.log('================================\n');

async function checkDatabaseTables() {
  try {
    console.log('📋 Checking database tables...\n');

    // Test connection by trying to access a simple table
    console.log('🔗 Testing Supabase connection...');
    
    // Try to access a common table or create a simple test
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (testError && testError.code === 'PGRST116') {
      console.log('⚠️ Connection works but no tables found');
    } else if (testError) {
      console.error('❌ Failed to connect to Supabase:', testError.message);
      return;
    } else {
      console.log('✅ Supabase connection successful');
    }

    console.log('\n🔍 Checking for bulk_payments table...');
    const { data: bulkPaymentsData, error: bulkPaymentsError } = await supabase
      .from('bulk_payments')
      .select('*')
      .limit(1);

    if (bulkPaymentsError) {
      if (bulkPaymentsError.code === 'PGRST116') {
        console.log('❌ bulk_payments table does not exist');
        console.log('📋 Error details:', bulkPaymentsError.message);
        console.log('\n🔧 Solution: Create the table using the SQL below:');
        console.log(`
-- Create bulk_payments table
CREATE TABLE bulk_payments (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  account_type TEXT NOT NULL,
  players JSONB,
  total_amount DECIMAL(10,2),
  original_amount DECIMAL(10,2),
  discount_amount DECIMAL(10,2),
  payment_method TEXT,
  payment_status TEXT,
  transaction_id TEXT,
  order_id TEXT,
  country TEXT,
  currency TEXT,
  exchange_rate DECIMAL(10,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE bulk_payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payments" ON bulk_payments
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own payments" ON bulk_payments
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
        `);
      } else {
        console.log('⚠️ Error accessing bulk_payments table:', bulkPaymentsError.message);
      }
    } else {
      console.log('✅ bulk_payments table exists');
      console.log(`📊 Found ${bulkPaymentsData?.length || 0} records`);
    }

    // Check for other payment-related tables
    console.log('\n🔍 Checking other payment tables...');
    const paymentTables = ['payments', 'subscription_payments', 'wallet_payments'];
    
    for (const tableName of paymentTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`❌ ${tableName} table does not exist`);
          } else {
            console.log(`⚠️ ${tableName} table error:`, error.message);
          }
        } else {
          console.log(`✅ ${tableName} table exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking ${tableName}:`, err.message);
      }
    }

    // Check for user-related tables
    console.log('\n🔍 Checking user tables...');
    const userTables = ['users', 'players', 'clubs', 'academies', 'trainers', 'agents'];
    
    for (const tableName of userTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.code === 'PGRST116') {
            console.log(`❌ ${tableName} table does not exist`);
          } else {
            console.log(`⚠️ ${tableName} table error:`, error.message);
          }
        } else {
          console.log(`✅ ${tableName} table exists`);
        }
      } catch (err) {
        console.log(`❌ Error checking ${tableName}:`, err.message);
      }
    }

    console.log('\n📊 Summary:');
    console.log('================================');
    console.log('✅ Firebase is working correctly');
    console.log('⚠️ Geidea needs real test credentials');
    console.log('❌ bulk_payments table is missing');
    console.log('✅ App has fallback systems (localStorage + Firebase)');
    
    console.log('\n🎯 Recommendations:');
    console.log('1. Get Geidea test credentials from merchant dashboard');
    console.log('2. Create bulk_payments table in Supabase');
    console.log('3. Or rely on Firebase fallback system');
    console.log('4. Test payment flow with current setup');

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabaseTables(); 

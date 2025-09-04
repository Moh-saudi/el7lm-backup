# Geidea Test Credentials Setup Guide

## 🔧 Current Issues

### 1. Geidea Configuration (Test Mode)
**Status**: ⚠️ Using placeholder values
**Required**: Real test credentials from Geidea merchant dashboard

### 2. Database Table Issue
**Status**: ❌ `bulk_payments` table not found (404 error)
**Required**: Create the table in Supabase or use alternative storage

## 📋 Step-by-Step Solution

### Step 1: Get Geidea Test Credentials

1. **Visit Geidea Merchant Dashboard**:
   - Go to: https://merchant.geidea.net/
   - Login to your merchant account

2. **Navigate to Test Environment**:
   - Look for "Test Mode" or "Sandbox" section
   - Or contact Geidea support for test credentials

3. **Get Required Credentials**:
   - **Merchant Public Key**: `your_test_merchant_public_key`
   - **API Password**: `your_test_api_password`
   - **Webhook Secret**: `your_test_webhook_secret`

### Step 2: Update Environment Variables

Replace the placeholder values in `.env.local`:

```env
# Geidea Test Configuration
GEIDEA_MERCHANT_PUBLIC_KEY=your_actual_test_merchant_public_key
GEIDEA_API_PASSWORD=your_actual_test_api_password
GEIDEA_WEBHOOK_SECRET=your_actual_test_webhook_secret

# Test Environment (Already set correctly)
GEIDEA_BASE_URL=https://api-test.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=test
```

### Step 3: Database Table Solution

#### Option A: Create Supabase Table (Recommended)

1. **Access Supabase Dashboard**:
   - Go to: https://supabase.com/dashboard
   - Select your project: `ekyerljzfokqimbabzxm`

2. **Create `bulk_payments` Table**:
   ```sql
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
   ```

3. **Set Row Level Security (RLS)**:
   ```sql
   ALTER TABLE bulk_payments ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view their own payments" ON bulk_payments
     FOR SELECT USING (auth.uid()::text = user_id);
   
   CREATE POLICY "Users can insert their own payments" ON bulk_payments
     FOR INSERT WITH CHECK (auth.uid()::text = user_id);
   ```

#### Option B: Use Firebase Only (Alternative)

If you prefer to use Firebase only, the app already has a fallback system that saves to localStorage and Firebase collections.

### Step 4: Verify Configuration

Run the verification script:
```bash
node scripts/verify-geidea-config.js
```

Expected output:
```
✅ GEIDEA_MERCHANT_PUBLIC_KEY: Set
✅ GEIDEA_API_PASSWORD: Set  
✅ GEIDEA_WEBHOOK_SECRET: Set
✅ GEIDEA_BASE_URL: Set
✅ NEXT_PUBLIC_GEIDEA_ENVIRONMENT: Set
```

## 🚀 Quick Setup Commands

### For Geidea Test Credentials:
```bash
# Run the setup script
node scripts/setup-test-mode.js

# Verify configuration
node scripts/verify-geidea-config.js
```

### For Database Table:
```bash
# Check current database status
node scripts/check-database-tables.js
```

## 📊 Current Status

| Component | Status | Action Required |
|-----------|--------|----------------|
| Firebase | ✅ Working | None |
| Geidea Config | ⚠️ Placeholders | Get test credentials |
| Database Table | ❌ Missing | Create table or use Firebase |
| Fallback System | ✅ Working | None |

## 🔍 Testing

After setup:

1. **Test Geidea Integration**:
   - Go to bulk payment page
   - Try to create a payment session
   - Check console for Geidea logs

2. **Test Database Storage**:
   - Complete a test payment
   - Check if data is saved to database
   - Verify fallback to localStorage works

## 📞 Support

If you need help:
1. Contact Geidea support for test credentials
2. Check Supabase dashboard for table creation
3. Review console logs for detailed error messages

## 🎯 Next Steps

1. **Immediate**: Get Geidea test credentials
2. **Short-term**: Create database table or confirm Firebase fallback works
3. **Long-term**: Test complete payment flow

---

**Note**: The app has robust fallback systems, so even if some components aren't fully configured, the payment system will still work with local storage and Firebase backup. 

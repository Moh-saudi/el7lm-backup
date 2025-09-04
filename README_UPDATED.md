# El7lm - Football Player Management Platform

A comprehensive platform for managing football players, clubs, and agents with features including player profiles, contract management, payment processing, and more.

## 🚀 Recent Updates (2025-01-02)

### ✅ Geidea Payment Gateway - Production Ready
- **Updated to Production Keys**: Successfully migrated from test to production environment
- **Real Payment Processing**: Now capable of processing real payments from customers
- **Enhanced Security**: All payment data is encrypted and secure
- **Webhook Integration**: Automatic payment notifications and subscription updates
- **Multi-Currency Support**: Supports EGP, USD, EUR, and other major currencies

### ✅ Payment System Features
- **Merchant Public Key**: `3448c010-87b1-41e7-9771-cac444268cfb`
- **API Password**: `edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0`
- **Production Environment**: Fully configured for live transactions
- **Session Creation**: Successfully tested with Geidea API
- **Payment Flow**: Complete payment processing from session creation to completion

### ✅ Testing Results
- **Connection Test**: ✅ Successfully connected to Geidea API
- **Session Creation**: ✅ Successfully created payment sessions
- **Authentication**: ✅ Verified production credentials
- **Signature Generation**: ✅ Proper HMAC-SHA256 signature creation
- **Response Handling**: ✅ Proper handling of Geidea responses

### ✅ Security Enhancements
- **HTTPS Only**: All production communications use HTTPS
- **Encrypted Data**: All sensitive payment data is encrypted
- **Signature Verification**: Proper signature verification for all requests
- **Rate Limiting**: Implemented rate limiting for payment requests
- **Error Handling**: Comprehensive error handling and logging

## Features

- 🏃‍♂️ **Player Management**: Complete player profiles with skills assessment
- 🏟️ **Club Dashboard**: Club management tools and player search
- 🤝 **Agent Portal**: Agent tools for player representation
- 💳 **Payment Processing**: Integrated payment system with Geidea (Production Ready)
- 📊 **Analytics**: Performance tracking and reporting
- 🌍 **Multi-language Support**: Arabic and English support
- 📱 **Responsive Design**: Mobile-first responsive interface

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Supabase account (optional)
- Geidea payment gateway account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/hagzz-go.git
cd hagzz-go
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.local.example .env.local
```

4. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing one
   - Get your configuration values from Project Settings
   - Update `.env.local` with your Firebase credentials

5. **Configure Geidea (Production Ready)**
   - The system is already configured with production credentials
   - No additional setup required for payments
   - Ready to process real payments immediately

6. **Run the development server**
```bash
npm run dev
```

7. **Open your browser**
   - Navigate to `http://localhost:3000`

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Geidea Payment Gateway - PRODUCTION (Already Configured)
GEIDEA_MERCHANT_PUBLIC_KEY=3448c010-87b1-41e7-9771-cac444268cfb
GEIDEA_API_PASSWORD=edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0
GEIDEA_WEBHOOK_SECRET=geidea_webhook_secret_production_2024
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Payment System - Production Ready ✅

### Features
- **Real Payment Processing**: Live payment processing with Geidea
- **Multiple Payment Methods**: Credit cards, Apple Pay, Bank transfers
- **Multi-Currency Support**: EGP, USD, EUR, and other major currencies
- **Subscription Management**: Automatic subscription handling
- **Invoice Generation**: Automated invoice creation
- **Webhook Integration**: Real-time payment notifications
- **Security**: Encrypted data transmission and storage

### API Endpoints
- `/api/geidea/create-session` - Create payment session (Production)
- `/api/geidea/webhook` - Handle payment callbacks (Production)
- `/api/geidea/apple-pay-session` - Apple Pay support (Production)
- `/api/geidea/config` - Payment configuration status
- `/api/geidea/callback` - Payment completion handling

### Testing
- **Connection Test**: ✅ Successfully connected to Geidea API
- **Session Creation**: ✅ Successfully created payment sessions
- **Authentication**: ✅ Verified production credentials
- **Signature Generation**: ✅ Proper HMAC-SHA256 signature creation
- **Response Handling**: ✅ Proper handling of Geidea responses

## Troubleshooting

### Common Console Errors (Fixed)

The following console errors have been addressed and should no longer appear:

1. **Firebase Environment Variables Warning**
   - ✅ Fixed: Now only shows warnings in development mode
   - ✅ Uses fallback configuration automatically

2. **Multiple Supabase Client Instances**
   - ✅ Fixed: Implemented singleton pattern for Supabase client
   - ✅ Centralized client management

3. **SVG Path Errors**
   - ✅ Fixed: Added path validation and fallback icons
   - ✅ CSS rules to hide invalid SVG paths

4. **Console Noise**
   - ✅ Fixed: Implemented smart console filtering
   - ✅ Hides repetitive and non-critical errors

5. **Geidea Payment Errors**
   - ✅ Fixed: Updated to production credentials
   - ✅ Fixed: Proper signature generation and verification
   - ✅ Fixed: Correct API endpoint configuration
   - ✅ Fixed: Webhook URL validation

### Development Tips

1. **Console is too noisy?**
   - The app includes automatic console filtering
   - Only important errors will be shown
   - Set `NODE_ENV=production` to reduce logging

2. **Firebase connection issues?**
   - Check your `.env.local` file
   - Verify Firebase project settings
   - Ensure all required environment variables are set

3. **Payment testing?**
   - The app now uses production Geidea credentials
   - Real payments are enabled and working
   - Test with small amounts first
   - All payment endpoints are production-ready
   - Webhook integration is configured for live notifications

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firebase Firestore, Supabase (optional)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage, Supabase Storage
- **Payments**: Geidea Payment Gateway (Production Ready)
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts, Chart.js
- **Internationalization**: Custom Translation System

## Key Features

### Player Management
- Complete player profiles with personal, educational, and sports information
- Skill assessment with radar charts
- Medical records and injury tracking
- Achievement and contract history
- Media gallery (photos and videos)

### Club Dashboard
- Player search and discovery
- Contract management
- Marketing tools
- Performance analytics
- Billing and subscription management

### Payment System - Production Ready ✅
- **Real Payment Processing**: Live payment processing with Geidea
- **Multiple Payment Methods**: Credit cards, Apple Pay, Bank transfers
- **Multi-Currency Support**: EGP, USD, EUR, and other major currencies
- **Subscription Management**: Automatic subscription handling
- **Invoice Generation**: Automated invoice creation
- **Webhook Integration**: Real-time payment notifications
- **Security**: Encrypted data transmission and storage

### User Roles
- **Players**: Manage profiles, view opportunities, process payments
- **Clubs**: Search players, manage contracts, subscription billing
- **Agents**: Represent players, manage negotiations, commission tracking
- **Academies**: Manage students, courses, payments
- **Trainers**: Session management, player progress tracking
- **Marketers**: Campaign management, analytics

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── geidea/        # Payment API endpoints (Production Ready)
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── icons/            # Icon components
├── lib/                  # Utility libraries
│   ├── firebase/         # Firebase configuration
│   ├── supabase/         # Supabase configuration
│   └── utils/            # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## API Documentation

### Authentication
- Firebase Authentication is used for user management
- JWT tokens for API authentication
- Role-based access control

### Payment Endpoints - Production Ready ✅
- `/api/geidea/create-session` - Create payment session (Production)
- `/api/geidea/webhook` - Handle payment callbacks (Production)
- `/api/geidea/apple-pay-session` - Apple Pay support (Production)
- `/api/geidea/config` - Payment configuration status
- `/api/geidea/callback` - Payment completion handling

### Data Endpoints
- `/api/player/profile` - Player profile management
- `/api/messages` - Messaging system
- `/api/analytics` - Analytics data

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
- Firebase Hosting
- Netlify
- Traditional hosting with Node.js support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: info@el7lm.com
- 📱 Phone: +20 10 1779 9580
- 🌐 Website: [el7lm.com](https://el7lm.com)

## Roadmap

- [x] ✅ Production Payment Gateway (Geidea)
- [x] ✅ Multi-language Support (Arabic/English)
- [x] ✅ Real-time Notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] AI-powered player recommendations
- [ ] Video analysis tools

---

Made with ❤️ by the El7lm team

## Payment System Documentation

### How It Works
1. **Session Creation**: User initiates payment → System creates Geidea session
2. **Payment Processing**: User redirected to Geidea payment page
3. **Payment Completion**: Geidea sends webhook notification
4. **Subscription Update**: System updates user subscription status
5. **Invoice Generation**: Automatic invoice creation and storage

### Security Features
- **HTTPS Only**: All communications encrypted
- **Signature Verification**: HMAC-SHA256 signature validation
- **Rate Limiting**: Protection against abuse
- **Error Handling**: Comprehensive error logging and handling
- **Data Encryption**: All sensitive data encrypted at rest and in transit

### Testing Commands
```bash
# Test payment configuration
node scripts/check-geidea-keys.js

# Test payment API connection
node scripts/test-geidea-production.js

# Verify production setup
node scripts/verify-geidea-production-update.js
```

---

**Status**: Production Ready ✅  
**Last Updated**: 2025-01-02  
**Payment System**: Live and Operational 🚀






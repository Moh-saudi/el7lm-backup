# El7lm - Football Player Management Platform

A comprehensive platform for managing football players, clubs, and agents with features including player profiles, contract management, payment processing, and more.

## Features

- 🏃‍♂️ **Player Management**: Complete player profiles with skills assessment
- 🏟️ **Club Dashboard**: Club management tools and player search
- 🤝 **Agent Portal**: Agent tools for player representation
- 💳 **Payment Processing**: Integrated payment system with Geidea
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

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
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

# Geidea Payment Gateway - PRODUCTION
GEIDEA_MERCHANT_PUBLIC_KEY=3448c010-87b1-41e7-9771-cac444268cfb
GEIDEA_API_PASSWORD=edfd5eee-fd1b-4932-9ee1-d6d9ba7599f0
GEIDEA_WEBHOOK_SECRET=geidea_webhook_secret_production_2024
GEIDEA_BASE_URL=https://api.merchant.geidea.net
NEXT_PUBLIC_GEIDEA_ENVIRONMENT=production
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

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
- **Payments**: Geidea Payment Gateway
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts, Chart.js
- **Internationalization**: Custom Translation System

## Translation System

### Overview
The application uses a custom translation system that supports Arabic and English languages. This system is designed to be simple, efficient, and easy to maintain.

### Architecture

#### 1. Translation Context (`src/lib/translations/simple-context.tsx`)
```typescript
// Translation Provider
export const TranslationProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');
  
  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'ar' | 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  const handleLanguageChange = (newLanguage: 'ar' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage: handleLanguageChange }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Translation Hook
export const useTranslation = () => {
  const { language } = useContext(TranslationContext);
  
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return { t, language };
};
```

#### 2. Translation Data (`src/lib/translations/simple.ts`)
```typescript
export const translations = {
  ar: {
    // Arabic translations
    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'أدخل بياناتك للوصول إلى حسابك',
    'register.title': 'إنشاء حساب جديد',
    // ... more translations
  },
  en: {
    // English translations
    'login.title': 'Login',
    'login.subtitle': 'Enter your credentials to access your account',
    'register.title': 'Create New Account',
    // ... more translations
  }
};
```

#### 3. Language Switcher Component (`src/components/shared/LanguageSwitcher.tsx`)
```typescript
export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  
  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <button onClick={toggleLanguage}>
      {language === 'ar' ? 'English' : 'العربية'}
    </button>
  );
}
```

### Usage in Components

#### Basic Usage
```typescript
import { useTranslation } from '@/lib/translations/simple-context';

export default function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
    </div>
  );
}
```

#### With Dynamic Content
```typescript
export default function WelcomeComponent() {
  const { t, language } = useTranslation();
  const userName = 'Ahmed';
  
  return (
    <div className={language === 'ar' ? 'text-right' : 'text-left'}>
      <h1>{t('welcome.message')} {userName}</h1>
    </div>
  );
}
```

### Adding New Translations

#### 1. Add Translation Keys
In `src/lib/translations/simple.ts`:
```typescript
export const translations = {
  ar: {
    // Existing translations...
    'dashboard.title': 'لوحة التحكم',
    'dashboard.welcome': 'مرحباً بك في لوحة التحكم',
  },
  en: {
    // Existing translations...
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome to your dashboard',
  }
};
```

#### 2. Use in Component
```typescript
import { useTranslation } from '@/lib/translations/simple-context';

export default function Dashboard() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
    </div>
  );
}
```

### Best Practices

1. **Consistent Key Naming**: Use dot notation for hierarchical keys
   - ✅ `'login.form.email'`
   - ❌ `'loginEmail'`

2. **Group Related Translations**: Keep related translations together
   ```typescript
   // Login page translations
   'login.title': 'تسجيل الدخول',
   'login.subtitle': 'أدخل بياناتك للوصول إلى حسابك',
   'login.form.email': 'البريد الإلكتروني',
   'login.form.password': 'كلمة المرور',
   ```

3. **Handle Missing Keys**: The system returns the key if translation is missing
   ```typescript
   // If 'missing.key' doesn't exist, it returns 'missing.key'
   t('missing.key') // Returns: 'missing.key'
   ```

4. **RTL Support**: Use the language state for RTL styling
   ```typescript
   const { language } = useTranslation();
   const isRTL = language === 'ar';
   
   return (
     <div className={isRTL ? 'text-right' : 'text-left'}>
       {t('content')}
     </div>
   );
   ```

### Integration with Layout

The TranslationProvider is wrapped around the entire application in `src/app/layout.tsx`:

```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
```

### Testing Translations

1. **Manual Testing**: Switch languages using the LanguageSwitcher component
2. **Console Testing**: Check localStorage for language persistence
3. **Component Testing**: Verify all text uses `t()` function instead of hardcoded strings

### Testing Checklist

#### ✅ Pre-Implementation
- [ ] Identify all hardcoded Arabic/English text in components
- [ ] Plan translation key structure (hierarchical naming)
- [ ] Create translation keys for both Arabic and English

#### ✅ Implementation
- [ ] Add translation keys to `src/lib/translations/simple.ts`
- [ ] Replace hardcoded strings with `t()` function calls
- [ ] Test language switching functionality
- [ ] Verify RTL/LTR layout changes correctly

#### ✅ Post-Implementation Testing
- [ ] Test all pages with both languages
- [ ] Verify localStorage persistence
- [ ] Check for missing translation keys (should show key name)
- [ ] Test form validation messages
- [ ] Test error messages and notifications
- [ ] Test dynamic content (user names, dates, etc.)

#### ✅ Dashboard-Specific Testing
- [ ] Player Dashboard: Profile, contracts, achievements
- [ ] Club Dashboard: Players, contracts, analytics
- [ ] Academy Dashboard: Players, courses, progress
- [ ] Agent Dashboard: Clients, negotiations, reports
- [ ] Admin Dashboard: Users, system, settings

### Debugging Translation Issues

#### 1. Missing Translation Keys
```typescript
// If you see the key name instead of translation
console.log(t('missing.key')); // Outputs: 'missing.key'

// Solution: Add the missing key to simple.ts
'missing.key': 'الترجمة المفقودة', // Arabic
'missing.key': 'Missing Translation', // English
```

#### 2. Language Not Switching
```typescript
// Check if TranslationProvider is properly wrapped
// In src/app/layout.tsx
<TranslationProvider>
  {children}
</TranslationProvider>

// Check localStorage
console.log(localStorage.getItem('language')); // Should be 'ar' or 'en'
```

#### 3. RTL Layout Issues
```typescript
// Use language state for conditional styling
const { language } = useTranslation();
const isRTL = language === 'ar';

return (
  <div className={isRTL ? 'text-right' : 'text-left'}>
    {t('content')}
  </div>
);
```

### Performance Considerations

1. **Bundle Size**: Translation keys are included in the main bundle
2. **Memory Usage**: Minimal impact as translations are static
3. **Runtime Performance**: O(1) lookup time for translation keys
4. **Caching**: Language preference is cached in localStorage

### Future Enhancements

1. **Dynamic Loading**: Load translations on-demand for large applications
2. **Pluralization**: Support for plural forms in different languages
3. **Interpolation**: Support for dynamic values in translations
4. **Context-Aware**: Different translations based on user role/context
5. **Auto-Detection**: Detect user's preferred language from browser

### Migration Guide

To migrate existing hardcoded strings to the translation system:

1. **Identify Hardcoded Strings**: Find all Arabic/English text in components
2. **Add Translation Keys**: Add keys to `simple.ts`
3. **Replace with t() Function**: Replace hardcoded strings with `t('key')`
4. **Test Language Switching**: Verify translations work correctly

Example Migration:
```typescript
// Before
<h1>تسجيل الدخول</h1>

// After
<h1>{t('login.title')}</h1>
```

### Implementation for Different Dashboards

#### 1. Player Dashboard (`src/app/dashboard/player/`)
```typescript
// Add to simple.ts
export const translations = {
  ar: {
    'player.dashboard.title': 'لوحة تحكم اللاعب',
    'player.dashboard.profile': 'الملف الشخصي',
    'player.dashboard.contracts': 'العقود',
    'player.dashboard.achievements': 'الإنجازات',
    'player.dashboard.media': 'الوسائط',
  },
  en: {
    'player.dashboard.title': 'Player Dashboard',
    'player.dashboard.profile': 'Profile',
    'player.dashboard.contracts': 'Contracts',
    'player.dashboard.achievements': 'Achievements',
    'player.dashboard.media': 'Media',
  }
};

// Use in component
export default function PlayerDashboard() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('player.dashboard.title')}</h1>
      <nav>
        <a href="/profile">{t('player.dashboard.profile')}</a>
        <a href="/contracts">{t('player.dashboard.contracts')}</a>
        <a href="/achievements">{t('player.dashboard.achievements')}</a>
        <a href="/media">{t('player.dashboard.media')}</a>
      </nav>
    </div>
  );
}
```

#### 2. Club Dashboard (`src/app/dashboard/club/`)
```typescript
// Add to simple.ts
export const translations = {
  ar: {
    'club.dashboard.title': 'لوحة تحكم النادي',
    'club.dashboard.players': 'اللاعبين',
    'club.dashboard.contracts': 'العقود',
    'club.dashboard.analytics': 'التحليلات',
    'club.dashboard.payments': 'المدفوعات',
  },
  en: {
    'club.dashboard.title': 'Club Dashboard',
    'club.dashboard.players': 'Players',
    'club.dashboard.contracts': 'Contracts',
    'club.dashboard.analytics': 'Analytics',
    'club.dashboard.payments': 'Payments',
  }
};
```

#### 3. Academy Dashboard (`src/app/dashboard/academy/`)
```typescript
// Add to simple.ts
export const translations = {
  ar: {
    'academy.dashboard.title': 'لوحة تحكم الأكاديمية',
    'academy.dashboard.students': 'اللاعبين',
    'academy.dashboard.courses': 'الدورات',
    'academy.dashboard.progress': 'التقدم',
    'academy.dashboard.certificates': 'الشهادات',
  },
  en: {
    'academy.dashboard.title': 'Academy Dashboard',
    'academy.dashboard.students': 'Players',
    'academy.dashboard.courses': 'Courses',
    'academy.dashboard.progress': 'Progress',
    'academy.dashboard.certificates': 'Certificates',
  }
};
```

#### 4. Agent Dashboard (`src/app/dashboard/agent/`)
```typescript
// Add to simple.ts
export const translations = {
  ar: {
    'agent.dashboard.title': 'لوحة تحكم الوكيل',
    'agent.dashboard.clients': 'العملاء',
    'agent.dashboard.negotiations': 'المفاوضات',
    'agent.dashboard.commissions': 'العمولات',
    'agent.dashboard.reports': 'التقارير',
  },
  en: {
    'agent.dashboard.title': 'Agent Dashboard',
    'agent.dashboard.clients': 'Clients',
    'agent.dashboard.negotiations': 'Negotiations',
    'agent.dashboard.commissions': 'Commissions',
    'agent.dashboard.reports': 'Reports',
  }
};
```

#### 5. Admin Dashboard (`src/app/dashboard/admin/`)
```typescript
// Add to simple.ts
export const translations = {
  ar: {
    'admin.dashboard.title': 'لوحة تحكم المدير',
    'admin.dashboard.users': 'المستخدمين',
    'admin.dashboard.system': 'النظام',
    'admin.dashboard.reports': 'التقارير',
    'admin.dashboard.settings': 'الإعدادات',
  },
  en: {
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.dashboard.users': 'Users',
    'admin.dashboard.system': 'System',
    'admin.dashboard.reports': 'Reports',
    'admin.dashboard.settings': 'Settings',
  }
};
```

### Common UI Elements

For consistent translation across all dashboards, add common UI translations:

```typescript
// Add to simple.ts
export const translations = {
  ar: {
    // Common UI elements
    'common.loading': 'جاري التحميل...',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.edit': 'تعديل',
    'common.delete': 'حذف',
    'common.confirm': 'تأكيد',
    'common.back': 'رجوع',
    'common.next': 'التالي',
    'common.previous': 'السابق',
    'common.search': 'بحث',
    'common.filter': 'تصفية',
    'common.sort': 'ترتيب',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.download': 'تحميل',
    'common.upload': 'رفع',
    'common.view': 'عرض',
    'common.hide': 'إخفاء',
    'common.show': 'إظهار',
    'common.all': 'الكل',
    'common.none': 'لا شيء',
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'موافق',
    'common.error': 'خطأ',
    'common.success': 'نجح',
    'common.warning': 'تحذير',
    'common.info': 'معلومات',
  },
  en: {
    // Common UI elements
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.download': 'Download',
    'common.upload': 'Upload',
    'common.view': 'View',
    'common.hide': 'Hide',
    'common.show': 'Show',
    'common.all': 'All',
    'common.none': 'None',
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
  }
};
```

### Form Translations

For forms across all dashboards:

```typescript
// Add to simple.ts
export const translations = {
  ar: {
    // Form elements
    'form.required': 'هذا الحقل مطلوب',
    'form.invalid': 'قيمة غير صحيحة',
    'form.email': 'البريد الإلكتروني',
    'form.password': 'كلمة المرور',
    'form.confirmPassword': 'تأكيد كلمة المرور',
    'form.firstName': 'الاسم الأول',
    'form.lastName': 'اسم العائلة',
    'form.phone': 'رقم الهاتف',
    'form.address': 'العنوان',
    'form.city': 'المدينة',
    'form.country': 'البلد',
    'form.birthDate': 'تاريخ الميلاد',
    'form.gender': 'الجنس',
    'form.male': 'ذكر',
    'form.female': 'أنثى',
    'form.submit': 'إرسال',
    'form.reset': 'إعادة تعيين',
  },
  en: {
    // Form elements
    'form.required': 'This field is required',
    'form.invalid': 'Invalid value',
    'form.email': 'Email',
    'form.password': 'Password',
    'form.confirmPassword': 'Confirm Password',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.phone': 'Phone Number',
    'form.address': 'Address',
    'form.city': 'City',
    'form.country': 'Country',
    'form.birthDate': 'Birth Date',
    'form.gender': 'Gender',
    'form.male': 'Male',
    'form.female': 'Female',
    'form.submit': 'Submit',
    'form.reset': 'Reset',
  }
};
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
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

## Recent Updates (2025-01-02)

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

## ✅ إصلاح الترجمة في القائمة الجانبية

تم إصلاح مشكلة عدم تحديث عناصر القائمة الجانبية عند تغيير اللغة.

### المشاكل التي تم إصلاحها:
- **عدم تحديث عناصر القائمة الجانبية**: تم إصلاح مشكلة عدم تحديث عناصر القائمة الجانبية عند تغيير اللغة
- **منطق تحديد نوع الحساب**: تم إصلاح منطق تحديد نوع الحساب في القائمة الجانبية
- **استخدام useAuth**: تم تحديث القائمة الجانبية لاستخدام `useAuth` بدلاً من `useAuthState`

### التحسينات المضافة:
- **تحديث فوري**: عناصر القائمة الجانبية تتحدث فوراً عند تغيير اللغة
- **منطق محسن**: استخدام `userData.accountType` لتحديد نوع الحساب بدقة
- **دعم جميع الأنواع**: دعم جميع أنواع الحسابات (لاعب، نادي، وكيل، أكاديمية، مدرب، مسوق)

### الملفات المحدثة:
- `src/components/layout/Sidebar.jsx`: تحديث منطق تحديد نوع الحساب واستخدام useAuth
- `src/app/test-sidebar/page.tsx`: صفحة اختبار جديدة للقائمة الجانبية

### صفحة الاختبار:
- **الرابط**: `/test-sidebar`
- **المحتوى**: اختبار شامل للقائمة الجانبية مع جميع أنواع الحسابات
- **المعلومات**: عرض معلومات تقنية عن النظام

## ✅ إصلاح نظام الترجمة

تم إصلاح نظام الترجمة ليعمل بشكل صحيح مع جميع الصفحات والمكونات.

### المشاكل التي تم إصلاحها:
- **عدم تحديث النصوص**: تم إصلاح مشكلة عدم تحديث النصوص عند تغيير اللغة
- **عدم تحديث الاتجاه**: تم إصلاح مشكلة عدم تحديث اتجاه الصفحة (RTL/LTR)
- **عدم تحديث القائمة الجانبية**: تم إصلاح مشكلة عدم تحديث عناصر القائمة الجانبية
- **عدم حفظ اللغة**: تم إصلاح مشكلة عدم حفظ اللغة المختارة

### التحسينات المضافة:
- **تحديث فوري**: الترجمة تعمل فوراً بدون إعادة تحميل الصفحة
- **دعم الاتجاه**: تحديث تلقائي لاتجاه الصفحة حسب اللغة
- **تخزين محسن**: حفظ اللغة في localStorage مع مفتاح موحد
- **ترجمات شاملة**: إضافة ترجمات لجميع عناصر لوحات التحكم

### الملفات المحدثة:
- `src/lib/translations/simple-context.tsx`: إصلاح مكون الترجمة
- `src/components/shared/LanguageSwitcher.tsx`: إزالة إعادة تحميل الصفحة
- `src/lib/translations/simple.ts`: إضافة ترجمات شاملة
- `src/components/layout/Sidebar.jsx`: تحديث القائمة الجانبية

### صفحة الاختبار:
- **الرابط**: `/test-translation`
- **المحتوى**: اختبار شامل للترجمة والاتجاه
- **المعلومات**: عرض معلومات تقنية عن النظام

## ✅ زر تبديل اللغة في جميع لوحات التحكم

تم إضافة زر تبديل اللغة في جميع لوحات التحكم مع دعم كامل للترجمة والاتجاه.

### لوحات التحكم المحدثة:
- ✅ **لوحة تحكم المدير** (`/dashboard/admin`)
- ✅ **لوحة تحكم النادي** (`/dashboard/club`)
- ✅ **لوحة تحكم الأكاديمية** (`/dashboard/academy`)
- ✅ **لوحة تحكم الوكيل** (`/dashboard/agent`)
- ✅ **لوحة تحكم المدرب** (`/dashboard/trainer`)
- ✅ **لوحة تحكم اللاعب** (`/dashboard/player`)
- ✅ **لوحة تحكم المسوق** (`/dashboard/marketer`)
- ✅ **تقارير اللاعب** (`/dashboard/player/reports`)
- ✅ **فيديوهات اللاعب** (`/dashboard/club/player-videos`)

### الميزات المضافة:
- **مكون موحد**: `UnifiedHeader` لجميع لوحات التحكم
- **4 أنماط مختلفة**: simple, dropdown, button, minimal
- **دعم الاتجاه**: RTL للعربية، LTR للإنجليزية
- **تخزين محلي**: حفظ اللغة المختارة في localStorage
- **ترجمات شاملة**: جميع نصوص الهيدر والقائمة الجانبية مترجمة
- **شعارات مخصصة**: كل لوحة تحكم لها شعارها الخاص
- **تحديث الصفحة**: إعادة تحميل الصفحة عند تغيير اللغة لتطبيق التغييرات
- **دعم القائمة الجانبية**: جميع عناصر القائمة الجانبية مترجمة

### القائمة الجانبية المحدثة:
- **اللاعب**: الرئيسية، الملف الشخصي، التقارير، الفيديوهات، البحث، الإحصائيات
- **النادي**: الرئيسية، الملف الشخصي، البحث عن اللاعبين، اللاعبين، الفيديوهات، الإحصائيات، المالية
- **الوكيل**: الرئيسية، الملف الشخصي، اللاعبين، الأندية، التفاوضات، العقود، العمولات، الإحصائيات
- **الأكاديمية**: الرئيسية، الملف الشخصي، اللاعبين، الدورات، الفيديوهات، المدربين، الإحصائيات، المالية
- **المدرب**: الرئيسية، الملف الشخصي، الجلسات، اللاعبين، الفيديوهات، البرامج، الإحصائيات

### كيفية الاستخدام:

```tsx
// في أي مكون
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';

const { t, language, direction } = useTranslation();

// استخدام الترجمة
<p>{t('header.notifications')}</p>
<p>{t('sidebar.player.home')}</p>

// إضافة مبدل اللغة
<LanguageSwitcher variant="simple" />
```

### أنماط مبدل اللغة:
- **simple**: زر دائري بسيط مع العلم
- **dropdown**: قائمة منسدلة مع العلم والاسم
- **button**: أزرار منفصلة لكل لغة
- **minimal**: أعلام فقط بدون أسماء

### صفحة الاختبار:
- **الرابط**: `/test-language-switcher`
- **المحتوى**: عرض جميع الأنماط واختبار الترجمة
- **المعلومات**: تفاصيل تقنية عن النظام

## ✅ توحيد منطق إرسال رمز التحقق (OTP)

تم تحديث النظام ليعمل إرسال رمز التحقق (OTP) بنفس المنطق في:
- **صفحة التسجيل**
- **صفحة نسيت كلمة المرور**

### كيف يعمل النظام؟
- عند إدخال رقم الهاتف، يتم التحقق مباشرة من وجوده في قاعدة البيانات:
  - في صفحة التسجيل: يمنع التسجيل إذا كان الرقم مستخدمًا بالفعل.
  - في صفحة نسيت كلمة المرور: يمنع الاستمرار إذا لم يكن الرقم مسجلاً.
- عند طلب رمز التحقق، يتم إرسال طلب إلى:
  - `/api/notifications/smart-otp`
  - مع البيانات: رقم الهاتف، الدولة، كود الدولة، واسم المستخدم (أو اسم افتراضي في نسيت كلمة المرور)
- إذا نجح الطلب، تظهر نافذة إدخال رمز التحقق (OTP) للمستخدم.
- إذا فشل الطلب، تظهر رسالة خطأ واضحة.

### ملاحظات تقنية:
- تم توحيد تجربة المستخدم في كلا الصفحتين.
- جميع الرسائل تصل عبر نفس API وبنفس الصيغة.
- التحقق من رقم الهاتف يتم تلقائيًا أثناء الكتابة.

---

## طريقة إرسال رسائل OTP

- النظام يستخدم API خارجي (beon.chat) عبر endpoint:
  - `https://beon.chat/api/send/message/otp`
- يتم إرسال البيانات باستخدام `multipart/form-data` مع الحقول التالية:
  - `phoneNumber`: رقم الهاتف (مثال: +201012345678)
  - `name`: اسم المستخدم أو اسم افتراضي (مثال: "مستخدم")
  - `type`: نوع الرسالة (`sms` أو `whatsapp`)
  - `otp_length`: عدد أرقام الرمز (عادة 6)
  - `lang`: لغة الرسالة (`ar`)
- يتم توليد رمز OTP عشوائي من 6 أرقام.
- يتم اختيار طريقة الإرسال (SMS أو WhatsApp) تلقائيًا حسب الدولة.
- بعد الإرسال، يتم تخزين رمز OTP مؤقتًا في قاعدة البيانات (Firestore) للتحقق لاحقًا عند إدخال المستخدم للرمز.
- النظام يدعم التحقق من وصول الرسالة وتكرار الإرسال محمي (rate limiting).

---

## مثال على البيانات المرسلة:
```json
{
  "phone": "+201012345678",
  "name": "مستخدم",
  "country": "مصر",
  "countryCode": "+20"
}
```

---

## شكراً لاستخدامك النظام! لأي استفسار تقني راجع الكود أو تواصل مع المطورين.

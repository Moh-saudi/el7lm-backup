// Common Types for the entire application
// src/types/common.ts

// Base types for all entities
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt?: Date;
}

// Timestamp types
export type FirestoreTimestamp = {
  seconds: number;
  nanoseconds: number;
};

export type DateOrTimestamp = Date | FirestoreTimestamp | string | any; // إضافة any لدعم serverTimestamp

// User account types
export type AccountType = 'player' | 'club' | 'academy' | 'trainer' | 'agent' | 'admin' | 'marketer' | 'parent';

export type UserRole = AccountType;

// Subscription status
export type SubscriptionStatus = 'active' | 'pending' | 'expired' | 'cancelled' | 'trial';

// Payment status
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

// Content status
export type ContentStatus = 'published' | 'pending' | 'rejected' | 'draft';

// Profile status
export type ProfileStatus = 'completed' | 'incomplete' | 'pending' | 'verified';

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payment' | 'subscription';

// Message types
export type MessageType = 'text' | 'image' | 'file' | 'system';

// Currency types
export type Currency = 'EGP' | 'USD' | 'QAR' | 'SAR' | 'AED' | 'KWD';

// Country codes
export type CountryCode = '+20' | '+966' | '+974' | '+971' | '+965' | '+973' | '+968';

// Phone number validation
export interface PhoneNumber {
  countryCode: CountryCode;
  number: string;
  fullNumber: string;
}

// Email validation
export interface EmailAddress {
  local: string;
  domain: string;
  full: string;
}

// Address information
export interface Address {
  country: string;
  city: string;
  state?: string;
  postalCode?: string;
  street?: string;
}

// Contact information
export interface ContactInfo {
  email: EmailAddress;
  phone: PhoneNumber;
  whatsapp?: PhoneNumber;
  telegram?: string;
}

// Social media links
export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

// Image/Media types
export interface MediaFile {
  id: string;
  url: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: Date;
  thumbnail?: string;
}

export interface ImageGallery {
  profile?: MediaFile;
  cover?: MediaFile;
  gallery: MediaFile[];
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: AppError;
  message?: string;
  timestamp: Date;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Filter types
export interface BaseFilter {
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Form validation
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: Record<string, string>;
}

// Authentication types
export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  providerId: string;
}

// Session types
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    location?: string;
  };
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Logging types
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'success';
  component: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

// Feature flags
export interface FeatureFlags {
  enableWhatsAppOTP: boolean;
  enableSMOTP: boolean;
  enableBulkPayments: boolean;
  enablePlayerSearch: boolean;
  enableNotifications: boolean;
  enableMessaging: boolean;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
}

// Environment configuration
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  firebaseConfig: Record<string, string>;
  featureFlags: FeatureFlags;
  supportedLanguages: string[];
  defaultLanguage: string;
  supportedCurrencies: Currency[];
  defaultCurrency: Currency;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonNullableFields<T, K extends keyof T> = T & {
  [P in K]: NonNullable<T[P]>;
}; 

// EmailJS Configuration
export const EMAILJS_CONFIG = {
  // EmailJS Service ID
  SERVICE_ID: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'your_service_id',
  
  // EmailJS Template ID for OTP
  TEMPLATE_ID: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'your_template_id',
  
  // EmailJS Public Key
  PUBLIC_KEY: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key',
  
  // OTP Configuration
  OTP_LENGTH: 6,
  OTP_EXPIRY_SECONDS: 30,
  
  // Email Templates
  TEMPLATES: {
    VERIFICATION: 'verification_otp',
    WELCOME: 'welcome_email',
    PASSWORD_RESET: 'password_reset'
  }
};

// OTP Storage Keys
export const OTP_STORAGE_KEYS = {
  PENDING_OTP: 'pending_otp',
  OTP_EXPIRY: 'otp_expiry',
  VERIFICATION_EMAIL: 'verification_email'
};

// EmailJS Template Variables
export interface EmailTemplateData {
  email: string;
  user_name: string;
  otp_code: string;
  verification_link?: string;
  platform_name: string;
  support_email: string;
}

// OTP Generation and Validation
export class OTPManager {
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private static getExpiryTime(): number {
    return Date.now() + (EMAILJS_CONFIG.OTP_EXPIRY_SECONDS * 1000);
  }

  static createOTP(): { otp: string; expiry: number } {
    return {
      otp: this.generateOTP(),
      expiry: this.getExpiryTime()
    };
  }

  static validateOTP(inputOTP: string): boolean {
    if (typeof window === 'undefined') return false;
    
    const storedOTP = localStorage.getItem(OTP_STORAGE_KEYS.PENDING_OTP);
    const expiryTime = localStorage.getItem(OTP_STORAGE_KEYS.OTP_EXPIRY);
    
    if (!storedOTP || !expiryTime) {
      return false;
    }

    const isExpired = Date.now() > parseInt(expiryTime);
    if (isExpired) {
      this.clearOTP();
      return false;
    }

    return inputOTP === storedOTP;
  }

  static storeOTP(otp: string, expiry: number): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(OTP_STORAGE_KEYS.PENDING_OTP, otp);
    localStorage.setItem(OTP_STORAGE_KEYS.OTP_EXPIRY, expiry.toString());
  }

  static clearOTP(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(OTP_STORAGE_KEYS.PENDING_OTP);
    localStorage.removeItem(OTP_STORAGE_KEYS.OTP_EXPIRY);
    localStorage.removeItem(OTP_STORAGE_KEYS.VERIFICATION_EMAIL);
  }

  static getStoredEmail(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem(OTP_STORAGE_KEYS.VERIFICATION_EMAIL);
  }

  static storeEmail(email: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(OTP_STORAGE_KEYS.VERIFICATION_EMAIL, email);
  }
} 

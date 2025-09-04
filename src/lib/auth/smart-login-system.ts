import { db } from '@/lib/firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface LoginAttempt {
  timestamp: Date;
  success: boolean;
  deviceInfo: string;
  ipAddress?: string;
  location?: string;
}

interface UserSecurityProfile {
  uid: string;
  phone: string;
  phoneVerified: boolean;
  totalLogins: number;
  successfulLogins: number;
  lastLogin: Date | null;
  lastLoginDevice: string;
  lastLoginIP: string;
  trustedDevices: string[];
  loginAttempts: LoginAttempt[];
  securityLevel: 'new' | 'trusted' | 'suspicious';
  requiresOTP: boolean;
  otpBypassEnabled: boolean;
}

export type LoginMethod = 'otp' | 'password' | 'both';
export type SecurityReason = 'new_user' | 'new_device' | 'suspicious_activity' | 'long_absence' | 'security_change' | 'user_choice';

interface LoginSecurityDecision {
  method: LoginMethod;
  reason: SecurityReason;
  message: string;
  otpRequired: boolean;
  canBypass: boolean;
}

export class SmartLoginSystem {
  
  /**
   * تحديد طريقة تسجيل الدخول المطلوبة بناءً على ملف الأمان
   */
  async determineLoginMethod(
    phone: string, 
    deviceInfo: string, 
    ipAddress?: string
  ): Promise<LoginSecurityDecision> {
    
    try {
      const userProfile = await this.getUserSecurityProfile(phone);
      
      if (!userProfile) {
        return {
          method: 'otp',
          reason: 'new_user',
          message: 'مستخدم جديد - التحقق من الهاتف مطلوب',
          otpRequired: true,
          canBypass: false
        };
      }

      // التحقق من عدد مرات الدخول الناجحة
      if (userProfile.successfulLogins < 3) {
        return {
          method: 'otp',
          reason: 'new_user',
          message: `مطلوب التحقق للمرة ${userProfile.successfulLogins + 1} من 3`,
          otpRequired: true,
          canBypass: false
        };
      }

      // التحقق من الجهاز
      if (!userProfile.trustedDevices.includes(deviceInfo)) {
        return {
          method: 'otp',
          reason: 'new_device',
          message: 'جهاز جديد - التحقق من الهاتف مطلوب للأمان',
          otpRequired: true,
          canBypass: false
        };
      }

      // التحقق من آخر دخول (أكثر من 30 يوم)
      const daysSinceLastLogin = userProfile.lastLogin 
        ? (Date.now() - userProfile.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        : 999;
      
      if (daysSinceLastLogin > 30) {
        return {
          method: 'otp',
          reason: 'long_absence',
          message: 'لم تسجل دخول منذ فترة طويلة - التحقق مطلوب',
          otpRequired: true,
          canBypass: false
        };
      }

      // التحقق من النشاط المشبوه
      const recentFailures = userProfile.loginAttempts
        .filter(attempt => 
          !attempt.success && 
          (Date.now() - attempt.timestamp.getTime()) < (1000 * 60 * 60) // آخر ساعة
        ).length;

      if (recentFailures >= 3) {
        return {
          method: 'otp',
          reason: 'suspicious_activity',
          message: 'نشاط مشبوه - التحقق الإضافي مطلوب',
          otpRequired: true,
          canBypass: false
        };
      }

      // المستخدم موثوق - يمكن استخدام كلمة المرور فقط
      return {
        method: 'password',
        reason: 'user_choice',
        message: 'مستخدم موثوق - يمكن الدخول بكلمة المرور',
        otpRequired: false,
        canBypass: true
      };

    } catch (error) {
      console.error('خطأ في تحديد طريقة تسجيل الدخول:', error);
      // في حالة الخطأ، نتخذ الخيار الأكثر أماناً
      return {
        method: 'otp',
        reason: 'new_user',
        message: 'خطأ في النظام - التحقق مطلوب للأمان',
        otpRequired: true,
        canBypass: false
      };
    }
  }

  /**
   * الحصول على ملف الأمان للمستخدم
   */
  private async getUserSecurityProfile(phone: string): Promise<UserSecurityProfile | null> {
    try {
      // البحث عن المستخدم بالهاتف
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      return {
        uid: userDoc.id,
        phone: userData.phone || '',
        phoneVerified: userData.phoneVerified || false,
        totalLogins: userData.totalLogins || 0,
        successfulLogins: userData.successfulLogins || 0,
        lastLogin: userData.lastLogin?.toDate() || null,
        lastLoginDevice: userData.lastLoginDevice || '',
        lastLoginIP: userData.lastLoginIP || '',
        trustedDevices: userData.trustedDevices || [],
        loginAttempts: (userData.loginAttempts || []).map((attempt: any) => ({
          ...attempt,
          timestamp: attempt.timestamp?.toDate() || new Date()
        })),
        securityLevel: userData.securityLevel || 'new',
        requiresOTP: userData.requiresOTP || false,
        otpBypassEnabled: userData.otpBypassEnabled || false
      };
    } catch (error) {
      console.error('خطأ في جلب ملف الأمان:', error);
      return null;
    }
  }

  /**
   * تسجيل محاولة تسجيل دخول
   */
  async recordLoginAttempt(
    phone: string, 
    success: boolean, 
    deviceInfo: string, 
    ipAddress?: string
  ): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      const newAttempt: LoginAttempt = {
        timestamp: new Date(),
        success,
        deviceInfo,
        ipAddress: ipAddress || 'unknown',
        location: 'unknown' // يمكن إضافة تحديد الموقع لاحقاً
      };

      const updatedAttempts = [
        ...(userData.loginAttempts || []),
        newAttempt
      ].slice(-10); // الاحتفاظ بآخر 10 محاولات فقط

      const updateData: any = {
        totalLogins: (userData.totalLogins || 0) + 1,
        loginAttempts: updatedAttempts,
        lastLoginDevice: deviceInfo,
        lastLoginIP: ipAddress || 'unknown'
      };

      if (success) {
        updateData.successfulLogins = (userData.successfulLogins || 0) + 1;
        updateData.lastLogin = new Date();
        
        // إضافة الجهاز للقائمة الموثوقة بعد 3 دخولات ناجحة
        if (updateData.successfulLogins >= 3) {
          const trustedDevices = userData.trustedDevices || [];
          if (!trustedDevices.includes(deviceInfo)) {
            updateData.trustedDevices = [...trustedDevices, deviceInfo];
            updateData.securityLevel = 'trusted';
          }
        }
      }

      await updateDoc(userDoc.ref, updateData);
    } catch (error) {
      console.error('خطأ في تسجيل محاولة الدخول:', error);
    }
  }

  /**
   * تفعيل أو إلغاء OTP الإجباري للمستخدم
   */
  async setUserOTPPreference(phone: string, requiresOTP: boolean): Promise<void> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        await updateDoc(userDoc.ref, {
          requiresOTP,
          otpBypassEnabled: !requiresOTP
        });
      }
    } catch (error) {
      console.error('خطأ في تحديث تفضيلات OTP:', error);
    }
  }

  /**
   * الحصول على معلومات الجهاز
   */
  getDeviceInfo(): string {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'server';
    const language = typeof navigator !== 'undefined' ? navigator.language : 'unknown';
    const platform = typeof navigator !== 'undefined' ? navigator.platform : 'unknown';
    
    return `${platform}-${language}-${userAgent.slice(0, 50)}`;
  }

  /**
   * التحقق من قوة كلمة المرور
   */
  validatePasswordStrength(password: string): { isStrong: boolean; message: string } {
    if (password.length < 8) {
      return { isStrong: false, message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' };
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isStrong: false, message: 'كلمة المرور يجب أن تحتوي على حروف كبيرة وصغيرة وأرقام' };
    }
    
    return { isStrong: true, message: 'كلمة مرور قوية' };
  }
}

export const smartLoginSystem = new SmartLoginSystem(); 

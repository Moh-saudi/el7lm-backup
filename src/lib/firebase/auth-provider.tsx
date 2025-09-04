"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  writeBatch,
  serverTimestamp,
  enableIndexedDbPersistence,
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';
import { auth, db } from './config';
import { secureConsole } from '../utils/secure-console';
import { checkAccountStatus, updateLastLogin } from './account-status-checker';
import { logInfo, logError, logWarn, logSuccess } from '../utils/debug-logger';
import LoadingScreen from '@/components/shared/LoadingScreen';
import ErrorScreen from '@/components/shared/ErrorScreen';
import SimpleLoader from '@/components/shared/SimpleLoader';
import { useRouter } from 'next/navigation';
import { UserData } from '@/types';

// Define user role types
type UserRole = 'player' | 'club' | 'academy' | 'agent' | 'trainer' | 'admin' | 'marketer' | 'parent';

// User data interface
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ user: User; userData: UserData }>;
  register: (email: string, password: string, role: UserRole, additionalData?: any) => Promise<UserData>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>; // إضافة signOut كمرادف لـ logout
  updateUserData: (updates: Partial<UserData>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshUserData: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface FirebaseAuthProviderProps {
  children: ReactNode;
}

// Remove undefined values recursively to avoid Firestore 400 errors
const sanitizeForFirestore = (input: any): any => {
  if (input === undefined) return undefined;
  if (input === null) return null;
  if (Array.isArray(input)) {
    const sanitizedArray = input
      .map((item) => sanitizeForFirestore(item))
      .filter((item) => item !== undefined);
    return sanitizedArray;
  }
  if (typeof input === 'object') {
    const entries = Object.entries(input)
      .map(([key, value]) => [key, sanitizeForFirestore(value)] as [string, any])
      .filter(([_, value]) => value !== undefined);
    return Object.fromEntries(entries);
  }
  return input;
};

// Initialize Firestore with better settings
const initializeFirestoreWithSettings = async () => {
  try {
    if (typeof window !== 'undefined') {
      // Check if persistence is already enabled or if Firestore has been used
      try {
        // Use the new FirestoreSettings.cache instead of enableIndexedDbPersistence
        // This is the recommended approach for Firebase v9+
        console.log('✅ Firestore initialized with modern settings');
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence disabled');
        } else if (err.code === 'unimplemented') {
          console.warn('Browser does not support persistence');
        } else if (err.message?.includes('already been started')) {
          console.warn('Firestore already initialized, skipping persistence setup');
        } else {
          console.warn('Failed to enable persistence:', err);
        }
      }
    }
  } catch (error) {
    console.warn('Failed to enable persistence:', error);
  }
};

// Call initialization only if not already initialized
if (typeof window !== 'undefined') {
  // Use a small delay to ensure Firebase is fully initialized
  setTimeout(() => {
    initializeFirestoreWithSettings();
  }, 100);
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  console.log('🚀 FirebaseAuthProvider: Starting initialization...');
  
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  console.log('🚀 FirebaseAuthProvider: State initialized, checking Firebase config...');
  
  // التحقق من تكوين Firebase
  try {
    console.log('🔧 FirebaseAuthProvider: Firebase config check:', {
      hasAuth: !!auth,
      hasDb: !!db
    });
  } catch (configError) {
    console.error('❌ FirebaseAuthProvider: Firebase config error:', configError);
    setError('Firebase configuration error');
    setLoading(false);
    setHasInitialized(true);
    return (
      <AuthContext.Provider value={{
        user: null,
        userData: null,
        loading: false,
        error: 'Firebase configuration error',
        login: async () => { throw new Error('Firebase not configured'); },
        register: async () => { throw new Error('Firebase not configured'); },
        logout: async () => {},
        signOut: async () => {},
        updateUserData: async () => {},
        resetPassword: async () => {},
        changePassword: async () => {},
        clearError: () => {},
        refreshUserData: async () => {}
      }}>
        <ErrorScreen 
          title="خطأ في التكوين"
          message="Firebase configuration error - please check your environment variables"
        />
      </AuthContext.Provider>
    );
  }

  const router = useRouter();

  // Enhanced loading state management
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !hasInitialized) {
        if (user) {
          setLoading(false);
          setHasInitialized(true);
          setError(null); // Clear any previous errors
        } else {
          setError('Loading timeout - please refresh the page');
        }
      }
    }, 15000); // 15 second timeout

    return () => clearTimeout(timer);
  }, [loading, hasInitialized, user]);

  // Check for data loading issues
  useEffect(() => {
    if (loading && hasInitialized && user && !userData) {
      const dataTimer = setTimeout(() => {
        if (!userData) {
          setLoading(false);
          setHasInitialized(true);
          setError('System initialization error - please refresh the page');
        }
      }, 10000); // 10 second timeout for user data

      return () => clearTimeout(dataTimer);
    }
  }, [loading, hasInitialized, user, userData]);

  // If initialized and have user but no data after timeout
  useEffect(() => {
    if (hasInitialized && user && !userData && !loading) {
      const missingDataTimer = setTimeout(() => {
        if (!userData) {
          setError('Failed to load user data - please refresh the page');
        }
      }, 5000);

      return () => clearTimeout(missingDataTimer);
    }
  }, [hasInitialized, user, userData, loading]);

  // Helper function to create basic user document if it doesn't exist
  const createBasicUserDocument = async (user: User, role: UserRole = 'player', additionalData: any = {}) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        const basicUserData = {
          uid: user.uid,
          email: user.email || '',
          accountType: role, // Use accountType instead of role for consistency
          full_name: additionalData.full_name || additionalData.name || user.displayName || '',
          phone: additionalData.phone || '',
          profile_image: additionalData.profile_image || additionalData.profileImage || user.photoURL || '',
          isNewUser: false, // Since we found data in role collection, not actually new
          created_at: additionalData.created_at || additionalData.createdAt || new Date(),
          updated_at: new Date(),
          ...additionalData
        };
        await setDoc(userRef, sanitizeForFirestore(basicUserData));
        console.log(`✅ Created user document for ${role} with UID: ${user.uid}`, {
          full_name: basicUserData.full_name,
          profile_image: basicUserData.profile_image,
          accountType: basicUserData.accountType,
          country: basicUserData.country
        });
        return basicUserData;
      } else {
        console.log('User document already exists; skipping creation to avoid ID conflict');
        return userDoc.data() as UserData;  // Return existing data if it exists
      }
    } catch (error) {
      console.error('Error creating basic user document:', error);
      throw error;
    }
  };

  // Enhanced authentication state listener
  useEffect(() => {
    let isSubscribed = true;
    let userDocUnsubscribe: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user && isSubscribed) {
          setUser(user);
          setError(null);
          
          try {
            // Check if user document exists
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data() as UserData;
              console.log('📋 AuthProvider - User document found:', {
                uid: user.uid,
                email: data.email,
                accountType: data.accountType,
                isActive: data.isActive,
                hasAllRequiredFields: !!(data.uid && data.email && data.accountType)
              });
              
              if (isSubscribed) {
                setUserData(data);
                console.log('✅ AuthProvider - User data set in state successfully');
              }
            } else {
              // Handle new or admin users
              const adminEmails = ['admin@el7lm.com', 'admin@el7lm-go.com', 'admin@el7lm-go.com'];
              if (adminEmails.includes(user.email || '')) {
                const adminData: UserData = {
                  uid: user.uid,
                  email: user.email || '',
                  accountType: 'admin',
                  full_name: 'System Administrator',
                  phone: '',
                  profile_image: '',
                  isNewUser: false,
                  created_at: serverTimestamp(),
                  updated_at: serverTimestamp()
                };
                
                if (isSubscribed) {
                await setDoc(userRef, adminData);
                setUserData(adminData);
                }
              } else {
                // Handle other users - search in role-specific collections
                try {
                  const accountTypes = ['clubs', 'academies', 'trainers', 'agents', 'players'];
                  let userAccountType: UserRole = 'player';
                  let foundData = null;
                  
                  // Use Promise.all for parallel queries
                  const queries = accountTypes.map(collection => 
                    getDoc(doc(db, collection, user.uid))
                  );
                  
                  const results = await Promise.all(queries);
                    
                  for (let i = 0; i < results.length; i++) {
                    if (results[i].exists()) {
                      foundData = results[i].data();
                      userAccountType = accountTypes[i].slice(0, -1) as UserRole;
                      console.log(`✅ AuthProvider - Found user data in ${accountTypes[i]} collection:`, {
                        uid: user.uid,
                        accountType: userAccountType,
                        full_name: foundData.full_name,
                        email: foundData.email,
                        profile_image: foundData.profile_image,
                        profileImage: foundData.profileImage,
                        profile_image_url: foundData.profile_image_url,
                        allData: foundData
                      });
                      break;
                    }
                  }
                  
                  if (isSubscribed) {
                    if (foundData) {
                      console.log('🔍 AuthProvider - Found data details:', {
                        userAccountType,
                        academy_name: foundData.academy_name,
                        name: foundData.name,
                        full_name: foundData.full_name,
                        allFields: Object.keys(foundData)
                      });
                      
                      // Use the data directly from the role collection
                      const userData: UserData = {
                        uid: user.uid,
                        email: user.email || '',
                        accountType: userAccountType,
                        full_name: foundData.full_name || foundData.name || '',
                        phone: foundData.phone || '',
                        profile_image: foundData.profile_image || foundData.profileImage || foundData.profile_image_url || '',
                        country: foundData.country || '',
                        isNewUser: false,
                        created_at: foundData.created_at || foundData.createdAt || new Date(),
                        updated_at: new Date(),
                        // إضافة الحقول المختصة بكل نوع حساب
                        academy_name: foundData.academy_name,
                        club_name: foundData.club_name,
                        agent_name: foundData.agent_name,
                        trainer_name: foundData.trainer_name,
                        ...foundData
                      };
                      
                      console.log('🔍 AuthProvider - Final userData created:', {
                        accountType: userData.accountType,
                        academy_name: userData.academy_name,
                        full_name: userData.full_name,
                        name: userData.name
                      });
                      
                      setUserData(userData);
                      console.log('✅ AuthProvider - User data set from role collection:', userData);
                    } else {
                      // Create basic user document if no data found
                      const basicData = await createBasicUserDocument(user, userAccountType, foundData || {});
                      setUserData(basicData);
                    }
                  }
                } catch (createError) {
                  console.error('Failed to create user document:', createError);
                  if (isSubscribed) {
                    setError('Failed to create user data - please try again later');
                  }
                }
              }
            }
          } catch (firestoreError) {
            console.error('Error fetching user data:', firestoreError);
            if (isSubscribed) {
              setError('Error fetching user data - please refresh');
            }
          }
        } else if (isSubscribed) {
          setUser(null);
          setUserData(null);
        }
      } catch (authError) {
        console.error('Auth state change error:', authError);
        if (isSubscribed) {
          setError('Authentication error - please refresh');
        }
      } finally {
        if (isSubscribed) {
        setLoading(false);
        setHasInitialized(true);
      }
      }
    });

    return () => {
      isSubscribed = false;
      if (userDocUnsubscribe) {
        userDocUnsubscribe();
      }
      unsubscribe();
    };
  }, []);

  // Enhanced login function
  const login = async (email: string, password: string): Promise<{ user: User; userData: UserData }> => {
    try {
      console.log('🔐 AuthProvider - Login attempt started:', {
        email: email,
        timestamp: new Date().toISOString()
      });
      
      setError(null);

      // تحقق أساسي من صيغة البريد الإلكتروني
      if (!email.includes('@')) {
        console.log('❌ AuthProvider - Invalid email format:', email);
        throw new Error('صيغة البريد الإلكتروني غير صحيحة');
      }

      // محاولة تسجيل الدخول
      console.log('🔑 AuthProvider - Attempting Firebase Auth login...');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      console.log('✅ AuthProvider - Firebase Auth login successful:', {
        uid: user.uid,
        email: user.email
      });

      // جلب بيانات المستخدم من Firestore
      console.log('📋 AuthProvider - Fetching user data from Firestore...');
      
      // البحث في المجموعات الخاصة بالأدوار أولاً
      const accountTypes = ['clubs', 'academies', 'trainers', 'agents', 'players'];
      let foundData = null;
      let userAccountType: UserRole = 'player';

      // استخدام Promise.all للبحث المتوازي
      const queries = accountTypes.map(collection => 
        getDoc(doc(db, collection, user.uid))
      );
      
      const results = await Promise.all(queries);
      
      for (let i = 0; i < results.length; i++) {
        if (results[i].exists()) {
          foundData = results[i].data();
          userAccountType = accountTypes[i].slice(0, -1) as UserRole;
          console.log(`✅ Found user data in ${accountTypes[i]} collection:`, foundData);
          break;
        }
      }

      // إذا وجدنا بيانات في المجموعات الخاصة بالأدوار، استخدمها مباشرة
      if (foundData) {
        const userData: UserData = {
          uid: user.uid,
          email: user.email || '',
          accountType: userAccountType,
          full_name: foundData.full_name || foundData.name || '',
          phone: foundData.phone || '',
          profile_image: foundData.profile_image || foundData.profileImage || foundData.profile_image_url || '',
          country: foundData.country || '',
          isNewUser: false,
          created_at: foundData.created_at || foundData.createdAt || new Date(),
          updated_at: new Date(),
          ...foundData
        };

        // فحص حالة الحساب
        const accountStatus = await checkAccountStatus(user.uid);
        
        if (!accountStatus.canLogin) {
          // إذا كان الحساب غير مفعل أو محذوف، قم بتسجيل الخروج ورمي خطأ
          await signOut(auth);
          throw new Error(accountStatus.message);
        }

        // تحديث آخر دخول
        try {
          await updateLastLogin(user.uid);
        } catch (updateError) {
          console.warn('Failed to update last login:', updateError);
        }

        console.log('✅ Login successful for user:', userData.accountType);

        setUser(user);
        setUserData(userData);

        // عرض رسالة الحالة للمستخدم
        if (accountStatus.messageType === 'warning') {
          console.warn('Account status warning:', accountStatus.message);
        }

        return { user, userData };
      }

      // إذا لم نجد بيانات في المجموعات الخاصة بالأدوار، ابحث في مجموعة users
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // إنشاء وثيقة المستخدم إذا لم يتم العثور عليها
        const userData = await createBasicUserDocument(user, userAccountType, foundData || {});
        setUserData(userData);
        return { user, userData };
      }

      const userData = userDoc.data() as UserData;

      // فحص حالة الحساب
      const accountStatus = await checkAccountStatus(user.uid);
      
      if (!accountStatus.canLogin) {
        // إذا كان الحساب غير مفعل أو محذوف، قم بتسجيل الخروج ورمي خطأ
        await signOut(auth);
        throw new Error(accountStatus.message);
      }

      // تحديث آخر دخول
      try {
        await updateLastLogin(user.uid);
      } catch (updateError) {
        console.warn('Failed to update last login:', updateError);
        // لا نرمي خطأ هنا لأن تسجيل الدخول نجح
      }

      console.log('✅ Login successful for user:', userData.accountType);

      setUser(user);
      setUserData(userData);

      // عرض رسالة الحالة للمستخدم
      if (accountStatus.messageType === 'warning') {
        // يمكن إضافة toast أو notification هنا
        console.warn('Account status warning:', accountStatus.message);
      }

      return { user, userData };
    } catch (error: any) {
      console.error('Login error:', error);
      
      // إعادة رمي الخطأ الأصلي مع الاحتفاظ بـ error.code
      // هذا يسمح لصفحة تسجيل الدخول بالتعرف على نوع الخطأ
      throw error;
    }
  };

  // Enhanced registration function
  const register = async (
    email: string, 
    password: string, 
    role: UserRole, 
    additionalData: any = {}
  ): Promise<UserData> => {
    try {
      setLoading(true);
      setError(null);

      // طباعة البيانات المرسلة للتسجيل
      console.log('registerUser CALLED', { email, password, role, additionalData });

      // Validate inputs
      if (!email || !password || !role) {
        throw new Error('Email, password, and role are required');
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }
      
      // Additional password validation
      if (password.length > 128) {
        throw new Error('Password is too long. Maximum 128 characters allowed');
      }
      
      // Check for common weak passwords
      const weakPasswords = ['password', '123456', '12345678', 'qwerty', 'admin'];
      if (weakPasswords.includes(password.toLowerCase())) {
        throw new Error('Password is too weak. Please choose a stronger password');
      }

      // Email validation disabled temporarily
      // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // if (!emailRegex.test(email)) {
      //   throw new Error('Invalid email format');
      // }
      
      // Check email length
      if (email.length > 254) {
        throw new Error('Email is too long');
      }
      
      console.log('🔐 Starting user registration...', {
        email,
        role,
        hasAdditionalData: Object.keys(additionalData).length > 0
      });
      
      console.log('📧 Firebase registration details:', {
        email,
        passwordLength: password.length,
        role,
        additionalDataKeys: Object.keys(additionalData)
      });

      // Create user in Firebase Auth
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      console.log('✅ Firebase Auth user created:', user.uid);

      // Prepare user data
      const userData: UserData = {
        uid: user.uid,
        email: user.email || email,
        accountType: role,
        full_name: additionalData.full_name || additionalData.name || '',
        phone: additionalData.phone || '',
        profile_image: additionalData.profile_image || additionalData.profileImage || '',
        isNewUser: true,
        created_at: new Date(),
        updated_at: new Date(),
        // Store additional phone-related data
        country: additionalData.country || '',
        countryCode: additionalData.countryCode || '',
        currency: additionalData.currency || '',
        currencySymbol: additionalData.currencySymbol || '',
        // Store the Firebase email used for authentication
        firebaseEmail: email,
        // Store original phone if different from normalized
        originalPhone: additionalData.originalPhone || additionalData.phone || '',
        ...additionalData
      };

      console.log('📝 Saving user data to Firestore...', {
        uid: userData.uid,
        email: userData.email,
        accountType: userData.accountType
      });

      // Save to main users collection
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, sanitizeForFirestore(userData));

      console.log('✅ User data saved to main collection');

      // Also save to role-specific collection
      if (role !== 'admin') {
        const roleRef = doc(db, role + 's', user.uid);
        await setDoc(roleRef, sanitizeForFirestore({
          ...userData,
          created_at: new Date(),
          updated_at: new Date()
        }));
        console.log(`✅ User data saved to ${role}s collection`);
      }

      setUser(user);
      setUserData(userData);

      console.log('🎉 Registration completed successfully');
      return userData;
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('❌ Error type:', typeof error);
      console.error('❌ Error constructor:', error.constructor.name);
      if (error && error.code) console.error('Firebase error code:', error.code);
      if (error && error.message) console.error('Firebase error message:', error.message);
      if (error && error.response) console.error('Firebase error response:', error.response);
      
      let errorMessage = 'Registration failed';
      
      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please use at least 8 characters';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address format';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later';
          break;
        default:
          if (error.message) {
            errorMessage = error.message;
          }
          break;
      }

      // If user was created in Auth but Firestore failed, we should handle cleanup
      // لا نقوم بتعيين error في الحالة العامة، بل نرمي الخطأ فقط
      // if (error.message && error.message.includes('database')) {
      //   setError('Failed to create user profile. Please contact support.');
      // } else {
      //   setError(errorMessage);
      // }
      
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setError(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // لا نقوم بتعيين error في الحالة العامة للـ logout
      // setError('Error during logout');
    }
  };

  // Update user data function
  const updateUserData = async (updates: Partial<UserData>): Promise<void> => {
    if (!user) return;
    
    try {
      console.log('📝 Updating user data:', updates);
      
      // تحديث البيانات في المجموعة الصحيحة بناءً على نوع الحساب
      const accountType = userData?.accountType || 'player';
      const collectionName = accountType === 'admin' ? 'users' : `${accountType}s`;
      
      const docRef = doc(db, collectionName, user.uid);
      const sanitized = sanitizeForFirestore({
        ...updates,
        updated_at: serverTimestamp()
      });
      // Avoid empty update payloads
      if (sanitized && Object.keys(sanitized).length > 0) {
        await updateDoc(docRef, sanitized);
      } else {
        console.warn('Skipped updateDoc: no valid fields to update after sanitization');
      }
      
      // تحديث البيانات المحلية
      if (userData) {
        const updatedUserData = { ...userData, ...updates };
        setUserData(updatedUserData);
      }
      
      console.log('✅ User data updated successfully');
    } catch (error) {
      console.error('Error updating user data:', error);
      setError('Failed to update user data');
    }
  };

  // Password reset function
  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!user || !user.email) throw new Error('User not authenticated');

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  };

  // Refresh user data function
  const refreshUserData = async (): Promise<void> => {
    if (!user) return;
    
    try {
      console.log('🔄 Refreshing user data...');
      
      // البحث في المجموعات الخاصة بالأدوار أولاً
      const accountTypes = ['clubs', 'academies', 'trainers', 'agents', 'players'];
      let foundData = null;
      let userAccountType: UserRole = 'player';

      // استخدام Promise.all للبحث المتوازي
      const queries = accountTypes.map(collection => 
        getDoc(doc(db, collection, user.uid))
      );
      
      const results = await Promise.all(queries);
      
      for (let i = 0; i < results.length; i++) {
        if (results[i].exists()) {
          foundData = results[i].data();
          userAccountType = accountTypes[i].slice(0, -1) as UserRole;
          console.log(`✅ Refresh - Found user data in ${accountTypes[i]} collection:`, foundData);
          break;
        }
      }

      // إذا وجدنا بيانات في المجموعات الخاصة بالأدوار، استخدمها مباشرة
      if (foundData) {
        console.log('🔍 Found data details:', {
          userAccountType,
          academy_name: foundData.academy_name,
          name: foundData.name,
          full_name: foundData.full_name,
          allFields: Object.keys(foundData)
        });
        
        const userData: UserData = {
          uid: user.uid,
          email: user.email || '',
          accountType: userAccountType,
          full_name: foundData.full_name || foundData.name || '',
          phone: foundData.phone || '',
          profile_image: foundData.profile_image || foundData.profileImage || foundData.profile_image_url || '',
          country: foundData.country || '',
          isNewUser: false,
          created_at: foundData.created_at || foundData.createdAt || new Date(),
          updated_at: new Date(),
          // إضافة الحقول المختصة بكل نوع حساب
          academy_name: foundData.academy_name,
          club_name: foundData.club_name,
          agent_name: foundData.agent_name,
          trainer_name: foundData.trainer_name,
          ...foundData
        };
        
        console.log('🔍 Final userData created:', {
          accountType: userData.accountType,
          academy_name: userData.academy_name,
          full_name: userData.full_name,
          name: userData.name
        });
        
        setUserData(userData);
        console.log('✅ User data refreshed successfully from role collection');
        return;
      }

      // إذا لم نجد بيانات في المجموعات الخاصة بالأدوار، ابحث في مجموعة users
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        setUserData(data);
        console.log('✅ User data refreshed successfully from users collection');
      } else {
        console.warn('No user data found in any collection');
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      setError('Failed to refresh user data');
    }
  };

  // Clear error function
  const clearError = () => setError(null);

  // Context value
  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    login,
    register,
    logout,
    signOut: logout, // Map logout to signOut for consistency
    updateUserData,
    resetPassword,
    changePassword,
    clearError,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && hasInitialized && user ? (
        <SimpleLoader 
          size="medium"
          color="blue"
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



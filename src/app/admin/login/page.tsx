'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  AlertCircle, 
  Loader2, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  Users,
  TrendingUp,
  Settings,
  LogIn,
  Info,
  AlertTriangle,
  BarChart3
} from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit, orderBy, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import EmailOTPVerification from '@/components/shared/EmailOTPVerification';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [securityInfo, setSecurityInfo] = useState<any>(null);
  const [systemStats, setSystemStats] = useState<any>(null);
  const [lastLogin, setLastLogin] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load system stats and security info
  useEffect(() => {
    loadSystemInfo();
    loadSecurityInfo();
  }, []);

  const loadSystemInfo = async () => {
    try {
      // Simulate loading system stats
      const stats = {
        totalUsers: 1250,
        activeToday: 85,
        systemLoad: 23,
        uptime: '99.9%'
      };
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
    }
  };

  const loadSecurityInfo = async () => {
    try {
      // Get device info
      const deviceInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ipAddress: 'Loading...' // Would normally get from IP service
      };
      
      setSecurityInfo(deviceInfo);
    } catch (error) {
      console.error('Error loading security info:', error);
    }
  };

  const logSecurityEvent = async (event: string, details: any = {}) => {
    try {
      // Create a more structured event document
      const eventData = {
        event,
        details: {
          ...details,
          userAgent: navigator.userAgent || 'Unknown',
          ipAddress: securityInfo?.ipAddress || 'Unknown',
          location: securityInfo?.timezone || 'Unknown'
        },
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      };

      // Generate a more reliable document ID
      const docId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Use collection reference instead of direct doc creation
      const securityLogsRef = collection(db, 'security_logs');
      await addDoc(securityLogsRef, eventData);
    } catch (error) {
      // Log error but don't block the login process
      console.error('Error logging security event:', error);
      // Continue execution without throwing
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Log login attempt
      await logSecurityEvent('login_attempt', { email, timestamp: new Date() });

      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user document
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error('User data not found in database');
      }

      const userData = userDoc.data();
      
      // Check admin permissions
              if (userData.accountType !== 'admin') {
        // Check admins collection as fallback
        const adminDocRef = doc(db, 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        
        if (!adminDoc.exists()) {
                      await logSecurityEvent('unauthorized_access_attempt', { 
              email, 
              userRole: userData.accountType,
              timestamp: new Date() 
            });
          throw new Error('You do not have admin permissions to access this panel');
        }
        
        const adminData = adminDoc.data();
        if (!adminData.isActive) {
          await logSecurityEvent('inactive_admin_login_attempt', { email, timestamp: new Date() });
          throw new Error('Your admin account is deactivated. Please contact administration');
        }
      }

      // Update last login info
      const loginData = {
        lastLogin: new Date(),
        lastLoginIP: securityInfo?.ipAddress || 'Unknown',
        lastLoginDevice: securityInfo?.userAgent || 'Unknown',
        lastLoginLocation: securityInfo?.timezone || 'Unknown',
        loginCount: (userData.loginCount || 0) + 1
      };

      await updateDoc(userDocRef, loginData);

      // Log successful login
      await logSecurityEvent('admin_login_success', { 
        email, 
        timestamp: new Date(),
        sessionInfo: loginData
      });

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('adminRememberMe', 'true');
        localStorage.setItem('adminEmail', email);
      } else {
        localStorage.removeItem('adminRememberMe');
        localStorage.removeItem('adminEmail');
      }

      setSuccess('Login successful! Redirecting to admin dashboard...');
      
      // Redirect with slight delay to show success message
      setTimeout(() => {
        router.push('/dashboard/admin');
      }, 1500);

    } catch (error: any) {
      console.error('Login error:', error);
      
      // Log failed login
      await logSecurityEvent('admin_login_failed', { 
        email, 
        error: error.message, 
        timestamp: new Date() 
      });
      
      let errorMessage = 'An error occurred during login';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email address not registered';
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on component mount
  useEffect(() => {
    const remembered = localStorage.getItem('adminRememberMe');
    const savedEmail = localStorage.getItem('adminEmail');
    
    if (remembered === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const getDeviceIcon = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mobile')) return <Smartphone className="w-4 h-4" />;
    if (ua.includes('tablet')) return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  // دالة التحقق من البريد الإلكتروني للأدمن
  const handleAdminEmailVerification = async (otp: string) => {
    // منطق التحقق من OTP للأدمن
    console.log('تم التحقق من OTP للأدمن:', otp);
    setShowEmailVerification(false);
    // متابعة عملية تسجيل الدخول
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Panel - System Info */}
        <div className="hidden lg:flex lg:w-1/3 flex-col justify-center p-8">
          <div className="space-y-6">
            {/* System Stats */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  System Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemStats && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-sm">Total Users</span>
                      </div>
                      <div className="text-xl font-bold text-blue-400">{systemStats.totalUsers}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-400" />
                        <span className="text-sm">Active Today</span>
                      </div>
                      <div className="text-xl font-bold text-green-400">{systemStats.activeToday}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">System Load</span>
                      </div>
                      <div className="text-xl font-bold text-yellow-400">{systemStats.systemLoad}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm">Uptime</span>
                      </div>
                      <div className="text-xl font-bold text-emerald-400">{systemStats.uptime}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {securityInfo && (
                  <>
                    <div className="flex items-center gap-2 text-sm">
                      {getDeviceIcon()}
                      <span>Device Type: {navigator.platform}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4" />
                      <span>Location: {securityInfo.timezone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>Current Time: {currentTime.toLocaleTimeString()}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Quick Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => router.push('/admin/login-advanced')}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Advanced Login
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-white hover:bg-white/10"
                  onClick={() => router.push('/')}
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Main Website
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-white/95 backdrop-blur-md shadow-2xl border-white/20">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin Control Panel
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  Secure administrative access portal
                </CardDescription>
              </div>
              
              {/* Status badges */}
              <div className="flex justify-center gap-2">
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  System Online
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                  <Shield className="w-3 h-3 mr-1" />
                  SSL Secured
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive" className="border-red-200">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription>{success}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@el7lm.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-20 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      dir="ltr"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1 h-8 w-8 p-0 hover:bg-gray-100"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-gray-300"
                  />
                  <Label 
                    htmlFor="remember" 
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me for future logins
                  </Label>
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-medium py-2.5 transition-all duration-200 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="ml-2 h-4 w-4" />
                      Sign In to Admin Panel
                    </>
                  )}
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                {/* Security Notice */}
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Security Notice</p>
                      <p className="text-xs mt-1">This is a restricted admin area. All login attempts are monitored and logged.</p>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="text-center text-sm text-gray-600 space-y-2">
                  <p>For regular users, please use the 
                    <a href="/auth/login" className="text-blue-600 hover:underline mx-1">
                      standard login page
                    </a>
                  </p>
                  <div className="flex justify-center space-x-4 space-x-reverse">
                    <a href="/admin/login-advanced" className="text-blue-600 hover:underline">
                      Advanced Login
                    </a>
                    <span className="text-gray-400">•</span>
                    <a href="/" className="text-blue-600 hover:underline">
                      Main Site
                    </a>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <EmailOTPVerification
        email="admin@el7lm.com"
        name="المشرف"
        isOpen={showEmailVerification}
        onVerificationSuccess={handleAdminEmailVerification}
        onVerificationFailed={(error) => console.error('خطأ في التحقق:', error)}
        onClose={() => setShowEmailVerification(false)}
        title="التحقق من هوية المشرف"
        subtitle="تم إرسال رمز التحقق إلى بريد المشرف"
        otpExpirySeconds={30} // 30 ثانية للأدمن
      />
    </div>
  );
} 

// نظام Logging آمن ومحسن
interface LogLevel {
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
  SECURITY: 'security';
  DEBUG: 'debug';
}

interface LogEntry {
  level: keyof LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  url?: string;
  stack?: string;
}

interface SystemInfo {
  userAgent: string;
  url: string;
  timestamp: string;
  localStorage: string[];
  sessionStorage: string[];
  cookiesEnabled: boolean;
  onlineStatus: boolean;
  screenResolution: string;
  timezone: string;
  language: string;
}

class SecureLogger {
  private isProduction: boolean;
  private sessionId: string;
  private maxLogHistory: number = 100;
  private logHistory: LogEntry[] = [];

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;
    
    // إزالة البيانات الحساسة
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth', 'credential',
      'apiKey', 'privateKey', 'accessToken', 'refreshToken',
      'socialSecurityNumber', 'ssn', 'creditCard', 'cvv',
      'bankAccount', 'routingNumber'
    ];

    const sanitize = (obj: unknown): unknown => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }

      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const lowerKey = key.toLowerCase();
        const isSensitive = sensitiveKeys.some(sensitiveKey => 
          lowerKey.includes(sensitiveKey)
        );

        if (isSensitive) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          sanitized[key] = sanitize(value);
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    };

    return sanitize(data);
  }

  private createLogEntry(
    level: keyof LogLevel, 
    message: string, 
    data?: unknown, 
    stack?: string
  ): LogEntry {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      data: this.sanitizeData(data)
    };

    // إضافة معلومات إضافية في المتصفح
    if (typeof window !== 'undefined') {
      entry.url = window.location.href;
      entry.userAgent = navigator.userAgent;
    }

    if (stack) {
      entry.stack = stack;
    }

    return entry;
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    
    // الحفاظ على الحد الأقصى للتاريخ
    if (this.logHistory.length > this.maxLogHistory) {
      this.logHistory = this.logHistory.slice(-this.maxLogHistory);
    }
  }

  private async sendToMonitoring(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      // إرسال إلى خدمة مراقبة خارجية
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      // فشل في الإرسال - لا بأس
    }
  }

  info(message: string, data?: unknown): void {
    const entry = this.createLogEntry('INFO', message, data);
    this.addToHistory(entry);
    
    if (!this.isProduction) {
      console.log(`ℹ️ [SECURE] ${message}`, data);
    }
    
    this.sendToMonitoring(entry);
  }

  warn(message: string, data?: unknown): void {
    const entry = this.createLogEntry('WARN', message, data);
    this.addToHistory(entry);
    
    if (!this.isProduction) {
      console.warn(`⚠️ [SECURE] ${message}`, data);
    }
    
    this.sendToMonitoring(entry);
  }

  error(message: string, error?: Error | unknown): void {
    const stack = error instanceof Error ? error.stack : undefined;
    const entry = this.createLogEntry('ERROR', message, error, stack);
    this.addToHistory(entry);
    
    if (!this.isProduction) {
      console.error(`❌ [SECURE] ${message}`, error);
    }
    
    this.sendToMonitoring(entry);
  }

  security(message: string, data?: unknown): void {
    const entry = this.createLogEntry('SECURITY', message, data);
    this.addToHistory(entry);
    
    if (!this.isProduction) {
      console.warn(`🔒 [SECURITY] ${message}`, data);
    }
    
    this.sendSecurityAlert(entry);
  }

  debug(message: string, data?: unknown): void {
    if (this.isProduction) return;
    
    const entry = this.createLogEntry('DEBUG', message, data);
    this.addToHistory(entry);
    console.debug(`🔍 [SECURE] ${message}`, data);
  }

  private async sendSecurityAlert(entry: LogEntry): Promise<void> {
    if (!this.isProduction) return;

    try {
      // إرسال تنبيه أمني
      await fetch('/api/security-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...entry,
          priority: 'high',
          requiresImmediate: true
        })
      });
    } catch (error) {
      // فشل في الإرسال - لا بأس
    }
  }

  getLogHistory(level?: keyof LogLevel): LogEntry[] {
    if (level) {
      return this.logHistory.filter(entry => entry.level === level);
    }
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logHistory, null, 2);
  }

  getSystemInfo(): SystemInfo {
    const info: SystemInfo = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage),
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language
    };
    return info;
  }
}

// إنشاء مثيل عام
export const secureLogger = new SecureLogger();

// دوال مساعدة
export const logInfo = (message: string, data?: unknown): void => 
  secureLogger.info(message, data);

export const logWarn = (message: string, data?: unknown): void => 
  secureLogger.warn(message, data);

export const logError = (message: string, error?: Error | unknown): void => 
  secureLogger.error(message, error);

export const logSecurity = (message: string, data?: unknown): void => 
  secureLogger.security(message, data);

export const logDebug = (message: string, data?: unknown): void => 
  secureLogger.debug(message, data);

export default secureLogger; 
